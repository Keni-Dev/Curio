/**
 * Alay (Contribution) Feature
 *
 * Community-driven stock reporting system with gamification.
 * Enables users to report medicine availability at pharmacies.
 */

// =============================================================================
// COMPONENTS
// =============================================================================

// Stock Reporting
export { ReportModal } from './components/ReportModal';
export { ProximityCheck } from './components/ProximityCheck';
export { MedicineSelector } from './components/MedicineSelector';
export { StatusSelector } from './components/StatusSelector';
export { ThankYouConfirmation } from './components/ThankYouConfirmation';

// Gamification
export { PointsAnimation } from './components/PointsAnimation';
export { PointsAnimationProvider } from './components/PointsAnimationProvider';
export { LevelBadge, LevelBadgeCompact } from './components/LevelBadge';
export { StreakCounter, StreakCounterInline } from './components/StreakCounter';
export { AchievementBadge, AchievementBadgeList, ACHIEVEMENT_BADGES } from './components/AchievementBadge';
export { AchievementToast } from './components/AchievementToast';
export { AchievementToastProvider } from './components/AchievementToastProvider';
export { Leaderboard, LeaderboardCompact } from './components/Leaderboard';
export { ProfileStatsCard, ProfileStatsCompact } from './components/ProfileStatsCard';

// Anti-Abuse
export { RateLimitDisplay, RateLimitBlocker } from './components/RateLimitDisplay';
export { ConfidenceBadge, ConfidenceIndicator, ConfidenceTooltipContent } from './components/ConfidenceBadge';
export { DuplicateWarning, DuplicateNotice, UpdateReportPrompt } from './components/DuplicateWarning';
export { ModerationPanel } from './components/ModerationPanel';

// =============================================================================
// HOOKS
// =============================================================================

export { useProximityCheck } from './hooks/useProximityCheck';
export { useSubmitReport } from './hooks/useSubmitReport';
export { usePendingReports, useOnlineStatus } from './hooks/usePendingReports';
export { useAlayPoints, useHasAlayProfile, useUserLevel, alayProfileKeys } from './hooks/useAlayPoints';
export { useLeaderboard, useTopContributors, useWeeklyLeaderboard, leaderboardKeys } from './hooks/useLeaderboard';
export { useUserActivity, userActivityKeys } from './hooks/useUserActivity';
export type { UserActivity } from './hooks/useUserActivity';

// Anti-Abuse Hooks
export { useRateLimit, rateLimitKeys, formatCooldown, getDailyLimitPercentage } from './hooks/useRateLimit';
export { useDuplicateCheck, duplicateCheckKeys, formatTimeAgo, getStatusLabel } from './hooks/useDuplicateCheck';
export { useModerationQueue, useModerationStats, useModerateReport, useIsAdmin, moderationKeys } from './hooks/useModeration';

// =============================================================================
// STORES
// =============================================================================

export { useAlayStore } from '@/stores/useAlayStore';

// =============================================================================
// CONSTANTS
// =============================================================================
// CONSTANTS
// =============================================================================

export {
  MAX_REPORT_DISTANCE,
  DISTANCE_THRESHOLDS,
  ALAY_POINTS,
  LEVEL_THRESHOLDS,
  LEVEL_PROGRESS,
  ALAY_COPY,
  ALAY_ANIMATIONS,
  // Anti-abuse constants
  REPORT_COOLDOWN_SECONDS,
  MAX_REPORTS_PER_DAY,
  REPORT_EXPIRY_HOURS,
  DUPLICATE_CHECK_HOURS,
  ANTI_ABUSE_CONFIG,
  TRUST_WEIGHTS,
} from './constants';

// =============================================================================
// LIB / UTILITIES
// =============================================================================

export {
  calculateConfidence,
  calculateConsensus,
  calculateDistanceFactor,
  calculateUserFactor,
  calculateVoteFactor,
  calculateFreshnessFactor,
  getConfidenceLevel,
  getConfidenceColor,
  getConfidenceLabel,
  getConfidenceLabelFilipino,
} from './lib/trustScore';

export type {
  ConfidenceLevel,
  ConfidenceFactors,
  ConfidenceResult,
  ReportForConfidence,
  WeightedReport,
  ConsensusResult,
} from './lib/trustScore';

// =============================================================================
// TYPES
// =============================================================================

export type { SubmitReportInput, SubmitReportResult } from './hooks/useSubmitReport';
export type { Achievement } from './components/AchievementToast';
export type { RateLimitStatus } from './hooks/useRateLimit';
export type { ExistingReport, DuplicateCheckResult } from './hooks/useDuplicateCheck';
export type {
  AbuseFlagType,
  ModerationStatus,
  AbuseFlag,
  ModerationQueueItem,
  ModerationAction,
  ModerationResult,
  ModerationStats,
} from './types/moderation';
export { FLAG_TYPE_CONFIG, FLAG_SEVERITY_CONFIG } from './types/moderation';