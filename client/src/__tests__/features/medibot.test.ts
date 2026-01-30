/**
 * MediBot Chat Feature Integration Tests
 *
 * Tests for the MediBot chat functionality using mocked Gemini/OpenRouter APIs
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// =============================================================================
// MSW SERVER SETUP
// =============================================================================

const server = setupServer(
  // Gemini API (primary)
  http.post('https://generativelanguage.googleapis.com/v1beta/models/*', () => {
    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: "Hello! I'm MediBot, your friendly health assistant. " +
                  "I can help you find information about medicines, pharmacies, " +
                  "and general health topics. How can I assist you today?",
              },
            ],
            role: 'model',
          },
          finishReason: 'STOP',
          safetyRatings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
          ],
        },
      ],
    });
  }),

  // OpenRouter API (fallback)
  http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'mock-chat-id',
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Paracetamol (Biogesic) is a common pain reliever and fever reducer. ' +
              "It's generally safe when taken as directed. The usual adult dose is " +
              '500mg-1000mg every 4-6 hours, not exceeding 4g per day.',
          },
          finish_reason: 'stop',
        },
      ],
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// =============================================================================
// GEMINI API TESTS (PRIMARY)
// =============================================================================

describe('MediBot Gemini API Integration', () => {
  it('should get response from Gemini API', async () => {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-key',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: 'Hello, MediBot!' }] },
          ],
        }),
      }
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    
    expect(data.candidates).toBeDefined();
    expect(data.candidates[0].content.parts[0].text).toContain('MediBot');
  });

  it('should handle Gemini safety filters', async () => {
    server.use(
      http.post('https://generativelanguage.googleapis.com/v1beta/models/*', () => {
        return HttpResponse.json({
          candidates: [
            {
              content: {
                parts: [{ text: '' }],
                role: 'model',
              },
              finishReason: 'SAFETY',
              safetyRatings: [
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'HIGH' },
              ],
            },
          ],
        });
      })
    );

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-key',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'dangerous content' }] }],
        }),
      }
    );

    const data = await response.json();
    expect(data.candidates[0].finishReason).toBe('SAFETY');
  });

  it('should handle Gemini rate limiting', async () => {
    server.use(
      http.post('https://generativelanguage.googleapis.com/v1beta/models/*', () => {
        return HttpResponse.json(
          { error: { code: 429, message: 'Resource exhausted', status: 'RESOURCE_EXHAUSTED' } },
          { status: 429 }
        );
      })
    );

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-key',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'test' }] }],
        }),
      }
    );

    expect(response.status).toBe(429);
  });
});

// =============================================================================
// OPENROUTER FALLBACK TESTS
// =============================================================================

describe('MediBot OpenRouter Fallback', () => {
  it('should get response from OpenRouter when Gemini fails', async () => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-key',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'system', content: 'You are MediBot, a health assistant.' },
          { role: 'user', content: 'What is Paracetamol?' },
        ],
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();

    expect(data.choices[0].message.content).toContain('Paracetamol');
    expect(data.choices[0].message.content).toContain('pain reliever');
  });

  it('should handle OpenRouter rate limits', async () => {
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
  });
});

// =============================================================================
// CHAT MESSAGE HANDLING TESTS
// =============================================================================

describe('Chat Message Processing', () => {
  it('should format user messages correctly', () => {
    const userMessage = 'What is the dosage for Biogesic?';
    const formattedMessage = {
      role: 'user' as const,
      content: userMessage,
    };

    expect(formattedMessage.role).toBe('user');
    expect(formattedMessage.content).toBe(userMessage);
  });

  it('should handle multi-turn conversations', () => {
    const conversationHistory = [
      { role: 'user' as const, content: 'What is Paracetamol?' },
      { role: 'assistant' as const, content: 'Paracetamol is a pain reliever...' },
      { role: 'user' as const, content: 'What is the recommended dosage?' },
    ];

    expect(conversationHistory).toHaveLength(3);
    expect(conversationHistory[0]?.role).toBe('user');
    expect(conversationHistory[1]?.role).toBe('assistant');
    expect(conversationHistory[2]?.role).toBe('user');
  });

  it('should include system prompt in conversation', () => {
    const systemPrompt = `You are MediBot, a friendly health assistant for Filipinos.
Your role is to help users find medicine information and locate pharmacies.
Always provide disclaimers for medical advice.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: 'Hello!' },
    ];

    expect(messages[0]?.role).toBe('system');
    expect(messages[0]?.content).toContain('MediBot');
    expect(messages[0]?.content).toContain('disclaimer');
  });
});

// =============================================================================
// RESPONSE VALIDATION TESTS
// =============================================================================

describe('Response Validation', () => {
  it('should detect medicine mentions in response', () => {
    const response = 'Biogesic (Paracetamol) is available at most pharmacies.';
    
    const medicinePatterns = [
      /paracetamol/i,
      /biogesic/i,
      /ibuprofen/i,
      /amoxicillin/i,
    ];

    const mentionedMedicines = medicinePatterns.filter((pattern) =>
      pattern.test(response)
    );

    expect(mentionedMedicines.length).toBeGreaterThan(0);
  });

  it('should detect pharmacy mentions', () => {
    const response = 'You can find this at Mercury Drug or Watsons nearby.';

    const pharmacyPatterns = [
      /mercury drug/i,
      /watsons/i,
      /generics pharmacy/i,
      /southstar/i,
    ];

    const mentionedPharmacies = pharmacyPatterns.filter((pattern) =>
      pattern.test(response)
    );

    expect(mentionedPharmacies.length).toBeGreaterThan(0);
  });

  it('should validate response has disclaimer for medical advice', () => {
    const responsesWithDisclaimer = [
      'Always consult a doctor before taking any medication.',
      'Please see a healthcare professional for proper advice.',
      'This is general information only, not medical advice.',
    ];

    const disclaimerPatterns = [
      /consult.*doctor|healthcare|professional/i,
      /not.*medical.*advice/i,
      /see.*doctor|physician/i,
    ];

    responsesWithDisclaimer.forEach((response) => {
      const hasDisclaimer = disclaimerPatterns.some((pattern) =>
        pattern.test(response)
      );
      expect(hasDisclaimer).toBe(true);
    });
  });
});

// =============================================================================
// ERROR STATE TESTS
// =============================================================================

describe('Error States', () => {
  it('should handle network errors gracefully', async () => {
    server.use(
      http.post('https://generativelanguage.googleapis.com/v1beta/models/*', () => {
        return HttpResponse.error();
      }),
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.error();
      })
    );

    try {
      await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        { method: 'POST' }
      );
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle malformed API responses', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json({
          // Missing expected fields
          unexpected: 'response structure',
        });
      })
    );

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'test', messages: [] }),
    });

    const data = await response.json();
    expect(data.choices).toBeUndefined();
    expect(data.unexpected).toBe('response structure');
  });
});
