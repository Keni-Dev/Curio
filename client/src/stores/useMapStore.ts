/**
 * Map State Store
 *
 * Zustand store for managing map-related state:
 * - Map center and zoom level
 * - Selected pharmacy
 * - Sidebar visibility
 * - Stock status filters
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Coordinates, MapViewport } from '~types/common';
import type { StockStatus } from '~types/pharmacy';
import { MAP_CONFIG } from '~lib/constants';

// =============================================================================
// TYPES
// =============================================================================

interface MapState {
  // Viewport
  center: Coordinates;
  zoom: number;

  // Selection
  selectedPharmacyId: string | null;
  hoveredPharmacyId: string | null;

  // UI State
  isSidebarOpen: boolean;
  isSidebarMinimized: boolean;

  // Filters
  stockFilters: StockStatus[];
  showOnlyOpen: boolean;
  maxDistance: number; // in meters

  // User location
  userLocation: Coordinates | null;
  isLocatingUser: boolean;
}

interface MapActions {
  // Viewport
  setCenter: (center: Coordinates) => void;
  setZoom: (zoom: number) => void;
  setViewport: (viewport: MapViewport) => void;
  resetViewport: () => void;

  // Selection
  selectPharmacy: (id: string | null) => void;
  hoverPharmacy: (id: string | null) => void;

  // UI State
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarMinimized: () => void;

  // Filters
  setStockFilters: (filters: StockStatus[]) => void;
  toggleStockFilter: (status: StockStatus) => void;
  setShowOnlyOpen: (show: boolean) => void;
  setMaxDistance: (distance: number) => void;
  resetFilters: () => void;

  // User location
  setUserLocation: (location: Coordinates | null) => void;
  setIsLocatingUser: (locating: boolean) => void;
  centerOnUser: () => void;
}

type MapStore = MapState & MapActions;

// =============================================================================
// DEFAULT STATE
// =============================================================================

const DEFAULT_STATE: MapState = {
  center: MAP_CONFIG.DEFAULT_CENTER,
  zoom: MAP_CONFIG.DEFAULT_ZOOM,
  selectedPharmacyId: null,
  hoveredPharmacyId: null,
  isSidebarOpen: true,
  isSidebarMinimized: false,
  stockFilters: ['in_stock', 'low_stock', 'out_of_stock'],
  showOnlyOpen: false,
  maxDistance: 5000, // 5km default
  userLocation: null,
  isLocatingUser: false,
};

// =============================================================================
// STORE
// =============================================================================

export const useMapStore = create<MapStore>()(
  devtools(
    (set, get) => ({
      ...DEFAULT_STATE,

      // Viewport actions
      setCenter: (center) => set({ center }, false, 'setCenter'),

      setZoom: (zoom) => {
        const clampedZoom = Math.max(
          MAP_CONFIG.MIN_ZOOM,
          Math.min(MAP_CONFIG.MAX_ZOOM, zoom)
        );
        set({ zoom: clampedZoom }, false, 'setZoom');
      },

      setViewport: (viewport) =>
        set(
          {
            center: viewport.center,
            zoom: viewport.zoom,
          },
          false,
          'setViewport'
        ),

      resetViewport: () =>
        set(
          {
            center: MAP_CONFIG.DEFAULT_CENTER,
            zoom: MAP_CONFIG.DEFAULT_ZOOM,
          },
          false,
          'resetViewport'
        ),

      // Selection actions
      selectPharmacy: (id) =>
        set({ selectedPharmacyId: id }, false, 'selectPharmacy'),

      hoverPharmacy: (id) =>
        set({ hoveredPharmacyId: id }, false, 'hoverPharmacy'),

      // UI State actions
      toggleSidebar: () =>
        set(
          (state) => ({ isSidebarOpen: !state.isSidebarOpen }),
          false,
          'toggleSidebar'
        ),

      setSidebarOpen: (open) =>
        set({ isSidebarOpen: open }, false, 'setSidebarOpen'),

      toggleSidebarMinimized: () =>
        set(
          (state) => ({ isSidebarMinimized: !state.isSidebarMinimized }),
          false,
          'toggleSidebarMinimized'
        ),

      // Filter actions
      setStockFilters: (filters) =>
        set({ stockFilters: filters }, false, 'setStockFilters'),

      toggleStockFilter: (status) =>
        set(
          (state) => {
            const filters = state.stockFilters.includes(status)
              ? state.stockFilters.filter((f) => f !== status)
              : [...state.stockFilters, status];
            return { stockFilters: filters };
          },
          false,
          'toggleStockFilter'
        ),

      setShowOnlyOpen: (show) =>
        set({ showOnlyOpen: show }, false, 'setShowOnlyOpen'),

      setMaxDistance: (distance) =>
        set({ maxDistance: distance }, false, 'setMaxDistance'),

      resetFilters: () =>
        set(
          {
            stockFilters: ['in_stock', 'low_stock', 'out_of_stock'],
            showOnlyOpen: false,
            maxDistance: 5000,
          },
          false,
          'resetFilters'
        ),

      // User location actions
      setUserLocation: (location) =>
        set({ userLocation: location }, false, 'setUserLocation'),

      setIsLocatingUser: (locating) =>
        set({ isLocatingUser: locating }, false, 'setIsLocatingUser'),

      centerOnUser: () => {
        const { userLocation } = get();
        if (userLocation) {
          set(
            { center: userLocation, zoom: 16 },
            false,
            'centerOnUser'
          );
        }
      },
    }),
    { name: 'map-store' }
  )
);

export default useMapStore;
