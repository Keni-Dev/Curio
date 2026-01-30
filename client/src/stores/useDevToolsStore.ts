/**
 * DevTools Store
 *
 * Development-only store for testing features:
 * - Mock location override
 * - Proximity check bypass
 * - Debug mode toggles
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Coordinates } from '~types/common';

// Default mock location: BulSU e-Library area (from user's screenshot)
const BULSU_LIBRARY_COORDS: Coordinates = {
  lat: 14.858427,
  lng: 120.813601,
};

// =============================================================================
// TYPES
// =============================================================================

interface DevToolsState {
  // Mock Location
  isMockLocationEnabled: boolean;
  mockLocation: Coordinates;

  // Proximity Check Bypass
  bypassProximityCheck: boolean;

  // Panel visibility
  isDevPanelOpen: boolean;
}

interface DevToolsActions {
  // Mock Location
  setMockLocationEnabled: (enabled: boolean) => void;
  setMockLocation: (location: Coordinates) => void;
  teleportToPharmacy: (location: Coordinates) => void;

  // Proximity Check
  setBypassProximityCheck: (bypass: boolean) => void;

  // Panel
  toggleDevPanel: () => void;
  setDevPanelOpen: (open: boolean) => void;

  // Reset
  resetDevTools: () => void;
}

type DevToolsStore = DevToolsState & DevToolsActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: DevToolsState = {
  isMockLocationEnabled: false,
  mockLocation: BULSU_LIBRARY_COORDS,
  bypassProximityCheck: false,
  isDevPanelOpen: false,
};

// =============================================================================
// STORE
// =============================================================================

export const useDevToolsStore = create<DevToolsStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setMockLocationEnabled: (enabled) =>
          set({ isMockLocationEnabled: enabled }, false, 'setMockLocationEnabled'),

        setMockLocation: (location) =>
          set({ mockLocation: location }, false, 'setMockLocation'),

        teleportToPharmacy: (location) =>
          set(
            { mockLocation: location, isMockLocationEnabled: true },
            false,
            'teleportToPharmacy'
          ),

        setBypassProximityCheck: (bypass) =>
          set({ bypassProximityCheck: bypass }, false, 'setBypassProximityCheck'),

        toggleDevPanel: () =>
          set((state) => ({ isDevPanelOpen: !state.isDevPanelOpen }), false, 'toggleDevPanel'),

        setDevPanelOpen: (open) =>
          set({ isDevPanelOpen: open }, false, 'setDevPanelOpen'),

        resetDevTools: () => set(initialState, false, 'resetDevTools'),
      }),
      {
        name: 'curio-devtools',
        // Only persist in development
        skipHydration: import.meta.env.PROD,
      }
    ),
    { name: 'DevToolsStore', enabled: import.meta.env.DEV }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectMockLocation = (state: DevToolsStore) => ({
  enabled: state.isMockLocationEnabled,
  location: state.mockLocation,
});

export const selectBypassProximity = (state: DevToolsStore) => state.bypassProximityCheck;

// =============================================================================
// DEV-ONLY EXPORTS
// =============================================================================

// Helper to check if dev tools should be active
export const isDevMode = () => import.meta.env.DEV;
