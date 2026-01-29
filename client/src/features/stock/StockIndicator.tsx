/**
 * StockIndicator Component
 *
 * Displays stock status with visual indicator and freshness timestamp.
 * Used in stock lists to show medicine availability at a glance.
 */

import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import type { StockStatus } from '@/types/pharmacy';

// =============================================================================
// TYPES
// =============================================================================

interface StockIndicatorProps {
  status: StockStatus;
  lastReportedAt?: string;
  verifiedCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showFreshness?: boolean;
  className?: string;
}

// =============================================================================
// CONFIG
// =============================================================================

const statusConfig = {
  in_stock: {
    label: 'May Stock',
    shortLabel: 'May Stock',
    bgColor: 'bg-success/10',
    textColor: 'text-success',
    dotColor: 'bg-success',
    icon: 'check_circle',
  },
  low_stock: {
    label: 'Konti Na Lang',
    shortLabel: 'Konti',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
    dotColor: 'bg-warning',
    icon: 'warning',
  },
  out_of_stock: {
    label: 'Wala Na',
    shortLabel: 'Wala',
    bgColor: 'bg-danger/10',
    textColor: 'text-danger',
    dotColor: 'bg-danger',
    icon: 'cancel',
  },
  unknown: {
    label: 'Hindi Alam',
    shortLabel: '?',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    dotColor: 'bg-gray-400',
    icon: 'help',
  },
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-1 gap-1',
    dot: 'w-1.5 h-1.5',
    text: 'text-xs',
    icon: 'text-[14px]',
  },
  md: {
    container: 'px-3 py-1.5 gap-1.5',
    dot: 'w-2 h-2',
    text: 'text-sm',
    icon: 'text-[16px]',
  },
  lg: {
    container: 'px-4 py-2 gap-2',
    dot: 'w-2.5 h-2.5',
    text: 'text-base',
    icon: 'text-[18px]',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function StockIndicator({
  status,
  lastReportedAt,
  verifiedCount,
  size = 'md',
  showFreshness = true,
  className,
}: StockIndicatorProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <div className={cn('flex flex-col items-end gap-0.5', className)}>
      {/* Status Badge */}
      <div
        className={cn(
          'inline-flex items-center rounded-full font-semibold',
          config.bgColor,
          config.textColor,
          sizeStyles.container
        )}
      >
        <span className={cn('rounded-full', config.dotColor, sizeStyles.dot)} />
        <span className={sizeStyles.text}>
          {size === 'sm' ? config.shortLabel : config.label}
        </span>
      </div>

      {/* Freshness + Verified Count */}
      {showFreshness && (lastReportedAt || verifiedCount) && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          {lastReportedAt && (
            <span>{formatRelativeTime(lastReportedAt)}</span>
          )}
          {verifiedCount && verifiedCount > 0 && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">
                  verified
                </span>
                {verifiedCount}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default StockIndicator;
