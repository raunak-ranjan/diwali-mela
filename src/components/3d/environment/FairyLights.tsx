import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const FairyLights = () => {
  const count = 160;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Traditional Indian festival fairground garland colors
  const lightData = useMemo(() => {
    const data: Array<{ pos: [number, number, number]; color: THREE.Color }> = [];
    const colors = [
      new THREE.Color('#FFD700'), // Gold
      new THREE.Color('#FF5722'), // Saffron
      new THREE.Color('#E91E63'), // Festive Pink
      new THREE.Color('#00E676'), // Emerald
      new THREE.Color('#FFC107'), // Amber
    ];

    // Pathway 1: Entrance to Plaza (Z: -24 to 0)
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      const z = -24 + t * 24;
      const sag = Math.sin(t * Math.PI) * 0.8;
      const xLeft = -4.5;
      const xRight = 4.5;
      data.push({
        pos: [xLeft, 5.2 - sag, z],
        color: colors[i % colors.length],
      });
      data.push({
        pos: [xRight, 5.2 - sag, z],
        color: colors[(i + 2) % colors.length],
      });
    }

    // Pathway 2: Plaza to Stalls (Left & Right arms)
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      const x = -18 + t * 36;
      const sag = Math.sin(t * Math.PI) * 0.6;
      data.push({
        pos: [x, 5.0 - sag, 0],
        color: colors[i % colors.length],
      });
    }

    // Pathway 3: Plaza to Carnival (Z: 0 to 26)
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      const z = 0 + t * 26;
      const sag = Math.sin(t * Math.PI) * 0.7;
      data.push({
        pos: [-5, 5.0 - sag, z],
        color: colors[i % colors.length],
      });
      data.push({
        pos: [5, 5.0 - sag, z],
        color: colors[(i + 1) % colors.length],
      });
    }

    return data.slice(0, count);
  }, []);

  // Assign individual festive colors to instanced mesh bulbs
  useEffect(() => {
    if (!meshRef.current) return;
    lightData.forEach((item, i) => {
      meshRef.current!.setColorAt(i, item.color);
    });
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [lightData]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    lightData.forEach((item, i) => {
      dummy.position.set(...item.pos);
      // Gentle festive twinkle
      const scale = 0.12 + Math.sin(time * 3 + i * 0.5) * 0.025;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Instanced Glowing Bulbs */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, lightData.length]}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.8}
          roughness={0.25}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
};
