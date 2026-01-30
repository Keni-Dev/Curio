// Stores barrel export

export { useMapStore } from './useMapStore';
export { useVotedStore, useHasVoted, useDeviceFingerprint } from './useVotedStore';
export {
  useAlayStore,
  selectIsReportModalOpen,
  selectCurrentStep,
  selectReportDraft,
  selectIsSubmitting,
  selectPendingReports,
  selectHasPendingReports,
  selectCanProceedFromMedicine,
  selectCanSubmit,
} from './useAlayStore';

// Auth store
export {
  useAuthStore,
  selectUser,
  selectProfile,
  selectSession,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsInitialized,
} from './useAuthStore';

// Gamification stores
export {
  usePointsDisplayStore,
  selectPointsDisplay,
  selectIsShowingPoints,
  triggerPointsAnimation,
  dismissPointsAnimation,
} from './usePointsDisplayStore';

export {
  useAchievementDisplayStore,
  selectCurrentAchievement,
  selectHasPendingAchievements,
  triggerAchievementUnlock,
  dismissCurrentAchievement,
} from './useAchievementDisplayStore';

// Dev tools (only active in development)
export {
  useDevToolsStore,
  selectMockLocation,
  selectBypassProximity,
  isDevMode,
} from './useDevToolsStore';
