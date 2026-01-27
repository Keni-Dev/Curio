/**
 * Common type definitions used across the app
 */

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Geolocation
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  error: GeolocationError | null;
  isLoading: boolean;
}

export type GeolocationError =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED';

// Map
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds?: MapBounds;
}

// UI
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Form
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Sort
export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}
