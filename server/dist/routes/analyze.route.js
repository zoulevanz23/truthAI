"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisLimiter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const validate_1 = require("../middleware/validate");
const heuristics_service_1 = require("../services/heuristics.service");
const reputation_service_1 = require("../services/reputation.service");
const gemini_service_1 = require("../services/gemini.service");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.analysisLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many analysis requests, please try again in a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/analyze', exports.analysisLimiter, validate_1.validateAnalyze, async (req, res) => {
    const { content, type } = req.body;
    // Heuristics enrichment for link type
    let preSignals = [];
    let preRiskScore = 0;
    if (type === 'link') {
        const candidate = (0, heuristics_service_1.extractUrlFromInput)(content) || content.trim();
        const { signals, riskScore } = (0, heuristics_service_1.analyzeUrlHeuristics)(candidate);
        preSignals = signals;
        preRiskScore = riskScore;
        try {
            const { signals: repSignals, riskDelta } = await (0, reputation_service_1.checkDomainReputation)(candidate);
            preSignals = [...preSignals, ...repSignals];
            preRiskScore += riskDelta;
        }
        catch { }
    }
    try {
        const result = await (0, gemini_service_1.callGemini)(content, type);
        // bias: if heuristics show risk but LLM says SAFE, downgrade
        let verdict = result.verdict;
        if (preRiskScore >= 20 && (verdict === 'SAFE' || verdict === 'TRUSTWORTHY'))
            verdict = 'SUSPICIOUS';
        const mergedSignals = [...preSignals, ...result.signals].slice(0, 12);
        res.json({
            result: {
                verdict,
                confidence: Math.max(0, Math.min(100, result.confidence)),
                explanation: result.explanation,
                signals: mergedSignals.length ? mergedSignals : result.signals,
                rawText: result.rawText,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (e) {
        const status = e.status || 500;
        const msg = e.message || 'Internal server error';
        logger_1.logger.error({ err: e, status }, 'analyze failed');
        if (status === 429)
            return res.status(429).json({ error: 'You’ve reached the limit — too many checks at once. Please wait about a minute and try again.' });
        if (status === 503)
            return res.status(503).json({ error: msg });
        if (status === 504)
            return res.status(504).json({ error: 'Request timeout. Please try again.' });
        return res.status(status).json({ error: msg });
    }
});
exports.default = router;
//# sourceMappingURL=analyze.route.js.map