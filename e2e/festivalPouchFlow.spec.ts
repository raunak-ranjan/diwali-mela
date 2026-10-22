import { test, expect } from '@playwright/test';

test.describe('Festival Pouch & Interactive Inventory Flow E2E', () => {
  test('HUD trigger, category tabs, sweet consumption, shop-to-pouch cycle, sparkler ignition, and reload persistence', async ({ page }) => {
    test.setTimeout(150000);

    // Initial visit & clean storage
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    // 1. Enter Mela
    const enterBtn = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtn).toBeVisible({ timeout: 15000 });
    await enterBtn.click();
    await expect(enterBtn).not.toBeVisible();

    // 2. Locate HUD Pouch button with initial count of 6 (1 gulab_jamun + 5 earthen_diyas)
    const pouchBtn = page.getByRole('button', { name: /Open Festival Pouch/i });
    await expect(pouchBtn).toBeVisible({ timeout: 10000 });
    await expect(pouchBtn).toContainText('6');

    // 3. Open Festival Pouch
    await pouchBtn.click();

    // Verify modal is open
    const pouchTitle = page.locator('#pouch-modal-title');
    await expect(pouchTitle).toBeVisible({ timeout: 5000 });
    await expect(pouchTitle).toContainText('FESTIVAL POUCH & INVENTORY');

    // Verify items in default inventory:
    // - Gulab Jamun Plate: Owned 1
    // - Handcrafted Clay Diya Set: Owned 5
    // - Golden Sparklers Box: Out of Stock
    await expect(page.locator('text=Gulab Jamun Plate')).toBeVisible();
    await expect(page.locator('text=Handcrafted Clay Diya Set')).toBeVisible();
    await expect(page.locator('text=Golden Sparklers Box')).toBeVisible();

    // Gulab Jamun Eat button is enabled
    const eatGulabJamunBtn = page.getByRole('button', { name: 'Eat Gulab Jamun Plate' });
    await expect(eatGulabJamunBtn).toBeVisible();
    await expect(eatGulabJamunBtn).toBeEnabled();

    // 4. Consume Gulab Jamun Plate
    await eatGulabJamunBtn.click();

    // Verify Gulab Jamun button is now disabled and item is consumed
    await expect(page.getByRole('button', { name: 'Eat Gulab Jamun Plate' })).toBeDisabled();

    // Verify store inventory decremented to 0
    const sweetCount = await page.evaluate(() => (window as any).__gameStore.getState().inventory['gulab_jamun']);
    expect(sweetCount).toBe(0);

    // 5. Test Keepsake Inspection (Akash Kandil)
    const inspectBtn = page.getByRole('button', { name: 'Inspect Akash Kandil Festival Lantern' });
    await expect(inspectBtn).toBeVisible();
    await inspectBtn.click();

    // Verify keepsake lore dialog opened
    await expect(page.locator('#keepsake-details-title')).toBeVisible();
    await expect(page.locator('#keepsake-details-title')).toContainText('Akash Kandil');

    // Close keepsake lore dialog
    const closeKeepsakeBtn = page.getByRole('button', { name: 'Back to Pouch' });
    await closeKeepsakeBtn.click();
    await expect(page.locator('#keepsake-details-title')).not.toBeVisible();

    // 6. Close Festival Pouch Modal
    const closePouchBtn = page.getByRole('button', { name: 'Close modal' });
    await closePouchBtn.click();
    await expect(pouchTitle).not.toBeVisible();

    // HUD Pouch count now reflects 5 items
    await expect(pouchBtn).toContainText('5');

    // 7. Purchase Golden Sparklers (phooljhadi) via gameStore purchaseItem action
    await page.evaluate(() => {
      (window as any).__gameStore.getState().purchaseItem('phooljhadi');
    });

    // 8. Re-open Pouch and ignite Golden Sparkler
    await pouchBtn.click();
    await expect(pouchTitle).toBeVisible();

    // Switch to Diyas & Sparklers category
    const diyasCategoryBtn = page.getByRole('button', { name: 'Diyas & Sparklers 🪔' });
    await diyasCategoryBtn.click();

    // Verify Sparkler now shows Owned: 1
    const lightSparklerBtn = page.getByRole('button', { name: 'Light Golden Sparklers Box' });
    await expect(lightSparklerBtn).toBeVisible();
    await expect(lightSparklerBtn).toBeEnabled();

    // Ignite Sparkler
    await lightSparklerBtn.click();

    // Verify button is disabled immediately upon ignition (burning / out of stock)
    await expect(lightSparklerBtn).toBeDisabled();

    // Verify sparkler active state and inventory decrement in store
    const sparklerState = await page.evaluate(() => {
      const s = (window as any).__gameStore.getState();
      return {
        count: s.inventory['phooljhadi'] || 0,
        activeUntil: s.sparklerActiveUntil,
      };
    });
    expect(sparklerState.count).toBe(0);
    expect(sparklerState.activeUntil).toBeGreaterThan(Date.now());

    // Verify duplicate ignition is rejected when inventory is exhausted
    const duplicateIgnition = await page.evaluate(() => {
      return (window as any).__gameStore.getState().lightSparkler();
    });
    expect(duplicateIgnition.success).toBe(false);
    expect(duplicateIgnition.message).toContain('no Golden Sparklers');

    // 9. Close Pouch
    await closePouchBtn.click();
    await expect(pouchTitle).not.toBeVisible();

    // 10. Test Page Reload Persistence: Consumed Gulab Jamun remains 0 and does not re-seed from default
    await page.reload();
    const enterBtnAfterReload = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtnAfterReload).toBeVisible({ timeout: 15000 });
    await enterBtnAfterReload.click();

    // Re-open pouch and verify Gulab Jamun is still Out of Stock
    const pouchBtnAfterReload = page.getByRole('button', { name: /Open Festival Pouch/i });
    await expect(pouchBtnAfterReload).toBeVisible({ timeout: 10000 });
    await pouchBtnAfterReload.click();

    await expect(page.locator('#pouch-modal-title')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eat Gulab Jamun Plate' })).toBeDisabled();
    await expect(page.locator('text=Handcrafted Clay Diya Set')).toBeVisible();
  });
});
