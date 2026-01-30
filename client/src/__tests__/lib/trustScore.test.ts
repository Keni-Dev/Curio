/**
 * Trust Score Unit Tests
 *
 * Tests for confidence calculation functions in @/features/alay/lib/trustScore
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  calculateDistanceFactor,
  calculateUserFactor,
  calculateVoteFactor,
  calculateFreshnessFactor,
  calculateConfidence,
  getConfidenceLevel,
} from '@/features/alay/lib/trustScore';
import {
  createMockReportForConfidence,
  createHighConfidenceReport,
  createLowConfidenceReport,
  createFreshReport,
  createAgingReport,
  createStaleReport,
} from '../factories';

// =============================================================================
// calculateDistanceFactor
// =============================================================================

describe('calculateDistanceFactor', () => {
  it('should return 1.0 for distance <= 100m', () => {
    expect(calculateDistanceFactor(0)).toBe(1.0);
    expect(calculateDistanceFactor(50)).toBe(1.0);
    expect(calculateDistanceFactor(100)).toBe(1.0);
  });

  it('should return 0.8 for distance 100-500m', () => {
    expect(calculateDistanceFactor(101)).toBe(0.8);
    expect(calculateDistanceFactor(250)).toBe(0.8);
    expect(calculateDistanceFactor(500)).toBe(0.8);
  });

  it('should return 0.5 for distance 500-1000m', () => {
    expect(calculateDistanceFactor(501)).toBe(0.5);
    expect(calculateDistanceFactor(750)).toBe(0.5);
    expect(calculateDistanceFactor(1000)).toBe(0.5);
  });

  it('should return reduced factor for distance > 1000m', () => {
    // Formula: Math.max(0.1, 1 - distance/5000)
    // At 2000m: Math.max(0.1, 1 - 0.4) = 0.6
    const factor = calculateDistanceFactor(2000);
    expect(factor).toBeGreaterThan(0.1);
    expect(factor).toBeLessThanOrEqual(1.0);
    // Factor should decrease as distance increases
    expect(calculateDistanceFactor(3000)).toBeLessThan(factor);
  });

  it('should return 0.5 for null distance (no location)', () => {
    expect(calculateDistanceFactor(null)).toBe(0.5);
  });

  it('should never go below 0.1', () => {
    expect(calculateDistanceFactor(10000)).toBeGreaterThanOrEqual(0.1);
    expect(calculateDistanceFactor(50000)).toBeGreaterThanOrEqual(0.1);
  });
});

// =============================================================================
// calculateUserFactor
// =============================================================================

describe('calculateUserFactor', () => {
  it('should return higher factor for higher trust score', () => {
    const lowTrust = calculateUserFactor(0.3, 'Scout');
    const highTrust = calculateUserFactor(0.9, 'Scout');
    expect(highTrust).toBeGreaterThan(lowTrust);
  });

  it('should return higher factor for higher level', () => {
    const baguhan = calculateUserFactor(0.7, 'Baguhan');
    const scout = calculateUserFactor(0.7, 'Scout');
    const champion = calculateUserFactor(0.7, 'Champion');
    const legend = calculateUserFactor(0.7, 'Legend');

    expect(scout).toBeGreaterThan(baguhan);
    expect(champion).toBeGreaterThan(scout);
    expect(legend).toBeGreaterThan(champion);
  });

  it('should return highest factor for Pharmacy level', () => {
    const pharmacy = calculateUserFactor(0.7, 'Pharmacy');
    const legend = calculateUserFactor(0.7, 'Legend');
    expect(pharmacy).toBeGreaterThan(legend);
  });

  it('should cap at 1.0', () => {
    const result = calculateUserFactor(1.0, 'Pharmacy');
    expect(result).toBeLessThanOrEqual(1);
  });

  it('should return 0 for 0 trust score', () => {
    const result = calculateUserFactor(0, 'Legend');
    expect(result).toBe(0);
  });
});

// =============================================================================
// calculateVoteFactor
// =============================================================================

describe('calculateVoteFactor', () => {
  it('should return 0.5 for no votes', () => {
    expect(calculateVoteFactor(0, 0)).toBe(0.5);
  });

  it('should return higher factor for more helpful votes', () => {
    const mostlyHelpful = calculateVoteFactor(8, 2);
    const balanced = calculateVoteFactor(5, 5);
    const mostlyNotHelpful = calculateVoteFactor(2, 8);

    expect(mostlyHelpful).toBeGreaterThan(balanced);
    expect(balanced).toBeGreaterThan(mostlyNotHelpful);
  });

  it('should apply Laplace smoothing', () => {
    // With Laplace smoothing: (helpful + 1) / (total + 2)
    // 5 helpful, 0 not helpful: (5+1)/(5+2) = 6/7 ≈ 0.857
    const result = calculateVoteFactor(5, 0);
    expect(result).toBeCloseTo(6 / 7, 2);
  });

  it('should not return extreme values', () => {
    // Even all helpful votes shouldn't return 1.0
    const allHelpful = calculateVoteFactor(100, 0);
    expect(allHelpful).toBeLessThan(1);

    // Even all not helpful shouldn't return 0
    const allNotHelpful = calculateVoteFactor(0, 100);
    expect(allNotHelpful).toBeGreaterThan(0);
  });

  it('should handle single vote', () => {
    const oneHelpful = calculateVoteFactor(1, 0);
    expect(oneHelpful).toBeCloseTo(2 / 3, 2); // (1+1)/(1+2) = 2/3
  });
});

// =============================================================================
// calculateFreshnessFactor
// =============================================================================

describe('calculateFreshnessFactor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return ~1.0 for just-created report', () => {
    const now = new Date();
    const result = calculateFreshnessFactor(now);
    expect(result).toBeCloseTo(1.0, 1);
  });

  it('should decay over time', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const oneHourFactor = calculateFreshnessFactor(oneHourAgo);
    const twoHourFactor = calculateFreshnessFactor(twoHoursAgo);

    expect(oneHourFactor).toBeGreaterThan(twoHourFactor);
    expect(oneHourFactor).toBeLessThan(1);
  });

  it('should use custom expiry hours', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // With 4 hour expiry (default)
    const factor4h = calculateFreshnessFactor(oneHourAgo, 4);
    // With 2 hour expiry (faster decay)
    const factor2h = calculateFreshnessFactor(oneHourAgo, 2);

    expect(factor4h).toBeGreaterThan(factor2h);
  });

  it('should not go below 0.1', () => {
    const veryOld = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const result = calculateFreshnessFactor(veryOld);
    expect(result).toBeGreaterThanOrEqual(0.1);
  });
});

// =============================================================================
// calculateConfidence (integration)
// =============================================================================

describe('calculateConfidence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return high confidence for high-quality report', () => {
    const report = createHighConfidenceReport();
    const result = calculateConfidence(report);

    expect(result.level).toBe('high');
    expect(result.score).toBeGreaterThanOrEqual(0.7);
  });

  it('should return low confidence for low-quality report', () => {
    const report = createLowConfidenceReport();
    const result = calculateConfidence(report);

    expect(result.level).toBe('low');
    expect(result.score).toBeLessThan(0.4);
  });

  it('should include all factor scores', () => {
    const report = createMockReportForConfidence();
    const result = calculateConfidence(report);

    expect(result.factors).toHaveProperty('distance');
    expect(result.factors).toHaveProperty('userTrust');
    expect(result.factors).toHaveProperty('votes');
    expect(result.factors).toHaveProperty('freshness');

    // All factors should be between 0 and 1
    Object.values(result.factors).forEach((factor) => {
      expect(factor).toBeGreaterThanOrEqual(0);
      expect(factor).toBeLessThanOrEqual(1);
    });
  });

  it('should round score to 2 decimal places', () => {
    const report = createMockReportForConfidence();
    const result = calculateConfidence(report);

    const decimalPlaces = (result.score.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  it('should return score between 0 and 1', () => {
    const reports = [
      createHighConfidenceReport(),
      createLowConfidenceReport(),
      createFreshReport(),
      createAgingReport(),
      createStaleReport(),
    ];

    reports.forEach((report) => {
      const result = calculateConfidence(report);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });
});

// =============================================================================
// getConfidenceLevel
// =============================================================================

describe('getConfidenceLevel', () => {
  it('should return "high" for score >= 0.7', () => {
    expect(getConfidenceLevel(0.7)).toBe('high');
    expect(getConfidenceLevel(0.85)).toBe('high');
    expect(getConfidenceLevel(1.0)).toBe('high');
  });

  it('should return "medium" for score >= 0.4 and < 0.7', () => {
    expect(getConfidenceLevel(0.4)).toBe('medium');
    expect(getConfidenceLevel(0.5)).toBe('medium');
    expect(getConfidenceLevel(0.69)).toBe('medium');
  });

  it('should return "low" for score >= 0.2 and < 0.4', () => {
    expect(getConfidenceLevel(0.2)).toBe('low');
    expect(getConfidenceLevel(0.3)).toBe('low');
    expect(getConfidenceLevel(0.39)).toBe('low');
  });

  it('should return "unverified" for score < 0.2', () => {
    expect(getConfidenceLevel(0.19)).toBe('unverified');
    expect(getConfidenceLevel(0.1)).toBe('unverified');
    expect(getConfidenceLevel(0)).toBe('unverified');
  });
});
