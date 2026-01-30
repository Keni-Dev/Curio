/**
 * useOCRExtraction Hook
 *
 * Handles OCR extraction from prescription images using the ML service.
 * Uses TanStack Query mutation for state management.
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isDemoModeActive } from '@/stores/useDevToolsStore';
import { demoExtractPrescription } from '@/lib/demo';
import type {
  OCRResult,
  OCRServiceResponse,
  ExtractedMedicine,
} from '../types';
import {
  getConfidenceLevel,
  generateExtractedMedicineId,
} from '../types';

/** OpenRouter API configuration */
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

/** 
 * Free vision models with fallback order (all support image input)
 * Verified from OpenRouter API: curl -s "https://openrouter.ai/api/v1/models" | jq for image modality
 */
const VISION_MODELS = [
  'nvidia/nemotron-nano-12b-v2-vl:free',         // Fallback 2 - NVIDIA Nemotron VL
  'google/gemma-3-27b-it:free',                  // Primary - Google Gemma 3 27B (best quality)
  'mistralai/mistral-small-3.1-24b-instruct:free', // Fallback 1 - Mistral Small 3.1
  'qwen/qwen-2.5-vl-7b-instruct:free',           // Fallback 3 - Qwen 2.5 VL
  'google/gemma-3-12b-it:free',                  // Fallback 4 - Google Gemma 3 12B
  'allenai/molmo-2-8b:free',                     // Fallback 5 - AllenAI Molmo2
] as const;

/** 
 * Free text models for Stage 2 medicine parsing (no image support needed)
 * Verified from OpenRouter API - comprehensive fallback list
 */
const TEXT_MODELS = [
  'liquid/lfm-2.5-1.2b-instruct:free',           // Fallback 9 - LiquidAI (smallest, fastest)
  'nvidia/nemotron-nano-9b-v2:free',             // Fallback 3 - NVIDIA Nemotron
  'openai/gpt-oss-20b:free',                     // Fallback 5 - OpenAI OSS
  'deepseek/deepseek-r1-0528:free',              // Fallback 7 - DeepSeek R1
  'z-ai/glm-4.5-air:free',                       // Fallback 8 - GLM 4.5
  'moonshotai/kimi-k2:free',                     // Fallback 6 - Kimi K2
  'meta-llama/llama-3.3-70b-instruct:free',      // Primary - Llama 3.3 70B
  'meta-llama/llama-3.1-405b-instruct:free',     // Fallback 1 - Llama 3.1 405B (largest)
  'qwen/qwen3-4b:free',                          // Fallback 2 - Qwen3 4B (fast)
  'meta-llama/llama-3.2-3b-instruct:free',       // Fallback 4 - Llama 3.2 3B
] as const;

/** Track which models have failed recently to avoid repeated failures */
const modelFailures: Map<string, { failedAt: number; count: number }> = new Map();

/** Cooldown period for failed models (5 minutes) */
const MODEL_COOLDOWN_MS = 5 * 60 * 1000;

/** Rate limit tracking */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 2000; // 2 seconds between requests
let rateLimitCooldownUntil = 0;

/** OCR extraction prompt for prescription images */
const OCR_SYSTEM_PROMPT = `You are an OCR specialist. Your ONLY job is to read the EXACT text written on this medical prescription image.

CRITICAL RULES:
1. READ the actual handwritten or printed text - DO NOT guess or make up medicine names
2. Extract ONLY what you can actually see written on the prescription
3. If you cannot read a word clearly, write what you can see and mark confidence lower
4. DO NOT add common medicines that are not written on the prescription
5. Pay attention to handwritten text carefully

Return ONLY valid JSON in this exact format:
{
  "medicines": ["Medicine Name Dosage as written", "Medicine Name Dosage as written"],
  "isPrescription": true/false,
  "confidence": 0.0-1.0
}

Examples:
- If you see "Metformin 500mg" written, extract: "Metformin 500mg"
- If you see "Biogesic" written, extract: "Biogesic"  
- If prescription is blank, return: {"medicines": [], "isPrescription": false, "confidence": 0.0}

Extract what is ACTUALLY written, not what you think should be there.`;

