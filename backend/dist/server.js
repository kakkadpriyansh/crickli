"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const goalserve_1 = require("./routes/goalserve");
const config_1 = require("./config");
const fastify = (0, fastify_1.default)({
    logger: {
        level: config_1.config.NODE_ENV === 'production' ? 'warn' : 'info'
    }
});
// Register plugins
fastify.register(helmet_1.default, {
    contentSecurityPolicy: false
});
fastify.register(cors_1.default, {
    origin: config_1.config.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
});
fastify.register(rate_limit_1.default, {
    max: 100,
    timeWindow: '1 minute'
});
// Health check
fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});
// Register routes
fastify.register(goalserve_1.goalserveRoutes, { prefix: '/api' });
// Start server
const start = async () => {
    try {
        await fastify.listen({
            port: config_1.config.PORT,
            host: config_1.config.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
        });
        console.log(`🚀 Server running on port ${config_1.config.PORT}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await fastify.close();
    process.exit(0);
});
//# sourceMappingURL=server.js.map