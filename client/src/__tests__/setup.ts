/**
 * Vitest Global Test Setup
 *
 * Configures global mocks for browser APIs and testing utilities.
 * This file runs before each test file.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// =============================================================================
// CLEANUP
// =============================================================================

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// =============================================================================
// BROWSER API MOCKS
// =============================================================================

// Create a mutable geolocation mock that tests can modify
export const mockGeolocationState = {
  getCurrentPositionImpl: (success: (pos: GeolocationPosition) => void) => {
    success({
      coords: {
        latitude: 14.8527,
        longitude: 120.8157,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition);
  },
};

beforeAll(() => {
  // Mock navigator.geolocation with configurable: true so tests can override
  const mockGeolocation = {
    getCurrentPosition: vi.fn((success, error, options) => {
      mockGeolocationState.getCurrentPositionImpl(success);
    }),
    watchPosition: vi.fn(() => 1),
    clearWatch: vi.fn(),
  };

  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
    configurable: true,
  });

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    root = null;
    rootMargin = '';
    thresholds = [];
    takeRecords = vi.fn(() => []);
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });

  // Mock ResizeObserver
  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock scrollTo
  window.scrollTo = vi.fn();

  // Mock crypto.randomUUID
  Object.defineProperty(crypto, 'randomUUID', {
    value: () => 'test-uuid-' + Math.random().toString(36).substring(7),
  });

  // Mock window.URL.createObjectURL
  window.URL.createObjectURL = vi.fn(() => 'mock-object-url');
  window.URL.revokeObjectURL = vi.fn();

  // Mock console.error to fail on React errors in tests (optional)
  // vi.spyOn(console, 'error').mockImplementation(() => {});
});

// =============================================================================
// GLOBAL TEST UTILITIES
// =============================================================================

/**
 * Create a mock geolocation position
 */
export function createMockPosition(lat = 14.8527, lng = 120.8157): GeolocationPosition {
  return {
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };
}

/**
 * Mock a successful geolocation response
 */
export function mockGeolocationSuccess(lat = 14.8527, lng = 120.8157) {
  vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation((success) => {
    success(createMockPosition(lat, lng));
  });
}

/**
 * Mock a geolocation error
 */
export function mockGeolocationError(
  code: 1 | 2 | 3 = 1,
  message = 'User denied geolocation'
) {
  vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation((_, error) => {
    if (error) {
      error({
        code,
        message,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    }
  });
}

// =============================================================================
// SUPPRESS CONSOLE WARNINGS IN TESTS
// =============================================================================

// Suppress specific React warnings if needed
const originalError = console.error;
console.error = (...args) => {
  // Suppress act() warnings in tests
  if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  originalError.call(console, ...args);
};
