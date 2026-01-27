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
import { cn, formatDistance } from '~lib/utils';
import { useMapStore } from '~stores/useMapStore';
import { useNearbyPharmacies } from '~features/pharmacy/hooks/useNearbyPharmacies';
import { Spinner } from '~components/ui';
import NavHeader from '~components/layout/NavHeader';
import type { PharmacyWithStock, StockStatus } from '~types/pharmacy';

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

interface PharmacyCardProps {
  pharmacy: PharmacyWithStock;
  isSelected: boolean;
  onClick: () => void;
}

// =============================================================================
// STOCK STATUS CONFIG
// =============================================================================

const STOCK_LABELS: Record<StockStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  unknown: 'Unknown',
};

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
    low_stock: 'bg-white/70 backdrop-blur-sm text-slate-700 border border-white/20',
    out_of_stock: 'bg-white/70 backdrop-blur-sm text-slate-700 border border-white/20',
    unknown: 'bg-white/70 backdrop-blur-sm text-slate-700 border border-white/20',
  };

  const inactiveClasses = 'bg-white/70 backdrop-blur-sm text-slate-700 border border-white/20 hover:bg-white/90';

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
// STOCK BADGE COMPONENT (inline for reference styling)
// =============================================================================

const StockBadgePill: React.FC<{ status: StockStatus }> = ({ status }) => {
  // Explicit class mappings matching reference design with borders
  const badgeClasses: Record<StockStatus, string> = {
    in_stock: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    low_stock: 'bg-amber-100 text-amber-700 border border-amber-200',
    out_of_stock: 'bg-rose-100 text-rose-700 border border-rose-200',
    unknown: 'bg-slate-100 text-slate-600 border border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold',
        badgeClasses[status]
      )}
    >
      {STOCK_LABELS[status]}
    </span>
  );
};

// =============================================================================
// PHARMACY CARD COMPONENT
// =============================================================================

const PharmacyCard: React.FC<PharmacyCardProps> = ({
  pharmacy,
  isSelected,
  onClick,
}) => {
  const timeAgo = pharmacy.lastReportedAt
    ? getTimeAgo(pharmacy.lastReportedAt)
    : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-2xl cursor-pointer transition-all duration-200 group',
        isSelected
          ? 'bg-white shadow-md'
          : 'bg-white/80 hover:bg-white'
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        {/* Left: Logo + Info */}
        <div className="flex gap-3 flex-1 min-w-0">
          {/* Pharmacy Logo */}
          <div className="size-10 rounded-full bg-slate-100 shrink-0 flex items-center justify-center overflow-hidden">
            {pharmacy.logoUrl ? (
              <img
                src={pharmacy.logoUrl}
                alt={pharmacy.name}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-lg">💊</span>
            )}
          </div>

          {/* Pharmacy Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
              {pharmacy.name}
            </h3>
            <p className="text-xs text-slate-500">
              {pharmacy.distance ? formatDistance(pharmacy.distance) : ''} •{' '}
              {pharmacy.is24Hours ? 'Open 24 Hours' : 'Varies'}
            </p>
          </div>
        </div>

        {/* Right: Stock Badge */}
        <StockBadgePill status={pharmacy.stockStatus} />
      </div>

      {/* Content below header - indented to align with text */}
      <div className="pl-[3.25rem]">
        {/* Freshness Indicator */}
        {timeAgo && (
          <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>Updated {timeAgo}</span>
          </div>
        )}

        {/* Medicine Info */}
        <p className="text-sm font-medium text-slate-600 truncate">
          Biogesic Paracetamol 500mg
        </p>

        {/* Action Buttons - Show on selected */}
        {isSelected && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (pharmacy.phone) {
                  window.location.href = `tel:${pharmacy.phone}`;
                }
              }}
              className="flex-1 h-9 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
            >
              Call
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`;
                window.open(url, '_blank');
              }}
              className="flex-1 h-9 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Directions
            </button>
          </div>
        )}

        {/* Verified Badge */}
        {pharmacy.isVerified && (
          <div className="flex items-center gap-1 text-teal-600 text-xs mt-2">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Verified Pharmacy</span>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

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
            {/* Search Bar Floating - Glass Panel */}
            <div
              className={cn(
                'rounded-full p-1.5 flex items-center',
                'bg-white/60 backdrop-blur-xl',
                'border border-white/20',
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]'
              )}
            >
              <div className="size-11 flex items-center justify-center rounded-full bg-primary/10 text-primary ml-1">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Maghanap ng gamot..."
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium h-11 px-3 text-base"
              />
              <button className="size-11 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors mr-1">
                <span className="material-symbols-outlined text-slate-500">tune</span>
              </button>
            </div>

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
                'bg-white/60 backdrop-blur-xl',
                'border border-white/20',
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]'
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
                    <PharmacyCard
                      key={pharmacy.id}
                      pharmacy={pharmacy}
                      isSelected={selectedPharmacyId === pharmacy.id}
                      onClick={() => handleCardClick(pharmacy)}
                    />
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Map Controls (Floating Right) */}
          <div className="flex-col gap-3 ml-auto hidden md:flex pointer-events-auto pt-4">
            <button
              className={cn(
                'size-12 rounded-full flex items-center justify-center',
                'bg-white/60 backdrop-blur-xl border border-white/20',
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]',
                'text-slate-700 hover:bg-white transition-colors'
              )}
              title="My Location"
            >
              <span className="material-symbols-outlined">my_location</span>
            </button>
            <button
              className={cn(
                'size-12 rounded-full flex items-center justify-center',
                'bg-white/60 backdrop-blur-xl border border-white/20',
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]',
                'text-slate-700 hover:bg-white transition-colors'
              )}
              title="Zoom In"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <button
              className={cn(
                'size-12 rounded-full flex items-center justify-center',
                'bg-white/60 backdrop-blur-xl border border-white/20',
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]',
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
        {/* Drag Handle */}
        <div className="flex justify-center py-2 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Sheet Content */}
        <div className="bg-white max-h-[60vh] overflow-hidden">
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Maghanap ng gamot..."
                className={cn(
                  'w-full pl-12 pr-4 py-3 rounded-xl',
                  'bg-slate-50 border border-slate-200',
                  'text-sm placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              />
            </div>

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
                <PharmacyCard
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  isSelected={selectedPharmacyId === pharmacy.id}
                  onClick={() => handleCardClick(pharmacy)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
