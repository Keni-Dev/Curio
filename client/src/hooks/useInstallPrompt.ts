/**
 * useInstallPrompt Hook
 * 
 * Manages the PWA install prompt for mobile users.
 * Shows prompt after first successful pharmacy search to demonstrate value first.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UseInstallPromptReturn {
  /** Whether the install prompt is available */
  canInstall: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** Whether the prompt has been dismissed by user */
  isDismissed: boolean;
  /** Trigger the install prompt */
  promptInstall: () => Promise<boolean>;
  /** Dismiss the install prompt (user chose not to install) */
  dismissPrompt: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const DISMISSED_KEY = 'curio-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================================================
// Hook Implementation
// ============================================================================

// Check if dismissed recently (computed once on load)
function getInitialDismissedState(): boolean {
  if (typeof window === 'undefined') return false;
  const dismissedAt = localStorage.getItem(DISMISSED_KEY);
  if (dismissedAt) {
    const dismissTime = parseInt(dismissedAt, 10);
    if (Date.now() - dismissTime < DISMISS_DURATION_MS) {
      return true;
    }
    localStorage.removeItem(DISMISSED_KEY);
  }
  return false;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(getInitialDismissedState);

  // Check if app is installed (standalone mode)
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);

    return () => mediaQuery.removeEventListener('change', checkInstalled);
  }, []);

  // Capture the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Store the event for later use
      setInstallEvent(event as BeforeInstallPromptEvent);
      console.log('[useInstallPrompt] Install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      console.log('[useInstallPrompt] App installed successfully');
      setIsInstalled(true);
      setInstallEvent(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Trigger the install prompt
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installEvent) {
      console.log('[useInstallPrompt] No install event available');
      return false;
    }

    try {
      // Show the install prompt
      await installEvent.prompt();

      // Wait for user choice
      const { outcome } = await installEvent.userChoice;
      console.log('[useInstallPrompt] User choice:', outcome);

      if (outcome === 'accepted') {
        setInstallEvent(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[useInstallPrompt] Error showing prompt:', error);
      return false;
    }
  }, [installEvent]);

  // Dismiss the prompt
  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  }, []);

  return {
    canInstall: !!installEvent && !isInstalled && !isDismissed,
    isInstalled,
    isDismissed,
    promptInstall,
    dismissPrompt,
  };
}

export default useInstallPrompt;
