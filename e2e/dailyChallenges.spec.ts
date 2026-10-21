import { test, expect } from '@playwright/test';

test.describe('Festival Darshan Daily Challenges E2E', () => {
  test('Flow: Switch to Daily Darshan tab, track challenge progress, claim bonus, and persist across reload', async ({ page }) => {
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

    // 1. Verify Quest Tracker is visible with default Sacred Lights tab
    await expect(page.locator('text=The Five Sacred Lights')).toBeVisible({ timeout: 10000 });

    // 2. Switch to Daily Darshan tab
    const dailyTabBtn = page.getByRole('button', { name: /Daily Darshan/i });
    await expect(dailyTabBtn).toBeVisible();
    await dailyTabBtn.click();

    // Verify Daily Darshan view renders
    await expect(page.locator('text=Festival Darshan')).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Today's Seva")).toBeVisible();
    await expect(page.locator('text=0d Streak')).toBeVisible();

    // Check that 3 challenge rows exist
    const challengeRows = page.locator('div.space-y-1\\.5 > div');
    await expect(challengeRows).toHaveCount(3);

    // 3. Fulfill all 3 daily challenges via real game actions in store
    await page.evaluate(() => {
      const store = (window as any).__gameStore.getState();
      const daily = store.dailyDarshan;
      for (const ch of daily.challenges) {
        if (ch.type === 'light_diyas') {
          store.lightDiya('test_e2e_diya_1');
          store.lightDiya('test_e2e_diya_2');
          store.lightDiya('test_e2e_diya_3');
        } else if (ch.type === 'balloon_score') {
          store.startBalloonGame();
          store.recordBalloonHit(100);
          store.endBalloonGame();
        } else if (ch.type === 'balloon_hits') {
          store.startBalloonGame();
          for (let i = 0; i < 6; i++) store.recordBalloonHit(10);
          store.endBalloonGame();
        } else if (ch.type === 'taste_sweet') {
          store.purchaseItem('jalebi');
        } else if (ch.type === 'visit_attraction') {
          store.recordFireworksWatched();
        } else if (ch.type === 'rangoli_art') {
          store.completeRangoli();
        }
      }
      (window as any).__gameStore.getState().closeModal();
    });

    // 4. Verify Claim Bonus button appears
    const claimBtn = page.getByRole('button', { name: /Claim \+25 🪙 Daily Bonus!/i });
    await expect(claimBtn).toBeVisible({ timeout: 5000 });

    // Read initial tokens
    const initialTokens = await page.evaluate(() => (window as any).__gameStore.getState().tokens);

    // 5. Click Claim Bonus
    await claimBtn.click();

    // Verify status updates to Claimed
    await expect(page.locator('text=Daily Bonus Claimed (+25 🪙)')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=1d Streak')).toBeVisible();

    // Verify tokens increased by 25
    const finalTokens = await page.evaluate(() => (window as any).__gameStore.getState().tokens);
    expect(finalTokens).toBe(initialTokens + 25);

    // 6. Test Persistence: Reload page
    await page.reload();
    const enterBtnAfterReload = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtnAfterReload).toBeVisible({ timeout: 15000 });
    await enterBtnAfterReload.click();

    // Switch to Daily Darshan tab after reload
    const dailyTabAfterReload = page.getByRole('button', { name: /Daily Darshan/i });
    await expect(dailyTabAfterReload).toBeVisible({ timeout: 10000 });
    await dailyTabAfterReload.click();

    // Verify claimed status and streak persisted, no claim button
    await expect(page.locator('text=Daily Bonus Claimed (+25 🪙)')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=1d Streak')).toBeVisible();
    await expect(claimBtn).not.toBeVisible();
  });
});
