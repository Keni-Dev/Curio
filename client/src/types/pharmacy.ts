/**
 * Pharmacy-related type definitions
 */

export type PharmacyType = 'Chain' | 'Independent' | 'Hospital' | 'Generics';

export interface PharmacyLocation {
  lat: number;
  lng: number;
}

export interface OperatingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  slug: string;
  location: PharmacyLocation;
  address: string;
  city: string;
  phone?: string;
  type: PharmacyType;
  chainName?: string;
  operatingHours?: OperatingHours;
  is24Hours: boolean;
  isVerified: boolean;
  logoUrl?: string;
  distance?: number; // in meters, calculated client-side
  rating?: number;
  totalReports?: number;
  lastUpdated?: string;
}

export interface PharmacyWithStock extends Pharmacy {
  stockStatus: StockStatus;
  price?: number;
  lastReportedAt?: string;
  reportCount?: number;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown';

export interface StockReport {
  id: string;
  pharmacyId: string;
  medicineId: string;
  userId: string;
  status: StockStatus;
  price?: number;
  notes?: string;
  createdAt: string;
  verifiedCount: number;
  disputedCount: number;
}

export interface PharmacySearchFilters {
  query?: string;
  type?: PharmacyType[];
  is24Hours?: boolean;
  maxDistance?: number; // in meters
  hasStock?: boolean;
}
