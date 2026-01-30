import { cn } from '@/lib/utils';
import type { StockStatus } from '@/types/pharmacy';

interface StockBadgeProps {
  status: StockStatus;
  className?: string;
  showIcon?: boolean;
  /** Optional label override for screen readers */
  ariaLabel?: string;
}

const statusConfig = {
  in_stock: {
    label: 'May Stock',
    ariaLabel: 'In stock',
    className: 'bg-emerald-600 text-white',
    icon: 'check_circle',
  },
  low_stock: {
    label: 'Konti Na Lang',
    ariaLabel: 'Low stock',
    className: 'bg-amber-500 text-white',
    icon: 'warning',
  },
  out_of_stock: {
    label: 'Ubos Na',
    ariaLabel: 'Out of stock',
    className: 'bg-rose-500 text-white',
    icon: 'cancel',
  },
  unknown: {
    label: 'Unknown',
    ariaLabel: 'Stock status unknown',
    className: 'bg-gray-400 text-white',
    icon: 'help',
  },
};

export function StockBadge({
  status,
  className,
  showIcon = true,
  ariaLabel,
}: StockBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      role="status"
      aria-label={ariaLabel || `Stock status: ${config.ariaLabel}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold',
        config.className,
        className
      )}
    >
      {showIcon && (
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span>{config.label}</span>
    </div>
  );
}
