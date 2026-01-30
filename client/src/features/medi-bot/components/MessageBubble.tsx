/**
 * MessageBubble Component
 * Chat message display with user/assistant styling
 */

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import type { MessageBubbleProps } from '../types';

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isWelcome = message.id === 'welcome';

  if (isUser) {
    // User message - right aligned
    return (
      <div className="flex justify-end">
        <div className="flex flex-col items-end gap-1 max-w-[80%]">
          <div
            className={cn(
              'px-4 py-3',
              'bg-primary text-white',
              'rounded-2xl rounded-tr-none',
              'shadow-md shadow-primary/20',
              'text-[15px] leading-relaxed font-medium'
            )}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          {!isWelcome && (
            <span className="text-xs text-text-muted mr-1">
              {formatRelativeTime(message.timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Bot message - left aligned with avatar
  return (
    <div className="flex items-end gap-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover overflow-hidden shrink-0 self-end mb-5 flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-white text-base" aria-hidden="true">
          smart_toy
        </span>
      </div>
      
      <div className="flex flex-col gap-1 max-w-[85%]">
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-medium">
          Medi-Bot
        </span>
        <div
          className={cn(
            'px-4 py-3',
            'bg-white dark:bg-surface-dark',
            'text-slate-800 dark:text-slate-100',
            'rounded-2xl rounded-tl-none',
            'shadow-sm',
            'border border-slate-100 dark:border-slate-800/50',
            'text-[15px] leading-relaxed'
          )}
        >
          <div className="whitespace-pre-wrap break-words medi-bot-markdown">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                a: ({ href, children }) => (
                  <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        {!isWelcome && (
          <span className="text-xs text-text-muted ml-1">
            {formatRelativeTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
