/**
 * useModeration Hook
 *
 * Admin hook for managing the moderation queue.
 * Only accessible to Legend-level users.
 *
 * Note: This hook uses type assertions for tables/views/functions
 * that are created by the anti-abuse migration (008_anti_abuse_system.sql).
 * Once migration is run and Supabase types are regenerated, these can be removed.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  ModerationQueueItem,
  ModerationAction,
  ModerationResult,
  ModerationStats,
  ModerationStatus,
  AbuseFlagType,
} from '../types/moderation';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const moderationKeys = {
  all: ['moderation'] as const,
  queue: () => [...moderationKeys.all, 'queue'] as const,
  stats: () => [...moderationKeys.all, 'stats'] as const,
  item: (id: string) => [...moderationKeys.all, 'item', id] as const,
};

// =============================================================================
// TYPES FOR RAW RESPONSES
// =============================================================================

interface RawModerationQueueItem {
  moderation_id: string;
  moderation_status: ModerationStatus;
  flag_reason: string;
  flagged_at: string;
  report_id: string;
  stock_status: string;
  report_created_at: string;
  helpful_count: number;
  not_helpful_count: number;
  distance_from_pharmacy: number | null;
  pharmacy_name: string;
  medicine_name: string;
  brand_name: string | null;
  reporter_name: string | null;
  reporter_trust: number;
  reporter_level: string;
  reporter_points: number;
  reporter_pending_flags: number;
}

// =============================================================================
// FETCH MODERATION QUEUE
// =============================================================================

async function fetchModerationQueue(): Promise<ModerationQueueItem[]> {
  // Use raw SQL query since the view might not be in types yet
  const { data, error } = await supabase
    .from('admin_moderation_queue' as any)
    .select('*')
    .order('flagged_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching moderation queue:', error);
    // Return empty array if view doesn't exist yet
    return [];
  }

  if (!data) return [];

  // Transform snake_case to camelCase
  return (data as unknown as RawModerationQueueItem[]).map((item) => ({
    moderationId: item.moderation_id,
    moderationStatus: item.moderation_status,
    flagReason: item.flag_reason,
    flaggedAt: item.flagged_at,
    reportId: item.report_id,
    stockStatus: item.stock_status as any,
    reportCreatedAt: item.report_created_at,
    helpfulCount: item.helpful_count,
    notHelpfulCount: item.not_helpful_count,
    distanceFromPharmacy: item.distance_from_pharmacy,
    pharmacyName: item.pharmacy_name,
    medicineName: item.medicine_name,
    brandName: item.brand_name,
    reporterName: item.reporter_name,
    reporterTrust: item.reporter_trust,
    reporterLevel: item.reporter_level as any,
    reporterPoints: item.reporter_points,
    reporterPendingFlags: item.reporter_pending_flags,
  }));
}

// =============================================================================
// FETCH MODERATION STATS
// =============================================================================

async function fetchModerationStats(): Promise<ModerationStats> {
  try {
    // Get pending count
    const { count: pendingCount } = await supabase
      .from('report_moderation' as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get resolved today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: resolvedToday } = await supabase
      .from('report_moderation' as any)
      .select('*', { count: 'exact', head: true })
      .neq('status', 'pending')
      .gte('moderated_at', today.toISOString());

    // Get flagged users count
    const { data: flaggedUsers } = await supabase
      .from('abuse_flags' as any)
      .select('user_id')
      .is('resolved_at', null);

    const uniqueFlaggedUsers = new Set(
      (flaggedUsers as any[] | null)?.map((f: any) => f.user_id).filter(Boolean) ?? []
    );

    // Get top flag types
    const { data: flagTypes } = await supabase
      .from('abuse_flags' as any)
      .select('flag_type')
      .is('resolved_at', null);

    const typeCounts: Record<string, number> = {};
    (flagTypes as any[] | null)?.forEach((f: any) => {
      typeCounts[f.flag_type] = (typeCounts[f.flag_type] || 0) + 1;
    });

    const topFlagTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type: type as AbuseFlagType, count }));

    return {
      pendingCount: pendingCount || 0,
      resolvedToday: resolvedToday || 0,
      flaggedUsersCount: uniqueFlaggedUsers.size,
      topFlagTypes,
    };
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    // Return zeros if tables don't exist yet
    return {
      pendingCount: 0,
      resolvedToday: 0,
      flaggedUsersCount: 0,
      topFlagTypes: [],
    };
  }
}

// =============================================================================
// MODERATE REPORT
// =============================================================================

async function moderateReport(action: ModerationAction): Promise<ModerationResult> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Must be logged in to moderate');
  }

  // Map action to status
  const statusMap: Record<string, ModerationStatus> = {
    approve: 'approved',
    reject: 'rejected',
    escalate: 'escalated',
  };

  const newStatus = statusMap[action.action] || 'pending';

  // Update moderation record
  const { error: updateError } = await supabase
    .from('report_moderation' as any)
    .update({
      status: newStatus,
      moderator_id: user.id,
      action_taken: action.reason || action.action,
      moderated_at: new Date().toISOString(),
    } as any)
    .eq('report_id', action.reportId);

  if (updateError) {
    throw new Error('Failed to update moderation status');
  }

  // If rejecting, optionally adjust trust score
  if (action.action === 'reject' && action.adjustTrustScore) {
    // Get the reporter ID
    const { data: report } = await supabase
      .from('inventory_reports')
      .select('reported_by')
      .eq('id', action.reportId)
      .single();

    if (report?.reported_by) {
      await supabase.rpc('update_user_trust_score' as any, {
        p_user_id: report.reported_by,
        p_report_id: action.reportId,
        p_is_accurate: false,
      });
    }
  }

  // Resolve related abuse flags
  const { error: flagError } = await supabase
    .from('abuse_flags' as any)
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_notes: `Moderation action: ${action.action}`,
    } as any)
    .eq('report_id', action.reportId)
    .is('resolved_at', null);

  if (flagError) {
    console.warn('Failed to resolve abuse flags:', flagError);
  }

  return {
    success: true,
    message: `Report ${action.action}ed successfully`,
    affectedReportId: action.reportId,
    newStatus,
  };
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to fetch the moderation queue
 */
export function useModerationQueue() {
  return useQuery({
    queryKey: moderationKeys.queue(),
    queryFn: fetchModerationQueue,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch moderation stats
 */
export function useModerationStats() {
  return useQuery({
    queryKey: moderationKeys.stats(),
    queryFn: fetchModerationStats,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to moderate a report
 */
export function useModerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moderateReport,
    onSuccess: () => {
      // Invalidate moderation queries
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
    },
  });
}

// =============================================================================
// ADMIN CHECK HOOK
// =============================================================================

/**
 * Check if current user is an admin (Legend level)
 */
export function useIsAdmin() {
  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('level')
        .eq('id', user.id)
        .single();

      return profile?.level === 'Legend';
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
