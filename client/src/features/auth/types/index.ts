/**
 * Auth Feature Type Definitions
 */

import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '~types/user';

// =============================================================================
// AUTH STATE TYPES
// =============================================================================

export interface AuthState {
  /** Supabase user object */
  user: SupabaseUser | null;
  /** App-specific user profile */
  profile: User | null;
  /** Supabase session */
  session: Session | null;
  /** Loading state for auth operations */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Auth initialization complete */
  isInitialized: boolean;
}

// =============================================================================
// AUTH API TYPES
// =============================================================================

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface OAuthProvider {
  provider: 'google';
}

// =============================================================================
// AUTH FORM TYPES
// =============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export type AuthFormError = {
  field?: keyof LoginFormData | keyof RegisterFormData | 'root';
  message: string;
};
