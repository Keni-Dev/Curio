/**
 * ChatInput Component
 * Auto-resizing textarea with send button
 */

import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import type { ChatInputProps } from '../types';

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const trimmedValue = value.trim();
      if (trimmedValue && !disabled) {
        onSend(trimmedValue);
        setValue('');
        // Reset height after sending
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    },
    [value, disabled, onSend]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter to send, Shift+Enter for new line
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-end gap-2 px-4 py-3',
        'bg-white dark:bg-surface-dark',
        'border-t border-slate-100 dark:border-slate-800',
        'shrink-0'
      )}
    >
      {/* Text input area */}
      <div
        className={cn(
          'flex-1',
          'bg-slate-100 dark:bg-slate-800',
          'rounded-3xl',
          'flex items-center',
          'px-4 py-2',
          'focus-within:ring-2 focus-within:ring-primary/50',
          'transition-all duration-200'
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 bg-transparent border-none',
            'text-sm text-text-primary dark:text-white',
            'placeholder:text-slate-400',
            'resize-none leading-6 p-0',
            'focus:outline-none focus:ring-0',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Message input"
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={!canSend}
        className={cn(
          'flex-shrink-0',
          'p-3 rounded-full',
          'flex items-center justify-center',
          'bg-primary text-slate-900',
          'shadow-lg shadow-primary/20',
          'transition-all duration-200',
          'hover:bg-primary-hover',
          'active:scale-[0.95]',
          'disabled:bg-slate-200 dark:disabled:bg-slate-700',
          'disabled:text-slate-400',
          'disabled:shadow-none disabled:cursor-not-allowed'
        )}
        aria-label="Send message"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          send
        </span>
      </button>
    </form>
  );
}
