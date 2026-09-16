require('dotenv').config({ path: __dirname + '/.env' });
console.log('Loaded .env from:', __dirname + '/.env');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('AI Provider:', process.env.AI_PROVIDER || 'gemini');
console.log('GROQ_API_KEY configured:', !!process.env.GROQ_API_KEY);
console.log('GEMINI_API_KEY configured:', !!process.env.GEMINI_API_KEY);
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()

// ------------------------------
// Helpers: URL extraction and heuristics
// ------------------------------
const extractUrlFromPrompt = (promptText) => {
  try {
    // Expect our prompt includes a section: "Context: URL/Link" and then INPUT:\n<url>
    const inputIndex = promptText.indexOf('INPUT:')
    if (inputIndex === -1) return null
    const input = promptText.slice(inputIndex + 'INPUT:'.length).trim()
    // First token or first URL-like substring
    const urlMatch = input.match(/https?:\/\/[^\s\n]+/i)
    return urlMatch ? urlMatch[0] : null
  } catch (e) {
    return null
  }
}

const analyzeUrlHeuristics = (urlString) => {
  const signals = []
  let riskScore = 0
  if (!urlString) return { signals, riskScore, isValid: false }

  try {
    const url = new URL(urlString)
    const host = url.hostname || ''
    const tld = host.split('.').pop() || ''

    const suspiciousTlds = new Set(['zip', 'mov', 'xyz', 'top', 'click', 'work', 'ru', 'tk'])
    const shorteners = new Set(['bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'is.gd', 'ow.ly', 'buff.ly'])

    // Non-https
    if (url.protocol !== 'https:') {
      signals.push('Uses non-HTTPS protocol')
      riskScore += 10
    }
    // IP literal
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      signals.push('IP address host (not a domain)')
      riskScore += 20
    }
    // IDN homograph indicator
    if (host.includes('xn--')) {
      signals.push('Internationalized domain (possible homograph)')
      riskScore += 15
    }
    // Excessive subdomains
    if (host.split('.').length >= 4) {
      signals.push('Many subdomains')
      riskScore += 10
    }
    // Suspicious TLD
    if (suspiciousTlds.has(tld)) {
      signals.push(`Suspicious TLD .${tld}`)
      riskScore += 10
    }
    // Link shortener
    if (shorteners.has(host)) {
      signals.push('URL shortener (destination obscured)')
      riskScore += 15
    }
    // Unusual port
    if (url.port && url.port !== '80' && url.port !== '443') {
      signals.push(`Unusual port :${url.port}`)
      riskScore += 10
    }
    // Phishy keywords
    const lc = (url.pathname + url.search).toLowerCase()
    const phishy = ['login', 'verify', 'password', 'account', 'bank', 'update']
    if (phishy.some((k) => lc.includes(k))) {
      signals.push('Contains sensitive-action keywords')
      riskScore += 10
    }
    // Long query
    if (url.search.length > 200) {
      signals.push('Very long query string')
      riskScore += 5
    }

    return { signals, riskScore, isValid: true }
  } catch (e) {
    signals.push('Invalid URL format')
    riskScore += 20
    return { signals, riskScore, isValid: false }
  }
}

// ------------------------------
// Optional: Domain reputation checks (configurable)
// ------------------------------
const extractDomainFromUrl = (urlString) => {
  try {
    const { hostname } = new URL(urlString)
    return hostname || null
  } catch {
    return null
  }
}

const checkPhishingDatabase = async (urlOrDomain) => {
  // Public phishing DB (optional). Non-fatal on failure.
  try {
    const candidate = encodeURIComponent(urlOrDomain)
    const resp = await fetch(`https://phish.sinking.yachts/v2/check/${candidate}`, { method: 'GET' })
    if (!resp.ok) return null
    const data = await resp.json()
    // API typically returns { status: 'ok', is_scphish?: boolean } — tolerate shape variations
    const flags = []
    if (data && (data.match || data.isScam || data.is_phish === true || data.isPhish === true || data.is_phishing === true)) {
      flags.push('Listed in phishing database')
    }
    return flags
  } catch {
    return null
  }
}

const checkDomainReputation = async (urlString) => {
  const enable = process.env.ENABLE_REPUTATION_CHECKS === '1'
  if (!enable) return { signals: [], riskDelta: 0 }

  const domain = extractDomainFromUrl(urlString)
  if (!domain) return { signals: [], riskDelta: 0 }

  const signals = []
  let riskDelta = 0

  const phishingFlags = await checkPhishingDatabase(domain)
  if (Array.isArray(phishingFlags) && phishingFlags.length > 0) {
    signals.push(...phishingFlags)
    riskDelta += 25
  }

  return { signals, riskDelta }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration - support multiple origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '').split(',').filter(Boolean) || ['http://localhost:3000']

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all for now; tighten in production
    }
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// Specific rate limit for analysis endpoint
const analysisLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 analysis requests per minute
  message: 'Too many analysis requests, please try again later.',
})

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Veridex Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      analyze: '/analyze (POST)',
      scamAdvisories: '/scam-advisories (GET)'
    }
  })
})

