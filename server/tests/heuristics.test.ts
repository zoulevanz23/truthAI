import { describe, it, expect } from 'vitest';
import { analyzeUrlHeuristics } from '../src/services/heuristics.service';

describe('analyzeUrlHeuristics', () => {
  it('flags non-https', () => {
    const r = analyzeUrlHeuristics('http://example.com');
    expect(r.signals).toContain('Uses non-HTTPS protocol');
    expect(r.isValid).toBe(true);
  });
  it('flags IP host', () => {
    const r = analyzeUrlHeuristics('http://192.168.1.1/login');
    expect(r.signals).toContain('IP address host (not a domain)');
    expect(r.riskScore).toBeGreaterThanOrEqual(20);
  });
  it('flags homograph', () => {
    const r = analyzeUrlHeuristics('https://xn--pple-43d.com');
    expect(r.signals).toContain('Internationalized domain (possible homograph)');
  });
  it('flags shortener', () => {
    const r = analyzeUrlHeuristics('https://bit.ly/abc');
    expect(r.signals).toContain('URL shortener (destination obscured)');
  });
  it('flags suspicious TLD', () => {
    const r = analyzeUrlHeuristics('https://scam.zip/login');
    expect(r.signals).toContain('Suspicious TLD .zip');
  });
  it('flags unusual port', () => {
    const r = analyzeUrlHeuristics('https://example.com:8080/');
    expect(r.signals).toContain('Unusual port :8080');
  });
  it('invalid url', () => {
    const r = analyzeUrlHeuristics('not a url');
    expect(r.isValid).toBe(false);
    expect(r.signals).toContain('Invalid URL format');
  });
  it('null input', () => {
    const r = analyzeUrlHeuristics(null);
    expect(r.isValid).toBe(false);
    expect(r.riskScore).toBe(0);
  });
});
