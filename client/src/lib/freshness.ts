/**
 * Freshness Utilities
 *
 * Functions for calculating stock report freshness using exponential decay.
 * Reports expire after 4 hours but decay gradually for visual indication.
 */

// =============================================================================
// CONSTANTS
// =============================================================================

/** Report expiration time in milliseconds (4 hours) */
const EXPIRATION_MS = 4 * 60 * 60 * 1000;

/** Decay constant for exponential freshness calculation */
const DECAY_CONSTANT = Math.log(2) / (EXPIRATION_MS / 2);

/** Freshness thresholds */
const FRESH_THRESHOLD = 0.7; // 70%+ = fresh
const AGING_THRESHOLD = 0.3; // 30-70% = aging, below 30% = stale

// =============================================================================
// TYPES
// =============================================================================

export type FreshnessLevel = 'fresh' | 'aging' | 'stale';

export interface FreshnessInfo {
  score: number;
  level: FreshnessLevel;
  text: string;
  color: string;
}

// =============================================================================
// FRESHNESS CALCULATIONS
// =============================================================================

/**
 * Calculate freshness score using exponential decay.
 * Returns a value between 0 (completely stale) and 1 (just reported).
 *
 * @param reportedAt - ISO timestamp of when the report was created
 * @returns Freshness score from 0 to 1
 *
 * @example
 * ```ts
 * const freshness = calculateFreshness('2026-01-28T10:00:00Z');
 * // Returns ~0.85 if called at 10:30am
 * ```
 */
export function calculateFreshness(reportedAt: string | Date): number {
  const reportTime = new Date(reportedAt).getTime();
  const now = Date.now();
  const elapsedMs = now - reportTime;

  // If report is in the future (shouldn't happen), return 1
  if (elapsedMs <= 0) return 1;

  // If past expiration, return 0
  if (elapsedMs >= EXPIRATION_MS) return 0;

  // Exponential decay: freshness = e^(-λt)
  return Math.exp(-DECAY_CONSTANT * elapsedMs);
}

/**
 * Get the freshness level category based on the decay score.
 *
 * @param reportedAt - ISO timestamp of when the report was created
 * @returns 'fresh' | 'aging' | 'stale'
 */
export function getFreshnessLevel(reportedAt: string | Date): FreshnessLevel {
  const score = calculateFreshness(reportedAt);

  if (score >= FRESH_THRESHOLD) return 'fresh';
  if (score >= AGING_THRESHOLD) return 'aging';
  return 'stale';
}

/**
 * Get human-readable freshness text in Tagalog.
 *
 * @param reportedAt - ISO timestamp of when the report was created
 * @returns Tagalog freshness description
 */
export function getFreshnessText(reportedAt: string | Date): string {
  const reportTime = new Date(reportedAt).getTime();
  const now = Date.now();
  const elapsedMs = now - reportTime;

  // Convert to minutes/hours
  const minutes = Math.floor(elapsedMs / (60 * 1000));
  const hours = Math.floor(elapsedMs / (60 * 60 * 1000));

  if (minutes < 1) return 'Kakareport lang';
  if (minutes < 5) return 'Ilang minuto lang';
  if (minutes < 15) return `${minutes} minuto na`;
  if (minutes < 30) return 'Kalahating oras na';
  if (minutes < 60) return `${minutes} minuto na`;
  if (hours < 2) return `${hours} oras na`;
  if (hours < 4) return `${hours} oras na`;
  return 'Lumang report';
}

/**
 * Get confidence-based Tailwind color class.
 * Combines freshness score with helpful vote count for confidence coloring.
 *
 * @param reportedAt - ISO timestamp of when the report was created
 * @param helpfulCount - Number of helpful votes on the report
 * @returns Tailwind CSS color class
 */
export function getConfidenceColor(
  reportedAt: string | Date,
  helpfulCount: number = 0
): string {
  const freshness = calculateFreshness(reportedAt);

  // Boost confidence with helpful votes (max +0.2 bonus)
  const voteBonus = Math.min(helpfulCount * 0.04, 0.2);
  const confidence = Math.min(freshness + voteBonus, 1);

  if (confidence >= FRESH_THRESHOLD) return 'text-emerald-600';
  if (confidence >= AGING_THRESHOLD) return 'text-amber-500';
  return 'text-rose-500';
}

/**
 * Get the Tailwind background color class for the freshness bar.
 *
 * @param level - The freshness level
 * @returns Tailwind CSS background color class
 */
export function getFreshnessBarColor(level: FreshnessLevel): string {
  switch (level) {
    case 'fresh':
      return 'bg-emerald-500';
    case 'aging':
      return 'bg-amber-500';
    case 'stale':
      return 'bg-rose-400';
  }
}

/**
 * Get complete freshness information for a report.
 *
 * @param reportedAt - ISO timestamp of when the report was created
 * @param helpfulCount - Number of helpful votes (optional)
 * @returns Complete freshness info object
 */
export function getFreshnessInfo(
  reportedAt: string | Date,
  helpfulCount: number = 0
): FreshnessInfo {
  const score = calculateFreshness(reportedAt);
  const level = getFreshnessLevel(reportedAt);
  const text = getFreshnessText(reportedAt);
  const color = getConfidenceColor(reportedAt, helpfulCount);

  return { score, level, text, color };
}

/**
 * Check if a report has expired (older than 4 hours).
 *
 * @param reportedAt - ISO timestamp of when the report was created
 * @returns true if the report is expired
 */
export function isReportExpired(reportedAt: string | Date): boolean {
  const reportTime = new Date(reportedAt).getTime();
  return Date.now() - reportTime >= EXPIRATION_MS;
}

/**
 * Calculate the confidence score combining freshness and community validation.
 *
 * @param reportedAt - ISO timestamp of when the report was created
 * @param helpfulCount - Number of helpful votes
 * @param notHelpfulCount - Number of not helpful votes
 * @param verifiedCount - Number of independent verifications
 * @returns Confidence score from 0 to 1
 */
export function calculateConfidenceScore(
  reportedAt: string | Date,
  helpfulCount: number = 0,
  notHelpfulCount: number = 0,
  verifiedCount: number = 0
): number {
  const freshness = calculateFreshness(reportedAt);

  // Vote ratio component (max 0.15 boost)
  const totalVotes = helpfulCount + notHelpfulCount;
  const voteRatio = totalVotes > 0 ? helpfulCount / totalVotes : 0.5;
  const voteComponent = (voteRatio - 0.5) * 0.3; // -0.15 to +0.15

  // Verification component (max 0.1 boost)
  const verificationComponent = Math.min(verifiedCount * 0.02, 0.1);

  // Combined score
  return Math.max(0, Math.min(1, freshness + voteComponent + verificationComponent));
}

export default {
  calculateFreshness,
  getFreshnessLevel,
  getFreshnessText,
  getConfidenceColor,
  getFreshnessBarColor,
  getFreshnessInfo,
  isReportExpired,
  calculateConfidenceScore,
};
