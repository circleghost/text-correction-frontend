import { test, expect } from '@playwright/test';

test.describe('App E2E Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Vite \+ React/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('Vite + React');

    // Check that logos are visible
    await expect(page.locator('img[alt="Vite logo"]')).toBeVisible();
    await expect(page.locator('img[alt="React logo"]')).toBeVisible();
  });

  test('counter functionality works', async ({ page }) => {
    await page.goto('/');

    // Find the counter button
    const counterButton = page.locator('button', { hasText: 'count is 0' });
    await expect(counterButton).toBeVisible();

    // Click the button and check if counter increases
    await counterButton.click();
    await expect(page.locator('button', { hasText: 'count is 1' })).toBeVisible();

    // Click again
    await page.locator('button', { hasText: 'count is 1' }).click();
    await expect(page.locator('button', { hasText: 'count is 2' })).toBeVisible();
  });

  test('external links work correctly', async ({ page, context }) => {
    await page.goto('/');

    // Test Vite link opens in new tab
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a[href="https://vite.dev"]')
    ]);
    
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('vite.dev');
    await newPage.close();

    // Test React link opens in new tab
    const [reactPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a[href="https://react.dev"]')
    ]);
    
    await reactPage.waitForLoadState();
    expect(reactPage.url()).toContain('react.dev');
    await reactPage.close();
  });

  test('responsive design works', async ({ page }) => {
    await page.goto('/');

    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('h1')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Counter should still work on mobile
    await page.locator('button', { hasText: 'count is 0' }).click();
    await expect(page.locator('button', { hasText: 'count is 1' })).toBeVisible();
  });

  test('page performance is acceptable', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within reasonable time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(5000);
    
    // Check that critical elements are visible quickly
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button')).toBeVisible();
  });
});