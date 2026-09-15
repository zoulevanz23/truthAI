"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString(), environment: env_1.env.NODE_ENV, version: '1.0.0' });
});
router.get('/', (_req, res) => {
    res.json({ message: 'TruthCheck AI Server', version: '1.0.0', endpoints: { health: '/health', analyze: '/analyze (POST)', scamAdvisories: '/scam-advisories (GET)' } });
});
exports.default = router;
//# sourceMappingURL=health.route.js.map