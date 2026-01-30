/**
 * useLeaderboard Hook
 *
 * TanStack Query hook for fetching leaderboard data.
 * Supports different time ranges and sorting options.
 * Supports demo mode for offline presentations.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { isDemoModeActive } from '@/stores/useDevToolsStore';
import { demoGetLeaderboard, type DemoProfile } from '@/lib/demo';
import type { LeaderboardEntry, UserLevel } from '@/types/user';
import { LEVEL_THRESHOLDS } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

type LeaderboardTimeRange = 'all-time' | 'monthly' | 'weekly' | 'daily';

interface LeaderboardOptions {
  /** Time range for filtering */
  timeRange?: LeaderboardTimeRange;
  /** Maximum number of entries to fetch */
  limit?: number;
  /** City/area filter */
  city?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function calculateLevel(points: number): UserLevel {
  if (points >= LEVEL_THRESHOLDS.Legend) return 'Legend';
  if (points >= LEVEL_THRESHOLDS.Champion) return 'Champion';
  if (points >= LEVEL_THRESHOLDS.Scout) return 'Scout';
  return 'Baguhan';
}

// Time range filter helper - reserved for future use with contributions table
// function getTimeRangeFilter(timeRange: LeaderboardTimeRange): Date | null {
//   const now = new Date();
//   switch (timeRange) {
//     case 'daily': now.setHours(0, 0, 0, 0); return now;
//     case 'weekly': now.setDate(now.getDate() - 7); return now;
//     case 'monthly': now.setMonth(now.getMonth() - 1); return now;
//     case 'all-time':
//     default: return null;
//   }
// }

// =============================================================================
// QUERY KEYS
// =============================================================================

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  list: (options: LeaderboardOptions) =>
    [...leaderboardKeys.all, 'list', options] as const,
};

// =============================================================================
// FETCH FUNCTION
// =============================================================================

async function fetchLeaderboard(
  options: LeaderboardOptions
): Promise<LeaderboardEntry[]> {
  // Note: timeRange and city are reserved for future filtering
  const { timeRange: _timeRange = 'all-time', limit = 10, city: _city } = options;
  void _timeRange; // Reserved for future contributions table filtering
  void _city; // Reserved for future city filtering

  // Check if demo mode is active
  if (isDemoModeActive()) {
    console.log('[fetchLeaderboard] Demo mode active, using mock data');
    const demoData = await demoGetLeaderboard(limit);
    
    return demoData.map((profile: DemoProfile, index: number) => ({
      rank: index + 1,
      userId: profile.id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url ?? undefined,
      alayPoints: profile.alay_points,
      level: profile.level,
      contributionCount: profile.contribution_count,
    }));
  }

  // Build query
  const query = (supabase as any)
    .from('profiles')
    .select(
      `
      id,
      display_name,
      avatar_url,
      alay_points,
      contribution_count
    `
    )
    .order('alay_points', { ascending: false })
    .limit(limit);

  // TODO: Add time range filtering when we have a separate contributions table
  // const filterDate = getTimeRangeFilter(timeRange);
  // if (filterDate) {
  //   query = query.gte('last_contribution_at', filterDate.toISOString());
  // }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error('Failed to fetch leaderboard');
  }

  // Transform to LeaderboardEntry format
  return (data || []).map((profile: any, index: number) => ({
    rank: index + 1,
    userId: profile.id,
    displayName: profile.display_name || `User ${profile.id.slice(0, 6)}`,
    avatarUrl: profile.avatar_url || undefined,
    alayPoints: profile.alay_points ?? 0,
    level: calculateLevel(profile.alay_points ?? 0),
    contributionCount: profile.contribution_count ?? 0,
  }));
}

// =============================================================================
// HOOK
// =============================================================================

export function useLeaderboard(options: LeaderboardOptions = {}) {
  const { timeRange = 'all-time', limit = 10, city } = options;

  return useQuery({
    queryKey: leaderboardKeys.list({ timeRange, limit, city }),
    queryFn: () => fetchLeaderboard({ timeRange, limit, city }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// =============================================================================
// DERIVED HOOKS
// =============================================================================

/**
 * Hook for the top contributors widget (compact view)
 */
export function useTopContributors(limit = 5) {
  return useLeaderboard({ timeRange: 'all-time', limit });
}

/**
 * Hook for weekly leaderboard
 */
export function useWeeklyLeaderboard(limit = 10) {
  return useLeaderboard({ timeRange: 'weekly', limit });
}

export default useLeaderboard;
