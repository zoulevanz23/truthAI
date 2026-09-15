export declare function checkDomainReputation(urlString: string): Promise<{
    signals: string[];
    riskDelta: number;
}>;
