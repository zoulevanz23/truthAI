import axios from 'axios'
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

// Generate structured prompt
const generatePrompt = (content: string, type: 'message' | 'link' | 'news'): string => {
  const base = `You are an AI security assistant. Analyze the INPUT for risks.
Return STRICT JSON with this exact schema and no extra text:
{"verdict":"SAFE|SUSPICIOUS|SCAM|TRUSTWORTHY|QUESTIONABLE|LIKELY_FAKE","confidence":0-100,"explanation":"string","signals":["string",...],"rawText":"string"}

Guidelines:
- Provide concise, actionable explanation.
- Pick a single most appropriate verdict.
- confidence is an integer 0-100.
- signals are short bullet phrases.
`

  switch (type) {
    case 'message':
      return `${base}
Context: Message/Email
INPUT:\n${content}`
    case 'link':
      return `${base}
Context: URL/Link
INPUT:\n${content}`
    case 'news':
      return `${base}
Context: News/Article
INPUT:\n${content}`
    default:
      return `${base}
Context: General
INPUT:\n${content}`
  }
}

export const analyzeContent = async (
  content: string,
  type: 'message' | 'link' | 'news'
): Promise<AnalysisResponse['result']> => {
  try {
    const prompt = generatePrompt(content, type)

    const response = await axios.post<AnalysisResponse>(
      `${API_BASE_URL}/analyze`,
      { prompt },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    )

    return response.data.result
  } catch (error: unknown) {
    console.error('API Error:', error)

    if (axios.isAxiosError(error)) {
      // Prefer the server's own friendly message (it already explains 503/429)
      const serverMsg = (error.response?.data as any)?.error as string | undefined
      if (serverMsg && typeof serverMsg === 'string' && serverMsg.length > 0) {
        if (serverMsg.includes('configuration error')) {
          throw new Error('Server missing API key. Please configure GEMINI_API_KEY in server/.env and restart the server.')
        }
        throw new Error(serverMsg)
      }
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        throw new Error('Cannot reach the verification server. Make sure the backend is running on port 5000 (npm start in /server).')
      } else if (error.response?.status === 429) {
        throw new Error('Too many checks — please wait a minute and try again.')
      } else if (error.response?.status === 503) {
        throw new Error('The verification service is very busy right now. Please wait 20–30 seconds and try again.')
      } else if (error.response?.status === 500) {
        throw new Error('The verification service had a problem. Please try again in a moment.')
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request took too long. Please try again.')
      }
    }

    throw new Error('Failed to analyze content. Please check your connection and try again.')
  }
}

export const checkServerHealth = async (): Promise<boolean> => {
  const attempt = async (timeoutMs: number): Promise<boolean> => {
    try {
      // Allow non-200s so we can decide whether to retry
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: timeoutMs,
        validateStatus: () => true,
      })
      return response.status === 200
    } catch (err) {
      return false
    }
  }

  // First try (shorter) to keep UI snappy
  const okQuick = await attempt(8000)
  if (okQuick) return true

  // If first probe fails (e.g., Render cold start), wait briefly and retry with longer timeout
  await new Promise((r) => setTimeout(r, 1500))
  const okRetry = await attempt(15000)
  return okRetry
}