/**
 * AccessibilityContext
 *
 * Global accessibility settings provider for WCAG 2.1 AA compliance.
 * Provides user preferences for:
 * - Large text mode (scales fonts by 25%)
 * - High contrast mode (improves text readability)
 * - Reduced motion (disables animations)
 * - Language selection (EN/TL)
 *
 * @see prompts/phase_05_polish/02_accessibility.md
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type Language = 'en' | 'tl';

export interface AccessibilitySettings {
  /** Scales fonts by 25% for better readability */
  largeText: boolean;
  /** Increases contrast ratios for text */
  highContrast: boolean;
  /** Disables animations and transitions */
  reduceMotion: boolean;
  /** UI language: English or Tagalog */
  language: Language;
}

interface AccessibilityContextValue extends AccessibilitySettings {
  /** Update a single setting */
  setSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  /** Toggle a boolean setting */
  toggleSetting: (key: 'largeText' | 'highContrast' | 'reduceMotion') => void;
  /** Reset all settings to defaults */
  resetSettings: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = 'curio-accessibility';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  largeText: false,
  highContrast: false,
  reduceMotion: false,
  language: 'en',
};

// =============================================================================
// CONTEXT
// =============================================================================

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Initialize state from localStorage or system preferences
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<AccessibilitySettings>;
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      } catch {
        // Invalid JSON, use defaults
      }

      // Check system preference for reduced motion
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (prefersReducedMotion) {
        return { ...DEFAULT_SETTINGS, reduceMotion: true };
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage full or unavailable
    }
  }, [settings]);

  // Apply CSS classes and custom properties to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Font scale for large text mode
    root.style.setProperty('--font-scale', settings.largeText ? '1.25' : '1');

    // High contrast class
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Reduced motion class
    if (settings.reduceMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }

    // Language attribute for screen readers
    root.setAttribute('lang', settings.language === 'tl' ? 'fil' : 'en');
  }, [settings]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setSettings((prev) => ({ ...prev, reduceMotion: e.matches }));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update a single setting
  const setSetting = useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Toggle a boolean setting
  const toggleSetting = useCallback(
    (key: 'largeText' | 'highContrast' | 'reduceMotion') => {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    []
  );

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value: AccessibilityContextValue = {
    ...settings,
    setSetting,
    toggleSetting,
    resetSettings,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }
  return context;
}

// =============================================================================
// UTILITY HOOK FOR ANNOUNCEMENTS
// =============================================================================

/**
 * Hook for announcing messages to screen readers using ARIA live regions
 */
export function useAnnounce() {
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      // Create or get existing live region
      let liveRegion = document.getElementById('curio-live-region');

      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'curio-live-region';
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
      } else {
        liveRegion.setAttribute('aria-live', priority);
      }

      // Clear and set message (triggers announcement)
      liveRegion.textContent = '';
      requestAnimationFrame(() => {
        liveRegion!.textContent = message;
      });
    },
    []
  );

  return announce;
}
