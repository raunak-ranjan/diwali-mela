import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';

interface DiyaInfo {
  id: string;
  pos: [number, number, number];
  isLit: boolean;
}

export const InstancedDiyas = () => {
  const litDiyas = useGameStore((s) => s.litDiyas);
  const lightDiya = useGameStore((s) => s.lightDiya);

  const diyaPositions = useMemo<DiyaInfo[]>(() => {
    const list: DiyaInfo[] = [];

    // 1. Entrance walkway flanks
    for (let z = -24; z <= -4; z += 1.8) {
      list.push({ id: `diya_ent_left_${z}`, pos: [-3.8, 0.05, z], isLit: true });
      list.push({ id: `diya_ent_right_${z}`, pos: [3.8, 0.05, z], isLit: true });
    }

    // 2. Central Rangoli circumference
    const radius = 6.2;
    for (let a = 0; a < 24; a++) {
      const angle = (a / 24) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Some are initially unlit for player interaction
      list.push({ id: `diya_rangoli_${a}`, pos: [x, 0.05, z], isLit: a % 3 !== 0 });
    }

    // 3. Stalls ledges and steps
    for (let i = 0; i < 8; i++) {
      list.push({ id: `diya_stall_left_${i}`, pos: [-12 - (i % 3) * 1.5, 0.85, 4 + (i * 2)], isLit: true });
      list.push({ id: `diya_stall_right_${i}`, pos: [12 + (i % 3) * 1.5, 0.85, 4 + (i * 2)], isLit: i % 2 === 0 });
    }

    // 4. Cultural stage perimeter
    for (let x = -6; x <= 6; x += 1.5) {
      list.push({ id: `diya_stage_${x}`, pos: [x, 0.65, 34], isLit: true });
    }

    return list;
  }, []);

  // Register interactive clusters
  useEffect(() => {
    const unlitGroups = diyaPositions.filter((d) => !d.isLit);
    unlitGroups.forEach((diya) => {
      interactionRegistry.register({
        id: diya.id,
        position: diya.pos,
        radius: 2.2,
        label: 'Light Sacred Diya',
        sublabel: '+5 Virtual Tokens',
        actionType: 'diya',
        onInteract: () => {
          lightDiya(diya.id);
        },
      });
    });

    return () => {
      unlitGroups.forEach((diya) => interactionRegistry.unregister(diya.id));
    };
  }, [diyaPositions, lightDiya]);

  const clayMeshRef = useRef<THREE.InstancedMesh>(null);
  const flameMeshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Update matrices and animate flame flickers with organic multi-harmonic frequencies
  useFrame(({ clock }) => {
    if (!clayMeshRef.current || !flameMeshRef.current) return;
    const time = clock.getElapsedTime();

    diyaPositions.forEach((diya, i) => {
      const isActuallyLit = diya.isLit || litDiyas.includes(diya.id);

      // Base clay lamp
      dummy.position.set(diya.pos[0], diya.pos[1], diya.pos[2]);
      dummy.scale.set(0.25, 0.12, 0.25);
      dummy.rotation.set(0, (i * 0.4) % Math.PI, 0);
      dummy.updateMatrix();
      clayMeshRef.current!.setMatrixAt(i, dummy.matrix);

      // Organic dancing flame with gentle flutter
      if (isActuallyLit) {
        const flicker =
          0.082 +
          Math.sin(time * 11 + i * 2.1) * 0.016 +
          Math.cos(time * 17 + i * 1.3) * 0.012 +
          Math.sin(time * 5 + i * 0.7) * 0.014;
        const swayX = Math.sin(time * 7 + i) * 0.012;
        const swayZ = Math.cos(time * 6 + i) * 0.012;

        dummy.position.set(diya.pos[0] + swayX, diya.pos[1] + 0.14, diya.pos[2] + swayZ);
        dummy.scale.set(flicker * 0.85, flicker * 1.7, flicker * 0.85);
      } else {
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      flameMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    clayMeshRef.current.instanceMatrix.needsUpdate = true;
    flameMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Clay Lamp Diya Base (Rich Indian Terracotta Earthenware) */}
      <instancedMesh
        ref={clayMeshRef}
        args={[undefined, undefined, diyaPositions.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.9, 0.4, 0.6, 12]} />
        <meshStandardMaterial
          color="#8a431d" // Traditional baked terracotta clay
          roughness={0.78}
          metalness={0.08}
        />
      </instancedMesh>

      {/* Glowing Teardrop Flame (Golden core with warm saffron-amber emissive bloom) */}
      <instancedMesh
        ref={flameMeshRef}
        args={[undefined, undefined, diyaPositions.length]}
      >
        <coneGeometry args={[0.5, 1.2, 8]} />
        <meshStandardMaterial
          color="#fffbf0"
          emissive="#ff9900"
          emissiveIntensity={3.6}
          toneMapped={false}
          roughness={0.15}
        />
      </instancedMesh>
    </group>
  );
};
