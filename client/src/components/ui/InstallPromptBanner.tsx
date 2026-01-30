/**
 * InstallPromptBanner Component
 * 
 * Bottom sheet-style banner prompting users to install the PWA.
 * Appears after demonstrating value (e.g., first successful search).
 */

import { cn } from '~lib/utils';
import { useInstallPrompt } from '~hooks/useInstallPrompt';
import { CurioLogo } from './CurioLogo';

// ============================================================================
// Component
// ============================================================================

export function InstallPromptBanner() {
  const { canInstall, promptInstall, dismissPrompt } = useInstallPrompt();

  if (!canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (!installed) {
      // User declined, but don't dismiss yet - they might change their mind
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'p-4 pb-safe',
        'bg-white dark:bg-surface-dark',
        'border-t border-slate-200 dark:border-slate-700',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.1)]',
        'animate-in slide-in-from-bottom duration-300'
      )}
      role="dialog"
      aria-label="Install Curio app"
    >
      <div className="max-w-lg mx-auto flex items-center gap-4">
        {/* App Icon */}
        <div className="shrink-0 size-14 rounded-xl bg-primary flex items-center justify-center shadow-soft">
          <CurioLogo size={32} variant="white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary dark:text-white text-sm">
            Install Curio
          </h3>
          <p className="text-text-secondary text-xs mt-0.5 line-clamp-2">
            Add to home screen for quick access and offline mode
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={dismissPrompt}
            className={cn(
              'px-3 py-2 text-sm font-medium',
              'text-text-secondary hover:text-text-primary',
              'transition-colors',
              'min-h-[44px]'
            )}
            aria-label="Dismiss install prompt"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className={cn(
              'px-4 py-2.5 rounded-xl',
              'bg-primary hover:bg-primary/90',
              'text-white text-sm font-bold',
              'shadow-soft hover:shadow-glow',
              'transition-all duration-200',
              'min-h-[44px]'
            )}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPromptBanner;
