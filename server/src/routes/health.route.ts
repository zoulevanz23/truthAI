import { Router } from 'express';
import { env } from '../config/env';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString(), environment: env.NODE_ENV, version: '1.0.0' });
});

router.get('/', (_req, res) => {
  res.json({ message: 'TruthCheck AI Server', version: '1.0.0', endpoints: { health: '/health', analyze: '/analyze (POST)', scamAdvisories: '/scam-advisories (GET)' } });
});

export default router;
