/**
 * Mock Factory: Stock Reports
 *
 * Creates mock stock report data for testing.
 */

import type { StockStatus, StockReport } from '@/types/pharmacy';
import type { UserLevel } from '@/types/user';
import type { ReportForConfidence } from '@/features/alay/lib/trustScore';

let idCounter = 1;

/**
 * Create a mock stock report
 */
export function createMockStockReport(overrides: Partial<StockReport> = {}): StockReport {
  const id = `report-${idCounter++}`;
  return {
    id,
    pharmacyId: 'pharmacy-1',
    medicineId: 'medicine-1',
    userId: 'user-1',
    status: 'in_stock' as StockStatus,
    price: 25.5,
    notes: undefined,
    createdAt: new Date().toISOString(),
    verifiedCount: 3,
    disputedCount: 0,
    ...overrides,
  };
}

/**
 * Create a report for confidence calculation
 */
export function createMockReportForConfidence(
  overrides: Partial<ReportForConfidence> = {}
): ReportForConfidence {
  const now = new Date();
  return {
    distanceFromPharmacy: 50,
    reporterTrustScore: 0.8,
    reporterLevel: 'Scout' as UserLevel,
    helpfulCount: 5,
    notHelpfulCount: 1,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
    ...overrides,
  };
}

/**
 * Create a fresh report (just submitted)
 */
export function createFreshReport(overrides: Partial<ReportForConfidence> = {}): ReportForConfidence {
  return createMockReportForConfidence({
    createdAt: new Date(),
    helpfulCount: 0,
    notHelpfulCount: 0,
    ...overrides,
  });
}

/**
 * Create an aging report (1.5 hours old)
 */
export function createAgingReport(overrides: Partial<ReportForConfidence> = {}): ReportForConfidence {
  const now = new Date();
  return createMockReportForConfidence({
    createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
    ...overrides,
  });
}

/**
 * Create a stale report (3.5 hours old)
 */
export function createStaleReport(overrides: Partial<ReportForConfidence> = {}): ReportForConfidence {
  const now = new Date();
  return createMockReportForConfidence({
    createdAt: new Date(now.getTime() - 3.5 * 60 * 60 * 1000),
    ...overrides,
  });
}

/**
 * Create a high-confidence report
 */
export function createHighConfidenceReport(): ReportForConfidence {
  return createMockReportForConfidence({
    distanceFromPharmacy: 30,
    reporterTrustScore: 0.95,
    reporterLevel: 'Legend',
    helpfulCount: 10,
    notHelpfulCount: 0,
    createdAt: new Date(),
  });
}

/**
 * Create a low-confidence report
 */
export function createLowConfidenceReport(): ReportForConfidence {
  const now = new Date();
  return createMockReportForConfidence({
    distanceFromPharmacy: 2000,
    reporterTrustScore: 0.3,
    reporterLevel: 'Baguhan',
    helpfulCount: 1,
    notHelpfulCount: 5,
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
  });
}

/**
 * Create multiple stock reports with varying statuses
 */
export function createMockStockReports(count: number): StockReport[] {
  const statuses: StockStatus[] = ['in_stock', 'low_stock', 'out_of_stock'];
  return Array.from({ length: count }, (_, i) =>
    createMockStockReport({
      status: statuses[i % statuses.length],
    })
  );
}

/**
 * Reset the ID counter (useful between tests)
 */
export function resetReportIdCounter() {
  idCounter = 1;
}
