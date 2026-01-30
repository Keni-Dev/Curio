/**
 * DevTools Store
 *
 * Development-only store for testing features:
 * - Mock location override
 * - Proximity check bypass
 * - Debug mode toggles
 * - Demo mode for offline presentations
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Coordinates } from '~types/common';

// Default mock location: BulSU e-Library area (from user's screenshot)
const BULSU_LIBRARY_COORDS: Coordinates = {
  lat: 14.858427,
  lng: 120.813601,
};

// Default demo location: Malolos City Center
const MALOLOS_CENTER_COORDS: Coordinates = {
  lat: 14.8527,
  lng: 120.815,
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

  // Demo Mode (Offline)
  isDemoModeEnabled: boolean;
  isDemoAuthEnabled: boolean;
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

  // Demo Mode
  setDemoModeEnabled: (enabled: boolean) => void;
  setDemoAuthEnabled: (enabled: boolean) => void;
  enableFullDemoMode: () => void;
  disableFullDemoMode: () => void;

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
  isDemoModeEnabled: false,
  isDemoAuthEnabled: false,
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

        setDemoModeEnabled: (enabled) =>
          set({ isDemoModeEnabled: enabled }, false, 'setDemoModeEnabled'),

        setDemoAuthEnabled: (enabled) =>
          set({ isDemoAuthEnabled: enabled }, false, 'setDemoAuthEnabled'),

        enableFullDemoMode: () =>
          set(
            {
              isDemoModeEnabled: true,
              isDemoAuthEnabled: true,
              isMockLocationEnabled: true,
              mockLocation: MALOLOS_CENTER_COORDS,
              bypassProximityCheck: true,
            },
            false,
            'enableFullDemoMode'
          ),

        disableFullDemoMode: () =>
          set(
            {
              isDemoModeEnabled: false,
              isDemoAuthEnabled: false,
            },
            false,
            'disableFullDemoMode'
          ),

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

export const selectDemoMode = (state: DevToolsStore) => ({
  isEnabled: state.isDemoModeEnabled,
  isAuthEnabled: state.isDemoAuthEnabled,
});

// =============================================================================
// DEV-ONLY EXPORTS
// =============================================================================

// Helper to check if dev tools should be active
export const isDevMode = () => import.meta.env.DEV;

// Helper to check if demo mode is active (env or store)
export const isDemoModeActive = () => {
  const envDemo = import.meta.env.VITE_DEMO_MODE === 'true';
  const storeDemo = useDevToolsStore.getState().isDemoModeEnabled;
  return envDemo || storeDemo;
};
