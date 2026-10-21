import { test, expect } from '@playwright/test';

test.describe('Deep Diwali Mela Gameplay Verification', () => {
  test('Complete Gameplay Loop: Movement, Balloon Game, Sweet Shop, Rangoli, Diya Lighting, Persistence & Console Health', async ({ page }) => {
    test.setTimeout(90000);
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      // Ignore benign WebGL warnings if any
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', (req) => {
      // Ignore transient external font CDN blips during page reload
      if (req.url().includes('fonts.googleapis.com') || req.url().includes('fonts.gstatic.com')) {
        return;
      }
      failedRequests.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
    });

    // 1. Visit website
    await page.goto('/');

    // Check title and welcome screen
    await expect(page).toHaveTitle(/Diwali Mela/i);
    const enterBtn = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtn).toBeVisible();
    await enterBtn.click();

    // Verify Canvas is rendered
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify initial token balance is 50
    const tokenDisplay = page.locator('text=Tokens').locator('..').locator('span.font-mono');
    await expect(tokenDisplay).toHaveText('50');

    // 2. Test WASD Locomotion
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(600);
    await page.keyboard.up('KeyW');

    // 3. Test Diya Lighting
    await page.evaluate(() => {
      const store = (window as any).__gameStore?.getState();
      if (store) {
        store.lightDiya('diya_test_e2e_1');
      }
    });
    // Lighting diya grants +5 tokens -> 55 tokens
    await expect(tokenDisplay).toHaveText('55');

    // 4. Test Sweet Stall Shopping
    await page.evaluate(() => {
      const store = (window as any).__gameStore?.getState();
      if (store) {
        store.openModal('shop');
      }
    });

    // Shop modal should appear
    await expect(page.locator('text=DIWALI MELA BAZAAR')).toBeVisible();
    await expect(page.locator('text=Gulab Jamun Plate')).toBeVisible();

    // Buy Gulab Jamun (costs 15 tokens)
    const buyButtons = page.getByRole('button', { name: /Buy with Tokens/i });
    await buyButtons.first().click();

    // Verification: Button switches to "Purchased!"
    await expect(page.locator('text=Purchased!')).toBeVisible();

    // Close shop
    await page.evaluate(() => {
      (window as any).__gameStore?.getState().closeModal();
    });
    await expect(page.locator('text=DIWALI MELA BAZAAR')).not.toBeVisible();

    // Now HUD is visible again: Tokens decrease: 55 - 15 = 40
    await expect(tokenDisplay).toHaveText('40');

    // 5. Test Balloon Shooting Mini-game
    await page.evaluate(() => {
      (window as any).__gameStore?.getState().startBalloonGame();
    });

    await expect(page.locator('text=CARNIVAL BALLOON SHOOT')).toBeVisible();
    await expect(page.locator('text=Time:')).toBeVisible();

    // Click balloon target directly
    await page.locator('text=+20').first().click();

    // Manually record balloon hits to verify score & reward
    await page.evaluate(() => {
      (window as any).__gameStore?.getState().recordBalloonHit(20);
      (window as any).__gameStore?.getState().recordBalloonHit(15);
    });

    // End balloon game
    await page.evaluate(() => {
      (window as any).__gameStore?.getState().endBalloonGame();
    });

    await expect(page.locator('text=BOOTH COMPLETED!')).toBeVisible();
    const collectBtn = page.getByRole('button', { name: /COLLECT REWARD & RETURN/i });
    await collectBtn.click({ force: true });
    await expect(page.locator('text=BOOTH COMPLETED!')).not.toBeVisible();

    // 6. Test Rangoli Art Challenge
    await page.evaluate(() => {
      (window as any).__gameStore?.getState().openModal('rangoli');
    });

    await expect(page.locator('text=RANGOLI ART CHALLENGE')).toBeVisible();
    // Click some mandala petals
    const petals = page.locator('[data-testid="rangoli-petal"]');
    const count = await petals.count();
    expect(count).toBeGreaterThan(0);
    await petals.first().click();
    await petals.nth(1).click();

    // Close Rangoli
    await page.getByRole('button', { name: /Close & Save/i }).click();
    await expect(page.locator('text=RANGOLI ART CHALLENGE')).not.toBeVisible();

    // 7. Test Local Persistence across Page Reload
    const currentTokensText = await tokenDisplay.innerText();
    const currentTokens = parseInt(currentTokensText, 10);
    expect(currentTokens).toBeGreaterThan(40);

    // Reload the page
    await page.reload();

    // Enter Mela again
    await page.getByRole('button', { name: /ENTER THE MELA/i }).click();

    // Verify persisted tokens
    await expect(tokenDisplay).toHaveText(currentTokens.toString());

    // 8. Verify No Critical Console Errors or Network Request Failures
    expect(failedRequests).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
