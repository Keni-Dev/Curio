/**
 * Pharmacies With Medicine Hook
 *
 * Fetches pharmacies that have stock for a specific medicine.
 * Returns pharmacy details with stock status, price, and distance.
 * Supports demo mode for offline presentations.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '~lib/supabase';
import { isDemoModeActive } from '~stores/useDevToolsStore';
import { demoGetPharmaciesWithMedicine, type PharmacyWithMedicineResult } from '~lib/demo';
import type { StockStatus } from '~types/database';

// =============================================================================
// CONSTANTS
// =============================================================================

const QUERY_KEY = 'pharmacies-with-medicine';
const STALE_TIME = 1000 * 60 * 2; // 2 minutes - stock data changes frequently

// =============================================================================
// TYPES
// =============================================================================

export interface PharmacyWithMedicineStock {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string | null;
  type: string;
  chainName: string | null;
  is24Hours: boolean;
  isVerified: boolean;
  logoUrl: string | null;
  distanceMeters: number;
  stockStatus: StockStatus;
  price: number | null;
  lastReportedAt: string | null;
  reportCount: number;
}

export interface AvailabilityCounts {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface UsePharmaciesWithMedicineOptions {
  medicineId: string;
  userLat?: number;
  userLng?: number;
  radiusMeters?: number;
  enabled?: boolean;
}

interface UsePharmaciesWithMedicineReturn {
  pharmacies: PharmacyWithMedicineStock[];
  availabilityCounts: AvailabilityCounts;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// =============================================================================
// API FUNCTION
// =============================================================================

interface PharmacyStockRow {
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_slug: string;
  address: string;
  city: string;
  phone: string | null;
  pharmacy_type: string;
  chain_name: string | null;
  is_24_hours: boolean;
  is_verified: boolean;
  logo_url: string | null;
  distance_meters: number;
  stock_status: StockStatus;
  price: number | null;
  last_reported_at: string | null;
  report_count: number;
}

async function fetchPharmaciesWithMedicine(
  medicineId: string,
  userLat: number,
  userLng: number,
  radiusMeters: number
): Promise<PharmacyWithMedicineStock[]> {
  // Check if demo mode is active
  if (isDemoModeActive()) {
    console.log('[fetchPharmaciesWithMedicine] Demo mode active, using demo data');
    const demoData = await demoGetPharmaciesWithMedicine(medicineId, userLat, userLng, radiusMeters);
    
    // Transform demo data to PharmacyWithMedicineStock format
    return demoData.map((row: PharmacyWithMedicineResult) => ({
      id: row.pharmacy_id,
      name: row.pharmacy_name,
      slug: row.pharmacy_slug,
      address: row.address,
      city: row.city,
      phone: row.phone,
      type: row.pharmacy_type,
      chainName: row.chain_name,
      is24Hours: row.is_24_hours,
      isVerified: row.is_verified,
      logoUrl: row.logo_url,
      distanceMeters: row.distance_meters,
      stockStatus: row.stock_status,
      price: row.price,
      lastReportedAt: row.last_reported_at,
      reportCount: row.report_count,
    }));
  }

  // Use the RPC function to get pharmacies with medicine availability
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_pharmacies_with_medicine', {
    p_medicine_id: medicineId,
    p_user_lat: userLat,
    p_user_lng: userLng,
    p_radius_meters: radiusMeters,
  }) as { data: PharmacyStockRow[] | null; error: Error | null };

  if (error) {
    console.error('Error fetching pharmacies with medicine:', error);
    throw new Error(error.message);
  }

  // Transform snake_case to camelCase
  return (data ?? []).map((row) => ({
    id: row.pharmacy_id,
    name: row.pharmacy_name,
    slug: row.pharmacy_slug,
    address: row.address,
    city: row.city,
    phone: row.phone,
    type: row.pharmacy_type,
    chainName: row.chain_name,
    is24Hours: row.is_24_hours,
    isVerified: row.is_verified,
    logoUrl: row.logo_url,
    distanceMeters: row.distance_meters,
    stockStatus: row.stock_status,
    price: row.price,
    lastReportedAt: row.last_reported_at,
    reportCount: row.report_count,
  }));
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for fetching pharmacies that have stock for a specific medicine.
 *
 * @example
 * ```tsx
 * const { pharmacies, availabilityCounts, isLoading } = usePharmaciesWithMedicine({
 *   medicineId: 'uuid-here',
 *   userLat: 14.5547,
 *   userLng: 121.0244,
 * });
 * ```
 */
export function usePharmaciesWithMedicine(
  options: UsePharmaciesWithMedicineOptions
): UsePharmaciesWithMedicineReturn {
  const {
    medicineId,
    userLat = 14.5547, // Default: Makati City
    userLng = 121.0244,
    radiusMeters = 10000, // 10km radius
    enabled = true,
  } = options;

  const queryResult = useQuery({
    queryKey: [QUERY_KEY, medicineId, userLat, userLng, radiusMeters],
    queryFn: () => fetchPharmaciesWithMedicine(medicineId, userLat, userLng, radiusMeters),
    enabled: enabled && !!medicineId,
    staleTime: STALE_TIME,
    retry: 2,
  });

  // Calculate availability counts
  const pharmacies = queryResult.data ?? [];
  const availabilityCounts: AvailabilityCounts = pharmacies.reduce(
    (acc, pharmacy) => {
      switch (pharmacy.stockStatus) {
        case 'in_stock':
          acc.inStock += 1;
          break;
        case 'low_stock':
          acc.lowStock += 1;
          break;
        case 'out_of_stock':
          acc.outOfStock += 1;
          break;
      }
      return acc;
    },
    { inStock: 0, lowStock: 0, outOfStock: 0 }
  );

  return {
    pharmacies,
    availabilityCounts,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

// =============================================================================
// QUERY KEY FACTORY
// =============================================================================

export const pharmaciesWithMedicineKeys = {
  all: [QUERY_KEY] as const,
  byMedicine: (medicineId: string) => [QUERY_KEY, medicineId] as const,
  byMedicineAndLocation: (
    medicineId: string,
    lat: number,
    lng: number,
    radius?: number
  ) => [QUERY_KEY, medicineId, lat, lng, radius ?? 10000] as const,
};

export default usePharmaciesWithMedicine;
