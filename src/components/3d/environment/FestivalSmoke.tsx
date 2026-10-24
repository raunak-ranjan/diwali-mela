import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';
import { windCoordinator } from '../../../systems/windCoordinator';

interface SmokeParticle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  speed: number;
  curlSpeed: number;
  curlAmp: number;
  phase: number;
  maxY: number;
  r: number;
  g: number;
  b: number;
}

// Generate smooth soft gaussian radial texture for realistic incense/diya smoke
const createSmokeTexture = (): THREE.CanvasTexture | null => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(245, 235, 220, 0.85)');
  grad.addColorStop(0.3, 'rgba(230, 215, 195, 0.5)');
  grad.addColorStop(0.65, 'rgba(200, 190, 180, 0.18)');
  grad.addColorStop(1, 'rgba(180, 170, 160, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
};

// Key traditional festival points where holy dhoop/incense and aromatic steam naturally rise
const SMOKE_EMITTERS = [
  { x: -12.5, y: 0.5, z: 6.0, rad: 0.4, r: 0.95, g: 0.85, b: 0.7 }, // Bazaar Samosa Kadhai / Halwai steam
  { x: 0, y: 0.8, z: 0, rad: 0.3, r: 1.0, g: 0.9, b: 0.75 }, // Central Akhand Jyoti sacred incense
  { x: -2.5, y: 0.4, z: -22.5, rad: 0.35, r: 0.9, g: 0.8, b: 0.7 }, // Grand Entrance Aarti Dhoop burner
  { x: 2.5, y: 0.4, z: -22.5, rad: 0.35, r: 0.9, g: 0.8, b: 0.7 }, // Grand Entrance Aarti Dhoop burner
];

const createSmokeParticles = (count: number): SmokeParticle[] => {
  const particles: SmokeParticle[] = [];

  for (let i = 0; i < count; i++) {
    const emitter = SMOKE_EMITTERS[i % SMOKE_EMITTERS.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * emitter.rad;
    const bx = emitter.x + Math.cos(angle) * dist;
    const bz = emitter.z + Math.sin(angle) * dist;
    const by = emitter.y;
    const maxY = by + 2.2 + Math.random() * 1.6;
    const y = by + Math.random() * (maxY - by);

    particles.push({
      x: bx,
      y,
      z: bz,
      baseX: bx,
      baseY: by,
      baseZ: bz,
      speed: 0.22 + Math.random() * 0.25,
      curlSpeed: 1.4 + Math.random() * 1.8,
      curlAmp: 0.12 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
      maxY,
      r: emitter.r,
      g: emitter.g,
      b: emitter.b,
    });
  }

  return particles;
};

export const FestivalSmoke: React.FC = () => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  // Scaled budget: 24 particles on low, 40 on medium, 56 on high
  const count = quality === 'low' ? 24 : quality === 'medium' ? 40 : 56;

  const smokeTexture = useMemo(() => createSmokeTexture(), []);

  useEffect(() => {
    return () => {
      smokeTexture?.dispose();
    };
  }, [smokeTexture]);

  const initialPositions = useMemo(() => new Float32Array(count * 3), [count]);
  const initialColors = useMemo(() => new Float32Array(count * 3), [count]);

  const particlesRef = useRef<SmokeParticle[]>([]);
  const pointsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    particlesRef.current = createSmokeParticles(count);
  }, [count]);

  // Animate gentle upward curl and wind drift
  useFrame(({ clock }, delta) => {
    const list = particlesRef.current;
    if (!pointsRef.current || list.length === 0) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute | undefined;
    const colAttr = geo.attributes.color as THREE.BufferAttribute | undefined;
    if (!posAttr || !colAttr) return;

    const posArray = posAttr.array as Float32Array;
    const colArray = colAttr.array as Float32Array;

    const safeDelta = Math.min(delta, 0.05);
    const time = clock.getElapsedTime();
    const wind = windCoordinator.getWind();

    for (let i = 0; i < list.length; i++) {
      const p = list[i];

      if (!reducedMotion) {
        p.y += p.speed * safeDelta;
        // Drift with wind as smoke rises
        const riseFactor = (p.y - p.baseY) / (p.maxY - p.baseY);
        p.x += wind.x * 0.12 * safeDelta * riseFactor;
        p.z += wind.z * 0.12 * safeDelta * riseFactor;

        if (p.y > p.maxY) {
          p.y = p.baseY;
          p.x = p.baseX + (Math.random() - 0.5) * 0.2;
          p.z = p.baseZ + (Math.random() - 0.5) * 0.2;
        }
      }

      // Elegant helical curl
      const curlX = p.x + Math.sin(time * p.curlSpeed + p.phase) * p.curlAmp;
      const curlZ = p.z + Math.cos(time * p.curlSpeed * 0.8 + p.phase) * p.curlAmp;

      // Bell curve alpha fade: fades in gently near source, sustains, then dissolves into air
      const progress = Math.max(0, Math.min(1, (p.y - p.baseY) / (p.maxY - p.baseY)));
      const alpha = Math.sin(progress * Math.PI) * 0.45;

      posArray[i * 3] = curlX;
      posArray[i * 3 + 1] = p.y;
      posArray[i * 3 + 2] = curlZ;

      colArray[i * 3] = p.r * alpha;
      colArray[i * 3 + 1] = p.g * alpha;
      colArray[i * 3 + 2] = p.b * alpha;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
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
        size={quality === 'low' ? 0.65 : 0.85}
        map={smokeTexture ?? undefined}
        transparent
        blending={THREE.NormalBlending}
        depthWrite={false}
        vertexColors
        toneMapped={false}
      />
    </points>
  );
};
