/**
 * Search Filters Component
 *
 * Desktop: Sidebar with sort dropdown, pharmacy chain checkboxes, availability pills
 * Mobile: Floating FAB that opens BottomSheet with same controls
 */

import { useState, useMemo, useCallback } from 'react';
import { cn } from '~lib/utils';
import { BottomSheet } from '~components/ui/BottomSheet';
import { Button } from '~components/ui/Button';
import type { StockStatus } from '~types/database';

// =============================================================================
// TYPES
// =============================================================================

export type SortOption = 'distance' | 'price_low' | 'price_high' | 'stock';

export interface SearchFiltersState {
  sortBy: SortOption;
  pharmacyChains: string[];
  availability: StockStatus[];
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
  availableChains: string[];
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'distance', label: 'Nearest Location' },
  { value: 'price_low', label: 'Lowest Price' },
  { value: 'price_high', label: 'Highest Price' },
  { value: 'stock', label: 'Best Availability' },
];

const AVAILABILITY_OPTIONS: { value: StockStatus; label: string; color: string }[] = [
  { value: 'in_stock', label: 'May Stock', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  { value: 'low_stock', label: 'Konti Na Lang', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  { value: 'out_of_stock', label: 'Ubos Na', color: 'bg-rose-500/10 text-rose-700 border-rose-500/20' },
];

// =============================================================================
// FILTER CONTENT COMPONENT
// =============================================================================

interface FilterContentProps {
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
  availableChains: string[];
  onReset?: () => void;
}

function FilterContent({
  filters,
  onFiltersChange,
  availableChains,
  onReset,
}: FilterContentProps) {
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ ...filters, sortBy: e.target.value as SortOption });
    },
    [filters, onFiltersChange]
  );

  const handleChainToggle = useCallback(
    (chain: string) => {
      const newChains = filters.pharmacyChains.includes(chain)
        ? filters.pharmacyChains.filter((c) => c !== chain)
        : [...filters.pharmacyChains, chain];
      onFiltersChange({ ...filters, pharmacyChains: newChains });
    },
    [filters, onFiltersChange]
  );

  const handleAvailabilityToggle = useCallback(
    (status: StockStatus) => {
      const newAvailability = filters.availability.includes(status)
        ? filters.availability.filter((s) => s !== status)
        : [...filters.availability, status];
      onFiltersChange({ ...filters, availability: newAvailability });
    },
    [filters, onFiltersChange]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sortBy !== 'distance') count += 1;
    if (filters.pharmacyChains.length > 0) count += 1;
    if (filters.availability.length > 0 && filters.availability.length < 3) count += 1;
    return count;
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header with reset */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined" aria-hidden="true">tune</span>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {onReset && activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-primary hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Sort By */}
      <div>
        <label
          htmlFor="sort-select"
          className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block"
        >
          Sort By
        </label>
        <select
          id="sort-select"
          value={filters.sortBy}
          onChange={handleSortChange}
          className={cn(
            'w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm',
            'focus:ring-2 focus:ring-primary/50 focus:outline-none',
            'appearance-none cursor-pointer'
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pharmacy Chain */}
      {availableChains.length > 0 && (
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 block">
            Pharmacy Chain
          </label>
          <div className="space-y-2">
            {availableChains.map((chain) => (
              <label
                key={chain}
                className="flex items-center gap-3 text-sm cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.pharmacyChains.includes(chain)}
                  onChange={() => handleChainToggle(chain)}
                  className={cn(
                    'rounded border-slate-300 text-primary',
                    'focus:ring-primary bg-transparent',
                    'w-5 h-5 cursor-pointer'
                  )}
                />
                <span className="group-hover:text-primary transition-colors">
                  {chain}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Availability Filter */}
      <div>
        <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 block">
          Availability
        </label>
        <div className="flex gap-2 flex-wrap">
          {AVAILABILITY_OPTIONS.map((option) => {
            const isActive = filters.availability.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAvailabilityToggle(option.value)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full font-bold border transition-all',
                  isActive
                    ? option.color
                    : 'bg-slate-100 text-text-secondary border-slate-200 hover:border-primary/30'
                )}
                aria-pressed={isActive}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SearchFilters({
  filters,
  onFiltersChange,
  availableChains,
  className,
}: SearchFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleReset = useCallback(() => {
    onFiltersChange({
      sortBy: 'distance',
      pharmacyChains: [],
      availability: [],
    });
  }, [onFiltersChange]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sortBy !== 'distance') count += 1;
    if (filters.pharmacyChains.length > 0) count += 1;
    if (filters.availability.length > 0 && filters.availability.length < 3) count += 1;
    return count;
  }, [filters]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block w-64 shrink-0',
          className
        )}
      >
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-card border border-slate-100 sticky top-24">
          <FilterContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            availableChains={availableChains}
            onReset={handleReset}
          />
        </div>
      </aside>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsMobileOpen(true)}
          className="rounded-full shadow-lg shadow-primary/30 w-14 h-14 p-0"
          aria-label="Open filters"
        >
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
            tune
          </span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        title="Filters"
        defaultSnap="half"
        showCloseButton
      >
        <div className="px-4 pb-8">
          <FilterContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            availableChains={availableChains}
            onReset={handleReset}
          />

          {/* Apply Button for Mobile */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <Button
              variant="primary"
              fullWidth
              onClick={() => setIsMobileOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

export default SearchFilters;
