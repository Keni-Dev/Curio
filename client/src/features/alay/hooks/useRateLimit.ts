/**
 * useRateLimit Hook
 *
 * Checks rate limiting status for stock report submissions.
 * Queries the database to check cooldown and daily limit.
 *
 * Features:
 * - 30-second cooldown between reports
 * - 50 reports per day maximum
 * - Auto-refresh when cooldown expires
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MAX_REPORTS_PER_DAY } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface RateLimitStatus {
  /** Whether user can submit a report */
  canReport: boolean;
  /** Reason for rate limit if blocked */
  reason: 'cooldown' | 'daily_limit_reached' | null;
  /** Timestamp when cooldown ends */
  cooldownEndsAt: Date | null;
  /** Seconds remaining in cooldown */
  cooldownRemaining: number;
  /** Number of reports submitted today */
  reportsToday: number;
  /** Maximum reports allowed per day */
  maxReportsToday: number;
  /** Reports remaining today */
  reportsRemaining: number;
}

interface RateLimitRpcResponse {
  can_report: boolean;
  reason: string | null;
  cooldown_ends_at: string | null;
  reports_today: number;
  max_reports_today: number;
}

// =============================================================================
// QUERY KEY
// =============================================================================

export const rateLimitKeys = {
  all: ['rateLimit'] as const,
  status: (userId: string) => [...rateLimitKeys.all, 'status', userId] as const,
};

// =============================================================================
// API FUNCTION
// =============================================================================

async function fetchRateLimitStatus(userId: string): Promise<RateLimitStatus> {
  // Call the database function using raw RPC
  // Note: The function may not exist until migration is run
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.rpc('check_rate_limit' as any, {
    p_user_id: userId,
  });

  if (error) {
    console.error('Rate limit check error:', error);
    // Return permissive defaults on error (don't block due to DB issues)
    return {
      canReport: true,
      reason: null,
      cooldownEndsAt: null,
      cooldownRemaining: 0,
      reportsToday: 0,
      maxReportsToday: MAX_REPORTS_PER_DAY,
      reportsRemaining: MAX_REPORTS_PER_DAY,
    };
  }

  // Type assertion for the RPC response
  const rpcData = data as unknown as RateLimitRpcResponse;

  const now = new Date();
  const cooldownEndsAt = rpcData.cooldown_ends_at
    ? new Date(rpcData.cooldown_ends_at)
    : null;

  const cooldownRemaining = cooldownEndsAt
    ? Math.max(0, Math.ceil((cooldownEndsAt.getTime() - now.getTime()) / 1000))
    : 0;

  return {
    canReport: rpcData.can_report,
    reason: (rpcData.reason as RateLimitStatus['reason']) || null,
    cooldownEndsAt,
    cooldownRemaining,
    reportsToday: rpcData.reports_today,
    maxReportsToday: rpcData.max_reports_today,
    reportsRemaining: Math.max(0, rpcData.max_reports_today - rpcData.reports_today),
  };
}

// =============================================================================
// HOOK
// =============================================================================

interface UseRateLimitOptions {
  /** Enable the query (requires authenticated user) */
  enabled?: boolean;
  /** Custom refetch interval in ms */
  refetchInterval?: number;
}

/**
 * Hook to check rate limiting status for stock reports.
 *
 * @example
 * ```tsx
 * const { data: rateLimit, isLoading } = useRateLimit();
 *
 * if (!rateLimit?.canReport) {
 *   return <RateLimitDisplay rateLimit={rateLimit} />;
 * }
 * ```
 */
export function useRateLimit(options: UseRateLimitOptions = {}) {
  const { enabled = true, refetchInterval } = options;

  // Get current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const userId = session?.user?.id;

  return useQuery({
    queryKey: rateLimitKeys.status(userId ?? ''),
    queryFn: () => fetchRateLimitStatus(userId!),
    enabled: enabled && !!userId,
    staleTime: 10 * 1000, // 10 seconds - check frequently
    gcTime: 60 * 1000, // 1 minute cache
    refetchInterval: refetchInterval ?? ((query) => {
      // Auto-refetch when cooldown is active
      const data = query.state.data;
      if (data?.cooldownRemaining && data.cooldownRemaining > 0) {
        // Refetch every second during cooldown
        return 1000;
      }
      // Otherwise refetch every minute
      return 60 * 1000;
    }),
    refetchOnWindowFocus: true,
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format cooldown time as human-readable string
 */
export function formatCooldown(seconds: number): string {
  if (seconds <= 0) return 'Ready';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Calculate percentage of daily limit used
 */
export function getDailyLimitPercentage(status: RateLimitStatus): number {
  return Math.round((status.reportsToday / status.maxReportsToday) * 100);
}
