/**
 * Freshness Utilities Unit Tests
 *
 * Tests for freshness calculation functions in @/lib/freshness
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateFreshness,
  getFreshnessLevel,
  getFreshnessText,
} from '@/lib/freshness';

// =============================================================================
// calculateFreshness
// =============================================================================

describe('calculateFreshness', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return 1 for just-reported time', () => {
    const now = new Date().toISOString();
    expect(calculateFreshness(now)).toBeCloseTo(1, 1);
  });

  it('should return ~0.5 for half-expiry time (2 hours)', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = calculateFreshness(twoHoursAgo);
    // Should be around 0.5 due to exponential decay with half-life at 2 hours
    expect(result).toBeGreaterThan(0.4);
    expect(result).toBeLessThan(0.6);
  });

  it('should return 0 for expired reports (>= 4 hours)', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    expect(calculateFreshness(fiveHoursAgo)).toBe(0);
  });

  it('should return 1 for future timestamps', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    expect(calculateFreshness(future)).toBe(1);
  });

  it('should accept Date objects', () => {
    const now = new Date();
    expect(calculateFreshness(now)).toBeCloseTo(1, 1);
  });

  it('should decay exponentially', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const f1 = calculateFreshness(oneHourAgo);
    const f2 = calculateFreshness(twoHoursAgo);
    const f3 = calculateFreshness(threeHoursAgo);

    expect(f1).toBeGreaterThan(f2);
    expect(f2).toBeGreaterThan(f3);
    
    // Exponential decay means the ratio should be roughly constant
    const ratio1 = f1 / f2;
    const ratio2 = f2 / f3;
    expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.5);
  });
});

// =============================================================================
// getFreshnessLevel
// =============================================================================

describe('getFreshnessLevel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "fresh" for very recent reports', () => {
    const now = new Date().toISOString();
    expect(getFreshnessLevel(now)).toBe('fresh');
  });

  it('should return "fresh" for reports < ~1.5 hours old', () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(getFreshnessLevel(thirtyMinutesAgo)).toBe('fresh');
  });

  it('should return "aging" for reports 1.5-3 hours old', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(getFreshnessLevel(twoHoursAgo)).toBe('aging');
  });

  it('should return "stale" for reports > 3 hours old', () => {
    const threeAndHalfHoursAgo = new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString();
    expect(getFreshnessLevel(threeAndHalfHoursAgo)).toBe('stale');
  });

  it('should return "stale" for expired reports', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    expect(getFreshnessLevel(fiveHoursAgo)).toBe('stale');
  });
});

// =============================================================================
// getFreshnessText
// =============================================================================

describe('getFreshnessText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Kakareport lang" for < 1 minute', () => {
    const now = new Date().toISOString();
    expect(getFreshnessText(now)).toBe('Kakareport lang');
  });

  it('should return "Ilang minuto lang" for 1-5 minutes', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    expect(getFreshnessText(twoMinutesAgo)).toBe('Ilang minuto lang');
  });

  it('should return minutes for 5-15 minutes', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(getFreshnessText(tenMinutesAgo)).toBe('10 minuto na');
  });

  it('should return "Kalahating oras na" for 15-30 minutes', () => {
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    expect(getFreshnessText(twentyMinutesAgo)).toBe('Kalahating oras na');
  });

  it('should return minutes for 30-60 minutes', () => {
    const fortyFiveMinutesAgo = new Date(Date.now() - 45 * 60 * 1000).toISOString();
    expect(getFreshnessText(fortyFiveMinutesAgo)).toBe('45 minuto na');
  });

  it('should return Tagalog text (Filipino locale)', () => {
    // All texts should be in Filipino
    const texts = [
      getFreshnessText(new Date().toISOString()),
      getFreshnessText(new Date(Date.now() - 3 * 60 * 1000).toISOString()),
      getFreshnessText(new Date(Date.now() - 25 * 60 * 1000).toISOString()),
    ];

    texts.forEach((text) => {
      // Should contain Filipino words
      expect(text).toMatch(/lang|minuto|oras|na|Kaka/);
    });
  });
});
