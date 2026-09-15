import { describe, it, expect } from 'vitest';
import { analyzeSchema } from '../src/middleware/validate';

describe('analyzeSchema', () => {
  it('accepts valid content', () => {
    const r = analyzeSchema.safeParse({ content: 'hello', type: 'message' });
    expect(r.success).toBe(true);
  });
  it('rejects empty', () => {
    const r = analyzeSchema.safeParse({ content: '', type: 'message' });
    expect(r.success).toBe(false);
  });
  it('rejects too long', () => {
    const r = analyzeSchema.safeParse({ content: 'a'.repeat(10001), type: 'link' });
    expect(r.success).toBe(false);
  });
  it('accepts legacy prompt mapped via middleware (schema allows prompt)', () => {
    const r = analyzeSchema.safeParse({ prompt: 'hello world', content: 'hello', type: 'message' });
    expect(r.success).toBe(true);
  });
});
