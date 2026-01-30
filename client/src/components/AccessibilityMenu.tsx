/**
 * AccessibilityMenu Component
 *
 * Settings panel for accessibility preferences.
 * Follows ARIA switch pattern for toggle controls.
 *
 * @see prompts/phase_05_polish/02_accessibility.md
 * @see WAI-ARIA Switch Pattern
 */

import { useAccessibility, type Language } from '@/contexts/AccessibilityContext';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface AccessibilityMenuProps {
  /** Additional CSS classes */
  className?: string;
  /** Hide the header (useful when used inside a BottomSheet with its own title) */
  hideHeader?: boolean;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
  icon?: string;
}

function ToggleSwitch({
  id,
  checked,
  onChange,
  label,
  description,
  icon,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <span
            className={cn(
              'material-symbols-outlined text-lg',
              'shrink-0 size-7 flex items-center justify-center rounded-lg',
              checked 
                ? 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/30' 
                : 'text-slate-400 bg-slate-100 dark:text-slate-500 dark:bg-slate-800'
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <label
            id={`${id}-label`}
            htmlFor={id}
            className="block text-base font-semibold text-slate-800 dark:text-white cursor-pointer"
          >
            {label}
          </label>
          {description && (
            <p
              id={`${id}-desc`}
              className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-snug"
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {/* Toggle switch - inline styles to bypass rem scaling from font-scale */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange();
          }
        }}
        style={{ width: '44px', height: '24px', minWidth: '44px', minHeight: '24px' }}
        className={cn(
          // Track
          'relative rounded-full cursor-pointer shrink-0',
          'transition-colors duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 dark:focus-visible:ring-teal-800',
          checked
            ? 'bg-teal-600 dark:bg-teal-500'
            : 'bg-slate-200 dark:bg-slate-600'
        )}
      >
        <span className="sr-only">{label}</span>
        {/* Thumb - inline styles to bypass rem scaling */}
        <span
          aria-hidden="true"
          style={{ width: '20px', height: '20px', top: '2px', left: '2px' }}
          className={cn(
            'absolute rounded-full bg-white shadow-sm',
            'transition-transform duration-200 ease-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
  label: string;
}

function LanguageSelector({ value, onChange, label }: LanguageSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'material-symbols-outlined text-lg',
            'shrink-0 size-7 flex items-center justify-center rounded-lg',
            'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/30'
          )}
          aria-hidden="true"
        >
          translate
        </span>
        <label
          id="language-label"
          className="text-base font-semibold text-slate-800 dark:text-white"
        >
          {label}
        </label>
      </div>
      <div
        role="radiogroup"
        aria-labelledby="language-label"
        className="flex rounded-full bg-slate-100 dark:bg-slate-700/80 p-1 gap-0.5"
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === 'en'}
          onClick={() => onChange('en')}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-semibold',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1',
            value === 'en'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          )}
        >
          {t('accessibility.english')}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === 'tl'}
          onClick={() => onChange('tl')}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-semibold',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1',
            value === 'tl'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          )}
        >
          {t('accessibility.tagalog')}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AccessibilityMenu({ className, hideHeader = false }: AccessibilityMenuProps) {
  const {
    largeText,
    highContrast,
    reduceMotion,
    language,
    toggleSetting,
    setSetting,
    resetSettings,
  } = useAccessibility();
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl',
        'border border-slate-200/50 dark:border-slate-700/50',
        'shadow-lg shadow-slate-900/5 dark:shadow-slate-900/30',
        className
      )}
      role="region"
      aria-labelledby={hideHeader ? undefined : "accessibility-title"}
      aria-label={hideHeader ? t('accessibility.title') : undefined}
    >
      {/* Header - only show if not hidden */}
      {!hideHeader && (
        <div className="px-5 pt-5 pb-2">
          <h2
            id="accessibility-title"
            className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5"
          >
            <span 
              className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xl" 
              aria-hidden="true"
            >
              accessibility_new
            </span>
            {t('accessibility.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[30px]">
            {t('accessibility.subtitle') || 'Customize your viewing experience'}
          </p>
        </div>
      )}

      {/* Toggle Settings */}
      <div className="px-5 divide-y divide-slate-100/80 dark:divide-slate-700/60">
        <ToggleSwitch
          id="large-text-toggle"
          checked={largeText}
          onChange={() => toggleSetting('largeText')}
          label={t('accessibility.largeText')}
          description={t('accessibility.largeTextDesc')}
          icon="text_fields"
        />

        <ToggleSwitch
          id="high-contrast-toggle"
          checked={highContrast}
          onChange={() => toggleSetting('highContrast')}
          label={t('accessibility.highContrast')}
          description={t('accessibility.highContrastDesc')}
          icon="contrast"
        />

        <ToggleSwitch
          id="reduce-motion-toggle"
          checked={reduceMotion}
          onChange={() => toggleSetting('reduceMotion')}
          label={t('accessibility.reduceMotion')}
          description={t('accessibility.reduceMotionDesc')}
          icon="motion_photos_off"
        />

        <LanguageSelector
          value={language}
          onChange={(lang) => setSetting('language', lang)}
          label={t('accessibility.language')}
        />
      </div>

      {/* Reset Button */}
      <div className="px-5 pt-3 pb-5">
        <button
          type="button"
          onClick={resetSettings}
          className={cn(
            'w-full py-3 px-4 rounded-xl',
            'text-sm font-semibold text-slate-500 dark:text-slate-400',
            'bg-slate-50 dark:bg-slate-700/50',
            'border border-slate-200/80 dark:border-slate-600/50',
            'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300',
            'active:scale-[0.98]',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800',
            'flex items-center justify-center gap-2'
          )}
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            restart_alt
          </span>
          {t('accessibility.resetSettings')}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// COMPACT ACCESSIBILITY BUTTON (for NavHeader)
// =============================================================================

interface AccessibilityButtonProps {
  onClick: () => void;
  className?: string;
}

export function AccessibilityButton({ onClick, className }: AccessibilityButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('aria.accessibilitySettings')}
      className={cn(
        'flex items-center justify-center',
        'size-10 rounded-full',
        'bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm',
        'text-text-secondary hover:text-primary',
        'shadow-sm hover:shadow-md',
        'transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        className
      )}
    >
      <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
        accessibility_new
      </span>
    </button>
  );
}
