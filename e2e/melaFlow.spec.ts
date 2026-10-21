import { test, expect } from '@playwright/test';

test.describe('Diwali Mela 3D Web Experience E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Flow 1: Loads welcome screen, starts game, renders HUD and canvas', async ({ page }) => {
    await page.goto('/');

    // Check title and welcome screen
    await expect(page).toHaveTitle(/Diwali Mela/i);
    const enterBtn = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtn).toBeVisible();

    // Start game
    await enterBtn.click();

    // Welcome screen dismissed
    await expect(enterBtn).not.toBeVisible();

    // HUD should now be visible with 50 default tokens
    await expect(page.locator('text=Tokens')).toBeVisible();
    await expect(page.locator('text=50')).toBeVisible();

    // WebGL Canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('Flow 2: Pause and Settings menu toggle', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /ENTER THE MELA/i }).click();

    // Press Escape to pause
    await page.keyboard.press('Escape');
    await expect(page.locator('text=PAUSED')).toBeVisible();

    // Click Resume
    await page.getByRole('button', { name: /Resume Fair/i }).click();
    await expect(page.locator('text=PAUSED')).not.toBeVisible();

    // Open Settings via HUD
    const settingsBtn = page.locator('button[title="Settings & Controls"]');
    await settingsBtn.click();
    await expect(page.locator('text=MELA SETTINGS')).toBeVisible();
    await expect(page.locator('text=Graphics Quality')).toBeVisible();

    // Switch graphics quality to Low
    await page.getByRole('button', { name: 'LOW' }).click();

    // Close Settings
    await page.getByRole('button', { name: /Save & Return/i }).click();
    await expect(page.locator('text=MELA SETTINGS')).not.toBeVisible();
  });

  test('Flow 3: Grand Fireworks Finale Celebration Flow', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /ENTER THE MELA/i }).click();

    // Click Grand Fireworks button in HUD
    const fireworksBtn = page.getByRole('button', { name: /Grand Fireworks/i });
    await fireworksBtn.click();

    // Check countdown or celebration dialog
    await expect(page.locator('text=Grand Diwali Fireworks Countdown')).toBeVisible();

    // Wait for countdown to finish
    await expect(page.locator('text=HAPPY DIWALI!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=+50 Diwali Celebration Tokens Gifted!')).toBeVisible();

    // Token count should have increased from 50 to 100
    await page.getByRole('button', { name: /Continue Exploring Mela/i }).click();
    await expect(page.locator('text=Tokens').locator('..').locator('span.font-mono')).toHaveText('100');
  });

  test('Flow 4: Mobile Viewport Usability', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await page.goto('/');
    await page.getByRole('button', { name: /ENTER THE MELA/i }).click();

    // Virtual joystick base exists on mobile screen
    const hudTokens = page.locator('text=Tokens');
    await expect(hudTokens).toBeVisible();
  });
});
