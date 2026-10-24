import { describe, it, expect } from 'vitest';
import {
  computeGlobalWind,
  computeGarlandSway,
  computeDiyaFlameFlicker,
  computeSpatialAudioGain,
  shouldLaunchAmbientFirework,
  computeAmbientFireworkTarget,
} from '../systems/environmentMath';

describe('Diwali Living Mela Environment Systems', () => {
  describe('Global Wind Simulation', () => {
    it('produces bounded and positive wind speed', () => {
      for (let t = 0; t <= 100; t += 5) {
        const wind = computeGlobalWind(t);
        expect(wind.speed).toBeGreaterThanOrEqual(0.5);
        expect(wind.speed).toBeLessThanOrEqual(5.0);
        expect(wind.gust).toBeGreaterThanOrEqual(0.0);
        expect(wind.gust).toBeLessThanOrEqual(1.0);
        expect(Number.isFinite(wind.x)).toBe(true);
        expect(Number.isFinite(wind.z)).toBe(true);
      }
    });

    it('exhibits continuous smooth variation over time', () => {
      const w1 = computeGlobalWind(10.0);
      const w2 = computeGlobalWind(10.05);
      expect(Math.abs(w1.speed - w2.speed)).toBeLessThan(0.1);
      expect(Math.abs(w1.gust - w2.gust)).toBeLessThan(0.05);
    });
  });

  describe('Garland & Banner Sway Deflection', () => {
    it('returns zero deflection when reducedMotion is enabled', () => {
      const wind = computeGlobalWind(5.0);
      const [rotX, rotZ] = computeGarlandSway(5.0, 0, 0, wind, true);
      expect(rotX).toBe(0);
      expect(rotZ).toBe(0);
    });

    it('returns gentle bounded rotation in radians without reducedMotion', () => {
      const wind = computeGlobalWind(5.0);
      const [rotX, rotZ] = computeGarlandSway(5.0, 10, -5, wind, false);
      expect(Math.abs(rotX)).toBeLessThan(0.15); // under ~8 degrees
      expect(Math.abs(rotZ)).toBeLessThan(0.15);
      expect(Number.isFinite(rotX)).toBe(true);
      expect(Number.isFinite(rotZ)).toBe(true);
    });

    it('varies based on world position to avoid identical uniform movement', () => {
      const wind = computeGlobalWind(10.0);
      const swayA = computeGarlandSway(10.0, 0, 0, wind, false);
      const swayB = computeGarlandSway(10.0, 15, 20, wind, false);
      expect(swayA[0] !== swayB[0] || swayA[1] !== swayB[1]).toBe(true);
    });
  });

  describe('Diya Flame Luminosity Flicker', () => {
    it('maintains flicker strictly within stable atmospheric bounds', () => {
      for (let t = 0; t <= 50; t += 0.5) {
        const factor = computeDiyaFlameFlicker(t, 42);
        expect(factor).toBeGreaterThanOrEqual(0.90);
        expect(factor).toBeLessThanOrEqual(1.10);
      }
    });

    it('different light seeds produce distinct flicker timing', () => {
      const f1 = computeDiyaFlameFlicker(3.5, 1);
      const f2 = computeDiyaFlameFlicker(3.5, 2);
      expect(f1).not.toBeCloseTo(f2, 5);
    });
  });

  describe('Spatial Audio Attenuation', () => {
    const sourcePos: [number, number, number] = [0, 0, 0];

    it('returns 1.0 (full volume) inside the inner radius', () => {
      const gain = computeSpatialAudioGain([2, 0, 2], sourcePos, 5.0, 20.0);
      expect(gain).toBe(1.0);
    });

    it('returns 0.0 (silent) outside the max radius', () => {
      const gain = computeSpatialAudioGain([30, 0, 0], sourcePos, 5.0, 20.0);
      expect(gain).toBe(0.0);
    });

    it('provides smooth monotonic decay between inner and max radius', () => {
      const gainClose = computeSpatialAudioGain([6, 0, 0], sourcePos, 5.0, 20.0);
      const gainMid = computeSpatialAudioGain([12, 0, 0], sourcePos, 5.0, 20.0);
      const gainFar = computeSpatialAudioGain([18, 0, 0], sourcePos, 5.0, 20.0);

      expect(gainClose).toBeGreaterThan(gainMid);
      expect(gainMid).toBeGreaterThan(gainFar);
      expect(gainFar).toBeGreaterThan(0.0);
    });
  });

  describe('Ambient Fireworks Scheduling', () => {
    it('rejects launch if interval has not elapsed', () => {
      const shouldLaunch = shouldLaunchAmbientFirework(15.0, 10.0, 20.0, true, false);
      expect(shouldLaunch).toBe(false);
    });

    it('approves launch once interval has elapsed', () => {
      const shouldLaunch = shouldLaunchAmbientFirework(32.0, 10.0, 20.0, true, false);
      expect(shouldLaunch).toBe(true);
    });

    it('suppresses launch if disabled or reducedMotion is on', () => {
      expect(shouldLaunchAmbientFirework(50.0, 10.0, 20.0, false, false)).toBe(false);
      expect(shouldLaunchAmbientFirework(50.0, 10.0, 20.0, true, true)).toBe(false);
    });

    it('generates high distant sky coordinates behind mela attractions', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const target = computeAmbientFireworkTarget(seed);
        expect(target.y).toBeGreaterThanOrEqual(28); // high altitude
        expect(target.z).toBeGreaterThanOrEqual(35); // distant backdrop
        expect(['peony', 'willow', 'crackle', 'kamuro']).toContain(target.burstType);
      }
    });
  });
});
