/**
 * useDebounce Hook Tests
 *
 * Tests for the debounce hook used in search inputs
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should not update immediately when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');
  });

  it('should update after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // First change
    rerender({ value: 'first' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Second change before timeout
    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should still be initial
    expect(result.current).toBe('initial');

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should be the last value
    expect(result.current).toBe('second');
  });

  it('should use default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should work with different types', () => {
    // Number
    const { result: numResult } = renderHook(() => useDebounce(42, 100));
    expect(numResult.current).toBe(42);

    // Object
    const obj = { foo: 'bar' };
    const { result: objResult } = renderHook(() => useDebounce(obj, 100));
    expect(objResult.current).toEqual({ foo: 'bar' });

    // Array
    const arr = [1, 2, 3];
    const { result: arrResult } = renderHook(() => useDebounce(arr, 100));
    expect(arrResult.current).toEqual([1, 2, 3]);
  });

  it('should handle null and undefined', () => {
    const { result: nullResult } = renderHook(() => useDebounce(null, 100));
    expect(nullResult.current).toBeNull();

    const { result: undefinedResult } = renderHook(() => useDebounce(undefined, 100));
    expect(undefinedResult.current).toBeUndefined();
  });

  it('should cleanup timeout on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    unmount();

    // Should not throw after unmount
    act(() => {
      vi.advanceTimersByTime(300);
    });
  });

  it('should work with custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });

  it('should handle empty string', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'search' } }
    );

    // Clear the input
    rerender({ value: '' });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('');
  });
});
