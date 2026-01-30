/**
 * useOpenRouter Hook
 * Custom hook for managing chat with OpenRouter API
 * Includes model rotation/fallback for improved reliability
 */

import { useState, useCallback, useRef } from 'react';
import type { Message, OpenRouterMessage, OpenRouterResponse } from '../types';
import {
  OPENROUTER_CONFIG,
  MAX_CONTEXT_MESSAGES,
  SYSTEM_PROMPT,
  WELCOME_MESSAGE,
  OPENROUTER_MODELS,
  MODEL_COOLDOWN_MS,
  RATE_LIMIT_COOLDOWN_MS,
  MIN_REQUEST_INTERVAL_MS,
} from '../constants';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

/** Track which models have failed recently to avoid repeated failures */
const modelFailures: Map<string, { failedAt: number; count: number }> = new Map();

/** Global rate limit tracking */
let rateLimitCooldownUntil = 0;
let lastRequestTime = 0;
let consecutiveRateLimits = 0;

/** Get available models (excluding those in cooldown) */
function getAvailableModels(): string[] {
  const now = Date.now();
  return OPENROUTER_MODELS.filter(model => {
    const failure = modelFailures.get(model);
    if (!failure) return true;
    // Allow model after cooldown period
    if (now - failure.failedAt > MODEL_COOLDOWN_MS) {
      modelFailures.delete(model);
      return true;
    }
    return false;
  });
}

/** Mark a model as failed */
function markModelFailed(model: string): void {
  const existing = modelFailures.get(model);
  modelFailures.set(model, {
    failedAt: Date.now(),
    count: (existing?.count ?? 0) + 1,
  });
  console.warn(`[Medi-Bot] Model ${model} marked as failed (${modelFailures.get(model)?.count} failures)`);
}

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

      // Check global rate limit cooldown
      const now = Date.now();
      if (rateLimitCooldownUntil > now) {
        const waitSeconds = Math.ceil((rateLimitCooldownUntil - now) / 1000);
        throw new Error(`Rate limited. Maghintay ka ng ${waitSeconds} segundo bago mag-try ulit.`);
      }

      // Get available models
      const availableModels = getAvailableModels();
      if (availableModels.length === 0) {
        throw new Error('Lahat ng AI models ay temporarily unavailable. Subukan mo ulit in a few minutes.');
      }

      let lastError: Error | null = null;
      let response: Response | null = null;
      let successModel: string | null = null;

      // Try each available model until one works
      for (const model of availableModels) {
        try {
          // Enforce minimum request interval to avoid rapid-fire requests
          const timeSinceLastRequest = Date.now() - lastRequestTime;
          if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
            await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest));
          }
          lastRequestTime = Date.now();

          console.log(`[Medi-Bot] Trying model: ${model}`);
          
          response = await fetch(OPENROUTER_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
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
            signal: abortControllerRef.current.signal,
          });

          // Handle 404 - model not found/unavailable, try next model
          if (response.status === 404) {
            console.warn(`[Medi-Bot] Model ${model} not found (404), trying next model...`);
            markModelFailed(model);
            continue;
          }

          // Handle rate limiting (429)
          if (response.status === 429) {
            consecutiveRateLimits++;
            console.warn(`[Medi-Bot] Rate limited on ${model} (${consecutiveRateLimits} consecutive)`);
            
            // If we've hit 3+ consecutive rate limits, set global cooldown
            if (consecutiveRateLimits >= 3) {
              const cooldownMs = RATE_LIMIT_COOLDOWN_MS * Math.min(consecutiveRateLimits - 2, 4); // Max 2 min cooldown
              rateLimitCooldownUntil = Date.now() + cooldownMs;
              console.warn(`[Medi-Bot] Global rate limit cooldown set for ${cooldownMs / 1000}s`);
              throw new Error(`Rate limited. Maghintay ka ng ${Math.ceil(cooldownMs / 1000)} segundo bago mag-try ulit.`);
            }
            
            // Add delay before trying next model
            await new Promise(resolve => setTimeout(resolve, 1000 * consecutiveRateLimits));
            markModelFailed(model);
            continue;
          }

          // Handle server errors (5xx) - try next model
          if (response.status >= 500) {
            console.warn(`[Medi-Bot] Server error on ${model} (${response.status}), trying next model...`);
            markModelFailed(model);
            continue;
          }

          // Check for other errors
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            lastError = new Error(errorData.error?.message || `API error: ${response.status}`);
            markModelFailed(model);
            continue;
          }

          // Success! Reset rate limit counter
          successModel = model;
          consecutiveRateLimits = 0;
          console.log(`[Medi-Bot] Success with model: ${model}`);
          break;
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            throw err; // Re-throw abort errors
          }
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`[Medi-Bot] Error with model ${model}:`, err);
          markModelFailed(model);
          continue;
        }
      }

      // If no model worked, throw the last error
      if (!response || !response.ok || !successModel) {
        throw lastError || new Error('All models failed. Please try again later.');
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
