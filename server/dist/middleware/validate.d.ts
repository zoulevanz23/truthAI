import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
export declare const analyzeSchema: z.ZodEffects<z.ZodObject<{
    content: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["message", "link", "news", "document"]>>;
    prompt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "message" | "link" | "news" | "document";
    content: string;
    prompt?: string | undefined;
}, {
    content: string;
    type?: "message" | "link" | "news" | "document" | undefined;
    prompt?: string | undefined;
}>, {
    type: "message" | "link" | "news" | "document";
    content: string;
    prompt?: string | undefined;
}, {
    content: string;
    type?: "message" | "link" | "news" | "document" | undefined;
    prompt?: string | undefined;
}>;
export declare function validateAnalyze(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
