import fs from 'fs';
import path from 'path';

const resultsDir = path.resolve('test-results');

function readJsonSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {
    return null;
  }
  return null;
}

const mobileData = readJsonSafe(path.join(resultsDir, 'benchmark_Mobile_Chrome.json'));
const desktopData = readJsonSafe(path.join(resultsDir, 'benchmark_Desktop_Chrome.json'));

console.log('\n========================================================================================');
console.log('DIWALI MELA AUTOMATED BENCHMARK AUDIT (Headless Playwright Chromium)');
console.log('Note: CPU/Software rasterizer in headless test runner affects FPS, but WebGL draw calls');
console.log('and triangle counts are exact and hardware-independent.');
console.log('========================================================================================\n');

if (mobileData && mobileData.metrics) {
  console.log(`[MOBILE CHROME] Timestamp: ${mobileData.timestamp}`);
  console.log('----------------------------------------------------------------------------------------');
  console.log('Scene                   | Draw Calls | Triangles | Frame Time | FPS (Emulated)');
  console.log('------------------------+------------+-----------+------------+---------------');
  for (const m of mobileData.metrics) {
    const zone = m.zone.padEnd(23, ' ');
    const calls = `${m.drawCalls}`.padEnd(10, ' ');
    const tris = `${(m.triangles / 1000).toFixed(1)}k`.padEnd(9, ' ');
    const ft = `${m.avgFrameTimeMs} ms`.padEnd(10, ' ');
    const fps = `${m.fps}`.padEnd(5, ' ');
    console.log(`${zone} | ${calls} | ${tris} | ${ft} | ${fps}`);
  }
  console.log('----------------------------------------------------------------------------------------\n');
}

if (desktopData && desktopData.metrics) {
  console.log(`[DESKTOP CHROME] Timestamp: ${desktopData.timestamp}`);
  console.log('----------------------------------------------------------------------------------------');
  console.log('Scene                   | Draw Calls | Triangles | Frame Time | FPS (Emulated)');
  console.log('------------------------+------------+-----------+------------+---------------');
  for (const m of desktopData.metrics) {
    const zone = m.zone.padEnd(23, ' ');
    const calls = `${m.drawCalls}`.padEnd(10, ' ');
    const tris = `${(m.triangles / 1000).toFixed(1)}k`.padEnd(9, ' ');
    const ft = `${m.avgFrameTimeMs} ms`.padEnd(10, ' ');
    const fps = `${m.fps}`.padEnd(5, ' ');
    console.log(`${zone} | ${calls} | ${tris} | ${ft} | ${fps}`);
  }
  console.log('----------------------------------------------------------------------------------------\n');
}
