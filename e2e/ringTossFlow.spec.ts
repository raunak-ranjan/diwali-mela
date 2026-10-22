import { test, expect } from '@playwright/test';

test.describe('Diwali Ring Toss Carnival Mini-Game E2E', () => {
  test('Complete Ring Toss Loop: Instructions, Aiming, Hits, Misses, Reward Calculation, Replay & Modal Restorations', async ({ page }) => {
    test.setTimeout(120000);

    // Initial visit & clean storage
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    // 1. Enter Mela
    const enterBtn = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtn).toBeVisible({ timeout: 15000 });
    await enterBtn.click();
    await expect(enterBtn).not.toBeVisible();

    // Initial token balance is 50
    const initialTokens = await page.evaluate(() => (window as any).__gameStore.getState().tokens);
    expect(initialTokens).toBe(50);

    // 2. Open Ring Toss Carnival Stall
    await page.evaluate(() => {
      (window as any).__gameStore.getState().openModal('ring_toss');
    });

    // Verify Instructions View
    const modalTitle = page.locator('#ringtoss-title');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
    await expect(modalTitle).toContainText('DIWALI RING TOSS');
    await expect(page.locator('text=Toss Rings & Win Fair Tokens!')).toBeVisible();

    // Verify Start Toss button is available
    const startTossBtn = page.getByTestId('start-ring-toss-btn');
    await expect(startTossBtn).toBeVisible();

    // 3. Start the Round
    await startTossBtn.click();

    // Verify playing state
    await expect(page.locator('text=Score:')).toBeVisible();
    const target1 = page.getByTestId('ring-target-1');
    await expect(target1).toBeVisible();

    // 4. Throw 1: Aim & hit Target 1 (Brass Diya - 10 pts)
    await target1.click();
    await expect.poll(async () => {
      return page.evaluate(() => (window as any).__gameStore.getState().ringTossGame.ringsRemaining);
    }, { timeout: 3000 }).toBe(4);

    const scoreAfterHit1 = await page.evaluate(() => (window as any).__gameStore.getState().ringTossGame.score);
    expect(scoreAfterHit1).toBe(10);

    // 5. Throw 2: Miss Area (Toss wide - 0 pts)
    const missArea = page.getByTestId('ring-toss-miss-area');
    await expect(missArea).toBeVisible();
    await missArea.click();
    await expect.poll(async () => {
      return page.evaluate(() => (window as any).__gameStore.getState().ringTossGame.ringsRemaining);
    }, { timeout: 3000 }).toBe(3);

    const scoreAfterMiss = await page.evaluate(() => (window as any).__gameStore.getState().ringTossGame.score);
    expect(scoreAfterMiss).toBe(10); // Score remains 10

    // 6. Throw 3: Target 5 (Middle pot - 15 pts)
    const target5 = page.getByTestId('ring-target-5');
    await target5.click();
    await expect.poll(async () => {
      return page.evaluate(() => (window as any).__gameStore.getState().ringTossGame.ringsRemaining);
    }, { timeout: 3000 }).toBe(2);

    const scoreAfterHit3 = await page.evaluate(() => (window as any).__gameStore.getState().ringTossGame.score);
    expect(scoreAfterHit3).toBe(25);

    // 7. Throw 4: Target 8 (Back kalash - 25 pts)
    const target8 = page.getByTestId('ring-target-8');
    await target8.click();
    await expect.poll(async () => {
      return page.evaluate(() => (window as any).__gameStore.getState().ringTossGame.ringsRemaining);
    }, { timeout: 3000 }).toBe(1);

    const scoreAfterHit4 = await page.evaluate(() => (window as any).__gameStore.getState().ringTossGame.score);
    expect(scoreAfterHit4).toBe(50);

    // 8. Throw 5 (Final Ring): Target 2 (Brass Diya - 10 pts)
    const target2 = page.getByTestId('ring-target-2');
    await target2.click();

    // Round should automatically finish when rings reach 0
    await expect(page.locator('text=Round Complete!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('ring-toss-final-score')).toHaveText('60 pts');
    await expect(page.getByTestId('ring-toss-reward-tokens')).toContainText('+20 🪙');

    // Verify token balance increased from 50 to 70
    const finalTokens = await page.evaluate(() => (window as any).__gameStore.getState().tokens);
    expect(finalTokens).toBe(70);

    // 9. Verify Duplicate Finish Guard
    await page.evaluate(() => {
      (window as any).__gameStore.getState().endRingTossGame();
    });
    const tokensAfterDup = await page.evaluate(() => (window as any).__gameStore.getState().tokens);
    expect(tokensAfterDup).toBe(70);

    // 10. Close Modal and return to Mela
    const leaveBtn = page.getByRole('button', { name: 'Leave Stall' });
    await expect(leaveBtn).toBeVisible();
    await leaveBtn.click();
    await expect(modalTitle).not.toBeVisible();

    // Verify activeModal is restored to 'none'
    const activeModal = await page.evaluate(() => (window as any).__gameStore.getState().activeModal);
    expect(activeModal).toBe('none');

    // 11. Verify Balloon Shooting mini-game remains fully functional
    await page.evaluate(() => {
      (window as any).__gameStore.getState().startBalloonGame();
    });
    await expect(page.locator('text=CARNIVAL BALLOON SHOOT')).toBeVisible();
    await page.evaluate(() => {
      (window as any).__gameStore.getState().closeModal();
    });
    await expect(page.locator('text=CARNIVAL BALLOON SHOOT')).not.toBeVisible();
  });
});
