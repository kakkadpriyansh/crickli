import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Cricket API functions
export const cricketApi = {
  // Live scores
  getLiveScores: () => api.get<ApiResponse<any>>('/livescore'),
  
  // Schedule/fixtures
  getSchedule: () => api.get<ApiResponse<any>>('/schedule'),
  
  // Tours/Series
  getTours: () => api.get<ApiResponse<any>>('/tours'),
  
  // Series fixtures
  getSeriesFixtures: (seriesId: string, params?: { status?: string; match?: string }) => 
    api.get<ApiResponse<any>>(`/series/${seriesId}/fixtures`, { params }),
  
  // Series squads
  getSeriesSquads: (seriesId: string) => 
    api.get<ApiResponse<any>>(`/series/${seriesId}/squads`),
  
  // Series standings
  getSeriesStandings: (seriesId: string) => 
    api.get<ApiResponse<any>>(`/series/${seriesId}/standings`),
  
  // Odds
  getOdds: (params?: { date_start?: string; date_end?: string; bm?: string; market?: string }) => 
    api.get<ApiResponse<any>>('/odds', { params }),

  // Cricket squads
  getSquads: (seriesId: string) => 
    api.get<ApiResponse<any>>(`/squads/${seriesId}`),

  // Player profile
  getPlayerProfile: (playerId: string) => 
    api.get<ApiResponse<any>>(`/player/${playerId}`),
};

// Export the axios instance for custom requests
export default api;