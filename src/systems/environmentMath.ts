/**
 * Pure deterministic mathematics for Diwali Mela environment effects:
 * - Wind simulation with harmonic gusting
 * - Cloth/garland sway deflection
 * - Candle/diya flame luminosity flicker
 * - Spatial audio distance attenuation
 * - Ambient fireworks interval scheduling
 */

export interface WindVector {
  x: number;
  z: number;
  speed: number;
  gust: number;
}

/**
 * Computes a continuous, gentle global wind vector with natural gusting.
 * Uses overlapping prime harmonics to avoid repetitive mechanical loops.
 */
export function computeGlobalWind(time: number, baseSpeed: number = 1.0): WindVector {
  // Base directional breeze blowing primarily North-East (from South-West)
  const baseAngle = 0.65; // ~37 degrees
  
  // Gust modulation using combined sine harmonics
  const gustHarmonic1 = Math.sin(time * 0.45);
  const gustHarmonic2 = Math.sin(time * 0.19 + 1.2);
  const gustHarmonic3 = Math.cos(time * 0.83 + 2.7);
  
  // Normalized gust factor [0, 1]
  const rawGust = (gustHarmonic1 * 0.5 + gustHarmonic2 * 0.35 + gustHarmonic3 * 0.15 + 1.0) * 0.5;
  const gust = Math.max(0, Math.min(1, rawGust));

  // Effective speed in m/s (1.0 to 3.2 m/s gentle breeze)
  const speed = (baseSpeed * (0.8 + gust * 1.4));
  
  // Slight directional variation with gusting
  const angle = baseAngle + (gust - 0.5) * 0.35;
  const x = Math.cos(angle) * speed;
  const z = Math.sin(angle) * speed;

  return { x, z, speed, gust };
}

/**
 * Computes angular deflection (in radians) for hanging garlands and banners.
 * Returns [rotX, rotZ].
 */
export function computeGarlandSway(
  time: number,
  posX: number,
  posZ: number,
  wind: WindVector,
  reducedMotion: boolean = false
): [number, number] {
  if (reducedMotion) {
    return [0, 0];
  }

  // Phase offset based on spatial position so not all items swing synchronously
  const phase = posX * 0.37 + posZ * 0.51;
  const naturalFreq = 1.4; // ~1.4 Hz pendulum response
  
  // Primary oscillation driven by pendulum natural frequency
  const primary = Math.sin(time * naturalFreq + phase);
  // Secondary flutter driven by wind speed
  const flutter = Math.sin(time * 3.1 + phase * 2.1) * (0.15 + wind.gust * 0.25);
  
  const amplitude = 0.045 * (0.6 + wind.gust * 0.8);
  const deflection = (primary + flutter) * amplitude;

  // Orient deflection in the direction of the wind
  const rotX = deflection * (wind.z / (wind.speed || 1));
  const rotZ = -deflection * (wind.x / (wind.speed || 1));

  return [rotX, rotZ];
}

/**
 * Computes subtle diya flame luminosity flicker factor.
 * Simulates candlelight air convection: smooth variation between 0.91 and 1.09.
 */
export function computeDiyaFlameFlicker(time: number, seed: number = 0): number {
  const f1 = Math.sin(time * 4.2 + seed);
  const f2 = Math.sin(time * 9.7 + seed * 2.3);
  const f3 = Math.cos(time * 17.1 + seed * 4.1);
  
  const rawVariation = (f1 * 0.5 + f2 * 0.35 + f3 * 0.15) * 0.085;
  return 1.0 + Math.max(-0.09, Math.min(0.09, rawVariation));
}

/**
 * Computes spatial distance attenuation factor [0.0, 1.0] for a 3D audio source.
 * Uses a smooth cosine roll-off between innerRadius and maxRadius.
 */
export function computeSpatialAudioGain(
  listenerPos: [number, number, number],
  sourcePos: [number, number, number],
  innerRadius: number = 6.0,
  maxRadius: number = 32.0
): number {
  const dx = listenerPos[0] - sourcePos[0];
  const dy = listenerPos[1] - sourcePos[1];
  const dz = listenerPos[2] - sourcePos[2];
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (dist <= innerRadius) {
    return 1.0;
  }
  if (dist >= maxRadius) {
    return 0.0;
  }

  // Smooth Hermite / Cosine roll-off
  const t = (dist - innerRadius) / (maxRadius - innerRadius);
  return 0.5 * (1 + Math.cos(Math.PI * t));
}

/**
 * Pure scheduler for ambient festival fireworks bursts.
 * Determines if a new ambient rocket should launch at the given elapsed time.
 */
export function shouldLaunchAmbientFirework(
  currentTime: number,
  lastLaunchTime: number,
  intervalSeconds: number = 18.0,
  enabled: boolean = true,
  reducedMotion: boolean = false
): boolean {
  if (!enabled || reducedMotion) {
    return false;
  }
  return (currentTime - lastLaunchTime) >= intervalSeconds;
}

/**
 * Generates bounded random sky coordinates for an ambient firework burst
 * situated high above and behind the distant pavilion/fort to avoid obstructing gameplay.
 */
export function computeAmbientFireworkTarget(seed: number): {
  x: number;
  y: number;
  z: number;
  burstType: 'peony' | 'willow' | 'crackle' | 'kamuro';
} {
  // Deterministic pseudo-randomness from seed
  const s = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  const rand1 = s - Math.floor(s);
  const s2 = Math.sin((seed + 1) * 12.9898 + 78.233) * 43758.5453;
  const rand2 = s2 - Math.floor(s2);

  // Positioned in distant backdrop (Z: 38 to 65, X: -35 to 35, Y: 28 to 40)
  const x = (rand1 - 0.5) * 60;
  const y = 30 + rand2 * 12;
  const z = 42 + (rand1 * 0.7) * 20;

  const types: Array<'peony' | 'willow' | 'crackle' | 'kamuro'> = ['peony', 'willow', 'crackle', 'kamuro'];
  const burstType = types[Math.floor(rand1 * types.length)] || 'peony';

  return { x, y, z, burstType };
}
