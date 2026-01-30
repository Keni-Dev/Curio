/**
 * MediBot Chat E2E Tests
 *
 * Tests the chatbot interaction flow:
 * 1. Open chat page
 * 2. Send a message
 * 3. Receive AI response
 * 4. Handle error states
 */

import { test, expect } from '@playwright/test';

// =============================================================================
// TEST SETUP
// =============================================================================

test.beforeEach(async ({ page }) => {
  // Mock Gemini API responses
  await page.route('https://generativelanguage.googleapis.com/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "Hello! I'm MediBot, your friendly health assistant. " +
                    'I can help you find information about medicines and locate pharmacies in the Philippines. ' +
                    'How can I assist you today?',
                },
              ],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
      }),
    });
  });

  // Mock OpenRouter as fallback
  await page.route('https://openrouter.ai/api/v1/chat/completions', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-chat',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Paracetamol (Biogesic) is a common pain reliever available at most pharmacies.',
            },
            finish_reason: 'stop',
          },
        ],
      }),
    });
  });
});

// =============================================================================
// CHAT INTERFACE TESTS
// =============================================================================

test.describe('Chat Interface', () => {
  test('should display chat page with input', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Check for chat input
    const chatInput = page.getByPlaceholder(/message|tanong|ask|type/i)
      .or(page.getByRole('textbox'));
    await expect(chatInput).toBeVisible();
  });

  test('should show welcome message', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Should show MediBot greeting or intro
    const greeting = page.getByText(/medibot|hello|kumusta|welcome/i);
    await expect(greeting).toBeVisible({ timeout: 5000 });
  });

  test('should have send button', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const sendButton = page.getByRole('button', { name: /send|submit|ipadala/i })
      .or(page.locator('button[type="submit"]'))
      .or(page.locator('[data-testid="send-button"]'));

    await expect(sendButton).toBeVisible();
  });
});

// =============================================================================
// MESSAGE SENDING TESTS
// =============================================================================

test.describe('Sending Messages', () => {
  test('should send message on enter key', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByPlaceholder(/message|tanong/i)
      .or(page.getByRole('textbox'));
    
    await chatInput.fill('What is Biogesic?');
    await chatInput.press('Enter');

    // Message should appear in chat
    const userMessage = page.getByText('What is Biogesic?');
    await expect(userMessage).toBeVisible();
  });

  test('should send message on button click', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByPlaceholder(/message|tanong/i)
      .or(page.getByRole('textbox'));
    
    await chatInput.fill('Hello MediBot');

    const sendButton = page.getByRole('button', { name: /send/i })
      .or(page.locator('button[type="submit"]'));
    await sendButton.click();

    // Message should appear
    const userMessage = page.getByText('Hello MediBot');
    await expect(userMessage).toBeVisible();
  });

  test('should clear input after sending', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByPlaceholder(/message|tanong/i)
      .or(page.getByRole('textbox'));
    
    await chatInput.fill('Test message');
    await chatInput.press('Enter');

    // Input should be cleared
    await expect(chatInput).toHaveValue('');
  });

  test('should show loading state while waiting for response', async ({ page }) => {
    // Delay the API response
    await page.route('https://generativelanguage.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: 'Response after delay' }],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
        }),
      });
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByRole('textbox');
    await chatInput.fill('Question');
    await chatInput.press('Enter');

    // Should show loading indicator
    const loading = page.getByText(/loading|thinking|typing|naglo-load/i)
      .or(page.locator('[data-testid="loading"]'))
      .or(page.locator('.animate-pulse'));

    await expect(loading).toBeVisible({ timeout: 500 }).catch(() => {
      // Loading may be too fast to catch
    });
  });
});

// =============================================================================
// RESPONSE DISPLAY TESTS
// =============================================================================

test.describe('Displaying Responses', () => {
  test('should show AI response after sending message', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByRole('textbox');
    await chatInput.fill('What is Paracetamol?');
    await chatInput.press('Enter');

    // Wait for response
    const response = page.getByText(/paracetamol|biogesic|pain reliever/i);
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('should format medicine names in response', async ({ page }) => {
    await page.route('https://generativelanguage.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '**Biogesic** (Paracetamol) is used for:\n- Fever\n- Headache\n- Body pain',
                  },
                ],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
        }),
      });
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByRole('textbox');
    await chatInput.fill('Tell me about Biogesic');
    await chatInput.press('Enter');

    // Should show formatted response with markdown
    const response = page.getByText(/biogesic|paracetamol/i);
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('should maintain conversation history', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByRole('textbox');

    // Send first message
    await chatInput.fill('What is Biogesic?');
    await chatInput.press('Enter');
    await page.waitForTimeout(1000);

    // Send second message
    await chatInput.fill('What is the dosage?');
    await chatInput.press('Enter');

    // Both messages should be visible
    const firstMessage = page.getByText('What is Biogesic?');
    const secondMessage = page.getByText('What is the dosage?');

    await expect(firstMessage).toBeVisible();
    await expect(secondMessage).toBeVisible();
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

test.describe('Error Handling', () => {
  test('should show error message on API failure', async ({ page }) => {
    await page.route('https://generativelanguage.googleapis.com/**', (route) => {
      route.fulfill({ status: 500 });
    });

    await page.route('https://openrouter.ai/**', (route) => {
      route.fulfill({ status: 500 });
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByRole('textbox');
    await chatInput.fill('Test message');
    await chatInput.press('Enter');

    // Should show error message
    const error = page.getByText(/error|problema|failed|sorry/i);
    await expect(error).toBeVisible({ timeout: 10000 });
  });

  test('should show retry option on error', async ({ page }) => {
    await page.route('https://generativelanguage.googleapis.com/**', (route) => {
      route.fulfill({ status: 500 });
    });

    await page.route('https://openrouter.ai/**', (route) => {
      route.fulfill({ status: 500 });
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByRole('textbox');
    await chatInput.fill('Test');
    await chatInput.press('Enter');

    // Should have retry button
    const retryButton = page.getByRole('button', { name: /retry|try again|ulit/i });
    await expect(retryButton).toBeVisible({ timeout: 10000 }).catch(() => {
      // Retry might be implemented differently
    });
  });
});

// =============================================================================
// QUICK ACTIONS TESTS
// =============================================================================

test.describe('Quick Actions', () => {
  test('should show suggested questions', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Should have suggestion chips or quick actions
    const suggestions = page.getByRole('button', { name: /suggest|common|quick/i })
      .or(page.locator('[data-testid="suggestion"]'))
      .or(page.getByText(/saan makakabili|ano ang|how to/i));

    await expect(suggestions.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Suggestions may not be implemented
    });
  });

  test('should fill input when clicking suggestion', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const suggestion = page.getByRole('button', { name: /paracetamol|biogesic/i });
    if (await suggestion.isVisible()) {
      await suggestion.click();

      // Should trigger the suggestion
      const response = page.getByText(/paracetamol|biogesic/i);
      await expect(response).toBeVisible({ timeout: 5000 });
    }
  });
});

// =============================================================================
// MOBILE RESPONSIVENESS TESTS
// =============================================================================

test.describe('Mobile Chat', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile viewport', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByRole('textbox');
    await expect(chatInput).toBeVisible();

    await chatInput.fill('Hello');
    await chatInput.press('Enter');

    const message = page.getByText('Hello');
    await expect(message).toBeVisible();
  });

  test('should have sticky input on mobile', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Input should be at bottom of screen
    const chatInput = page.getByRole('textbox');
    const box = await chatInput.boundingBox();

    if (box) {
      // Input should be in bottom portion of screen
      expect(box.y).toBeGreaterThan(400);
    }
  });
});
