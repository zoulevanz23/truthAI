"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedOrigins = exports.isProd = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().int().min(1000).max(65535).default(5000),
    GEMINI_API_KEY: zod_1.z.string().min(10, 'GEMINI_API_KEY is required'),
    GEMINI_MODEL: zod_1.z.string().default('gemini-2.5-flash'),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:3000'),
    ALLOWED_ORIGINS: zod_1.z.string().optional(),
    ENABLE_REPUTATION_CHECKS: zod_1.z.enum(['0', '1']).default('0'),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    REDIS_URL: zod_1.z.string().optional(),
});
let parsed;
try {
    parsed = envSchema.parse(process.env);
}
catch (e) {
    if (e.errors) {
        console.error('❌ Invalid environment variables:');
        for (const err of e.errors)
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
    }
    else {
        console.error('Env parse error', e.message);
    }
    // Allow boot in dev without GEMINI_API_KEY for health checks; service will return 503
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️  GEMINI_API_KEY missing — /analyze will return 503 until configured');
        parsed = envSchema.parse({ ...process.env, GEMINI_API_KEY: 'placeholder-missing-key' });
    }
    else {
        throw e;
    }
}
exports.env = parsed;
exports.isProd = exports.env.NODE_ENV === 'production';
exports.allowedOrigins = (exports.env.ALLOWED_ORIGINS || exports.env.FRONTEND_URL)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
//# sourceMappingURL=env.js.map