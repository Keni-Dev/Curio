/**
 * Custom hook for browser geolocation
 * Handles permissions, errors, and location updates
 */

import { useState, useEffect, useCallback } from 'react';
import type { Coordinates, GeolocationError } from '~types/common';
import { GEOLOCATION_CONFIG, MAP_CONFIG, STORAGE_KEYS } from '~lib/constants';
import { safeJsonParse } from '~lib/utils';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

interface UseGeolocationReturn {
  coordinates: Coordinates | null;
  error: GeolocationError | null;
  isLoading: boolean;
  isSupported: boolean;
  refresh: () => void;
}

/**
 * Hook for accessing user's geolocation
 * @param options - Geolocation options
 * @returns Geolocation state and controls
 */
export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationReturn {
  const {
    enableHighAccuracy = GEOLOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
    timeout = GEOLOCATION_CONFIG.TIMEOUT,
    maximumAge = GEOLOCATION_CONFIG.MAXIMUM_AGE,
    watchPosition = false,
  } = options;

  const [coordinates, setCoordinates] = useState<Coordinates | null>(() => {
    // Try to get cached location on initial load
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEYS.CACHED_LOCATION);
      if (cached) {
        return safeJsonParse<Coordinates | null>(cached, null);
      }
    }
    return null;
  });

  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSupported =
    typeof window !== 'undefined' && 'geolocation' in navigator;

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const newCoords: Coordinates = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    setCoordinates(newCoords);
    setError(null);
    setIsLoading(false);

    // Cache the location
    localStorage.setItem(STORAGE_KEYS.CACHED_LOCATION, JSON.stringify(newCoords));
  }, []);

  const handleError = useCallback((positionError: GeolocationPositionError) => {
    let errorType: GeolocationError;

    switch (positionError.code) {
      case positionError.PERMISSION_DENIED:
        errorType = 'PERMISSION_DENIED';
        break;
      case positionError.POSITION_UNAVAILABLE:
        errorType = 'POSITION_UNAVAILABLE';
        break;
      case positionError.TIMEOUT:
        errorType = 'TIMEOUT';
        break;
      default:
        errorType = 'POSITION_UNAVAILABLE';
    }

    setError(errorType);
    setIsLoading(false);

    // Fall back to default location (Malolos) if no cached location
    if (!coordinates) {
      setCoordinates(MAP_CONFIG.DEFAULT_CENTER);
    }
  }, [coordinates]);

  const getPosition = useCallback(() => {
    if (!isSupported) {
      setError('NOT_SUPPORTED');
      setCoordinates(MAP_CONFIG.DEFAULT_CENTER);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [
    isSupported,
    handleSuccess,
    handleError,
    enableHighAccuracy,
    timeout,
    maximumAge,
  ]);

  // Initial position fetch
  useEffect(() => {
    getPosition();
  }, [getPosition]);

  // Watch position if enabled
  useEffect(() => {
    if (!watchPosition || !isSupported) return;

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [
    watchPosition,
    isSupported,
    handleSuccess,
    handleError,
    enableHighAccuracy,
    timeout,
    maximumAge,
  ]);

  return {
    coordinates,
    error,
    isLoading,
    isSupported,
    refresh: getPosition,
  };
}

/**
 * Get user-friendly error message for geolocation errors
 */
export function getGeolocationErrorMessage(error: GeolocationError): string {
  switch (error) {
    case 'PERMISSION_DENIED':
      return 'Location access denied. Please enable location permissions in your browser settings.';
    case 'POSITION_UNAVAILABLE':
      return 'Unable to determine your location. Please try again.';
    case 'TIMEOUT':
      return 'Location request timed out. Please try again.';
    case 'NOT_SUPPORTED':
      return 'Geolocation is not supported by your browser.';
    default:
      return 'An unknown error occurred while getting your location.';
  }
}
