// Medi-bot feature barrel export

// Components
export { ChatInterface } from './components/ChatInterface';
export { ChatModal } from './components/ChatModal';
export { MessageBubble } from './components/MessageBubble';
export { TypingIndicator } from './components/TypingIndicator';
export { QuickActions } from './components/QuickActions';
export { MedicalDisclaimer } from './components/MedicalDisclaimer';
export { ChatInput } from './components/ChatInput';

// Hooks
export { useOpenRouter } from './hooks/useOpenRouter';
export type { UseOpenRouterReturn } from './hooks/useOpenRouter';

// Types
export type {
  Message,
  MedicineRecommendation,
  PharmacySuggestion,
  QuickAction,
  ChatState,
  MessageBubbleProps,
  ChatInputProps,
  QuickActionsProps,
  MedicalDisclaimerProps,
} from './types';

// Constants
export {
  OPENROUTER_CONFIG,
  SYSTEM_PROMPT,
  QUICK_ACTIONS,
  WELCOME_MESSAGE,
  DISCLAIMER_TEXT,
} from './constants';