/** Stage 2: Medicine parsing prompt - separates medicine names from dosages/instructions */
const MEDICINE_PARSING_PROMPT = `Parse this prescription text. Extract medicine names and dosages.

RULES:
- Separate medicine name from dosage
- Standardize: od→once daily, bd→twice daily, tds→three times daily, iv→intravenous
- Return ONLY the JSON below, NO explanations, NO markdown

{"medicines":[{"name":"DrugName","dosage":"strength frequency","instructions":"extra info or null"}]}

Examples:
"Metformin 500mg OD" → {"medicines":[{"name":"Metformin","dosage":"500mg once daily","instructions":null}]}
"Losartan 50mg, Amlodipine 5mg" → {"medicines":[{"name":"Losartan","dosage":"50mg","instructions":null},{"name":"Amlodipine","dosage":"5mg","instructions":null}]}

ONLY output JSON. No text before or after.`;

/** 
 * Verified medicine database - Common generics, brands, and Philippine medicines
 * Sources: FDA, BFAD (Philippines), WHO Essential Medicines List
 */
const VERIFIED_MEDICINES = [
  // === CARDIOVASCULAR ===
  'Amlodipine', 'Atenolol', 'Bisoprolol', 'Captopril', 'Carvedilol', 'Clonidine',
  'Diltiazem', 'Enalapril', 'Felodipine', 'Hydralazine', 'Irbesartan', 'Lisinopril',
  'Losartan', 'Metoprolol', 'Nifedipine', 'Propranolol', 'Ramipril', 'Telmisartan',
  'Valsartan', 'Verapamil', 'Norvasc', 'Cozaar', 'Zestril',
  // === DIABETES ===
  'Metformin', 'Glibenclamide', 'Gliclazide', 'Glimepiride', 'Glipizide', 'Pioglitazone',
  'Sitagliptin', 'Empagliflozin', 'Dapagliflozin', 'Insulin', 'Humulin', 'Humalog',
  'Lantus', 'Novolog', 'Levemir', 'Glucophage', 'Januvia', 'Jardiance',
  // === PAIN / ANTI-INFLAMMATORY ===
  'Paracetamol', 'Acetaminophen', 'Ibuprofen', 'Aspirin', 'Naproxen', 'Diclofenac',
  'Mefenamic Acid', 'Celecoxib', 'Meloxicam', 'Tramadol', 'Codeine', 'Morphine',
  'Tylenol', 'Advil', 'Ponstan', 'Dolfenal', 'Medicol', 'Biogesic', 'Alaxan',
  // === ANTIBIOTICS ===
  'Amoxicillin', 'Ampicillin', 'Azithromycin', 'Cephalexin', 'Cefuroxime', 'Ceftriaxone',
  'Ciprofloxacin', 'Clarithromycin', 'Clindamycin', 'Doxycycline', 'Erythromycin',
  'Levofloxacin', 'Metronidazole', 'Penicillin', 'Tetracycline', 'Trimethoprim',
  'Augmentin', 'Zithromax', 'Flagyl', 'Co-Amoxiclav',
  // === RESPIRATORY / COUGH & COLD ===
  'Salbutamol', 'Budesonide', 'Fluticasone', 'Montelukast', 'Theophylline',
  'Carbocisteine', 'Guaifenesin', 'Dextromethorphan', 'Phenylephrine', 'Pseudoephedrine',
  'Ventolin', 'Seretide', 'Singulair', 'Solmux', 'Robitussin', 'Mucinex',
  'Neozep', 'Bioflu', 'Tuseran', 'Decolgen', 'Sinutab', 'Lagundi',
  // === ANTIHISTAMINES / ALLERGY ===
  'Cetirizine', 'Loratadine', 'Fexofenadine', 'Diphenhydramine', 'Chlorpheniramine',
  'Desloratadine', 'Levocetirizine', 'Zyrtec', 'Claritin', 'Benadryl', 'Allerta',
  // === GI / STOMACH ===
  'Omeprazole', 'Pantoprazole', 'Esomeprazole', 'Ranitidine', 'Famotidine',
  'Loperamide', 'Metoclopramide', 'Domperidone', 'Antacid', 'Aluminum Hydroxide',
  'Magnesium Hydroxide', 'Losec', 'Nexium', 'Imodium', 'Kremil-S', 'Gaviscon',
  // === CHOLESTEROL ===
  'Atorvastatin', 'Simvastatin', 'Rosuvastatin', 'Pravastatin', 'Fenofibrate',
  'Ezetimibe', 'Lipitor', 'Crestor', 'Zocor',
  // === MENTAL HEALTH ===
  'Fluoxetine', 'Sertraline', 'Escitalopram', 'Paroxetine', 'Venlafaxine',
  'Duloxetine', 'Amitriptyline', 'Alprazolam', 'Diazepam', 'Clonazepam', 'Lorazepam',
  'Risperidone', 'Olanzapine', 'Quetiapine', 'Prozac', 'Zoloft', 'Lexapro', 'Xanax',
  // === BLOOD THINNERS ===
  'Warfarin', 'Clopidogrel', 'Aspirin', 'Rivaroxaban', 'Apixaban', 'Dabigatran',
  'Coumadin', 'Plavix', 'Xarelto', 'Eliquis',
  // === VITAMINS / SUPPLEMENTS ===
  'Vitamin A', 'Vitamin B', 'Vitamin B1', 'Vitamin B6', 'Vitamin B12', 'Vitamin C',
  'Vitamin D', 'Vitamin E', 'Vitamin K', 'Folic Acid', 'Folate', 'Calcium',
  'Iron', 'Ferrous Sulfate', 'Ferrous Fumarate', 'Zinc', 'Magnesium',
  'Multivitamins', 'Centrum', 'Enervon', 'Berocca', 'Sangobion',
  // === THYROID ===
  'Levothyroxine', 'Propylthiouracil', 'Methimazole', 'Synthroid', 'Euthyrox',
  // === DIURETICS ===
  'Furosemide', 'Hydrochlorothiazide', 'Spironolactone', 'Indapamide', 'Lasix',
  // === STEROIDS ===
  'Prednisone', 'Prednisolone', 'Dexamethasone', 'Hydrocortisone', 'Betamethasone',
  // === OTHER COMMON ===
  'Gabapentin', 'Pregabalin', 'Carbamazepine', 'Phenytoin', 'Valproic Acid',
  'Allopurinol', 'Colchicine', 'Baclofen', 'Cyclobenzaprine', 'Sildenafil',
  'Tadalafil', 'Tamsulosin', 'Finasteride', 'Lyrica', 'Neurontin', 'Viagra', 'Cialis',
  // === PHILIPPINE BRANDS ===
  'Ascof', 'Kremil', 'Diatabs', 'Buscopan', 'Disudrin', 'Tempra', 'Calpol',
  'Flanax', 'Skelan', 'Myonal', 'Arcoxia', 'Celebrex', 'Bonamine', 'Plasil',
];

