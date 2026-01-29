/**
 * HomePage Component
 *
 * Main map view page with pharmacy finder.
 * Redesigned to match reference with:
 * - Top navigation header
 * - Light sidebar panel (not glass)
 * - Improved pharmacy cards with action buttons
 * - Clean filter chips
 */

import React, { lazy, Suspense, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '~lib/utils';
import { useMapStore } from '~stores/useMapStore';
import { useSearchStore } from '~stores/useSearchStore';
import { useNearbyPharmacies, PharmacyCard as PharmacyCardNew, SelectedPharmacySheet } from '~features/pharmacy';
import { Spinner } from '~components/ui';
import { SearchBar } from '~components/search';
import NavHeader from '~components/layout/NavHeader';
import type { PharmacyWithStock, StockStatus } from '~types/pharmacy';
import type { MedicineSearchResult } from '~types/database';

// Lazy load map components (heavy bundle)
const MapView = lazy(() => import('~components/map/MapView'));

// =============================================================================
// TYPES
// =============================================================================

interface FilterChipProps {
  label: string;
  status: StockStatus;
  isActive: boolean;
  onClick: () => void;
}

// =============================================================================
// FILTER CHIP COMPONENT
// =============================================================================

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  status,
  isActive,
  onClick,
}) => {
  // Active filter shows checkmark and uses primary color for 'in_stock'
  // Other active filters use their respective colors
  const activeClasses: Record<StockStatus, string> = {
    in_stock: 'bg-primary text-white shadow-sm',
    low_stock: 'bg-white/60 backdrop-blur-sm text-slate-700 border border-white/15',
    out_of_stock: 'bg-white/60 backdrop-blur-sm text-slate-700 border border-white/15',
    unknown: 'bg-white/60 backdrop-blur-sm text-slate-700 border border-white/15',
  };

  const inactiveClasses = 'bg-white/60 backdrop-blur-sm text-slate-700 border border-white/15 hover:bg-white/80';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium',
        'shadow-sm transition-all duration-200 whitespace-nowrap shrink-0',
        isActive ? activeClasses[status] : inactiveClasses
      )}
    >
      {isActive && (
        <span className="material-symbols-outlined text-[18px]">check</span>
      )}
      {label}
    </button>
  );
};

// =============================================================================
// MAP LOADING FALLBACK
// =============================================================================

const MapLoadingFallback: React.FC = () => (
  <div className="h-full w-full bg-slate-100 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <span className="text-sm font-medium text-text-secondary">
        Loading map...
      </span>
    </div>
  </div>
);

// =============================================================================
// HOMEPAGE COMPONENT
// =============================================================================

