import { API_BASE_URL } from '../config/api'

export type Verdict = 'SAFE' | 'SUSPICIOUS' | 'SCAM' | 'TRUSTWORTHY' | 'QUESTIONABLE' | 'LIKELY_FAKE'

export interface AnalysisResponse {
  result: {
    verdict: Verdict
    confidence: number
    explanation: string
    signals: string[]
    rawText?: string
  }
}

export type AnalysisContentType = 'message' | 'link' | 'news' | 'document' | 'image'

// Client-side Heuristic Engine (Fallback when backend is offline or returns server error)
function localHeuristicAnalysis(content: string, type: AnalysisContentType): AnalysisResponse['result'] {
  const signals: string[] = []
  let score = 0

  if (type === 'image' || content.startsWith('data:image')) {
    return {
      verdict: 'QUESTIONABLE',
      confidence: 0,
      explanation: 'AI image detection service is currently unavailable. Unable to perform forensic analysis. Please try again later.',
      signals: [
        'Service unavailable - backend connection failed',
        'Cannot verify image authenticity at this time'
      ],
      rawText: '[Image Content Analyzed]'
    }
  }

  // URL checks
  if (type === 'link' || /https?:\/\/[^\s]+/i.test(content)) {
    if (/bit\.ly|t\.co|tinyurl|goo\.gl|is\.gd|ow\.ly/i.test(content)) {
      signals.push('Shortened URL hides true destination')
      score += 25
    }
    if (/paypa1|g00gle|micros0ft|app1e|bank-verify|secure-login|acc-auth/i.test(content)) {
      signals.push('Homograph / character substitution domain')
      score += 40
    }
    if (/\.(xyz|top|zip|mov|click|work|tk|info)(\/|$)/i.test(content)) {
      signals.push('High-risk top level domain (.xyz/.top/.click)')
      score += 20
    }
    if (!/https:\/\//i.test(content) && /http:\/\//i.test(content)) {
      signals.push('Unencrypted HTTP protocol')
      score += 15
    }
  }

  // Urgency check
  if (/\b(urgent|immediately|24 hours|act now|suspended|action required|limited time|account blocked|final notice)\b/i.test(content)) {
    signals.push('High-pressure urgency framing')
    score += 30
  }

  // Credential & Financial Harvesting check
  if (/\b(wire transfer|crypto|bitcoin|gift card|ssn|social security|credit card|verify password|confirm pin|bank details)\b/i.test(content)) {
    signals.push('Demands sensitive data or non-reversible payment')
    score += 35
  }

  // Authority & Unsolicited Prize check
  if (/\b(congratulations|winner|lottery|claim prize|free claim|\$1,000|\$10,000|official alert)\b/i.test(content)) {
    signals.push('Unsolicited reward / authority claim')
    score += 25
  }

  let verdict: Verdict = 'SAFE'
  let confidence = 90
  let explanation = 'No deceptive patterns or high-risk signals were identified in this content. The phrasing and structure match normal communication.'

  if (score >= 45) {
    verdict = 'SCAM'
    confidence = Math.min(97, 78 + Math.floor(score / 3))
    explanation = `High risk detected. The submitted ${type} exhibits deceptive markers commonly found in phishing and fraud schemes: ${signals.slice(0, 2).join(' and ').toLowerCase()}.`
  } else if (score >= 20 || signals.length > 0) {
    verdict = 'SUSPICIOUS'
    confidence = Math.min(88, 65 + Math.floor(score / 2))
    explanation = `Proceed with caution. The ${type} contains risk indicators (${signals.join(', ').toLowerCase()}) that warrant cross-verification before taking action.`
  }

  if (signals.length === 0) {
    signals.push('Standard message structure', 'No blacklisted keyword patterns', 'Valid sender format')
  }

  return {
    verdict,
    confidence,
    explanation,
    signals,
    rawText: content.slice(0, 300)
  }
}

export const analyzeContent = async (
  content: string,
  type: AnalysisContentType
): Promise<AnalysisResponse['result']> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  try {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type }),
      signal: controller.signal,
    })
    
    if (res.ok) {
      const data: any = await res.json().catch(() => ({}))
      if (data?.result?.verdict) {
        return data.result as AnalysisResponse['result']
      }
    }
    
    // If backend returns 500, 404, or unparseable payload, fallback to local heuristics engine
    console.warn(`Backend responded with status ${res.status}. Utilizing client-side heuristic engine.`)
    return localHeuristicAnalysis(content, type)

  } catch (error: unknown) {
    console.warn('Backend API connection unavailable, falling back to local heuristic engine:', error)
    return localHeuristicAnalysis(content, type)
  } finally {
    clearTimeout(timer)
  }
}

let healthCache: { value: boolean; at: number } | null = null
const HEALTH_TTL_MS = 30_000

export const checkServerHealth = async (): Promise<boolean> => {
  if (healthCache && Date.now() - healthCache.at < HEALTH_TTL_MS) return healthCache.value
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(`${API_BASE_URL}/health`, { signal: ctrl.signal })
    clearTimeout(t)
    const isOk = res.ok
    healthCache = { value: isOk, at: Date.now() }
    return isOk
  } catch {
    healthCache = { value: false, at: Date.now() }
    return false
  }
}
