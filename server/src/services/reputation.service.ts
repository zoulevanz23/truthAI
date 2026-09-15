import { extractDomainFromUrl } from './heuristics.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';

async function checkPhishingDatabase(urlOrDomain: string): Promise<string[] | null> {
  try {
    const candidate = encodeURIComponent(urlOrDomain);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(`https://phish.sinking.yachts/v2/check/${candidate}`, { method: 'GET', signal: controller.signal });
    clearTimeout(t);
    if (!resp.ok) return null;
    const data: any = await resp.json();
    const flagged = Boolean(data?.match || data?.isScam || data?.is_phish === true || data?.isPhish === true || data?.is_phishing === true);
    return flagged ? ['Listed in phishing database'] : [];
  } catch (e) {
    logger.debug({ err: e }, 'reputation check failed');
    return null;
  }
}

export async function checkDomainReputation(urlString: string): Promise<{ signals: string[]; riskDelta: number }> {
  if (env.ENABLE_REPUTATION_CHECKS !== '1') return { signals: [], riskDelta: 0 };
  const domain = extractDomainFromUrl(urlString);
  if (!domain) return { signals: [], riskDelta: 0 };
  const flags = await checkPhishingDatabase(domain);
  if (flags && flags.length > 0) return { signals: flags, riskDelta: 25 };
  return { signals: [], riskDelta: 0 };
}
