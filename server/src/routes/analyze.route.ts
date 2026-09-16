import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateAnalyze } from '../middleware/validate';
import { analyzeUrlHeuristics, extractUrlFromInput } from '../services/heuristics.service';
import { checkDomainReputation } from '../services/reputation.service';
import { callGemini } from '../services/gemini.service';
import { callGroq } from '../services/groq.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const router = Router();

export const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many analysis requests, please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/analyze', analysisLimiter, validateAnalyze, async (req, res) => {
  const { content, type } = req.body as { content: string; type: 'message'|'link'|'news'|'document'|'image' };

  // Heuristics enrichment for link type
  let preSignals: string[] = [];
  let preRiskScore = 0;
  if (type === 'link') {
    const candidate = extractUrlFromInput(content) || content.trim();
    const { signals, riskScore } = analyzeUrlHeuristics(candidate);
    preSignals = signals;
    preRiskScore = riskScore;
    try {
      const { signals: repSignals, riskDelta } = await checkDomainReputation(candidate);
      preSignals = [...preSignals, ...repSignals];
      preRiskScore += riskDelta;
    } catch {}
  }

  try {
    // Use Gemini for image analysis (vision support), otherwise use configured provider
    const result = type === 'image'
      ? await callGemini(content, type)
      : env.AI_PROVIDER === 'groq'
        ? await callGroq(content, type)
        : await callGemini(content, type);

    // bias: if heuristics show risk but LLM says SAFE, downgrade
    let verdict = result.verdict;
    if (preRiskScore >= 20 && (verdict === 'SAFE' || verdict === 'TRUSTWORTHY')) verdict = 'SUSPICIOUS';

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
  } catch (e: any) {
    const status = e.status || 500;
    const msg = e.message || 'Something went wrong while verifying your content. Please try again.';
    logger.error({ err: e, status }, 'analyze failed');
    if (status === 429) return res.status(429).json({ error: 'You’ve reached the limit — too many checks at once. Please wait about a minute and try again.' });
    if (status === 503) return res.status(503).json({ error: msg });
    if (status === 504) return res.status(504).json({ error: 'Request timeout. Please try again.' });
    return res.status(status).json({ error: env.NODE_ENV !== 'production' ? msg : 'Something went wrong while verifying your content. Please try again.' });
  }
});

export default router;
