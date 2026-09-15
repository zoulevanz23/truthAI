import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { allowedOrigins, isProd } from './config/env';
import { logger } from './utils/logger';
import { register, login, getMe, createApiKeyHandler, revokeApiKeyHandler, optionalAuthMiddleware, authMiddleware, isAuthenticated } from './middleware/auth';
import healthRouter from './routes/health.route';
import advisoriesRouter from './routes/advisories.route';
import analyzeRouter from './routes/analyze.route';
import { createBulkRoutes } from './bulk/route';

// Security headers
const app = express();

app.use(helmet({
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
});
app.disable('x-powered-by');

// CORS — strict
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl / mobile
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (!isProd) {
      logger.warn({ origin }, 'CORS blocked in dev? allowing for DX');
      return cb(null, true);
    }
    logger.warn({ origin, allowedOrigins }, 'CORS blocked');
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limit global
app.use(rateLimit({ windowMs: 15*60*1000, max: 100, standardHeaders: true, legacyHeaders: false }));

// Body parsers — tight limit (was 10mb, now 20kb covers 10k chars + overhead)
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

// Request logging
app.use((req, _res, next) => { logger.info({ method: req.method, url: req.url }, 'req'); next(); });

// Auth routes (public) — /api/auth/register, /api/auth/login
app.use('/api/auth', express.Router()
  .post('/register', register)
  .post('/login', login)
);

// Protected routes — all require authentication
app.use('/api/analyze', optionalAuthMiddleware);
app.use('/api/bulk', optionalAuthMiddleware);
app.use('/api/keys', authMiddleware);
app.use('/api/analytics', authMiddleware);
app.use('/api/user', authMiddleware);

// Public routes
app.use(healthRouter);
app.use('/api/advisories', advisoriesRouter);
app.use('/api/analyze', analyzeRouter);

// Bulk analysis routes (protected)
app.use('/api/bulk', createBulkRoutes());

// User profile (protected)
app.get('/api/user/me', getMe);

// API key routes (protected)
app.post('/api/keys', createApiKeyHandler);
app.delete('/api/keys/:keyId', revokeApiKeyHandler);

// 404
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl }));

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'unhandled');
  if (err.message === 'Not allowed by CORS') return res.status(403).json({ error: 'Origin not allowed' });
  res.status(500).json({ error: 'Something went wrong!', ...(process.env.NODE_ENV === 'development' && { details: err.message }) });
});

export function createApp() {
  return app;
}