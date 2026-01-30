/**
 * ChatPage
 * Medi-Bot AI assistant chat page
 */

import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChatInterface } from '@/features/medi-bot';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-background dark:bg-background-dark">
      {/* Header */}
      <header
        className={cn(
          'flex items-center gap-3 px-4 py-3',
          'bg-white dark:bg-surface-dark',
          'border-b border-slate-200 dark:border-slate-700',
          'shadow-sm'
        )}
      >
        {/* Back button */}
        <Link
          to="/"
          className={cn(
            'w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'text-text-primary dark:text-white',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'transition-colors duration-200'
          )}
          aria-label="Back to home"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_back
          </span>
        </Link>

        {/* Title */}
        <div className="flex items-center gap-3 flex-1">
          <div
            className={cn(
              'w-10 h-10 rounded-full',
              'flex items-center justify-center',
              'bg-gradient-to-br from-primary to-primary-hover',
              'shadow-md shadow-primary/25'
            )}
          >
            <span className="material-symbols-outlined text-white" aria-hidden="true">
              smart_toy
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary dark:text-white">
              Medi-Bot
            </h1>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-in-stock" aria-hidden="true" />
              AI Health Assistant
            </p>
          </div>
        </div>

        {/* Info button */}
        <button
          className={cn(
            'w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'text-text-secondary',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'transition-colors duration-200'
          )}
          aria-label="About Medi-Bot"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            info
          </span>
        </button>
      </header>

      {/* Chat interface */}
      <ChatInterface className="flex-1" />
    </div>
  );
}
