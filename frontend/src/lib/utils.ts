import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { utcToZonedTime, format as formatTz } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Timezone utilities for Asia/Kolkata
const TIMEZONE = 'Asia/Kolkata';

export function formatDateInTimezone(date: Date | string, formatStr: string = 'PPp'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = utcToZonedTime(dateObj, TIMEZONE);
  return formatTz(zonedDate, formatStr, { timeZone: TIMEZONE });
}

export function formatMatchTime(time: string | Date): string {
  // If it's already a time string in HH:mm format, return it directly
  if (typeof time === 'string' && /^\d{1,2}:\d{2}$/.test(time)) {
    return time;
  }
  
  // If it's a Date object or full date string, format it
  try {
    const dateObj = typeof time === 'string' ? new Date(time) : time;
    if (isNaN(dateObj.getTime())) {
      return '00:00'; // fallback for invalid dates
    }
    const zonedDate = utcToZonedTime(dateObj, TIMEZONE);
    return formatTz(zonedDate, 'HH:mm', { timeZone: TIMEZONE });
  } catch (error) {
    return '00:00'; // fallback for any errors
  }
}

export function formatMatchDate(date: Date | string): string {
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Handle dd.mm.yyyy format from API
      if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(date)) {
        const [day, month, year] = date.split('.');
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'TBD'; // fallback for invalid dates
    }
    
    const zonedDate = utcToZonedTime(dateObj, TIMEZONE);
    return formatTz(zonedDate, 'dd MMM yyyy', { timeZone: TIMEZONE });
  } catch (error) {
    return 'TBD'; // fallback for any errors
  }
}

export function getTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Cricket-specific utilities
export function getMatchStatus(status: string): {
  label: string;
  color: string;
  isLive: boolean;
} {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('live') || statusLower.includes('inplay')) {
    return { label: 'LIVE', color: 'text-red-600 bg-red-100', isLive: true };
  }
  
  if (statusLower.includes('finished') || statusLower.includes('completed')) {
    return { label: 'Finished', color: 'text-gray-600 bg-gray-100', isLive: false };
  }
  
  if (statusLower.includes('scheduled') || statusLower.includes('upcoming')) {
    return { label: 'Upcoming', color: 'text-blue-600 bg-blue-100', isLive: false };
  }
  
  if (statusLower.includes('cancelled')) {
    return { label: 'Cancelled', color: 'text-red-600 bg-red-100', isLive: false };
  }
  
  return { label: status, color: 'text-gray-600 bg-gray-100', isLive: false };
}

export function formatScore(runs: number | string, wickets: number | string, overs?: number | string): string {
  let scoreStr = `${runs}/${wickets}`;
  if (overs) {
    scoreStr += ` (${overs})`;
  }
  return scoreStr;
}

export function getTeamShortName(teamName: string): string {
  // Common cricket team abbreviations
  const abbreviations: Record<string, string> = {
    'India': 'IND',
    'Australia': 'AUS',
    'England': 'ENG',
    'Pakistan': 'PAK',
    'South Africa': 'SA',
    'New Zealand': 'NZ',
    'Sri Lanka': 'SL',
    'Bangladesh': 'BAN',
    'West Indies': 'WI',
    'Afghanistan': 'AFG',
    'Ireland': 'IRE',
    'Zimbabwe': 'ZIM',
    'Netherlands': 'NED',
    'Scotland': 'SCO',
  };
  
  return abbreviations[teamName] || teamName.substring(0, 3).toUpperCase();
}

// Storage utilities
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

// API utilities
export function createApiUrl(endpoint: string, params?: Record<string, string | number>): string {
  const baseUrl = '/api';
  let url = `${baseUrl}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}