/**
 * User-related type definitions
 */

export type UserLevel = 'Baguhan' | 'Scout' | 'Champion' | 'Legend';

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  alayPoints: number;
  streakDays: number;
  contributionCount: number;
  level: UserLevel;
  createdAt: string;
  lastActiveAt?: string;
}

export interface UserStats {
  totalReports: number;
  verifiedReports: number;
  accuracyRate: number;
  currentStreak: number;
  longestStreak: number;
  rankInCity?: number;
  totalUsers?: number;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AlayContribution {
  id: string;
  userId: string;
  pharmacyId: string;
  medicineId: string;
  type: 'stock_report' | 'price_update' | 'verification' | 'new_pharmacy';
  pointsEarned: number;
  createdAt: string;
  status: 'pending' | 'verified' | 'disputed' | 'expired';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  alayPoints: number;
  level: UserLevel;
  contributionCount: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'tl';
  notifications: {
    stockAlerts: boolean;
    achievements: boolean;
    communityUpdates: boolean;
  };
  defaultLocation?: {
    lat: number;
    lng: number;
  };
}
