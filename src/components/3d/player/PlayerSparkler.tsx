import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';

// Deterministic festival pyrotechnic spark particles
const STATIC_SPARKS = Array.from({ length: 24 }).map((_, i) => {
  const theta = (i / 24) * Math.PI * 2;
  const phi = (((i * 7) % 11) / 11) * Math.PI;
  const speed = 0.2 + ((i * 3) % 7) * 0.05;
  return {
    vx: Math.sin(phi) * Math.cos(theta) * speed,
    vy: Math.sin(phi) * Math.sin(theta) * speed,
    vz: Math.cos(phi) * speed,
    r: 1.0,
    g: 0.82 + ((i * 5) % 4) * 0.04,
    b: 0.22 + ((i * 3) % 5) * 0.05,
  };
});

export const PlayerSparkler: React.FC = () => {
  const sparklerActiveUntil = useGameStore((s) => s.sparklerActiveUntil);
  const stopSparkler = useGameStore((s) => s.stopSparkler);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const pointsRef = useRef<THREE.Points>(null);

  // Responsive particle density (10 for reduced-motion, 24 for default)
  const particleCount = reducedMotion ? 10 : 24;

  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const spark = STATIC_SPARKS[i % STATIC_SPARKS.length];
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      vel[i * 3] = spark.vx;
      vel[i * 3 + 1] = spark.vy;
      vel[i * 3 + 2] = spark.vz;

      col[i * 3] = spark.r;
      col[i * 3 + 1] = spark.g;
      col[i * 3 + 2] = spark.b;
    }
    return [pos, vel, col];
  }, [particleCount]);

  useFrame((_state, delta) => {
    if (!sparklerActiveUntil) return;
    const now = Date.now();
    if (now >= sparklerActiveUntil) {
      stopSparkler();
      return;
    }

    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      if (!posAttr) return;
      const posArray = posAttr.array as Float32Array;
      const speed = reducedMotion ? 0.3 : 1.0;

      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i * 3] * delta * speed;
        posArray[i * 3 + 1] += velocities[i * 3 + 1] * delta * speed - 0.2 * delta; // gentle gravity
        posArray[i * 3 + 2] += velocities[i * 3 + 2] * delta * speed;

        const distSq =
          posArray[i * 3] ** 2 +
          posArray[i * 3 + 1] ** 2 +
          posArray[i * 3 + 2] ** 2;

        if (distSq > 0.35) {
          posArray[i * 3] = (((i * 7) % 5) - 2) * 0.008;
          posArray[i * 3 + 1] = (((i * 3) % 5) - 2) * 0.008;
          posArray[i * 3 + 2] = (((i * 11) % 5) - 2) * 0.008;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  if (!sparklerActiveUntil) return null;

  return (
    <group position={[0.38, 0.95, 0.2]}>
      {/* Sparkler Metallic Wire Core */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.24, 6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Burning Incandescent Pyrotechnic Tip */}
      <mesh position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffd700"
          emissiveIntensity={reducedMotion ? 2.5 : 4.5}
          toneMapped={false}
        />
      </mesh>

      {/* Warm Golden Illumination */}
      <pointLight
        color="#fbbf24"
        intensity={reducedMotion ? 2.2 : 3.8}
        distance={7.0}
        decay={1.5}
      />

      {/* Sparkling Particle Stars */}
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
          size={reducedMotion ? 0.05 : 0.075}
          vertexColors
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
