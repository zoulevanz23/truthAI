// Shared API client for the browser extension
// Handles communication with the TruthCheck AI backend

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'https://your-backend.onrender.com';

export interface AnalysisResult {
  verdict: 'SAFE' | 'SUSPICIOUS' | 'SCAM' | 'TRUSTWORTHY' | 'QUESTIONABLE' | 'LIKELY_FAKE';
  confidence: number;
  explanation: string;
  signals: string[];
}

export interface AnalyzeRequest {
  content: string;
  type: 'message' | 'link' | 'news' | 'document' | 'image';
}

export const api = {
  // Analyze content
  analyze: async (request: AnalyzeRequest): Promise<AnalysisResult> => {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await storage.get()).then(data => data.apiKey ? { 'x-api-key': data.apiKey } : {}),
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Analysis failed');
    }

    return data.result;
  },

  // Check health
  health: async (): Promise<boolean> => {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    return response.ok && data.status === 'healthy';
  },

  // Set API key
  setApiKey: async (key: string): Promise<void> => {
    await storage.set({ apiKey: key });
  },
};