/** Common dosage patterns - matches dosage anywhere in text */
const DOSAGE_PATTERN = /(\d+(?:\.\d+)?)\s*(mg|ml|mcg|g|iu|units?|tablets?|caps?|capsules?|x|dly|daily|bid|tid|qid|prn)/gi;

/** Pattern to strip dosage and extra info to get just the medicine name */
const STRIP_DOSAGE_PATTERN = /\s*\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|iu|units?|tablets?|caps?|capsules?|x|dly|daily|bid|tid|qid|prn)[\s\d]*/gi;

/** Additional patterns to clean up medicine names */
const CLEAN_NAME_PATTERNS = [
  /\s*\d+\s*$/,           // Trailing numbers
  /\s*x\s*\d+.*$/i,       // "x 5 dly" patterns
  /\s*\d+\s*x\s*\d+.*$/i, // "2 x 5" patterns
  /\s*(?:od|bd|tds|qds|prn|hs|ac|pc|stat).*$/i, // Medical abbreviations at end
  /\s*(?:it|iv|im|sc|po|sl|pr)\.?.*$/i, // Route abbreviations
  /\s*daily.*$/i,
  /\s*tablet.*$/i,
  /\s*capsule.*$/i,
];

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  // Create and initialize matrix
  const matrix: number[][] = Array.from({ length: bLen + 1 }, (_, i) => {
    const row = new Array<number>(aLen + 1).fill(0);
    row[0] = i;
    return row;
  });
  
  // Fill first row
  for (let j = 0; j <= aLen; j++) {
    matrix[0]![j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i]![j] = Math.min(
        (matrix[i - 1]?.[j] ?? 0) + 1,     // deletion
        (matrix[i]?.[j - 1] ?? 0) + 1,     // insertion
        (matrix[i - 1]?.[j - 1] ?? 0) + cost // substitution
      );
    }
  }

  return matrix[bLen]?.[aLen] ?? Math.max(aLen, bLen);
}

