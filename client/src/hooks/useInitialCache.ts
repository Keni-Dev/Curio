/**
 * useInitialCache Hook
 * 
 * Pre-caches nearby pharmacies and common medicines on app load
 * to enable offline functionality. Only fetches when data is stale.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  cachePharmacies,
  cacheMedicines,
  getCachedPharmacies,
  getCachedMedicines,
  isDataFresh,
  type CachedPharmacy,
  type CachedMedicine,
} from '~lib/offlineDb';
import { useIsOnline } from './useOffline';

// ============================================================================
// Types
// ============================================================================

interface UseInitialCacheOptions {
  /** User's latitude for nearby pharmacy search */
  latitude?: number;
  /** User's longitude for nearby pharmacy search */
  longitude?: number;
  /** Whether to enable caching (default: true) */
  enabled?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const NEARBY_RADIUS_METERS = 5000; // 5km
const MAX_PHARMACIES_TO_CACHE = 50;
const MAX_MEDICINES_TO_CACHE = 100;

// ============================================================================
// Hook Implementation
// ============================================================================

export function useInitialCache(options: UseInitialCacheOptions = {}): void {
  const { latitude, longitude, enabled = true } = options;
  const isOnline = useIsOnline();
  const queryClient = useQueryClient();
  const hasCachedRef = useRef(false);

  const cacheData = useCallback(async () => {
    if (!enabled || !isOnline || hasCachedRef.current) return;

    try {
      // Check if data is fresh
      const [pharmaciesFresh, medicinesFresh] = await Promise.all([
        isDataFresh('pharmacies'),
        isDataFresh('medicines'),
      ]);

      // Cache pharmacies if stale
      if (!pharmaciesFresh) {
        await cacheNearbyPharmacies(latitude, longitude);
      }

      // Cache medicines if stale
      if (!medicinesFresh) {
        await cacheCommonMedicines();
      }

      hasCachedRef.current = true;
      console.log('[useInitialCache] Cache initialized successfully');
    } catch (error) {
      console.error('[useInitialCache] Failed to initialize cache:', error);
    }
  }, [enabled, isOnline, latitude, longitude]);

  // Run cache on mount and when location changes
  useEffect(() => {
    cacheData();
  }, [cacheData]);

  // Prefill TanStack Query cache with IndexedDB data for instant UI
  useEffect(() => {
    const prefillQueryCache = async () => {
      try {
        const [cachedPharmacies, cachedMedicines] = await Promise.all([
          getCachedPharmacies(),
          getCachedMedicines(),
        ]);

        if (cachedPharmacies.length > 0) {
          queryClient.setQueryData(['pharmacies', 'cached'], cachedPharmacies);
        }

        if (cachedMedicines.length > 0) {
          queryClient.setQueryData(['medicines', 'cached'], cachedMedicines);
        }
      } catch (error) {
        console.error('[useInitialCache] Failed to prefill query cache:', error);
      }
    };

    prefillQueryCache();
  }, [queryClient]);
}

// ============================================================================
// Cache Functions
// ============================================================================

// Type for pharmacy data from find_nearby_pharmacies RPC
interface NearbyPharmacyRow {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  is_verified: boolean;
  distance_meters: number;
}

// Type for medicine data from Supabase
interface MedicineRow {
  id: string;
  generic_name: string;
  brand_name: string | null;
  category: string | null;
}

async function cacheNearbyPharmacies(
  latitude?: number,
  longitude?: number
): Promise<void> {
  const { supabase } = await import('~lib/supabase');

  // If location provided, use the find_nearby_pharmacies RPC
  if (latitude !== undefined && longitude !== undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('find_nearby_pharmacies', {
        user_lat: latitude,
        user_lng: longitude,
        radius_meters: NEARBY_RADIUS_METERS,
      });

      if (!error && data) {
        const pharmacies: CachedPharmacy[] = (data as NearbyPharmacyRow[])
          .slice(0, MAX_PHARMACIES_TO_CACHE)
          .map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            latitude: p.lat,
            longitude: p.lng,
            is_verified: p.is_verified,
            distance_km: p.distance_meters / 1000,
            cached_at: Date.now(),
          }));

        await cachePharmacies(pharmacies);
        console.log(`[cacheNearbyPharmacies] Cached ${pharmacies.length} nearby pharmacies`);
        return;
      }
      
      console.warn('[cacheNearbyPharmacies] RPC error:', error);
    } catch (err) {
      console.warn('[cacheNearbyPharmacies] RPC failed:', err);
    }
  }

  // No location or RPC failed - skip caching pharmacies
  // (We can't get lat/lng from the pharmacies table directly without PostGIS functions)
  console.log('[cacheNearbyPharmacies] No location available, skipping pharmacy cache');
}

async function cacheCommonMedicines(): Promise<void> {
  const { supabase } = await import('~lib/supabase');

  const { data, error } = await supabase
    .from('medicines')
    .select('id, generic_name, brand_name, category')
    .limit(MAX_MEDICINES_TO_CACHE);

  if (error) throw error;

  const medicines: CachedMedicine[] = ((data || []) as MedicineRow[]).map((m) => ({
    id: m.id,
    generic_name: m.generic_name,
    brand_names: m.brand_name ? [m.brand_name] : [],
    category: m.category || 'Unknown',
    cached_at: Date.now(),
  }));

  await cacheMedicines(medicines);
  console.log(`[cacheCommonMedicines] Cached ${medicines.length} medicines`);
}
