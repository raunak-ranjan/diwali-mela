import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FestiveCharacterMesh } from './FestiveCharacterMesh';
import type { VendorNpcConfig } from '../../../types/npc';
import { useNpcStore } from '../../../stores/useNpcStore';

interface VendorNPCProps {
  config: VendorNpcConfig;
  reducedMotion?: boolean;
}

export const VendorNPC: React.FC<VendorNPCProps> = ({ config, reducedMotion = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headNodRef = useRef(0);
  const isNearbyRef = useRef(false);

  const vendorPos = useRef(new THREE.Vector3(...config.position));

  useFrame(({ camera }, delta) => {
    if (!groupRef.current) return;

    // Proximity check with camera/player
    const dist = camera.position.distanceTo(vendorPos.current);
    const isNearby = dist <= 6.5;

    if (isNearby !== isNearbyRef.current) {
      isNearbyRef.current = isNearby;
      const { greetingsEnabled, setGreeting, clearGreeting, activeGreeting } = useNpcStore.getState();

      if (isNearby && greetingsEnabled) {
        setGreeting({
          vendorId: config.id,
          vendorName: config.name,
          shopName: config.shopName,
          text: config.greetingText,
          accent: config.accentDialogue,
        });
      } else if (!isNearby && activeGreeting?.vendorId === config.id) {
        clearGreeting();
      }
    }

    // Gentle welcoming nod when nearby
    if (isNearby && !reducedMotion) {
      headNodRef.current += delta * 2.5;
      groupRef.current.rotation.x = Math.sin(headNodRef.current) * 0.05;
    } else {
      groupRef.current.rotation.x = 0;
    }
  });

  return (
    <group
      ref={groupRef}
      position={config.position}
      rotation={[0, config.rotationY, 0]}
      name={config.id}
    >
      <FestiveCharacterMesh outfit={config.outfit} isVendor={true} />

      {/* Gentle floating golden halo marker above vendor */}
      <mesh position={[0, 1.88, 0]}>
        <ringGeometry args={[0.12, 0.16, 16]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
