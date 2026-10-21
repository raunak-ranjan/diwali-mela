import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { soundEngine } from '../../../audio/soundEngine';
import { useGameStore } from '../../../stores/useGameStore';

interface SparkParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  g: number;
  b: number;
  life: number;
  maxLife: number;
  gravity: number;
  drag: number;
  twinkle: boolean;
}

interface Rocket {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vy: number;
  targetY: number;
  burstType: 'peony' | 'willow' | 'ring' | 'crackle' | 'kamuro';
  colorIndex: number;
}

// Traditional Diwali Festival Palette optimized for midnight indigo contrast
const PALETTE = [
  new THREE.Color('#FFD700'), // Pure Gold (Zari)
  new THREE.Color('#FF1744'), // Gulal Crimson
  new THREE.Color('#00E5FF'), // Peacock Turquoise
  new THREE.Color('#00E676'), // Festive Emerald
  new THREE.Color('#FF9100'), // Warm Saffron
  new THREE.Color('#D500F9'), // Royal Magenta
  new THREE.Color('#FFE082'), // Champagne Spark
];

// Soft luminous procedural spark texture for incandescent pyrotechnics
const createSparkTexture = (): THREE.CanvasTexture | null => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(255, 250, 220, 0.95)');
  grad.addColorStop(0.45, 'rgba(255, 190, 80, 0.6)');
  grad.addColorStop(0.75, 'rgba(255, 120, 30, 0.18)');
  grad.addColorStop(1, 'rgba(200, 50, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
};

// Create pre-allocated spark particle pool
const createSparkPool = (count: number): SparkParticle[] => {
  const p: SparkParticle[] = [];
  for (let i = 0; i < count; i++) {
    p.push({
      active: false,
      x: 0,
      y: -1000,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      r: 1,
      g: 1,
      b: 1,
      life: 0,
      maxLife: 1,
      gravity: -5,
      drag: 0.98,
      twinkle: false,
    });
  }
  return p;
};