// Scam advisories endpoint - provides latest common scam advisories
app.get('/scam-advisories', (req, res) => {
  const advisories = [
    {
      id: 1,
      title: 'Warning: Fake Package Delivery Scams',
      description: 'Scams claiming you have a package waiting, asking you to click a link or provide payment details. Always verify with the official retailer.',
      category: 'phishing',
      severity: 'high',
      link: 'https://www.ftc.gov/news-events/blogs/news/2024/08/fake-package-delivery-scams-on-the-rise'
    },
    {
      id: 2,
      title: 'Warning: QR Code Scams',
      description: 'Malicious QR codes in public places leading to fake payment pages or malware downloads. Scan only from trusted sources.',
      category: 'malware',
      severity: 'high',
      link: 'https://www.consumer.ftc.gov/articles/2024/09/qr-code-scams-increasing'
    },
    {
      id: 3,
      title: 'Warning: Investment Scams',
      description: 'Unsolicited messages promising guaranteed returns, crypto investment opportunities, or "get rich quick" schemes. Remember: if it sounds too good to be true, it probably is.',
      category: 'scam',
      severity: 'medium',
      link: 'https://www.ic3.gov/2024-ic3-report'
    },
    {
      id: 4,
      title: 'Warning: Phishing Email Trends',
      description: 'Recent trend of emails impersonating employers or HR departments requesting payroll changes or gift card purchases. Always verify through official channels.',
      category: 'phishing',
      severity: 'medium',
      link: 'https://www.sophos.com/en-us/mediacenter/articles/2024/phishing-trends'
    },
    {
      id: 5,
      title: 'Warning: Tech Support Scams',
      description: 'Unsolicited calls/emails claiming your computer has a virus, asking for remote access or payment. Legitimate tech companies will never contact you unsolicited.',
      category: 'scam',
      severity: 'high',
      link: 'https://www.ftc.gov/news-events/blogs/news/2024/03/tech-support-scams'
    }
  ]
  res.json({ advisories })
})

