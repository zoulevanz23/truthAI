"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const app = (0, app_1.createApp)();
const PORT = env_1.env.PORT;
app.listen(PORT, '0.0.0.0', () => {
    logger_1.logger.info(`🚀 TruthCheck AI Server running on port ${PORT}`);
    logger_1.logger.info(`🌍 Environment: ${env_1.env.NODE_ENV}`);
    logger_1.logger.info(`⚡ Gemini model: ${env_1.env.GEMINI_MODEL}`);
    logger_1.logger.info(`📡 Health: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=server.js.map