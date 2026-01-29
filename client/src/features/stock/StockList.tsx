/**
 * StockList Component
 *
 * Scrollable list of medicine stock items with filtering.
 * Includes empty state and loading skeleton.
 */

import { useMemo, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { StockFilterTabs } from './StockFilterTabs';
import { StockListItem } from './StockListItem';
import type { MedicineStock, StockFilter } from './types';

// =============================================================================
// TYPES
// =============================================================================

interface StockListProps {
  items: MedicineStock[];
  isLoading?: boolean;
  onItemClick?: (item: MedicineStock) => void;
  emptyMessage?: string;
  className?: string;
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function StockListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 p-4 bg-white rounded-xl animate-pulse"
        >
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
            <div className="h-3 w-12 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

interface EmptyStateProps {
  filter: StockFilter;
  message?: string;
}

function EmptyState({ filter, message }: EmptyStateProps) {
  const defaultMessages: Record<StockFilter, string> = {
    all: 'Walang gamot na naireport sa botika na ito.',
    in_stock: 'Walang gamot na may stock.',
    low_stock: 'Walang gamot na konti na lang ang stock.',
    out_of_stock: 'Walang gamot na ubos na.',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-slate-400 text-3xl">
          inventory_2
        </span>
      </div>
      <p className="text-text-secondary">
        {message || defaultMessages[filter]}
      </p>
      <p className="text-sm text-text-muted mt-1">
        Mag-contribute ng stock update para makatulong sa iba!
      </p>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StockList({
  items,
  isLoading = false,
  onItemClick,
  emptyMessage,
  className,
}: StockListProps) {
  const [activeFilter, setActiveFilter] = useState<StockFilter>('all');

  // Calculate counts for each filter
  const counts = useMemo(() => {
    return {
      all: items.length,
      in_stock: items.filter((i) => i.status === 'in_stock').length,
      low_stock: items.filter((i) => i.status === 'low_stock').length,
      out_of_stock: items.filter((i) => i.status === 'out_of_stock').length,
    };
  }, [items]);

  // Filter items based on active filter
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((item) => item.status === activeFilter);
  }, [items, activeFilter]);

  // Handle filter change
  const handleFilterChange = useCallback((filter: StockFilter) => {
    setActiveFilter(filter);
  }, []);

  // Handle item click
  const handleItemClick = useCallback(
    (item: MedicineStock) => {
      onItemClick?.(item);
    },
    [onItemClick]
  );

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-20 bg-slate-200 rounded-full animate-pulse"
            />
          ))}
        </div>
        <StockListSkeleton />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Tabs */}
      <StockFilterTabs
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        counts={counts}
      />

      {/* Stock Items */}
      {filteredItems.length === 0 ? (
        <EmptyState filter={activeFilter} message={emptyMessage} />
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <StockListItem
              key={item.id}
              item={item}
              onClick={handleItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default StockList;
