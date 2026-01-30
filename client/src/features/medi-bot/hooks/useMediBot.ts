/**
 * useMediBot Hook
 * Custom hook for managing chat with Gemini API (primary) and OpenRouter fallback
 */

import { useState, useCallback, useRef } from 'react';
import type { Message } from '../types';
import {
  GEMINI_CONFIG,
  OPENROUTER_CONFIG,
  OPENROUTER_MODELS,
  MAX_CONTEXT_MESSAGES,
  SYSTEM_PROMPT,
  WELCOME_MESSAGE,
} from '../constants';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MEDIBOT_OPENROUTER_KEY = import.meta.env.VITE_MEDIBOT_OPENROUTER_KEY || import.meta.env.VITE_OPENROUTER_API_KEY || '';

/** Generate unique message ID */
const generateId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/** Convert messages to Gemini format */
const toGeminiMessages = (messages: Message[]) => {
  const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
  
  return recentMessages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
};

/** Convert messages to OpenRouter format */
const toOpenRouterMessages = (messages: Message[]) => {
  const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];
};

/** Call Gemini API with retry support */
async function callGeminiAPI(
  messages: Message[],
  signal: AbortSignal,
  retryCount = 0
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('NO_GEMINI_KEY');
  }

  const url = `${GEMINI_CONFIG.baseUrl}/${GEMINI_CONFIG.model}:generateContent`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: toGeminiMessages(messages),
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      generationConfig: {
        maxOutputTokens: GEMINI_CONFIG.maxTokens,
        temperature: GEMINI_CONFIG.temperature,
      },
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Medi-Bot] Gemini API error:', response.status, errorData);
    
    // Handle rate limit with retry
    if (response.status === 429 && retryCount < 2) {
      const errorMessage = errorData?.error?.message || '';
      
      // Extract retry time from message (e.g., "Please retry in 41.456985695s")
      const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i);
      const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 30;
      
      // Check if it's just rate limit (not quota exhausted)
      const isQuotaExhausted = errorMessage.includes('limit: 0');
      
      if (!isQuotaExhausted && retrySeconds <= 60) {
        console.log(`[Medi-Bot] Gemini rate limited, waiting ${retrySeconds}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, retrySeconds * 1000));
        return callGeminiAPI(messages, signal, retryCount + 1);
      }
    }
    
    throw new Error(`Gemini API error: ${response.status} - ${errorData?.error?.message || 'Unknown'}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('No content in Gemini response');
  }

  return content;
}

/** Call OpenRouter API with model rotation */
async function callOpenRouterAPI(
  messages: Message[],
  signal: AbortSignal
): Promise<string> {
  if (!MEDIBOT_OPENROUTER_KEY) {
    throw new Error('NO_OPENROUTER_KEY');
  }

  const apiMessages = toOpenRouterMessages(messages);
  let lastError: Error | null = null;

  for (const model of OPENROUTER_MODELS) {
    try {
      console.log(`[Medi-Bot] Trying OpenRouter model: ${model}`);
      
      const response = await fetch(OPENROUTER_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MEDIBOT_OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Curio - Medi-Bot',
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          max_tokens: OPENROUTER_CONFIG.maxTokens,
          temperature: OPENROUTER_CONFIG.temperature,
        }),
        signal,
      });

      // Skip to next model on 404 or 429
      if (response.status === 404 || response.status === 429) {
        console.warn(`[Medi-Bot] OpenRouter ${model}: ${response.status}, trying next...`);
        continue;
      }

      if (!response.ok) {
        console.warn(`[Medi-Bot] OpenRouter ${model}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (content) {
        console.log(`[Medi-Bot] Success with OpenRouter model: ${model}`);
        return content;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('All OpenRouter models failed');
}

export interface UseMediBotReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  cancelRequest: () => void;
}

export function useMediBot(): UseMediBotReturn {
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
      // Build conversation history (excluding welcome message)
      const conversationMessages = [
        ...messages.filter((m) => m.id !== 'welcome'),
        userMessage,
      ];

      let assistantContent: string;

      // Use OpenRouter directly
      console.log('[Medi-Bot] Using OpenRouter...');
      assistantContent = await callOpenRouterAPI(
        conversationMessages,
        abortControllerRef.current.signal
      );

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

      // Create a user-friendly error message
      let userFriendlyMessage = 'Pasensya na, nagkaroon ng problema. 😔 Subukan mo ulit mamaya.';
      
      if (errorMessage.includes('429') || errorMessage.includes('rate') || errorMessage.includes('quota')) {
        userFriendlyMessage = 'Pasensya na, busy ang AI ngayon. 😅 Subukan mo ulit sa 1-2 minuto.';
      } else if (errorMessage.includes('All') && errorMessage.includes('failed')) {
        userFriendlyMessage = 'Pasensya na, hindi available ang AI ngayon. 😔 Subukan mo ulit mamaya.';
      }

      // Add error message as assistant response
      const errorResponseMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: userFriendlyMessage,
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
