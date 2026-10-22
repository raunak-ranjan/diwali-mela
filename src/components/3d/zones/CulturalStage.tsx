import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';
import { useGameStore } from '../../../stores/useGameStore';

export const CulturalStage = () => {
  const openModal = useGameStore((s) => s.openModal);
  const isPlayingMusic = useGameStore((s) => s.culturalStageState.isPlayingMusic);
  const lightingTheme = useGameStore((s) => s.culturalStageState.lightingTheme);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  useEffect(() => {
    // Collision for stage at North end: X: [-9, 9], Z: [32, 42]
    collisionSystem.registerBox('cultural_stage', -9, 9, 32, 42);

    // Register interaction prompt
    interactionRegistry.register({
      id: 'cultural_performance_stage',
      position: [0, 1.0, 30.5],
      radius: 4.0,
      label: 'Diwali Cultural Sangeet Stage',
      sublabel: 'Live Traditional Ragas & Concert Experience',
      actionType: 'stage',
      onInteract: () => {
        openModal('stage');
      },
    });

    return () => {
      interactionRegistry.unregister('cultural_performance_stage');
    };
  }, [openModal]);

  // Stage Spotlight movement and animated concert lighting
  useFrame(({ clock }) => {
    if (spotlightRef.current) {
      const t = clock.getElapsedTime();
      if (isPlayingMusic) {
        // Dynamic concert spotlight sweep
        spotlightRef.current.position.x = Math.sin(t * 2.2) * 6;
        spotlightRef.current.position.z = -2 + Math.cos(t * 1.8) * 1.5;
        spotlightRef.current.intensity = 4.5 + Math.sin(t * 4.0) * 1.5;

        // Theme colors
        if (lightingTheme === 'peacock') {
          spotlightRef.current.color.set(Math.sin(t) > 0 ? '#06b6d4' : '#d946ef');
        } else if (lightingTheme === 'saffron') {
          spotlightRef.current.color.set(Math.sin(t) > 0 ? '#ea580c' : '#fbbf24');
        } else {
          spotlightRef.current.color.set('#fef08a');
        }
      } else {
        spotlightRef.current.position.x = Math.sin(t * 0.8) * 2;
        spotlightRef.current.position.z = -2;
        spotlightRef.current.intensity = 2.5;
        spotlightRef.current.color.set('#fef08a');
      }
    }
  });

  return (
    <group position={[0, 0, 37]}>
      {/* Elevated Wooden Stage Platform */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 1.2, 9]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>

      {/* Stage Front Steps */}
      <mesh position={[0, 0.25, -4.8]} receiveShadow>
        <boxGeometry args={[6, 0.5, 1.2]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>

      {/* Decorative Jharokha Backdrop Wall */}
      <mesh position={[0, 4.2, 4.2]} castShadow>
        <boxGeometry args={[16, 6.0, 0.6]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.7} />
      </mesh>

      {/* Golden Rajasthani Arch cutouts */}
      {[-4.5, 0, 4.5].map((x, idx) => (
        <group key={idx} position={[x, 4.5, 4.4]}>
          <mesh>
            <cylinderGeometry args={[1.5, 1.5, 0.1, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#b45309"
              emissiveIntensity={0.5}
              roughness={0.4}
              metalness={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Stage Drapes (Festive Crimson & Gold Fabric) */}
      <mesh position={[-7.5, 4.2, 3.8]}>
        <boxGeometry args={[1.2, 6.0, 0.4]} />
        <meshStandardMaterial color="#991b1b" roughness={0.5} />
      </mesh>
      <mesh position={[7.5, 4.2, 3.8]}>
        <boxGeometry args={[1.2, 6.0, 0.4]} />
        <meshStandardMaterial color="#991b1b" roughness={0.5} />
      </mesh>

      {/* Indian Classical Instruments on Carpet */}
      {/* Red Carpet */}
      <mesh position={[0, 1.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#881337" roughness={0.9} />
      </mesh>

      {/* Dhol (Traditional double-headed festival drum) */}
      <group position={[-2.5, 1.6, 0]} rotation={[0, 0.4, 0]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 1.1, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        {/* Leather Drum heads */}
        <mesh position={[-0.56, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 16]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
        <mesh position={[0.56, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 16]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
      </group>

      {/* Tabla Pair (Bayan and Dayan) */}
      <group position={[1.8, 1.4, 0]}>
        {/* Bayan (Bass metal drum) */}
        <mesh position={[-0.35, 0, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Dayan (Treble wooden drum) */}
        <mesh position={[0.35, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.45, 16]} />
          <meshStandardMaterial color="#92400e" roughness={0.5} />
        </mesh>
      </group>

      {/* Dynamic Stage Spotlight */}
      <spotLight
        ref={spotlightRef}
        position={[0, 9, -2]}
        target-position={[0, 1.5, 0]}
        color="#fef08a"
        intensity={3.0}
        angle={0.6}
        penumbra={0.5}
        castShadow
      />
    </group>
  );
};
