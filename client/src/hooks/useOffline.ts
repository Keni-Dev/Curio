/**
 * useOffline Hook
 * 
 * Tracks online/offline status and manages pending sync operations.
 * Integrates with IndexedDB for report persistence and provides
 * background sync functionality.
 */

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import {
  getPendingReports,
  removePendingReport,
  incrementReportRetry,
  type PendingReport,
} from '~lib/offlineDb';
import { useAlayStore } from '~stores/useAlayStore';

// ============================================================================
// Types
// ============================================================================

interface OfflineState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncError: string | null;
}

interface UseOfflineReturn extends OfflineState {
  syncPendingReports: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_RETRY_ATTEMPTS = 3;

// ============================================================================
// Online Status Store (for useSyncExternalStore)
// ============================================================================

function subscribeToOnlineStatus(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  // SSR: assume online
  return true;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useOffline(): UseOfflineReturn {
  // Use useSyncExternalStore for reliable online/offline detection
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineSnapshot,
    getServerSnapshot
  );

  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Access Zustand store for pending reports (UI state)
  const zustandPendingReports = useAlayStore((state) => state.pendingReports);
  const removeFromZustandQueue = useAlayStore((state) => state.removeFromQueue);

  // Refresh pending count from both IndexedDB and Zustand
  const refreshPendingCount = useCallback(async () => {
    try {
      const idbReports = await getPendingReports();
      const totalCount = idbReports.length + zustandPendingReports.length;
      setPendingCount(totalCount);
    } catch (error) {
      console.error('[useOffline] Failed to get pending count:', error);
      // Fallback to Zustand count only
      setPendingCount(zustandPendingReports.length);
    }
  }, [zustandPendingReports.length]);

  // Sync pending reports when online
  const syncPendingReports = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Get reports from IndexedDB
      const idbReports = await getPendingReports();
      
      for (const report of idbReports) {
        if (report.retry_count >= MAX_RETRY_ATTEMPTS) {
          console.warn('[useOffline] Report exceeded max retries, removing:', report.id);
          await removePendingReport(report.id);
          continue;
        }

        try {
          await syncSingleReport(report);
          await removePendingReport(report.id);
        } catch (error) {
          console.error('[useOffline] Failed to sync report:', report.id, error);
          await incrementReportRetry(report.id);
        }
      }

      // Also sync Zustand pending reports (legacy support)
      for (const zustandReport of zustandPendingReports) {
        if (zustandReport.retryCount >= MAX_RETRY_ATTEMPTS) {
          removeFromZustandQueue(zustandReport.id);
          continue;
        }

        try {
          await syncZustandReport(zustandReport);
          removeFromZustandQueue(zustandReport.id);
        } catch (error) {
          console.error('[useOffline] Failed to sync Zustand report:', zustandReport.id, error);
        }
      }

      setLastSyncTime(Date.now());
      await refreshPendingCount();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      setSyncError(message);
      console.error('[useOffline] Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, zustandPendingReports, removeFromZustandQueue, refreshPendingCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncPendingReports();
    }
  }, [isOnline, pendingCount, syncPendingReports]);

  // Initial count load
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Listen for visibility change to sync when app becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOnline && pendingCount > 0) {
        syncPendingReports();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOnline, pendingCount, syncPendingReports]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncError,
    syncPendingReports,
    refreshPendingCount,
  };
}

// ============================================================================
// Sync Helpers
// ============================================================================

async function syncSingleReport(report: PendingReport): Promise<void> {
  // Import Supabase dynamically to avoid circular deps
  const { supabase } = await import('~lib/supabase');

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('User not authenticated - cannot sync report');
  }

  // Build the insert payload matching inventory_reports table
  const reportPayload = {
    pharmacy_id: report.pharmacy_id,
    medicine_id: report.medicine_id,
    reported_by: user.id,
    status: report.stock_status,
    notes: report.notes || null,
    reported_at: new Date(report.created_at).toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('inventory_reports') as any)
    .insert(reportPayload)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
}

async function syncZustandReport(report: {
  id: string;
  draft: {
    pharmacyId: string;
    medicineId: string | null;
    status: string | null;
    notes: string;
  };
  createdAt: number;
}): Promise<void> {
  if (!report.draft.medicineId || !report.draft.status) {
    throw new Error('Invalid report: missing medicine or status');
  }

  const { supabase } = await import('~lib/supabase');

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('User not authenticated - cannot sync report');
  }

  // Build the insert payload matching inventory_reports table
  const reportPayload = {
    pharmacy_id: report.draft.pharmacyId,
    medicine_id: report.draft.medicineId,
    reported_by: user.id,
    status: report.draft.status,
    notes: report.draft.notes || null,
    reported_at: new Date(report.createdAt).toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('inventory_reports') as any)
    .insert(reportPayload)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
}

// ============================================================================
// Simple Hook for Just Online Status
// ============================================================================

export function useIsOnline(): boolean {
  return useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineSnapshot,
    getServerSnapshot
  );
}
