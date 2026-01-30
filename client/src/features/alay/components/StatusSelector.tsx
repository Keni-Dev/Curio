/**
 * StatusSelector Component
 *
 * Two-button stock status selector with large touch targets.
 * Primary choice: "OO, MERON" (Yes, available) vs "WALA NA" (Out of stock)
 * Optional low stock toggle appears after selecting "OO, MERON"
 * 
 * Design based on reference: Prominent 2-column grid with
 * - Left: Outlined rose "WALA NA" with X icon
 * - Right: Solid primary "OO, MERON" with check icon and glow shadow
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
// COMPONENT
// =============================================================================

export function StatusSelector({
  value,
  onChange,
  onSkip,
  disabled = false,
  className,
}: StatusSelectorProps) {
  // Determine primary selection state
  const selectedYes = value === 'in_stock' || value === 'low_stock';
  const selectedNo = value === 'out_of_stock';
  const isLowStock = value === 'low_stock';
  const showLowStockToggle = selectedYes;

  const handleSelectYes = useCallback(() => {
    if (disabled) return;
    // Default to in_stock when first selecting yes
    onChange('in_stock');
  }, [disabled, onChange]);

  const handleSelectNo = useCallback(() => {
    if (disabled) return;
    onChange('out_of_stock');
  }, [disabled, onChange]);

  const handleLowStockToggle = useCallback(() => {
    if (disabled) return;
    // Toggle between in_stock and low_stock
    onChange(isLowStock ? 'in_stock' : 'low_stock');
  }, [disabled, isLowStock, onChange]);

  return (
    <div className={cn('w-full', className)}>
      {/* Status Question */}
      <p className="text-sm font-medium text-muted mb-4 text-center">
        {ALAY_COPY.statusQuestion}
      </p>

      {/* Two-Button Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* WALA NA Button (Outlined/Rose) */}
        <button
          type="button"
          onClick={handleSelectNo}
          disabled={disabled}
          aria-pressed={selectedNo}
          aria-label="Wala na - Out of stock"
          className={cn(
            // Base styles
            'group flex flex-col items-center justify-center gap-3',
            'p-5 rounded-2xl border-2 transition-all',
            'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
            // Min touch target
            'min-h-[130px]',
            // Active vs Inactive
            selectedNo
              ? 'bg-rose-500 border-transparent shadow-lg shadow-rose-500/25 text-white'
              : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-900/10'
          )}
        >
          {/* Icon Circle */}
          <div
            className={cn(
              'size-14 rounded-full flex items-center justify-center transition-colors',
              selectedNo
                ? 'bg-white/20 text-white'
                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30'
            )}
          >
            <span className="material-symbols-outlined text-[32px] font-bold">
              close
            </span>
          </div>

          {/* Label */}
          <span
            className={cn(
              'font-bold text-base text-center leading-tight',
              selectedNo ? 'text-white' : 'text-slate-600 dark:text-slate-300'
            )}
          >
            {ALAY_COPY.statusNo}
          </span>
        </button>

        {/* OO, MERON Button (Solid Primary with Glow) */}
        <button
          type="button"
          onClick={handleSelectYes}
          disabled={disabled}
          aria-pressed={selectedYes}
          aria-label="Oo, meron - In stock"
          className={cn(
            // Base styles
            'group flex flex-col items-center justify-center gap-3',
            'p-5 rounded-2xl border-2 transition-all',
            'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
            // Min touch target
            'min-h-[130px]',
            // Active vs Inactive - Primary with glow when selected
            selectedYes
              ? 'bg-primary border-transparent shadow-lg shadow-primary/30 text-white'
              : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10'
          )}
        >
          {/* Icon Circle */}
          <div
            className={cn(
              'size-14 rounded-full flex items-center justify-center transition-colors',
              selectedYes
                ? 'bg-white/20 text-white'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-primary group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30'
            )}
          >
            <span className="material-symbols-outlined text-[32px] font-bold">
              check
            </span>
          </div>

          {/* Label */}
          <span
            className={cn(
              'font-bold text-base text-center leading-tight',
              selectedYes ? 'text-white' : 'text-slate-600 dark:text-slate-300'
            )}
          >
            {ALAY_COPY.statusYes}
          </span>
        </button>
      </div>

      {/* Low Stock Toggle - Appears after selecting "Yes" */}
      {showLowStockToggle && selectedYes && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onClick={handleLowStockToggle}
            disabled={disabled}
            className={cn(
              'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all',
              isLowStock
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-amber-200'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'size-10 rounded-full flex items-center justify-center',
                  isLowStock
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">
                  warning
                </span>
              </div>
              <span
                className={cn(
                  'font-medium',
                  isLowStock
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-slate-600 dark:text-slate-300'
                )}
              >
                {ALAY_COPY.lowStockToggle}
              </span>
            </div>

            {/* Toggle Switch Visual */}
            <div
              className={cn(
                'w-12 h-7 rounded-full p-1 transition-colors',
                isLowStock ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'
              )}
            >
              <div
                className={cn(
                  'size-5 rounded-full bg-white shadow transition-transform',
                  isLowStock ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </div>
          </button>
        </div>
      )}

      {/* Skip Option */}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled}
          className={cn(
            'w-full mt-5 py-3 text-sm text-muted hover:text-primary',
            'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            'underline underline-offset-2 decoration-dotted'
          )}
        >
          {ALAY_COPY.skipLink}
        </button>
      )}
    </div>
  );
}

export default StatusSelector;
