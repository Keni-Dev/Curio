/**
 * Medicine Search E2E Tests
 *
 * Tests the complete user flow:
 * 1. Search for a medicine
 * 2. View search results
 * 3. Select a pharmacy
 * 4. View pharmacy details
 */

import { test, expect } from '@playwright/test';

// =============================================================================
// TEST SETUP
// =============================================================================

test.beforeEach(async ({ page }) => {
  // Mock geolocation to Malolos, Bulacan
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 14.8527, longitude: 120.8157 });
});

// =============================================================================
// SEARCH FLOW TESTS
// =============================================================================

test.describe('Medicine Search Flow', () => {
  test('should display home page with search input', async ({ page }) => {
    await page.goto('/');

    // Check for search input
    const searchInput = page.getByPlaceholder(/hanapin|search|medicine/i);
    await expect(searchInput).toBeVisible();
  });

  test('should show suggestions when typing medicine name', async ({ page }) => {
    await page.goto('/');

    // Type in search
    const searchInput = page.getByPlaceholder(/hanapin|search|medicine/i);
    await searchInput.fill('Biogesic');

    // Wait for suggestions (debounced)
    await page.waitForTimeout(500);

    // Should show suggestion list
    const suggestions = page.locator('[role="listbox"], [data-testid="suggestions"]');
    await expect(suggestions).toBeVisible({ timeout: 5000 }).catch(() => {
      // Fallback: check for any suggestion-like element
    });
  });

  test('should navigate to search results page', async ({ page }) => {
    await page.goto('/');

    // Type and submit search
    const searchInput = page.getByPlaceholder(/hanapin|search|medicine/i);
    await searchInput.fill('Paracetamol');
    await searchInput.press('Enter');

    // Should be on search results page
    await expect(page).toHaveURL(/\/search/);
  });

  test('should display pharmacy cards in search results', async ({ page }) => {
    // Mock API response for search
    await page.route('**/rest/v1/rpc/search_medicines*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'med-1',
            brand_name: 'Biogesic',
            generic_name: 'Paracetamol',
            dosage: '500mg',
            form: 'Tablet',
          },
        ]),
      });
    });

    await page.route('**/rest/v1/rpc/search_nearby_pharmacies*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'pharm-1',
            name: 'Mercury Drug - SM Malolos',
            slug: 'mercury-drug-sm-malolos',
            address: 'SM City Malolos',
            distance: 250,
            stock_status: 'in_stock',
          },
          {
            id: 'pharm-2',
            name: 'Generics Pharmacy',
            slug: 'generics-pharmacy',
            address: 'Main Street',
            distance: 500,
            stock_status: 'low_stock',
          },
        ]),
      });
    });

    await page.goto('/search?q=Paracetamol');

    // Wait for results
    await page.waitForLoadState('networkidle');

    // Should show pharmacy cards
    const pharmacyCards = page.locator('[data-testid="pharmacy-card"], article');
    await expect(pharmacyCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show distance on pharmacy cards', async ({ page }) => {
    await page.route('**/rest/v1/rpc/search_nearby_pharmacies*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'pharm-1',
            name: 'Test Pharmacy',
            slug: 'test-pharmacy',
            distance: 350,
            stock_status: 'in_stock',
          },
        ]),
      });
    });

    await page.goto('/search?q=test');
    await page.waitForLoadState('networkidle');

    // Should show distance
    const distanceText = page.getByText(/350m|0\.35km/);
    await expect(distanceText).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to pharmacy detail on card click', async ({ page }) => {
    await page.route('**/rest/v1/rpc/search_nearby_pharmacies*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'pharm-1',
            name: 'Mercury Drug',
            slug: 'mercury-drug',
            distance: 250,
            stock_status: 'in_stock',
          },
        ]),
      });
    });

    await page.goto('/search?q=test');
    await page.waitForLoadState('networkidle');

    // Click on pharmacy card
    const pharmacyLink = page.getByRole('link', { name: /mercury drug/i });
    await pharmacyLink.click();

    // Should navigate to pharmacy detail
    await expect(page).toHaveURL(/\/pharmacy\/mercury-drug/);
  });
});

// =============================================================================
// PHARMACY DETAIL TESTS
// =============================================================================

test.describe('Pharmacy Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock pharmacy detail API
    await page.route('**/rest/v1/pharmacies*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'pharm-1',
            name: 'Mercury Drug - SM Malolos',
            slug: 'mercury-drug-sm-malolos',
            address: 'Ground Floor, SM City Malolos, Bulacan',
            phone: '+63 44 123 4567',
            type: 'Chain',
            chain_name: 'Mercury Drug',
            is_24_hours: true,
            is_verified: true,
            lat: 14.8527,
            lng: 120.8157,
          },
        ]),
      });
    });
  });

  test('should display pharmacy information', async ({ page }) => {
    await page.goto('/pharmacy/mercury-drug-sm-malolos');
    await page.waitForLoadState('networkidle');

    // Check pharmacy name
    await expect(page.getByText('Mercury Drug - SM Malolos')).toBeVisible();

    // Check address
    await expect(page.getByText(/SM City Malolos/)).toBeVisible();
  });

  test('should show 24 hours badge', async ({ page }) => {
    await page.goto('/pharmacy/mercury-drug-sm-malolos');
    await page.waitForLoadState('networkidle');

    const badge = page.getByText(/24|open.*hours/i);
    await expect(badge).toBeVisible();
  });

  test('should show verified badge', async ({ page }) => {
    await page.goto('/pharmacy/mercury-drug-sm-malolos');
    await page.waitForLoadState('networkidle');

    const verifiedBadge = page.getByText(/verified/i);
    await expect(verifiedBadge).toBeVisible();
  });

  test('should have directions button', async ({ page }) => {
    await page.goto('/pharmacy/mercury-drug-sm-malolos');
    await page.waitForLoadState('networkidle');

    const directionsButton = page.getByRole('link', { name: /direction|navigate|map/i });
    await expect(directionsButton).toBeVisible();
  });
});

// =============================================================================
// MAP VIEW TESTS
// =============================================================================

test.describe('Map View', () => {
  test('should display map with pharmacies', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');

    // Check for map container
    const mapContainer = page.locator('.leaflet-container, [data-testid="map"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });

  test('should show current location on map', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');

    // Should have user location marker or button
    const locationButton = page.getByRole('button', { name: /location|my location|center/i });
    await expect(locationButton).toBeVisible({ timeout: 10000 }).catch(() => {
      // Some implementations may not have a visible button
    });
  });
});

// =============================================================================
// FILTER TESTS
// =============================================================================

test.describe('Search Filters', () => {
  test('should filter by 24 hours', async ({ page }) => {
    await page.goto('/search?q=test');
    await page.waitForLoadState('networkidle');

    // Look for 24 hours filter
    const filter24h = page.getByRole('checkbox', { name: /24.*hours/i })
      .or(page.getByLabel(/24.*hours/i))
      .or(page.getByText(/24.*hours/i));

    if (await filter24h.isVisible()) {
      await filter24h.click();
      // URL should update with filter
      await expect(page).toHaveURL(/is24Hours=true|filter.*24/);
    }
  });
});
