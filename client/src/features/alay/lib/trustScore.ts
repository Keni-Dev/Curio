/**
 * Trust Score Utilities
 *
 * Functions for calculating report confidence scores based on:
 * - Distance from pharmacy (30%)
 * - User trust score (25%)
 * - Vote ratio (25%)
 * - Report freshness (20%)
 */

import { ANTI_ABUSE_CONFIG, TRUST_WEIGHTS, REPORT_EXPIRY_HOURS } from '../constants';
import type { UserLevel } from '@/types/user';

// =============================================================================
// TYPES
// =============================================================================

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unverified';

export interface ConfidenceFactors {
  distance: number;
  userTrust: number;
  votes: number;
  freshness: number;
}

export interface ConfidenceResult {
  /** Overall confidence score (0-1) */
  score: number;
  /** Human-readable confidence level */
  level: ConfidenceLevel;
  /** Individual factor scores for debugging */
  factors: ConfidenceFactors;
}

export interface ReportForConfidence {
  distanceFromPharmacy: number | null;
  reporterTrustScore: number;
  reporterLevel: UserLevel;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: Date;
  expiresAt: Date;
}

// =============================================================================
// CONFIDENCE CALCULATION
// =============================================================================

const { CONFIDENCE_WEIGHTS, CONFIDENCE_LEVELS } = ANTI_ABUSE_CONFIG;

/**
 * Calculate the distance factor (0-1)
 * Closer to pharmacy = higher factor
 *
 * @param distance - Distance in meters from pharmacy
 * @returns Factor between 0 and 1
 */
export function calculateDistanceFactor(distance: number | null): number {
  if (distance === null) {
    // No location provided - neutral score
    return 0.5;
  }

  // Perfect score if within 100m
  if (distance <= 100) return 1.0;

  // Good score if within 500m
  if (distance <= 500) return 0.8;

  // Acceptable if within 1km
  if (distance <= 1000) return 0.5;

  // Suspicious if beyond 1km
  return Math.max(0.1, 1 - distance / 5000);
}

/**
 * Calculate the user trust factor (0-1)
 * Based on user's trust score and level
 *
 * @param trustScore - User's trust score (0-1)
 * @param level - User's gamification level
 * @returns Factor between 0 and 1
 */
export function calculateUserFactor(
  trustScore: number,
  level: UserLevel | 'Pharmacy'
): number {
  const levelWeight = TRUST_WEIGHTS[level] ?? 1.0;
  // Combine trust score with level bonus, normalized to 0-1
  return Math.min(1, trustScore * (levelWeight / 3));
}

/**
 * Calculate the vote factor (0-1)
 * Higher helpful ratio = higher factor
 *
 * @param helpfulCount - Number of helpful votes
 * @param notHelpfulCount - Number of not helpful votes
 * @returns Factor between 0 and 1
 */
export function calculateVoteFactor(
  helpfulCount: number,
  notHelpfulCount: number
): number {
  const totalVotes = helpfulCount + notHelpfulCount;

  if (totalVotes === 0) {
    // No votes yet - neutral score
    return 0.5;
  }

  // Use Laplace smoothing to avoid extreme values
  // (helpful + 1) / (total + 2)
  return (helpfulCount + 1) / (totalVotes + 2);
}

/**
 * Calculate the freshness factor (0-1)
 * Uses exponential decay over the report expiry period
 *
 * @param createdAt - When the report was created
 * @param expiryHours - Hours until report expires (default 4)
 * @returns Factor between 0 and 1
 */
export function calculateFreshnessFactor(
  createdAt: Date,
  expiryHours: number = REPORT_EXPIRY_HOURS
): number {
  const now = new Date();
  const ageMs = now.getTime() - createdAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  // Exponential decay: e^(-t/T) where T is the expiry time
  const decayFactor = Math.exp(-ageHours / expiryHours);

  // Minimum factor of 0.1 even for old reports
  return Math.max(0.1, decayFactor);
}

/**
 * Calculate overall confidence score for a report
 *
 * @param report - Report data with all required fields
 * @returns Confidence result with score, level, and factors
 */