/**
 * Find the best matching medicine name using fuzzy matching
 */
function findBestMatch(text: string): { name: string; score: number } | null {
  const normalizedText = text.toLowerCase().trim();
  
  if (normalizedText.length < 3) {
    return null;
  }

  let bestMatch: { name: string; score: number } | null = null;

  for (const medicine of VERIFIED_MEDICINES) {
    const normalizedMedicine = medicine.toLowerCase();
    
    // Exact match
    if (normalizedText.includes(normalizedMedicine) || normalizedMedicine.includes(normalizedText)) {
      const score = 1 - (Math.abs(normalizedText.length - normalizedMedicine.length) / Math.max(normalizedText.length, normalizedMedicine.length));
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { name: medicine, score: Math.min(score + 0.3, 1) };
      }
      continue;
    }

    // Fuzzy match using Levenshtein distance
    const distance = levenshteinDistance(normalizedText, normalizedMedicine);
    const maxLength = Math.max(normalizedText.length, normalizedMedicine.length);
    const similarity = 1 - distance / maxLength;

    if (similarity > 0.6 && (!bestMatch || similarity > bestMatch.score)) {
      bestMatch = { name: medicine, score: similarity };
    }
  }

  return bestMatch;
}

/**
 * Extract dosage from text
 */
function extractDosage(text: string): string | null {
  // Reset regex lastIndex
  DOSAGE_PATTERN.lastIndex = 0;
  const matches = text.match(DOSAGE_PATTERN);
  if (matches && matches.length > 0) {
    // Join multiple dosages if found (e.g., "30 units")
    return matches.join(' ').toLowerCase();
  }
  return null;
}

/**
 * Strip dosage from text to get just the medicine name
 */
function stripDosageFromText(text: string): string {
  let cleaned = text.replace(STRIP_DOSAGE_PATTERN, ' ');
  
  // Apply additional cleanup patterns
  for (const pattern of CLEAN_NAME_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  return cleaned.trim().replace(/\s+/g, ' ');
}

/**
 * Parse medicine entries from raw OCR text
 */
function parseMedicinesFromText(rawText: string, baseConfidence: number): ExtractedMedicine[] {
  const medicines: ExtractedMedicine[] = [];
  
  // Split by common delimiters (newlines, commas, semicolons)
  const lines = rawText.split(/[\n,;]+/).map(line => line.trim()).filter(Boolean);
  
  for (const line of lines) {
    // Skip very short lines or common non-medicine text
    if (line.length < 3) continue;
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('doctor') || lowerLine.includes('patient') || 
        lowerLine.includes('date') || lowerLine.includes('signature') ||
        lowerLine.includes('clinic') || lowerLine.includes('address')) {
      continue;
    }

    // Extract dosage first, then strip it to get clean medicine name for matching
    const dosage = extractDosage(line);
    const cleanName = stripDosageFromText(line);
    
    // Try to find a matching medicine using the clean name (without dosage)
    const match = findBestMatch(cleanName);
    
    // Calculate confidence based on OCR confidence and match quality
    const matchScore = match?.score ?? 0.5;
    const adjustedConfidence = baseConfidence * matchScore;

    const medicine: ExtractedMedicine = {
      id: generateExtractedMedicineId(),
      rawText: line,
      normalizedName: match?.name ?? null,
      confidence: adjustedConfidence,
      confidenceLevel: getConfidenceLevel(adjustedConfidence),
      dosage,
      isSelected: adjustedConfidence >= 0.7, // Auto-select high confidence items
      isEdited: false,
    };

    medicines.push(medicine);
  }

  // If no medicines were extracted but we have text, create a single entry
  if (medicines.length === 0 && rawText.trim().length > 0) {
    const match = findBestMatch(rawText);
    const dosage = extractDosage(rawText);
    
    medicines.push({
      id: generateExtractedMedicineId(),
      rawText: rawText.trim().substring(0, 100),
      normalizedName: match?.name ?? null,
      confidence: baseConfidence * (match?.score ?? 0.5),
      confidenceLevel: getConfidenceLevel(baseConfidence * (match?.score ?? 0.5)),
      dosage,
      isSelected: false,
      isEdited: false,
    });
  }

  return medicines;
}

