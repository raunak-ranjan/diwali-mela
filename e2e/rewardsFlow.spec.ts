import { test, expect } from '@playwright/test';

test.describe('Festival Rewards & Progression Flow E2E', () => {
  test('Wallet, Wardrobe purchase, Equip/Unequip, and Progression tabs flow seamlessly', async ({ page }) => {
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

    // 1. Open Rewards & Progression modal via the HUD Token button
    const tokenButton = page.getByRole('button', { name: /Open Festival Wallet and Progression/i });
    await expect(tokenButton).toBeVisible({ timeout: 10000 });
    await tokenButton.click();

    // 2. Verify modal opened
    const modalTitle = page.locator('#rewards-modal-title');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
    await expect(modalTitle).toContainText('Festival Rewards & Progression');

    // 3. Verify Wardrobe Tab items exist
    await expect(page.locator('text=Swarna Aura')).toBeVisible();
    await expect(page.locator('text=Deepam Companion')).toBeVisible();
    await expect(page.locator('text=Genda Floral Trail')).toBeVisible();
    await expect(page.locator('text=Surya Mukut')).toBeVisible();

    // Swarna Aura is affordable with starting 50 tokens (costs 30 tokens)
    const unlockAuraBtn = page.getByRole('button', { name: /Unlock for 30 🪙/i });
    await expect(unlockAuraBtn).toBeVisible();

    // Surya Mukut is locked (costs 120 tokens > 50 tokens)
    const lockedCrownBtn = page.getByRole('button', { name: /Locked \(120 🪙\)/i });
    await expect(lockedCrownBtn).toBeVisible();
    await expect(lockedCrownBtn).toBeDisabled();

    // 4. Purchase Swarna Aura
    await unlockAuraBtn.click();

    // Verify Swarna Aura is now Owned & Equipped
    await expect(page.locator('text=Owned').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Unequip' })).toBeVisible();

    // Verify balance in modal header updated to 20 🪙
    await expect(page.locator('text=20 🪙').first()).toBeVisible();

    // 5. Test Unequip and Re-equip
    const unequipBtn = page.getByRole('button', { name: 'Unequip' });
    await unequipBtn.click();
    await expect(page.getByRole('button', { name: 'Equip' })).toBeVisible({ timeout: 5000 });

    const equipBtn = page.getByRole('button', { name: 'Equip' });
    await equipBtn.click();
    await expect(page.getByRole('button', { name: 'Unequip' })).toBeVisible({ timeout: 5000 });

    // 6. Switch to Festival Wallet tab
    const walletTabBtn = page.getByRole('button', { name: /Festival Wallet/i });
    await walletTabBtn.click();

    // Check Wallet summary cards
    await expect(page.locator('text=Spendable Balance')).toBeVisible();
    await expect(page.locator('text=Total Spent')).toBeVisible();
    await expect(page.locator('text=Recent Festival Ledger')).toBeVisible();
    // Check purchase transaction is recorded in ledger
    await expect(page.locator('text=Unlocked Swarna Aura')).toBeVisible();

    // 7. Switch to Achievements & Progression tab
    const progressionTabBtn = page.getByRole('button', { name: /Achievements/i });
    await progressionTabBtn.click();

    await expect(page.locator('text=The Five Sacred Lights')).toBeVisible();
    await expect(page.locator('text=Festival Illuminator')).toBeVisible();
    await expect(page.locator('text=Master of Rangoli')).toBeVisible();
    await expect(page.locator('text=Booth Champion')).toBeVisible();

    // 8. Close modal
    const closeBtn = page.getByRole('button', { name: 'Close', exact: true });
    await closeBtn.click();
    await expect(modalTitle).not.toBeVisible();

    // 9. Verify HUD token counter shows 20
    await expect(tokenButton).toContainText('20');

    // 10. Test Page Reload Persistence: cosmetics and token balance survive reload
    await page.reload();
    const enterBtnAfterReload = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtnAfterReload).toBeVisible({ timeout: 15000 });
    await enterBtnAfterReload.click();

    // Token button shows 20 after reload
    const tokenButtonAfterReload = page.getByRole('button', { name: /Open Festival Wallet and Progression/i });
    await expect(tokenButtonAfterReload).toBeVisible({ timeout: 10000 });
    await expect(tokenButtonAfterReload).toContainText('20');

    // Open Rewards modal again and verify Swarna Aura is still owned and equipped
    await tokenButtonAfterReload.click();
    await expect(page.getByRole('button', { name: 'Unequip' })).toBeVisible({ timeout: 5000 });
  });
});
