import { test, expect } from '@playwright/test';

test.describe('Diwali Mela Attractions: Ferris Wheel Ride, Cultural Stage Concert & Sky Fireworks', () => {
  test.setTimeout(120000);

  test('Ferris Wheel manual ride & dismount, Cultural Stage concert controls, and Fireworks dual modes', async ({ page }) => {
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

    // ========================================================================
    // 3. GIANT FERRIS WHEEL: BOARDING, RIDING VIEW, AND SAFE DISMOUNT
    // ========================================================================
    // Board Ferris Wheel
    await page.evaluate(() => {
      (window as any).__gameStore.getState().boardFerrisWheel();
    });

    // Check ride overlay is displayed
    const rideExitBtn = page.getByTestId('ferris-wheel-exit-btn');
    await expect(rideExitBtn).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=GIANT FERRIS WHEEL RIDE')).toBeVisible();
    await expect(page.locator('text=Panoramic Fairground View')).toBeVisible();

    // Verify player state is locked in ride
    const isRiding = await page.evaluate(() => (window as any).__gameStore.getState().ferrisWheelRide.isRiding);
    expect(isRiding).toBe(true);

    // Click Exit Ride
    await rideExitBtn.click();
    await expect(rideExitBtn).not.toBeVisible({ timeout: 5000 });

    const isRidingAfterExit = await page.evaluate(() => (window as any).__gameStore.getState().ferrisWheelRide.isRiding);
    expect(isRidingAfterExit).toBe(false);

    // ========================================================================
    // 4. CULTURAL SANGEET STAGE: DEDICATED CONCERT EXPERIENCE (NO FIREWORKS)
    // ========================================================================
    // Open Cultural Stage modal
    await page.evaluate(() => {
      (window as any).__gameStore.getState().openModal('stage');
    });

    const stageModal = page.getByTestId('cultural-stage-modal');
    await expect(stageModal).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#stage-modal-title')).toContainText('CULTURAL SANGEET STAGE');

    // Confirm that opening the stage NEVER starts the fireworks countdown
    const fireworksModeDuringStage = await page.evaluate(() => (window as any).__gameStore.getState().fireworksState.mode);
    expect(fireworksModeDuringStage).toBe('idle');

    // Toggle concert playback
    const playPauseBtn = page.getByTestId('stage-play-pause-btn');
    await expect(playPauseBtn).toBeVisible();
    await playPauseBtn.click();

    let isPlayingMusic = await page.evaluate(() => (window as any).__gameStore.getState().culturalStageState.isPlayingMusic);
    expect(isPlayingMusic).toBe(true);
    await expect(page.locator('text=LIVE CONCERT PLAYING')).toBeVisible();

    // Pause concert
    await playPauseBtn.click();
    isPlayingMusic = await page.evaluate(() => (window as any).__gameStore.getState().culturalStageState.isPlayingMusic);
    expect(isPlayingMusic).toBe(false);

    // Change Raag
    const bhairaviBtn = page.getByTestId('raag-select-raag-bhairavi');
    await expect(bhairaviBtn).toBeVisible();
    await bhairaviBtn.click();
    const activeRaag = await page.evaluate(() => (window as any).__gameStore.getState().culturalStageState.activeRaag);
    expect(activeRaag).toBe('Raag Bhairavi');

    // Change Stage Lighting Theme
    const peacockBtn = page.getByTestId('lighting-select-peacock');
    await expect(peacockBtn).toBeVisible();
    await peacockBtn.click();
    const activeLighting = await page.evaluate(() => (window as any).__gameStore.getState().culturalStageState.lightingTheme);
    expect(activeLighting).toBe('peacock');

    // Applaud musicians
    const applaudBtn = page.getByTestId('stage-applaud-btn');
    await expect(applaudBtn).toBeVisible();
    await applaudBtn.click();

    // Close stage modal
    const closeStageBtn = page.getByTestId('close-stage-modal-btn');
    await closeStageBtn.click();
    await expect(stageModal).not.toBeVisible();

    // Verify audio loop stopped and state reset on close
    const isPlayingAfterClose = await page.evaluate(() => (window as any).__gameStore.getState().culturalStageState.isPlayingMusic);
    expect(isPlayingAfterClose).toBe(false);

    // ========================================================================
    // 5. FIREWORKS: SCHEDULED SHOW AND INTERACTIVE LAUNCHES
    // ========================================================================
    // Open Fireworks modal
    await page.evaluate(() => {
      (window as any).__gameStore.getState().openModal('fireworks');
    });

    const fireworksModal = page.getByTestId('fireworks-control-modal');
    await expect(fireworksModal).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#fireworks-modal-title')).toContainText('DIWALI SKY FIREWORKS');

    // Scheduled show mode: start show
    const startShowBtn = page.getByTestId('start-scheduled-fireworks-btn');
    await expect(startShowBtn).toBeVisible();
    await startShowBtn.click();

    // Verify countdown starts
    await expect(page.locator('text=Grand Fireworks Countdown')).toBeVisible({ timeout: 3000 });

    // Stop show
    const stopShowBtn = page.getByTestId('stop-fireworks-btn');
    // Wait until stop button appears or countdown transitions
    if (await stopShowBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await stopShowBtn.click();
    } else {
      await page.evaluate(() => (window as any).__gameStore.getState().stopFireworksShow());
    }

    const modeAfterStop = await page.evaluate(() => (window as any).__gameStore.getState().fireworksState.mode);
    expect(modeAfterStop).toBe('idle');

    // Switch to Interactive Launch Pad tab
    const interactiveTab = page.getByTestId('tab-interactive-fireworks');
    await expect(interactiveTab).toBeVisible();
    await interactiveTab.click();

    // Launch an individual Peony rocket
    const launchPeonyBtn = page.getByTestId('launch-peony-btn');
    await expect(launchPeonyBtn).toBeVisible();
    await launchPeonyBtn.click();

    // Launch a Golden Willow rocket
    const launchWillowBtn = page.getByTestId('launch-willow-btn');
    await expect(launchWillowBtn).toBeVisible();
    await launchWillowBtn.click();

    // Verify launch count increased
    const manualCount = await page.evaluate(() => (window as any).__gameStore.getState().fireworksState.manualLaunchesCount);
    expect(manualCount).toBeGreaterThanOrEqual(2);

    // Minimize for Sky View mode
    const minimizeBtn = page.getByTestId('minimize-fireworks-btn');
    await expect(minimizeBtn).toBeVisible();
    await minimizeBtn.click();

    const skyHud = page.getByTestId('fireworks-minimized-hud');
    await expect(skyHud).toBeVisible({ timeout: 5000 });

    // Quick launch from Sky HUD
    const quickLaunchBtn = page.getByTestId('quick-launch-peony-btn');
    await expect(quickLaunchBtn).toBeVisible();
    await quickLaunchBtn.click();

    // Close fireworks
    await page.evaluate(() => {
      (window as any).__gameStore.getState().closeModal();
    });
    await expect(skyHud).not.toBeVisible();

    // ========================================================================
    // 6. CORE GAMEPLAY REGRESSION: RING TOSS, POUCH & REWARDS COEXISTENCE
    // ========================================================================
    // Test Ring Toss
    await page.evaluate(() => (window as any).__gameStore.getState().openModal('ring_toss'));
    await expect(page.locator('#ringtoss-title')).toBeVisible({ timeout: 5000 });
    await page.evaluate(() => (window as any).__gameStore.getState().closeModal());
    await expect(page.locator('#ringtoss-title')).not.toBeVisible();

    // Test Festival Pouch
    await page.evaluate(() => (window as any).__gameStore.getState().openModal('inventory'));
    await expect(page.locator('#pouch-modal-title')).toBeVisible({ timeout: 5000 });
    await page.evaluate(() => (window as any).__gameStore.getState().closeModal());
    await expect(page.locator('#pouch-modal-title')).not.toBeVisible();

    // Test Rewards & Daily Darshan
    await page.evaluate(() => (window as any).__gameStore.getState().openModal('rewards'));
    await expect(page.locator('text=FESTIVAL REWARDS')).toBeVisible({ timeout: 5000 });
    await page.evaluate(() => (window as any).__gameStore.getState().closeModal());
    await expect(page.locator('text=FESTIVAL REWARDS')).not.toBeVisible();

    // Verify zero uncaught errors
    expect(pageErrors).toEqual([]);
  });
});
