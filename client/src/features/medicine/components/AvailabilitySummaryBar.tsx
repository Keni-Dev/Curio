/**
 * Availability Summary Bar Component
 *
 * Visual horizontal bar showing stock distribution across pharmacies.
 * Uses emerald (in_stock), amber (low_stock), and rose (out_of_stock) colors.
 */

import { cn } from '~lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface AvailabilityCounts {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface AvailabilitySummaryBarProps {
  counts: AvailabilityCounts;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AvailabilitySummaryBar({
  counts,
  className,
}: AvailabilitySummaryBarProps) {
  const total = counts.inStock + counts.lowStock + counts.outOfStock;

  if (total === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex justify-between items-end">
          <span className="text-sm font-semibold text-text-primary">
            Nearby Availability Summary
          </span>
          <span className="text-xs text-text-muted">No data available</span>
        </div>
        <div className="flex h-3 w-full rounded-lg overflow-hidden bg-slate-100">
          <div className="bg-slate-200 h-full w-full" />
        </div>
      </div>
    );
  }

  // Calculate percentages
  const inStockPercent = (counts.inStock / total) * 100;
  const lowStockPercent = (counts.lowStock / total) * 100;
  const outOfStockPercent = (counts.outOfStock / total) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex justify-between items-end">
        <span className="text-sm font-semibold text-text-primary">
          Nearby Availability Summary
        </span>
        <span className="text-xs text-text-muted">
          {total} {total === 1 ? 'Store' : 'Stores'} found
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="flex h-3 w-full rounded-lg overflow-hidden bg-slate-100"
        role="img"
        aria-label={`Stock availability: ${counts.inStock} in stock, ${counts.lowStock} limited, ${counts.outOfStock} out of stock`}
      >
        {counts.inStock > 0 && (
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${inStockPercent}%` }}
          />
        )}
        {counts.lowStock > 0 && (
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${lowStockPercent}%` }}
          />
        )}
        {counts.outOfStock > 0 && (
          <div
            className="bg-rose-500 h-full transition-all duration-300"
            style={{ width: `${outOfStockPercent}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs font-medium text-text-secondary">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
          <span>{counts.inStock} May Stock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
          <span>{counts.lowStock} Konti Na Lang</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
          <span>{counts.outOfStock} Ubos Na</span>
        </div>
      </div>
    </div>
  );
}

export default AvailabilitySummaryBar;
