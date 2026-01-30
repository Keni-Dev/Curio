/**
 * MedicalDisclaimer Component
 * Displays safety warning banner for AI health assistant
 */

import { cn } from '@/lib/utils';
import { DISCLAIMER_TEXT } from '../constants';
import type { MedicalDisclaimerProps } from '../types';

export function MedicalDisclaimer({
  variant = 'compact',
}: MedicalDisclaimerProps) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'flex items-start gap-2',
        'bg-amber-100 dark:bg-amber-900/40',
        isCompact ? 'px-4 py-2.5' : 'px-6 py-4 rounded-xl'
      )}
      role="alert"
      aria-live="polite"
    >
      <span
        className={cn(
          'material-symbols-outlined text-amber-600 dark:text-amber-400 flex-shrink-0',
          isCompact ? 'text-lg' : 'text-xl'
        )}
        aria-hidden="true"
      >
        warning
      </span>
      <p
        className={cn(
          'text-amber-900 dark:text-amber-100 font-semibold',
          isCompact ? 'text-xs' : 'text-sm leading-relaxed'
        )}
      >
        {isCompact ? DISCLAIMER_TEXT.compact : DISCLAIMER_TEXT.full}
      </p>
    </div>
  );
}
