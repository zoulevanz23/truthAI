import { env } from '../config/env';
import { logger } from '../utils/logger';

export type Verdict = 'SAFE' | 'SUSPICIOUS' | 'SCAM' | 'TRUSTWORTHY' | 'QUESTIONABLE' | 'LIKELY_FAKE';

export interface StructuredResult {
  verdict: Verdict;
  confidence: number;
  explanation: string;
  signals: string[];
  rawText?: string;
}

// Extended system instruction supports both text and image analysis
const SYSTEM_INSTRUCTION_TEXT = `You are TruthCheck AI — a security-focused fact-checking assistant.
Analyze the user INPUT for phishing, scam, misinformation, or manipulation risks.
Return STRICT JSON only with schema:
{"verdict":"SAFE|SUSPICIOUS|SCAM|TRUSTWORTHY|QUESTIONABLE|LIKELY_FAKE","confidence":0-100,"explanation":"string","signals":["string",...]}
Rules:
- One verdict only. SAFE/TRUSTWORTHY = benign, SUSPICIOUS/QUESTIONABLE = uncertain, SCAM/LIKELY_FAKE = malicious.
- confidence integer 0-100 calibrated to evidence, not style.
- explanation concise (2-4 sentences), actionable.
- signals: 2-6 short bullet phrases.
- Never include markdown, preamble, or extra keys.`;

const SYSTEM_INSTRUCTION_IMAGE = `You are TruthCheck AI — a security-focused multimodal fact-checking assistant.
Analyze the user INPUT IMAGE for AI-generated content, manipulation, deepfakes, or synthetic media risks.
Return STRICT JSON only with schema:
{"verdict":"SAFE|SUSPICIOUS|SCAM|TRUSTWORTHY|QUESTIONABLE|LIKELY_FAKE","confidence":0-100,"explanation":"string","signals":["string",...]}
Rules:
- One verdict only. SAFE/TRUSTWORTHY = appears real/human-made, SUSPICIOUS/QUESTIONABLE = uncertain if AI-generated, SCAM/LIKELY_FAKE = likely AI-generated/synthetic.
- confidence integer 0-100 calibrated to evidence of AI generation markers.
- explanation concise (2-4 sentences), actionable. Mention specific AI generation markers if detected (e.g., artifacts, inconsistent lighting, strange textures, watermark patterns).
- signals: 2-6 short bullet phrases. Reference specific visual markers (e.g., "uncanny eyes", "inconsistent pupils", "watermark artifacts", "smoothing patterns").
- Never include markdown, preamble, or extra keys.
- If the image is clearly NOT AI-generated, favor SAFE or TRUSTWORTHY.
- If the image may be AI-generated but context is ambiguous, favor SUSPICIOUS or QUESTIONABLE.
- Always provide at least one signal pointing to why the verdict was reached.`;

function hash(s: string) { let h = 0; for (let i=0;i<s.length;i++) h = Math.imul(31,h)+s.charCodeAt(i)|0; return String(h); }
function cacheKey(model: string, content: string, contentType: string) { return `${model}::${contentType}::${hash(content)}`; }

const cache = new Map<string, { v: StructuredResult; exp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6h

function getCache(k: string) { const e = cache.get(k); if (!e) return null; if (Date.now()>e.exp) {cache.delete(k); return null;} return e.v; }
function setCache(k: string, v: StructuredResult) {
  if (cache.size > 500) { const first = cache.keys().next().value; if(first) cache.delete(first); }
  cache.set(k, { v, exp: Date.now()+CACHE_TTL_MS });
}

// Map content type to system instruction
function getSystemInstruction(contentType: string) {
  if (contentType === 'image') return SYSTEM_INSTRUCTION_IMAGE;
  return SYSTEM_INSTRUCTION_TEXT;
}

// parse structured JSON from Gemini response
function parseStructured(text: string): StructuredResult | null {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    const obj = m ? JSON.parse(m[0]) : JSON.parse(text);
    if (typeof obj.verdict === 'string' && typeof obj.confidence === 'number' && typeof obj.explanation === 'string' && Array.isArray(obj.signals)) {
      const allowed: Verdict[] = ['SAFE','SUSPICIOUS','SCAM','TRUSTWORTHY','QUESTIONABLE','LIKELY_FAKE'];
      const v = String(obj.verdict).toUpperCase() as Verdict;
      if (!allowed.includes(v)) return null;
      return {
        verdict: v,
        confidence: Math.max(0, Math.min(100, Math.round(obj.confidence))),
        explanation: String(obj.explanation).slice(0, 800),
        signals: (obj.signals as string[]).map(String).slice(0, 8),
        rawText: text.trim().slice(0, 4000),
      };
    }
  } catch {}
  return null;
}

function fallbackFromText(text: string): StructuredResult {
  const lower = text.toLowerCase();
  let verdict: Verdict = 'SUSPICIOUS';
  if (lower.includes('scam') || lower.includes('phishing')) verdict='SCAM';
  else if (lower.includes('suspicious') || lower.includes('warning')) verdict='SUSPICIOUS';
  else if (lower.includes('trustworthy') || lower.includes('safe')) verdict='SAFE';
  return { verdict, confidence: 55, explanation: text.slice(0,500), signals: ['Keyword-based assessment'], rawText: text.trim().slice(0,4000) };
}

