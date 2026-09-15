import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();
const PORT = env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 TruthCheck AI Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`⚡ Gemini model: ${env.GEMINI_MODEL}`);
  logger.info(`📡 Health: http://localhost:${PORT}/health`);
});
