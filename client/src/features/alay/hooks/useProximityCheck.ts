/**
 * useProximityCheck Hook
 *
 * Verifies user is within acceptable distance of a pharmacy.
 * Uses the existing useGeolocation hook and Haversine calculation.
 */

import { useMemo } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/lib/utils';
import { MAX_REPORT_DISTANCE, DISTANCE_THRESHOLDS } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

interface PharmacyLocation {
  lat: number;
  lng: number;
}

type ProximityStatus = 'loading' | 'verified' | 'too_far' | 'error' | 'unsupported';

interface UseProximityCheckOptions {
  pharmacyLocation: PharmacyLocation;
  maxDistance?: number;
}

interface UseProximityCheckReturn {
  /** Current proximity status */
  status: ProximityStatus;
  /** Whether user is within acceptable distance */
  isVerified: boolean;
  /** Distance from pharmacy in meters (null if unknown) */
  distance: number | null;
  /** Formatted distance string for display */
  distanceText: string | null;
  /** Whether location is being fetched */
  isLoading: boolean;
  /** Error message if location failed */
  errorMessage: string | null;
  /** User coordinates if available */
  userLocation: PharmacyLocation | null;
  /** Refresh location */
  refresh: () => void;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDistanceText(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m away`;
  }
  return `${(meters / 1000).toFixed(1)}km away`;
}

function getErrorMessage(error: string | null): string | null {
  if (!error) return null;

  switch (error) {
    case 'PERMISSION_DENIED':
      return 'Location access denied. Please enable location services.';
    case 'POSITION_UNAVAILABLE':
      return 'Unable to determine your location.';
    case 'TIMEOUT':
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to get your location.';
  }
}

// =============================================================================
// HOOK
// =============================================================================

export function useProximityCheck({
  pharmacyLocation,
  maxDistance = MAX_REPORT_DISTANCE,
}: UseProximityCheckOptions): UseProximityCheckReturn {
  const {
    coordinates,
    error,
    isLoading,
    isSupported,
    refresh,
  } = useGeolocation({ enableHighAccuracy: true });

  const result = useMemo(() => {
    // Check if geolocation is supported
    if (!isSupported) {
      return {
        status: 'unsupported' as const,
        isVerified: false,
        distance: null,
        distanceText: null,
        errorMessage: 'Geolocation is not supported on this device.',
        userLocation: null,
      };
    }

    // Loading state
    if (isLoading) {
      return {
        status: 'loading' as const,
        isVerified: false,
        distance: null,
        distanceText: null,
        errorMessage: null,
        userLocation: null,
      };
    }

    // Error state
    if (error || !coordinates) {
      return {
        status: 'error' as const,
        isVerified: false,
        distance: null,
        distanceText: null,
        errorMessage: getErrorMessage(error),
        userLocation: null,
      };
    }

    // Calculate distance
    const distance = calculateDistance(
      coordinates.lat,
      coordinates.lng,
      pharmacyLocation.lat,
      pharmacyLocation.lng
    );

    const isVerified = distance <= maxDistance;
    const status: ProximityStatus = isVerified ? 'verified' : 'too_far';

    return {
      status,
      isVerified,
      distance,
      distanceText: formatDistanceText(distance),
      errorMessage: null,
      userLocation: coordinates,
    };
  }, [coordinates, error, isLoading, isSupported, pharmacyLocation, maxDistance]);

  return {
    ...result,
    isLoading,
    refresh,
  };
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { MAX_REPORT_DISTANCE, DISTANCE_THRESHOLDS };
