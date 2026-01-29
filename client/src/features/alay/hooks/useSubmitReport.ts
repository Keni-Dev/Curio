/**
 * useSubmitReport Hook
 *
 * TanStack Query mutation for submitting stock reports.
 * Handles offline queueing when network is unavailable.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAlayStore } from '@/stores/useAlayStore';
import { triggerPointsAnimation } from '@/stores/usePointsDisplayStore';
import { pharmacyKeys } from '@/features/pharmacy/hooks/useNearbyPharmacies';
import { ALAY_POINTS } from '../constants';
import type { StockStatusEnum } from '@/types/database';

// =============================================================================
// TYPES
// =============================================================================

interface SubmitReportInput {
  pharmacyId: string;
  medicineId: string;
  status: StockStatusEnum;
  notes?: string;
  userLocation: { lat: number; lng: number } | null;
  distanceFromPharmacy: number | null;
}

interface SubmitReportResult {
  success: boolean;
  reportId: string | null;
  pointsEarned: number;
  bonusPoints: number;
  newStreak: number;
  isFirstOfDay: boolean;
  error?: string;
}

// =============================================================================
// API FUNCTION
// =============================================================================

async function submitStockReport(input: SubmitReportInput): Promise<SubmitReportResult> {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('You must be logged in to submit a report');
  }

  // Build the insert payload
  const reportPayload = {
    pharmacy_id: input.pharmacyId,
    medicine_id: input.medicineId,
    reported_by: user.id,
    status: input.status,
    notes: input.notes || null,
    reporter_location: input.userLocation
      ? `POINT(${input.userLocation.lng} ${input.userLocation.lat})`
      : null,
    distance_from_pharmacy: input.distanceFromPharmacy,
  };

  // Insert the report
  const { data: report, error: insertError } = await supabase
    .from('inventory_reports')
    .insert(reportPayload)
    .select('id')
    .single();

  if (insertError) {
    // Check for duplicate report
    if (insertError.code === '23505') {
      throw new Error('You recently reported this medicine at this pharmacy');
    }
    throw new Error(insertError.message || 'Failed to submit report');
  }

  // Get user profile to calculate bonuses
  const { data: profile } = await supabase
    .from('profiles')
    .select('alay_points, streak_days, last_contribution_at')
    .eq('id', user.id)
    .single();

  // Calculate points
  const basePoints = ALAY_POINTS.STOCK_REPORT;
  let bonusPoints = 0;
  let isFirstOfDay = false;

  if (profile) {
    // Check if first report of day
    const lastContribution = profile.last_contribution_at
      ? new Date(profile.last_contribution_at)
      : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastContribution || lastContribution < today) {
      bonusPoints += ALAY_POINTS.FIRST_REPORT_OF_DAY;
      isFirstOfDay = true;
    }

    // Calculate streak bonus
    const streakMultiplier = Math.min(
      profile.streak_days * ALAY_POINTS.STREAK_MULTIPLIER,
      ALAY_POINTS.MAX_STREAK_BONUS
    );
    bonusPoints += Math.floor(basePoints * streakMultiplier);
  }

  const totalPoints = basePoints + bonusPoints;

  // Update user profile (trigger will also update, but we do it for immediate feedback)
  const { data: updatedProfile } = await supabase
    .from('profiles')
    .update({
      alay_points: (profile?.alay_points || 0) + totalPoints,
      last_contribution_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select('streak_days')
    .single();

  return {
    success: true,
    reportId: report?.id || null,
    pointsEarned: totalPoints,
    bonusPoints,
    newStreak: updatedProfile?.streak_days || profile?.streak_days || 1,
    isFirstOfDay,
  };
}

// =============================================================================
// HOOK
// =============================================================================

interface UseSubmitReportOptions {
  onSuccess?: (result: SubmitReportResult) => void;
  onError?: (error: Error) => void;
}

export function useSubmitReport(options: UseSubmitReportOptions = {}) {
  const queryClient = useQueryClient();
  const {
    queueReport,
    markReportSuccess,
    setLastError,
    setStreak,
    incrementTodayCount,
    reportDraft,
  } = useAlayStore();

  return useMutation({
    mutationFn: async (input: SubmitReportInput) => {
      // Check if online
      if (!navigator.onLine) {
        // Queue for later
        if (reportDraft) {
          queueReport(
            reportDraft,
            input.userLocation,
            input.distanceFromPharmacy
          );
        }
        
        // Return a "queued" result
        return {
          success: true,
          reportId: null,
          pointsEarned: ALAY_POINTS.STOCK_REPORT,
          bonusPoints: 0,
          newStreak: 0,
          isFirstOfDay: false,
          queued: true,
        } as SubmitReportResult & { queued?: boolean };
      }

      return submitStockReport(input);
    },

    onSuccess: (result) => {
      // Update local state
      markReportSuccess();
      setStreak(result.newStreak);
      incrementTodayCount();
      setLastError(null);

      // Trigger points animation
      const basePoints = ALAY_POINTS.STOCK_REPORT;
      const firstOfDayBonus = result.isFirstOfDay ? ALAY_POINTS.FIRST_REPORT_OF_DAY : 0;
      const streakBonus = result.bonusPoints - firstOfDayBonus;

      triggerPointsAnimation({
        points: basePoints,
        isFirstOfDay: result.isFirstOfDay,
        streakBonus: Math.max(streakBonus, 0),
        currentStreak: result.newStreak,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.all });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['alay-profile'] });

      options.onSuccess?.(result);
    },

    onError: (error: Error) => {
      setLastError(error.message);
      options.onError?.(error);
    },
  });
}

// =============================================================================
// TYPES EXPORT
// =============================================================================

export type { SubmitReportInput, SubmitReportResult };
