/**
 * useAlayPoints Hook
 *
 * TanStack Query hook for fetching user's Alay profile data:
 * points, level, streak, contributions, and badges.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { UserLevel, UserBadge } from '@/types/user';
import { LEVEL_THRESHOLDS } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

interface AlayProfile {
  /** Current Alay Points */
  alayPoints: number;
  /** Current streak in days */
  streakDays: number;
  /** Total contribution count */
  contributionCount: number;
  /** User level based on points */
  level: UserLevel;
  /** Last contribution timestamp */
  lastContributionAt: string | null;
  /** Helpful votes received */
  helpfulVotes: number;
  /** Earned badges */
  badges: UserBadge[];
  /** User's rank position */
  rankPosition: number | null;
  /** User's rank percentile (e.g., "Top 5%") */
  rankPercentile: string | null;
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

function calculateRankPercentile(position: number, total: number): string {
  if (total === 0) return 'N/A';
  const percentile = (position / total) * 100;
  if (percentile <= 1) return 'Top 1%';
  if (percentile <= 5) return 'Top 5%';
  if (percentile <= 10) return 'Top 10%';
  if (percentile <= 25) return 'Top 25%';
  if (percentile <= 50) return 'Top 50%';
  return `Top ${Math.ceil(percentile)}%`;
}

// =============================================================================
// QUERY KEYS
// =============================================================================

export const alayProfileKeys = {
  all: ['alay-profile'] as const,
  current: () => [...alayProfileKeys.all, 'current'] as const,
  user: (userId: string) => [...alayProfileKeys.all, 'user', userId] as const,
};

// =============================================================================
// FETCH FUNCTION
// =============================================================================

async function fetchAlayProfile(): Promise<AlayProfile | null> {
  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch profile data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error: profileError } = await (supabase as any)
    .from('profiles')
    .select(
      `
      alay_points,
      streak_days,
      contribution_count,
      last_contribution_at,
      level
    `
    )
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError);
    return null;
  }

  // Fetch helpful votes count (reports that were verified/upvoted)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: helpfulVotes } = await (supabase as any)
    .from('inventory_reports')
    .select('*', { count: 'exact', head: true })
    .eq('reported_by', user.id)
    .eq('status', 'in_stock');

  // Fetch user rank position
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rankData } = await (supabase as any)
    .from('profiles')
    .select('id')
    .order('alay_points', { ascending: false });

  let rankPosition: number | null = null;
  let rankPercentile: string | null = null;

  if (rankData) {
    const position = rankData.findIndex((p: any) => p.id === user.id) + 1;
    if (position > 0) {
      rankPosition = position;
      rankPercentile = calculateRankPercentile(position, rankData.length);
    }
  }

  // TODO: Fetch badges from a badges table
  const badges: UserBadge[] = [];

  return {
    alayPoints: profile.alay_points ?? 0,
    streakDays: profile.streak_days ?? 0,
    contributionCount: profile.contribution_count ?? 0,
    level: calculateLevel(profile.alay_points ?? 0),
    lastContributionAt: profile.last_contribution_at,
    helpfulVotes: helpfulVotes ?? 0,
    badges,
    rankPosition,
    rankPercentile,
  };
}

// =============================================================================
// HOOK
// =============================================================================

interface UseAlayPointsOptions {
  /** Enable/disable the query */
  enabled?: boolean;
}

export function useAlayPoints(options: UseAlayPointsOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: alayProfileKeys.current(),
    queryFn: fetchAlayProfile,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
}

// =============================================================================
// DERIVED HOOKS
// =============================================================================

/**
 * Hook to check if user is authenticated and has profile data
 */
export function useHasAlayProfile() {
  const { data, isLoading } = useAlayPoints();
  return {
    hasProfile: !!data,
    isLoading,
  };
}

/**
 * Hook to get user's current level info
 */
export function useUserLevel() {
  const { data } = useAlayPoints();

  if (!data) {
    return {
      level: 'Baguhan' as UserLevel,
      points: 0,
      progress: 0,
      pointsToNext: LEVEL_THRESHOLDS.Scout,
    };
  }

  const currentThreshold = LEVEL_THRESHOLDS[data.level];
  const levels: UserLevel[] = ['Baguhan', 'Scout', 'Champion', 'Legend'];
  const currentIndex = levels.indexOf(data.level);
  const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel] : data.alayPoints;

  const progress =
    nextLevel
      ? ((data.alayPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      : 100;

  const pointsToNext = nextLevel ? nextThreshold - data.alayPoints : 0;

  return {
    level: data.level,
    points: data.alayPoints,
    progress: Math.min(progress, 100),
    pointsToNext: Math.max(pointsToNext, 0),
    nextLevel,
  };
}

export default useAlayPoints;
