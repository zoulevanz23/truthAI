import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const analyzeSchema = z.object({
  content: z.string().min(1, 'content is required').max(10000, 'content too long: max 10,000 chars'),
  type: z.enum(['message', 'link', 'news', 'document', 'image']).default('message'),
  // legacy: allow prompt for backwards compat
  prompt: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.content && !data.prompt) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'content or prompt required', path: ['content'] });
  
  // For image type, content should be a data URL (base64 encoded)
  if (data.type === 'image' && data.content) {
    try {
      // Validate it's a data URL starting with data:image/
      const isDataUrl = data.content.startsWith('data:image/');
      if (!isDataUrl) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Image content must be a data URL (e.g., data:image/jpeg;base64,...)', path: ['content'] });
      }
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid image data URL format', path: ['content'] });
    }
  }
});

export function validateAnalyze(req: Request, res: Response, next: NextFunction) {
  // backwards compat: if only prompt sent, map to content
  if (req.body?.prompt && !req.body?.content) {
    const raw: string = String(req.body.prompt);
    // Try to extract real content after INPUT: marker, else use whole
    const idx = raw.indexOf('INPUT:');
    const content = idx !== -1 ? raw.slice(idx + 'INPUT:'.length).trim() : raw;
    // Infer type from prompt context
    let type: string = 'message';
    if (/Context:\s*URL\/Link/i.test(raw)) type = 'link';
    else if (/Context:\s*News\/Article/i.test(raw)) type = 'news';
    else if (/Context:\s*Image\/Picture/i.test(raw)) type = 'image';
    req.body.content = content;
    req.body.type = req.body.type || type;
  }
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
  }
  req.body = parsed.data as any;
  next();
}