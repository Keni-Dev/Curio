/**
 * useDuplicateCheck Hook
 *
 * Checks for existing reports by the same user for the same
 * pharmacy/medicine combination within 24 hours.
 *
 * Returns existing report info to allow user to update instead of duplicate.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { StockStatusEnum } from '@/types/database';

// =============================================================================
// TYPES
// =============================================================================

export interface ExistingReport {
  id: string;
  status: StockStatusEnum;
  createdAt: Date;
  expiresAt: Date;
  hoursAgo: number;
}

export interface DuplicateCheckResult {
  /** Whether a duplicate report exists */
  hasDuplicate: boolean;
  /** The existing report if found */
  existingReport: ExistingReport | null;
  /** Whether the existing report is still valid (not expired) */
  isStillValid: boolean;
}

interface DuplicateRpcResponse {
  has_duplicate: boolean;
  existing_report: {
    id: string;
    status: StockStatusEnum;
    created_at: string;
    expires_at: string;
  } | null;
}

// =============================================================================
// QUERY KEY
// =============================================================================

export const duplicateCheckKeys = {
  all: ['duplicateCheck'] as const,
  check: (userId: string, pharmacyId: string, medicineId: string) =>
    [...duplicateCheckKeys.all, userId, pharmacyId, medicineId] as const,
};

// =============================================================================
// API FUNCTION
// =============================================================================

async function checkForDuplicate(
  userId: string,
  pharmacyId: string,
  medicineId: string
): Promise<DuplicateCheckResult> {
  // Call the database function using raw RPC
  // Note: The function may not exist until migration is run
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('check_duplicate_report', {
    p_user_id: userId,
    p_pharmacy_id: pharmacyId,
    p_medicine_id: medicineId,
  });

  if (error) {
    console.error('Duplicate check error:', error);
    // Return no duplicate on error (allow submission)
    return {
      hasDuplicate: false,
      existingReport: null,
      isStillValid: false,
    };
  }

  // Type assertion for the RPC response
  const rpcData = data as unknown as DuplicateRpcResponse;

  if (!rpcData.has_duplicate || !rpcData.existing_report) {
    return {
      hasDuplicate: false,
      existingReport: null,
      isStillValid: false,
    };
  }

  const existing = rpcData.existing_report;
  const createdAt = new Date(existing.created_at);
  const expiresAt = new Date(existing.expires_at);
  const now = new Date();

  return {
    hasDuplicate: true,
    existingReport: {
      id: existing.id,
      status: existing.status,
      createdAt,
      expiresAt,
      hoursAgo: Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)),
    },
    isStillValid: expiresAt > now,
  };
}

// =============================================================================
// HOOK
// =============================================================================

interface UseDuplicateCheckOptions {
  /** Pharmacy ID to check */
  pharmacyId: string | null;
  /** Medicine ID to check */
  medicineId: string | null;
  /** Enable the query */
  enabled?: boolean;
}

/**
 * Hook to check for duplicate reports before submission.
 *
 * @example
 * ```tsx
 * const { data: duplicateCheck } = useDuplicateCheck({
 *   pharmacyId: selectedPharmacy,
 *   medicineId: selectedMedicine,
 * });
 *
 * if (duplicateCheck?.hasDuplicate) {
 *   return <DuplicateWarning existingReport={duplicateCheck.existingReport} />;
 * }
 * ```
 */
export function useDuplicateCheck(options: UseDuplicateCheckOptions) {
  const { pharmacyId, medicineId, enabled = true } = options;

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
    queryKey: duplicateCheckKeys.check(
      userId ?? '',
      pharmacyId ?? '',
      medicineId ?? ''
    ),
    queryFn: () => checkForDuplicate(userId!, pharmacyId!, medicineId!),
    enabled: enabled && !!userId && !!pharmacyId && !!medicineId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format how long ago the report was created
 */
export function formatTimeAgo(hoursAgo: number): string {
  if (hoursAgo < 1) return 'less than an hour ago';
  if (hoursAgo === 1) return '1 hour ago';
  if (hoursAgo < 24) return `${hoursAgo} hours ago`;
  const days = Math.floor(hoursAgo / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

/**
 * Get status label in Filipino
 */
export function getStatusLabel(status: StockStatusEnum): string {
  switch (status) {
    case 'in_stock':
      return 'May Stock';
    case 'low_stock':
      return 'Konti Na Lang';
    case 'out_of_stock':
      return 'Wala Na';
    default:
      return status;
  }
}
