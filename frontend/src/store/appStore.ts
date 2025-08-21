import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Last viewed series for persistence
  lastViewedSeries: string | null;
  setLastViewedSeries: (seriesId: string | null) => void;
  
  // Selected player for profile view
  selectedPlayerId: string | null;
  setSelectedPlayerId: (playerId: string | null) => void;
  
  // App preferences
  preferences: {
    refreshInterval: number;
    showNotifications: boolean;
    theme: 'light' | 'dark';
  };
  setPreferences: (preferences: Partial<AppState['preferences']>) => void;
  
  // Connection status
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  
  // Error handling
  lastError: string | null;
  setLastError: (error: string | null) => void;
  
  // Loading states
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, isLoading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      lastViewedSeries: null,
      selectedPlayerId: null,
      preferences: {
        refreshInterval: 5000, // 5 seconds for live data
        showNotifications: true,
        theme: 'light',
      },
      isOnline: navigator.onLine,
      lastError: null,
      loadingStates: {},
      
      // Actions
      setLastViewedSeries: (seriesId) => {
        set({ lastViewedSeries: seriesId });
      },
      
      setSelectedPlayerId: (playerId) => {
        set({ selectedPlayerId: playerId });
      },
      
      setPreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        }));
      },
      
      setIsOnline: (isOnline) => {
        set({ isOnline });
      },
      
      setLastError: (error) => {
        set({ lastError: error });
      },
      
      setLoading: (key, isLoading) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: isLoading,
          },
        }));
      },
    }),
    {
      name: 'cricket-app-storage',
      partialize: (state) => ({
        lastViewedSeries: state.lastViewedSeries,
        selectedPlayerId: state.selectedPlayerId,
        preferences: state.preferences,
      }),
    }
  )
);

// Hook for online status
export const useOnlineStatus = () => {
  const { isOnline, setIsOnline } = useAppStore();
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);
  
  return isOnline;
};

// Hook for loading states
export const useLoadingState = (key: string) => {
  const { loadingStates, setLoading } = useAppStore();
  return {
    isLoading: loadingStates[key] || false,
    setLoading: (isLoading: boolean) => setLoading(key, isLoading),
  };
};