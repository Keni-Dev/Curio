/**
 * Auth State Store
 *
 * Zustand store for managing authentication state:
 * - User session
 * - User profile
 * - Auth loading states
 * - Auth initialization
 * - Demo mode auto-login
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User, UserLevel } from '~types/user';
import type { ProfileRow } from '~types/database';
import { supabase } from '~lib/supabase';
import { isDemoModeActive } from '~stores/useDevToolsStore';
import {
  DEMO_SUPABASE_USER,
  DEMO_SESSION,
  DEMO_APP_USER,
} from '~lib/demo/demoAuth';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut as apiSignOut,
  fetchUserProfile,
  ensureUserProfile,
} from '~features/auth/api/authApi';
import type { SignInCredentials, SignUpCredentials, AuthResult } from '~features/auth/types';

// =============================================================================
// TYPES
// =============================================================================

interface AuthState {
  // State
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<AuthResult>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Transform database profile row to app User type
 */
function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    displayName: profile.display_name ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
    alayPoints: profile.alay_points,
    streakDays: profile.streak_days,
    contributionCount: profile.contribution_count,
    level: profile.level as UserLevel,
    createdAt: profile.created_at,
  };
}

// =============================================================================
// STORE
// =============================================================================

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      isInitialized: false,

      /**
       * Initialize auth state and set up listener
       */
      initialize: async () => {
        // Prevent re-initialization if already initialized
        const { isInitialized } = get();
        if (isInitialized) {
          return;
        }

        // Check if demo mode is active - auto-login with demo user
        if (isDemoModeActive()) {
          console.log('[Auth] Demo mode active, using demo user');
          set({
            user: DEMO_SUPABASE_USER as unknown as SupabaseUser,
            session: DEMO_SESSION as unknown as Session,
            profile: DEMO_APP_USER,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
          return;
        }

        try {
          // Set up auth state change listener FIRST (before getSession)
          // This ensures we don't miss any auth events
          // Note: We don't unsubscribe since the store is a singleton and lives for the app lifetime
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[Auth] State change:', event);

            // Handle initial session and signed in events
            if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
              // IMMEDIATELY set as authenticated and initialized
              // This prevents race conditions with RequireAuth
              set({
                user: session.user,
                session,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
              });
              console.log('[Auth] User authenticated, fetching profile in background...');

              // Fetch profile in background (non-blocking)
              try {
                const userMeta = session.user.user_metadata;
                await ensureUserProfile(session.user.id, {
                  displayName: userMeta?.full_name || userMeta?.name || userMeta?.display_name,
                  avatarUrl: userMeta?.avatar_url || userMeta?.picture,
                });

                const profileData = await fetchUserProfile(session.user.id);
                if (profileData) {
                  set({ profile: mapProfileToUser(profileData) });
                  console.log('[Auth] Profile loaded successfully');
                }
              } catch (profileError) {
                console.error('[Auth] Profile fetch error:', profileError);
                // Profile fetch failed, but user is still authenticated
              }
            } else if (event === 'INITIAL_SESSION' && !session) {
              // No session on initial load
              set({
                user: null,
                session: null,
                profile: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
              });
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                session: null,
                profile: null,
                isAuthenticated: false,
                isLoading: false,
              });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              set({ session });
            }
          });
        } catch (error) {
          console.error('[Auth] Initialization error:', error);
          set({
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      /**
       * Sign in with email/password
       */
      signIn: async (credentials) => {
        // Demo mode: instant success with demo user
        if (isDemoModeActive()) {
          console.log('[Auth] Demo mode: sign in with demo user');
          set({
            user: DEMO_SUPABASE_USER as unknown as SupabaseUser,
            session: DEMO_SESSION as unknown as Session,
            profile: DEMO_APP_USER,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        }

        set({ isLoading: true });
        const result = await signInWithEmail(credentials);
        if (!result.success) {
          set({ isLoading: false });
        }
        return result;
      },

      /**
       * Sign up with email/password
       */
      signUp: async (credentials) => {
        // Demo mode: instant success with demo user
        if (isDemoModeActive()) {
          console.log('[Auth] Demo mode: sign up with demo user');
          set({
            user: DEMO_SUPABASE_USER as unknown as SupabaseUser,
            session: DEMO_SESSION as unknown as Session,
            profile: DEMO_APP_USER,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        }

        set({ isLoading: true });
        const result = await signUpWithEmail(credentials);
        if (!result.success) {
          set({ isLoading: false });
        }
        return result;
      },

      /**
       * Sign in with Google OAuth
       */
      signInWithGoogle: async () => {
        // Demo mode: instant success with demo user
        if (isDemoModeActive()) {
          console.log('[Auth] Demo mode: Google sign in with demo user');
          set({
            user: DEMO_SUPABASE_USER as unknown as SupabaseUser,
            session: DEMO_SESSION as unknown as Session,
            profile: DEMO_APP_USER,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        }

        set({ isLoading: true });
        const result = await signInWithGoogle();
        if (!result.success) {
          set({ isLoading: false });
        }
        return result;
      },

      /**
       * Sign out
       */
      signOut: async () => {
        // Demo mode: just clear state
        if (isDemoModeActive()) {
          console.log('[Auth] Demo mode: sign out');
          set({
            user: null,
            session: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return { success: true };
        }

        set({ isLoading: true });
        const result = await apiSignOut();
        return result;
      },

      /**
       * Refresh user profile from database
       */
      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;

        const profileData = await fetchUserProfile(user.id);
        if (profileData) {
          set({ profile: mapProfileToUser(profileData) });
        }
      },

      /**
       * Set session (used for OAuth callback)
       */
      setSession: (session) => {
        set({ session });
      },
    }),
    { name: 'auth-store' }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectUser = (state: AuthState) => state.user;
export const selectProfile = (state: AuthState) => state.profile;
export const selectSession = (state: AuthState) => state.session;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsInitialized = (state: AuthState) => state.isInitialized;
