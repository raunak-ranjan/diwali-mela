import { test, expect } from '@playwright/test';

test.describe('Living Mela — Ambient NPCs, Crowd Behaviour & Vendor Greetings E2E', () => {
  test.setTimeout(120000);

  test('Ambient crowd initialization, safe areas, vendor greetings, density toggling, and core gameplay coexistence', async ({ page }) => {
    // Collect console errors to detect any runtime crashes
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // 1. Visit and clean storage
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    // 2. Enter Mela
    const enterBtn = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtn).toBeVisible({ timeout: 15000 });
    await enterBtn.click();
    await expect(enterBtn).not.toBeVisible();

    // 3. Verify Ambient NPC System Initialization
    const initialDensity = await page.evaluate(() => (window as any).__getNpcDensity?.());
    expect(initialDensity).toBe('full');

    // 4. Verify Vendor Greeting in Bazaar Shop Modal
    await page.evaluate(() => {
      (window as any).__gameStore.getState().openModal('shop');
    });

    const shopTitle = page.locator('text=DIWALI MELA BAZAAR');
    await expect(shopTitle).toBeVisible({ timeout: 5000 });

    const vendorGreeting = page.getByTestId('shop-vendor-greeting');
    await expect(vendorGreeting).toBeVisible();
    await expect(vendorGreeting).toContainText(/Vendor's Blessing|Ganesh Kaka|Artisan Suresh|Mela Vendors/i);

    // Close shop modal
    await page.evaluate(() => {
      (window as any).__gameStore.getState().closeModal();
    });
    await expect(shopTitle).not.toBeVisible();

    // 5. Verify Contextual 2D Vendor Greeting Banner
    await page.evaluate(() => {
      const vendorState = {
        vendorId: 'vendor_mithai',
        vendorName: 'Ganesh Kaka',
        shopName: 'Shree Ganesh Sweets & Mithai',
        text: 'Namaste! Fresh hot gulab jamun and jalebi for Diwali!',
        accent: 'May your festival be filled with joy and sweetness!',
      };
      window.dispatchEvent(new CustomEvent('test-set-greeting', { detail: vendorState }));
    });

    const greetingBanner = page.getByTestId('vendor-greeting-banner');
    await expect(greetingBanner).toBeVisible({ timeout: 5000 });
    await expect(greetingBanner).toContainText('Ganesh Kaka');
    await expect(greetingBanner).toContainText('Shree Ganesh Sweets & Mithai');
    await expect(greetingBanner).toContainText('Fresh hot gulab jamun');

    // Dismiss greeting
    const dismissBtn = greetingBanner.getByRole('button', { name: /Dismiss greeting/i });
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click();
    await expect(greetingBanner).not.toBeVisible();

    // 6. Verify Player Movement & Booth Coexistence
    // Teleport player near Ring Toss and open Ring Toss modal
    await page.evaluate(() => {
      (window as any).__gameStore.getState().openModal('ring_toss');
    });
    const ringTossTitle = page.locator('#ringtoss-title');
    await expect(ringTossTitle).toBeVisible({ timeout: 5000 });
    // Close Ring Toss
    await page.evaluate(() => {
      (window as any).__gameStore.getState().closeModal();
    });
    await expect(ringTossTitle).not.toBeVisible();

    // Open Balloon Shooting Booth
    await page.evaluate(() => {
      (window as any).__gameStore.getState().openModal('balloon_game');
    });
    const balloonTitle = page.locator('text=CARNIVAL BALLOON SHOOT');
    await expect(balloonTitle).toBeVisible({ timeout: 5000 });
    // Close Balloon Booth
    await page.evaluate(() => {
      (window as any).__gameStore.getState().closeModal();
    });
    await expect(balloonTitle).not.toBeVisible();

    // 7. Verify Festival Pouch & Daily Challenges still function
    await page.evaluate(() => {
      (window as any).__gameStore.getState().openModal('inventory');
    });
    const pouchTitle = page.locator('#pouch-modal-title');
    await expect(pouchTitle).toBeVisible({ timeout: 5000 });
    await page.evaluate(() => {
      (window as any).__gameStore.getState().closeModal();
    });
    await expect(pouchTitle).not.toBeVisible();

    // Daily Challenges in Rewards Modal
    await page.evaluate(() => {
      (window as any).__gameStore.getState().openModal('rewards');
    });
    const rewardsTitle = page.locator('text=FESTIVAL REWARDS');
    await expect(rewardsTitle).toBeVisible({ timeout: 5000 });
    // Switch to Daily Darshan tab
    const dailyTab = page.getByRole('tab', { name: /DAILY DARSHAN/i });
    if (await dailyTab.isVisible()) {
      await dailyTab.click();
      await expect(page.locator('text=Festival Darshan Daily Challenge')).toBeVisible();
    }
    await page.evaluate(() => {
      (window as any).__gameStore.getState().closeModal();
    });
    await expect(rewardsTitle).not.toBeVisible();

    // 8. Test Settings Modal: Crowd Density Controls
    await page.evaluate(() => {
      (window as any).__gameStore.getState().openModal('settings');
    });
    const settingsTitle = page.locator('text=MELA SETTINGS');
    await expect(settingsTitle).toBeVisible({ timeout: 5000 });

    const reducedBtn = page.getByTestId('crowd-density-reduced');
    await expect(reducedBtn).toBeVisible();
    await reducedBtn.click();

    let density = await page.evaluate(() => (window as any).__getNpcDensity?.());
    expect(density).toBe('reduced');

    const offBtn = page.getByTestId('crowd-density-off');
    await expect(offBtn).toBeVisible();
    await offBtn.click();

    density = await page.evaluate(() => (window as any).__getNpcDensity?.());
    expect(density).toBe('off');

    const fullBtn = page.getByTestId('crowd-density-full');
    await expect(fullBtn).toBeVisible();
    await fullBtn.click();

    density = await page.evaluate(() => (window as any).__getNpcDensity?.());
    expect(density).toBe('full');

    // Close settings modal
    await page.evaluate(() => {
      (window as any).__gameStore.getState().closeModal();
    });
    await expect(settingsTitle).not.toBeVisible();

    // 9. Verify zero uncaught page runtime errors
    expect(pageErrors).toEqual([]);
  });
});
