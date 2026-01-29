/**
 * usePharmacyStock Hook
 *
 * React Query hook for fetching medicine stock for a specific pharmacy.
 * Includes real-time subscription for live updates.
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, subscribeToPharmacyStock } from '@/lib/supabase';
import { pharmacyKeys } from '@/features/pharmacy/hooks/useNearbyPharmacies';
import type { MedicineStock, PharmacyStockSummary } from '../types';
import type { StockStatus } from '@/types/pharmacy';

// =============================================================================
// TYPES
// =============================================================================

// Match the actual get_pharmacy_stock RPC function return type
interface StockRow {
  medicine_id: string;
  brand_name: string;
  generic_name: string | null;
  status: StockStatus;
  price: number | null;
  reported_by: string | null;
  reporter_name: string | null;
  created_at: string;
  expires_at: string;
  helpful_count: number;
  not_helpful_count: number;
}

interface UsePharmacyStockOptions {
  pharmacyId: string;
  enabled?: boolean;
  realtime?: boolean;
}

interface UsePharmacyStockReturn {
  stock: MedicineStock[];
  summary: PharmacyStockSummary | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

// =============================================================================
// TRANSFORM FUNCTION
// =============================================================================

function transformStockRow(row: StockRow, index: number): MedicineStock {
  return {
    id: `${row.medicine_id}-${index}`,
    medicineId: row.medicine_id,
    medicineName: row.brand_name || row.generic_name || 'Unknown Medicine',
    genericName: row.generic_name ?? undefined,
    brandName: row.brand_name ?? undefined,
    dosage: undefined, // Not returned by current RPC
    formulation: undefined, // Not returned by current RPC
    status: row.status,
    price: row.price ?? undefined,
    lastReportedAt: row.created_at,
    reportCount: 1, // Not aggregated in current RPC
    verifiedCount: row.helpful_count,
    reportedBy: row.reported_by
      ? {
          id: row.reported_by,
          displayName: row.reporter_name ?? 'Anonymous',
          avatarUrl: undefined,
          alayLevel: undefined,
        }
      : undefined,
  };
}

function calculateSummary(
  pharmacyId: string,
  stock: MedicineStock[]
): PharmacyStockSummary {
  const latestReport = stock.reduce(
    (latest, item) =>
      new Date(item.lastReportedAt) > new Date(latest)
        ? item.lastReportedAt
        : latest,
    stock[0]?.lastReportedAt ?? new Date().toISOString()
  );

  return {
    pharmacyId,
    totalMedicines: stock.length,
    inStock: stock.filter((s) => s.status === 'in_stock').length,
    lowStock: stock.filter((s) => s.status === 'low_stock').length,
    outOfStock: stock.filter((s) => s.status === 'out_of_stock').length,
    lastUpdated: latestReport,
  };
}

// =============================================================================
// FETCH FUNCTION
// =============================================================================

async function fetchPharmacyStock(pharmacyId: string): Promise<MedicineStock[]> {
  // Use RPC function that joins inventory reports with medicines
  const { data, error } = await supabase.rpc('get_pharmacy_stock', {
    p_pharmacy_id: pharmacyId,
  });

  if (error) {
    console.error('Error fetching pharmacy stock:', error);
    throw new Error(`Failed to fetch stock: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return (data as StockRow[]).map((row, index) => transformStockRow(row, index));
}

// =============================================================================
// HOOK
// =============================================================================

export function usePharmacyStock({
  pharmacyId,
  enabled = true,
  realtime = true,
}: UsePharmacyStockOptions): UsePharmacyStockReturn {
  const queryClient = useQueryClient();

  const {
    data: stock = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: pharmacyKeys.stock(pharmacyId),
    queryFn: () => fetchPharmacyStock(pharmacyId),
    enabled: enabled && !!pharmacyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Real-time subscription for stock updates
  useEffect(() => {
    if (!realtime || !pharmacyId || !enabled) return;

    const unsubscribe = subscribeToPharmacyStock(pharmacyId, (payload) => {
      console.log('Stock update received:', payload.eventType);

      // Invalidate and refetch the query on any change
      queryClient.invalidateQueries({
        queryKey: pharmacyKeys.stock(pharmacyId),
      });
    });

    return unsubscribe;
  }, [pharmacyId, realtime, enabled, queryClient]);

  // Calculate summary
  const summary =
    stock.length > 0 ? calculateSummary(pharmacyId, stock) : null;

  return {
    stock,
    summary,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    isFetching,
  };
}

export default usePharmacyStock;
