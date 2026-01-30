/**
 * Medicine Search Query Hook
 *
 * TanStack Query hook for searching medicines using Supabase full-text search.
 * Uses the search_medicines RPC function for weighted, ranked results.
 * Supports demo mode for offline presentations.
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '~lib/supabase';
import { isDemoModeActive } from '~stores/useDevToolsStore';
import { demoSearchMedicines } from '~lib/demo';
import type { MedicineSearchResult } from '~types/database';

// =============================================================================
// CONSTANTS
// =============================================================================

const QUERY_KEY = 'medicines';
const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 20;

// =============================================================================
// TYPES
// =============================================================================

interface UseSearchMedicinesOptions {
  /** Search query string */
  query: string;
  /** Maximum number of results (default: 20) */
  limit?: number;
  /** Whether to enable the query */
  enabled?: boolean;
}

interface UseSearchMedicinesReturn {
  /** Search results */
  data: MedicineSearchResult[] | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Fetching state (for background refetches) */
  isFetching: boolean;
  /** Error state */
  isError: boolean;
  /** Error object */
  error: Error | null;
  /** Whether query meets minimum length */
  isQueryValid: boolean;
}

// =============================================================================
// API FUNCTION
// =============================================================================

async function searchMedicines(
  query: string,
  limit: number
): Promise<MedicineSearchResult[]> {
  // Check if demo mode is active
  if (isDemoModeActive()) {
    console.log('[searchMedicines] Demo mode active, using mock data');
    const demoData = await demoSearchMedicines(query, limit);
    
    // Transform to MedicineSearchResult format
    return demoData.map((m) => ({
      id: m.id,
      brand_name: m.brand_name,
      generic_name: m.generic_name,
      dosage: m.dosage,
      form: m.form as MedicineSearchResult['form'],
      category: m.category as MedicineSearchResult['category'],
      requires_prescription: m.requires_prescription,
      rank: m.rank,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('search_medicines', {
    search_query: query,
    result_limit: limit,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for searching medicines with full-text search.
 *
 * @param options - Search options
 * @returns Query result with search data and states
 *
 * @example
 * ```tsx
 * const { data: medicines, isLoading, isQueryValid } = useSearchMedicines({
 *   query: debouncedQuery,
 * });
 *
 * if (!isQueryValid) {
 *   return <p>Type at least 2 characters to search</p>;
 * }
 *
 * if (isLoading) {
 *   return <Skeleton />;
 * }
 *
 * return medicines?.map(medicine => (
 *   <MedicineCard key={medicine.id} medicine={medicine} />
 * ));
 * ```
 */
export function useSearchMedicines(
  options: UseSearchMedicinesOptions
): UseSearchMedicinesReturn {
  const { query, limit = DEFAULT_LIMIT, enabled = true } = options;

  const trimmedQuery = query.trim();
  const isQueryValid = trimmedQuery.length >= MIN_QUERY_LENGTH;

  const queryResult = useQuery({
    queryKey: [QUERY_KEY, 'search', trimmedQuery, limit],
    queryFn: () => searchMedicines(trimmedQuery, limit),
    enabled: enabled && isQueryValid,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    retry: 2,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    isQueryValid,
  };
}

// =============================================================================
// QUERY KEY FACTORY
// =============================================================================

export const medicineQueryKeys = {
  all: [QUERY_KEY] as const,
  search: (query: string, limit?: number) =>
    [QUERY_KEY, 'search', query, limit ?? DEFAULT_LIMIT] as const,
  detail: (id: string) => [QUERY_KEY, 'detail', id] as const,
};

export default useSearchMedicines;
