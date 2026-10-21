import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';

export const PlayerCosmetics: React.FC = () => {
  const equipped = useGameStore((s) => s.cosmetics.equipped);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const auraRef = useRef<THREE.Group>(null);
  const companionRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Group>(null);
  const crownRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const speedMultiplier = reducedMotion ? 0.3 : 1.0;

    // 1. Swarna Aura: Slow majestic rotation and breathing scale
    if (auraRef.current && equipped === 'swarna_aura') {
      auraRef.current.rotation.y += delta * 0.8 * speedMultiplier;
      if (!reducedMotion) {
        const pulse = 1.0 + Math.sin(time * 2.5) * 0.06;
        auraRef.current.scale.set(pulse, 1, pulse);
      }
    }

    // 2. Deepam Companion: Gentle shoulder hovering and orbit
    if (companionRef.current && equipped === 'deepam_companion') {
      const hoverY = Math.sin(time * 2.0 * speedMultiplier) * 0.08;
      const orbitX = Math.cos(time * 1.2 * speedMultiplier) * 0.12;
      const orbitZ = Math.sin(time * 1.2 * speedMultiplier) * 0.12;
      companionRef.current.position.set(0.52 + orbitX, 1.48 + hoverY, -0.15 + orbitZ);
      companionRef.current.rotation.y += delta * 1.5 * speedMultiplier;
    }

    // 3. Genda Floral Trail: Cascading marigold blossoms rotating around avatar
    if (trailRef.current && equipped === 'genda_trail') {
      trailRef.current.rotation.y += delta * 1.2 * speedMultiplier;
      if (!reducedMotion) {
        const floatY = Math.sin(time * 3.0) * 0.04;
        trailRef.current.position.y = floatY;
      }
    }

    // 4. Surya Mukut: Auspicious solar crown floating above pagri
    if (crownRef.current && equipped === 'surya_mukut') {
      crownRef.current.rotation.y += delta * 0.5 * speedMultiplier;
      if (!reducedMotion) {
        const bob = Math.sin(time * 2.2) * 0.03;
        crownRef.current.position.y = 1.9 + bob;
      }
    }
  });

  if (!equipped) return null;

  return (
    <group name="player-active-cosmetics">
      {/* ── 1. SWARNA AURA (Golden Radiance Mandala) ── */}
      {equipped === 'swarna_aura' && (
        <group ref={auraRef} position={[0, 0.05, 0]}>
          {/* Outer glowing ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.72, 0.84, 32]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={2.5}
              roughness={0.2}
              metalness={0.8}
              side={THREE.DoubleSide}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Inner sacred petals (8-point golden star) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.52, 0.01, Math.sin(angle) * 0.52]}
                rotation={[-Math.PI / 2, 0, angle]}
              >
                <planeGeometry args={[0.16, 0.16]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#d97706"
                  emissiveIntensity={2.0}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* ── 2. DEEPAM COMPANION (Floating Sacred Diya) ── */}
      {equipped === 'deepam_companion' && (
        <group ref={companionRef} position={[0.52, 1.48, -0.15]}>
          {/* Miniature Golden Brass Diya Bowl */}
          <mesh castShadow>
            <cylinderGeometry args={[0.09, 0.05, 0.06, 12]} />
            <meshStandardMaterial
              color="#d97706"
              metalness={0.85}
              roughness={0.25}
              emissive="#92400e"
              emissiveIntensity={0.6}
            />
          </mesh>
          {/* Spout */}
          <mesh position={[0.07, 0.02, 0]}>
            <coneGeometry args={[0.04, 0.08, 8]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Flickering Teardrop Flame */}
          <mesh position={[0.03, 0.06, 0]}>
            <coneGeometry args={[0.035, 0.1, 8]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#f97316"
              emissiveIntensity={3.5}
              toneMapped={false}
            />
          </mesh>
          {/* Soft Festive Warm Glow */}
          <pointLight
            color="#ffaa33"
            intensity={1.1}
            distance={3.2}
            decay={1.5}
          />
        </group>
      )}

      {/* ── 3. GENDA FLORAL TRAIL (Marigold Blossom Garland) ── */}
      {equipped === 'genda_trail' && (
        <group ref={trailRef} position={[0, 0.12, 0]}>
          {/* 6 orbit points of auspicious marigold blossoms around the player */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 6;
            const r = 0.65;
            return (
              <group key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
                {/* Marigold center */}
                <mesh>
                  <sphereGeometry args={[0.065, 8, 8]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    emissive="#d97706"
                    emissiveIntensity={1.8}
                    roughness={0.7}
                  />
                </mesh>
                {/* Outer golden petals */}
                <mesh scale={[1.2, 0.6, 1.2]}>
                  <sphereGeometry args={[0.075, 6, 6]} />
                  <meshStandardMaterial
                    color="#f97316"
                    emissive="#ea580c"
                    emissiveIntensity={1.2}
                    roughness={0.8}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* ── 4. SURYA MUKUT (Solar Radiance Crown) ── */}
      {equipped === 'surya_mukut' && (
        <group ref={crownRef} position={[0, 1.9, 0]}>
          {/* Central golden solar disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.18, 0.22, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={2.8}
              metalness={0.9}
              roughness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* 12 Radiating Sunrays */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 12;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.26, 0, Math.sin(angle) * 0.26]}
                rotation={[0, 0, angle]}
              >
                <coneGeometry args={[0.02, 0.1, 4]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#eab308"
                  emissiveIntensity={3.0}
                  metalness={0.8}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};
