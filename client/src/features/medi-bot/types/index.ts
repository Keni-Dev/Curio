/**
 * Medi-Bot Chat Types
 * Type definitions for the AI chat assistant feature
 */

/** Chat message structure */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** Medicine recommendation embedded in chat */
export interface MedicineRecommendation {
  name: string;
  genericName: string;
  brands: string[];
  typicalDosage: string;
  priceRange?: string;
}

/** Pharmacy suggestion based on stock */
export interface PharmacySuggestion {
  id: string;
  name: string;
  distance: string;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
}

/** Quick action button config */
export interface QuickAction {
  id: string;
  label: string;
  emoji?: string;
  prompt: string;
}

/** Chat state for the store */
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

/** OpenRouter API request message format */
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** OpenRouter API response */
export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** Props for MessageBubble component */
export interface MessageBubbleProps {
  message: Message;
  isTyping?: boolean;
}

/** Props for ChatInput component */
export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/** Props for QuickActions component */
export interface QuickActionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

/** Props for MedicalDisclaimer component */
export interface MedicalDisclaimerProps {
  variant?: 'compact' | 'full';
}
