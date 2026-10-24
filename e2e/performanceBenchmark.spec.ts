import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface ZoneMetrics {
  zone: string;
  fps: number;
  avgFrameTimeMs: number;
  drawCalls: number;
  triangles: number;
  resolution: string;
  dpr: number;
}

test.describe('Automated Performance Benchmark Across 4 Key Scenes', () => {
  test.setTimeout(90000);

  test('Benchmark Central Plaza, Food Stalls, Ferris Wheel, and Fireworks', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // 1. Clean visit
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    // 2. Enter Mela
    const enterBtn = page.getByRole('button', { name: /ENTER THE MELA/i });
    await expect(enterBtn).toBeVisible({ timeout: 20000 });
    await enterBtn.click();
    await expect(enterBtn).not.toBeVisible();

    // Wait for 3D canvas and initial render stabilization
    await page.waitForTimeout(1000);

    const metrics: ZoneMetrics[] = [];

    // Helper to sample a scene zone
    async function sampleScene(
      zoneName: string,
      teleport: { x: number; y: number; z: number; yaw?: number; pitch?: number },
      setupAction?: () => Promise<void>
    ): Promise<ZoneMetrics> {
      if (setupAction) {
        await setupAction();
      }

      // Teleport player and camera to target vantage
      await page.evaluate((pos) => {
        if ((window as any).__teleportPlayer) {
          (window as any).__teleportPlayer(pos.x, pos.y, pos.z, pos.yaw, pos.pitch);
        }
      }, teleport);

      // Settle frames
      await page.waitForTimeout(600);

      // Run 1200ms benchmark sample
      const sample = await page.evaluate(async () => {
        if ((window as any).__samplePerformance) {
          return await (window as any).__samplePerformance(1200);
        }
        if ((window as any).__getPerformanceReport) {
          const report = (window as any).__getPerformanceReport();
          return {
            avgFps: report.avgFps || report.fps,
            avgFrameTimeMs: report.avgFrameTimeMs || report.frameTimeMs,
            avgDrawCalls: report.drawCalls,
            avgTriangles: report.triangles,
            resolution: report.resolution,
            dpr: report.dpr,
          };
        }
        return {
          avgFps: 60,
          avgFrameTimeMs: 16.6,
          avgDrawCalls: 0,
          avgTriangles: 0,
          resolution: '',
          dpr: 1,
        };
      });

      const m: ZoneMetrics = {
        zone: zoneName,
        fps: Math.round(sample.avgFps * 10) / 10,
        avgFrameTimeMs: Math.round(sample.avgFrameTimeMs * 10) / 10,
        drawCalls: sample.avgDrawCalls,
        triangles: sample.avgTriangles,
        resolution: sample.resolution,
        dpr: sample.dpr,
      };
      metrics.push(m);
      return m;
    }

    // SCENE 1: Central Rangoli Plaza
    await sampleScene('Central Rangoli Plaza', { x: 0, y: 0, z: 0, yaw: 0, pitch: 0.1 });

    // SCENE 2: Dense Food & Sweets Stall Area
    await sampleScene('Dense Stall Bazaar', { x: -8, y: 0, z: 16, yaw: -Math.PI / 2, pitch: 0.08 });

    // SCENE 3: Giant Illuminated Ferris Wheel Vantage
    await sampleScene('Ferris Wheel View', { x: 18, y: 0, z: 18, yaw: Math.PI / 3, pitch: 0.22 });

    // SCENE 4: Grand Fireworks Sky Finale
    await sampleScene(
      'Fireworks Sky Finale',
      { x: 0, y: 0, z: 28, yaw: 0, pitch: 0.45 },
      async () => {
        await page.evaluate(() => {
          (window as any).__gameStore.getState().openModal('finale');
        });
      }
    );

    // Close modal after sampling
    await page.evaluate(() => {
      (window as any).__gameStore.getState().closeModal();
    });

    // Formatted reporting
    // eslint-disable-next-line no-console
    console.log(`\n============================================================`);
    // eslint-disable-next-line no-console
    console.log(`AUTOMATED BENCHMARK REPORT [Project: ${projectName}]`);
    // eslint-disable-next-line no-console
    console.log(`Resolution / DPR: ${metrics[0]?.resolution || 'N/A'} (DPR: ${metrics[0]?.dpr || 1})`);
    // eslint-disable-next-line no-console
    console.log(`------------------------------------------------------------`);
    // eslint-disable-next-line no-console
    console.log(`Scene                   | FPS   | FrameTime | Calls | Triangles`);
    // eslint-disable-next-line no-console
    console.log(`------------------------+-------+-----------+-------+----------`);
    for (const m of metrics) {
      const zonePad = m.zone.padEnd(23, ' ');
      const fpsPad = `${m.fps}`.padEnd(5, ' ');
      const ftPad = `${m.avgFrameTimeMs} ms`.padEnd(9, ' ');
      const callsPad = `${m.drawCalls}`.padEnd(5, ' ');
      const trisPad = `${(m.triangles / 1000).toFixed(1)}k`.padEnd(8, ' ');
      // eslint-disable-next-line no-console
      console.log(`${zonePad} | ${fpsPad} | ${ftPad} | ${callsPad} | ${trisPad}`);
    }
    // eslint-disable-next-line no-console
    console.log(`============================================================\n`);

    // Persist benchmark baseline to test-results/
    try {
      const outDir = path.resolve('test-results');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      const safeProject = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const outPath = path.join(outDir, `benchmark_${safeProject}.json`);
      fs.writeFileSync(
        outPath,
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            project: projectName,
            metrics,
          },
          null,
          2
        )
      );
    } catch {
      // Non-fatal if disk write fails
    }

    // Verify zero unhandled page errors
    expect(pageErrors).toEqual([]);

    // Verify renderer is actively drawing valid geometry in all 4 scenes
    for (const m of metrics) {
      expect(m.drawCalls).toBeGreaterThan(0);
      expect(m.triangles).toBeGreaterThan(0);
      expect(m.fps).toBeGreaterThan(0);
    }
  });
});
