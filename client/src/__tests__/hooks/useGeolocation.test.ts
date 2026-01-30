/**
 * useGeolocation Hook Tests
 *
 * Tests for the geolocation hook with mock and real modes.
 * Note: navigator.geolocation is set up in setup.ts with configurable: true.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { getGeolocationErrorMessage } from '@/hooks/useGeolocation';

// Mock the stores
vi.mock('@/stores/useDevToolsStore', () => ({
  useDevToolsStore: vi.fn((selector) => {
    const state = {
      isMockLocationEnabled: false,
      mockLocation: { lat: 14.8527, lng: 120.8157 },
    };
    return selector(state);
  }),
  isDevMode: vi.fn(() => false),
}));

// =============================================================================
// useGeolocation Hook Tests
// =============================================================================

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use geolocation mock from setup', async () => {
    // Import dynamically to get fresh module state
    const { useGeolocation } = await import('@/hooks/useGeolocation');
    
    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have coordinates from the mock in setup.ts
    expect(result.current.coordinates).toEqual({
      lat: 14.8527,
      lng: 120.8157,
    });
  });

  it('should indicate geolocation is supported', async () => {
    const { useGeolocation } = await import('@/hooks/useGeolocation');
    
    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isSupported).toBe(true);
  });

  it('should have no error on successful location', async () => {
    const { useGeolocation } = await import('@/hooks/useGeolocation');
    
    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it('should provide refresh function', async () => {
    const { useGeolocation } = await import('@/hooks/useGeolocation');
    
    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe('function');
  });
});

// =============================================================================
// getGeolocationErrorMessage
// =============================================================================

describe('getGeolocationErrorMessage', () => {
  it('should return message for PERMISSION_DENIED', () => {
    const message = getGeolocationErrorMessage('PERMISSION_DENIED');
    expect(message).toContain('denied');
    expect(message).toContain('permission');
  });

  it('should return message for POSITION_UNAVAILABLE', () => {
    const message = getGeolocationErrorMessage('POSITION_UNAVAILABLE');
    expect(message).toContain('Unable');
    expect(message).toContain('location');
  });

  it('should return message for TIMEOUT', () => {
    const message = getGeolocationErrorMessage('TIMEOUT');
    expect(message).toContain('timed out');
  });

  it('should return message for NOT_SUPPORTED', () => {
    const message = getGeolocationErrorMessage('NOT_SUPPORTED');
    expect(message).toContain('not supported');
  });
});;
