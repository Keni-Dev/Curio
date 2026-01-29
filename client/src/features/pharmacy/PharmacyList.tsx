/**
 * PharmacyList Component
 *
 * Renders a list of pharmacy cards with:
 * - Loading state with spinner
 * - Empty state message
 * - Click handling for pharmacy selection
 *
 * Used in search results and nearby pharmacies sections.
 */

import { PharmacyCard } from './PharmacyCard';
import { Spinner } from '@/components/ui';
import type { PharmacyWithStock } from '@/types/pharmacy';

// =============================================================================
// TYPES
// =============================================================================

interface PharmacyListProps {
  /** List of pharmacies to display */
  pharmacies: PharmacyWithStock[];
  /** Loading state */
  isLoading?: boolean;
  /** Click handler for individual pharmacy */
  onPharmacyClick?: (pharmacy: PharmacyWithStock) => void;
  /** Message shown when no pharmacies found */
  emptyMessage?: string;
  /** Whether to show compact cards */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PharmacyList({
  pharmacies,
  isLoading = false,
  onPharmacyClick,
  emptyMessage = 'No pharmacies found nearby',
  compact = false,
  className,
}: PharmacyListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-muted">Finding pharmacies...</p>
      </div>
    );
  }

  // Empty state
  if (pharmacies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <span
          className="material-symbols-outlined text-slate-300 dark:text-slate-600"
          style={{ fontSize: '48px' }}
        >
          local_pharmacy
        </span>
        <p className="text-text-muted text-center max-w-[200px]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results count */}
      <div className="flex items-center justify-between px-1 mb-3">
        <span className="text-sm font-medium text-text-secondary">
          {pharmacies.length} {pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'} found
        </span>
        <span className="text-xs text-text-muted">Sorted by distance</span>
      </div>

      {/* Pharmacy cards */}
      <div className="space-y-3">
        {pharmacies.map((pharmacy) => (
          <PharmacyCard
            key={pharmacy.id}
            pharmacy={pharmacy}
            compact={compact}
            onClick={
              onPharmacyClick ? () => onPharmacyClick(pharmacy) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
