/**
 * Voice Search Hook
 *
 * Web Speech API wrapper for voice-to-text search functionality.
 * Provides browser support detection and graceful fallbacks.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Extend Window interface for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// =============================================================================
// TYPES
// =============================================================================

interface UseVoiceSearchOptions {
  /** Language for speech recognition (default: 'fil-PH' for Filipino) */
  lang?: string;
  /** Callback when transcript is received */
  onTranscript?: (transcript: string) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

interface UseVoiceSearchReturn {
  /** Whether the browser supports speech recognition */
  isSupported: boolean;
  /** Whether speech recognition is currently active */
  isListening: boolean;
  /** The current transcript text */
  transcript: string;
  /** Any error message */
  error: string | null;
  /** Start listening for speech */
  startListening: () => void;
  /** Stop listening for speech */
  stopListening: () => void;
  /** Reset transcript and error state */
  reset: () => void;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for voice-to-text search functionality using Web Speech API.
 *
 * @param options - Configuration options
 * @returns Voice search state and controls
 *
 * @example
 * ```tsx
 * const { isSupported, isListening, transcript, startListening, stopListening } = useVoiceSearch({
 *   onTranscript: (text) => setSearchQuery(text),
 * });
 *
 * return (
 *   <button onClick={isListening ? stopListening : startListening} disabled={!isSupported}>
 *     {isListening ? 'Stop' : 'Voice Search'}
 *   </button>
 * );
 * ```
 */
export function useVoiceSearch(
  options: UseVoiceSearchOptions = {}
): UseVoiceSearchReturn {
  const { lang = 'fil-PH', onTranscript, onError } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for browser support
  const isSupported =
    typeof window !== 'undefined' &&
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];

      if (result) {
        const text = result[0]?.transcript || '';
        setTranscript(text);

        // Only call onTranscript for final results
        if (result.isFinal && onTranscript) {
          onTranscript(text);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getErrorMessage(event.error);
      setError(errorMessage);
      setIsListening(false);
      onError?.(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, lang, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    setTranscript('');
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Recognition may already be started
      console.warn('Speech recognition start error:', err);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn('Speech recognition stop error:', err);
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    reset,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'not-allowed': 'Microphone access denied. Please enable it in your browser settings.',
    'no-speech': 'No speech detected. Please try again.',
    'audio-capture': 'No microphone found. Please connect a microphone.',
    'network': 'Network error. Please check your internet connection.',
    'aborted': 'Speech recognition was aborted.',
    'service-not-allowed': 'Speech recognition service is not allowed.',
  };

  return errorMessages[errorCode] || 'An error occurred during speech recognition.';
}

export default useVoiceSearch;
