import React, { useRef, useMemo, useEffect } from 'react';
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
  burstType: 'peony' | 'willow' | 'ring' | 'crackle';
  colorIndex: number;
}

// Traditional Diwali Palette optimized for midnight indigo contrast
const PALETTE = [
  new THREE.Color('#FFD700'), // Pure Gold
  new THREE.Color('#FF1744'), // Gulal Crimson
  new THREE.Color('#00E5FF'), // Peacock Turquoise
  new THREE.Color('#00E676'), // Festive Emerald
  new THREE.Color('#FF9100'), // Warm Saffron
  new THREE.Color('#D500F9'), // Royal Magenta
  new THREE.Color('#FFE082'), // Champagne Spark
];

export const FireworksShow: React.FC<{ active: boolean }> = ({ active }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  // Budget particles based on graphics tier
  const maxParticles = quality === 'high' ? 1200 : quality === 'medium' ? 800 : 450;

  // Pre-allocated flat buffers
  const { positions, colors, pool } = useMemo(() => {
    const pos = new Float32Array(maxParticles * 3);
    const col = new Float32Array(maxParticles * 3);
    const p: SparkParticle[] = [];

    for (let i = 0; i < maxParticles; i++) {
      pos[i * 3 + 1] = -1000; // Initialize out of sight
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

    return { positions: pos, colors: col, pool: p };
  }, [maxParticles]);

  // Pre-allocated rockets pool
  const rockets = useRef<Rocket[]>([
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'peony', colorIndex: 0 },
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'willow', colorIndex: 0 },
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'ring', colorIndex: 0 },
    { active: false, x: 0, y: 0, z: 0, vy: 0, targetY: 28, burstType: 'crackle', colorIndex: 0 },
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
    gravity: number = -6.0,
    drag: number = 0.975,
    twinkle: boolean = false
  ) => {
    // Find inactive or oldest particle
    let target = pool.find((p) => !p.active);
    if (!target) {
      // Overwrite first expired
      target = pool[Math.floor(Math.random() * pool.length)];
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
    burstType: 'peony' | 'willow' | 'ring' | 'crackle',
    colorIdx: number
  ) => {
    const rocket = rockets.current.find((r) => !r.active);
    if (!rocket) return;

    rocket.active = true;
    rocket.x = targetX + (Math.random() - 0.5) * 4;
    rocket.y = 1.0; // Launch from ground / horizon
    rocket.z = targetZ;
    rocket.targetY = targetY;
    rocket.vy = 26 + Math.random() * 6; // Ascending speed
    rocket.burstType = burstType;
    rocket.colorIndex = colorIdx;
  };

  // Detonate a burst into signature Diwali firework formations
  const detonateBurst = (rocket: Rocket) => {
    soundEngine.playFireworkExplosion();

    const baseColor = PALETTE[rocket.colorIndex % PALETTE.length];
    const speedMult = reducedMotion ? 0.55 : 1.0;
    const sparkCount = quality === 'low' ? 35 : quality === 'medium' ? 65 : 90;

    switch (rocket.burstType) {
      case 'willow': {
        // Golden Weeping Willow (Zari Anar) — heavy trailing golden sparks
        const goldColor = PALETTE[0];
        for (let i = 0; i < sparkCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const speed = (2.5 + Math.random() * 5.5) * speedMult;

          spawnSpark(
            rocket.x,
            rocket.y,
            rocket.z,
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.cos(phi) + 1.5,
            speed * Math.sin(phi) * Math.sin(theta),
            goldColor,
            1.8 + Math.random() * 0.8, // Long hang time
            -4.5, // Gentle gravity weep
            0.985,
            true // Twinkle on descent
          );
        }
        break;
      }

      case 'ring': {
        // Saturn Double-Ring Burst (Outer Ring + Inner Core)
        const coreColor = PALETTE[0]; // Gold core
        for (let i = 0; i < sparkCount; i++) {
          const angle = (i / sparkCount) * Math.PI * 2;
          const isOuterRing = i % 3 !== 0;
          const speed = (isOuterRing ? 6.5 + Math.random() * 1.5 : 2.0 + Math.random() * 1.5) * speedMult;
          const col = isOuterRing ? baseColor : coreColor;

          spawnSpark(
            rocket.x,
            rocket.y,
            rocket.z,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed * 0.4 + 1.0,
            (Math.random() - 0.5) * 1.5,
            col,
            1.3 + Math.random() * 0.5,
            -6.0,
            0.97,
            false
          );
        }
        break;
      }

      case 'crackle': {
        // Chrysanthemum Crackle Burst
        for (let i = 0; i < sparkCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const speed = (4.0 + Math.random() * 8.0) * speedMult;

          spawnSpark(
            rocket.x,
            rocket.y,
            rocket.z,
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.cos(phi) + 2.0,
            speed * Math.sin(phi) * Math.sin(theta),
            i % 2 === 0 ? baseColor : PALETTE[6],
            1.1 + Math.random() * 0.6,
            -7.0,
            0.96,
            true
          );
        }
        break;
      }

      case 'peony':
      default: {
        // Classic spherical Peony
        for (let i = 0; i < sparkCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const speed = (3.5 + Math.random() * 6.5) * speedMult;

          spawnSpark(
            rocket.x,
            rocket.y,
            rocket.z,
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.cos(phi) + 1.8,
            speed * Math.sin(phi) * Math.sin(theta),
            baseColor,
            1.2 + Math.random() * 0.6,
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
    const now = clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    if (active) {
      if (showStartTime.current === null) {
        showStartTime.current = now;
      }
      const elapsed = now - showStartTime.current;

      // Choreographed launch timing
      const interval = elapsed < 4 ? 1.2 : elapsed < 10 ? 1.0 : elapsed < 16 ? 0.75 : 1.3;

      if (now - lastLaunchTime.current > interval) {
        lastLaunchTime.current = now;
        salvoCounter.current += 1;
        const s = salvoCounter.current;

        // Choose position across the northern fort skyline (X: -24 to 24, Z: 20 to 50)
        const rx = ((s % 5) - 2) * 11 + (Math.random() - 0.5) * 6;
        const rz = 25 + Math.random() * 25;
        const ry = 25 + Math.random() * 12;

        const burstTypes: Array<'peony' | 'willow' | 'ring' | 'crackle'> = [
          'peony',
          'willow',
          'ring',
          'crackle',
        ];
        const chosenType = burstTypes[s % burstTypes.length];
        launchRocket(rx, ry, rz, chosenType, s);

        // Climax barrage launches extra simultaneous rocket!
        if (elapsed >= 10 && elapsed < 16) {
          const rx2 = -rx * 0.8;
          launchRocket(rx2, ry + 3, rz, 'willow', s + 2);
        }
      }
    }

    // 1. UPDATE ASCENDING ROCKETS & TRAIL PARTICLES
    rockets.current.forEach((r) => {
      if (!r.active) return;

      r.y += r.vy * safeDelta;
      r.vy -= 14 * safeDelta; // Gravity deceleration on ascent

      // Trail spark
      if (!reducedMotion) {
        spawnSpark(
          r.x + (Math.random() - 0.5) * 0.3,
          r.y - 0.3,
          r.z + (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.6,
          -2.0,
          (Math.random() - 0.5) * 0.6,
          PALETTE[0], // Gold trail
          0.35,
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
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;

    for (let i = 0; i < pool.length; i++) {
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

      // Natural fading and scintillating twinkle
      let alpha = 1.0 - p.life / p.maxLife;
      if (p.twinkle) {
        alpha *= 0.75 + 0.25 * Math.sin(p.life * 28 + i * 2);
      }

      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      colors[i * 3] = p.r * alpha;
      colors[i * 3 + 1] = p.g * alpha;
      colors[i * 3 + 2] = p.b * alpha;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={quality === 'low' ? 0.75 : 0.85}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
