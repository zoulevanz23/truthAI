"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGemini = callGemini;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const SYSTEM_INSTRUCTION = `You are TruthCheck AI — a security-focused fact-checking assistant.
Analyze the user INPUT for phishing, scam, misinformation, or manipulation risks.
Return STRICT JSON only with schema:
{"verdict":"SAFE|SUSPICIOUS|SCAM|TRUSTWORTHY|QUESTIONABLE|LIKELY_FAKE","confidence":0-100,"explanation":"string","signals":["string",...]}
Rules:
- One verdict only. SAFE/TRUSTWORTHY = benign, SUSPICIOUS/QUESTIONABLE = uncertain, SCAM/LIKELY_FAKE = malicious.
- confidence integer 0-100 calibrated to evidence, not style.
- explanation concise (2-4 sentences), actionable.
- signals: 2-6 short bullet phrases.
- Never include markdown, preamble, or extra keys.`;
// simple in-memory LRU cache (no Redis required)
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6h
function cacheKey(model, content, contentType) { return `${model}::${contentType}::${hash(content)}`; }
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++)
    h = Math.imul(31, h) + s.charCodeAt(i) | 0; return String(h); }
function getCache(k) { const e = cache.get(k); if (!e)
    return null; if (Date.now() > e.exp) {
    cache.delete(k);
    return null;
} return e.v; }
function setCache(k, v) {
    if (cache.size > 500) {
        const first = cache.keys().next().value;
        if (first)
            cache.delete(first);
    }
    cache.set(k, { v, exp: Date.now() + CACHE_TTL_MS });
}
async function callGemini(content, contentType) {
    const key = (env_1.env.GEMINI_API_KEY || '').trim();
    if (!key || key === 'placeholder-missing-key') {
        const err = new Error('AI service not configured');
        err.status = 503;
        throw err;
    }
    const isNewKey = key.startsWith('AQ.');
    const preferred = env_1.env.GEMINI_MODEL;
    const tryModels = [...new Set([preferred, 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-flash-lite-latest'])];
    const ck = cacheKey(preferred, content, contentType);
    const cached = getCache(ck);
    if (cached) {
        logger_1.logger.info('gemini cache hit');
        return cached;
    }
    const contextLabel = contentType === 'link' ? 'URL/Link' : contentType === 'news' ? 'News/Article' : contentType === 'document' ? 'Document' : 'Message/Email';
    let lastError = '';
    let lastStatus = 500;
    for (const mod of tryModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent${isNewKey ? '' : `?key=${key}`}`;
        const headers = { 'Content-Type': 'application/json' };
        if (isNewKey)
            headers['x-goog-api-key'] = key;
        const body = JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [{ role: 'user', parts: [{ text: `Context: ${contextLabel}\nINPUT:\n${content}` }] }],
            generationConfig: { temperature: 0.3, topK: 40, topP: 0.95, maxOutputTokens: 768 },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ],
        });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
            logger_1.logger.info({ model: mod }, 'gemini try');
            const resp = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });
            clearTimeout(timeout);
            if (resp.ok) {
                const data = await resp.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text)
                    throw new Error('Empty generation');
                const parsed = parseStructured(text);
                if (parsed) {
                    setCache(ck, parsed);
                    logger_1.logger.info({ model: mod }, 'gemini ok');
                    return parsed;
                }
                // fallback from unstructured
                return fallbackFromText(text);
            }
            const t = await resp.text();
            lastError = t.slice(0, 800);
            lastStatus = resp.status;
            logger_1.logger.warn({ model: mod, status: resp.status }, lastError.slice(0, 120));
            if (resp.status === 429) {
                const e = new Error('Rate limited');
                e.status = 429;
                throw e;
            }
            if (resp.status !== 404 && resp.status !== 503) {
                const e = new Error(env_1.env.NODE_ENV !== 'production' ? lastError.slice(0, 400) : 'Verification service temporarily unavailable');
                e.status = 500;
                throw e;
            }
            // 404/503 -> try next model
        }
        catch (e) {
            clearTimeout(timeout);
            if (e.status === 429)
                throw e;
            if (e.name === 'AbortError') {
                lastError = 'Timeout';
                lastStatus = 504;
                continue;
            }
            if (e.status)
                throw e;
            lastError = e.message || String(e);
            // network error -> try next
        }
    }
    // all models failed
    logger_1.logger.error({ lastStatus, lastError: lastError.slice(0, 300) }, 'all gemini models failed');
    // help: list models in dev
    if (env_1.env.NODE_ENV !== 'production') {
        try {
            const listUrl = `https://generativelanguage.googleapis.com/v1beta/models${isNewKey ? '' : `?key=${key}`}`;
            const h = isNewKey ? { 'x-goog-api-key': key } : {};
            const lst = await fetch(listUrl, { headers: h, signal: AbortSignal.timeout(5000) });
            const txt = await lst.text();
            logger_1.logger.info({ list: txt.slice(0, 600) }, 'ListModels');
        }
        catch { }
    }
    if (lastStatus === 503 || /high demand|UNAVAILABLE/i.test(lastError)) {
        const e = new Error('The verification service is very busy right now (high demand). Please wait 20–30 seconds and try again.');
        e.status = 503;
        throw e;
    }
    const e = new Error(env_1.env.NODE_ENV !== 'production' ? lastError.slice(0, 400) : 'The verification service is temporarily unavailable. Please try again in a moment.');
    e.status = lastStatus === 404 ? 500 : lastStatus;
    throw e;
}
function parseStructured(text) {
    try {
        const m = text.match(/\{[\s\S]*\}/);
        const obj = m ? JSON.parse(m[0]) : JSON.parse(text);
        if (typeof obj.verdict === 'string' && typeof obj.confidence === 'number' && typeof obj.explanation === 'string' && Array.isArray(obj.signals)) {
            const allowed = ['SAFE', 'SUSPICIOUS', 'SCAM', 'TRUSTWORTHY', 'QUESTIONABLE', 'LIKELY_FAKE'];
            const v = String(obj.verdict).toUpperCase();
            if (!allowed.includes(v))
                return null;
            return {
                verdict: v,
                confidence: Math.max(0, Math.min(100, Math.round(obj.confidence))),
                explanation: String(obj.explanation).slice(0, 800),
                signals: obj.signals.map(String).slice(0, 8),
                rawText: text.trim().slice(0, 4000),
            };
        }
    }
    catch { }
    return null;
}
function fallbackFromText(text) {
    const lower = text.toLowerCase();
    let verdict = 'SUSPICIOUS';
    if (lower.includes('scam') || lower.includes('phishing'))
        verdict = 'SCAM';
    else if (lower.includes('suspicious') || lower.includes('warning'))
        verdict = 'SUSPICIOUS';
    else if (lower.includes('trustworthy') || lower.includes('safe'))
        verdict = 'SAFE';
    return { verdict, confidence: 55, explanation: text.slice(0, 500), signals: ['Keyword-based assessment'], rawText: text.trim().slice(0, 4000) };
}
//# sourceMappingURL=gemini.service.js.map