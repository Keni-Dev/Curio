/**
 * AccessibilityFab Component
 *
 * Global floating action button for accessibility settings.
 * Renders on all screens for easy access to accessibility options.
 */

import { useState } from 'react';
import { cn } from '~lib/utils';
import { BottomSheet } from '~components/ui/BottomSheet';
import { AccessibilityMenu } from '~components/AccessibilityMenu';

export function AccessibilityFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Accessibility Button - Large and easy to tap for seniors */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-50',
          'w-14 h-14 rounded-full',
          'flex items-center justify-center',
          'bg-white dark:bg-surface-dark text-primary',
          'shadow-lg border-2 border-primary/20',
          'transition-all duration-200',
          'hover:bg-primary hover:text-white hover:shadow-xl',
          'hover:scale-105',
          'active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
        )}
        aria-label="Open accessibility settings"
      >
        <span className="material-symbols-outlined text-2xl" aria-hidden="true">
          accessibility_new
        </span>
      </button>

      {/* Accessibility Settings Bottom Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Accessibility"
        defaultSnap="half"
      >
        <AccessibilityMenu hideHeader className="bg-transparent" />
      </BottomSheet>
    </>
  );
}