export async function callGemini(content: string, contentType: 'message'|'link'|'news'|'document'|'image'): Promise<StructuredResult> {
  const key = (env.GEMINI_API_KEY || '').trim();
  if (!key || key === 'placeholder-missing-key') {
    const err: any = new Error('AI service not configured');
    err.status = 503;
    throw err;
  }
  const isNewKey = key.startsWith('AQ.');
  const preferred = env.GEMINI_MODEL;
  const tryModels = [...new Set([preferred, 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-flash-lite-latest'])];

  const ck = cacheKey(preferred, content, contentType);
  const cached = getCache(ck);
  if (cached) { logger.info('gemini cache hit'); return cached; }

  const contextLabel = contentType === 'image' ? 'Image' : contentType === 'link' ? 'URL/Link' : contentType === 'news' ? 'News/Article' : contentType === 'document' ? 'Document' : 'Message/Email';

  let lastError = '';
  let lastStatus = 500;

  for (const mod of tryModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent${isNewKey ? '' : `?key=${key}`}`;
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (isNewKey) headers['x-goog-api-key'] = key;

    // For image type, content needs to be a data URL or the model expects image parts
    // Gemini v1beta supports image URLs and inline data
    let body;
    if (contentType === 'image') {
      // content is expected to be a data URL: data:<mime_type>;base64,<base64_data>
      // or a public URL. We'll support data URLs from the frontend.
      body = JSON.stringify({
        systemInstruction: { parts: [{ text: getSystemInstruction(contentType) }] },
        contents: [{ role: 'user', parts: [{ text: '', inlineData: { mimeType: 'image/jpeg', data: content } }] }],
        generationConfig: { temperature: 0.3, topK: 40, topP: 0.95, maxOutputTokens: 768 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      });
    } else {
      const bodyTemp = JSON.stringify({
        systemInstruction: { parts: [{ text: getSystemInstruction(contentType) }] },
        contents: [{ role: 'user', parts: [{ text: `Context: ${contextLabel}\nINPUT:\n${content}` }] }],
        generationConfig: { temperature: 0.3, topK: 40, topP: 0.95, maxOutputTokens: 768 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      });
      body = bodyTemp;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      logger.info({ model: mod, contentType }, 'gemini try');
      const resp = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });
      clearTimeout(timeout);
      if (resp.ok) {
        const data: any = await resp.json();
        const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty generation');
        const parsed = parseStructured(text);
        if (parsed) { setCache(ck, parsed); logger.info({ model: mod }, 'gemini ok'); return parsed; }
        // fallback from unstructured
        return fallbackFromText(text);
      }
      const t = await resp.text();
      lastError = t.slice(0, 800);
      lastStatus = resp.status;
      logger.warn({ model: mod, status: resp.status }, lastError.slice(0,120));
      if (resp.status === 429) { const e:any = new Error('Rate limited'); e.status=429; throw e; }
      if (resp.status !== 404 && resp.status !== 503) {
        const e:any = new Error(env.NODE_ENV !== 'production' ? lastError.slice(0,400) : 'Verification service temporarily unavailable');
        e.status = 500; throw e;
      }
      // 404/503 -> try next model
    } catch (e: any) {
      clearTimeout(timeout);
      if (e.status === 429) throw e;
      if (e.name === 'AbortError') { lastError='Timeout'; lastStatus=504; continue; }
      if (e.status) throw e;
      lastError = e.message || String(e);
      // network error -> try next
    }
  }

  // all models failed
  logger.error({ lastStatus, lastError: lastError.slice(0,300) }, 'all gemini models failed');
  // help: list models in dev
  if (env.NODE_ENV !== 'production') {
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models${isNewKey ? '' : `?key=${key}`}`;
      const h: any = isNewKey ? { 'x-goog-api-key': key } : {};
      const lst = await fetch(listUrl, { headers: h, signal: AbortSignal.timeout(5000) });
      const txt = await lst.text();
      logger.info({ list: txt.slice(0,600) }, 'ListModels');
    } catch {}
  }
  if (lastStatus === 503 || /high demand|UNAVAILABLE/i.test(lastError)) {
    const e:any = new Error('The verification service is very busy right now (high demand). Please wait 20–30 seconds and try again.');
    e.status=503; throw e;
  }
  const e:any = new Error(env.NODE_ENV !== 'production' ? lastError.slice(0,400) : 'The verification service is temporarily unavailable. Please try again in a moment.');
  e.status = lastStatus === 404 ? 500 : lastStatus;
  throw e;
}

export async function callGeminiFromBase64(base64Data: string, mimeType: 'image/jpeg'|'image/png'|'image/gif'|'image/webp' = 'image/jpeg'): Promise<StructuredResult> {
  // Convenience: call with base64 image data and default mime type
  return callGemini(base64Data, 'image');
}

// For backwards compatibility - export the old function signature
export { callGemini, parseStructured, fallbackFromText, Verdict, StructuredResult };