/**
 * Search Results Component
 *
 * Displays medicine search results with loading skeletons.
 * Shows medicine name, generic name, dosage, form, and Rx badge.
 */

import type React from 'react';
import type { MedicineSearchResult } from '~types/database';
import { cn } from '~lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface SearchResultsProps {
  /** Search results to display */
  results: MedicineSearchResult[] | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Currently highlighted index for keyboard navigation */
  highlightedIndex: number;
  /** Callback when a result is clicked */
  onSelect: (medicine: MedicineSearchResult) => void;
  /** Callback when hovering over a result */
  onHighlight: (index: number) => void;
  /** Search query for highlighting matches */
  query: string;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// SKELETON COMPONENT
// =============================================================================

const SearchResultSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
    {/* Icon placeholder */}
    <div className="size-10 rounded-lg bg-slate-200 dark:bg-slate-700" />

    {/* Text placeholders */}
    <div className="flex-1 space-y-2">
      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  </div>
);

// =============================================================================
// RESULT ITEM COMPONENT
// =============================================================================

interface ResultItemProps {
  medicine: MedicineSearchResult;
  isHighlighted: boolean;
  index: number;
  onSelect: (medicine: MedicineSearchResult) => void;
  onHighlight: (index: number) => void;
  query: string;
}

const ResultItem: React.FC<ResultItemProps> = ({
  medicine,
  isHighlighted,
  index,
  onSelect,
  onHighlight,
  query,
}) => {
  const displayName = medicine.brand_name || medicine.generic_name;
  const subtitle = medicine.brand_name
    ? `${medicine.generic_name}${medicine.dosage ? ` • ${medicine.dosage}` : ''}`
    : medicine.dosage || '';

  return (
    <li
      role="option"
      aria-selected={isHighlighted}
      id={`search-result-${index}`}
    >
      <button
        type="button"
        onClick={() => onSelect(medicine)}
        onMouseEnter={() => onHighlight(index)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3',
          'transition-colors text-left',
          isHighlighted
            ? 'bg-primary/10 dark:bg-primary/20'
            : 'hover:bg-surface-hover'
        )}
      >
        {/* Medicine Icon */}
        <div
          className={cn(
            'size-10 rounded-lg flex items-center justify-center',
            'bg-primary/10 text-primary'
          )}
        >
          <span className="material-symbols-outlined">medication</span>
        </div>

        {/* Medicine Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Name with highlight */}
            <span className="font-semibold text-foreground truncate">
              <HighlightedText text={displayName} query={query} />
            </span>

            {/* Rx Badge */}
            {medicine.requires_prescription && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
                  'border border-rose-200 dark:border-rose-800'
                )}
              >
                Rx
              </span>
            )}
          </div>

          {/* Subtitle: Generic name and/or dosage */}
          {subtitle && (
            <p className="text-sm text-muted truncate">
              <HighlightedText text={subtitle} query={query} />
            </p>
          )}

          {/* Form and Category */}
          {(medicine.form || medicine.category) && (
            <div className="flex items-center gap-2 mt-0.5">
              {medicine.form && (
                <span className="text-xs text-muted">{medicine.form}</span>
              )}
              {medicine.form && medicine.category && (
                <span className="text-xs text-muted">•</span>
              )}
              {medicine.category && (
                <span className="text-xs text-muted">{medicine.category}</span>
              )}
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <span
          className={cn(
            'material-symbols-outlined text-muted text-xl',
            'transition-opacity',
            isHighlighted ? 'opacity-100' : 'opacity-0'
          )}
        >
          arrow_forward
        </span>
      </button>
    </li>
  );
};

// =============================================================================
// HIGHLIGHTED TEXT COMPONENT
// =============================================================================

interface HighlightedTextProps {
  text: string;
  query: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query }) => {
  if (!query.trim()) {
    return <>{text}</>;
  }

  // Escape special regex characters
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-primary/20 text-foreground rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  highlightedIndex,
  onSelect,
  onHighlight,
  query,
  className,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('py-2', className)}>
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
      </div>
    );
  }

  // No results
  if (!results || results.length === 0) {
    return (
      <div className={cn('px-4 py-8 text-center', className)}>
        <span className="material-symbols-outlined text-4xl text-muted mb-2 block">
          search_off
        </span>
        <p className="text-sm font-medium text-foreground mb-1">
          Walang nahanap na gamot
        </p>
        <p className="text-xs text-muted">
          Subukan ang ibang keyword o spelling
        </p>
      </div>
    );
  }

  // Results list
  return (
    <div className={cn('py-2', className)}>
      <ul role="listbox" aria-label="Search results">
        {results.map((medicine, index) => (
          <ResultItem
            key={medicine.id}
            medicine={medicine}
            isHighlighted={index === highlightedIndex}
            index={index}
            onSelect={onSelect}
            onHighlight={onHighlight}
            query={query}
          />
        ))}
      </ul>

      {/* Results count */}
      <div className="px-4 py-2 border-t border-border">
        <p className="text-xs text-muted">
          {results.length} {results.length === 1 ? 'resulta' : 'mga resulta'}
        </p>
      </div>
    </div>
  );
};

export default SearchResults;
