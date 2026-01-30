/**
 * Divider Component
 *
 * Visual separator with optional text (e.g., "or").
 */

import { cn } from '~lib/utils';

interface AuthDividerProps {
  text?: string;
  className?: string;
}

export function AuthDivider({ text = 'or', className }: AuthDividerProps) {
  return (
    <div className={cn('relative my-6', className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-700" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white dark:bg-surface-dark text-text-muted">
          {text}
        </span>
      </div>
    </div>
  );
}
