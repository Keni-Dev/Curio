/**
 * QuickActions Component
 * Pre-built prompt buttons for common health queries
 * Horizontal scrolling chips matching reference design
 */

import { cn } from '@/lib/utils';
import { QUICK_ACTIONS } from '../constants';
import type { QuickActionsProps } from '../types';

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {QUICK_ACTIONS.map((action, index) => (
          <button
            key={action.id}
            onClick={() => onSelect(action.prompt)}
            disabled={disabled}
            className={cn(
              'inline-flex items-center gap-1.5 shrink-0',
              'whitespace-nowrap',
              'px-4 py-2 rounded-full',
              'text-sm font-medium',
              'transition-all duration-200',
              'active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              // First item is highlighted
              index === 0
                ? 'bg-primary/10 border border-primary/20 text-primary dark:text-primary-light font-semibold hover:bg-primary/20'
                : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            )}
          >
            {action.emoji && <span aria-hidden="true">{action.emoji}</span>}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
