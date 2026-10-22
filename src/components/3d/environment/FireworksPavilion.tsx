import React, { useEffect } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';

export const FireworksPavilion: React.FC = () => {
  const openModal = useGameStore((s) => s.openModal);

  useEffect(() => {
    // Collision footing for the fireworks mortar plinth at [-7.5, -14.0]
    collisionSystem.registerBox('fireworks_pavilion_base', -9.0, -6.0, -15.5, -12.5);

    // Register interaction prompt
    interactionRegistry.register({
      id: 'fireworks_pavilion',
      position: [-7.5, 1.0, -14.0],
      radius: 3.5,
      label: 'Diwali Sky Fireworks Pavilion',
      sublabel: 'Launch Rockets & Grand Aerial Show',
      actionType: 'fireworks',
      onInteract: () => {
        openModal('fireworks');
      },
    });

    return () => {
      interactionRegistry.unregister('fireworks_pavilion');
    };
  }, [openModal]);

  return (
    <group position={[-7.5, 0, -14.0]}>
      {/* Ornate Sandstone Platform Base */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.5, 2.6]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>

      {/* Polished Teakwood Mortar Rack Frame */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.3, 2.2]} />
        <meshStandardMaterial color="#451a03" roughness={0.6} />
      </mesh>

      {/* 5 Brass Mortar Launch Tubes angled skyward */}
      {[
        [-0.6, -0.6, 0.15],
        [0.6, -0.6, -0.15],
        [0.0, 0.0, 0.0],
        [-0.6, 0.6, 0.15],
        [0.6, 0.6, -0.15],
      ].map(([mx, mz, tiltX], idx) => (
        <group key={idx} position={[mx, 0.8, mz]} rotation={[tiltX, 0, 0.1]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.14, 1.1, 12]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
          {/* Mortar inner bore rim */}
          <mesh position={[0, 0.56, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Subtle spark glint */}
          <mesh position={[0, 0.58, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      ))}

      {/* Decorative Traditional Brass Diya at each corner */}
      {[
        [-1.1, -1.1],
        [1.1, -1.1],
        [-1.1, 1.1],
        [1.1, 1.1],
      ].map(([dx, dz], idx) => (
        <group key={idx} position={[dx, 0.55, dz]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.06, 0.08, 8]} />
            <meshStandardMaterial color="#b45309" roughness={0.4} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <coneGeometry args={[0.04, 0.1, 8]} />
            <meshStandardMaterial
              color="#fff7d6"
              emissive="#ff7700"
              emissiveIntensity={2.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
