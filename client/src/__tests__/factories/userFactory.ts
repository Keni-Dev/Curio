/**
 * Mock Factory: Users
 *
 * Creates mock user data for testing.
 */

import type { User, UserLevel, UserStats, UserBadge, AlayContribution } from '@/types/user';

let idCounter = 1;

/**
 * Create a mock user with default values
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  const id = `user-${idCounter++}`;
  return {
    id,
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: undefined,
    alayPoints: 150,
    streakDays: 5,
    contributionCount: 25,
    level: 'Scout' as UserLevel,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a new user (Baguhan level)
 */
export function createNewUser(overrides: Partial<User> = {}): User {
  return createMockUser({
    alayPoints: 50,
    streakDays: 1,
    contributionCount: 3,
    level: 'Baguhan',
    ...overrides,
  });
}

/**
 * Create a Champion level user
 */
export function createChampionUser(overrides: Partial<User> = {}): User {
  return createMockUser({
    alayPoints: 750,
    streakDays: 15,
    contributionCount: 100,
    level: 'Champion',
    ...overrides,
  });
}

/**
 * Create a Legend level user
 */
export function createLegendUser(overrides: Partial<User> = {}): User {
  return createMockUser({
    displayName: 'Kuya Juan',
    alayPoints: 3500,
    streakDays: 45,
    contributionCount: 500,
    level: 'Legend',
    ...overrides,
  });
}

/**
 * Create mock user stats
 */
export function createMockUserStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    totalReports: 150,
    verifiedReports: 140,
    accuracyRate: 0.93,
    currentStreak: 5,
    longestStreak: 12,
    rankInCity: 42,
    totalUsers: 1500,
    ...overrides,
  };
}

/**
 * Create a mock user badge
 */
export function createMockBadge(overrides: Partial<UserBadge> = {}): UserBadge {
  const id = `badge-${idCounter++}`;
  return {
    id,
    name: 'First Report',
    description: 'Submitted your first stock report',
    icon: '🎉',
    earnedAt: new Date().toISOString(),
    rarity: 'common',
    ...overrides,
  };
}

/**
 * Create common badges
 */
export function createCommonBadges(): UserBadge[] {
  return [
    createMockBadge({
      name: 'First Report',
      description: 'Submitted your first stock report',
      icon: '🎉',
      rarity: 'common',
    }),
    createMockBadge({
      name: 'Week Warrior',
      description: '7-day contribution streak',
      icon: '🔥',
      rarity: 'rare',
    }),
    createMockBadge({
      name: 'Medicine Hunter',
      description: 'Reported 50 different medicines',
      icon: '💊',
      rarity: 'epic',
    }),
    createMockBadge({
      name: 'Community Legend',
      description: 'Reached Legend level',
      icon: '👑',
      rarity: 'legendary',
    }),
  ];
}

/**
 * Create a mock Alay contribution
 */
export function createMockContribution(
  overrides: Partial<AlayContribution> = {}
): AlayContribution {
  const id = `contribution-${idCounter++}`;
  return {
    id,
    userId: 'user-1',
    pharmacyId: 'pharmacy-1',
    medicineId: 'medicine-1',
    type: 'stock_report',
    pointsEarned: 10,
    createdAt: new Date().toISOString(),
    status: 'verified',
    ...overrides,
  };
}

/**
 * Reset the ID counter (useful between tests)
 */
export function resetUserIdCounter() {
  idCounter = 1;
}
