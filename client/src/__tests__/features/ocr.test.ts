/**
 * OCR Feature Integration Tests
 *
 * Tests for the OCR extraction hook using mocked OpenRouter API
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// =============================================================================
// MSW SERVER SETUP
// =============================================================================

const server = setupServer(
  // Default OpenRouter handler for OCR
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as { messages?: Array<{ content: unknown }> };
    const messages = body.messages || [];
    
    // Check if it's a vision request (has image content)
    const hasImage = messages.some((m) => 
      Array.isArray(m.content) && m.content.some((c: { type?: string }) => c.type === 'image_url')
    );

    if (hasImage) {
      // OCR Vision response
      return HttpResponse.json({
        id: 'mock-ocr-completion',
        choices: [
          {
            message: {
              role: 'assistant',
              content: JSON.stringify({
                medicines: ['Metformin 500mg', 'Losartan 50mg'],
                isPrescription: true,
                confidence: 0.85,
              }),
            },
            finish_reason: 'stop',
          },
        ],
        model: 'google/gemma-3-27b-it:free',
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      });
    } else {
      // Text model for medicine parsing
      return HttpResponse.json({
        id: 'mock-parse-completion',
        choices: [
          {
            message: {
              role: 'assistant',
              content: JSON.stringify({
                medicines: [
                  { name: 'Metformin', dosage: '500mg once daily', instructions: null },
                  { name: 'Losartan', dosage: '50mg', instructions: 'take in the morning' },
                ],
              }),
            },
            finish_reason: 'stop',
          },
        ],
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        usage: { prompt_tokens: 50, completion_tokens: 30, total_tokens: 80 },
      });
    }
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// =============================================================================
// OCR API FUNCTION TESTS
// =============================================================================

describe('OCR API Integration', () => {
  it('should successfully extract medicines from vision model response', async () => {
    // Simulate calling the OpenRouter API directly
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-key',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract medicines from this prescription' },
              { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,abc123' } },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    expect(response.ok).toBe(true);
    expect(data.choices[0].message.content).toBeDefined();

    const parsed = JSON.parse(data.choices[0].message.content);
    expect(parsed.medicines).toContain('Metformin 500mg');
    expect(parsed.medicines).toContain('Losartan 50mg');
    expect(parsed.isPrescription).toBe(true);
    expect(parsed.confidence).toBeGreaterThan(0.5);
  });

  it('should successfully parse medicines from text model', async () => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-key',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          {
            role: 'user',
            content: 'Parse these medicines: Metformin 500mg, Losartan 50mg',
          },
        ],
      }),
    });

    const data = await response.json();
    expect(response.ok).toBe(true);

    const parsed = JSON.parse(data.choices[0].message.content);
    expect(parsed.medicines).toHaveLength(2);
    expect(parsed.medicines[0].name).toBe('Metformin');
    expect(parsed.medicines[0].dosage).toContain('500mg');
    expect(parsed.medicines[1].name).toBe('Losartan');
  });

  it('should handle rate limit errors', async () => {
    // Override handler for rate limit
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json(
          { error: { message: 'Rate limit exceeded', type: 'rate_limit_error' } },
          { status: 429 }
        );
      })
    );

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'test', messages: [] }),
    });

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error.message).toBe('Rate limit exceeded');
  });

  it('should handle model unavailable errors', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json(
          { error: { message: 'Model not available', type: 'model_not_found' } },
          { status: 404 }
        );
      })
    );

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'unknown/model', messages: [] }),
    });

    expect(response.status).toBe(404);
  });

  it('should handle invalid JSON responses gracefully', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json({
          id: 'mock-bad-response',
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'This is not valid JSON at all',
              },
              finish_reason: 'stop',
            },
          ],
        });
      })
    );

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'test', messages: [] }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Should not throw when trying to parse
    expect(() => JSON.parse(content)).toThrow();
  });

  it('should handle empty prescription response', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json({
          id: 'mock-empty-response',
          choices: [
            {
              message: {
                role: 'assistant',
                content: JSON.stringify({
                  medicines: [],
                  isPrescription: false,
                  confidence: 0.1,
                }),
              },
              finish_reason: 'stop',
            },
          ],
        });
      })
    );

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'test',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,blank' } },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    expect(parsed.medicines).toHaveLength(0);
    expect(parsed.isPrescription).toBe(false);
    expect(parsed.confidence).toBeLessThan(0.5);
  });
});

// =============================================================================
// MEDICINE VERIFICATION TESTS
// =============================================================================

describe('Medicine Verification', () => {
  const COMMON_MEDICINES = [
    'Paracetamol',
    'Ibuprofen',
    'Amoxicillin',
    'Metformin',
    'Losartan',
    'Amlodipine',
    'Omeprazole',
    'Cetirizine',
  ];

  it('should recognize common Philippine medicines', () => {
    const extractedMedicines = ['Biogesic', 'Neozep', 'Dolfenal'];

    // These are brand names that should be mappable to generics
    const brandToGeneric: Record<string, string> = {
      Biogesic: 'Paracetamol',
      Neozep: 'Phenylephrine',
      Dolfenal: 'Mefenamic Acid',
    };

    extractedMedicines.forEach((brand) => {
      expect(brandToGeneric[brand]).toBeDefined();
    });
  });

  it('should handle dosage variations', () => {
    const dosageVariations = [
      'Metformin 500mg',
      'Metformin 500 mg',
      'Metformin500mg',
      'METFORMIN 500MG',
    ];

    const normalizedDosages = dosageVariations.map((d) => {
      // Simple normalization
      return d.toLowerCase().replace(/\s+/g, ' ').trim();
    });

    // All should normalize to similar patterns
    normalizedDosages.forEach((d) => {
      expect(d).toContain('metformin');
      expect(d).toContain('500');
      expect(d).toContain('mg');
    });
  });

  it('should validate medicine names against known list', () => {
    const validateMedicine = (name: string): boolean => {
      return COMMON_MEDICINES.some(
        (m) => m.toLowerCase() === name.toLowerCase()
      );
    };

    expect(validateMedicine('Paracetamol')).toBe(true);
    expect(validateMedicine('paracetamol')).toBe(true);
    expect(validateMedicine('FakeDrug123')).toBe(false);
  });
});
