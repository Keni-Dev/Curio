/**
 * Demo Mode Configuration
 *
 * Central configuration for demo/offline mode.
 * Checks environment variable and provides store accessor.
 */

import { useDevToolsStore } from '@/stores/useDevToolsStore';

/**
 * Check if demo mode is enabled via environment variable.
 * This is the static/build-time flag.
 */
export const ENV_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

/**
 * Get current demo mode status.
 * Checks both environment variable and runtime toggle.
 * Call this inside components/hooks to get reactive state.
 */
export function isDemoMode(): boolean {
  // If env flag is set, always use demo mode
  if (ENV_DEMO_MODE) return true;

  // Otherwise check runtime toggle from store
  const store = useDevToolsStore.getState();
  return store.isDemoModeEnabled;
}

/**
 * Hook version for reactive demo mode status.
 * Use this in components that need to react to demo mode changes.
 */
export function useDemoMode(): boolean {
  const isDemoModeEnabled = useDevToolsStore((state) => state.isDemoModeEnabled);
  return ENV_DEMO_MODE || isDemoModeEnabled;
}

/**
 * Demo mode delay to simulate network latency.
 * Makes the demo feel more realistic.
 */
export const DEMO_NETWORK_DELAY = {
  min: 100,
  max: 400,
} as const;

/**
 * Simulate network delay for demo mode.
 */
export async function simulateNetworkDelay(): Promise<void> {
  const delay = Math.random() * (DEMO_NETWORK_DELAY.max - DEMO_NETWORK_DELAY.min) + DEMO_NETWORK_DELAY.min;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Demo mode feature flags.
 * Control which features are available in demo mode.
 */
export const DEMO_FEATURES = {
  /** Show OCR feature with demo responses */
  ocr: true,
  /** Show MediBot with demo responses */
  mediBot: true,
  /** Allow stock reporting (stores in IndexedDB only) */
  stockReporting: true,
  /** Show leaderboard with demo data */
  leaderboard: true,
  /** Show user profile with demo data */
  profile: true,
} as const;
