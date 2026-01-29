/**
 * usePendingReports Hook
 *
 * Syncs pending offline reports when connection is restored.
 * Registers online/offline event listeners for automatic sync.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAlayStore, selectPendingReports, selectHasPendingReports } from '@/stores/useAlayStore';
import { pharmacyKeys } from '@/features/pharmacy/hooks/useNearbyPharmacies';
import { useToast } from '@/hooks/useToast';
import { MAX_PENDING_QUEUE } from '../constants';

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_RETRY_COUNT = 3;

// =============================================================================
// HOOK
// =============================================================================

export function usePendingReports() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const pendingReports = useAlayStore(selectPendingReports);
  const hasPending = useAlayStore(selectHasPendingReports);
  const { removeFromQueue, incrementRetryCount, clearQueue } = useAlayStore();

  const isSyncing = useRef(false);

  // Mutation for syncing a single report
  const syncMutation = useMutation({
    mutationFn: async (report: typeof pendingReports[number]) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { draft, userLocation, distanceFromPharmacy } = report;

      if (!draft.medicineId || !draft.status) {
        throw new Error('Invalid report data');
      }

      const { error } = await supabase
        .from('inventory_reports')
        .insert({
          pharmacy_id: draft.pharmacyId,
          medicine_id: draft.medicineId,
          reported_by: user.id,
          status: draft.status,
          notes: draft.notes || null,
          reporter_location: userLocation
            ? `POINT(${userLocation.lng} ${userLocation.lat})`
            : null,
          distance_from_pharmacy: distanceFromPharmacy,
        });

      if (error) {
        throw error;
      }

      return report.id;
    },
  });

  // Sync all pending reports
  const syncAllPending = useCallback(async () => {
    if (!navigator.onLine || isSyncing.current || pendingReports.length === 0) {
      return;
    }

    isSyncing.current = true;

    let successCount = 0;
    let failCount = 0;

    for (const report of pendingReports) {
      // Skip reports that have exceeded retry limit
      if (report.retryCount >= MAX_RETRY_COUNT) {
        removeFromQueue(report.id);
        failCount++;
        continue;
      }

      try {
        await syncMutation.mutateAsync(report);
        removeFromQueue(report.id);
        successCount++;
      } catch {
        incrementRetryCount(report.id);
        failCount++;
      }
    }

    isSyncing.current = false;

    // Invalidate queries after sync
    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.all });
      queryClient.invalidateQueries({ queryKey: ['stock'] });

      showToast(
        `${successCount} pending report${successCount > 1 ? 's' : ''} submitted.`,
        { variant: 'success' }
      );
    }

    if (failCount > 0 && successCount === 0) {
      showToast(
        'Some reports could not be submitted. They will be retried later.',
        { variant: 'error' }
      );
    }
  }, [pendingReports, removeFromQueue, incrementRetryCount, syncMutation, queryClient, showToast]);

  // Listen for online event
  useEffect(() => {
    const handleOnline = () => {
      // Delay slightly to ensure connection is stable
      setTimeout(syncAllPending, 1000);
    };

    window.addEventListener('online', handleOnline);

    // Also try to sync on mount if online
    if (navigator.onLine && hasPending) {
      syncAllPending();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncAllPending, hasPending]);

  return {
    pendingCount: pendingReports.length,
    hasPending,
    isSyncing: syncMutation.isPending,
    syncAllPending,
    clearQueue,
    maxQueueSize: MAX_PENDING_QUEUE,
  };
}

// =============================================================================
// ONLINE STATUS HOOK
// =============================================================================

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
