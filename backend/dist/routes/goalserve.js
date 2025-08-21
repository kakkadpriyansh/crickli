"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalserveRoutes = goalserveRoutes;
const node_cache_1 = __importDefault(require("node-cache"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
// Cache instance
const cache = new node_cache_1.default({
    stdTTL: config_1.config.CACHE_TTL.FIXTURES,
    checkperiod: 60
});
// Helper function to make Goalserve API calls
async function fetchGoalserveData(endpoint, cacheKey, ttl = config_1.config.CACHE_TTL.FIXTURES) {
    const cached = cache.get(cacheKey);
    if (cached) {
        return cached;
    }
    try {
        const url = endpoint.includes('?') ? `${endpoint}&json=1` : `${endpoint}?json=1`;
        console.log(`Fetching data from: ${url}`);
        const response = await axios_1.default.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Cricket-Live-App/1.0'
            }
        });
        console.log(`Response status: ${response.status}`);
        console.log(`Response data type: ${typeof response.data}`);
        const data = response.data;
        cache.set(cacheKey, data, ttl);
        return data;
    }
    catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
        if (error.response) {
            console.error(`Response status: ${error.response.status}`);
            console.error(`Response data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
        }
        throw new Error(`Failed to fetch data from Goalserve: ${error.message}`);
    }
}
async function goalserveRoutes(fastify, options) {
    // Live scores - refresh every 5 seconds
    fastify.get('/livescore', async (request, reply) => {
        try {
            const endpoint = `${config_1.config.BASE_URL}/${config_1.config.GOALSERVE_API_KEY}/cricket/livescore`;
            const data = await fetchGoalserveData(endpoint, 'livescore', config_1.config.CACHE_TTL.LIVE);
            return { success: true, data };
        }
        catch (error) {
            reply.code(500);
            return { success: false, error: 'Failed to fetch live scores' };
        }
    });
    // Cricket fixtures/schedule - refresh every hour
    fastify.get('/schedule', async (request, reply) => {
        try {
            const endpoint = `${config_1.config.BASE_URL}/${config_1.config.GOALSERVE_API_KEY}/cricket/schedule`;
            const data = await fetchGoalserveData(endpoint, 'schedule', config_1.config.CACHE_TTL.FIXTURES);
            return { success: true, data };
        }
        catch (error) {
            reply.code(500);
            return { success: false, error: 'Failed to fetch schedule' };
        }
    });
    // Tours/Series list - refresh every hour
    fastify.get('/tours', async (request, reply) => {
        try {
            const endpoint = `${config_1.config.BASE_URL}/${config_1.config.GOALSERVE_API_KEY}/cricketfixtures/tours/tours`;
            const data = await fetchGoalserveData(endpoint, 'tours', config_1.config.CACHE_TTL.STATIC);
            return { success: true, data };
        }
        catch (error) {
            reply.code(500);
            return { success: false, error: 'Failed to fetch tours' };
        }
    });
    // Series fixtures
    fastify.get('/series/:seriesId/fixtures', async (request, reply) => {
        try {
            const { seriesId } = request.params;
            const { status, match } = request.query;
            let endpoint = `${config_1.config.BASE_URL}/${config_1.config.GOALSERVE_API_KEY}/cricketfixtures/intl/${seriesId}`;
            const queryParams = [];
            if (status)
                queryParams.push(`status=${status}`);
            if (match)
                queryParams.push(`match=${match}`);
            if (queryParams.length > 0) {
                endpoint += `?${queryParams.join('&')}`;
            }
            const data = await fetchGoalserveData(endpoint, `fixtures_${seriesId}_${status || 'all'}_${match || 'all'}`, config_1.config.CACHE_TTL.FIXTURES);
            return { success: true, data };
        }
        catch (error) {
            reply.code(500);
            return { success: false, error: 'Failed to fetch series fixtures' };
        }
    });
    // Series squads
    fastify.get('/series/:seriesId/squads', async (request, reply) => {
        try {
            const { seriesId } = request.params;
            const endpoint = `${config_1.config.BASE_URL}/${config_1.config.GOALSERVE_API_KEY}/cricketfixtures/intl/${seriesId}_squads`;
            const data = await fetchGoalserveData(endpoint, `squads_${seriesId}`, config_1.config.CACHE_TTL.STATIC);
            return { success: true, data };
        }
        catch (error) {
            reply.code(500);
            return { success: false, error: 'Failed to fetch series squads' };
        }
    });
    // Series standings/table
    fastify.get('/series/:seriesId/standings', async (request, reply) => {
        try {
            const { seriesId } = request.params;
            const endpoint = `${config_1.config.BASE_URL}/${config_1.config.GOALSERVE_API_KEY}/cricketfixtures/intl/${seriesId}_table`;
            const data = await fetchGoalserveData(endpoint, `standings_${seriesId}`, config_1.config.CACHE_TTL.STATIC);
            return { success: true, data };
        }
        catch (error) {
            reply.code(500);
            return { success: false, error: 'Failed to fetch series standings' };
        }
    });
    // Cricket odds - refresh every 20 seconds
    fastify.get('/odds', async (request, reply) => {
        try {
            const endpoint = `${config_1.config.ODDS_BASE_URL}/${config_1.config.GOALSERVE_API_KEY}/getodds/soccer?cat=cricket_10`;
            const data = await fetchGoalserveData(endpoint, 'odds', config_1.config.CACHE_TTL.ODDS);
            return { success: true, data };
        }
        catch (error) {
            reply.code(500);
            return { success: false, error: 'Failed to fetch odds' };
        }
    });
    // Player profile
    fastify.get('/player/:playerId', async (request, reply) => {
        try {
            const { playerId } = request.params;
            const endpoint = `${config_1.config.BASE_URL}/${config_1.config.GOALSERVE_API_KEY}/cricket/profile?id=${playerId}`;
            const data = await fetchGoalserveData(endpoint, `player_${playerId}`, config_1.config.CACHE_TTL.STATIC);
            return { success: true, data };
        }
        catch (error) {
            reply.code(500);
            return { success: false, error: 'Failed to fetch player profile' };
        }
    });
    // Cache status endpoint for debugging
    fastify.get('/cache/status', async (request, reply) => {
        const keys = cache.keys();
        const stats = cache.getStats();
        return {
            success: true,
            data: {
                keys: keys.length,
                keysList: keys,
                stats
            }
        };
    });
    // Clear cache endpoint
    fastify.delete('/cache', async (request, reply) => {
        cache.flushAll();
        return { success: true, message: 'Cache cleared' };
    });
}
//# sourceMappingURL=goalserve.js.map