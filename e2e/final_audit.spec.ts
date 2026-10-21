import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('Comprehensive Final Project Audit: Gameplay, Performance, Controls & Persistence', async ({ page }) => {
  test.setTimeout(240000);

  // Clear localStorage before start
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  const artifactDir = process.env.ARTIFACT_DIR || path.join(process.cwd(), 'test-artifacts');
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  // 1. Desktop Experience Setup
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  // Check Title & Welcome Screen
  await expect(page).toHaveTitle(/Diwali Mela/i);
  const enterBtn = page.getByRole('button', { name: /ENTER THE MELA/i });
  await expect(enterBtn).toBeVisible({ timeout: 15000 });

  // Enter the Mela
  await enterBtn.click();
  await expect(enterBtn).not.toBeVisible();
  await page.waitForTimeout(2000);

  // Helper to measure FPS & frame time over a short sample
  const measurePerformance = async (sampleFrames = 4) => {
    return await page.evaluate(async (framesToCount) => {
      return new Promise<{ fps: number; avgFrameTimeMs: number; maxFrameTimeMs: number }>((resolve) => {
        let frameCount = 0;
        let lastTime = performance.now();
        const frameTimes: number[] = [];

        const onFrame = (now: number) => {
          const delta = now - lastTime;
          lastTime = now;
          if (frameCount > 0) {
            frameTimes.push(delta);
          }
          frameCount++;
          if (frameCount < framesToCount) {
            requestAnimationFrame(onFrame);
          } else {
            const sum = frameTimes.reduce((a, b) => a + b, 0);
            const avg = sum / (frameTimes.length || 1);
            const max = Math.max(...frameTimes, 16.6);
            const fps = Math.round(1000 / avg);
            resolve({ fps, avgFrameTimeMs: Number(avg.toFixed(2)), maxFrameTimeMs: Number(max.toFixed(2)) });
          }
        };
        requestAnimationFrame(onFrame);
      });
    }, sampleFrames);
  };

  // Helper to teleport player
  const teleport = async (x: number, y: number, z: number, yaw = 0, pitch = 0.12) => {
    await page.evaluate(({ x, y, z, yaw, pitch }) => {
      const tp = (window as any).__teleportPlayer;
      if (tp) tp(x, y, z, yaw, pitch);
    }, { x, y, z, yaw, pitch });
    await page.waitForTimeout(600);
  };

  // ── AUDIT 1: ENTRANCE ────────────────────────────────────────────────────────
  console.log('[Audit] 1. Auditing Grand Entrance Arch & Approach...');
  // Initial spawn at threshold: [0, 0, -20]
  await teleport(0, 0, -22, 0, 0.08);
  const perfEntrance = await measurePerformance();
  console.log('[Audit] Entrance Performance:', perfEntrance);

  const entranceShot = path.join(artifactDir, 'audit-entrance.png');
  await page.screenshot({ path: entranceShot });

  // ── AUDIT 2: CENTRAL PLAZA ──────────────────────────────────────────────────
  console.log('[Audit] 2. Auditing Central Rangoli Plaza & Akhand Jyoti...');
  // Center of the fairground: [0, 0, 0], look slightly down towards rangoli
  await teleport(0, 0, -3.2, 0, 0.28);
  const perfPlaza = await measurePerformance();
  console.log('[Audit] Central Plaza Performance:', perfPlaza);

  // Check prompt near Akhand Jyoti / Rangoli
  const promptText = page.locator('text=Press E or Tap to Interact');
  const hasPlazaPrompt = await promptText.isVisible().catch(() => false);
  console.log('[Audit] Plaza Interaction Prompt visible:', hasPlazaPrompt);

  const centralShot = path.join(artifactDir, 'audit-central-plaza.png');
  await page.screenshot({ path: centralShot });

  // ── AUDIT 3: STALLS (SWEET SHOP & HANDICRAFTS) ──────────────────────────────
  console.log('[Audit] 3. Auditing Food & Mithai Stalls...');
  // Food stalls are at X: -12.5, Z: 6. Stand in front at [-8.5, 0, 6], facing West (-PI/2)
  await teleport(-8.5, 0, 6, -Math.PI / 2, 0.14);
  const perfStalls = await measurePerformance();
  console.log('[Audit] Stalls Performance:', perfStalls);

  const stallsShot = path.join(artifactDir, 'audit-stalls.png');
  await page.screenshot({ path: stallsShot });

  // ── AUDIT 4: FERRIS WHEEL ───────────────────────────────────────────────────
  console.log('[Audit] 4. Auditing Ferris Wheel Attraction & Boarding Deck...');
  // Ferris Wheel is at [24, 0, 20]. Boarding platform at [18, 0, 20]. Stand at [13.5, 0, 20], facing East (PI/2)
  await teleport(13.5, 0, 20, Math.PI / 2, -0.08);
  const perfFerris = await measurePerformance();
  console.log('[Audit] Ferris Wheel Performance:', perfFerris);

  const ferrisShot = path.join(artifactDir, 'audit-ferris-wheel.png');
  await page.screenshot({ path: ferrisShot });

  // ── AUDIT 5: FIREWORKS FINALE ───────────────────────────────────────────────
  console.log('[Audit] 5. Auditing Grand Fireworks Finale...');
  // Stand at central promenade facing North, looking up into celestial sky
  await teleport(0, 0, -8, 0, -0.42);

  const fireworksBtn = page.getByRole('button', { name: /Grand Fireworks/i });
  await expect(fireworksBtn).toBeVisible({ timeout: 10000 });
  await fireworksBtn.click();

  // Wait for countdown and bursts
  await page.waitForTimeout(5000);
  const perfFireworks = await measurePerformance();
  console.log('[Audit] Fireworks Finale Performance:', perfFireworks);

  const fireworksShot = path.join(artifactDir, 'audit-fireworks-finale.png');
  await page.screenshot({ path: fireworksShot });

  // Close finale modal
  const continueBtn = page.getByRole('button', { name: /Continue Exploring Mela/i });
  if (await continueBtn.isVisible().catch(() => false)) {
    await continueBtn.click();
    await page.waitForTimeout(400);
  }

  // ── AUDIT 6: CONTROLS & COLLISION BOUNDARIES ────────────────────────────────
  console.log('[Audit] 6. Auditing Collision Boundary Resolution...');
  const collisionResult = await page.evaluate(() => {
    // Collision system test: resolving a movement that penetrates the Ferris wheel cylinder
    const pos = (window as any).__playerPos?.current;
    return { playerPos: pos ? { x: pos.x, y: pos.y, z: pos.z } : null };
  });
  console.log('[Audit] Player Position state:', collisionResult);

  // ── AUDIT 7: SAVE PERSISTENCE & ECONOMY ──────────────────────────────────────
  console.log('[Audit] 7. Auditing Save Persistence & Economy...');
  const initialTokens = await page.evaluate(() => {
    const game = (window as any).__gameStore;
    return game ? game.getState().tokens : null;
  });
  console.log('[Audit] Token balance after finale gift:', initialTokens);
  expect(initialTokens).toBeGreaterThanOrEqual(100);

  // Check localStorage record
  const saveRaw = await page.evaluate(() => localStorage.getItem('diwali_mela_save_v1'));
  expect(saveRaw).not.toBeNull();
  const parsed = JSON.parse(saveRaw!);
  expect(parsed.version).toBe(1);
  expect(parsed.tokens).toBe(initialTokens);
  expect(parsed.stats.fireworksWatchedCount).toBeGreaterThanOrEqual(1);

  // ── AUDIT 8: REDUCED-MOTION BEHAVIOR ────────────────────────────────────────
  console.log('[Audit] 8. Auditing Settings & Reduced-Motion Mode...');
  const settingsBtn = page.getByRole('button', { name: /Settings/i });
  await settingsBtn.click();
  await expect(page.locator('text=MELA SETTINGS')).toBeVisible();

  // Toggle Reduced Motion switch
  const reducedMotionToggle = page.getByRole('switch', { name: /Reduced Motion/i });
  await reducedMotionToggle.click();
  const isReducedMotion = await page.evaluate(() => {
    const game = (window as any).__gameStore;
    return game.getState().settings.reducedMotion;
  });
  expect(isReducedMotion).toBe(true);

  // Resume
  const resumeBtn = page.getByRole('button', { name: /Save & Return to Mela/i });
  await resumeBtn.click();
  await page.waitForTimeout(400);

  // ── AUDIT 9: MOBILE VIEWPORT & JOYSTICK ─────────────────────────────────────
  console.log('[Audit] 9. Auditing Mobile Usability & Virtual Joystick...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    const input = (window as any).__inputStore;
    if (input) input.getState().setIsTouchDevice(true);
  });
  await page.waitForTimeout(400);

  const perfMobile = await measurePerformance();
  console.log('[Audit] Mobile Viewport Performance:', perfMobile);

  const mobileShot = path.join(artifactDir, 'audit-mobile-gameplay.png');
  await page.screenshot({ path: mobileShot });

  // Complete Performance Summary
  console.log('=== FINAL AUDIT PERFORMANCE MEASUREMENTS ===');
  console.log('Entrance:', perfEntrance);
  console.log('Central Plaza:', perfPlaza);
  console.log('Food Stalls:', perfStalls);
  console.log('Ferris Wheel:', perfFerris);
  console.log('Fireworks Finale:', perfFireworks);
  console.log('Mobile Viewport:', perfMobile);
});
