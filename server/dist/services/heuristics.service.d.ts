export interface HeuristicResult {
    signals: string[];
    riskScore: number;
    isValid: boolean;
}
export declare function extractUrlFromInput(input: string): string | null;
export declare function analyzeUrlHeuristics(urlString: string | null): HeuristicResult;
export declare function extractDomainFromUrl(urlString: string): string | null;
