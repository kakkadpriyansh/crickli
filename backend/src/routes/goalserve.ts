import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import NodeCache from 'node-cache';
import axios from 'axios';
import { config } from '../config';

// Cache duration constants
const CACHE_DURATION = {
  LIVE: 5, // 5 seconds for live data
  ODDS: 20, // 20 seconds for odds
  FIXTURES: 300, // 5 minutes for fixtures
  STATIC: 3600, // 1 hour for static data
  SCHEDULE: 300, // 5 minutes for schedule data
};

// Cache instance
const cache = new NodeCache({
  stdTTL: config.CACHE_TTL.FIXTURES,
  checkperiod: 60
});

// Helper function to make Goalserve API calls
async function fetchGoalserveData(endpoint: string, cacheKey: string, ttl: number = config.CACHE_TTL.FIXTURES) {
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = endpoint;
    console.log(`Fetching data from: ${url}`);
    
    const response = await axios.get(url, {
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
  } catch (error: any) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
    }
    throw new Error(`Failed to fetch data from Goalserve: ${error.message}`);
  }
}

export async function goalserveRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Live scores - refresh every 5 seconds
  fastify.get('/livescore', async (request, reply) => {
    try {
      const endpoint = `${config.BASE_URL}/${config.GOALSERVE_API_KEY}/cricket/livescore`;
      const data = await fetchGoalserveData(endpoint, 'livescore', config.CACHE_TTL.LIVE);
      return { success: true, data };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch live scores' };
    }
  });

  // Cricket fixtures/schedule - refresh every hour
  fastify.get('/schedule', async (request, reply) => {
    try {
      const endpoint = `${config.BASE_URL}/${config.GOALSERVE_API_KEY}/cricket/schedule`;
      const data = await fetchGoalserveData(endpoint, 'schedule', config.CACHE_TTL.FIXTURES);
      return { success: true, data };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch schedule' };
    }
  });

  // Tours/Series list - refresh every hour
  fastify.get('/tours', async (request, reply) => {
    try {
      const endpoint = `${config.BASE_URL}/${config.GOALSERVE_API_KEY}/cricketfixtures/tours/tours`;
      const data = await fetchGoalserveData(endpoint, 'tours', config.CACHE_TTL.STATIC);
      return { success: true, data };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch tours' };
    }
  });

  // Series fixtures
  fastify.get('/series/:seriesId/fixtures', async (request, reply) => {
    try {
      const { seriesId } = request.params as { seriesId: string };
      const { status, match } = request.query as { status?: string; match?: string };
      
      let endpoint = `${config.BASE_URL}/${config.GOALSERVE_API_KEY}/cricketfixtures/intl/${seriesId}`;
      const queryParams = [];
      
      if (status) queryParams.push(`status=${status}`);
      if (match) queryParams.push(`match=${match}`);
      
      if (queryParams.length > 0) {
        endpoint += `?${queryParams.join('&')}`;
      }
      
      const data = await fetchGoalserveData(endpoint, `fixtures_${seriesId}_${status || 'all'}_${match || 'all'}`, config.CACHE_TTL.FIXTURES);
      return { success: true, data };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch series fixtures' };
    }
  });

  // Series squads
  fastify.get('/series/:seriesId/squads', async (request, reply) => {
    try {
      const { seriesId } = request.params as { seriesId: string };
      const endpoint = `${config.BASE_URL}/${config.GOALSERVE_API_KEY}/cricketfixtures/intl/${seriesId}_squads`;
      const data = await fetchGoalserveData(endpoint, `squads_${seriesId}`, config.CACHE_TTL.STATIC);
      return { success: true, data };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch series squads' };
    }
  });

  // Series standings/table
  fastify.get('/series/:seriesId/standings', async (request, reply) => {
    try {
      const { seriesId } = request.params as { seriesId: string };
      const endpoint = `${config.BASE_URL}/${config.GOALSERVE_API_KEY}/cricketfixtures/intl/${seriesId}_table`;
      const data = await fetchGoalserveData(endpoint, `standings_${seriesId}`, config.CACHE_TTL.STATIC);
      return { success: true, data };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch series standings' };
    }
  });

  // Cricket odds - refresh every 20 seconds
  fastify.get('/odds', async (request, reply) => {
    try {
      const { date_start, date_end, bm, market } = request.query as {
        date_start?: string;
        date_end?: string;
        bm?: string;
        market?: string;
      };
      
      // Default to today's date in dd.MM.yyyy format if no date_start provided
      const today = new Date().toISOString().slice(0, 10).split('-').reverse().join('.');
      const startDate = date_start || today;
      const endDate = date_end || startDate; // Use same date for single day if not specified
      const bookmaker = bm || 'bet365'; // Default to bet365 if no bookmaker specified
      
      let endpoint = `https://www.goalserve.com/getfeed/${config.GOALSERVE_API_KEY}/getodds/soccer?cat=cricket_10&json=1`;
      const queryParams = [];
      
      // Always include date and bookmaker filters to avoid N/A odds
      queryParams.push(`date_start=${startDate}`);
      queryParams.push(`date_end=${endDate}`);
      queryParams.push(`bm=${bookmaker}`);
      
      if (market) queryParams.push(`market=${market}`);
      
      endpoint += `&${queryParams.join('&')}`;
      
      const cacheKey = `odds_${startDate}_${endDate}_${bookmaker}_${market || 'all'}`;
      const data = await fetchGoalserveData(endpoint, cacheKey, CACHE_DURATION.ODDS);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching odds:', error instanceof Error ? error.message : String(error));
      reply.code(500);
      return { success: false, error: 'Failed to fetch odds' };
    }
  });

  // Cricket squads - refresh every hour
  fastify.get('/squads/:seriesId', async (request, reply) => {
    try {
      const { seriesId } = request.params as { seriesId: string };
      const endpoint = `${config.BASE_URL}/${config.GOALSERVE_API_KEY}/cricketfixtures/intl/${seriesId}_squads?json=1`;
      const data = await fetchGoalserveData(endpoint, `squads_${seriesId}`, CACHE_DURATION.STATIC);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching squads:', error instanceof Error ? error.message : String(error));
      reply.code(500);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch squads' };
    }
  });

  // Player profile - refresh every 6 hours
  fastify.get('/player/:playerId', async (request, reply) => {
    try {
      const { playerId } = request.params as { playerId: string };
      const endpoint = `https://www.goalserve.com/getfeed/${config.GOALSERVE_API_KEY}/cricket/player/${playerId}?json=1`;
      const data = await fetchGoalserveData(endpoint, `player_${playerId}`, CACHE_DURATION.STATIC * 6);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching player profile:', error instanceof Error ? error.message : String(error));
      reply.code(500);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch player profile' };
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