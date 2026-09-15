"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDomainReputation = checkDomainReputation;
const heuristics_service_1 = require("./heuristics.service");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
async function checkPhishingDatabase(urlOrDomain) {
    try {
        const candidate = encodeURIComponent(urlOrDomain);
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(`https://phish.sinking.yachts/v2/check/${candidate}`, { method: 'GET', signal: controller.signal });
        clearTimeout(t);
        if (!resp.ok)
            return null;
        const data = await resp.json();
        const flagged = Boolean(data?.match || data?.isScam || data?.is_phish === true || data?.isPhish === true || data?.is_phishing === true);
        return flagged ? ['Listed in phishing database'] : [];
    }
    catch (e) {
        logger_1.logger.debug({ err: e }, 'reputation check failed');
        return null;
    }
}
async function checkDomainReputation(urlString) {
    if (env_1.env.ENABLE_REPUTATION_CHECKS !== '1')
        return { signals: [], riskDelta: 0 };
    const domain = (0, heuristics_service_1.extractDomainFromUrl)(urlString);
    if (!domain)
        return { signals: [], riskDelta: 0 };
    const flags = await checkPhishingDatabase(domain);
    if (flags && flags.length > 0)
        return { signals: flags, riskDelta: 25 };
    return { signals: [], riskDelta: 0 };
}
//# sourceMappingURL=reputation.service.js.map