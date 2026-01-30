/**
 * Auth Callback Page
 *
 * Handles OAuth redirects from Google.
 * Supabase automatically handles the session from URL hash params.
 * 
 * This page waits for the auth store to be initialized and authenticated
 * before redirecting to ensure no race conditions with RequireAuth.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '~stores/useAuthStore';
import { Spinner } from '~components/ui';

const ONBOARDING_COMPLETED_KEY = 'curio.onboarding.completed';

// Check for OAuth error in URL before component renders
function getOAuthError(): string | null {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const errorParam = hashParams.get('error');
  const errorDescription = hashParams.get('error_description');
  
  if (errorParam) {
    return errorDescription || errorParam;
  }
  return null;
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error] = useState<string | null>(() => getOAuthError());
  const hasRedirected = useRef(false);

  // Use auth store state instead of separate listener
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Determine redirect path based on onboarding status
  const getRedirectPath = useCallback(() => {
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
    return onboardingCompleted ? '/' : '/onboarding';
  }, []);

  // Redirect when auth store is initialized and authenticated
  useEffect(() => {
    // If there's an error from URL, don't proceed
    if (error) return;

    // Wait for auth store to be initialized
    if (!isInitialized) {
      console.log('[Auth Callback] Waiting for auth initialization...');
      return;
    }

    // Prevent double redirects
    if (hasRedirected.current) return;

    console.log('[Auth Callback] Auth initialized, isAuthenticated:', isAuthenticated);

    if (isAuthenticated) {
      hasRedirected.current = true;
      navigate(getRedirectPath(), { replace: true });
    } else {
      // Auth is initialized but not authenticated - redirect to login
      console.log('[Auth Callback] Not authenticated, redirecting to login');
      hasRedirected.current = true;
      navigate('/login', { replace: true });
    }
  }, [navigate, error, isInitialized, isAuthenticated, getRedirectPath]);

  // Fallback timeout - if nothing happens after 10 seconds, redirect to login
  useEffect(() => {
    if (error) return;

    const timeout = setTimeout(() => {
      if (!hasRedirected.current) {
        console.log('[Auth Callback] Timeout, redirecting to login');
        hasRedirected.current = true;
        navigate('/login', { replace: true });
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [navigate, error]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-danger">error</span>
          </div>
          <h1 className="font-display text-xl text-text-primary dark:text-white mb-2">
            Authentication Failed
          </h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <span className="text-lg font-medium text-text-secondary">
          Completing sign in...
        </span>
      </div>
    </div>
  );
}
