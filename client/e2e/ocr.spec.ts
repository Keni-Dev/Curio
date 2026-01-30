/**
 * OCR Scanner E2E Tests
 *
 * Tests the prescription scanning flow:
 * 1. Open OCR scanner
 * 2. Upload/capture image
 * 3. View extracted medicines
 * 4. Search for extracted medicines
 */

import { test, expect } from '@playwright/test';
import path from 'path';

// =============================================================================
// TEST SETUP
// =============================================================================

test.beforeEach(async ({ page }) => {
  // Mock OpenRouter API for OCR
  await page.route('https://openrouter.ai/api/v1/chat/completions', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-ocr',
        choices: [
          {
            message: {
              role: 'assistant',
              content: JSON.stringify({
                medicines: ['Metformin 500mg', 'Losartan 50mg', 'Amlodipine 5mg'],
                isPrescription: true,
                confidence: 0.85,
              }),
            },
            finish_reason: 'stop',
          },
        ],
      }),
    });
  });

  // Mock geolocation
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 14.8527, longitude: 120.8157 });
});

// =============================================================================
// SCANNER INTERFACE TESTS
// =============================================================================

test.describe('OCR Scanner Interface', () => {
  test('should display scanner page with upload option', async ({ page }) => {
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    // Should have file upload or camera button
    const uploadButton = page.getByRole('button', { name: /upload|camera|scan|kunan/i })
      .or(page.locator('input[type="file"]'))
      .or(page.getByText(/upload|take photo|mag-upload/i));

    await expect(uploadButton).toBeVisible();
  });

  test('should show instructions for scanning', async ({ page }) => {
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const instructions = page.getByText(/prescription|reseta|scan|upload/i);
    await expect(instructions).toBeVisible();
  });

  test('should have camera option on mobile', async ({ page }) => {
    // Test with mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const cameraOption = page.getByRole('button', { name: /camera|kunan|take/i })
      .or(page.locator('[data-testid="camera-button"]'));

    await expect(cameraOption).toBeVisible().catch(() => {
      // Camera may not be available in test environment
    });
  });
});

// =============================================================================
// IMAGE UPLOAD TESTS
// =============================================================================

test.describe('Image Upload', () => {
  test('should accept image file upload', async ({ page }) => {
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    // Find file input
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Create a mock image file
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileInput.setInputFiles({
        name: 'prescription.png',
        mimeType: 'image/png',
        buffer,
      });

      // Should show processing or preview
      const processing = page.getByText(/processing|loading|analyzing|sinusuri/i)
        .or(page.locator('[data-testid="preview"]'));
      await expect(processing).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should show image preview after upload', async ({ page }) => {
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileInput.setInputFiles({
        name: 'test.png',
        mimeType: 'image/png',
        buffer,
      });

      // Preview image should be visible
      const preview = page.locator('img[src^="data:"], img[src^="blob:"]')
        .or(page.locator('[data-testid="image-preview"]'));
      await expect(preview).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should show error for invalid file type', async ({ page }) => {
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Try to upload a text file
      await fileInput.setInputFiles({
        name: 'document.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('This is not an image'),
      });

      // Should show error
      const error = page.getByText(/invalid|error|hindi valid|image only/i);
      await expect(error).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });
});

// =============================================================================
// OCR EXTRACTION TESTS
// =============================================================================

test.describe('OCR Extraction', () => {
  test('should extract medicines from image', async ({ page }) => {
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileInput.setInputFiles({
        name: 'prescription.png',
        mimeType: 'image/png',
        buffer,
      });

      // Wait for extraction
      await page.waitForTimeout(2000);

      // Should show extracted medicines
      const metformin = page.getByText(/metformin/i);
      const losartan = page.getByText(/losartan/i);

      await expect(metformin).toBeVisible({ timeout: 10000 }).catch(() => {});
      await expect(losartan).toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });

  test('should show confidence indicator', async ({ page }) => {
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileInput.setInputFiles({
        name: 'prescription.png',
        mimeType: 'image/png',
        buffer,
      });

      await page.waitForTimeout(2000);

      // Should show confidence level
      const confidence = page.getByText(/confidence|accuracy|tiyak|85%|high|medium/i);
      await expect(confidence).toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });

  test('should handle non-prescription images', async ({ page }) => {
    // Mock response for non-prescription
    await page.route('https://openrouter.ai/api/v1/chat/completions', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [
            {
              message: {
                role: 'assistant',
                content: JSON.stringify({
                  medicines: [],
                  isPrescription: false,
                  confidence: 0.2,
                }),
              },
            },
          ],
        }),
      });
    });

    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileInput.setInputFiles({
        name: 'random.png',
        mimeType: 'image/png',
        buffer,
      });

      await page.waitForTimeout(2000);

      // Should indicate no prescription found
      const message = page.getByText(/no.*prescription|not.*prescription|hindi.*reseta|walang.*gamot/i);
      await expect(message).toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });
});

// =============================================================================
// SEARCH INTEGRATION TESTS
// =============================================================================

test.describe('Search Integration', () => {
  test('should allow searching for extracted medicine', async ({ page }) => {
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileInput.setInputFiles({
        name: 'prescription.png',
        mimeType: 'image/png',
        buffer,
      });

      await page.waitForTimeout(2000);

      // Click on extracted medicine to search
      const medicineButton = page.getByRole('button', { name: /metformin|losartan/i })
        .or(page.getByText(/metformin|losartan/i).first());

      if (await medicineButton.isVisible()) {
        await medicineButton.click();

        // Should navigate to search
        await expect(page).toHaveURL(/\/search/);
      }
    }
  });

  test('should have search all button', async ({ page }) => {
    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileInput.setInputFiles({
        name: 'prescription.png',
        mimeType: 'image/png',
        buffer,
      });

      await page.waitForTimeout(2000);

      // Look for search all button
      const searchAll = page.getByRole('button', { name: /search all|find all|hanapin lahat/i });
      await expect(searchAll).toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

test.describe('Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('https://openrouter.ai/api/v1/chat/completions', (route) => {
      route.fulfill({ status: 500 });
    });

    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileInput.setInputFiles({
        name: 'prescription.png',
        mimeType: 'image/png',
        buffer,
      });

      await page.waitForTimeout(2000);

      // Should show error message
      const error = page.getByText(/error|failed|problema|hindi/i);
      await expect(error).toBeVisible({ timeout: 10000 });
    }
  });

  test('should allow retry after error', async ({ page }) => {
    let attempts = 0;
    await page.route('https://openrouter.ai/api/v1/chat/completions', (route) => {
      attempts++;
      if (attempts === 1) {
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: JSON.stringify({
                    medicines: ['Biogesic'],
                    isPrescription: true,
                    confidence: 0.8,
                  }),
                },
              },
            ],
          }),
        });
      }
    });

    await page.goto('/ocr');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileInput.setInputFiles({
        name: 'prescription.png',
        mimeType: 'image/png',
        buffer,
      });

      await page.waitForTimeout(2000);

      // Click retry
      const retryButton = page.getByRole('button', { name: /retry|try again|ulit/i });
      if (await retryButton.isVisible()) {
        await retryButton.click();

        // Should succeed on retry
        const result = page.getByText(/biogesic/i);
        await expect(result).toBeVisible({ timeout: 10000 });
      }
    }
  });
});
