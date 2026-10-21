import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';

export const FestivalLighting = () => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);

  // Subtle breathing moonlight
  useFrame(({ clock }) => {
    if (moonLightRef.current) {
      const t = clock.getElapsedTime();
      moonLightRef.current.intensity = 0.4 + Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <>
      {/* Night Sky Fog */}
      <color attach="background" args={['#070a14']} />
      <fog attach="fog" args={['#070a14', 12, 75]} />

      {/* Ambient festive sky / ground warmth */}
      <hemisphereLight
        color="#fdba74"
        groundColor="#1e1b4b"
        intensity={0.35}
      />

      {/* Moon / Night sky cool directional light */}
      <directionalLight
        ref={moonLightRef}
        position={[25, 40, -20]}
        intensity={0.4}
        color="#93c5fd"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0005}
      />

      {/* Warm golden central plaza festival lantern fill */}
      <pointLight
        position={[0, 7, 0]}
        color="#ffaa33"
        intensity={ quality === 'low' ? 1.5 : 2.5}
        distance={28}
        decay={2}
      />

      {/* Entrance Gate illumination */}
      <pointLight
        position={[0, 6, -24]}
        color="#f59e0b"
        intensity={2.2}
        distance={20}
        decay={2}
      />

      {/* Food street warm light */}
      <pointLight
        position={[-14, 5, 8]}
        color="#f97316"
        intensity={1.8}
        distance={18}
        decay={2}
      />

      {/* Carnival mini-games warm glow */}
      <pointLight
        position={[14, 5, 8]}
        color="#fbbf24"
        intensity={1.8}
        distance={18}
        decay={2}
      />
    </>
  );
};
