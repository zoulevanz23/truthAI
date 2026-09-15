export type Verdict = 'SAFE' | 'SUSPICIOUS' | 'SCAM' | 'TRUSTWORTHY' | 'QUESTIONABLE' | 'LIKELY_FAKE';
export interface StructuredResult {
    verdict: Verdict;
    confidence: number;
    explanation: string;
    signals: string[];
    rawText?: string;
}
export declare function callGemini(content: string, contentType: 'message' | 'link' | 'news' | 'document'): Promise<StructuredResult>;
