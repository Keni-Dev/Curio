/**
 * Recent Searches Component
 *
 * Displays a list of recent search queries stored in localStorage.
 * Shows when search input is focused but empty.
 */

import type React from 'react';
import { useSearchStore, selectRecentSearches } from '~stores/useSearchStore';
import { cn } from '~lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface RecentSearchesProps {
  /** Callback when a recent search is clicked */
  onSelect: (query: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  onSelect,
  className,
}) => {
  const recentSearches = useSearchStore(selectRecentSearches);
  const removeRecentSearch = useSearchStore((s) => s.removeRecentSearch);
  const clearRecentSearches = useSearchStore((s) => s.clearRecentSearches);

  if (recentSearches.length === 0) {
    return (
      <div className={cn('px-4 py-6 text-center', className)}>
        <span className="material-symbols-outlined text-3xl text-muted mb-2 block">
          history
        </span>
        <p className="text-sm text-muted">Walang recent searches</p>
      </div>
    );
  }

  return (
    <div className={cn('py-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">
          Mga Kamakailan
        </span>
        <button
          type="button"
          onClick={clearRecentSearches}
          className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
        >
          I-clear Lahat
        </button>
      </div>

      {/* Search Items */}
      <ul role="listbox" aria-label="Recent searches">
        {recentSearches.map((search) => (
          <li key={search.id}>
            <button
              type="button"
              onClick={() => onSelect(search.query)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3',
                'hover:bg-surface-hover active:bg-surface-active',
                'transition-colors text-left group'
              )}
            >
              {/* Clock Icon */}
              <span className="material-symbols-outlined text-muted text-xl">
                schedule
              </span>

              {/* Query Text */}
              <span className="flex-1 text-sm font-medium text-foreground truncate">
                {search.query}
              </span>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeRecentSearch(search.id);
                }}
                className={cn(
                  'size-8 flex items-center justify-center rounded-full',
                  'opacity-0 group-hover:opacity-100',
                  'hover:bg-black/10 dark:hover:bg-white/10',
                  'transition-all'
                )}
                aria-label={`Remove ${search.query} from recent searches`}
              >
                <span className="material-symbols-outlined text-muted text-lg">
                  close
                </span>
              </button>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSearches;
