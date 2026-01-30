/**
 * Demo Data Provider
 *
 * Provides demo data that mirrors Supabase RPC functions.
 * Use these functions instead of Supabase calls when demo mode is active.
 */

import {
  DEMO_PHARMACIES,
  DEMO_MEDICINES,
  DEMO_LEADERBOARD,
  DEMO_USER_PROFILE,
  getDemoNearbyPharmacies,
  searchDemoMedicines,
  getDemoPharmaciesWithMedicine,
  generateDemoStockForPharmacy,
  type DemoPharmacy,
  type DemoMedicine,
  type DemoProfile,
} from './demoData';
import { simulateNetworkDelay } from './demoConfig';
import type { StockStatus } from '@/types/database';

// =============================================================================
// PHARMACY FUNCTIONS
// =============================================================================

export interface NearbyPharmacyResult {
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

/**
 * Demo version of find_nearby_pharmacies RPC.
 */
export async function demoFindNearbyPharmacies(
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000
): Promise<NearbyPharmacyResult[]> {
  await simulateNetworkDelay();

  const pharmacies = getDemoNearbyPharmacies(userLat, userLng, radiusMeters);

  return pharmacies.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    lat: p.lat,
    lng: p.lng,
    address: p.address,
    city: p.city,
    phone: p.phone,
    type: p.type,
    chain_name: p.chain_name,
    operating_hours: p.operating_hours,
    is_24_hours: p.is_24_hours,
    is_verified: p.is_verified,
    logo_url: p.logo_url,
    rating: p.rating,
    total_reports: p.total_reports,
    distance_meters: p.distance_meters,
  }));
}

/**
 * Demo version of getting a single pharmacy by slug.
 */
export async function demoGetPharmacyBySlug(
  slug: string
): Promise<DemoPharmacy | null> {
  await simulateNetworkDelay();

  const pharmacy = DEMO_PHARMACIES.find((p) => p.slug === slug);
  return pharmacy ?? null;
}

/**
 * Demo version of getting a single pharmacy by ID.
 */
export async function demoGetPharmacyById(
  id: string
): Promise<DemoPharmacy | null> {
  await simulateNetworkDelay();

  const pharmacy = DEMO_PHARMACIES.find((p) => p.id === id);
  return pharmacy ?? null;
}

// =============================================================================
// MEDICINE FUNCTIONS
// =============================================================================

export interface MedicineSearchResult {
  id: string;
  brand_name: string | null;
  generic_name: string;
  dosage: string | null;
  form: string | null;
  category: string | null;
  requires_prescription: boolean;
  rank?: number;
}

/**
 * Demo version of search_medicines RPC.
 */
export async function demoSearchMedicines(
  searchQuery: string,
  resultLimit: number = 20
): Promise<MedicineSearchResult[]> {
  await simulateNetworkDelay();

  const results = searchDemoMedicines(searchQuery, resultLimit);

  return results.map((m) => ({
    id: m.id,
    brand_name: m.brand_name,
    generic_name: m.generic_name,
    dosage: m.dosage,
    form: m.form,
    category: m.category,
    requires_prescription: m.requires_prescription,
    rank: m.rank,
  }));
}

/**
 * Demo version of getting all medicines.
 */
export async function demoGetAllMedicines(): Promise<DemoMedicine[]> {
  await simulateNetworkDelay();
  return DEMO_MEDICINES;
}

// =============================================================================
// STOCK FUNCTIONS
// =============================================================================

