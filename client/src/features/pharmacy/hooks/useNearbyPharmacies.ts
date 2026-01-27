/**
 * useNearbyPharmacies Hook
 *
 * React Query hook for fetching nearby pharmacies from Supabase.
 * Uses the find_nearby_pharmacies RPC function with PostGIS.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '~lib/supabase';
import type { Coordinates } from '~types/common';
import type { PharmacyWithStock, StockStatus, PharmacyType } from '~types/pharmacy';

// =============================================================================
// TYPES
// =============================================================================

interface NearbyPharmacyRow {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  phone: string | null;
  type: PharmacyType;
  chain_name: string | null;
  operating_hours: Record<string, string> | null;
  is_24_hours: boolean;
  is_verified: boolean;
  logo_url: string | null;
  rating: number | null;
  total_reports: number;
  distance_meters: number;
}

interface UseNearbyPharmaciesOptions {
  center: Coordinates;
  radiusMeters?: number;
  enabled?: boolean;
}

interface UseNearbyPharmaciesReturn {
  pharmacies: PharmacyWithStock[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

// =============================================================================
// QUERY KEY FACTORY
// =============================================================================

export const pharmacyKeys = {
  all: ['pharmacies'] as const,
  nearby: (lat: number, lng: number, radius: number) =>
    [...pharmacyKeys.all, 'nearby', { lat, lng, radius }] as const,
  detail: (id: string) => [...pharmacyKeys.all, 'detail', id] as const,
  stock: (pharmacyId: string) =>
    [...pharmacyKeys.all, 'stock', pharmacyId] as const,
};

// =============================================================================
// TRANSFORM FUNCTION
// =============================================================================

/**
 * Transforms raw Supabase row to PharmacyWithStock
 * Adds mock stock status for demo (will be replaced with real data)
 */
function transformPharmacy(row: NearbyPharmacyRow): PharmacyWithStock {
  // Mock stock status based on pharmacy for demo
  // In production, this would come from inventory_reports join
  const stockStatuses = ['in_stock', 'low_stock', 'out_of_stock'] as const;
  const mockStockIndex = Math.abs(row.name.charCodeAt(0)) % 3;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    location: {
      lat: row.lat,
      lng: row.lng,
    },
    address: row.address,
    city: row.city,
    phone: row.phone ?? undefined,
    type: row.type,
    chainName: row.chain_name ?? undefined,
    operatingHours: row.operating_hours ?? undefined,
    is24Hours: row.is_24_hours,
    isVerified: row.is_verified,
    logoUrl: row.logo_url ?? undefined,
    distance: row.distance_meters,
    rating: row.rating ?? undefined,
    totalReports: row.total_reports,
    // Mock stock status for demo
    stockStatus: stockStatuses[mockStockIndex] as StockStatus,
    lastReportedAt: new Date(
      Date.now() - Math.random() * 3600000 * 2 // Random time within 2 hours
    ).toISOString(),
    reportCount: row.total_reports,
  };
}

// =============================================================================
// FETCH FUNCTION
// =============================================================================

async function fetchNearbyPharmacies(
  center: Coordinates,
  radiusMeters: number
): Promise<PharmacyWithStock[]> {
  const { data, error } = await supabase.rpc('find_nearby_pharmacies', {
    user_lat: center.lat,
    user_lng: center.lng,
    radius_meters: radiusMeters,
  });

  if (error) {
    console.error('Error fetching nearby pharmacies:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  return (data as NearbyPharmacyRow[]).map(transformPharmacy);
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for fetching nearby pharmacies
 *
 * @param options - Query options including center coordinates and radius
 * @returns Query result with pharmacies array
 *
 * @example
 * ```tsx
 * const { pharmacies, isLoading } = useNearbyPharmacies({
 *   center: { lat: 14.8527, lng: 120.815 },
 *   radiusMeters: 2000,
 * });
 * ```
 */
export function useNearbyPharmacies(
  options: UseNearbyPharmaciesOptions
): UseNearbyPharmaciesReturn {
  const { center, radiusMeters = 2000, enabled = true } = options;

  const query = useQuery({
    queryKey: pharmacyKeys.nearby(center.lat, center.lng, radiusMeters),
    queryFn: () => fetchNearbyPharmacies(center, radiusMeters),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    pharmacies: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useNearbyPharmacies;