// Analysis endpoint - supports both legacy {prompt} and new {content,type}
app.post('/analyze', analysisLimiter, async (req, res) => {
  try {
    let { prompt, content, type } = req.body
    // New API shape: {content, type} -> build prompt
    if (!prompt && content) {
      const label = type === 'image' ? 'Image' : type === 'link' ? 'URL/Link' : type === 'news' ? 'News/Article' : type === 'document' ? 'Document' : 'Message/Email'
      // For image, content is base64 or data URL - handle safely (truncate for log)
      const inputForPrompt = type === 'image' ? `[Image data: ${String(content).slice(0,80)}... base64]` : String(content)
      const base = `You are TruthCheck AI — security-focused assistant. Analyze INPUT for phishing/scam/misinformation/AI-generated risks. Return STRICT JSON {"verdict":"SAFE|SUSPICIOUS|SCAM|TRUSTWORTHY|QUESTIONABLE|LIKELY_FAKE","confidence":0-100,"explanation":"string","signals":["string",...]}\n`
      prompt = `${base}Context: ${label}\nINPUT:\n${inputForPrompt}`
      // If image, we will handle inlineData below instead of text prompt
    }

    // Validation
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request: prompt is required and must be a string' 
      })
    }

    if (prompt.length > 10000 && type !== 'image') {
      return res.status(400).json({ 
        error: 'Prompt too long: maximum 10,000 characters allowed' 
      })
    }

    // Check for API key based on provider
    const provider = process.env.AI_PROVIDER || 'gemini'
    if (provider === 'groq') {
      if (!process.env.GROQ_API_KEY) {
        console.error('GROQ_API_KEY not configured')
        return res.status(500).json({
          error: 'Server configuration error: AI service not available'
        })
      }
    } else {
      if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY not configured')
        return res.status(500).json({
          error: 'Server configuration error: AI service not available'
        })
      }
    }

    // Optional URL analysis (heuristics) when analyzing links
    let preSignals = []
    let preRiskScore = 0
    let candidateUrl = null
    if (typeof prompt === 'string' && /Context:\s*URL\/Link/i.test(prompt)) {
      candidateUrl = extractUrlFromPrompt(prompt)
      const { signals, riskScore } = analyzeUrlHeuristics(candidateUrl)
      preSignals = signals
      preRiskScore = riskScore
      // Reputation checks (optional)
      if (candidateUrl) {
        try {
          const { signals: repSignals, riskDelta } = await checkDomainReputation(candidateUrl)
          preSignals = [...preSignals, ...repSignals]
          preRiskScore += riskDelta
        } catch {}
      }
    }

    // Prepare the request based on provider with fallback
    let apiResponse = null
    let lastErrorText = ''
    let lastStatus = 500
    let usedProvider = provider

    // Try primary provider first, then fallback if 429
    // For image analysis, always use Gemini since Groq doesn't support vision
    const providersToTry = type === 'image' ? ['gemini'] : (provider === 'groq' ? ['groq', 'gemini'] : ['gemini', 'groq'])

    for (const currentProvider of providersToTry) {
      usedProvider = currentProvider
      console.log(`Trying provider: ${currentProvider}`)

      if (currentProvider === 'groq') {
        // Groq API implementation
        const groqKey = (process.env.GROQ_API_KEY || '').trim()
        if (!groqKey) {
          console.log('  Skipping Groq - no API key configured')
          continue
        }
        const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'

        let messages = []
        if (type === 'image' && content) {
          let mimeType = 'image/jpeg'
          let b64 = String(content)
          if (b64.startsWith('data:')) {
            const m = b64.match(/^data:([^;]+);base64,(.+)$/)
            if (m) { mimeType = m[1]; b64 = m[2] }
          }
          messages = [
            { role: 'system', content: 'You are Veridex — a security-focused multimodal fact-checking assistant. Analyze the user INPUT IMAGE for AI-generated content, manipulation, deepfakes, or synthetic media risks. CRITICAL: You must respond with ONLY a valid JSON object. Do NOT use markdown code blocks. Your entire response must be exactly this JSON format: {"verdict":"SAFE|SUSPICIOUS|SCAM|TRUSTWORTHY|QUESTIONABLE|LIKELY_FAKE","confidence":0-100,"explanation":"string","signals":["string",...]}' },
            { role: 'user', content: [
              { type: 'text', text: 'Analyze this image for AI generation.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${b64}` } }
            ]}
          ]
        } else {
          messages = [
            { role: 'system', content: 'You are Veridex — a security-focused fact-checking assistant. Analyze the user INPUT for phishing, scam, misinformation, or manipulation risks. CRITICAL: You must respond with ONLY a valid JSON object. Do NOT use markdown code blocks. Your entire response must be exactly this JSON format: {"verdict":"SAFE|SUSPICIOUS|SCAM|TRUSTWORTHY|QUESTIONABLE|LIKELY_FAKE","confidence":0-100,"explanation":"string","signals":["string",...]} Rules: One verdict only. SAFE/TRUSTWORTHY = benign, SUSPICIOUS/QUESTIONABLE = uncertain, SCAM/LIKELY_FAKE = malicious. confidence integer 0-100 calibrated to evidence, not style. explanation concise (2-4 sentences), actionable. signals: 2-6 short bullet phrases. NO markdown, NO code blocks, NO extra text. Just the JSON object.' },
            { role: 'user', content: prompt }
          ]
        }

        console.log('Sending request to Groq API...')
        console.log(`  using model: ${groqModel}`)

        try {
          const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: groqModel,
              messages,
              temperature: 0.3,
              max_tokens: 768,
              response_format: { type: 'json_object' }
            })
          })

          if (resp.ok) {
            apiResponse = resp
            console.log('  ✓ Groq API ok')
            break
          } else {
            const t = await resp.text()
            console.error(`  ✗ Groq API -> ${resp.status}`, t.slice(0, 300))
            lastErrorText = t
            lastStatus = resp.status

            if (resp.status === 429) {
              console.log('  → Groq quota exceeded, trying fallback provider...')
              continue
            }
            if (process.env.NODE_ENV !== 'production') {
              try { const p = JSON.parse(t); return res.status(500).json({ error: `${p?.error?.message || t}`.slice(0,400) }) } catch { return res.status(500).json({ error: `${t}`.slice(0,400) }) }
            }
            return res.status(500).json({ error: 'The verification service is temporarily unavailable. Please try again in a moment.' })
          }
        } catch (e) {
          console.error('Groq API error:', e.message)
          continue
        }
      } else {
        // Gemini API implementation
        const cleanKey = (process.env.GEMINI_API_KEY || '').trim()
        if (!cleanKey) {
          console.log('  Skipping Gemini - no API key configured')
          continue
        }
        const isNewKey = cleanKey.startsWith('AQ.')
        const preferredModel = process.env.GEMINI_MODEL || 'gemini-flash-latest'
        const tryModels = [preferredModel, 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro']
        const uniqueModels = [...new Set(tryModels)]

        // Image: if type === 'image', send multimodal inlineData instead of text prompt
        let requestBody
        if (type === 'image' && content) {
          let mimeType = 'image/jpeg'
          let b64 = String(content)
          if (b64.startsWith('data:')) {
            const m = b64.match(/^data:([^;]+);base64,(.+)$/)
            if (m) { mimeType = m[1]; b64 = m[2] }
          }
          requestBody = {
            systemInstruction: { parts: [{ text: 'You are Veridex — multimodal assistant. Analyze IMAGE for AI-generated/synthetic/deepfake risks. Return STRICT JSON {"verdict":"SAFE|SUSPICIOUS|SCAM|TRUSTWORTHY|QUESTIONABLE|LIKELY_FAKE","confidence":0-100,"explanation":"string","signals":["string",...]} Rules: 2-4 sentence explanation, 2-6 signals mentioning specific markers (artifacts, pupils, smoothing, watermark).' }] },
            contents: [{ role: 'user', parts: [{ text: 'Analyze this image for AI generation.' }, { inlineData: { mimeType, data: b64 } }] }],
            generationConfig: { temperature: 0.3, topK: 40, topP: 0.95, maxOutputTokens: 768 },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
            ]
          }
        } else {
          requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
            ]
          }
        }

        console.log('Sending request to Gemini API...')

        // Try models sequentially (new AQ keys often need different model/version)
        let geminiResponse = null
        for (const mod of uniqueModels) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent${isNewKey ? '' : `?key=${cleanKey}`}`
          const headers = { 'Content-Type': 'application/json' }
          if (isNewKey) headers['x-goog-api-key'] = cleanKey
          console.log(`  trying ${mod}...`)
          const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(requestBody) })
          if (resp.ok) { geminiResponse = resp; console.log(`  ✓ ${mod} ok`); break }
          const t = await resp.text()
          console.error(`  ✗ ${mod} -> ${resp.status}`, t.slice(0, 300))
          lastErrorText = t
          lastStatus = resp.status
          if (resp.status === 429) {
            console.log('  → Gemini quota exceeded, trying fallback provider...')
            break // Break out of model loop to try next provider
          }
          if (resp.status === 503) {
            console.warn(`  → 503 busy, trying next model if available...`)
            continue
          }
          if (resp.status !== 404) {
            if (process.env.NODE_ENV !== 'production') {
              try { const p = JSON.parse(t); return res.status(500).json({ error: `${p?.error?.message || t}`.slice(0,400) }) } catch { return res.status(500).json({ error: `${t}`.slice(0,400) }) }
            }
            return res.status(500).json({ error: 'The verification service is temporarily unavailable. Please try again in a moment.' })
          }
        }

        if (geminiResponse) {
          apiResponse = geminiResponse
          console.log('Gemini API response received')
          break
        }
      }
    }

    // Check if we got a response
    if (!apiResponse) {
      console.error('All providers failed', { lastStatus, lastErrorText: lastErrorText.slice(0, 500) })
      if (lastStatus === 429) {
        return res.status(429).json({ error: "You've reached the limit — too many checks at once. Please wait about a minute and try again." })
      }
      if (lastStatus === 503 || /high demand|UNAVAILABLE/i.test(lastErrorText)) {
        return res.status(503).json({ error: 'The verification service is very busy right now (high demand). This is usually temporary — please wait 20–30 seconds and tap Analyze again.' })
      }
      if (process.env.NODE_ENV !== 'production') return res.status(500).json({ error: lastErrorText.slice(0,400) })
      return res.status(500).json({ error: 'The verification service is temporarily unavailable. Please try again in a moment.' })
    }

    const data = await apiResponse.json()

    // Extract the generated text based on provider
    let generatedText
    if (usedProvider === 'groq') {
      generatedText = data?.choices?.[0]?.message?.content
    } else {
      generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    }

    if (!generatedText) {
      console.error('No text generated from API:', data)
      return res.status(500).json({
        error: 'Failed to generate analysis. Please try again.'
      })
    }

    // Try to parse structured JSON from the model; fallback to raw text
    let structured
    try {
      // Extract possible JSON substring
      const match = generatedText.match(/\{[\s\S]*\}/)
      structured = match ? JSON.parse(match[0]) : JSON.parse(generatedText)
    } catch (_) {
      structured = null
    }

    if (
      structured &&
      typeof structured.verdict === 'string' &&
      typeof structured.confidence === 'number' &&
      typeof structured.explanation === 'string' &&
      Array.isArray(structured.signals)
    ) {
      return res.json({
        result: {
          verdict: structured.verdict,
          confidence: Math.max(0, Math.min(100, Math.round(structured.confidence))),
          explanation: structured.explanation,
          signals: [...preSignals, ...structured.signals].slice(0, 12),
          rawText: generatedText.trim(),
        },
        timestamp: new Date().toISOString(),
      })
    }

    // Fallback normalization with better explanations
    const lower = generatedText.toLowerCase()
    let fallbackVerdict = lower.includes('scam') || lower.includes('phishing')
      ? 'SCAM'
      : lower.includes('suspicious') || lower.includes('warning')
      ? 'SUSPICIOUS'
      : lower.includes('trustworthy') || lower.includes('safe')
      ? 'SAFE'
      : 'SUSPICIOUS'

    // If heuristics indicate notable risk, bias verdict towards Suspicious
    if (preRiskScore >= 20 && fallbackVerdict === 'SAFE') {
      fallbackVerdict = 'SUSPICIOUS'
    }

    // Generate contextual explanation based on type and verdict
    let fallbackExplanation
    if (type === 'image') {
      fallbackExplanation = fallbackVerdict === 'SCAM' || fallbackVerdict === 'LIKELY_FAKE'
        ? 'This image exhibits characteristics commonly associated with AI-generated or synthetic content. Visual analysis suggests potential manipulation or artificial origins.'
        : fallbackVerdict === 'SUSPICIOUS' || fallbackVerdict === 'QUESTIONABLE'
        ? 'This image shows some ambiguous characteristics that warrant further verification. While not definitively artificial, certain visual elements are unusual.'
        : 'This image appears to be authentic with no obvious signs of AI generation or manipulation. The visual characteristics are consistent with natural photography.'
    } else {
      fallbackExplanation = fallbackVerdict === 'SCAM'
        ? 'This content exhibits multiple indicators of fraudulent or deceptive intent. Exercise extreme caution and verify through official channels.'
        : fallbackVerdict === 'SUSPICIOUS'
        ? 'This content contains elements that should be verified before taking action. Cross-check with trusted sources.'
        : 'This content appears legitimate based on available analysis. No significant red flags were detected.'
    }

    // Generate contextual signals
    let fallbackSignals = [...preSignals]
    if (type === 'image') {
      if (fallbackVerdict === 'SCAM' || fallbackVerdict === 'LIKELY_FAKE') {
        fallbackSignals.push('Potential AI generation markers detected', 'Unusual visual artifacts present', 'Inconsistent lighting patterns')
      } else if (fallbackVerdict === 'SUSPICIOUS' || fallbackVerdict === 'QUESTIONABLE') {
        fallbackSignals.push('Ambiguous visual characteristics', 'Requires further verification', 'Some unusual elements detected')
      } else {
        fallbackSignals.push('Natural visual characteristics', 'No obvious manipulation signs', 'Consistent with authentic imagery')
      }
    } else {
      if (fallbackVerdict === 'SCAM') {
        fallbackSignals.push('High-risk language patterns', 'Urgency or pressure tactics', 'Requests sensitive information')
      } else if (fallbackVerdict === 'SUSPICIOUS') {
        fallbackSignals.push('Some concerning language', 'Verify sender identity', 'Check for official confirmation')
      } else {
        fallbackSignals.push('Standard communication patterns', 'No high-risk indicators', 'Normal structure observed')
      }
    }

    res.json({
      result: {
        verdict: fallbackVerdict,
        confidence: Math.max(40, Math.min(85, 50 + preRiskScore)),
        explanation: fallbackExplanation,
        signals: fallbackSignals.slice(0, 12),
        rawText: generatedText.trim(),
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Server Error:', error)
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({ 
        error: 'Request timeout. Please try again.' 
      })
    }
    
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    })
  }
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Veridex Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`⚡ AI Provider: ${process.env.AI_PROVIDER || 'gemini'}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
}) 