export interface PharmacyStockResult {
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

/**
 * Demo version of get_pharmacy_stock RPC.
 */
export async function demoGetPharmacyStock(
  pharmacyId: string
): Promise<PharmacyStockResult[]> {
  await simulateNetworkDelay();

  const stock = generateDemoStockForPharmacy(pharmacyId);

  return stock.map((s) => ({
    medicine_id: s.medicine_id,
    brand_name: s.brand_name,
    generic_name: s.generic_name,
    status: s.status,
    price: s.price,
    reported_by: s.reported_by,
    reporter_name: s.reporter_name,
    created_at: s.created_at,
    expires_at: s.expires_at,
    helpful_count: s.helpful_count,
    not_helpful_count: s.not_helpful_count,
  }));
}

export interface PharmacyWithMedicineResult {
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

/**
 * Demo version of get_pharmacies_with_medicine RPC.
 */
export async function demoGetPharmaciesWithMedicine(
  medicineId: string,
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000
): Promise<PharmacyWithMedicineResult[]> {
  await simulateNetworkDelay();

  const pharmacies = getDemoPharmaciesWithMedicine(medicineId, userLat, userLng, radiusMeters);

  return pharmacies.map((p) => ({
    pharmacy_id: p.id,
    pharmacy_name: p.name,
    pharmacy_slug: p.slug,
    address: p.address,
    city: p.city,
    phone: p.phone,
    pharmacy_type: p.type,
    chain_name: p.chain_name,
    is_24_hours: p.is_24_hours,
    is_verified: p.is_verified,
    logo_url: p.logo_url,
    distance_meters: p.distance_meters,
    stock_status: p.stockStatus,
    price: p.price,
    last_reported_at: p.lastReportedAt,
    report_count: p.total_reports,
  }));
}

// =============================================================================
// REPORT FUNCTIONS
// =============================================================================

export interface SubmitReportResult {
  success: boolean;
  reportId: string;
  pointsEarned: number;
  message: string;
}

/**
 * Demo version of submitting a stock report.
 * In demo mode, reports are stored locally and show success.
 */
export async function demoSubmitReport(
  pharmacyId: string,
  medicineId: string,
  status: StockStatus,
  price?: number | null,
  notes?: string | null
): Promise<SubmitReportResult> {
  await simulateNetworkDelay();

  // Generate a fake report ID
  const reportId = `demo-report-${Date.now()}`;

  // Store in IndexedDB for demo persistence (if needed)
  // For now, just return success
  console.log('[Demo Mode] Stock report submitted:', {
    reportId,
    pharmacyId,
    medicineId,
    status,
    price,
    notes,
  });

  return {
    success: true,
    reportId,
    pointsEarned: 10,
    message: 'Report submitted successfully! (Demo Mode)',
  };
}

/**
 * Demo version of duplicate check.
 * Always returns false in demo mode.
 * Parameters are ignored in demo mode but kept for API compatibility.
 */
export async function demoCheckDuplicateReport(
  ..._args: [userId: string, pharmacyId: string, medicineId: string]
): Promise<boolean> {
  void _args; // Keep for API compatibility
  await simulateNetworkDelay();
  return false;
}

// =============================================================================
// PROFILE & LEADERBOARD FUNCTIONS
// =============================================================================

/**
 * Demo version of fetching user profile.
 */
export async function demoGetUserProfile(): Promise<DemoProfile> {
  await simulateNetworkDelay();
  return DEMO_USER_PROFILE;
}

/**
 * Demo version of fetching leaderboard.
 */
export async function demoGetLeaderboard(limit: number = 10): Promise<DemoProfile[]> {
  await simulateNetworkDelay();
  return DEMO_LEADERBOARD.slice(0, limit);
}

/**
 * Demo version of updating user points.
 * Just returns updated profile with incremented points.
 */
export async function demoUpdateUserPoints(
  pointsToAdd: number
): Promise<DemoProfile> {
  await simulateNetworkDelay();

  return {
    ...DEMO_USER_PROFILE,
    alay_points: DEMO_USER_PROFILE.alay_points + pointsToAdd,
    contribution_count: DEMO_USER_PROFILE.contribution_count + 1,
  };
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export {
  DEMO_PHARMACIES,
  DEMO_MEDICINES,
  DEMO_LEADERBOARD,
  DEMO_USER_PROFILE,
};
