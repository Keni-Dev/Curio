/**
 * i18n (Internationalization) System
 *
 * Provides type-safe translations with interpolation support.
 * Integrates with AccessibilityContext for language switching.
 *
 * @example
 * const { t } = useTranslation();
 * t('common.loading'); // "Loading..."
 * t('pharmacy.distance', { distance: '500m' }); // "500m away"
 *
 * @see prompts/phase_05_polish/02_accessibility.md
 */

import { useCallback } from 'react';
import { useAccessibility, type Language } from '@/contexts/AccessibilityContext';
import { en, type TranslationKeys, type TranslationSchema } from './en';
import { tl } from './tl';

// =============================================================================
// TRANSLATION LOOKUP
// =============================================================================

const translations: Record<Language, TranslationSchema> = {
  en,
  tl,
};

// =============================================================================
// TYPES
// =============================================================================

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? NestedKeyOf<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<TranslationKeys>;

type InterpolationParams = Record<string, string | number>;

// =============================================================================
// TRANSLATION FUNCTION
// =============================================================================

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate variables in translation string
 * Replaces {{variable}} with provided values
 */
function interpolate(str: string, params?: InterpolationParams): string {
  if (!params) return str;

  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

/**
 * Create a translation function for a specific language
 */
export function createTranslator(language: Language) {
  return function t(key: string, params?: InterpolationParams): string {
    const translation = getNestedValue(translations[language], key);

    if (!translation) {
      // Fallback to English if key not found in current language
      const fallback = getNestedValue(translations.en, key);
      if (fallback) {
        return interpolate(fallback, params);
      }
      // Return key if translation not found (helpful for debugging)
      console.warn(`Translation missing: ${key}`);
      return key;
    }

    return interpolate(translation, params);
  };
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for accessing translations in components
 *
 * @example
 * function MyComponent() {
 *   const { t, language } = useTranslation();
 *   return <p>{t('common.loading')}</p>;
 * }
 */
export function useTranslation() {
  const { language } = useAccessibility();

  const t = useCallback(
    (key: string, params?: InterpolationParams): string => {
      return createTranslator(language)(key, params);
    },
    [language]
  );

  return { t, language };
}

// =============================================================================
// STANDALONE TRANSLATOR (for non-React contexts)
// =============================================================================

/**
 * Get current language from localStorage
 * Useful for translations outside React components
 */
export function getCurrentLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  try {
    const stored = localStorage.getItem('curio-accessibility');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.language === 'tl') return 'tl';
    }
  } catch {
    // Invalid JSON
  }

  return 'en';
}

/**
 * Translate a key using current language (for non-React contexts)
 */
export function translate(key: string, params?: InterpolationParams): string {
  return createTranslator(getCurrentLanguage())(key, params);
}

// Re-export types
export type { TranslationKeys };
