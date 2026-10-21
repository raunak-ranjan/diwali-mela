import { test, expect } from '@playwright/test';

test.describe('Festival Quest System E2E', () => {
  test('Flow: Displays quest tracker, allows kindling magical diyas, updates progress and awards bonus on completion', async ({ page }) => {
    test.setTimeout(90000);

    // Initial visit & clear storage
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    // Start game
    const enterBtn = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtn).toBeVisible({ timeout: 15000 });
    await enterBtn.click();
    await expect(enterBtn).not.toBeVisible();

    // 1. Verify Quest Tracker is visible on HUD
    await expect(page.locator('text=The Five Sacred Lights')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=0 / 5')).toBeVisible();
    await expect(page.locator('text=Next Hint:')).toBeVisible();

    // 2. Teleport player near Diya 1 (Entrance: [2.2, 0.45, -20.5])
    await page.evaluate(() => {
      if ((window as any).__teleportPlayer) {
        (window as any).__teleportPlayer(2.2, 0.5, -20.0, 0, 0);
      }
    });

    // Interaction prompt should appear for Sacred Diya
    const prompt = page.locator('button:has-text("Kindle Sacred Diya")');
    await expect(prompt).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Diya of Auspicious Beginnings')).toBeVisible();

    // Kindle the Diya by clicking prompt or pressing E
    await prompt.click();

    // Verify progress updates to 1 / 5 and next hint updates
    await expect(page.locator('text=1 / 5')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Next Hint: At Central Rangoli Plaza')).toBeVisible({ timeout: 5000 });

    // Verify prompt dismisses and cannot be re-triggered at same spot
    await expect(prompt).not.toBeVisible({ timeout: 5000 });

    // 3. Collect remaining 4 diyas directly via store
    await page.evaluate(() => {
      const store = (window as any).__gameStore.getState();
      store.collectMagicalDiya('magical_diya_plaza', 'Diya of Harmony & Art');
      store.collectMagicalDiya('magical_diya_sweets', 'Diya of Sweet Abundance');
      store.collectMagicalDiya('magical_diya_wheel', 'Diya of Cosmic Wonder');
      store.collectMagicalDiya('magical_diya_stage', 'Diya of Rhythm & Celebration');
    });

    // 4. Verify Quest Completion
    await expect(page.locator('text=5 / 5')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=All 5 Diyas Kindled!')).toBeVisible();
    await expect(page.locator('text=Blessing of Light unlocked!')).toBeVisible();

    // Verify tokens were rewarded (+50 tokens from initial 50 = 100 tokens)
    const tokenVal = await page.evaluate(() => {
      return (window as any).__gameStore.getState().tokens;
    });
    expect(tokenVal).toBe(100);

    // 5. Verify Persistence after page reload
    await page.reload();
    const enterBtnReload = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtnReload).toBeVisible({ timeout: 15000 });
    await enterBtnReload.click();

    // Should load completed quest state with 100 tokens
    await expect(page.locator('text=5 / 5')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=All 5 Diyas Kindled!')).toBeVisible();
    const tokenValAfterReload = await page.evaluate(() => {
      return (window as any).__gameStore.getState().tokens;
    });
    expect(tokenValAfterReload).toBe(100);
  });
});

