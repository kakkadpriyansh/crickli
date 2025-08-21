import dotenv from 'dotenv';

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  HOST: process.env.HOST || '0.0.0.0',
  GOALSERVE_API_KEY: process.env.GOALSERVE_API_KEY || '9632ae2bcc8544900d3308ddded95a03',
  BASE_URL: 'http://www.goalserve.com/getfeed',
  ODDS_BASE_URL: 'https://www.goalserve.com/getfeed',
  CACHE_TTL: {
    LIVE: 5, // 5 seconds for live data
    ODDS: 20, // 20 seconds for odds
    FIXTURES: 3600, // 1 hour for fixtures
    STATIC: 3600 // 1 hour for static data like tours, squads
  }
};

export type Config = typeof config;