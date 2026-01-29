/**
 * StatusSelector Component
 *
 * Three-option stock status selector with large touch targets.
 * Uses Filipino language for labels.
 *
 * @see references/alay_stock_report_contribution/code.html
 */

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { StockStatusEnum } from '@/types/database';
import { ALAY_COPY } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

interface StatusOption {
  value: StockStatusEnum;
  label: string;
  icon: string;
  activeClasses: string;
  inactiveClasses: string;
  iconBgActive: string;
  iconBgInactive: string;
}

interface StatusSelectorProps {
  /** Currently selected status */
  value: StockStatusEnum | null;
  /** Change handler */
  onChange: (status: StockStatusEnum) => void;
  /** Skip/I don't know handler */
  onSkip?: () => void;
  /** Whether selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'in_stock',
    label: ALAY_COPY.statusInStock,
    icon: 'check',
    activeClasses:
      'bg-primary border-transparent shadow-lg shadow-primary/25 text-white',
    inactiveClasses:
      'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    iconBgActive: 'bg-white/20 text-white',
    iconBgInactive:
      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30',
  },
  {
    value: 'low_stock',
    label: ALAY_COPY.statusLowStock,
    icon: 'warning',
    activeClasses:
      'bg-amber-500 border-transparent shadow-lg shadow-amber-500/25 text-white',
    inactiveClasses:
      'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    iconBgActive: 'bg-white/20 text-white',
    iconBgInactive:
      'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30',
  },
  {
    value: 'out_of_stock',
    label: ALAY_COPY.statusOutOfStock,
    icon: 'close',
    activeClasses:
      'bg-rose-500 border-transparent shadow-lg shadow-rose-500/25 text-white',
    inactiveClasses:
      'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20',
    iconBgActive: 'bg-white/20 text-white',
    iconBgInactive:
      'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function StatusSelector({
  value,
  onChange,
  onSkip,
  disabled = false,
  className,
}: StatusSelectorProps) {
  const handleSelect = useCallback(
    (status: StockStatusEnum) => {
      if (!disabled) {
        onChange(status);
      }
    },
    [disabled, onChange]
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Status Label */}
      <p className="text-sm font-medium text-muted mb-3 text-center">
        Ano ang status ng gamot na ito?
      </p>

      {/* Status Grid */}
      <div className="grid grid-cols-3 gap-3">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`${option.label} status`}
              className={cn(
                // Base styles
                'group flex flex-col items-center justify-center gap-2',
                'p-4 rounded-2xl border-2 transition-all',
                'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
                // Min touch target
                'min-h-[100px]',
                // Active vs Inactive
                isSelected ? option.activeClasses : option.inactiveClasses
              )}
            >
              {/* Icon Circle */}
              <div
                className={cn(
                  'size-12 rounded-full flex items-center justify-center transition-colors',
                  isSelected ? option.iconBgActive : option.iconBgInactive
                )}
              >
                <span className="material-symbols-outlined text-[28px] font-bold">
                  {option.icon}
                </span>
              </div>

              {/* Label */}
              <span
                className={cn(
                  'font-bold text-sm text-center leading-tight',
                  isSelected
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300'
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skip Option - only shown if onSkip provided */}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled}
          className={cn(
            'w-full mt-4 py-3 text-sm text-muted hover:text-primary',
            'transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {ALAY_COPY.skipOption}
        </button>
      )}
    </div>
  );
}

export default StatusSelector;