const HomePage: React.FC = () => {
  // Search state from store (for selected medicine)
  const selectedMedicine = useSearchStore((s) => s.selectedMedicine);
  const selectMedicine = useSearchStore((s) => s.selectMedicine);

  // Local search query for pharmacy name filtering
  const [searchQuery, setSearchQuery] = useState('');

  // Store
  const {
    center,
    stockFilters,
    toggleStockFilter,
    selectedPharmacyId,
    selectPharmacy,
    maxDistance,
  } = useMapStore();

  // Fetch nearby pharmacies
  const { pharmacies, isLoading, isError, refetch } = useNearbyPharmacies({
    center,
    radiusMeters: maxDistance,
  });

  // Filter pharmacies by stock status and search query
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((pharmacy) => {
      // Stock filter
      if (!stockFilters.includes(pharmacy.stockStatus)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          pharmacy.name.toLowerCase().includes(query) ||
          pharmacy.address.toLowerCase().includes(query) ||
          pharmacy.chainName?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [pharmacies, stockFilters, searchQuery]);

  // Handlers
  const handlePharmacyClick = useCallback(
    (pharmacy: PharmacyWithStock) => {
      selectPharmacy(pharmacy.id);
    },
    [selectPharmacy]
  );

  const handleCardClick = useCallback(
    (pharmacy: PharmacyWithStock) => {
      selectPharmacy(pharmacy.id);
    },
    [selectPharmacy]
  );

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-200">
      {/* Map (full screen background) */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<MapLoadingFallback />}>
          <MapView
            pharmacies={filteredPharmacies}
            isLoading={isLoading}
            onPharmacyClick={handlePharmacyClick}
          />
        </Suspense>
      </div>

      {/* UI Overlay Layer */}
      <div className="relative z-20 flex flex-col h-full pointer-events-none">
        {/* Navigation Header */}
        <NavHeader />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden max-w-[1440px] mx-auto w-full px-4 pb-4 gap-4 pointer-events-none">
          {/* Left Sidebar Floating Panel - Desktop */}
          <aside className="w-full max-w-[400px] hidden md:flex flex-col gap-4 pointer-events-auto h-full pb-2">
            {/* Medicine Search Bar with Voice Search & Autocomplete */}
            <SearchBar
              onSelect={(medicine: MedicineSearchResult) => {
                selectMedicine(medicine);
                // Update search query to filter pharmacies by medicine
                setSearchQuery(medicine.brand_name || medicine.generic_name);
              }}
              placeholder="Maghanap ng gamot..."
            />

            {/* Selected Medicine Indicator */}
            {selectedMedicine && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl border border-primary/20">
                <span className="material-symbols-outlined text-primary text-lg">medication</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">
                    {selectedMedicine.brand_name || selectedMedicine.generic_name}
                  </p>
                  {selectedMedicine.brand_name && (
                    <p className="text-xs text-muted truncate">{selectedMedicine.generic_name}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    selectMedicine(null);
                    setSearchQuery('');
                  }}
                  className="size-6 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-sm">close</span>
                </button>
              </div>
            )}

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1">
              <FilterChip
                label="In Stock"
                status="in_stock"
                isActive={stockFilters.includes('in_stock')}
                onClick={() => toggleStockFilter('in_stock')}
              />
              <FilterChip
                label="Low Stock"
                status="low_stock"
                isActive={stockFilters.includes('low_stock')}
                onClick={() => toggleStockFilter('low_stock')}
              />
              <FilterChip
                label="Out of Stock"
                status="out_of_stock"
                isActive={stockFilters.includes('out_of_stock')}
                onClick={() => toggleStockFilter('out_of_stock')}
              />
            </div>

            {/* Results List Panel - Glass Panel */}
            <div
              className={cn(
                'flex-1 rounded-[2rem] flex flex-col overflow-hidden min-h-0',
                'bg-white/50 backdrop-blur-xl',
                'border border-white/15',
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]'
              )}
            >
              {/* Handle/Header */}
              <div className="p-6 pb-2 shrink-0">
                <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4 md:hidden" />
                <h2 className="text-xl font-bold text-slate-800 leading-tight">
                  {filteredPharmacies.length} na botika malapit sa'yo
                </h2>
                <p className="text-sm text-slate-500 mt-1">Updated in real-time</p>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 scrollbar-hide">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="md" />
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-rose-400 mb-2">
                      error
                    </span>
                    <p className="text-sm text-slate-600 mb-3">
                      Failed to load pharmacies
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredPharmacies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                      search_off
                    </span>
                    <p className="text-sm text-slate-500">
                      No pharmacies found matching your filters
                    </p>
                  </div>
                ) : (
                  filteredPharmacies.map((pharmacy) => (
                    <PharmacyCardNew
                      key={pharmacy.id}
                      pharmacy={pharmacy}
                      showDistance={true}
                      compact={false}
                      onClick={() => handleCardClick(pharmacy)}
                      className={selectedPharmacyId === pharmacy.id ? 'ring-2 ring-primary' : ''}
                    />
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Map Controls (Floating Right) */}
          <div className="flex-col gap-3 ml-auto hidden md:flex pointer-events-auto pt-4">
            {/* Scanner FAB - Desktop */}
            <Link
              to="/scanner"
              className={cn(
                'size-14 rounded-full flex items-center justify-center',
                'bg-accent hover:bg-accent-hover',
                'shadow-lg shadow-accent/30',
                'text-white transition-all hover:scale-105'
              )}
              title="Scan Prescription"
            >
              <span className="material-symbols-outlined text-[28px]">document_scanner</span>
            </Link>
            <div className="h-2" /> {/* Spacer */}
            <button
              className={cn(
                'size-12 rounded-full flex items-center justify-center',
                'bg-white/50 backdrop-blur-xl border border-white/15',
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]',
                'text-slate-700 hover:bg-white transition-colors'
              )}
              title="My Location"
            >
              <span className="material-symbols-outlined">my_location</span>
            </button>
            <button
              className={cn(
                'size-12 rounded-full flex items-center justify-center',
                'bg-white/50 backdrop-blur-xl border border-white/15',
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]',
                'text-slate-700 hover:bg-white transition-colors'
              )}
              title="Zoom In"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <button
              className={cn(
                'size-12 rounded-full flex items-center justify-center',
                'bg-white/50 backdrop-blur-xl border border-white/15',
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]',
                'text-slate-700 hover:bg-white transition-colors'
              )}
              title="Zoom Out"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-10 pointer-events-auto">
        {/* Mobile Scanner FAB */}
        <Link
          to="/scanner"
          className={cn(
            'absolute -top-20 right-4 size-14 rounded-full',
            'flex items-center justify-center',
            'bg-accent hover:bg-accent-hover',
            'shadow-lg shadow-accent/30',
            'text-white transition-all active:scale-95'
          )}
        >
          <span className="material-symbols-outlined text-[28px]">document_scanner</span>
        </Link>

        {/* Drag Handle */}
        <div className="flex justify-center py-2 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Sheet Content */}
        <div className="bg-white max-h-[60vh] overflow-hidden">
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100">
            <SearchBar
              onSelect={(medicine: MedicineSearchResult) => {
                selectMedicine(medicine);
                setSearchQuery(medicine.brand_name || medicine.generic_name);
              }}
              placeholder="Maghanap ng gamot..."
            />

            {/* Selected Medicine Indicator - Mobile */}
            {selectedMedicine && (
              <div className="flex items-center gap-2 px-3 py-2 mt-3 bg-primary/10 rounded-xl border border-primary/20">
                <span className="material-symbols-outlined text-primary text-lg">medication</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">
                    {selectedMedicine.brand_name || selectedMedicine.generic_name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    selectMedicine(null);
                    setSearchQuery('');
                  }}
                  className="size-6 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-sm">close</span>
                </button>
              </div>
            )}

            {/* Mobile Filters */}
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
              <FilterChip
                label="In Stock"
                status="in_stock"
                isActive={stockFilters.includes('in_stock')}
                onClick={() => toggleStockFilter('in_stock')}
              />
              <FilterChip
                label="Low Stock"
                status="low_stock"
                isActive={stockFilters.includes('low_stock')}
                onClick={() => toggleStockFilter('low_stock')}
              />
              <FilterChip
                label="Out of Stock"
                status="out_of_stock"
                isActive={stockFilters.includes('out_of_stock')}
                onClick={() => toggleStockFilter('out_of_stock')}
              />
            </div>
          </div>

          {/* Results Header */}
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-slate-600">
              {filteredPharmacies.length} na botika malapit sa'yo
            </p>
          </div>

          {/* Pharmacy List */}
          <div className="overflow-y-auto max-h-[35vh] px-3 pb-safe space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : filteredPharmacies.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No pharmacies found
              </p>
            ) : (
              filteredPharmacies.slice(0, 5).map((pharmacy) => (
                <PharmacyCardNew
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  showDistance={true}
                  compact={true}
                  onClick={() => handleCardClick(pharmacy)}
                  className={selectedPharmacyId === pharmacy.id ? 'ring-2 ring-primary' : ''}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected Pharmacy Bottom Sheet */}
      <SelectedPharmacySheet />
    </div>
  );
};

export default HomePage;
