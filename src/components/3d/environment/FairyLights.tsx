import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useGameStore } from '../../../stores/useGameStore';
import { collisionSystem } from '../../../systems/collision';

// Cable definition: start, end, sag, and number of bulbs along the curve
interface CableDef {
  start: [number, number, number];
  end: [number, number, number];
  sag: number;
  bulbs: number;
}

export const FairyLights: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const socketsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  // Festival Poles anchor coordinates [X, Z] along promenade margins
  const postCoordinates = useMemo<Array<[number, number]>>(() => [
    [-4.5, -18.0],
    [-4.5, -10.0],
    [-4.5, -2.5],
    [4.5, -18.0],
    [4.5, -10.0],
    [4.5, -2.5],
    [-4.5, 2.5],
    [-4.5, 10.0],
    [-4.5, 18.0],
    [-4.5, 26.0],
    [4.5, 2.5],
    [4.5, 10.0],
    [4.5, 18.0],
    [4.5, 26.0],
    [-8.5, 0.0],
    [8.5, 0.0],
  ], []);

  // Register physical obstacles for the festival poles
  useEffect(() => {
    postCoordinates.forEach(([px, pz], idx) => {
      collisionSystem.registerCylinder(`fairy_post_${idx}`, px, pz, 0.28);
    });

    return () => {
      // Empty cleanup preserving collisionSystem contract
    };
  }, [postCoordinates]);

  // Define complete 3D network of suspended catenary cables
  const cableDefinitions = useMemo<CableDef[]>(() => [
    // 1. South Promenade Longitudinal Lines (Entrance to Central Plaza)
    { start: [-4.6, 6.2, -24.5], end: [-4.5, 5.1, -18.0], sag: 0.35, bulbs: 8 },
    { start: [-4.5, 5.1, -18.0], end: [-4.5, 5.1, -10.0], sag: 0.4, bulbs: 9 },
    { start: [-4.5, 5.1, -10.0], end: [-4.5, 5.1, -2.5], sag: 0.35, bulbs: 9 },
    
    { start: [4.6, 6.2, -24.5], end: [4.5, 5.1, -18.0], sag: 0.35, bulbs: 8 },
    { start: [4.5, 5.1, -18.0], end: [4.5, 5.1, -10.0], sag: 0.4, bulbs: 9 },
    { start: [4.5, 5.1, -10.0], end: [4.5, 5.1, -2.5], sag: 0.35, bulbs: 9 },

    // 2. South Promenade Diagonal Criss-Cross Swags (Overhead Canopy Tunnel)
    { start: [-4.6, 5.8, -24.0], end: [4.5, 5.1, -18.0], sag: 0.65, bulbs: 10 },
    { start: [4.5, 5.1, -18.0], end: [-4.5, 5.1, -10.0], sag: 0.65, bulbs: 10 },
    { start: [-4.5, 5.1, -10.0], end: [4.5, 5.1, -2.5], sag: 0.65, bulbs: 10 },

    // 3. Central Plaza Radial Festoon Canopy (Shamiana Tent over Rangoli)
    { start: [0, 6.6, 0], end: [-4.5, 5.1, -2.5], sag: 0.5, bulbs: 8 },
    { start: [0, 6.6, 0], end: [4.5, 5.1, -2.5], sag: 0.5, bulbs: 8 },
    { start: [0, 6.6, 0], end: [-4.5, 5.1, 2.5], sag: 0.5, bulbs: 8 },
    { start: [0, 6.6, 0], end: [4.5, 5.1, 2.5], sag: 0.5, bulbs: 8 },
    { start: [0, 6.6, 0], end: [-8.5, 4.8, 0], sag: 0.55, bulbs: 10 },
    { start: [0, 6.6, 0], end: [8.5, 4.8, 0], sag: 0.55, bulbs: 10 },

    // 4. North Promenade Longitudinal Lines (Plaza to Cultural Stage)
    { start: [-4.5, 5.1, 2.5], end: [-4.5, 5.1, 10.0], sag: 0.35, bulbs: 9 },
    { start: [-4.5, 5.1, 10.0], end: [-4.5, 5.1, 18.0], sag: 0.4, bulbs: 9 },
    { start: [-4.5, 5.1, 18.0], end: [-4.5, 5.1, 26.0], sag: 0.4, bulbs: 9 },

    { start: [4.5, 5.1, 2.5], end: [4.5, 5.1, 10.0], sag: 0.35, bulbs: 9 },
    { start: [4.5, 5.1, 10.0], end: [4.5, 5.1, 18.0], sag: 0.4, bulbs: 9 },
    { start: [4.5, 5.1, 18.0], end: [4.5, 5.1, 26.0], sag: 0.4, bulbs: 9 },

    // 5. North Promenade Diagonal Criss-Cross Swags
    { start: [4.5, 5.1, 2.5], end: [-4.5, 5.1, 10.0], sag: 0.65, bulbs: 10 },
    { start: [-4.5, 5.1, 10.0], end: [4.5, 5.1, 18.0], sag: 0.65, bulbs: 10 },
    { start: [4.5, 5.1, 18.0], end: [-4.5, 5.1, 26.0], sag: 0.65, bulbs: 10 },

    // 6. Branch into West Bazaar (Sweets & Chaat Street)
    { start: [-4.5, 5.1, 2.5], end: [-11.8, 4.2, 4.5], sag: 0.45, bulbs: 9 },
    { start: [-11.8, 4.2, 7.5], end: [-11.8, 4.2, 13.5], sag: 0.4, bulbs: 8 },
    { start: [-11.8, 4.2, 16.5], end: [-4.5, 5.1, 18.0], sag: 0.5, bulbs: 9 },

    // 7. Branch into East Carnival (Balloon Game & Ferris Wheel Approach)
    { start: [4.5, 5.1, 2.5], end: [11.8, 4.2, 4.5], sag: 0.45, bulbs: 9 },
    { start: [11.8, 4.2, 8.5], end: [18.0, 5.0, 16.0], sag: 0.55, bulbs: 10 },
  ], []);

  // Compute Merged Cable Geometry and Exact Bulb Anchor Points
  const { mergedCableGeometry, bulbData } = useMemo(() => {
    const tubeGeoms: THREE.BufferGeometry[] = [];
    const bulbs: Array<{ pos: [number, number, number]; color: THREE.Color }> = [];

    // Traditional Indian Festival Palette
    const festiveColors = [
      new THREE.Color('#FFD700'), // Imperial Gold
      new THREE.Color('#FF7700'), // Marigold Saffron
      new THREE.Color('#E11D48'), // Festive Rose Pink
      new THREE.Color('#00E676'), // Emerald Green
      new THREE.Color('#FFB300'), // Royal Amber
      new THREE.Color('#00E5FF'), // Turquoise Cyan
    ];

    let colorIdx = 0;

    cableDefinitions.forEach((cable) => {
      const p0 = new THREE.Vector3(...cable.start);
      const p2 = new THREE.Vector3(...cable.end);
      const p1 = new THREE.Vector3(
        (p0.x + p2.x) / 2,
        (p0.y + p2.y) / 2 - cable.sag,
        (p0.z + p2.z) / 2
      );

      const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
      // Create lightweight 3D tube geometry (10 radial steps, 4 perimeter sides)
      const tube = new THREE.TubeGeometry(curve, 10, 0.015, 4, false);
      tubeGeoms.push(tube);

      // Sample points along the curve for bulbs
      const count = cable.bulbs;
      for (let i = 1; i <= count; i++) {
        const t = i / (count + 1);
        const point = curve.getPointAt(t);
        bulbs.push({
          pos: [point.x, point.y, point.z],
          color: festiveColors[colorIdx % festiveColors.length],
        });
        colorIdx++;
      }
    });

    const merged = mergeGeometries(tubeGeoms, false);

    // Dispose temporary unmerged geometries
    tubeGeoms.forEach((g) => g.dispose());

    return { mergedCableGeometry: merged, bulbData: bulbs };
  }, [cableDefinitions]);

  // Clean disposal of merged geometry when component unmounts
  useEffect(() => {
    return () => {
      if (mergedCableGeometry) {
        mergedCableGeometry.dispose();
      }
    };
  }, [mergedCableGeometry]);

  // Set colors and socket positions on mount
  useEffect(() => {
    if (!meshRef.current) return;
    bulbData.forEach((item, i) => {
      meshRef.current!.setColorAt(i, item.color);
    });
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // Set static socket positions
    if (socketsRef.current) {
      const socketDummy = new THREE.Object3D();
      bulbData.forEach((item, i) => {
        socketDummy.position.set(item.pos[0], item.pos[1] + 0.035, item.pos[2]);
        socketDummy.scale.set(1, 1, 1);
        socketDummy.updateMatrix();
        socketsRef.current!.setMatrixAt(i, socketDummy.matrix);
      });
      socketsRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [bulbData]);

  // Gentle festive twinkle animation inside useFrame
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    bulbData.forEach((item, i) => {
      // Bulb hangs right at the cable point
      dummy.position.set(item.pos[0], item.pos[1] - 0.03, item.pos[2]);
      const scale = reducedMotion ? 0.085 : 0.085 + Math.sin(time * 3.2 + i * 0.45) * 0.015;
      dummy.scale.set(scale, scale * 1.25, scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* ========================================================
          1. FESTIVAL POLES (TURNED TEAKWOOD STANDARDS ALONG CURBS)
         ======================================================== */}
      {postCoordinates.map(([px, pz], idx) => (
        <group key={idx} position={[px, 0, pz]}>
          {/* Carved Sandstone Base Plinth */}
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.4, 0.42]} />
            <meshStandardMaterial color="#6e3926" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.45, 0.05, 0.45]} />
            <meshStandardMaterial color="#b45309" roughness={0.65} />
          </mesh>

          {/* Turned Sal-Wood Festival Mast */}
          <mesh position={[0, 2.8, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.095, 4.8, 8]} />
            <meshStandardMaterial color="#542b14" roughness={0.75} />
          </mesh>

          {/* Brass Cable Cross-Arm Bracket at Y: 5.1 */}
          <mesh position={[0, 5.1, 0]}>
            <boxGeometry args={[0.65, 0.06, 0.06]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Cross-arm terminal rings */}
          <mesh position={[-0.32, 5.1, 0]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} />
          </mesh>
          <mesh position={[0.32, 5.1, 0]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} />
          </mesh>

          {/* Polished Brass Finial Kalash atop Mast */}
          <mesh position={[0, 5.3, 0]}>
            <cylinderGeometry args={[0.04, 0.08, 0.22, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 5.46, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d97706"
              emissiveIntensity={0.5}
              metalness={0.85}
            />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          2. MERGED SUSPENDED CATENARY CABLE TUBES (1 Draw Call)
         ======================================================== */}
      {mergedCableGeometry && (
        <mesh geometry={mergedCableGeometry} castShadow>
          <meshStandardMaterial
            color="#1c1917" // Deep weathered charcoal cable
            roughness={0.85}
            metalness={0.3}
          />
        </mesh>
      )}

      {/* ========================================================
          3. BULB SOCKETS / CAPS (1 Draw Call InstancedMesh)
         ======================================================== */}
      <instancedMesh
        ref={socketsRef}
        args={[undefined, undefined, bulbData.length]}
      >
        <cylinderGeometry args={[0.025, 0.03, 0.04, 6]} />
        <meshStandardMaterial
          color="#0f172a" // Deep brass/black socket
          roughness={0.6}
          metalness={0.5}
        />
      </instancedMesh>

      {/* ========================================================
          4. GLOWING FESTIVAL BULBS (1 Draw Call InstancedMesh)
         ======================================================== */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, bulbData.length]}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.8}
          roughness={0.2}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
};
