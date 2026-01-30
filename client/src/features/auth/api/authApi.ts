/**
 * Auth API Service
 *
 * Handles all Supabase authentication operations:
 * - Email/password sign in & sign up
 * - Google OAuth
 * - Session management
 * - Sign out
 */

import { supabase } from '~lib/supabase';
import type { SignInCredentials, SignUpCredentials, AuthResult } from '../types';
import type { ProfileUpdate } from '~types/database';

// =============================================================================
// EMAIL/PASSWORD AUTH
// =============================================================================

/**
 * Sign in with email and password
 */
export async function signInWithEmail({
  email,
  password,
}: SignInCredentials): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: getAuthErrorMessage(error.message),
    };
  }

  return { success: true };
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail({
  email,
  password,
  displayName,
}: SignUpCredentials): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: getAuthErrorMessage(error.message),
    };
  }

  return { success: true };
}

// =============================================================================
// OAUTH AUTH
// =============================================================================

/**
 * Sign in with Google OAuth
 * Redirects to Google sign-in page
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: getAuthErrorMessage(error.message),
    };
  }

  return { success: true };
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[Auth] Failed to get session:', error.message);
    return null;
  }

  return data.session;
}

/**
 * Get current user
 */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[Auth] Failed to get user:', error.message);
    return null;
  }

  return data.user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: getAuthErrorMessage(error.message),
    };
  }

  return { success: true };
}

// =============================================================================
// PASSWORD RESET
// =============================================================================

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: getAuthErrorMessage(error.message),
    };
  }

  return { success: true };
}

// =============================================================================
// PROFILE MANAGEMENT
// =============================================================================

/**
 * Fetch user profile from profiles table
 */
export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Auth] Failed to fetch profile:', error.message);
    return null;
  }

  return data;
}

/**
 * Create user profile if it doesn't exist (fallback for trigger failure)
 */
export async function ensureUserProfile(
  userId: string,
  metadata?: { displayName?: string; avatarUrl?: string }
): Promise<AuthResult> {
  // First check if profile exists
  const existing = await fetchUserProfile(userId);
  if (existing) {
    return { success: true };
  }

  console.log('[Auth] Profile missing, creating one...');

  // Create profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any).insert({
    id: userId,
    display_name: metadata?.displayName ?? null,
    avatar_url: metadata?.avatarUrl ?? null,
  });

  if (error) {
    console.error('[Auth] Failed to create profile:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }

  console.log('[Auth] Profile created successfully');
  return { success: true };
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Pick<ProfileUpdate, 'display_name' | 'avatar_url'>
): Promise<AuthResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any)
    .update(updates)
    .eq('id', userId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

// =============================================================================
// ERROR HELPERS
// =============================================================================

/**
 * Convert Supabase auth errors to user-friendly messages
 */
function getAuthErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address',
    'User already registered': 'An account with this email already exists',
    'Password should be at least 6 characters':
      'Password must be at least 6 characters',
    'Signup requires a valid password': 'Please enter a valid password',
    'Email rate limit exceeded': 'Too many attempts. Please try again later',
    'Invalid email': 'Please enter a valid email address',
  };

  return errorMap[error] || error;
}
