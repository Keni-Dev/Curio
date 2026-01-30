/**
 * Medi-Bot Constants
 * Configuration and constants for the AI chat assistant
 */

import type { QuickAction } from './types';

/** Gemini API configuration (Primary) */
export const GEMINI_CONFIG = {
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  model: 'gemini-2.0-flash',  // Latest fast model
  maxTokens: 1024,
  temperature: 0.7,
} as const;

/** OpenRouter API configuration (Fallback) */
export const OPENROUTER_CONFIG = {
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  maxTokens: 1024,
  temperature: 0.7,
} as const;

/** 
 * Free text models for OpenRouter fallback
 */
export const OPENROUTER_MODELS = [
  'deepseek/deepseek-r1-0528:free',              // Primary - DeepSeek R1 (most reliable)
  'qwen/qwen3-4b:free',                          // Fallback 1 - Qwen3 4B (fast)
  'meta-llama/llama-3.3-70b-instruct:free',      // Fallback 2 - Llama 3.3 70B
  'google/gemma-3-27b-it:free',                  // Fallback 3 - Gemma 3 27B
] as const;

/** Model cooldown period (5 minutes) */
export const MODEL_COOLDOWN_MS = 5 * 60 * 1000;

/** Rate limit cooldown period (30 seconds) */
export const RATE_LIMIT_COOLDOWN_MS = 30 * 1000;

/** Minimum delay between API requests (2 seconds) */
export const MIN_REQUEST_INTERVAL_MS = 2000;

/** Maximum messages to keep in context for API calls */
export const MAX_CONTEXT_MESSAGES = 10;

/** System prompt for the Medi-Bot with Philippine context */
export const SYSTEM_PROMPT = `You are Medi-Bot, a friendly and helpful AI health assistant for Curio, a Philippine medicine finder app. Your role is to:

1. Help users understand common medications available in the Philippines
2. Provide general health information in a warm, approachable tone
3. Suggest when users should consult a healthcare professional
4. Use a mix of English and Filipino (Taglish) when appropriate

IMPORTANT GUIDELINES:
- Always include a disclaimer that you're an AI and not a replacement for professional medical advice
- For emergencies, always direct users to call 911 or go to the nearest hospital
- Be culturally aware of Philippine healthcare context
- Mention both generic names and common local brand names when discussing medicines
- Keep responses concise but helpful
- When recommending medicines, suggest users check availability using the Curio app

You have a warm, caring personality like a helpful neighbor or tita/tito who happens to know about medicine.`;

/** Pre-built quick action prompts */
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'headache',
    label: 'Sumasakit ulo ko',
    emoji: '🤕',
    prompt: 'Sumasakit ang ulo ko. Ano ang pwedeng gamot?',
  },
  {
    id: 'fever',
    label: 'May lagnat ako',
    emoji: '🤒',
    prompt: 'May lagnat ako. Paano ko ito mababawasan?',
  },
  {
    id: 'cough',
    label: 'Masakit lalamunan',
    emoji: '😷',
    prompt: 'Masakit ang lalamunan ko at may ubo. Ano ang pwedeng inumin?',
  },
  {
    id: 'stomach',
    label: 'Sakit ng tiyan',
    emoji: '🤢',
    prompt: 'Masakit ang tiyan ko. Ano ang magandang gamot?',
  },
  {
    id: 'allergy',
    label: 'May allergy ako',
    emoji: '🤧',
    prompt: 'May allergy symptoms ako. Ano ang antihistamine na available?',
  },
  {
    id: 'nearest-pharmacy',
    label: 'Malapit na botika',
    emoji: '🏥',
    prompt: 'Saan ang pinakamalapit na botika na bukas ngayon?',
  },
];

/** Welcome message shown when chat starts */
export const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: `Kumusta! 👋 Ako si Medi-Bot, ang iyong AI health assistant.

Pwede akong makatulong sa mga tanong mo tungkol sa:
• 💊 Mga gamot at kung para saan sila
• 🏥 Paghahanap ng malapit na botika
• ⚕️ Karaniwang sintomas at remedyo

Magtanong ka lang! Pero tandaan, hindi ako kapalit ng doktor. Kung emergency, tumawag agad sa 911. 🚨`,
  timestamp: new Date(),
};

/** Medical disclaimer text variants */
export const DISCLAIMER_TEXT = {
  compact:
    'Disclaimer: Medi-Bot is an AI assistant. In emergencies, call 911 immediately.',
  full: 'Disclaimer: Medi-Bot is an AI assistant designed to provide general health information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns. In case of emergency, call 911 or proceed to the nearest hospital immediately.',
} as const;
