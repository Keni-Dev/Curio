/**
 * useNearbyPharmacies Hook
 *
 * React Query hook for fetching nearby pharmacies from Supabase.
 * Uses the find_nearby_pharmacies RPC function with PostGIS.
 * Supports demo mode for offline presentations.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '~lib/supabase';
import { isDemoModeActive } from '~stores/useDevToolsStore';
import { demoFindNearbyPharmacies } from '~lib/demo';
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

/**
 * Round coordinates to reduce query key changes on minor map movements
 * ~0.01 degrees ≈ 1km, so we round to 2 decimal places
 */
const roundCoord = (coord: number): number => Math.round(coord * 100) / 100;

export const pharmacyKeys = {
  all: ['pharmacies'] as const,
  nearby: (lat: number, lng: number, radius: number) =>
    [...pharmacyKeys.all, 'nearby', { lat: roundCoord(lat), lng: roundCoord(lng), radius }] as const,
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

// Type for Supabase RPC response
interface SupabaseRpcResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

// Type for demo data row
interface DemoPharmacyRow {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  phone: string | null;
  type: string;
  chain_name: string | null;
  operating_hours: Record<string, string> | null;
  is_24_hours: boolean;
  is_verified: boolean;
  logo_url: string | null;
  rating: number | null;
  total_reports: number;
  distance_meters: number;
}

interface PharmacyTableRow {
  id: string;
  name: string;
  slug: string;
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
}

/**
 * Fallback: fetch pharmacies directly from table (without PostGIS distance calculation)
 */
async function fetchPharmaciesFallback(): Promise<PharmacyWithStock[]> {
  console.log('[fetchPharmaciesFallback] Using fallback query...');
  const startTime = Date.now();
  
  const { data, error } = await supabase
    .from('pharmacies')
    .select('id, name, slug, address, city, phone, type, chain_name, operating_hours, is_24_hours, is_verified, logo_url, rating, total_reports')
    .limit(20);
  
  console.log('[fetchPharmaciesFallback] Query completed in', Date.now() - startTime, 'ms');

  if (error) {
    console.error('[fetchPharmaciesFallback] Error:', error);
    throw new Error(error.message);
  }

  console.log('[fetchPharmaciesFallback] Got data:', data?.length ?? 0, 'pharmacies');

  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Transform without distance (since we can't calculate without PostGIS)
  return (data as PharmacyTableRow[]).map((row): PharmacyWithStock => {
    const stockStatuses = ['in_stock', 'low_stock', 'out_of_stock'] as const;
    const mockStockIndex = Math.abs(row.name.charCodeAt(0)) % 3;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      location: {
        lat: 14.8527, // Default to center (we don't have location without PostGIS)
        lng: 120.815,
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
      distance: undefined, // No distance without PostGIS
      rating: row.rating ?? undefined,
      totalReports: row.total_reports,
      stockStatus: stockStatuses[mockStockIndex] as StockStatus,
      lastReportedAt: new Date(Date.now() - Math.random() * 3600000 * 2).toISOString(),
      reportCount: row.total_reports,
    };
  });
}

async function fetchNearbyPharmacies(
  center: Coordinates,
  radiusMeters: number
): Promise<PharmacyWithStock[]> {
  // Check if demo mode is active
  if (isDemoModeActive()) {
    console.log('[fetchNearbyPharmacies] Demo mode active, using mock data');
    const demoData = await demoFindNearbyPharmacies(center.lat, center.lng, radiusMeters);
    
    // Transform demo data to PharmacyWithStock format
    return (demoData as DemoPharmacyRow[]).map((row): PharmacyWithStock => {
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
        type: row.type as PharmacyType,
        chainName: row.chain_name ?? undefined,
        operatingHours: row.operating_hours ?? undefined,
        is24Hours: row.is_24_hours,
        isVerified: row.is_verified,
        logoUrl: row.logo_url ?? undefined,
        distance: row.distance_meters,
        rating: row.rating ?? undefined,
        totalReports: row.total_reports,
        stockStatus: stockStatuses[mockStockIndex] as StockStatus,
        lastReportedAt: new Date(Date.now() - Math.random() * 3600000 * 2).toISOString(),
        reportCount: row.total_reports,
      };
    });
  }

  console.log('[fetchNearbyPharmacies] Fetching pharmacies...', { center, radiusMeters });
  
  try {
    // Try the RPC function first (uses PostGIS for distance)
    console.log('[fetchNearbyPharmacies] Starting RPC call...');
    const startTime = Date.now();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpcResult = await (supabase as any).rpc('find_nearby_pharmacies', {
      user_lat: center.lat,
      user_lng: center.lng,
      radius_meters: radiusMeters,
    });
    
    console.log('[fetchNearbyPharmacies] RPC completed in', Date.now() - startTime, 'ms');
    
    const { data, error } = rpcResult as SupabaseRpcResponse<NearbyPharmacyRow[]>;

    if (error) {
      console.error('[fetchNearbyPharmacies] Supabase RPC error:', error);
      // Try fallback
      console.log('[fetchNearbyPharmacies] Attempting fallback...');
      return await fetchPharmaciesFallback();
    }

    console.log('[fetchNearbyPharmacies] Got data:', data?.length ?? 0, 'pharmacies');

    if (!data || !Array.isArray(data)) {
      console.warn('[fetchNearbyPharmacies] No data returned, trying fallback...');
      return await fetchPharmaciesFallback();
    }

    return (data as NearbyPharmacyRow[]).map(transformPharmacy);
  } catch (err) {
    console.error('[fetchNearbyPharmacies] RPC failed:', err);
    
    // Try fallback on any error
    try {
      console.log('[fetchNearbyPharmacies] Attempting fallback after error...');
      return await fetchPharmaciesFallback();
    } catch (fallbackErr) {
      console.error('[fetchNearbyPharmacies] Fallback also failed:', fallbackErr);
      throw new Error('Unable to load pharmacies. Please check your connection.');
    }
  }
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
    staleTime: 1000 * 60 * 5, // 5 minutes - keep data fresh longer
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on component mount if data exists
    retry: 2,
  });

  // In TanStack Query v5, isPending replaces isLoading
  // isPending = true when there's no cached data and the query is fetching
  return {
    pharmacies: query.data ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useNearbyPharmacies;
