/**
 * Points Display Store
 *
 * Zustand store for managing the points animation overlay.
 * Used to show celebration when user earns Alay Points.
 */

import { create } from 'zustand';

// =============================================================================
// TYPES
// =============================================================================

interface PointsDisplay {
  /** Base points earned */
  points: number;
  /** Whether this is the first report of the day */
  isFirstOfDay: boolean;
  /** Bonus points from streak */
  streakBonus: number;
  /** Current streak days */
  currentStreak: number;
}

interface PointsDisplayState {
  /** Current display data (null when hidden) */
  display: PointsDisplay | null;
  /** Show the points animation */
  showPointsAnimation: (display: PointsDisplay) => void;
  /** Hide the points animation */
  hidePointsAnimation: () => void;
}

// =============================================================================
// STORE
// =============================================================================

export const usePointsDisplayStore = create<PointsDisplayState>((set) => ({
  display: null,

  showPointsAnimation: (display) => {
    set({ display });
  },

  hidePointsAnimation: () => {
    set({ display: null });
  },
}));

// =============================================================================
// SELECTORS
// =============================================================================

export const selectPointsDisplay = (state: PointsDisplayState) => state.display;
export const selectIsShowingPoints = (state: PointsDisplayState) => state.display !== null;

// =============================================================================
// ACTIONS (for use outside React)
// =============================================================================

export function triggerPointsAnimation(display: PointsDisplay): void {
  usePointsDisplayStore.getState().showPointsAnimation(display);
}

export function dismissPointsAnimation(): void {
  usePointsDisplayStore.getState().hidePointsAnimation();
}

export default usePointsDisplayStore;
