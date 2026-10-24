import { describe, it, expect } from 'vitest';
import { calculate1PercentLowFps } from '../utils/telemetryMath';

describe('DevPerformanceTelemetry', () => {
  it('correctly calculates 1% low FPS from frame time samples', () => {
    // 100 frames: 95 fast frames at 16.6ms (~60fps), 5 slow frames at 33.3ms (~30fps)
    const frameTimes: number[] = [];
    for (let i = 0; i < 95; i++) {
      frameTimes.push(16.66);
    }
    for (let i = 0; i < 5; i++) {
      frameTimes.push(33.33);
    }

    const lowFps = calculate1PercentLowFps(frameTimes);
    // 99th percentile slowest frame is 33.33ms -> 1000 / 33.33 = 30.0 FPS
    expect(lowFps).toBeCloseTo(30.0, 0);
  });

  it('handles empty or zero-duration frame times gracefully', () => {
    expect(calculate1PercentLowFps([])).toBe(0);
    expect(calculate1PercentLowFps([0])).toBe(0);
  });

  it('handles consistent 60fps frame times', () => {
    const frameTimes = new Array(60).fill(16.6667);
    const lowFps = calculate1PercentLowFps(frameTimes);
    expect(lowFps).toBeCloseTo(60.0, 0);
  });

  it('reflects severe frame spikes in 1% low FPS', () => {
    // 100 frames with a 100ms stutter at the tail
    const frameTimes = new Array(99).fill(16.6);
    frameTimes.push(100.0); // 100ms frame drop -> 10fps

    const lowFps = calculate1PercentLowFps(frameTimes);
    expect(lowFps).toBeCloseTo(10.0, 0);
  });
});
