/**
 * ChatInterface Component
 * Main chat container composing all chat UI elements
 */

import { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useMediBot } from '../hooks/useMediBot';
import { MedicalDisclaimer } from './MedicalDisclaimer';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';
import { ChatInput } from './ChatInput';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useMediBot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Derive showQuickActions from messages state (no useEffect needed)
  const showQuickActions = useMemo(() => {
    return !messages.some((m) => m.role === 'user');
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        'bg-slate-50 dark:bg-slate-900',
        className
      )}
    >
      {/* Medical disclaimer banner */}
      <MedicalDisclaimer variant="compact" />

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className={cn(
          'flex-1 overflow-y-auto',
          'p-4 space-y-4',
          'bg-slate-50 dark:bg-slate-900'
        )}
      >
        {/* Message list with inline quick actions */}
        {messages.map((message, index) => (
          <div key={message.id}>
            <MessageBubble message={message} />
            
            {/* Quick actions shown right after first bot message */}
            {index === 0 && message.role === 'assistant' && showQuickActions && !isLoading && (
              <div className="pl-10 pt-2">
                <QuickActions onSelect={handleQuickAction} disabled={isLoading} />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Clear chat button (shown when there are user messages) */}
      {!showQuickActions && messages.length > 1 && (
        <div className="flex justify-center py-2 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <button
            onClick={handleClearChat}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5',
              'text-xs font-medium text-text-muted',
              'hover:text-text-primary dark:hover:text-white',
              'transition-colors duration-200'
            )}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              refresh
            </span>
            Bagong usapan
          </button>
        </div>
      )}

      {/* Chat input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="Magtanong kay Medi-Bot..."
      />
    </div>
  );
}
