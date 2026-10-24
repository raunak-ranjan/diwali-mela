import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';
import { windCoordinator } from '../../../systems/windCoordinator';
import { computeGarlandSway } from '../../../systems/environmentMath';

interface BuntingProps {
  start: [number, number, number];
  end: [number, number, number];
  flagsCount?: number;
  sag?: number;
}

// Vibrant festive palette for celebratory mela bunting pennants
const BUNTING_COLORS = [
  '#f97316', // Vibrant Saffron
  '#fbbf24', // Radiant Amber Gold
  '#e11d48', // Festive Gulal Crimson
  '#10b981', // Auspicious Emerald
  '#06b6d4', // Peacock Turquoise
  '#8b5cf6', // Royal Purple
];

export const FestiveBuntingLine: React.FC<BuntingProps> = ({
  start,
  end,
  flagsCount = 12,
  sag = 0.45,
}) => {
  const lineRef = useRef<THREE.Group>(null);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  // Generate catenary curve points and flag positions
  const { flagsData, stringGeo } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const flags: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      color: string;
    }> = [];

    const numPoints = 24;
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = start[0] + (end[0] - start[0]) * t;
      const yBase = start[1] + (end[1] - start[1]) * t;
      const z = start[2] + (end[2] - start[2]) * t;
      // Parabolic sag
      const y = yBase - Math.sin(t * Math.PI) * sag;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(32);
    const stringGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

    // Position triangular pennant flags along the curve
    for (let i = 1; i <= flagsCount; i++) {
      const t = i / (flagsCount + 1);
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const angleY = Math.atan2(tangent.x, tangent.z);

      flags.push({
        position: [point.x, point.y - 0.14, point.z],
        rotation: [0, angleY, 0],
        color: BUNTING_COLORS[(i - 1) % BUNTING_COLORS.length],
      });
    }

    return { flagsData: flags, stringGeo: stringGeometry };
  }, [start, end, flagsCount, sag]);

  // Triangular flag geometry (pointing down)
  const flagGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.12, 0.14);
    shape.lineTo(0.12, 0.14);
    shape.lineTo(0.0, -0.16);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  // Procedural wind reaction
  useFrame(({ clock }) => {
    if (!lineRef.current || reducedMotion) return;
    const time = clock.getElapsedTime();
    const wind = windCoordinator.update(time);
    const [rotX, rotZ] = computeGarlandSway(time, start[0], start[2], wind, reducedMotion);

    lineRef.current.rotation.x = rotX * 1.5;
    lineRef.current.rotation.z = rotZ * 1.5;
  });

  return (
    <group ref={lineRef}>
      {/* Golden suspension string */}
      <primitive object={new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: 0xd97706 }))} />

      {/* Pennants */}
      {flagsData.map((flag, idx) => (
        <mesh
          key={idx}
          geometry={flagGeometry}
          position={flag.position}
          rotation={flag.rotation}
        >
          <meshStandardMaterial
            color={flag.color}
            side={THREE.DoubleSide}
            roughness={0.65}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

// Wind-reactive potted festival plant (Ashoka / Marigold foliage)
export const WindReactivePlanter: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1.0 }) => {
  const foliageRef = useRef<THREE.Group>(null);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  useFrame(({ clock }) => {
    if (!foliageRef.current || reducedMotion) return;
    const time = clock.getElapsedTime();
    const wind = windCoordinator.update(time);

    // Subtle natural foliage rustle in the breeze
    const swayX = Math.sin(time * 2.2 + position[0]) * 0.02 * (1.0 + wind.gust);
    const swayZ = Math.cos(time * 1.8 + position[2]) * 0.02 * (1.0 + wind.gust);
    foliageRef.current.rotation.x = swayX;
    foliageRef.current.rotation.z = swayZ;
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Terracotta Planter Pot */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.22, 0.7, 16]} />
        <meshStandardMaterial color="#9a3412" roughness={0.9} />
      </mesh>
      {/* Pot Rim */}
      <mesh position={[0, 0.7, 0]}>
        <torusGeometry args={[0.33, 0.04, 8, 16]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.85} />
      </mesh>

      {/* Soil */}
      <mesh position={[0, 0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.31, 16]} />
        <meshStandardMaterial color="#3f2e1e" roughness={1.0} />
      </mesh>

      {/* Swaying Foliage Cluster */}
      <group ref={foliageRef} position={[0, 0.7, 0]}>
        {/* Central stem */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.035, 0.9, 8]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
        {/* Tiered foliage cones (Ashoka tree / cypress style) */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <coneGeometry args={[0.35, 0.7, 8]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow>
          <coneGeometry args={[0.26, 0.6, 8]} />
          <meshStandardMaterial color="#16a34a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.25, 0]} castShadow>
          <coneGeometry args={[0.18, 0.5, 8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};

// Container for mela environmental wind decorations
export const WindDecorations: React.FC = () => {
  return (
    <group>
      {/* 1. Grand Entrance Promenade Bunting (overhead festive welcome) */}
      <FestiveBuntingLine
        start={[-4.5, 4.6, -18.0]}
        end={[4.5, 4.6, -18.0]}
        flagsCount={14}
        sag={0.4}
      />
      <FestiveBuntingLine
        start={[-4.5, 4.4, -13.0]}
        end={[4.5, 4.4, -13.0]}
        flagsCount={14}
        sag={0.4}
      />

      {/* 2. Bazaar Alleyway Bunting (connecting Food Stalls & Handicrafts) */}
      <FestiveBuntingLine
        start={[-7.5, 4.2, -4.0]}
        end={[-7.5, 4.2, 8.0]}
        flagsCount={16}
        sag={0.5}
      />
      <FestiveBuntingLine
        start={[7.5, 4.2, -4.0]}
        end={[7.5, 4.2, 8.0]}
        flagsCount={16}
        sag={0.5}
      />

      {/* 3. Cultural Stage Approach Bunting */}
      <FestiveBuntingLine
        start={[-5.0, 4.2, 22.0]}
        end={[5.0, 4.2, 22.0]}
        flagsCount={15}
        sag={0.45}
      />

      {/* 4. Promenade Decorative Wind-Reactive Planters */}
      <WindReactivePlanter position={[-3.2, 0, -16.0]} scale={0.9} />
      <WindReactivePlanter position={[3.2, 0, -16.0]} scale={0.9} />
      <WindReactivePlanter position={[-3.2, 0, -11.0]} scale={0.9} />
      <WindReactivePlanter position={[3.2, 0, -11.0]} scale={0.9} />

      {/* Planters flanking Central Rangoli Plaza */}
      <WindReactivePlanter position={[-4.8, 0, -3.5]} scale={1.0} />
      <WindReactivePlanter position={[4.8, 0, -3.5]} scale={1.0} />
      <WindReactivePlanter position={[-4.8, 0, 3.5]} scale={1.0} />
      <WindReactivePlanter position={[4.8, 0, 3.5]} scale={1.0} />
    </group>
  );
};
