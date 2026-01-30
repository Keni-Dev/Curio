/**
 * Mock Factory: Pharmacies
 *
 * Creates mock pharmacy data for testing.
 */

import type { Pharmacy, PharmacyWithStock, StockStatus, PharmacyType } from '@/types/pharmacy';

let idCounter = 1;

/**
 * Create a mock pharmacy with default values
 */
export function createMockPharmacy(overrides: Partial<Pharmacy> = {}): Pharmacy {
  const id = `pharmacy-${idCounter++}`;
  return {
    id,
    name: 'Test Pharmacy',
    slug: 'test-pharmacy',
    location: { lat: 14.8527, lng: 120.8157 },
    address: '123 Test Street, Malolos, Bulacan',
    city: 'Malolos',
    phone: '+63 912 345 6789',
    type: 'Independent' as PharmacyType,
    chainName: undefined,
    operatingHours: {
      monday: '8:00 AM - 9:00 PM',
      tuesday: '8:00 AM - 9:00 PM',
      wednesday: '8:00 AM - 9:00 PM',
      thursday: '8:00 AM - 9:00 PM',
      friday: '8:00 AM - 9:00 PM',
      saturday: '8:00 AM - 6:00 PM',
      sunday: '9:00 AM - 5:00 PM',
    },
    is24Hours: false,
    isVerified: true,
    logoUrl: undefined,
    distance: 250,
    rating: 4.5,
    totalReports: 42,
    lastUpdated: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock pharmacy with stock information
 */
export function createMockPharmacyWithStock(
  overrides: Partial<PharmacyWithStock> = {}
): PharmacyWithStock {
  return {
    ...createMockPharmacy(overrides),
    stockStatus: 'in_stock' as StockStatus,
    price: 25.5,
    lastReportedAt: new Date().toISOString(),
    reportCount: 5,
    ...overrides,
  };
}

/**
 * Create multiple mock pharmacies
 */
export function createMockPharmacies(count: number): Pharmacy[] {
  return Array.from({ length: count }, (_, i) =>
    createMockPharmacy({
      name: `Pharmacy ${i + 1}`,
      slug: `pharmacy-${i + 1}`,
      distance: (i + 1) * 100,
    })
  );
}

/**
 * Create a Mercury Drug pharmacy (chain example)
 */
export function createMockMercuryDrug(overrides: Partial<Pharmacy> = {}): Pharmacy {
  return createMockPharmacy({
    name: 'Mercury Drug - SM Malolos',
    slug: 'mercury-drug-sm-malolos',
    type: 'Chain',
    chainName: 'Mercury Drug',
    is24Hours: true,
    isVerified: true,
    ...overrides,
  });
}

/**
 * Create a hospital pharmacy
 */
export function createMockHospitalPharmacy(overrides: Partial<Pharmacy> = {}): Pharmacy {
  return createMockPharmacy({
    name: 'Bulacan Medical Center Pharmacy',
    slug: 'bulacan-medical-center-pharmacy',
    type: 'Hospital',
    is24Hours: true,
    isVerified: true,
    ...overrides,
  });
}

/**
 * Reset the ID counter (useful between tests)
 */
export function resetPharmacyIdCounter() {
  idCounter = 1;
}
