"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUrlFromInput = extractUrlFromInput;
exports.analyzeUrlHeuristics = analyzeUrlHeuristics;
exports.extractDomainFromUrl = extractDomainFromUrl;
const SUSPICIOUS_TLDS = new Set(['zip', 'mov', 'xyz', 'top', 'click', 'work', 'ru', 'tk']);
const SHORTENERS = new Set(['bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'is.gd', 'ow.ly', 'buff.ly']);
const PHISHY_KEYWORDS = ['login', 'verify', 'password', 'account', 'bank', 'update', 'signin', 'confirm'];
function extractUrlFromInput(input) {
    const m = input.match(/https?:\/\/[^\s\n]+/i);
    return m ? m[0] : null;
}
function analyzeUrlHeuristics(urlString) {
    const signals = [];
    let riskScore = 0;
    if (!urlString)
        return { signals, riskScore, isValid: false };
    try {
        const url = new URL(urlString);
        const host = url.hostname || '';
        const tld = host.split('.').pop()?.toLowerCase() || '';
        if (url.protocol !== 'https:') {
            signals.push('Uses non-HTTPS protocol');
            riskScore += 10;
        }
        if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
            signals.push('IP address host (not a domain)');
            riskScore += 20;
        }
        if (host.includes('xn--')) {
            signals.push('Internationalized domain (possible homograph)');
            riskScore += 15;
        }
        if (host.split('.').length >= 4) {
            signals.push('Many subdomains');
            riskScore += 10;
        }
        if (SUSPICIOUS_TLDS.has(tld)) {
            signals.push(`Suspicious TLD .${tld}`);
            riskScore += 10;
        }
        if (SHORTENERS.has(host.toLowerCase())) {
            signals.push('URL shortener (destination obscured)');
            riskScore += 15;
        }
        if (url.port && url.port !== '80' && url.port !== '443') {
            signals.push(`Unusual port :${url.port}`);
            riskScore += 10;
        }
        const lc = (url.pathname + url.search).toLowerCase();
        if (PHISHY_KEYWORDS.some((k) => lc.includes(k))) {
            signals.push('Contains sensitive-action keywords');
            riskScore += 10;
        }
        if (url.search.length > 200) {
            signals.push('Very long query string');
            riskScore += 5;
        }
        // punycode + lookalike
        if (/[0-9]/.test(host) && /[a-z]/.test(host) && host.length > 20) {
            signals.push('Mixed alphanumeric domain');
            riskScore += 5;
        }
        return { signals, riskScore, isValid: true };
    }
    catch {
        signals.push('Invalid URL format');
        return { signals, riskScore: 20, isValid: false };
    }
}
function extractDomainFromUrl(urlString) {
    try {
        return new URL(urlString).hostname || null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=heuristics.service.js.map