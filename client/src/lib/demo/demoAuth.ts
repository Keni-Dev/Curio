/**
 * Demo Authentication
 *
 * Provides mock authentication for demo mode.
 * Auto-logs in a demo user without requiring Supabase.
 */

import { DEMO_USER_PROFILE } from './demoData';
import { simulateNetworkDelay } from './demoConfig';
import type { User } from '@/types/user';

// =============================================================================
// DEMO USER & SESSION
// =============================================================================

/**
 * Demo Supabase user object.
 * Mimics the structure of Supabase's User type.
 */
export const DEMO_SUPABASE_USER = {
  id: 'demo-user-001',
  email: 'demo@curio.ph',
  app_metadata: {},
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: null,
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

/**
 * Demo session object.
 * Mimics the structure of Supabase's Session type.
 */
export const DEMO_SESSION = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: DEMO_SUPABASE_USER,
};

/**
 * Demo user profile for the app.
 */
export const DEMO_APP_USER: User = {
  id: DEMO_USER_PROFILE.id,
  displayName: DEMO_USER_PROFILE.display_name,
  avatarUrl: DEMO_USER_PROFILE.avatar_url ?? undefined,
  alayPoints: DEMO_USER_PROFILE.alay_points,
  streakDays: DEMO_USER_PROFILE.streak_days,
  contributionCount: DEMO_USER_PROFILE.contribution_count,
  level: DEMO_USER_PROFILE.level,
  createdAt: new Date().toISOString(),
};

// =============================================================================
// DEMO AUTH FUNCTIONS
// =============================================================================

export interface DemoAuthResult {
  success: boolean;
  error?: string;
}

/**
 * Demo sign in - always succeeds with demo user.
 * @param email - Email (ignored in demo mode)
 * @param password - Password (ignored in demo mode)
 */
export async function demoSignIn(
  email?: string,
  password?: string
): Promise<DemoAuthResult> {
  void email;
  void password;
  await simulateNetworkDelay();

  console.log('[Demo Mode] Sign in successful with demo user');

  return { success: true };
}

/**
 * Demo sign up - always succeeds with demo user.
 * @param email - Email (ignored in demo mode)
 * @param password - Password (ignored in demo mode)
 * @param displayName - Display name (ignored in demo mode)
 */
export async function demoSignUp(
  email?: string,
  password?: string,
  displayName?: string
): Promise<DemoAuthResult> {
  void email;
  void password;
  void displayName;
  await simulateNetworkDelay();

  console.log('[Demo Mode] Sign up successful with demo user');

  return { success: true };
}

/**
 * Demo sign out - always succeeds.
 */
export async function demoSignOut(): Promise<DemoAuthResult> {
  await simulateNetworkDelay();

  console.log('[Demo Mode] Sign out successful');

  return { success: true };
}

/**
 * Demo Google OAuth - always succeeds with demo user.
 */
export async function demoSignInWithGoogle(): Promise<DemoAuthResult> {
  await simulateNetworkDelay();

  console.log('[Demo Mode] Google sign in successful with demo user');

  return { success: true };
}

/**
 * Get demo user session.
 */
export async function demoGetSession(): Promise<typeof DEMO_SESSION | null> {
  await simulateNetworkDelay();
  return DEMO_SESSION;
}

/**
 * Get demo user.
 */
export async function demoGetUser(): Promise<typeof DEMO_SUPABASE_USER | null> {
  await simulateNetworkDelay();
  return DEMO_SUPABASE_USER;
}

/**
 * Get demo app user profile.
 */
export async function demoGetAppUser(): Promise<User> {
  await simulateNetworkDelay();
  return DEMO_APP_USER;
}
