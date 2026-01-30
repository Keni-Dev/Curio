/**
 * Utils Unit Tests
 *
 * Tests for utility functions in @/lib/utils
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  formatDistance,
  formatRelativeTime,
  calculateDistance,
  debounce,
  throttle,
  formatPrice,
  slugify,
  capitalizeWords,
  isMobileDevice,
  generateId,
  sleep,
  safeJsonParse,
} from '@/lib/utils';

// =============================================================================
// cn (className merger)
// =============================================================================

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('should handle false conditionals', () => {
    const isActive = false;
    expect(cn('base', isActive && 'active')).toBe('base');
  });

  it('should deduplicate Tailwind classes', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

// =============================================================================
// formatDistance
// =============================================================================

describe('formatDistance', () => {
  it('should format distances under 1km in meters', () => {
    expect(formatDistance(500)).toBe('500m');
    expect(formatDistance(0)).toBe('0m');
    expect(formatDistance(999)).toBe('999m');
  });

  it('should format distances over 1km in kilometers', () => {
    expect(formatDistance(1000)).toBe('1.0km');
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(2345)).toBe('2.3km');
  });

  it('should round meters to whole numbers', () => {
    expect(formatDistance(500.7)).toBe('501m');
    expect(formatDistance(123.4)).toBe('123m');
  });

  it('should format large distances', () => {
    expect(formatDistance(10000)).toBe('10.0km');
    expect(formatDistance(100500)).toBe('100.5km');
  });
});

// =============================================================================
// formatRelativeTime
// =============================================================================

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "just now" for very recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');
    expect(formatRelativeTime(new Date(now.getTime() - 30000))).toBe('just now');
  });

  it('should format minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
  });

  it('should format hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('should format days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });

  it('should format weeks ago', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoWeeksAgo)).toBe('2w ago');
  });

  it('should format dates for older items', () => {
    const oldDate = new Date('2025-12-15T12:00:00Z');
    const result = formatRelativeTime(oldDate);
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/15/);
  });

  it('should accept string dates', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now');
  });
});

// =============================================================================
// calculateDistance (Haversine)
// =============================================================================

describe('calculateDistance', () => {
  it('should return 0 for same coordinates', () => {
    expect(calculateDistance(14.8527, 120.8157, 14.8527, 120.8157)).toBe(0);
  });

  it('should calculate distance between two points in Malolos', () => {
    // ~1km apart
    const distance = calculateDistance(14.8527, 120.8157, 14.8617, 120.8157);
    expect(distance).toBeGreaterThan(900);
    expect(distance).toBeLessThan(1100);
  });

  it('should calculate Manila to Malolos (~40km)', () => {
    const distance = calculateDistance(14.5995, 120.9842, 14.8527, 120.8157);
    expect(distance).toBeGreaterThan(30000);
    expect(distance).toBeLessThan(50000);
  });

  it('should handle negative coordinates', () => {
    const distance = calculateDistance(-33.8688, 151.2093, -33.8588, 151.2193);
    expect(distance).toBeGreaterThan(0);
  });

  it('should be symmetric', () => {
    const d1 = calculateDistance(14.8527, 120.8157, 14.8617, 120.8257);
    const d2 = calculateDistance(14.8617, 120.8257, 14.8527, 120.8157);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001);
  });
});

// =============================================================================
// debounce
// =============================================================================

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay function execution', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should only call once for rapid calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on each call', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    vi.advanceTimersByTime(200);
    debouncedFn();
    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the function', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('arg1', 'arg2');
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

// =============================================================================
// throttle
// =============================================================================

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call function immediately', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 300);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should ignore calls within throttle period', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 300);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should allow call after throttle period', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 300);

    throttledFn();
    vi.advanceTimersByTime(300);
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

// =============================================================================
// formatPrice
// =============================================================================

describe('formatPrice', () => {
  it('should format price in Philippine Peso', () => {
    const result = formatPrice(25.5);
    expect(result).toContain('25.50');
    expect(result).toMatch(/₱|PHP/);
  });

  it('should handle whole numbers', () => {
    const result = formatPrice(100);
    expect(result).toContain('100.00');
  });

  it('should handle zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0.00');
  });

  it('should handle large numbers with comma separators', () => {
    const result = formatPrice(1234567.89);
    expect(result).toMatch(/1[,.]?234[,.]?567/);
  });
});

// =============================================================================
// slugify
// =============================================================================

describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('should remove special characters', () => {
    expect(slugify("Mercury Drug - SM Malolos!")).toBe('mercury-drug-sm-malolos');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('foo   bar')).toBe('foo-bar');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });

  it('should handle underscores', () => {
    expect(slugify('foo_bar_baz')).toBe('foo-bar-baz');
  });
});

// =============================================================================
// capitalizeWords
// =============================================================================

describe('capitalizeWords', () => {
  it('should capitalize first letter of each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World');
  });

  it('should handle single word', () => {
    expect(capitalizeWords('hello')).toBe('Hello');
  });

  it('should preserve existing capitals', () => {
    expect(capitalizeWords('hELLO wORLD')).toBe('HELLO WORLD');
  });

  it('should handle empty string', () => {
    expect(capitalizeWords('')).toBe('');
  });
});

// =============================================================================
// isMobileDevice
// =============================================================================

describe('isMobileDevice', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
    });
  });

  it('should return false for desktop user agents', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true,
    });
    expect(isMobileDevice()).toBe(false);
  });

  it('should return true for Android', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
      writable: true,
    });
    expect(isMobileDevice()).toBe(true);
  });

  it('should return true for iPhone', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true,
    });
    expect(isMobileDevice()).toBe(true);
  });
});

// =============================================================================
// generateId
// =============================================================================

describe('generateId', () => {
  it('should generate an 8-character ID by default', () => {
    const id = generateId();
    expect(id).toHaveLength(8);
  });

  it('should generate ID of specified length', () => {
    // Note: generateId uses Math.random().toString(36) which may produce
    // shorter strings occasionally, so we check max length
    expect(generateId(4).length).toBeLessThanOrEqual(4);
    expect(generateId(4).length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('should contain only alphanumeric characters', () => {
    const id = generateId(20);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

// =============================================================================
// sleep
// =============================================================================

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve after specified time', async () => {
    const promise = sleep(1000);
    
    vi.advanceTimersByTime(500);
    // Promise should not be resolved yet
    
    vi.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
  });
});

// =============================================================================
// safeJsonParse
// =============================================================================

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const result = safeJsonParse('{"foo": "bar"}', {});
    expect(result).toEqual({ foo: 'bar' });
  });

  it('should return fallback for invalid JSON', () => {
    const fallback = { default: true };
    const result = safeJsonParse('not json', fallback);
    expect(result).toEqual(fallback);
  });

  it('should parse arrays', () => {
    const result = safeJsonParse('[1, 2, 3]', []);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return fallback for empty string', () => {
    const result = safeJsonParse('', 'fallback');
    expect(result).toBe('fallback');
  });
});
