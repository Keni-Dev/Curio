/**
 * Search Results Page
 *
 * Displays medicine details and pharmacy availability.
 * URL: /search?medicineId=xxx or /search?q=searchTerm
 *
 * Features:
 * - Medicine hero card with availability summary
 * - Pharmacy list with stock status, price, distance
 * - Filter sidebar (desktop) / FAB + bottom sheet (mobile)
 * - Sort by distance, price, or stock availability
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { cn } from '~lib/utils';
import { useGeolocation } from '~hooks/useGeolocation';
import { useDebounce } from '~hooks/useDebounce';
import { Button } from '~components/ui/Button';
import { SearchBar } from '~components/search/SearchBar';
import { PharmacyResultCard } from '~components/search/PharmacyResultCard';
import { SearchFilters, type SearchFiltersState, type SortOption } from '~components/search/SearchFilters';
import { MedicineHeroCard } from '~features/medicine';
import {
  useSearchMedicines,
  usePharmaciesWithMedicine,
  type PharmacyWithMedicineStock,
} from '~features/medicine';
import type { MedicineSearchResult } from '~types/database';

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_FILTERS: SearchFiltersState = {
  sortBy: 'distance',
  pharmacyChains: [],
  availability: [],
};

const ITEMS_PER_PAGE = 10;

// =============================================================================
// SKELETON COMPONENTS
// =============================================================================

function HeroCardSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-card overflow-hidden border-l-4 border-slate-200 animate-pulse">
      <div className="p-6 flex-1 flex flex-col gap-4">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="space-y-2 mt-4">
          <div className="h-3 w-full bg-slate-200 rounded-lg" />
          <div className="flex gap-4">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PharmacyCardSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-100 shadow-card animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-64 bg-slate-200 rounded" />
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-3">
          <div className="h-8 w-20 bg-slate-200 rounded" />
          <div className="h-10 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY/ERROR STATES
// =============================================================================

function NoMedicineSelected() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span
        className="material-symbols-outlined text-[80px] text-primary/30 mb-4"
        aria-hidden="true"
      >
        search
      </span>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        Maghanap ng Gamot
      </h2>
      <p className="text-text-secondary max-w-md mb-6">
        Use the search bar above to find a medicine and see which pharmacies near you have it in stock.
      </p>
      <Link to="/">
        <Button variant="primary">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            arrow_back
          </span>
          Back to Map
        </Button>
      </Link>
    </div>
  );
}

function NoPharmaciesFound({ medicineName }: { medicineName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span
        className="material-symbols-outlined text-[80px] text-amber-400 mb-4"
        aria-hidden="true"
      >
        location_off
      </span>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        Walang Nahanap na Botika
      </h2>
      <p className="text-text-secondary max-w-md">
        No pharmacies with <strong>{medicineName}</strong> were found in your area.
        Try expanding your search radius or check back later.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span
        className="material-symbols-outlined text-[80px] text-rose-400 mb-4"
        aria-hidden="true"
      >
        error
      </span>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        May Problema
      </h2>
      <p className="text-text-secondary max-w-md mb-6">
        Something went wrong while loading the results. Please try again.
      </p>
      <Button variant="primary" onClick={onRetry}>
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          refresh
        </span>
        Try Again
      </Button>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function sortPharmacies(
  pharmacies: PharmacyWithMedicineStock[],
  sortBy: SortOption
): PharmacyWithMedicineStock[] {
  const sorted = [...pharmacies];

  switch (sortBy) {
    case 'distance':
      return sorted.sort((a, b) => a.distanceMeters - b.distanceMeters);
    case 'price_low':
      return sorted.sort((a, b) => {
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      });
    case 'price_high':
      return sorted.sort((a, b) => {
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return b.price - a.price;
      });
    case 'stock': {
      const stockOrder = { in_stock: 0, low_stock: 1, out_of_stock: 2 };
      return sorted.sort(
        (a, b) => stockOrder[a.stockStatus] - stockOrder[b.stockStatus]
      );
    }
    default:
      return sorted;
  }
}

function filterPharmacies(
  pharmacies: PharmacyWithMedicineStock[],
  filters: SearchFiltersState
): PharmacyWithMedicineStock[] {
  return pharmacies.filter((pharmacy) => {
    // Filter by chain
    if (filters.pharmacyChains.length > 0) {
      const chainMatch = filters.pharmacyChains.some(
        (chain) =>
          pharmacy.chainName?.toLowerCase() === chain.toLowerCase() ||
          pharmacy.name.toLowerCase().includes(chain.toLowerCase())
      );
      if (!chainMatch) return false;
    }

    // Filter by availability
    if (filters.availability.length > 0) {
      if (!filters.availability.includes(pharmacy.stockStatus)) return false;
    }

    return true;
  });
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { coordinates } = useGeolocation();

  // URL params
  const medicineId = searchParams.get('medicineId');
  const searchQuery = searchParams.get('q') || '';

  // Local state
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 300);
  const [filters, setFilters] = useState<SearchFiltersState>(DEFAULT_FILTERS);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineSearchResult | null>(null);

  // Sync URL query to local state
  useEffect(() => {
    if (searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Search medicines (for search bar functionality on this page)
  const {
    data: searchResults,
    isLoading: isSearching,
  } = useSearchMedicines({
    query: debouncedQuery,
    enabled: debouncedQuery.length >= 2,
  });

  // Auto-select first medicine when arriving with ?q= query and results load
  useEffect(() => {
    if (!medicineId && searchResults && searchResults.length > 0 && !selectedMedicine) {
      const firstResult = searchResults[0];
      if (firstResult) {
        setSelectedMedicine(firstResult);
        // Update URL to use medicineId instead of q
        setSearchParams({ medicineId: firstResult.id }, { replace: true });
      }
    }
  }, [medicineId, searchResults, selectedMedicine, setSearchParams]);

  // Get pharmacies with the selected medicine
  const {
    pharmacies,
    availabilityCounts,
    isLoading: isLoadingPharmacies,
    isError,
    refetch,
  } = usePharmaciesWithMedicine({
    medicineId: medicineId || selectedMedicine?.id || '',
    userLat: coordinates?.lat,
    userLng: coordinates?.lng,
    enabled: !!(medicineId || selectedMedicine?.id),
  });

  // Extract unique chains for filter
  const availableChains = useMemo(() => {
    const chains = new Set<string>();
    pharmacies.forEach((p) => {
      if (p.chainName) chains.add(p.chainName);
    });
    return Array.from(chains).sort();
  }, [pharmacies]);

  // Apply filters and sorting
  const filteredPharmacies = useMemo(() => {
    const filtered = filterPharmacies(pharmacies, filters);
    return sortPharmacies(filtered, filters.sortBy);
  }, [pharmacies, filters]);

  // Paginated results
  const displayedPharmacies = useMemo(
    () => filteredPharmacies.slice(0, displayCount),
    [filteredPharmacies, displayCount]
  );

  const hasMore = displayCount < filteredPharmacies.length;

  // Find the best match (first in-stock pharmacy)
  const bestMatchId = useMemo(() => {
    const bestMatch = filteredPharmacies.find((p) => p.stockStatus === 'in_stock');
    return bestMatch?.id;
  }, [filteredPharmacies]);

  // Handlers
  const handleMedicineSelect = useCallback(
    (medicine: MedicineSearchResult) => {
      setSelectedMedicine(medicine);
      setSearchParams({ medicineId: medicine.id });
      setLocalQuery(medicine.brand_name || medicine.generic_name);
      setDisplayCount(ITEMS_PER_PAGE);
    },
    [setSearchParams]
  );

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setLocalQuery(query);
    if (!query) {
      setSelectedMedicine(null);
    }
    // Clear the medicineId from URL when user starts typing a new search
    if (query && medicineId) {
      setSearchParams({ q: query }, { replace: true });
    }
  }, [medicineId, setSearchParams]);

  const handleSearchClear = useCallback(() => {
    setLocalQuery('');
    setSelectedMedicine(null);
    setSearchParams({});
  }, [setSearchParams]);

  const handleSearchSubmit = useCallback((query: string) => {
    // When user presses Enter with no results, search for the query
    setLocalQuery(query);
    setSearchParams({ q: query }, { replace: true });
  }, [setSearchParams]);

  // Determine what to show
  const showMedicineDetails = !!(medicineId || selectedMedicine);
  const isLoading = isLoadingPharmacies && showMedicineDetails;

  // Get the medicine to display (from selected or we'd need to fetch by ID)
  const displayMedicine = selectedMedicine;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0"
            aria-label="Go to home"
          >
            <div className="w-8 h-8 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-text-primary hidden sm:block">
              Curio
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <SearchBar
              value={localQuery}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              onSelect={handleMedicineSelect}
              onSearch={handleSearchSubmit}
              results={searchResults}
              isLoading={isSearching}
              placeholder="Search for medicines..."
              showDropdown={debouncedQuery.length >= 2 && debouncedQuery !== (selectedMedicine?.brand_name || selectedMedicine?.generic_name || '')}
            />
          </div>

          {/* Location Button (Desktop) */}
          <button
            type="button"
            className={cn(
              'hidden md:flex items-center gap-2 h-10 px-3 rounded-xl',
              'bg-slate-100 text-sm font-bold text-text-primary',
              'hover:bg-slate-200 transition-colors'
            )}
          >
            <span className="material-symbols-outlined text-[20px] text-primary">
              location_on
            </span>
            <span>{coordinates ? 'Near You' : 'Enable Location'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showMedicineDetails ? (
          <NoMedicineSelected />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar (Desktop) */}
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableChains={availableChains}
            />

            {/* Results Content */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Hero Card */}
              {isLoading ? (
                <HeroCardSkeleton />
              ) : displayMedicine ? (
                <MedicineHeroCard
                  medicine={displayMedicine}
                  availability={availabilityCounts}
                />
              ) : null}

              {/* Results Header */}
              <div className="flex items-center justify-between pt-2">
                <h2 className="text-lg font-bold text-text-primary">
                  Pharmacy Locations
                </h2>
                <span className="text-sm text-text-muted">
                  {filteredPharmacies.length === 0
                    ? 'No results'
                    : `${filteredPharmacies.length} ${filteredPharmacies.length === 1 ? 'pharmacy' : 'pharmacies'}`}
                </span>
              </div>

              {/* Results List */}
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <PharmacyCardSkeleton />
                  <PharmacyCardSkeleton />
                  <PharmacyCardSkeleton />
                </div>
              ) : isError ? (
                <ErrorState onRetry={refetch} />
              ) : filteredPharmacies.length === 0 ? (
                <NoPharmaciesFound
                  medicineName={displayMedicine?.brand_name || displayMedicine?.generic_name || 'this medicine'}
                />
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    {displayedPharmacies.map((pharmacy) => (
                      <PharmacyResultCard
                        key={pharmacy.id}
                        id={pharmacy.id}
                        name={pharmacy.name}
                        slug={pharmacy.slug}
                        address={pharmacy.address}
                        distanceMeters={pharmacy.distanceMeters}
                        stockStatus={pharmacy.stockStatus}
                        price={pharmacy.price}
                        lastReportedAt={pharmacy.lastReportedAt}
                        isVerified={pharmacy.isVerified}
                        is24Hours={pharmacy.is24Hours}
                        chainName={pharmacy.chainName}
                        logoUrl={pharmacy.logoUrl}
                        isBestMatch={pharmacy.id === bestMatchId}
                      />
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="flex justify-center mt-4">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Load more pharmacies ({filteredPharmacies.length - displayCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchResultsPage;
