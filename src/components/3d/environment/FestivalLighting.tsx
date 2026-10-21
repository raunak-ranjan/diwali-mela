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
      moonLightRef.current.intensity = 0.82 + Math.sin(t * 0.4) * 0.05;
    }
  });

  return (
    <>
      {/* Traditional Indian Festival Midnight Sky & Atmospheric Fog */}
      {/* Deep indigo background with fog starting at 35m to keep fairground architecture clear */}
      <color attach="background" args={['#070a1a']} />
      <fog attach="fog" args={['#070a1a', 35, 120]} />

      {/* Ambient festive illumination: warm saffron/amber sky bounce with deep cool midnight ground fill */}
      <hemisphereLight
        color="#ffd8a8" // Warm radiant festive sky glow
        groundColor="#253050" // Cool midnight ambient fill
        intensity={quality === 'low' ? 0.95 : 0.82}
      />

      {/* Warm ambient fill so sandstone architecture, ground, and stalls retain rich readable color */}
      <ambientLight
        color="#ffaa55"
        intensity={quality === 'low' ? 0.65 : 0.48}
      />

      {/* Moon / Night sky cool silvery-blue directional light casting soft architectural shadows */}
      <directionalLight
        ref={moonLightRef}
        position={[42, 28, -16]}
        intensity={0.82}
        color="#bcd7ff"
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
      {/* Soft natural decay (1.2) creates wide, radiant pools of festival lantern light */}

      {/* 1. Grand Entrance Toran Archway lantern glow */}
      <pointLight
        position={[0, 5.0, -23.5]}
        color="#ffaa33"
        intensity={quality === 'low' ? 5.5 : 7.5}
        distance={28}
        decay={1.2}
      />

      {/* 2. Walkway Pedestrian Light (between Entrance & Central Plaza) */}
      <pointLight
        position={[0, 4.0, -10]}
        color="#ffb84d"
        intensity={quality === 'low' ? 4.8 : 6.5}
        distance={26}
        decay={1.2}
      />

      {/* 3. Central Rangoli Plaza (grounded near Akhand Jyoti to illuminate floor patterns) */}
      <pointLight
        position={[0, 2.5, 0]}
        color="#ff9922"
        intensity={quality === 'low' ? 6.5 : 9.0}
        distance={32}
        decay={1.2}
      />

      {/* 4. Food & Sweets Bazaar (warm Halwai saffron illumination) */}
      <pointLight
        position={[-12.5, 3.5, 7.5]}
        color="#f97316"
        intensity={quality === 'low' ? 5.0 : 7.0}
        distance={26}
        decay={1.2}
      />

      {/* 5. Handicrafts & Akash Kandils Lane */}
      <pointLight
        position={[-12.5, 3.5, -8.5]}
        color="#fb923c"
        intensity={quality === 'low' ? 4.8 : 6.5}
        distance={24}
        decay={1.2}
      />

      {/* 6. Carnival Games Booth (warm golden festive carnival light) */}
      <pointLight
        position={[12.5, 3.5, 6]}
        color="#fbbf24"
        intensity={quality === 'low' ? 4.8 : 6.5}
        distance={24}
        decay={1.2}
      />

      {/* 7. Cultural Sangeet Stage */}
      <pointLight
        position={[0, 4.2, 33]}
        color="#fde047"
        intensity={quality === 'low' ? 5.0 : 7.0}
        distance={28}
        decay={1.2}
      />

      {/* 8. Welcoming Entrance Approach Promenade */}
      <pointLight
        position={[0, 4.0, -32]}
        color="#ffaa33"
        intensity={quality === 'low' ? 4.5 : 6.0}
        distance={26}
        decay={1.2}
      />
    </>
  );
};
