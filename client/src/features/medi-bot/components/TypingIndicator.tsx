/**
 * TypingIndicator Component
 * Animated dots showing bot is thinking/typing
 */

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-4 py-3',
        'bg-white dark:bg-surface-dark',
        'rounded-2xl rounded-tl-none',
        'shadow-sm border border-slate-200 dark:border-slate-700',
        'w-fit',
        className
      )}
      role="status"
      aria-label="Medi-Bot is typing"
    >
      <span className="sr-only">Medi-Bot is typing...</span>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            'w-2 h-2 rounded-full',
            'bg-primary/60',
            'animate-bounce'
          )}
          style={{
            animationDelay: `${index * 150}ms`,
            animationDuration: '600ms',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
