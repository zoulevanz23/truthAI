"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSchema = void 0;
exports.validateAnalyze = validateAnalyze;
const zod_1 = require("zod");
exports.analyzeSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'content is required').max(10000, 'content too long: max 10,000 chars'),
    type: zod_1.z.enum(['message', 'link', 'news', 'document']).default('message'),
    // legacy: allow prompt for backwards compat
    prompt: zod_1.z.string().optional(),
}).superRefine((data, ctx) => {
    if (!data.content && !data.prompt)
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'content or prompt required', path: ['content'] });
});
function validateAnalyze(req, res, next) {
    // backwards compat: if only prompt sent, map to content
    if (req.body?.prompt && !req.body?.content) {
        const raw = String(req.body.prompt);
        // Try to extract real content after INPUT: marker, else use whole
        const idx = raw.indexOf('INPUT:');
        const content = idx !== -1 ? raw.slice(idx + 'INPUT:'.length).trim() : raw;
        // Infer type from prompt context
        let type = 'message';
        if (/Context:\s*URL\/Link/i.test(raw))
            type = 'link';
        else if (/Context:\s*News\/Article/i.test(raw))
            type = 'news';
        req.body.content = content;
        req.body.type = req.body.type || type;
    }
    const parsed = exports.analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    req.body = parsed.data;
    next();
}
//# sourceMappingURL=validate.js.map