export const FireworksShow: React.FC<{ active: boolean }> = ({ active }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const burstLightRef = useRef<THREE.PointLight>(null);
  const burstLightIntensity = useRef(0);

  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  // Budget particles based on graphics tier
  const maxParticles = quality === 'high' ? 1200 : quality === 'medium' ? 800 : 450;

  // Reusable procedural spark texture
  const sparkTexture = useMemo(() => createSparkTexture(), []);

  useEffect(() => {
    return () => {
      sparkTexture?.dispose();
    };
  }, [sparkTexture]);

  // Initial buffer allocations for buffer geometry
  const initialPositions = useMemo(() => {
    const arr = new Float32Array(maxParticles * 3);
    for (let i = 0; i < maxParticles; i++) {
      arr[i * 3 + 1] = -1000;
    }
    return arr;
  }, [maxParticles]);

  const initialColors = useMemo(() => {
    const arr = new Float32Array(maxParticles * 3);
    for (let i = 0; i < maxParticles; i++) {
      arr[i * 3] = 1;
      arr[i * 3 + 1] = 1;
      arr[i * 3 + 2] = 1;
    }
    return arr;
  }, [maxParticles]);

  // Pre-allocated pool of particles (max budget across any quality tier)
  const poolRef = useRef<SparkParticle[]>(createSparkPool(1200));

  // Pre-allocated rockets pool
  const rockets = useRef<Rocket[]>([
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'peony', colorIndex: 0 },
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'willow', colorIndex: 0 },
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'ring', colorIndex: 0 },
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'crackle', colorIndex: 0 },
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'kamuro', colorIndex: 0 },
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'peony', colorIndex: 0 },
  ]);

  // Spawn an individual spark in the pre-allocated pool
  const spawnSpark = (
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    color: THREE.Color,
    maxLife: number,
    gravity: number = -5.5,
    drag: number = 0.975,
    twinkle: boolean = false
  ) => {
    const pool = poolRef.current;
    let target: SparkParticle | undefined;
    for (let i = 0; i < maxParticles; i++) {
      if (!pool[i].active) {
        target = pool[i];
        break;
      }
    }
    if (!target) {
      target = pool[Math.floor(Math.random() * maxParticles)];
    }

    target.active = true;
    target.x = x;
    target.y = y;
    target.z = z;
    target.vx = vx;
    target.vy = vy;
    target.vz = vz;
    target.r = color.r;
    target.g = color.g;
    target.b = color.b;
    target.life = 0;
    target.maxLife = maxLife;
    target.gravity = gravity;
    target.drag = drag;
    target.twinkle = twinkle;
  };

  // Launch a rising rocket
  const launchRocket = (
    targetX: number,
    targetY: number,
    targetZ: number,
    burstType: 'peony' | 'willow' | 'ring' | 'crackle' | 'kamuro',
    colorIdx: number
  ) => {
    const rocket = rockets.current.find((r) => !r.active);
    if (!rocket) return;

    rocket.active = true;
    rocket.x = targetX + (Math.random() - 0.5) * 4;
    rocket.y = 1.0;
    rocket.z = targetZ;
    rocket.targetY = targetY;
    rocket.vy = 26 + Math.random() * 6;
    rocket.burstType = burstType;
    rocket.colorIndex = colorIdx;
  };

  // Detonate a burst into signature Diwali firework formations
  const detonateBurst = (rocket: Rocket) => {
    soundEngine.playFireworkExplosion();

    const baseColor = PALETTE[rocket.colorIndex % PALETTE.length];
    const speedMult = reducedMotion ? 0.55 : 1.0;
    const sparkCount = quality === 'low' ? 35 : quality === 'medium' ? 65 : 90;

    // Trigger subtle burst flash on distant horizon / fort
    if (burstLightRef.current && !reducedMotion) {
      burstLightRef.current.position.set(rocket.x, rocket.y, rocket.z);
      burstLightRef.current.color.copy(baseColor);
      burstLightIntensity.current = quality === 'low' ? 2.5 : 4.0;
    }

    switch (rocket.burstType) {
      case 'willow': {
        // Golden Weeping Willow (Zari Anar) — heavy weeping golden streamers
        const goldColor = PALETTE[0];
        const champagne = PALETTE[6];
        for (let i = 0; i < sparkCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const speed = (2.2 + Math.random() * 5.2) * speedMult;
          const col = i % 4 === 0 ? champagne : goldColor;

          spawnSpark(
            rocket.x,
            rocket.y,
            rocket.z,
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.cos(phi) + 1.2,
            speed * Math.sin(phi) * Math.sin(theta),
            col,
            2.2 + Math.random() * 0.8,
            -3.8,
            0.986,
            true
          );
        }
        break;
      }

      case 'ring': {
        // Saturn Double-Ring Burst (Outer Saturated Ring + Concentric Golden Core)
        const coreColor = PALETTE[0];
        const ringTiltAngle = 0.35;
        const cosTilt = Math.cos(ringTiltAngle);
        const sinTilt = Math.sin(ringTiltAngle);

        for (let i = 0; i < sparkCount; i++) {
          const angle = (i / sparkCount) * Math.PI * 2;
          const isOuterRing = i % 3 !== 0;
          const speed = (isOuterRing ? 6.5 + Math.random() * 1.5 : 2.2 + Math.random() * 1.2) * speedMult;
          const col = isOuterRing ? baseColor : coreColor;

          const rawX = Math.cos(angle) * speed;
          const rawY = Math.sin(angle) * speed * 0.85;
          const rawZ = (Math.random() - 0.5) * 1.2;

          spawnSpark(
            rocket.x,
            rocket.y,
            rocket.z,
            rawX,
            rawY * cosTilt - rawZ * sinTilt + 1.0,
            rawY * sinTilt + rawZ * cosTilt,
            col,
            1.4 + Math.random() * 0.4,
            -5.5,
            0.972,
            false
          );
        }
        break;
      }

      case 'crackle': {
        // Chrysanthemum Crackle Burst (Vibrant jewel core with scintillating gold crackles)
        for (let i = 0; i < sparkCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const speed = (4.0 + Math.random() * 8.0) * speedMult;
          const col = i % 2 === 0 ? baseColor : PALETTE[6];

          spawnSpark(
            rocket.x,
            rocket.y,
            rocket.z,
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.cos(phi) + 1.8,
            speed * Math.sin(phi) * Math.sin(theta),
            col,
            1.2 + Math.random() * 0.5,
            -6.5,
            0.965,
            true
          );
        }
        break;
      }

      case 'kamuro': {
        // Royal Brocade Crown (Kamuro) — expansive golden crown with cascading canopy
        const crownGold = PALETTE[0];
        const saffron = PALETTE[4];
        for (let i = 0; i < sparkCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 1.4 - 0.7);
          const speed = (3.5 + Math.random() * 6.5) * speedMult;
          const col = i % 3 === 0 ? saffron : crownGold;

          spawnSpark(
            rocket.x,
            rocket.y,
            rocket.z,
            speed * Math.sin(phi) * Math.cos(theta),
            Math.abs(speed * Math.cos(phi)) * 0.9 + 2.2,
            speed * Math.sin(phi) * Math.sin(theta),
            col,
            2.0 + Math.random() * 0.6,
            -4.5,
            0.982,
            true
          );
        }
        break;
      }

      case 'peony':
      default: {
        // Classic Spherical Floral Peony with Hot Radiant Core
        for (let i = 0; i < sparkCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const speed = (3.5 + Math.random() * 6.5) * speedMult;
          const isCore = i % 5 === 0;

          spawnSpark(
            rocket.x,
            rocket.y,
            rocket.z,
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.cos(phi) + 1.6,
            speed * Math.sin(phi) * Math.sin(theta),
            isCore ? PALETTE[6] : baseColor,
            1.3 + Math.random() * 0.5,
            -5.5,
            0.975,
            false
          );
        }
        break;
      }
    }
  };

  // Timing state for choreographed finale sequence
  const showStartTime = useRef<number | null>(null);
  const lastLaunchTime = useRef(0);
  const salvoCounter = useRef(0);

  useEffect(() => {
    if (active) {
      showStartTime.current = null;
      salvoCounter.current = 0;
    }
  }, [active]);

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute | undefined;
    const colAttr = geo.attributes.color as THREE.BufferAttribute | undefined;
    if (!posAttr || !colAttr) return;

    const positions = posAttr.array as Float32Array;
    const colors = colAttr.array as Float32Array;
    const pool = poolRef.current;
    if (!pool || pool.length === 0) return;

    const now = clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Fade burst light intensity
    if (burstLightRef.current) {
      if (burstLightIntensity.current > 0.05) {
        burstLightIntensity.current = THREE.MathUtils.lerp(
          burstLightIntensity.current,
          0,
          1 - Math.exp(-10 * safeDelta)
        );
        burstLightRef.current.intensity = burstLightIntensity.current;
      } else {
        burstLightRef.current.intensity = 0;
      }
    }

    if (active) {
      if (showStartTime.current === null) {
        showStartTime.current = now;
      }
      const elapsed = now - showStartTime.current;

      // Choreographed launch timing: introductory rhythm, escalating pace, climax barrage
      const interval = elapsed < 4 ? 1.3 : elapsed < 10 ? 0.95 : elapsed < 16 ? 0.7 : 1.2;

      if (now - lastLaunchTime.current > interval) {
        lastLaunchTime.current = now;
        salvoCounter.current += 1;
        const s = salvoCounter.current;

        // Position across the fairground sky and northern fort skyline (X: -22 to 22, Z: 8 to 32)
        const rx = ((s % 5) - 2) * 9 + (Math.random() - 0.5) * 5;
        const rz = 8 + (s % 4) * 7 + (Math.random() - 0.5) * 4;
        const ry = 19 + Math.random() * 9;

        const burstTypes: Array<'peony' | 'willow' | 'ring' | 'crackle' | 'kamuro'> = [
          'peony',
          'willow',
          'ring',
          'crackle',
          'kamuro',
        ];
        const chosenType = burstTypes[s % burstTypes.length];
        launchRocket(rx, ry, rz, chosenType, s);

        // Climax barrage launches extra synchronized rocket
        if (elapsed >= 10 && elapsed < 16) {
          const rx2 = -rx * 0.75;
          launchRocket(rx2, ry + 2, rz + 6, s % 2 === 0 ? 'kamuro' : 'willow', s + 3);
        }
      }
    }

    // 1. UPDATE ASCENDING ROCKETS & TRAIL PARTICLES
    rockets.current.forEach((r) => {
      if (!r.active) return;

      r.y += r.vy * safeDelta;
      r.vy -= 14 * safeDelta;

      // Ascending golden tail sparks
      if (!reducedMotion) {
        spawnSpark(
          r.x + (Math.random() - 0.5) * 0.25,
          r.y - 0.25,
          r.z + (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.5,
          -1.8,
          (Math.random() - 0.5) * 0.5,
          PALETTE[0],
          0.3,
          -4.0,
          0.95,
          true
        );
      }

      // Detonate upon reaching peak altitude or target height
      if (r.y >= r.targetY || r.vy <= 0) {
        r.active = false;
        detonateBurst(r);
      }
    });

    // 2. UPDATE ACTIVE PARTICLES BUFFER ATTRIBUTES
    for (let i = 0; i < maxParticles; i++) {
      const p = pool[i];
      if (!p.active) {
        positions[i * 3 + 1] = -1000;
        continue;
      }

      p.life += safeDelta;
      if (p.life >= p.maxLife) {
        p.active = false;
        positions[i * 3 + 1] = -1000;
        continue;
      }

      // Physics integration
      p.vy += p.gravity * safeDelta;
      p.vx *= p.drag;
      p.vz *= p.drag;

      p.x += p.vx * safeDelta;
      p.y += p.vy * safeDelta;
      p.z += p.vz * safeDelta;

      const t = p.life / p.maxLife;

      // Pyrotechnic color & temperature curve:
      // Superheated white-hot ignition for first 12% of burn, transitioning to jewel tone
      let r = p.r;
      let g = p.g;
      let b = p.b;

      if (t < 0.12) {
        const heat = 1.0 - t / 0.12;
        r = THREE.MathUtils.lerp(r, 1.0, heat * 0.7);
        g = THREE.MathUtils.lerp(g, 0.98, heat * 0.7);
        b = THREE.MathUtils.lerp(b, 0.85, heat * 0.7);
      }

      let alpha = Math.max(0, 1.0 - Math.pow(t, 1.3));
      if (p.twinkle) {
        const freq = reducedMotion ? 4.0 : 26.0;
        alpha *= 0.75 + 0.25 * Math.sin(p.life * freq + i * 1.8);
      }

      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      colors[i * 3] = r * alpha;
      colors[i * 3 + 1] = g * alpha;
      colors[i * 3 + 2] = b * alpha;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <>
        <pointLight
          ref={burstLightRef}
          position={[0, 22, 18]}
          intensity={0}
          distance={70}
          decay={1.6}
        />
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[initialPositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[initialColors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={quality === 'low' ? 1.4 : quality === 'medium' ? 1.8 : 2.2}
            map={sparkTexture ?? undefined}
            vertexColors
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
    </>
  );
};
