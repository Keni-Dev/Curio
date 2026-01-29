/**
 * Search State Store
 *
 * Zustand store for managing medicine search state:
 * - Search query
 * - Recent searches (persisted to localStorage)
 * - Dropdown visibility
 * - Selected medicine
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { MedicineSearchResult } from '~types/database';

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'curio-search-history';

// =============================================================================
// TYPES
// =============================================================================

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
}

interface SearchState {
  // Query
  query: string;
  debouncedQuery: string;

  // UI State
  isOpen: boolean;
  isFocused: boolean;

  // Recent searches (persisted)
  recentSearches: RecentSearch[];

  // Selection
  selectedMedicine: MedicineSearchResult | null;
  highlightedIndex: number;
}

interface SearchActions {
  // Query
  setQuery: (query: string) => void;
  setDebouncedQuery: (query: string) => void;
  clearQuery: () => void;

  // UI State
  setIsOpen: (open: boolean) => void;
  setIsFocused: (focused: boolean) => void;

  // Recent searches
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (id: string) => void;
  clearRecentSearches: () => void;

  // Selection
  selectMedicine: (medicine: MedicineSearchResult | null) => void;
  setHighlightedIndex: (index: number) => void;

  // Reset
  reset: () => void;
}

type SearchStore = SearchState & SearchActions;

// =============================================================================
// DEFAULT STATE
// =============================================================================

const DEFAULT_STATE: SearchState = {
  query: '',
  debouncedQuery: '',
  isOpen: false,
  isFocused: false,
  recentSearches: [],
  selectedMedicine: null,
  highlightedIndex: -1,
};

// =============================================================================
// STORE
// =============================================================================

export const useSearchStore = create<SearchStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_STATE,

        // Query actions
        setQuery: (query) => {
          set({ query, isOpen: true, highlightedIndex: -1 });
        },

        setDebouncedQuery: (debouncedQuery) => {
          set({ debouncedQuery });
        },

        clearQuery: () => {
          set({ query: '', debouncedQuery: '', isOpen: false, highlightedIndex: -1 });
        },

        // UI State actions
        setIsOpen: (isOpen) => {
          set({ isOpen });
        },

        setIsFocused: (isFocused) => {
          set({ 
            isFocused,
            // Show dropdown when focused (for recent searches)
            isOpen: isFocused,
          });
        },

        // Recent searches actions
        addRecentSearch: (query) => {
          const trimmedQuery = query.trim();
          if (!trimmedQuery) return;

          const { recentSearches } = get();

          // Remove duplicate if exists
          const filtered = recentSearches.filter(
            (s) => s.query.toLowerCase() !== trimmedQuery.toLowerCase()
          );

          // Add new search at the beginning
          const newSearch: RecentSearch = {
            id: crypto.randomUUID(),
            query: trimmedQuery,
            timestamp: Date.now(),
          };

          // Keep only the most recent MAX_RECENT_SEARCHES
          const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

          set({ recentSearches: updated });
        },

        removeRecentSearch: (id) => {
          const { recentSearches } = get();
          set({
            recentSearches: recentSearches.filter((s) => s.id !== id),
          });
        },

        clearRecentSearches: () => {
          set({ recentSearches: [] });
        },

        // Selection actions
        selectMedicine: (medicine) => {
          set({
            selectedMedicine: medicine,
            isOpen: false,
            highlightedIndex: -1,
          });

          // Add to recent searches if medicine is selected
          if (medicine) {
            const displayName = medicine.brand_name || medicine.generic_name;
            get().addRecentSearch(displayName);
          }
        },

        setHighlightedIndex: (highlightedIndex) => {
          set({ highlightedIndex });
        },

        // Reset
        reset: () => {
          set({
            query: '',
            debouncedQuery: '',
            isOpen: false,
            isFocused: false,
            selectedMedicine: null,
            highlightedIndex: -1,
            // Keep recent searches
          });
        },
      }),
      {
        name: STORAGE_KEY,
        // Only persist recent searches
        partialize: (state) => ({
          recentSearches: state.recentSearches,
        }),
      }
    ),
    { name: 'SearchStore' }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

/** Select only recent searches for components that only need that */
export const selectRecentSearches = (state: SearchStore) => state.recentSearches;

/** Select search query state */
export const selectSearchQuery = (state: SearchStore) => ({
  query: state.query,
  debouncedQuery: state.debouncedQuery,
});

/** Select dropdown visibility state */
export const selectDropdownState = (state: SearchStore) => ({
  isOpen: state.isOpen,
  isFocused: state.isFocused,
  highlightedIndex: state.highlightedIndex,
});

export default useSearchStore;
