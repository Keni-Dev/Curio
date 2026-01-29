/**
 * EnhancedStockList Component
 *
 * Advanced stock list with freshness-sorted items and freshness legend.
 * Supports real-time updates and helpful vote notifications.
 */

import { useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { StockFilterTabs } from './StockFilterTabs';
import { LiveStockCard } from './LiveStockCard';
import {
  calculateFreshness,
  type FreshnessLevel,
} from '@/lib/freshness';
import type { MedicineStock, StockFilter } from './types';

// =============================================================================
// TYPES
// =============================================================================

interface EnhancedStockListProps {
  items: MedicineStock[];
  pharmacyId: string;
  isLoading?: boolean;
  onItemClick?: (item: MedicineStock) => void;
  onVoteSuccess?: (item: MedicineStock) => void;
  showLegend?: boolean;
  emptyMessage?: string;
  className?: string;
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function EnhancedStockSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative flex items-center gap-3 p-4 pl-5 bg-white rounded-xl animate-pulse"
        >
          {/* Freshness bar skeleton */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
            <div className="h-3 w-1/3 bg-slate-100 rounded" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
            <div className="h-8 w-14 bg-slate-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// FRESHNESS LEGEND
// =============================================================================

interface FreshnessLegendProps {
  className?: string;
}

function FreshnessLegend({ className }: FreshnessLegendProps) {
  const legendItems: { level: FreshnessLevel; label: string; color: string }[] = [
    { level: 'fresh', label: 'Bago', color: 'bg-emerald-500' },
    { level: 'aging', label: 'Medyo Luma', color: 'bg-amber-500' },
    { level: 'stale', label: 'Lumang Report', color: 'bg-rose-400' },
  ];

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4 py-2 px-3',
        'bg-slate-50 rounded-lg text-xs',
        className
      )}
    >
      <span className="text-text-muted font-medium">Freshness:</span>
      {legendItems.map((item) => (
        <div key={item.level} className="flex items-center gap-1.5">
          <div className={cn('w-2 h-2 rounded-full', item.color)} />
          <span className="text-text-secondary">{item.label}</span>
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

export function EnhancedStockList({
  items,
  pharmacyId,
  isLoading = false,
  onItemClick,
  onVoteSuccess,
  showLegend = true,
  emptyMessage,
  className,
}: EnhancedStockListProps) {
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

  // Filter and sort items by freshness (freshest first)
  const sortedItems = useMemo(() => {
    // First filter by status
    const filtered =
      activeFilter === 'all'
        ? items
        : items.filter((item) => item.status === activeFilter);

    // Then sort by freshness (freshest first)
    return [...filtered].sort((a, b) => {
      const freshnessA = calculateFreshness(a.lastReportedAt);
      const freshnessB = calculateFreshness(b.lastReportedAt);
      return freshnessB - freshnessA;
    });
  }, [items, activeFilter]);

  // Note: Items could be grouped by freshness level if needed in the future
  // const groupedItems = { fresh: [...], aging: [...], stale: [...] }

  const handleFilterChange = useCallback((filter: StockFilter) => {
    setActiveFilter(filter);
  }, []);

  const handleVoteSuccess = useCallback(
    (item: MedicineStock) => {
      onVoteSuccess?.(item);
    },
    [onVoteSuccess]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <StockFilterTabs
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        {showLegend && <FreshnessLegend />}
        <EnhancedStockSkeleton />
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

      {/* Freshness Legend */}
      {showLegend && sortedItems.length > 0 && <FreshnessLegend />}

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <EmptyState filter={activeFilter} message={emptyMessage} />
      )}

      {/* Stock Items - sorted by freshness */}
      {sortedItems.length > 0 && (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pb-4 scrollbar-thin">
          {sortedItems.map((item) => (
            <LiveStockCard
              key={item.id}
              item={item}
              pharmacyId={pharmacyId}
              onClick={onItemClick}
              onVoteSuccess={() => handleVoteSuccess(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EnhancedStockList;
