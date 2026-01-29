/**
 * Stock Feature Type Definitions
 */

import type { StockStatus } from '@/types/pharmacy';

/**
 * Stock filter options for filtering the stock list
 */
export type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

/**
 * Medicine item with stock information
 */
export interface MedicineStock {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName?: string;
  brandName?: string;
  dosage?: string;
  formulation?: string;
  status: StockStatus;
  price?: number;
  lastReportedAt: string;
  reportCount: number;
  verifiedCount: number;
  reportedBy?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    alayLevel?: number;
  };
}

/**
 * Pharmacy stock summary
 */
export interface PharmacyStockSummary {
  pharmacyId: string;
  totalMedicines: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  lastUpdated: string;
}

/**
 * Alay contributor who verified stock
 */
export interface AlayContributor {
  id: string;
  displayName: string;
  avatarUrl?: string;
  alayLevel: number;
  contributionCount: number;
  lastContributedAt: string;
}

/**
 * Filter tab configuration
 */
export interface FilterTabConfig {
  value: StockFilter;
  label: string;
  icon?: string;
}
