/**
 * Search Bar Component
 *
 * Glass morphism styled search bar with:
 * - Debounced search input
 * - Voice search support
 * - Recent searches dropdown
 * - Keyboard navigation (arrow keys + enter)
 * - Full accessibility support
 */

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchStore } from '~stores/useSearchStore';
import { useDebounce } from '~hooks/useDebounce';
import { useVoiceSearch } from '~hooks/useVoiceSearch';
import { useSearchMedicines } from '~features/medicine/hooks/useSearchMedicines';
import { SearchResults } from './SearchResults';
import { RecentSearches } from './RecentSearches';
import type { MedicineSearchResult } from '~types/database';
import { cn } from '~lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface SearchBarProps {
  /** Callback when a medicine is selected */
  onSelect?: (medicine: MedicineSearchResult) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelect,
  placeholder = 'Maghanap ng gamot...',
  className,
  autoFocus = false,
}) => {
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local state
  const [isMounted, setIsMounted] = useState(false);

  // Store state
  const query = useSearchStore((s) => s.query);
  const isOpen = useSearchStore((s) => s.isOpen);
  const isFocused = useSearchStore((s) => s.isFocused);
  const highlightedIndex = useSearchStore((s) => s.highlightedIndex);
  const setQuery = useSearchStore((s) => s.setQuery);
  const clearQuery = useSearchStore((s) => s.clearQuery);
  const setIsOpen = useSearchStore((s) => s.setIsOpen);
  const setIsFocused = useSearchStore((s) => s.setIsFocused);
  const setHighlightedIndex = useSearchStore((s) => s.setHighlightedIndex);
  const selectMedicine = useSearchStore((s) => s.selectMedicine);
  const addRecentSearch = useSearchStore((s) => s.addRecentSearch);

  // Debounced query for API calls
  const debouncedQuery = useDebounce(query, 300);

  // Search query
  const { data: results, isLoading, isQueryValid } = useSearchMedicines({
    query: debouncedQuery,
  });

  // Voice search
  const {
    isSupported: isVoiceSupported,
    isListening,
    startListening,
    stopListening,
  } = useVoiceSearch({
    onTranscript: (transcript) => {
      setQuery(transcript);
      inputRef.current?.focus();
    },
  });

  // Mount effect for animations - use requestAnimationFrame to avoid lint warning
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen, setIsFocused]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [setQuery]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setIsOpen(true);
  }, [setIsFocused, setIsOpen]);

  const handleBlur = useCallback(() => {
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      setIsFocused(false);
    }, 150);
  }, [setIsFocused]);

  const handleClear = useCallback(() => {
    clearQuery();
    inputRef.current?.focus();
  }, [clearQuery]);

  const handleMedicineSelect = useCallback(
    (medicine: MedicineSearchResult) => {
      selectMedicine(medicine);
      onSelect?.(medicine);
    },
    [selectMedicine, onSelect]
  );

  const handleRecentSelect = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      addRecentSearch(searchQuery);
    },
    [setQuery, addRecentSearch]
  );

  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const resultsCount = results?.length || 0;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (resultsCount > 0) {
            setHighlightedIndex(
              highlightedIndex < resultsCount - 1 ? highlightedIndex + 1 : 0
            );
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (resultsCount > 0) {
            setHighlightedIndex(
              highlightedIndex > 0 ? highlightedIndex - 1 : resultsCount - 1
            );
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && results?.[highlightedIndex]) {
            handleMedicineSelect(results[highlightedIndex]);
          } else if (query.trim()) {
            addRecentSearch(query.trim());
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [
      isOpen,
      results,
      highlightedIndex,
      query,
      setIsOpen,
      setHighlightedIndex,
      handleMedicineSelect,
      addRecentSearch,
    ]
  );

  // Determine what to show in dropdown
  const showRecentSearches = isFocused && !query.trim();
  const showResults = isQueryValid && (isLoading || (results && results.length >= 0));

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
    >
      {/* Search Input Container - Glass Panel */}
      <div
        className={cn(
          // Glass morphism effect
          'bg-white/75 dark:bg-slate-900/75',
          'backdrop-blur-[12px]',
          'border border-white/30 dark:border-white/10',
          // Shape and shadow
          'rounded-full p-1.5',
          'shadow-lg shadow-black/5',
          // Focus ring
          'ring-2 ring-transparent transition-shadow',
          isFocused && 'ring-primary/30',
          // Animation
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
          'transition-all duration-300'
        )}
      >
        <div className="flex items-center">
          {/* Search Icon */}
          <div
            className={cn(
              'size-11 flex items-center justify-center rounded-full ml-1',
              'bg-primary/10 text-primary',
              'transition-colors'
            )}
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search medicines"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="search-dropdown"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `search-result-${highlightedIndex}`
                : undefined
            }
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className={cn(
              'flex-1 bg-transparent border-none',
              'text-foreground placeholder:text-muted',
              'font-medium h-11 px-3',
              'focus:outline-none focus:ring-0',
              'text-base'
            )}
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className={cn(
                'size-9 flex items-center justify-center rounded-full',
                'hover:bg-black/5 dark:hover:bg-white/10',
                'transition-colors'
              )}
            >
              <span className="material-symbols-outlined text-muted text-xl">
                close
              </span>
            </button>
          )}

          {/* Voice Search Button */}
          {isVoiceSupported && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              aria-label={isListening ? 'Stop listening' : 'Voice search'}
              className={cn(
                'size-11 flex items-center justify-center rounded-full mr-1',
                'transition-all',
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-muted'
              )}
            >
              <span className="material-symbols-outlined text-xl">
                {isListening ? 'mic' : 'mic'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (showRecentSearches || showResults) && (
        <div
          id="search-dropdown"
          role="listbox"
          className={cn(
            // Position
            'absolute top-full left-0 right-0 mt-2 z-50',
            // Glass morphism
            'bg-white/95 dark:bg-slate-900/95',
            'backdrop-blur-[16px]',
            'border border-white/30 dark:border-white/10',
            // Shape and shadow
            'rounded-2xl overflow-hidden',
            'shadow-xl shadow-black/10',
            // Max height with scroll
            'max-h-[60vh] overflow-y-auto',
            // Animation
            'animate-in fade-in-0 slide-in-from-top-2 duration-200'
          )}
        >
          {showRecentSearches && (
            <RecentSearches onSelect={handleRecentSelect} />
          )}

          {showResults && (
            <SearchResults
              results={results}
              isLoading={isLoading}
              highlightedIndex={highlightedIndex}
              onSelect={handleMedicineSelect}
              onHighlight={setHighlightedIndex}
              query={debouncedQuery}
            />
          )}
        </div>
      )}

      {/* Voice listening indicator */}
      {isListening && (
        <div
          className={cn(
            'absolute -bottom-8 left-1/2 -translate-x-1/2',
            'px-3 py-1 rounded-full',
            'bg-rose-500 text-white text-xs font-medium',
            'animate-pulse'
          )}
        >
          Nakikinig...
        </div>
      )}
    </div>
  );
};

export default SearchBar;
