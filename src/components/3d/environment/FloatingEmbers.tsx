import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';

interface EmberParticle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseZ: number;
  speed: number;
  swaySpeed: number;
  swayAmp: number;
  phase: number;
  minY: number;
  maxY: number;
  r: number;
  g: number;
  b: number;
}

// Generate soft circular radial particle texture
const createSoftParticleTexture = (): THREE.CanvasTexture | null => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(255, 230, 150, 0.9)');
  grad.addColorStop(0.55, 'rgba(255, 130, 35, 0.45)');
  grad.addColorStop(0.85, 'rgba(240, 70, 15, 0.12)');
  grad.addColorStop(1, 'rgba(200, 40, 10, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
};

// Create initial particle objects
const createParticles = (count: number): EmberParticle[] => {
  const particles: EmberParticle[] = [];

  // Key Diwali festival focal zones where embers naturally drift from diyas, lanterns, and sweets
  const zones = [
    { x: 0, z: 0, rad: 5.5 }, // Central Rangoli Plaza & Akhand Jyoti
    { x: -12.5, z: 6, rad: 5.0 }, // West Food & Sweets Bazaar
    { x: -12.5, z: -8, rad: 5.0 }, // West Handicrafts Lane
    { x: 0, z: -22, rad: 5.2 }, // South Grand Entrance Threshold & Deepstambhs
    { x: 12.5, z: 6, rad: 4.8 }, // East Carnival Alley
    { x: 0, z: 28, rad: 5.0 }, // North Cultural Stage
  ];

  // Radiant warm festival palette: saffron, glowing amber, warm diya gold, vibrant spark
  const palette = [
    [1.0, 0.48, 0.1], // Warm Saffron
    [1.0, 0.74, 0.18], // Glowing Amber Gold
    [1.0, 0.88, 0.45], // Radiant Spark Gold
    [0.96, 0.35, 0.06], // Deep Diya Ember Orange
  ];

  for (let i = 0; i < count; i++) {
    const zone = zones[i % zones.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.sqrt(Math.random()) * zone.rad;
    const bx = zone.x + Math.cos(angle) * dist;
    const bz = zone.z + Math.sin(angle) * dist;
    const minY = 0.35 + Math.random() * 0.45;
    const maxY = 4.8 + Math.random() * 2.2;
    const y = minY + Math.random() * (maxY - minY);
    const color = palette[i % palette.length];

    particles.push({
      x: bx,
      y,
      z: bz,
      baseX: bx,
      baseZ: bz,
      speed: 0.35 + Math.random() * 0.45,
      swaySpeed: 1.2 + Math.random() * 1.5,
      swayAmp: 0.12 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2,
      minY,
      maxY,
      r: color[0],
      g: color[1],
      b: color[2],
    });
  }

  return particles;
};

export const FloatingEmbers: React.FC = () => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  // Scaled particle budget: 40 on low, 65 on medium, 85 on high
  const count = quality === 'low' ? 40 : quality === 'medium' ? 65 : 85;

  const emberTexture = useMemo(() => createSoftParticleTexture(), []);

  useEffect(() => {
    return () => {
      emberTexture?.dispose();
    };
  }, [emberTexture]);

  // Initial buffer allocations for buffer geometry
  const initialPositions = useMemo(() => new Float32Array(count * 3), [count]);
  const initialColors = useMemo(() => new Float32Array(count * 3), [count]);

  const particlesRef = useRef<EmberParticle[]>([]);
  const pointsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    particlesRef.current = createParticles(count);
  }, [count]);

  // Animate gentle upward drift and organic festive sway
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

    for (let i = 0; i < list.length; i++) {
      const p = list[i];

      if (!reducedMotion) {
        p.y += p.speed * safeDelta;
        if (p.y > p.maxY) {
          p.y = p.minY;
          // Spawn near base with slight variation
          p.x = p.baseX + (Math.random() - 0.5) * 1.6;
          p.z = p.baseZ + (Math.random() - 0.5) * 1.6;
        }
      }

      // Gentle organic sinusoidal sway in the festival evening air
      const currX = p.x + Math.sin(time * p.swaySpeed + p.phase) * p.swayAmp;
      const currZ = p.z + Math.cos(time * p.swaySpeed * 0.8 + p.phase) * p.swayAmp;

      // Soft sinusoidal alpha fade at floor and ceiling to prevent pop-in
      const progress = Math.max(0, Math.min(1, (p.y - p.minY) / (p.maxY - p.minY)));
      const fade = Math.sin(progress * Math.PI);

      posArray[i * 3] = currX;
      posArray[i * 3 + 1] = p.y;
      posArray[i * 3 + 2] = currZ;

      colArray[i * 3] = p.r * fade;
      colArray[i * 3 + 1] = p.g * fade;
      colArray[i * 3 + 2] = p.b * fade;
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
        size={quality === 'low' ? 0.32 : 0.42}
        map={emberTexture ?? undefined}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexColors
        toneMapped={false}
      />
    </points>
  );
};
