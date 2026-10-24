import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import {
  FESTIVAL_COLLECTIBLES_CONFIG,
  type FestivalCollectibleConfig,
} from '../../../types/collectibles';

interface CollectibleItemProps {
  config: FestivalCollectibleConfig;
  isCollected: boolean;
  onDiscover: (id: string) => void;
}

const CollectibleItem: React.FC<CollectibleItemProps> = ({ config, isCollected, onDiscover }) => {
  const meshGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Register interaction only while uncollected
  useEffect(() => {
    if (isCollected) {
      interactionRegistry.unregister(config.id);
      return;
    }

    interactionRegistry.register({
      id: config.id,
      position: config.position,
      radius: 2.6,
      label: `Discover: ${config.name}`,
      sublabel: `${config.zoneHint} (+${config.rewardTokens} 🪙)`,
      actionType: 'quest',
      onInteract: () => {
        onDiscover(config.id);
      },
    });

    return () => {
      interactionRegistry.unregister(config.id);
    };
  }, [config, isCollected, onDiscover]);

  // Subtle floating and rotation animation
  useFrame(({ clock }) => {
    if (!meshGroupRef.current) return;
    const t = clock.getElapsedTime() + config.position[0];
    if (!isCollected) {
      meshGroupRef.current.position.y = config.position[1] + Math.sin(t * 2.2) * 0.08 + 0.12;
      meshGroupRef.current.rotation.y = t * 0.8;
    } else {
      meshGroupRef.current.position.y = config.position[1] + 0.05;
      meshGroupRef.current.rotation.y = 0;
    }

    if (ringRef.current && !isCollected) {
      ringRef.current.rotation.z = -t * 0.6;
    }
  });

  return (
    <group position={config.position}>
      {/* Sacred ground ring pedestal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[0.3, 0.45, 24]} />
        <meshStandardMaterial
          color={isCollected ? '#78716c' : '#f59e0b'}
          emissive={isCollected ? '#292524' : '#d97706'}
          emissiveIntensity={isCollected ? 0.2 : 0.8}
          transparent
          opacity={isCollected ? 0.4 : 0.85}
        />
      </mesh>

      {/* Floating Keepsake Mesh */}
      <group ref={meshGroupRef}>
        {!isCollected && (
          <>
            {/* Glowing Aura Ring */}
            <mesh ref={ringRef} rotation={[-Math.PI / 3, 0, 0]}>
              <torusGeometry args={[0.32, 0.015, 8, 24]} />
              <meshBasicMaterial color="#fef08a" transparent opacity={0.6} />
            </mesh>

            {/* Unique Thematic Keepsake Geometries */}
            {config.id === 'collectible_garland' && (
              <group scale={1.2}>
                <mesh castShadow>
                  <torusGeometry args={[0.18, 0.06, 12, 24]} />
                  <meshStandardMaterial color="#ea580c" roughness={0.6} emissive="#f97316" emissiveIntensity={0.3} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <torusGeometry args={[0.12, 0.04, 8, 16]} />
                  <meshStandardMaterial color="#eab308" roughness={0.5} emissive="#ca8a04" emissiveIntensity={0.4} />
                </mesh>
              </group>
            )}

            {config.id === 'collectible_brass_bell' && (
              <group scale={1.1}>
                {/* Bell Body */}
                <mesh position={[0, 0.08, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.16, 0.22, 16]} />
                  <meshStandardMaterial color="#eab308" metalness={0.85} roughness={0.25} />
                </mesh>
                {/* Bell Top Finial */}
                <mesh position={[0, 0.22, 0]}>
                  <sphereGeometry args={[0.05, 12, 12]} />
                  <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* Clapper */}
                <mesh position={[0, -0.02, 0]}>
                  <sphereGeometry args={[0.035, 8, 8]} />
                  <meshStandardMaterial color="#854d0e" metalness={0.8} roughness={0.3} />
                </mesh>
              </group>
            )}

            {config.id === 'collectible_silver_coin' && (
              <group scale={1.2} rotation={[Math.PI / 6, 0, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.2, 0.2, 0.035, 32]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
                </mesh>
                <mesh position={[0, 0.02, 0]}>
                  <torusGeometry args={[0.16, 0.012, 8, 24]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            )}

            {config.id === 'collectible_peacock_fan' && (
              <group scale={1.2}>
                {/* Handle */}
                <mesh position={[0, -0.1, 0]} castShadow>
                  <cylinderGeometry args={[0.02, 0.02, 0.18, 8]} />
                  <meshStandardMaterial color="#d97706" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Fan Plumes */}
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.22, 0.04, 0.22, 16, 1, false, 0, Math.PI]} />
                  <meshStandardMaterial color="#0d9488" metalness={0.3} roughness={0.5} emissive="#059669" emissiveIntensity={0.3} />
                </mesh>
                <mesh position={[0, 0.1, 0.01]}>
                  <circleGeometry args={[0.08, 16]} />
                  <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
                </mesh>
              </group>
            )}

            {/* Point Light when undiscovered */}
            <pointLight
              color="#fbbf24"
              intensity={0.6}
              distance={2.5}
              decay={2}
            />
          </>
        )}

        {isCollected && (
          /* Subtle settled sacred marker once collected */
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.15, 0.18, 0.04, 16]} />
            <meshStandardMaterial color="#44403c" roughness={0.8} />
          </mesh>
        )}
      </group>
    </group>
  );
};

export const FestivalCollectibles: React.FC = () => {
  const collectibles = useGameStore((s) => s.collectibles);
  const discoverCollectible = useGameStore((s) => s.discoverCollectible);

  return (
    <group name="festival-collectibles">
      {FESTIVAL_COLLECTIBLES_CONFIG.map((config) => (
        <CollectibleItem
          key={config.id}
          config={config}
          isCollected={collectibles.includes(config.id)}
          onDiscover={discoverCollectible}
        />
      ))}
    </group>
  );
};
