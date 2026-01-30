/**
 * Supabase Client Configuration
 *
 * Type-safe Supabase client with realtime subscription helpers.
 * Uses environment variables for configuration.
 */

import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { Database, InventoryReportRow } from '../types/database';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

/**
 * Type-safe Supabase client instance.
 * Use this for all database operations.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

type InventoryReportChangeHandler = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  old: InventoryReportRow | null;
  new: InventoryReportRow | null;
}) => void;

/**
 * Subscribe to real-time inventory report updates.
 * Use this for live stock status updates on the map.
 *
 * @param onUpdate - Callback function called when inventory reports change
 * @returns Cleanup function to unsubscribe
 *
 * @example
 * ```ts
 * useEffect(() => {
 *   const unsubscribe = subscribeToInventoryUpdates((payload) => {
 *     console.log('Stock update:', payload);
 *     refetchPharmacyStock();
 *   });
 *
 *   return unsubscribe;
 * }, []);
 * ```
 */
export function subscribeToInventoryUpdates(
  onUpdate: InventoryReportChangeHandler
): () => void {
  const channel: RealtimeChannel = supabase
    .channel('inventory_reports_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inventory_reports',
      },
      (payload) => {
        onUpdate({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          old: payload.old as InventoryReportRow | null,
          new: payload.new as InventoryReportRow | null,
        });
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to inventory updates for a specific pharmacy.
 *
 * @param pharmacyId - The pharmacy ID to filter updates for
 * @param onUpdate - Callback function called when reports for this pharmacy change
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToPharmacyStock(
  pharmacyId: string,
  onUpdate: InventoryReportChangeHandler
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`pharmacy_stock_${pharmacyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inventory_reports',
        filter: `pharmacy_id=eq.${pharmacyId}`,
      },
      (payload) => {
        onUpdate({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          old: payload.old as InventoryReportRow | null,
          new: payload.new as InventoryReportRow | null,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================================================
// VOTE SUBSCRIPTION
// ============================================================================

type VoteChangeHandler = (payload: {
  reportId: string;
  helpfulCount: number;
  notHelpfulCount: number;
}) => void;

/**
 * Subscribe to helpful vote updates for a specific report.
 *
 * @param reportId - The report ID to monitor votes for
 * @param onUpdate - Callback when vote counts change
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToVotes(
  reportId: string,
  onUpdate: VoteChangeHandler
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`report_votes_${reportId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'inventory_reports',
        filter: `id=eq.${reportId}`,
      },
      (payload) => {
        const newData = payload.new as {
          id: string;
          helpful_count: number;
          not_helpful_count: number;
        };
        onUpdate({
          reportId: newData.id,
          helpfulCount: newData.helpful_count,
          notHelpfulCount: newData.not_helpful_count,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the current authenticated user's ID.
 * Returns null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Check if there's an active session.
 */
export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session !== null;
}

/**
 * Create a PostGIS point from latitude and longitude.
 * Use this when inserting location data.
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns PostGIS point string for use in insert/update operations
 */
export function createPoint(lat: number, lng: number): string {
  // Note: PostGIS uses (longitude, latitude) order
  return `POINT(${lng} ${lat})`;
}

// ============================================================================
// DATABASE FUNCTION WRAPPERS
// ============================================================================

// Note: Using type assertions because Supabase types are auto-generated
// and may not include custom RPC functions. Regenerate types with:
// npx supabase gen types typescript --local > src/types/database.ts

/**
 * Find pharmacies near a location using the database function.
 *
 * @param lat - User's latitude
 * @param lng - User's longitude
 * @param radiusMeters - Search radius in meters (default: 2000)
 */
export async function findNearbyPharmacies(
  lat: number,
  lng: number,
  radiusMeters: number = 2000
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('find_nearby_pharmacies', {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters,
  });
}

/**
 * Search medicines by query string using full-text search.
 *
 * @param query - Search query (brand name, generic name, or tags)
 * @param limit - Maximum results to return (default: 20)
 */
export async function searchMedicines(query: string, limit: number = 20) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('search_medicines', {
    search_query: query,
    result_limit: limit,
  });
}

/**
 * Get current stock status for a pharmacy.
 *
 * @param pharmacyId - The pharmacy ID to get stock for
 */
export async function getPharmacyStock(pharmacyId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('get_pharmacy_stock', {
    p_pharmacy_id: pharmacyId,
  });
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { Database } from '../types/database';
