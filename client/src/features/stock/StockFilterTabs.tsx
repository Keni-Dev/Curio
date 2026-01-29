/**
 * StockFilterTabs Component
 *
 * Horizontal filter tabs for filtering medicine stock list.
 * Uses pill-style buttons with counts for each status.
 */

import { cn } from '@/lib/utils';
import type { StockFilter } from './types';

// =============================================================================
// TYPES
// =============================================================================

interface StockFilterTabsProps {
  activeFilter: StockFilter;
  onFilterChange: (filter: StockFilter) => void;
  counts?: {
    all: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
  className?: string;
}

// =============================================================================
// CONFIG
// =============================================================================

interface FilterConfig {
  value: StockFilter;
  label: string;
  activeClass: string;
}

const filters: FilterConfig[] = [
  {
    value: 'all',
    label: 'Lahat',
    activeClass: 'bg-primary text-white',
  },
  {
    value: 'in_stock',
    label: 'May Stock',
    activeClass: 'bg-success text-white',
  },
  {
    value: 'low_stock',
    label: 'Konti',
    activeClass: 'bg-warning text-white',
  },
  {
    value: 'out_of_stock',
    label: 'Wala',
    activeClass: 'bg-danger text-white',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function StockFilterTabs({
  activeFilter,
  onFilterChange,
  counts,
  className,
}: StockFilterTabsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide',
        className
      )}
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        const count = counts?.[filter.value];

        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap',
              'transition-all duration-200 active:scale-[0.97]',
              'min-h-[44px]', // Touch target
              isActive
                ? filter.activeClass
                : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
            )}
          >
            <span>{filter.label}</span>
            {count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default StockFilterTabs;
