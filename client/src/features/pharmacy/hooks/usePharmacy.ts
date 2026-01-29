/**
 * usePharmacy Hook
 *
 * React Query hook for fetching a single pharmacy by slug.
 * Uses Supabase to query the pharmacies table.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Pharmacy, PharmacyType, OperatingHours } from '@/types/pharmacy';

// =============================================================================
// TYPES
// =============================================================================

interface UsePharmacyOptions {
  slug: string;
  enabled?: boolean;
}

interface UsePharmacyReturn {
  pharmacy: Pharmacy | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// =============================================================================
// FETCH FUNCTION
// =============================================================================

async function fetchPharmacyBySlug(slug: string): Promise<Pharmacy | null> {
  // First get the pharmacy with its data
  const { data, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching pharmacy:', error);
    throw new Error(`Failed to fetch pharmacy: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // For location, we need to use find_nearby_pharmacies to get lat/lng
  // or parse the PostGIS point. Let's use a simple approach:
  // Query the RPC function with the pharmacy's approximate location
  // For now, use a fixed Manila coordinate to find this specific pharmacy
  const { data: nearbyData } = await supabase.rpc('find_nearby_pharmacies', {
    user_lat: 14.8527,  // Approximate Malolos coordinates
    user_lng: 120.8156,
    radius_meters: 50000, // 50km radius to ensure we find it
  });

  // Find this pharmacy in the results
  const pharmacyWithLocation = nearbyData?.find((p: { slug: string }) => p.slug === slug);

  // Transform the row
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    location: {
      lat: pharmacyWithLocation?.lat ?? 14.8527,
      lng: pharmacyWithLocation?.lng ?? 120.8156,
    },
    address: data.address,
    city: data.city,
    phone: data.phone ?? undefined,
    type: data.type as PharmacyType,
    chainName: data.chain_name ?? undefined,
    operatingHours: data.operating_hours as OperatingHours | undefined,
    is24Hours: data.is_24_hours,
    isVerified: data.is_verified,
    logoUrl: data.logo_url ?? undefined,
    rating: data.rating ?? undefined,
    totalReports: data.total_reports,
    lastUpdated: data.updated_at,
  };
}

// =============================================================================
// HOOK
// =============================================================================

export function usePharmacy({
  slug,
  enabled = true,
}: UsePharmacyOptions): UsePharmacyReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pharmacy', 'slug', slug],
    queryFn: () => fetchPharmacyBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });

  return {
    pharmacy: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export default usePharmacy;
