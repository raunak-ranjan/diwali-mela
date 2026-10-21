import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';
import { useGameStore } from '../../../stores/useGameStore';

export const FerrisWheel = () => {
  const wheelRef = useRef<THREE.Group>(null);
  const cabinsRef = useRef<(THREE.Group | null)[]>([]);
  const openModal = useGameStore((s) => s.openModal);

  const numCabins = 8;
  const wheelRadius = 8.5;

  useEffect(() => {
    // Register collision base around Ferris wheel at X: 22, Z: 20
    collisionSystem.registerCylinder('ferris_wheel_base', 22, 20, 5.5);

    // Register interaction prompt
    interactionRegistry.register({
      id: 'ferris_wheel_ride',
      position: [18.0, 1.0, 20.0],
      radius: 4.5,
      label: 'Diwali Giant Ferris Wheel',
      sublabel: 'Panoramic Festive Fairground View',
      actionType: 'ferris_wheel',
      onInteract: () => {
        openModal('finale');
      },
    });

    return () => {
      interactionRegistry.unregister('ferris_wheel_ride');
    };
  }, [openModal]);

  useFrame((_, delta) => {
    if (wheelRef.current) {
      // Rotate the giant wheel slowly
      wheelRef.current.rotation.z += delta * 0.25;
      const currentAngle = wheelRef.current.rotation.z;

      // Keep passenger cabins hanging vertically downwards due to gravity!
      cabinsRef.current.forEach((cabin) => {
        if (cabin) {
          cabin.rotation.z = -currentAngle;
        }
      });
    }
  });

  return (
    <group position={[24, 0, 20]}>
      {/* Structural Support A-Frames (Left and Right) */}
      <mesh position={[0, 5.5, -2.5]} rotation={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.4, 12, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 5.5, 2.5]} rotation={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.4, 12, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Main Central Hub Axle */}
      <mesh position={[0, 11, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 5.2, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rotating Giant Wheel Assembly */}
      <group ref={wheelRef} position={[0, 11, 0]}>
        {/* Outer Circular Rims */}
        <mesh position={[0, 0, -1.8]}>
          <torusGeometry args={[wheelRadius, 0.12, 8, 36]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0, 0, 1.8]}>
          <torusGeometry args={[wheelRadius, 0.12, 8, 36]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Radial Spokes & Cabins */}
        {Array.from({ length: numCabins }).map((_, i) => {
          const angle = (i / numCabins) * Math.PI * 2;
          const x = Math.cos(angle) * wheelRadius;
          const y = Math.sin(angle) * wheelRadius;

          return (
            <group key={i}>
              {/* Spoke Struts */}
              <mesh rotation={[0, 0, angle]}>
                <cylinderGeometry args={[0.06, 0.06, wheelRadius * 2, 6]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.8} />
              </mesh>

              {/* Glowing Spoke Light Orbs */}
              <mesh position={[x * 0.5, y * 0.5, 0]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#0284c7"
                  emissiveIntensity={2.0}
                  toneMapped={false}
                />
              </mesh>

              {/* Hanging Passenger Cabin */}
              <group
                ref={(el) => {
                  cabinsRef.current[i] = el;
                }}
                position={[x, y, 0]}
              >
                {/* Cabin Roof */}
                <mesh position={[0, 0.4, 0]} castShadow>
                  <coneGeometry args={[0.9, 0.5, 6]} />
                  <meshStandardMaterial color="#eab308" roughness={0.4} />
                </mesh>
                {/* Cabin Enclosure */}
                <mesh position={[0, -0.3, 0]} castShadow>
                  <boxGeometry args={[1.2, 1.0, 1.2]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? '#ea580c' : '#7c3aed'}
                    roughness={0.5}
                  />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
};
