/**
 * MSW API Mocks
 *
 * Mock Service Worker handlers for API endpoints.
 * These intercept network requests in tests for realistic integration testing.
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// =============================================================================
// OPENROUTER API MOCKS
// =============================================================================

/**
 * Mock OpenRouter vision model response (OCR)
 */
export function createOCRResponse(medicines: string[] = ['Paracetamol 500mg', 'Amoxicillin 500mg']) {
  return {
    id: 'mock-completion-id',
    choices: [
      {
        message: {
          role: 'assistant',
          content: JSON.stringify({
            medicines,
            isPrescription: true,
            confidence: 0.85,
          }),
        },
        finish_reason: 'stop',
      },
    ],
    model: 'google/gemma-3-27b-it:free',
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
  };
}

/**
 * Mock OpenRouter text model response (medicine parsing)
 */
export function createMedicineParsingResponse(
  medicines: Array<{ name: string; dosage: string; instructions: string | null }>
) {
  return {
    id: 'mock-completion-id',
    choices: [
      {
        message: {
          role: 'assistant',
          content: JSON.stringify({ medicines }),
        },
        finish_reason: 'stop',
      },
    ],
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    usage: { prompt_tokens: 50, completion_tokens: 30, total_tokens: 80 },
  };
}

/**
 * Mock Gemini API response (MediBot chat)
 */
export function createGeminiChatResponse(text: string) {
  return {
    candidates: [
      {
        content: {
          parts: [{ text }],
          role: 'model',
        },
        finishReason: 'STOP',
      },
    ],
  };
}

/**
 * Mock OpenRouter chat response (MediBot fallback)
 */
export function createChatResponse(content: string) {
  return {
    id: 'mock-chat-id',
    choices: [
      {
        message: {
          role: 'assistant',
          content,
        },
        finish_reason: 'stop',
      },
    ],
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
  };
}

// =============================================================================
// SUPABASE MOCK RESPONSES
// =============================================================================

/**
 * Mock Supabase pharmacy search response
 */
export function createPharmacySearchResponse(pharmacies = []) {
  return pharmacies.length > 0 ? pharmacies : [
    {
      id: 'pharmacy-1',
      name: 'Mercury Drug - SM Malolos',
      slug: 'mercury-drug-sm-malolos',
      address: '2F SM City Malolos, Malolos, Bulacan',
      city: 'Malolos',
      phone: '+63 44 123 4567',
      type: 'Chain',
      chain_name: 'Mercury Drug',
      is_24_hours: true,
      is_verified: true,
      lat: 14.8527,
      lng: 120.8157,
      distance: 250,
    },
    {
      id: 'pharmacy-2',
      name: 'Generics Pharmacy',
      slug: 'generics-pharmacy-malolos',
      address: '123 Main St, Malolos, Bulacan',
      city: 'Malolos',
      phone: '+63 44 987 6543',
      type: 'Generics',
      chain_name: 'Generics Pharmacy',
      is_24_hours: false,
      is_verified: true,
      lat: 14.8550,
      lng: 120.8200,
      distance: 450,
    },
  ];
}

/**
 * Mock Supabase medicine search response
 */
export function createMedicineSearchResponse(medicines = []) {
  return medicines.length > 0 ? medicines : [
    {
      id: 'medicine-1',
      brand_name: 'Biogesic',
      generic_name: 'Paracetamol',
      dosage: '500mg',
      form: 'Tablet',
      category: 'Pain Relief',
      tags: ['fever', 'pain', 'headache'],
      requires_prescription: false,
    },
    {
      id: 'medicine-2',
      brand_name: 'Neozep',
      generic_name: 'Phenylephrine',
      dosage: null,
      form: 'Tablet',
      category: 'Respiratory',
      tags: ['cold', 'flu', 'cough'],
      requires_prescription: false,
    },
  ];
}

// =============================================================================
// MSW HANDLERS
// =============================================================================

export const handlers = [
  // OpenRouter API
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as { messages?: Array<{ content: unknown }> };
    const messages = body.messages || [];
    
    // Check if it's a vision request (has image content)
    const hasImage = messages.some((m) => 
      Array.isArray(m.content) && m.content.some((c: { type?: string }) => c.type === 'image_url')
    );

    if (hasImage) {
      // OCR request
      return HttpResponse.json(createOCRResponse());
    } else {
      // Chat or parsing request
      return HttpResponse.json(createChatResponse(
        "Paracetamol (Biogesic) is a common pain reliever and fever reducer. " +
        "It's generally safe when taken as directed. The usual adult dose is 500mg-1000mg " +
        "every 4-6 hours, not exceeding 4g per day. Always consult a healthcare professional " +
        "for proper medical advice."
      ));
    }
  }),

  // Gemini API
  http.post('https://generativelanguage.googleapis.com/v1beta/models/*', () => {
    return HttpResponse.json(createGeminiChatResponse(
      "Hello! I'm MediBot, your friendly health assistant. I can help you find " +
      "information about medicines, pharmacies, and general health topics. " +
      "How can I assist you today?"
    ));
  }),

  // Supabase RPC endpoints (pharmacy search)
  http.post('*/rest/v1/rpc/search_nearby_pharmacies', () => {
    return HttpResponse.json(createPharmacySearchResponse());
  }),

  // Supabase RPC endpoints (medicine search)
  http.post('*/rest/v1/rpc/search_medicines', () => {
    return HttpResponse.json(createMedicineSearchResponse());
  }),

  // Supabase tables
  http.get('*/rest/v1/pharmacies*', () => {
    return HttpResponse.json(createPharmacySearchResponse());
  }),

  http.get('*/rest/v1/medicines*', () => {
    return HttpResponse.json(createMedicineSearchResponse());
  }),

  // Supabase inventory reports
  http.post('*/rest/v1/inventory_reports', () => {
    return HttpResponse.json({ id: 'report-123', success: true }, { status: 201 });
  }),

  http.get('*/rest/v1/inventory_reports*', () => {
    return HttpResponse.json([
      {
        id: 'report-1',
        pharmacy_id: 'pharmacy-1',
        medicine_id: 'medicine-1',
        status: 'in_stock',
        price: 5.5,
        created_at: new Date().toISOString(),
      },
    ]);
  }),
];

// =============================================================================
// MSW SERVER SETUP
// =============================================================================

export const server = setupServer(...handlers);

/**
 * Add a custom handler for a specific test
 */
export function mockOpenRouterError(statusCode = 429, message = 'Rate limit exceeded') {
  server.use(
    http.post('https://openrouter.ai/api/v1/chat/completions', () => {
      return HttpResponse.json(
        { error: { message, type: 'rate_limit_error' } },
        { status: statusCode }
      );
    })
  );
}

/**
 * Mock a successful OCR extraction with custom medicines
 */
export function mockOCRSuccess(medicines: string[]) {
  server.use(
    http.post('https://openrouter.ai/api/v1/chat/completions', () => {
      return HttpResponse.json(createOCRResponse(medicines));
    })
  );
}

/**
 * Mock Supabase error response
 */
export function mockSupabaseError(statusCode = 500, message = 'Internal Server Error') {
  server.use(
    http.post('*/rest/v1/*', () => {
      return HttpResponse.json(
        { error: message, message, code: 'INTERNAL_ERROR' },
        { status: statusCode }
      );
    }),
    http.get('*/rest/v1/*', () => {
      return HttpResponse.json(
        { error: message, message, code: 'INTERNAL_ERROR' },
        { status: statusCode }
      );
    })
  );
}
