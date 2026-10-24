import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { MAGICAL_DIYAS_CONFIG, type MagicalDiyaConfig } from '../../../types/quest';

interface DiyaItemProps {
  config: MagicalDiyaConfig;
  index: number;
  reducedMotion: boolean;
  isCollected: boolean;
  onCollect: (id: string, name: string) => void;
}

// Module-level shared materials to avoid per-instance allocations and shader disposal stalls
const goldMetalMaterial = new THREE.MeshStandardMaterial({
  color: '#f59e0b',
  emissive: '#b45309',
  emissiveIntensity: 0.35,
  roughness: 0.25,
  metalness: 0.85,
});

const auraMaterial = new THREE.MeshBasicMaterial({
  color: '#fbbf24',
  transparent: true,
  opacity: 0.45,
  side: THREE.DoubleSide,
});

const innerFlameMaterial = new THREE.MeshBasicMaterial({
  color: '#ffffff',
});

const outerFlameMaterial = new THREE.MeshBasicMaterial({
  color: '#ff9800',
  transparent: true,
  opacity: 0.9,
});

const sparkMaterial = new THREE.MeshBasicMaterial({
  color: '#fef08a',
});

const basePlinthMaterial = new THREE.MeshStandardMaterial({
  color: '#451a03',
  roughness: 0.8,
});

const lotusRingMaterial = new THREE.MeshStandardMaterial({
  color: '#b45309',
  roughness: 0.4,
  metalness: 0.6,
});

const SingleMagicalDiyaComponent: React.FC<DiyaItemProps> = ({ config, index, reducedMotion, isCollected, onCollect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const flameRef = useRef<THREE.Group>(null);
  const sparkRefs = useRef<(THREE.Mesh | null)[]>([]);

  useEffect(() => {
    if (isCollected) {
      interactionRegistry.unregister(config.id);
      return;
    }

    interactionRegistry.register({
      id: config.id,
      position: config.position,
      radius: 2.4,
      label: 'Kindle Sacred Diya',
      sublabel: `[Quest] ${config.name}`,
      actionType: 'quest',
      onInteract: () => {
        onCollect(config.id, config.name);
      },
    });

    return () => {
      interactionRegistry.unregister(config.id);
    };
  }, [config, isCollected, onCollect]);

  useFrame(({ clock }, delta) => {
    if (isCollected || !groupRef.current) return;
    const t = clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Floating vertical bob
    const bob = reducedMotion ? 0 : Math.sin(t * 2.2 + index * 1.4) * 0.08;
    groupRef.current.position.y = config.position[1] + bob;

    // Gentle axial rotation
    const rotSpeed = reducedMotion ? 0.3 : 1.2;
    groupRef.current.rotation.y += safeDelta * rotSpeed;

    // Pulsing ethereal aura
    if (auraRef.current) {
      const pulse = 1.0 + (reducedMotion ? 0 : Math.sin(t * 4.0 + index) * 0.08);
      auraRef.current.scale.set(pulse, pulse, pulse);
    }

    // Flame flicker
    if (flameRef.current) {
      const flicker = 1.0 + Math.sin(t * 11 + index * 2) * 0.08;
      flameRef.current.scale.set(flicker, flicker * 1.1, flicker);
    }

    // Orbiting sparks
    sparkRefs.current.forEach((spark, sIdx) => {
      if (!spark) return;
      const angle = t * 2.5 + (sIdx * Math.PI) / 2 + index;
      const radius = 0.42 + Math.sin(t * 3 + sIdx) * 0.04;
      spark.position.x = Math.cos(angle) * radius;
      spark.position.z = Math.sin(angle) * radius;
      spark.position.y = 0.28 + Math.sin(t * 4 + sIdx) * 0.06;
    });
  });

  if (isCollected) return null;

  return (
    <group position={config.position}>
      {/* Stone decorative base plinth on ground */}
      <mesh position={[0, -config.position[1] + 0.04, 0]} material={basePlinthMaterial} receiveShadow>
        <cylinderGeometry args={[0.42, 0.48, 0.08, 16]} />
      </mesh>
      {/* Lotus ring carving at base */}
      <mesh position={[0, -config.position[1] + 0.09, 0]} material={lotusRingMaterial}>
        <cylinderGeometry args={[0.36, 0.42, 0.03, 16]} />
      </mesh>

      {/* Floating Diya Group */}
      <group ref={groupRef}>
        {/* Sculpted Golden Diya Lamp Bowl */}
        <mesh material={goldMetalMaterial} castShadow>
          <cylinderGeometry args={[0.26, 0.14, 0.14, 20]} />
        </mesh>
        {/* Diya lip rim */}
        <mesh position={[0, 0.07, 0]} material={goldMetalMaterial}>
          <torusGeometry args={[0.26, 0.035, 12, 24]} />
        </mesh>
        {/* Auspicious pinch spout facing front */}
        <mesh position={[0, 0.08, 0.26]} rotation={[0.4, 0, 0]} material={goldMetalMaterial}>
          <coneGeometry args={[0.07, 0.12, 12]} />
        </mesh>

        {/* Ethereal Sacred Aura Ring */}
        <mesh ref={auraRef} position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} material={auraMaterial}>
          <torusGeometry args={[0.52, 0.02, 16, 32]} />
        </mesh>

        {/* Orbiting Sparkles */}
        {[0, 1, 2, 3].map((s) => (
          <mesh
            key={s}
            ref={(el) => {
              sparkRefs.current[s] = el;
            }}
            material={sparkMaterial}
          >
            <sphereGeometry args={[0.024, 8, 8]} />
          </mesh>
        ))}

        {/* Glowing Flame */}
        <group ref={flameRef} position={[0, 0.15, 0]}>
          {/* Outer orange/amber flame teardrop */}
          <mesh position={[0, 0.12, 0]} material={outerFlameMaterial}>
            <coneGeometry args={[0.09, 0.24, 16]} />
          </mesh>
          <mesh position={[0, 0.03, 0]} material={outerFlameMaterial}>
            <sphereGeometry args={[0.09, 16, 16]} />
          </mesh>

          {/* Inner incandescent white core */}
          <mesh position={[0, 0.08, 0]} material={innerFlameMaterial}>
            <coneGeometry args={[0.045, 0.14, 12]} />
          </mesh>
          <mesh position={[0, 0.03, 0]} material={innerFlameMaterial}>
            <sphereGeometry args={[0.045, 12, 12]} />
          </mesh>
        </group>

        {/* Warm local sacred illumination */}
        <pointLight color="#f59e0b" intensity={0.9} distance={3.5} decay={2} />
      </group>
    </group>
  );
};

const SingleMagicalDiya = React.memo(SingleMagicalDiyaComponent);

export const MagicalDiyas: React.FC = () => {
  const collectedDiyas = useGameStore((s) => s.quest.collectedDiyas);
  const collectMagicalDiya = useGameStore((s) => s.collectMagicalDiya);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  // Set lookup for instant O(1) checks
  const collectedSet = useMemo(() => new Set(collectedDiyas), [collectedDiyas]);

  return (
    <group name="magical-diyas-group">
      {MAGICAL_DIYAS_CONFIG.map((diya, index) => {
        const isCollected = collectedSet.has(diya.id);
        if (isCollected) return null;

        return (
          <SingleMagicalDiya
            key={diya.id}
            config={diya}
            index={index}
            reducedMotion={reducedMotion}
            isCollected={isCollected}
            onCollect={collectMagicalDiya}
          />
        );
      })}
    </group>
  );
};
