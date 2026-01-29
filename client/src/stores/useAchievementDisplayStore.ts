/**
 * Achievement Display Store
 *
 * Zustand store for managing achievement unlock notifications.
 * Shows toast when user earns a new badge/achievement.
 */

import { create } from 'zustand';

// =============================================================================
// TYPES
// =============================================================================

type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
}

interface AchievementDisplayState {
  /** Queue of achievements to display */
  queue: Achievement[];
  /** Currently showing achievement */
  current: Achievement | null;
  /** Add achievement to queue */
  queueAchievement: (achievement: Achievement) => void;
  /** Show next achievement from queue */
  showNextAchievement: () => void;
  /** Dismiss current achievement */
  dismissAchievement: () => void;
  /** Clear all queued achievements */
  clearQueue: () => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useAchievementDisplayStore = create<AchievementDisplayState>((set, get) => ({
  queue: [],
  current: null,

  queueAchievement: (achievement) => {
    set((state) => ({
      queue: [...state.queue, achievement],
    }));

    // Auto-show if nothing is currently displayed
    const { current } = get();
    if (!current) {
      get().showNextAchievement();
    }
  },

  showNextAchievement: () => {
    const { queue } = get();
    if (queue.length === 0) {
      set({ current: null });
      return;
    }

    const [next, ...rest] = queue;
    set({
      current: next,
      queue: rest,
    });
  },

  dismissAchievement: () => {
    set({ current: null });
    // Show next achievement after a short delay
    setTimeout(() => {
      get().showNextAchievement();
    }, 300);
  },

  clearQueue: () => {
    set({ queue: [], current: null });
  },
}));

// =============================================================================
// SELECTORS
// =============================================================================

export const selectCurrentAchievement = (state: AchievementDisplayState) => state.current;
export const selectHasPendingAchievements = (state: AchievementDisplayState) =>
  state.queue.length > 0 || state.current !== null;

// =============================================================================
// ACTIONS (for use outside React)
// =============================================================================

export function triggerAchievementUnlock(achievement: Achievement): void {
  useAchievementDisplayStore.getState().queueAchievement(achievement);
}

export function dismissCurrentAchievement(): void {
  useAchievementDisplayStore.getState().dismissAchievement();
}

export default useAchievementDisplayStore;
