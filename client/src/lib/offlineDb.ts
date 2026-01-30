/**
 * IndexedDB wrapper for offline storage using idb library.
 * Stores pharmacies, medicines, pending reports, and search history.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// ============================================================================
// Types
// ============================================================================

export interface CachedPharmacy {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  distance_km?: number;
  cached_at: number;
}

export interface CachedMedicine {
  id: string;
  generic_name: string;
  brand_names: string[];
  category: string;
  cached_at: number;
}

export interface PendingReport {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  price?: number;
  notes?: string;
  created_at: number;
  retry_count: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'medicine' | 'pharmacy';
  result_count: number;
  searched_at: number;
}

// ============================================================================
// Database Schema
// ============================================================================

interface CurioDBSchema extends DBSchema {
  pharmacies: {
    key: string;
    value: CachedPharmacy;
    indexes: { 'by-cached-at': number };
  };
  medicines: {
    key: string;
    value: CachedMedicine;
    indexes: { 'by-generic-name': string; 'by-cached-at': number };
  };
  pendingReports: {
    key: string;
    value: PendingReport;
    indexes: { 'by-created-at': number };
  };
  searchHistory: {
    key: string;
    value: SearchHistoryItem;
    indexes: { 'by-searched-at': number };
  };
}

// ============================================================================
// Constants
// ============================================================================

const DB_NAME = 'curio-offline-db';
const DB_VERSION = 1;
const MAX_SEARCH_HISTORY = 20;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes for data freshness

// ============================================================================
// Database Instance
// ============================================================================

let dbInstance: IDBPDatabase<CurioDBSchema> | null = null;

export async function getDB(): Promise<IDBPDatabase<CurioDBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CurioDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Pharmacies store
      if (!db.objectStoreNames.contains('pharmacies')) {
        const pharmacyStore = db.createObjectStore('pharmacies', { keyPath: 'id' });
        pharmacyStore.createIndex('by-cached-at', 'cached_at');
      }

      // Medicines store
      if (!db.objectStoreNames.contains('medicines')) {
        const medicineStore = db.createObjectStore('medicines', { keyPath: 'id' });
        medicineStore.createIndex('by-generic-name', 'generic_name');
        medicineStore.createIndex('by-cached-at', 'cached_at');
      }

      // Pending reports store
      if (!db.objectStoreNames.contains('pendingReports')) {
        const reportsStore = db.createObjectStore('pendingReports', { keyPath: 'id' });
        reportsStore.createIndex('by-created-at', 'created_at');
      }

      // Search history store
      if (!db.objectStoreNames.contains('searchHistory')) {
        const historyStore = db.createObjectStore('searchHistory', { keyPath: 'id' });
        historyStore.createIndex('by-searched-at', 'searched_at');
      }
    },
  });

  return dbInstance;
}

// ============================================================================
// Pharmacy Operations
// ============================================================================

export async function cachePharmacies(pharmacies: CachedPharmacy[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('pharmacies', 'readwrite');
  const now = Date.now();

  await Promise.all([
    ...pharmacies.map((pharmacy) =>
      tx.store.put({ ...pharmacy, cached_at: now })
    ),
    tx.done,
  ]);
}

export async function getCachedPharmacies(): Promise<CachedPharmacy[]> {
  const db = await getDB();
  return db.getAll('pharmacies');
}

export async function getCachedPharmacy(id: string): Promise<CachedPharmacy | undefined> {
  const db = await getDB();
  return db.get('pharmacies', id);
}

export async function clearStalePharmacies(): Promise<void> {
  const db = await getDB();
  const staleTime = Date.now() - CACHE_TTL_MS;
  const tx = db.transaction('pharmacies', 'readwrite');
  const index = tx.store.index('by-cached-at');

  let cursor = await index.openCursor(IDBKeyRange.upperBound(staleTime));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  await tx.done;
}

// ============================================================================
// Medicine Operations
// ============================================================================

export async function cacheMedicines(medicines: CachedMedicine[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('medicines', 'readwrite');
  const now = Date.now();

  await Promise.all([
    ...medicines.map((medicine) =>
      tx.store.put({ ...medicine, cached_at: now })
    ),
    tx.done,
  ]);
}

export async function getCachedMedicines(): Promise<CachedMedicine[]> {
  const db = await getDB();
  return db.getAll('medicines');
}

export async function searchCachedMedicines(query: string): Promise<CachedMedicine[]> {
  const db = await getDB();
  const allMedicines = await db.getAll('medicines');
  const lowerQuery = query.toLowerCase();

  return allMedicines.filter(
    (med) =>
      med.generic_name.toLowerCase().includes(lowerQuery) ||
      med.brand_names.some((brand) => brand.toLowerCase().includes(lowerQuery))
  );
}

// ============================================================================
// Pending Reports Operations
// ============================================================================

export async function addPendingReport(report: Omit<PendingReport, 'id' | 'created_at' | 'retry_count'>): Promise<string> {
  const db = await getDB();
  const id = `report-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  await db.put('pendingReports', {
    ...report,
    id,
    created_at: Date.now(),
    retry_count: 0,
  });

  return id;
}

export async function getPendingReports(): Promise<PendingReport[]> {
  const db = await getDB();
  return db.getAll('pendingReports');
}

export async function getPendingReportCount(): Promise<number> {
  const db = await getDB();
  return db.count('pendingReports');
}

export async function removePendingReport(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pendingReports', id);
}

export async function incrementReportRetry(id: string): Promise<void> {
  const db = await getDB();
  const report = await db.get('pendingReports', id);
  
  if (report) {
    await db.put('pendingReports', {
      ...report,
      retry_count: report.retry_count + 1,
    });
  }
}

export async function clearAllPendingReports(): Promise<void> {
  const db = await getDB();
  await db.clear('pendingReports');
}

// ============================================================================
// Search History Operations
// ============================================================================

export async function addSearchHistory(
  query: string,
  type: 'medicine' | 'pharmacy',
  resultCount: number
): Promise<void> {
  const db = await getDB();
  const id = `search-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  await db.put('searchHistory', {
    id,
    query,
    type,
    result_count: resultCount,
    searched_at: Date.now(),
  });

  // Trim to max history size (keep most recent)
  const allHistory = await db.getAllFromIndex('searchHistory', 'by-searched-at');
  
  if (allHistory.length > MAX_SEARCH_HISTORY) {
    const toDelete = allHistory.slice(0, allHistory.length - MAX_SEARCH_HISTORY);
    const tx = db.transaction('searchHistory', 'readwrite');
    
    await Promise.all([
      ...toDelete.map((item) => tx.store.delete(item.id)),
      tx.done,
    ]);
  }
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  const db = await getDB();
  const history = await db.getAllFromIndex('searchHistory', 'by-searched-at');
  return history.reverse(); // Most recent first
}

export async function clearSearchHistory(): Promise<void> {
  const db = await getDB();
  await db.clear('searchHistory');
}

// ============================================================================
// Utility Functions
// ============================================================================

export async function isDataFresh(storeName: 'pharmacies' | 'medicines'): Promise<boolean> {
  const db = await getDB();
  const items = await db.getAll(storeName);
  
  if (items.length === 0) return false;
  
  const newestItem = items.reduce((newest, item) =>
    item.cached_at > newest.cached_at ? item : newest
  );
  
  return Date.now() - newestItem.cached_at < CACHE_TTL_MS;
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('pharmacies'),
    db.clear('medicines'),
    db.clear('pendingReports'),
    db.clear('searchHistory'),
  ]);
}
