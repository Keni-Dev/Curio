/**
 * Voted Reports Store
 *
 * Zustand store with localStorage persistence for tracking which reports
 * the user has voted on. Supports anonymous voting via device fingerprint.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// =============================================================================
// TYPES
// =============================================================================

interface VoteRecord {
  reportId: string;
  isHelpful: boolean;
  votedAt: string;
}

interface VotedState {
  // State
  votedReports: Record<string, VoteRecord>;
  deviceFingerprint: string;

  // Actions
  addVote: (reportId: string, isHelpful: boolean) => void;
  removeVote: (reportId: string) => void;
  hasVoted: (reportId: string) => boolean;
  getVote: (reportId: string) => VoteRecord | undefined;
  clearOldVotes: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Generate a simple device fingerprint for anonymous voting.
 * Uses browser characteristics that persist across sessions.
 */
function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ];

  // Simple hash function
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `fp_${Math.abs(hash).toString(36)}`;
}

/**
 * Check if a vote is older than 7 days (cleanup threshold).
 */
function isVoteExpired(votedAt: string): boolean {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(votedAt).getTime() > SEVEN_DAYS_MS;
}

// =============================================================================
// STORE
// =============================================================================

export const useVotedStore = create<VotedState>()(
  persist(
    (set, get) => ({
      // Initial state
      votedReports: {},
      deviceFingerprint: '',

      // Add a vote
      addVote: (reportId: string, isHelpful: boolean) => {
        set((state) => ({
          votedReports: {
            ...state.votedReports,
            [reportId]: {
              reportId,
              isHelpful,
              votedAt: new Date().toISOString(),
            },
          },
        }));
      },

      // Remove a vote
      removeVote: (reportId: string) => {
        set((state) => {
          const { [reportId]: _removed, ...rest } = state.votedReports;
          void _removed; // Explicitly mark as intentionally unused
          return { votedReports: rest };
        });
      },

      // Check if user has voted on a report
      hasVoted: (reportId: string) => {
        return reportId in get().votedReports;
      },

      // Get the vote record for a report
      getVote: (reportId: string) => {
        return get().votedReports[reportId];
      },

      // Clean up old votes (older than 7 days)
      clearOldVotes: () => {
        set((state) => {
          const filtered = Object.fromEntries(
            Object.entries(state.votedReports).filter(
              ([, record]) => !isVoteExpired(record.votedAt)
            )
          );
          return { votedReports: filtered };
        });
      },
    }),
    {
      name: 'curio-voted-reports',
      storage: createJSONStorage(() => localStorage),
      // Initialize device fingerprint on hydration
      onRehydrateStorage: () => (state) => {
        if (state && !state.deviceFingerprint) {
          state.deviceFingerprint = generateDeviceFingerprint();
        }
        // Clean up old votes on hydration
        state?.clearOldVotes();
      },
      partialize: (state) => ({
        votedReports: state.votedReports,
        deviceFingerprint: state.deviceFingerprint,
      }),
    }
  )
);

// =============================================================================
// SELECTOR HOOKS
// =============================================================================

/**
 * Hook to check if the user has voted on a specific report.
 */
export function useHasVoted(reportId: string): boolean {
  return useVotedStore((state) => reportId in state.votedReports);
}

/**
 * Hook to get the device fingerprint for anonymous voting.
 */
export function useDeviceFingerprint(): string {
  return useVotedStore((state) => state.deviceFingerprint);
}

export default useVotedStore;
