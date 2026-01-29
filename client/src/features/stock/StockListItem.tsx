/**
 * StockListItem Component
 *
 * Individual medicine item in the stock list.
 * Shows medicine name, dosage, price, and stock status.
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { StockIndicator } from './StockIndicator';
import type { MedicineStock } from './types';

// =============================================================================
// TYPES
// =============================================================================

interface StockListItemProps {
  item: MedicineStock;
  onClick?: (item: MedicineStock) => void;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

function StockListItemComponent({
  item,
  onClick,
  className,
}: StockListItemProps) {
  const handleClick = () => {
    onClick?.(item);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center justify-between gap-3 p-4',
        'bg-white rounded-xl border border-slate-100',
        'transition-all duration-200',
        'hover:bg-slate-50 hover:border-slate-200',
        'active:scale-[0.99]',
        'min-h-[72px]', // Touch target
        className
      )}
    >
      {/* Medicine Info */}
      <div className="flex-1 min-w-0 text-left">
        {/* Brand Name */}
        <h4 className="text-base font-semibold text-text-primary truncate">
          {item.brandName || item.medicineName}
        </h4>

        {/* Generic Name + Dosage */}
        <p className="text-sm text-text-secondary truncate">
          {item.genericName && (
            <span className="text-text-muted">{item.genericName}</span>
          )}
          {item.genericName && item.dosage && (
            <span className="mx-1">•</span>
          )}
          {item.dosage && <span>{item.dosage}</span>}
          {item.formulation && (
            <>
              <span className="mx-1">•</span>
              <span className="capitalize">{item.formulation}</span>
            </>
          )}
        </p>

        {/* Price */}
        {item.price && (
          <p className="text-sm font-semibold text-primary mt-0.5">
            {formatPrice(item.price)}
          </p>
        )}
      </div>

      {/* Stock Status */}
      <StockIndicator
        status={item.status}
        lastReportedAt={item.lastReportedAt}
        verifiedCount={item.verifiedCount}
        size="sm"
      />
    </button>
  );
}

// Memoize to prevent unnecessary re-renders in list
export const StockListItem = memo(StockListItemComponent);

export default StockListItem;
