import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cricketApi } from '../services/api';
import { useAppStore } from '../store/appStore';

// Query keys
export const queryKeys = {
  liveScores: ['liveScores'] as const,
  schedule: ['schedule'] as const,
  tours: ['tours'] as const,
  seriesFixtures: (seriesId: string, params?: any) => ['seriesFixtures', seriesId, params] as const,
  seriesSquads: (seriesId: string) => ['seriesSquads', seriesId] as const,
  seriesStandings: (seriesId: string) => ['seriesStandings', seriesId] as const,
  odds: ['odds'] as const,
  squads: (seriesId: string) => ['squads', seriesId] as const,
  playerProfile: (playerId: string) => ['playerProfile', playerId] as const,
};

// Live scores hook - refresh every 5 seconds
export const useLiveScores = () => {
  const { preferences } = useAppStore();
  
  return useQuery({
    queryKey: queryKeys.liveScores,
    queryFn: async () => {
      const response = await cricketApi.getLiveScores();
      return response.data;
    },
    refetchInterval: preferences.refreshInterval,
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider stale for live data
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Schedule hook - refresh every hour
export const useSchedule = () => {
  return useQuery({
    queryKey: queryKeys.schedule,
    queryFn: async () => {
      const response = await cricketApi.getSchedule();
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};

// Tours hook - refresh every hour
export const useTours = () => {
  return useQuery({
    queryKey: queryKeys.tours,
    queryFn: async () => {
      const response = await cricketApi.getTours();
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};

// Series fixtures hook
export const useSeriesFixtures = (seriesId: string, params?: { status?: string; match?: string }) => {
  return useQuery({
    queryKey: queryKeys.seriesFixtures(seriesId, params),
    queryFn: async () => {
      const response = await cricketApi.getSeriesFixtures(seriesId, params);
      return response.data;
    },
    enabled: !!seriesId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

// Series squads hook
export const useSeriesSquads = (seriesId: string) => {
  return useQuery({
    queryKey: queryKeys.seriesSquads(seriesId),
    queryFn: async () => {
      const response = await cricketApi.getSeriesSquads(seriesId);
      return response.data;
    },
    enabled: !!seriesId,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};

// Series standings hook
export const useSeriesStandings = (seriesId: string) => {
  return useQuery({
    queryKey: queryKeys.seriesStandings(seriesId),
    queryFn: async () => {
      const response = await cricketApi.getSeriesStandings(seriesId);
      return response.data;
    },
    enabled: !!seriesId,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};

// Odds hook - refresh every 30 seconds
export const useOdds = (filters?: { date_start?: string; date_end?: string; bm?: string; market?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.odds, filters],
    queryFn: async () => {
      const response = await cricketApi.getOdds(filters);
      return response.data;
    },
    refetchInterval: 30000, // 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 25000, // 25 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Squads hook
export const useSquads = (seriesId: string) => {
  return useQuery({
    queryKey: queryKeys.squads(seriesId),
    queryFn: async () => {
      const response = await cricketApi.getSquads(seriesId);
      return response.data;
    },
    enabled: !!seriesId,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};

// Player profile hook
export const usePlayerProfile = (playerId: string) => {
  return useQuery({
    queryKey: queryKeys.playerProfile(playerId),
    queryFn: async () => {
      const response = await cricketApi.getPlayerProfile(playerId);
      return response.data;
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};

// Hook to prefetch data
export const usePrefetchData = () => {
  const queryClient = useQueryClient();
  
  const prefetchLiveScores = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.liveScores,
      queryFn: async () => {
        const response = await cricketApi.getLiveScores();
        return response.data;
      },
      staleTime: 1000 * 5, // 5 seconds
    });
  };
  
  const prefetchTours = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.tours,
      queryFn: async () => {
        const response = await cricketApi.getTours();
        return response.data;
      },
      staleTime: 1000 * 60 * 60, // 1 hour
    });
  };
  
  return {
    prefetchLiveScores,
    prefetchTours,
  };
};

// Hook for invalidating queries
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };
  
  const invalidateLiveScores = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.liveScores });
  };
  
  const invalidateOdds = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.odds });
  };
  
  return {
    invalidateAll,
    invalidateLiveScores,
    invalidateOdds,
  };
};