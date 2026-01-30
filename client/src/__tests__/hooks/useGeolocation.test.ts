/**
 * useGeolocation Hook Tests
 *
 * Tests for the geolocation error message helper.
 * Note: Full hook tests are complex due to navigator.geolocation mocking.
 * The hook itself relies on the browser's geolocation API which is mocked in setup.ts.
 */

import { describe, it, expect } from 'vitest';
import { getGeolocationErrorMessage } from '@/hooks/useGeolocation';

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
