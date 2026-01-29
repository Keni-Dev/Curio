/**
 * MedicineSelector Component
 *
 * Medicine search and selection for stock reports.
 * Includes quick-select pills for common medicines and debounced search.
 *
 * @see references/alay_stock_report_contribution/code.html
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/lib/supabase';
import type { Medicine } from '@/types/medicine';

// =============================================================================
// TYPES
// =============================================================================

interface MedicineSelectorProps {
  /** Pharmacy ID for context */
  pharmacyId: string;
  /** Currently selected medicine ID */
  selectedId: string | null;
  /** Selection handler */
  onSelect: (medicineId: string, medicineName: string) => void;
  /** Additional CSS classes */
  className?: string;
}

interface QuickSelectMedicine {
  id: string;
  name: string;
  isHighDemand?: boolean;
}

// =============================================================================
// QUICK SELECT DATA
// =============================================================================

const COMMON_MEDICINES: QuickSelectMedicine[] = [
  { id: 'biogesic', name: 'Biogesic 500mg', isHighDemand: true },
  { id: 'neozep', name: 'Neozep Forte', isHighDemand: true },
  { id: 'bioflu', name: 'Bioflu', isHighDemand: false },
  { id: 'alaxan', name: 'Alaxan FR', isHighDemand: false },
  { id: 'diatabs', name: 'Diatabs', isHighDemand: false },
  { id: 'kremil-s', name: 'Kremil-S', isHighDemand: false },
];

// =============================================================================
// SEARCH QUERY
// =============================================================================

async function searchMedicines(query: string): Promise<Medicine[]> {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('medicines')
    .select('id, brand_name, generic_name, dosage, form, category, requires_prescription')
    .or(`brand_name.ilike.%${query}%,generic_name.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    brandName: row.brand_name || undefined,
    genericName: row.generic_name,
    dosage: row.dosage || undefined,
    form: row.form || undefined,
    category: row.category || undefined,
    requiresPrescription: row.requires_prescription || false,
    tags: [],
  }));
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MedicineSelector({
  // pharmacyId - reserved for future pharmacy-specific medicine filtering
  selectedId,
  onSelect,
  className,
}: MedicineSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['medicines', 'search', debouncedQuery],
    queryFn: () => searchMedicines(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleQuickSelect = useCallback(
    (medicine: QuickSelectMedicine) => {
      onSelect(medicine.id, medicine.name);
    },
    [onSelect]
  );

  const handleSearchSelect = useCallback(
    (medicine: Medicine) => {
      const name = medicine.brandName || medicine.genericName;
      const fullName = medicine.dosage ? `${name} ${medicine.dosage}` : name;
      onSelect(medicine.id, fullName);
      setSearchQuery('');
    },
    [onSelect]
  );

  const showSearchResults = debouncedQuery.length >= 2;
  const hasResults = searchResults && searchResults.length > 0;

  return (
    <div className={cn('w-full', className)}>
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Hanapin ang gamot..."
          className={cn(
            'w-full h-12 pl-12 pr-4 rounded-xl',
            'bg-slate-100 dark:bg-white/5',
            'border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20',
            'text-text-primary placeholder:text-muted',
            'transition-all outline-none'
          )}
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <div className="mb-6">
          {hasResults ? (
            <div className="space-y-2">
              {searchResults.map((medicine) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  isSelected={medicine.id === selectedId}
                  onSelect={() => handleSearchSelect(medicine)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted text-sm py-4">
              Walang nakitang resulta para sa "{debouncedQuery}"
            </p>
          )}
        </div>
      )}

      {/* Quick Select Section */}
      {!showSearchResults && (
        <>
          <p className="text-sm font-medium text-muted mb-3">
            Karaniwang gamot
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {COMMON_MEDICINES.map((medicine) => (
              <button
                key={medicine.id}
                type="button"
                onClick={() => handleQuickSelect(medicine)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium',
                  'border transition-all active:scale-[0.98]',
                  selectedId === medicine.id
                    ? 'bg-primary text-white border-transparent'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-primary/50'
                )}
              >
                {medicine.name}
                {medicine.isHighDemand && (
                  <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    HIGH
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Photo Upload Placeholder */}
      <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-muted">
            <span className="material-symbols-outlined">add_a_photo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Mag-upload ng litrato</span>
            <span className="bg-slate-200 dark:bg-white/10 text-muted text-[10px] font-bold px-2 py-0.5 rounded-full">
              COMING SOON
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MEDICINE CARD SUB-COMPONENT
// =============================================================================

interface MedicineCardProps {
  medicine: Medicine;
  isSelected: boolean;
  onSelect: () => void;
}

function MedicineCard({ medicine, isSelected, onSelect }: MedicineCardProps) {
  const displayName = medicine.brandName || medicine.genericName;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full p-4 rounded-xl border-2 text-left transition-all',
        'flex items-center gap-4 group',
        'active:scale-[0.99]',
        isSelected
          ? 'bg-primary/5 dark:bg-primary/10 border-primary/30'
          : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-primary/20'
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          'size-14 rounded-lg flex items-center justify-center shrink-0',
          'bg-white dark:bg-white/10 shadow-sm border border-slate-100 dark:border-white/5'
        )}
      >
        <span className="material-symbols-outlined text-[28px] text-primary">
          medication
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-1">
          {medicine.form && (
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              {medicine.form}
            </span>
          )}
          {medicine.requiresPrescription && (
            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Rx
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-base font-bold text-text-primary truncate">
          {displayName}
          {medicine.dosage && (
            <span className="font-normal text-muted ml-1">
              {medicine.dosage}
            </span>
          )}
        </h3>

        {/* Generic Name (if brand shown) */}
        {medicine.brandName && medicine.genericName && (
          <p className="text-xs text-muted truncate">{medicine.genericName}</p>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-[16px]">
            check
          </span>
        </div>
      )}
    </button>
  );
}

export default MedicineSelector;