/**
 * Get available models (excluding those in cooldown)
 */
function getAvailableModels(): string[] {
  const now = Date.now();
  return VISION_MODELS.filter(model => {
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

/**
 * Mark a model as failed
 */
function markModelFailed(model: string): void {
  const existing = modelFailures.get(model);
  modelFailures.set(model, {
    failedAt: Date.now(),
    count: (existing?.count ?? 0) + 1,
  });
  console.warn(`Model ${model} marked as failed (${modelFailures.get(model)?.count} failures)`);
}

/**
 * Call OpenRouter API with vision model for OCR
 * Automatically rotates to fallback models on failure
 */
async function callOpenRouterAPI(imageDataUrl: string, retries = 2): Promise<OCRServiceResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured. Set VITE_OPENROUTER_API_KEY in .env');
  }

  // Check rate limit cooldown
  const now = Date.now();
  if (rateLimitCooldownUntil > now) {
    const waitSeconds = Math.ceil((rateLimitCooldownUntil - now) / 1000);
    throw new Error(`Rate limited. Please wait ${waitSeconds} seconds before trying again.`);
  }

  // Enforce minimum request interval
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const availableModels = getAvailableModels();
  if (availableModels.length === 0) {
    throw new Error('All vision models are temporarily unavailable. Please try again in a few minutes.');
  }

  let lastError: Error | null = null;

  // Try each available model
  for (const model of availableModels) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Trying model: ${model} (attempt ${attempt + 1})`);
        
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Curio Prescription Scanner',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: OCR_SYSTEM_PROMPT,
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageDataUrl,
                    },
                  },
                ],
              },
            ],
            temperature: 0.1, // Low temperature for consistent extraction
            max_tokens: 1024,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenRouter API Error:', {
            model,
            status: response.status,
            statusText: response.statusText,
            body: errorText.substring(0, 500),
          });

          // Handle 404 - model not found/unavailable, try next model immediately
          if (response.status === 404) {
            console.warn(`Model ${model} not found (404), trying next model...`);
            markModelFailed(model);
            break; // Exit retry loop, try next model
          }

          // Handle rate limiting
          if (response.status === 429) {
            console.warn(`Rate limited on ${model}`);
            // Set cooldown for 30 seconds on rate limit
            rateLimitCooldownUntil = Date.now() + 30000;
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
              continue;
            }
            markModelFailed(model);
            break; // Try next model
          }

          // Retry on server errors (5xx)
          if (response.status >= 500 && attempt < retries) {
            console.warn(`Server error on ${model} (attempt ${attempt + 1}), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }

          // Other errors - don't retry, try next model
          lastError = new Error(`API error: ${response.status} - ${errorText.substring(0, 200)}`);
          markModelFailed(model);
          break;
        }

        // Success! Parse the response
        const data = await response.json();
        console.log('OpenRouter response:', { model, data });

        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          lastError = new Error('No content in OpenRouter response');
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          break;
        }

        // Parse JSON from LLM response (handle markdown code blocks)
        let jsonStr = content.trim();

        // Remove markdown code blocks if present
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.slice(7);
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith('```')) {
          jsonStr = jsonStr.slice(0, -3);
        }
        jsonStr = jsonStr.trim();

        try {
          const parsed = JSON.parse(jsonStr);

          // Convert LLM response to OCRServiceResponse format
          const medicines = Array.isArray(parsed.medicines) ? parsed.medicines : [];
          const extractedText = medicines.join('\n');

          console.log(`OCR successful with model: ${model}`);
          return {
            extractedText,
            predictedLabel: parsed.isPrescription ? 'medical prescription' : 'not medical prescription',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
          };
        } catch (parseError) {
          console.error('Failed to parse LLM response:', parseError, 'Raw:', jsonStr);
          lastError = new Error('Failed to parse prescription data from AI response');
          if (attempt < retries) {
            continue;
          }
          // Try next model
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries) {
          console.warn(`Attempt ${attempt + 1} failed for ${model}, retrying...`, error);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        // All retries exhausted for this model, try next
        console.warn(`All retries exhausted for ${model}`);
        break;
      }
    }
  }

  // All models failed
  throw lastError ?? new Error('All vision models failed. Please try again later.');
}