export function calculateConfidence(report: ReportForConfidence): ConfidenceResult {
  const distanceFactor = calculateDistanceFactor(report.distanceFromPharmacy);
  const userFactor = calculateUserFactor(
    report.reporterTrustScore,
    report.reporterLevel
  );
  const voteFactor = calculateVoteFactor(
    report.helpfulCount,
    report.notHelpfulCount
  );
  const freshnessFactor = calculateFreshnessFactor(report.createdAt);

  // Weighted average
  const score =
    distanceFactor * CONFIDENCE_WEIGHTS.DISTANCE +
    userFactor * CONFIDENCE_WEIGHTS.USER_TRUST +
    voteFactor * CONFIDENCE_WEIGHTS.VOTES +
    freshnessFactor * CONFIDENCE_WEIGHTS.FRESHNESS;

  // Determine level
  const level = getConfidenceLevel(score);

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimals
    level,
    factors: {
      distance: Math.round(distanceFactor * 100) / 100,
      userTrust: Math.round(userFactor * 100) / 100,
      votes: Math.round(voteFactor * 100) / 100,
      freshness: Math.round(freshnessFactor * 100) / 100,
    },
  };
}

/**
 * Get confidence level from score
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= CONFIDENCE_LEVELS.HIGH) return 'high';
  if (score >= CONFIDENCE_LEVELS.MEDIUM) return 'medium';
  if (score >= CONFIDENCE_LEVELS.LOW) return 'low';
  return 'unverified';
}

// =============================================================================
// CONSENSUS CALCULATION (CLIENT-SIDE)
// =============================================================================

export interface WeightedReport {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  weight: number;
}

export interface ConsensusResult {
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown';
  confidence: number;
  weights: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    total: number;
  };
  reportCount: number;
}

/**
 * Calculate consensus status from multiple weighted reports
 * Uses trust-weighted voting with 1.5x majority requirement
 *
 * @param reports - Array of reports with their confidence weights
 * @returns Consensus result with status and confidence
 */
export function calculateConsensus(reports: WeightedReport[]): ConsensusResult {
  if (reports.length === 0) {
    return {
      status: 'unknown',
      confidence: 0,
      weights: { inStock: 0, lowStock: 0, outOfStock: 0, total: 0 },
      reportCount: 0,
    };
  }

  const weights = reports.reduce(
    (acc, report) => {
      switch (report.status) {
        case 'in_stock':
          acc.inStock += report.weight;
          break;
        case 'low_stock':
          acc.lowStock += report.weight;
          break;
        case 'out_of_stock':
          acc.outOfStock += report.weight;
          break;
      }
      acc.total += report.weight;
      return acc;
    },
    { inStock: 0, lowStock: 0, outOfStock: 0, total: 0 }
  );

  const { CONSENSUS_MULTIPLIER } = ANTI_ABUSE_CONFIG;

  // Determine consensus (require 1.5x weight for clear majority)
  let status: ConsensusResult['status'] = 'low_stock'; // Default for uncertainty
  let confidence = weights.lowStock / weights.total;

  if (
    weights.inStock > weights.outOfStock * CONSENSUS_MULTIPLIER &&
    weights.inStock > weights.lowStock * CONSENSUS_MULTIPLIER
  ) {
    status = 'in_stock';
    confidence = weights.inStock / weights.total;
  } else if (
    weights.outOfStock > weights.inStock * CONSENSUS_MULTIPLIER &&
    weights.outOfStock > weights.lowStock * CONSENSUS_MULTIPLIER
  ) {
    status = 'out_of_stock';
    confidence = weights.outOfStock / weights.total;
  }

  return {
    status,
    confidence: Math.round(confidence * 100) / 100,
    weights: {
      inStock: Math.round(weights.inStock * 100) / 100,
      lowStock: Math.round(weights.lowStock * 100) / 100,
      outOfStock: Math.round(weights.outOfStock * 100) / 100,
      total: Math.round(weights.total * 100) / 100,
    },
    reportCount: reports.length,
  };
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Get color class for confidence level
 */
export function getConfidenceColor(level: ConfidenceLevel): {
  text: string;
  bg: string;
  border: string;
} {
  switch (level) {
    case 'high':
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
      };
    case 'medium':
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
      };
    case 'low':
      return {
        text: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
      };
    case 'unverified':
      return {
        text: 'text-gray-500',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
      };
  }
}

/**
 * Get human-readable confidence label
 */
export function getConfidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return 'High Confidence';
    case 'medium':
      return 'Medium Confidence';
    case 'low':
      return 'Low Confidence';
    case 'unverified':
      return 'Unverified';
  }
}

/**
 * Get Filipino label for confidence level
 */
export function getConfidenceLabelFilipino(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return 'Mataas na Tiwala';
    case 'medium':
      return 'Katamtamang Tiwala';
    case 'low':
      return 'Mababang Tiwala';
    case 'unverified':
      return 'Hindi Pa Na-verify';
  }
}
