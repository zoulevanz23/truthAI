export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    GEMINI_API_KEY: string;
    GEMINI_MODEL: string;
    FRONTEND_URL: string;
    ENABLE_REPUTATION_CHECKS: "0" | "1";
    LOG_LEVEL: "debug" | "info" | "warn" | "error";
    ALLOWED_ORIGINS?: string | undefined;
    REDIS_URL?: string | undefined;
};
export declare const isProd: boolean;
export declare const allowedOrigins: string[];