/** Type for Stage 2 parsed medicine */
interface ParsedMedicine {
  name: string;
  dosage: string | null;
  instructions: string | null;
}

/**
 * Stage 2: Call text model to parse and separate medicine names from dosages
 * This provides much more accurate extraction than regex-based parsing
 */
async function parseMedicinesWithAI(rawText: string, retries = 1): Promise<ParsedMedicine[]> {
  // Skip if no text to parse
  if (!rawText || rawText.trim().length < 3) {
    console.warn('Stage 2: No text to parse');
    return [];
  }

  // Enforce minimum request interval
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  // Get available text models (use same failure tracking)
  const availableModels = TEXT_MODELS.filter(model => {
    const failure = modelFailures.get(model);
    if (!failure) return true;
    if (Date.now() - failure.failedAt > MODEL_COOLDOWN_MS) {
      modelFailures.delete(model);
      return true;
    }
    return false;
  });

  if (availableModels.length === 0) {
    console.warn('Stage 2: No text models available, falling back to regex parsing');
    return [];
  }

  let lastError: Error | null = null;

  for (const model of availableModels) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Stage 2: Trying text model ${model} (attempt ${attempt + 1})`);

        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Curio Medicine Parser',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: MEDICINE_PARSING_PROMPT,
              },
              {
                role: 'user',
                content: `Parse this prescription text and extract medicines with their dosages:\n\n${rawText}`,
              },
            ],
            temperature: 0.1,
            max_tokens: 512,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Stage 2 API Error:', { model, status: response.status, body: errorText.substring(0, 300) });

          if (response.status === 404) {
            markModelFailed(model);
            break;
          }
          if (response.status === 429) {
            rateLimitCooldownUntil = Date.now() + 30000;
            markModelFailed(model);
            break;
          }
          if (response.status >= 500 && attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }

          lastError = new Error(`Stage 2 API error: ${response.status}`);
          markModelFailed(model);
          break;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          lastError = new Error('Stage 2: No content in response');
          if (attempt < retries) continue;
          break;
        }

        // Parse JSON response - handle various formats
        let jsonStr = content.trim();
        
        // Try to extract JSON from markdown code blocks
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        } else {
          // Try to find JSON object in the response (handles prose + JSON)
          const jsonMatch = jsonStr.match(/\{[\s\S]*"medicines"[\s\S]*\}/); 
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const medicines: ParsedMedicine[] = Array.isArray(parsed.medicines)
            ? parsed.medicines.map((m: { name?: string; dosage?: string; instructions?: string }) => ({
                name: typeof m.name === 'string' ? m.name.trim() : '',
                dosage: typeof m.dosage === 'string' ? m.dosage.trim() : null,
                instructions: typeof m.instructions === 'string' ? m.instructions.trim() : null,
              })).filter((m: ParsedMedicine) => m.name.length > 0)
            : [];

          console.log(`Stage 2 successful with ${model}:`, medicines);
          return medicines;
        } catch (parseError) {
          console.error('Stage 2: Failed to parse response:', parseError, 'Raw:', jsonStr);
          lastError = new Error('Stage 2: Failed to parse AI response');
          if (attempt < retries) continue;
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }

  console.warn('Stage 2: All text models failed, falling back to regex parsing', lastError);
  return [];
}

/**
 * Process an image through the OCR service (2-stage pipeline)
 * Stage 1: Vision model extracts raw text from image
 * Stage 2: Text model parses and separates medicine names from dosages
 * Supports demo mode with pre-scripted results.
 */
async function processImage(imageDataUrl: string): Promise<OCRResult> {
  const startTime = Date.now();

  // Check if demo mode is active
  if (isDemoModeActive()) {
    console.log('[OCR] Demo mode active, using pre-scripted results');
    const demoResult = await demoExtractPrescription(imageDataUrl);
    const processingTimeMs = Date.now() - startTime;
    
    return {
      rawText: demoResult.rawText,
      isMedicalPrescription: demoResult.isPrescription,
      medicines: demoResult.medicines.map((m) => ({
        id: generateExtractedMedicineId(),
        rawText: `${m.name}${m.dosage ? ' ' + m.dosage : ''}`,
        normalizedName: m.name,
        confidence: m.confidence,
        confidenceLevel: getConfidenceLevel(m.confidence),
        dosage: m.dosage,
        isSelected: m.confidence >= 0.7,
        isEdited: false,
      })),
      processingTimeMs,
      extractedAt: new Date(),
    };
  }

  try {
    // Stage 1: Extract raw text from image using vision model
    console.log('Stage 1: Extracting text from image...');
    const serviceResponse = await callOpenRouterAPI(imageDataUrl);
    console.log('Stage 1 complete, raw text:', serviceResponse.extractedText);

    // Stage 2: Parse medicines using text model for accurate separation
    console.log('Stage 2: Parsing medicines with AI...');
    const aiParsedMedicines = await parseMedicinesWithAI(serviceResponse.extractedText);
    
    const processingTimeMs = Date.now() - startTime;
    let medicines: ExtractedMedicine[];

    if (aiParsedMedicines.length > 0) {
      // Use AI-parsed medicines (more accurate)
      console.log('Using AI-parsed medicines:', aiParsedMedicines);
      medicines = aiParsedMedicines.map(parsed => {
        // Find best match in our verified database
        const match = findBestMatch(parsed.name);
        const confidence = serviceResponse.confidence * (match?.score ?? 0.7);
        
        // Combine dosage and instructions for display
        const dosageDisplay = [parsed.dosage, parsed.instructions]
          .filter(Boolean)
          .join(' - ');

        return {
          id: generateExtractedMedicineId(),
          rawText: `${parsed.name}${parsed.dosage ? ' ' + parsed.dosage : ''}`,
          normalizedName: match?.name ?? parsed.name,
          confidence,
          confidenceLevel: getConfidenceLevel(confidence),
          dosage: dosageDisplay || null,
          isSelected: confidence >= 0.7,
          isEdited: false,
        };
      });
    } else {
      // Fallback to regex-based parsing (Stage 2 failed or no text models available)
      console.log('Falling back to regex parsing');
      medicines = parseMedicinesFromText(
        serviceResponse.extractedText,
        serviceResponse.confidence
      );
    }

    return {
      rawText: serviceResponse.extractedText,
      isMedicalPrescription: serviceResponse.predictedLabel === 'medical prescription',
      medicines,
      processingTimeMs,
      extractedAt: new Date(),
    };
  } catch (error) {
    // Log the actual error for debugging
    console.error('OCR processing error:', error);
    
    // For demo/MVP: return mock data if ML service is unavailable
    if (import.meta.env.DEV) {
      console.warn('ML service unavailable, using mock data for development');
      return createMockResult(Date.now() - startTime);
    }
    throw error;
  }
}

/**
 * Create mock result for development when ML service is unavailable
 */
function createMockResult(processingTimeMs: number): OCRResult {
  return {
    rawText: 'Metformin 500mg\nLosartan 50mg\nAmlodipine 5mg',
    isMedicalPrescription: true,
    medicines: [
      {
        id: generateExtractedMedicineId(),
        rawText: 'Metformin 500mg',
        normalizedName: 'Metformin',
        confidence: 0.95,
        confidenceLevel: 'high',
        dosage: '500mg',
        isSelected: true,
        isEdited: false,
      },
      {
        id: generateExtractedMedicineId(),
        rawText: 'Losartan 50mg',
        normalizedName: 'Losartan',
        confidence: 0.88,
        confidenceLevel: 'medium',
        dosage: '50mg',
        isSelected: true,
        isEdited: false,
      },
      {
        id: generateExtractedMedicineId(),
        rawText: 'Amlodipine 5mg',
        normalizedName: 'Amlodipine',
        confidence: 0.72,
        confidenceLevel: 'medium',
        dosage: '5mg',
        isSelected: true,
        isEdited: false,
      },
    ],
    processingTimeMs: processingTimeMs + 1500, // Simulate processing time
    extractedAt: new Date(),
  };
}

interface UseOCRExtractionReturn {
  /** Mutation function to extract text from image */
  extract: (imageDataUrl: string, callbacks?: { onSuccess?: () => void; onError?: () => void }) => void;
  /** Current extraction result */
  data: OCRResult | undefined;
  /** Whether extraction is in progress */
  isLoading: boolean;
  /** Error if extraction failed */
  error: Error | null;
  /** Reset the mutation state */
  reset: () => void;
  /** Update a medicine in the results */
  updateMedicine: (id: string, updates: Partial<ExtractedMedicine>) => void;
  /** Toggle medicine selection */
  toggleMedicineSelection: (id: string) => void;
  /** Add a manual medicine entry */
  addManualMedicine: (name: string, dosage?: string) => void;
  /** Remove a medicine from results */
  removeMedicine: (id: string) => void;
  /** Get selected medicines */
  selectedMedicines: ExtractedMedicine[];
  /** Rate limit status */
  rateLimitStatus: { isLimited: boolean; secondsRemaining: number };
  /** Check if rate limited before extraction */
  checkRateLimit: () => { canProceed: boolean; waitSeconds: number };
}

/**
 * Get current rate limit status
 */
function getRateLimitStatus(): { isLimited: boolean; secondsRemaining: number } {
  const now = Date.now();
  if (rateLimitCooldownUntil > now) {
    return {
      isLimited: true,
      secondsRemaining: Math.ceil((rateLimitCooldownUntil - now) / 1000),
    };
  }
  return { isLimited: false, secondsRemaining: 0 };
}

export function useOCRExtraction(): UseOCRExtractionReturn {
  // Local state for medicines (allows modification without mutation issues)
  const [medicines, setMedicines] = useState<ExtractedMedicine[]>([]);
  const [baseResult, setBaseResult] = useState<Omit<OCRResult, 'medicines'> | null>(null);
  
  const mutation = useMutation({
    mutationFn: processImage,
    mutationKey: ['ocr-extraction'],
    onSuccess: (result) => {
      setMedicines(result.medicines);
      setBaseResult({
        rawText: result.rawText,
        isMedicalPrescription: result.isMedicalPrescription,
        processingTimeMs: result.processingTimeMs,
        extractedAt: result.extractedAt,
      });
    },
  });

  /** Combined data with editable medicines */
  const data: OCRResult | undefined = baseResult
    ? { ...baseResult, medicines }
    : undefined;

  /** Update a medicine in the results */
  const updateMedicine = (id: string, updates: Partial<ExtractedMedicine>) => {
    setMedicines(prev =>
      prev.map(med => (med.id === id ? { ...med, ...updates, isEdited: true } : med))
    );
  };

  /** Toggle medicine selection */
  const toggleMedicineSelection = (id: string) => {
    setMedicines(prev =>
      prev.map(med => (med.id === id ? { ...med, isSelected: !med.isSelected } : med))
    );
  };

  /** Add a manual medicine entry */
  const addManualMedicine = (name: string, dosage?: string) => {
    const newMedicine: ExtractedMedicine = {
      id: generateExtractedMedicineId(),
      rawText: dosage ? `${name} ${dosage}` : name,
      normalizedName: name,
      confidence: 1.0,
      confidenceLevel: 'high',
      dosage: dosage ?? null,
      isSelected: true,
      isEdited: true,
    };
    setMedicines(prev => [...prev, newMedicine]);
  };

  /** Remove a medicine from results */
  const removeMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  /** Reset everything */
  const reset = () => {
    mutation.reset();
    setMedicines([]);
    setBaseResult(null);
  };

  /** Extract with callbacks */
  const extract = (
    imageDataUrl: string,
    callbacks?: { onSuccess?: () => void; onError?: () => void }
  ) => {
    // Check rate limit before attempting
    const rateCheck = getRateLimitStatus();
    if (rateCheck.isLimited) {
      const rateLimitError = new Error(
        `Rate limited. Please wait ${rateCheck.secondsRemaining} seconds before scanning again.`
      );
      callbacks?.onError?.();
      throw rateLimitError;
    }

    mutation.mutate(imageDataUrl, {
      onSuccess: () => callbacks?.onSuccess?.(),
      onError: () => callbacks?.onError?.(),
    });
  };

  /** Check rate limit before extraction */
  const checkRateLimit = (): { canProceed: boolean; waitSeconds: number } => {
    const status = getRateLimitStatus();
    return {
      canProceed: !status.isLimited,
      waitSeconds: status.secondsRemaining,
    };
  };

  /** Get selected medicines */
  const selectedMedicines = medicines.filter(m => m.isSelected);

  return {
    extract,
    data,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset,
    updateMedicine,
    toggleMedicineSelection,
    addManualMedicine,
    removeMedicine,
    selectedMedicines,
    rateLimitStatus: getRateLimitStatus(),
    checkRateLimit,
  };
}

export type { UseOCRExtractionReturn };
