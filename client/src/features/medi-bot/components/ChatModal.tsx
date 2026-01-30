/**
 * ChatModal Component
 * Slide-up chat modal for Medi-Bot AI assistant
 */

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChatInterface } from './ChatInterface';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60]',
          'bg-black/40 backdrop-blur-sm',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
        className={cn(
          'fixed z-[70]',
          // Mobile: full width, slides up from bottom
          'bottom-0 left-0 right-0',
          'h-[85vh] max-h-[700px]',
          // Desktop: positioned near the FAB
          'sm:bottom-24 sm:right-4 sm:left-auto',
          'sm:w-[400px] sm:h-[600px]',
          // Styling - fully opaque background
          'bg-white dark:bg-slate-900',
          'rounded-t-3xl sm:rounded-2xl',
          'shadow-2xl',
          'border border-slate-200 dark:border-slate-700',
          'flex flex-col',
          'overflow-hidden',
          // Animation
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-4 sm:opacity-0'
        )}
      >
        {/* Header */}
        <header
          className={cn(
            'flex items-center gap-3 px-4 py-3',
            'bg-white dark:bg-slate-900',
            'border-b border-slate-100 dark:border-slate-800',
            'shrink-0'
          )}
        >
          {/* Drag handle (mobile) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 sm:hidden">
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>

          {/* Bot Avatar */}
          <div className="relative mt-2 sm:mt-0">
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
            {/* Online indicator */}
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5',
                'w-3.5 h-3.5 rounded-full',
                'bg-status-in-stock',
                'border-2 border-white dark:border-slate-900'
              )}
              aria-label="Online"
            />
          </div>

          {/* Title */}
          <div className="flex-1 mt-2 sm:mt-0">
            <h2
              id="chat-modal-title"
              className="text-base font-bold text-text-primary dark:text-white flex items-center gap-1"
            >
              Medi-Bot
              <span className="text-lg" aria-hidden="true">🤖</span>
            </h2>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-in-stock" aria-hidden="true" />
              Online • Generics Assistant
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className={cn(
              'w-10 h-10 rounded-full mt-2 sm:mt-0',
              'flex items-center justify-center',
              'text-text-secondary',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'transition-colors duration-200'
            )}
            aria-label="Close chat"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </header>

        {/* Chat Interface */}
        <ChatInterface className="flex-1 min-h-0" />
      </div>
    </>
  );
}
