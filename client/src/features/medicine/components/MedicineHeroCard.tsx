/**
 * Medicine Hero Card Component
 *
 * Large featured card displaying medicine details:
 * - Brand/generic name, dosage, form
 * - Rx ID badge for prescription medicines
 * - Availability summary bar
 * - Medicine image placeholder
 */

import { cn } from '~lib/utils';
import { AvailabilitySummaryBar } from './AvailabilitySummaryBar';
import type { MedicineSearchResult } from '~types/database';

// =============================================================================
// TYPES
// =============================================================================

interface AvailabilityCounts {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface MedicineHeroCardProps {
  medicine: MedicineSearchResult;
  availability: AvailabilityCounts;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MedicineHeroCard({
  medicine,
  availability,
  className,
}: MedicineHeroCardProps) {
  const displayName = medicine.brand_name || medicine.generic_name;
  const subtitle = medicine.brand_name
    ? `${medicine.generic_name}${medicine.dosage ? ` ${medicine.dosage}` : ''}`
    : medicine.dosage || '';
  const formText = medicine.form ? ` ${medicine.form}` : '';

  return (
    <div
      className={cn(
        'bg-white/90 backdrop-blur-md rounded-2xl shadow-card overflow-hidden',
        'flex flex-col md:flex-row',
        'border-l-4 border-primary',
        className
      )}
    >
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">
              Medicine Details
            </span>
            {medicine.requires_prescription && (
              <span className="text-xs font-mono text-text-muted bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Rx Required
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary leading-tight">
            {displayName}
          </h1>

          {subtitle && (
            <p className="text-text-secondary font-medium text-lg">
              {subtitle}
              {formText}
            </p>
          )}

          {/* Category & Tags */}
          {(medicine.category || medicine.tags?.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {medicine.category && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {medicine.category}
                </span>
              )}
              {medicine.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-text-secondary text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Availability Summary */}
        <AvailabilitySummaryBar counts={availability} className="mt-2" />
      </div>

      {/* Image Section */}
      <div className="md:w-64 h-48 md:h-auto bg-slate-50 relative">
        <div className="absolute inset-0 p-6 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[80px] text-primary/30"
              aria-hidden="true"
            >
              medication
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineHeroCard;
