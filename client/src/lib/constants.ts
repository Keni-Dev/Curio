/**
 * Application constants
 */

import type { UserLevel } from '~types/user';
import type { StockStatus } from '~types/pharmacy';

// =============================================================================
// Map Configuration
// =============================================================================

export const MAP_CONFIG = {
  // Default center: Malolos, Bulacan
  DEFAULT_CENTER: {
    lat: 14.8527,
    lng: 120.815,
  },
  DEFAULT_ZOOM: 14,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
  // Tile layer
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

// =============================================================================
// Alay Points System
// =============================================================================

export const ALAY_POINTS = {
  // Stock reporting
  STOCK_REPORT: 10,
  PRICE_UPDATE: 5,
  FIRST_REPORT_OF_DAY: 5, // Bonus
  STREAK_BONUS_MULTIPLIER: 0.1, // 10% bonus per streak day, max 50%
  MAX_STREAK_BONUS: 0.5,

  // Verification
  VERIFY_REPORT: 2,
  REPORT_VERIFIED: 3, // When your report gets verified

  // Community
  NEW_PHARMACY_SUGGESTION: 20,
  HELPFUL_REVIEW: 5,

  // Penalties
  DISPUTED_REPORT: -5,
  SPAM_PENALTY: -20,
} as const;

// =============================================================================
// User Levels
// =============================================================================

export const USER_LEVELS: Record<
  UserLevel,
  { minPoints: number; maxPoints: number; icon: string; color: string }
> = {
  Baguhan: {
    minPoints: 0,
    maxPoints: 99,
    icon: '🌱',
    color: '#10B981', // green
  },
  Scout: {
    minPoints: 100,
    maxPoints: 499,
    icon: '🔍',
    color: '#3B82F6', // blue
  },
  Champion: {
    minPoints: 500,
    maxPoints: 1999,
    icon: '⭐',
    color: '#F59E0B', // amber
  },
  Legend: {
    minPoints: 2000,
    maxPoints: Infinity,
    icon: '👑',
    color: '#8B5CF6', // purple
  },
} as const;

/**
 * Get user level based on points
 */
export function getUserLevel(points: number): UserLevel {
  if (points >= USER_LEVELS.Legend.minPoints) return 'Legend';
  if (points >= USER_LEVELS.Champion.minPoints) return 'Champion';
  if (points >= USER_LEVELS.Scout.minPoints) return 'Scout';
  return 'Baguhan';
}

/**
 * Get progress to next level (0-100)
 */
export function getLevelProgress(points: number): number {
  const currentLevel = getUserLevel(points);
  const levelConfig = USER_LEVELS[currentLevel];

  if (currentLevel === 'Legend') return 100;

  const pointsInLevel = points - levelConfig.minPoints;
  const levelRange = levelConfig.maxPoints - levelConfig.minPoints + 1;

  return Math.min(100, Math.round((pointsInLevel / levelRange) * 100));
}

// =============================================================================
// Stock Status
// =============================================================================

export const STOCK_STATUS_CONFIG: Record<
  StockStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  in_stock: {
    label: 'In Stock',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: '✓',
  },
  low_stock: {
    label: 'Low Stock',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: '!',
  },
  out_of_stock: {
    label: 'Out of Stock',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: '✗',
  },
  unknown: {
    label: 'Unknown',
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    icon: '?',
  },
} as const;

// =============================================================================
// API Configuration
// =============================================================================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// =============================================================================
// App Metadata
// =============================================================================

export const APP_CONFIG = {
  NAME: 'Curio',
  TAGLINE: 'Community-Powered Medicine Finder',
  DESCRIPTION:
    'Find medicines near you with real-time stock information powered by community contributions.',
  VERSION: '1.0.0',
  LOCALE: 'en-PH',
} as const;

// =============================================================================
// Search Configuration
// =============================================================================

export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_MS: 300,
  MAX_RESULTS: 20,
  MAX_SUGGESTIONS: 5,
} as const;

// =============================================================================
// Geolocation
// =============================================================================

export const GEOLOCATION_CONFIG = {
  TIMEOUT: 10000,
  MAXIMUM_AGE: 60000, // 1 minute
  ENABLE_HIGH_ACCURACY: true,
} as const;

// =============================================================================
// Local Storage Keys
// =============================================================================

export const STORAGE_KEYS = {
  THEME: 'curio-theme',
  USER_PREFERENCES: 'curio-preferences',
  RECENT_SEARCHES: 'curio-recent-searches',
  CACHED_LOCATION: 'curio-cached-location',
} as const;
