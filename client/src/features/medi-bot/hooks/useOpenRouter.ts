/**
 * useOpenRouter Hook
 * Custom hook for managing chat with OpenRouter API
 */

import { useState, useCallback, useRef } from 'react';
import type { Message, OpenRouterMessage, OpenRouterResponse } from '../types';
import {
  OPENROUTER_CONFIG,
  MAX_CONTEXT_MESSAGES,
  SYSTEM_PROMPT,
  WELCOME_MESSAGE,
} from '../constants';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

/** Generate unique message ID */
const generateId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/** Convert app messages to OpenRouter format */
const toOpenRouterMessages = (messages: Message[]): OpenRouterMessage[] => {
  // Take only the last N messages for context
  const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];
};

export interface UseOpenRouterReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  cancelRequest: () => void;
}

export function useOpenRouter(): UseOpenRouterReturn {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message to state
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Check if API key is configured
      if (!OPENROUTER_API_KEY) {
        throw new Error(
          'OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY.'
        );
      }

      // Prepare messages for API
      const apiMessages = toOpenRouterMessages([
        ...messages.filter((m) => m.id !== 'welcome'),
        userMessage,
      ]);

      // Make API request
      const response = await fetch(OPENROUTER_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Curio - Medi-Bot',
        },
        body: JSON.stringify({
          model: OPENROUTER_CONFIG.model,
          messages: apiMessages,
          max_tokens: OPENROUTER_CONFIG.maxTokens,
          temperature: OPENROUTER_CONFIG.temperature,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `API error: ${response.status}`
        );
      }

      const data: OpenRouterResponse = await response.json();

      // Extract assistant response
      const assistantContent =
        data.choices?.[0]?.message?.content ||
        'Pasensya na, hindi ko maintindihan. Pwede mo bang ulitin?';

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      // Add assistant message to state
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      // Handle abort
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request cancelled');
        return;
      }

      // Handle other errors
      const errorMessage =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);

      // Add error message as assistant response
      const errorResponseMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Pasensya na, nagkaroon ng problema. 😔 ${errorMessage}. Subukan mo ulit mamaya.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Reset to welcome message
    setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
    setError(null);
    setIsLoading(false);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    cancelRequest,
  };
}
