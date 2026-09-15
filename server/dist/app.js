"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const health_route_1 = __importDefault(require("./routes/health.route"));
const advisories_route_1 = __importDefault(require("./routes/advisories.route"));
const analyze_route_1 = __importDefault(require("./routes/analyze.route"));
function createApp() {
    const app = (0, express_1.default)();
    // Security headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https://generativelanguage.googleapis.com', 'https://phish.sinking.yachts'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.disable('x-powered-by');
    // CORS — strict
    app.use((0, cors_1.default)({
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true); // curl / mobile
            if (env_1.allowedOrigins.includes(origin))
                return cb(null, true);
            if (!env_1.isProd) {
                logger_1.logger.warn({ origin }, 'CORS blocked in dev? allowing for DX');
                return cb(null, true);
            }
            logger_1.logger.warn({ origin, allowedOrigins: env_1.allowedOrigins }, 'CORS blocked');
            return cb(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }));
    // Rate limit global
    app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
    // Body parsers — tight limit (was 10mb, now 20kb covers 10k chars + overhead)
    app.use(express_1.default.json({ limit: '20kb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '20kb' }));
    // Request logging
    app.use((req, _res, next) => { logger_1.logger.info({ method: req.method, url: req.url }, 'req'); next(); });
    app.use(health_route_1.default);
    app.use(advisories_route_1.default);
    app.use(analyze_route_1.default);
    // 404
    app.use((req, res) => res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl }));
    // Error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, _req, res, _next) => {
        logger_1.logger.error({ err }, 'unhandled');
        if (err.message === 'Not allowed by CORS')
            return res.status(403).json({ error: 'Origin not allowed' });
        res.status(500).json({ error: 'Something went wrong!', ...(process.env.NODE_ENV === 'development' && { details: err.message }) });
    });
    return app;
}
//# sourceMappingURL=app.js.map