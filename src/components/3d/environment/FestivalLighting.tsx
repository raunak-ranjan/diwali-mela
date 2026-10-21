import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';

export const FestivalLighting = () => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);

  // Subtle natural celestial breathing of moonlight
  useFrame(({ clock }) => {
    if (moonLightRef.current) {
      const t = clock.getElapsedTime();
      moonLightRef.current.intensity = 0.38 + Math.sin(t * 0.4) * 0.04;
    }
  });

  return (
    <>
      {/* Traditional Indian Festival Midnight Sky & Atmospheric Fog */}
      {/* Deep indigo background with fog starting at 22m to keep walkable stalls and plaza crisp */}
      <color attach="background" args={['#060814']} />
      <fog attach="fog" args={['#060814', 22, 95]} />

      {/* Ambient festive illumination: warm saffron/amber sky bounce with deep cool midnight ground shadows */}
      <hemisphereLight
        color="#ffb066"
        groundColor="#0b0e24"
        intensity={quality === 'low' ? 0.48 : 0.38}
      />

      {/* Subtle warm ambient fill so shadowed crevices retain rich terracotta and sandalwood warmth */}
      <ambientLight
        color="#ff9436"
        intensity={quality === 'low' ? 0.28 : 0.16}
      />

      {/* Moon / Night sky cool silvery-blue directional light casting soft architectural shadows */}
      <directionalLight
        ref={moonLightRef}
        position={[28, 42, -18]}
        intensity={0.38}
        color="#9ec2f7"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0003}
      />

      {/* --- STRATEGIC WARM FESTIVAL POINT LIGHTS --- */}

      {/* 1. Grand Entrance Toran Archway lantern glow */}
      <pointLight
        position={[0, 5.5, -24.5]}
        color="#f59e0b"
        intensity={quality === 'low' ? 1.8 : 2.4}
        distance={18}
        decay={2}
      />

      {/* 2. Walkway Pedestrian Light (between Entrance & Central Plaza) */}
      <pointLight
        position={[0, 3.8, -12]}
        color="#ffaa3b"
        intensity={quality === 'low' ? 1.4 : 1.9}
        distance={16}
        decay={2}
      />

      {/* 3. Central Rangoli Plaza (grounded near Akhand Jyoti to illuminate floor patterns) */}
      <pointLight
        position={[0, 2.2, 0]}
        color="#ff9224"
        intensity={quality === 'low' ? 2.0 : 2.8}
        distance={22}
        decay={2}
      />

      {/* 4. Food & Sweets Bazaar (warm Halwai saffron illumination) */}
      <pointLight
        position={[-11.5, 3.2, 7.5]}
        color="#f97316"
        intensity={quality === 'low' ? 1.5 : 2.1}
        distance={18}
        decay={2}
      />

      {/* 5. Handicrafts & Akash Kandils Lane (active on medium/high) */}
      {quality !== 'low' && (
        <pointLight
          position={[-11.5, 3.2, -8.5]}
          color="#fb923c"
          intensity={1.7}
          distance={16}
          decay={2}
        />
      )}

      {/* 6. Carnival Games Booth (warm golden festive carnival light) */}
      <pointLight
        position={[11.5, 3.2, 6]}
        color="#fbbf24"
        intensity={quality === 'low' ? 1.5 : 2.0}
        distance={18}
        decay={2}
      />

      {/* 7. Cultural Sangeet Stage (active on medium/high) */}
      {quality !== 'low' && (
        <pointLight
          position={[0, 3.8, 33]}
          color="#fde047"
          intensity={1.8}
          distance={18}
          decay={2}
        />
      )}
    </>
  );
};
