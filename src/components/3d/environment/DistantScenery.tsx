import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';

// --- TRADITIONAL CHHATRI (DOMED ROOFTOP PAVILION) ---
const DistantChhatri: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Plinth Platform */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[4.2, 0.8, 4.2]} />
        <meshStandardMaterial color="#1a120c" roughness={0.9} />
      </mesh>

      {/* 4 Slender Sandstone Pillars */}
      {[
        [-1.6, -1.6],
        [1.6, -1.6],
        [-1.6, 1.6],
        [1.6, 1.6],
      ].map(([px, pz], idx) => (
        <mesh key={idx} position={[px, 2.5, pz]}>
          <cylinderGeometry args={[0.18, 0.22, 3.4, 8]} />
          <meshStandardMaterial color="#2a1c14" roughness={0.85} />
        </mesh>
      ))}

      {/* Scalloped Eaves / Chhajja */}
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[4.6, 0.3, 4.6]} />
        <meshStandardMaterial color="#2d1e16" roughness={0.8} />
      </mesh>

      {/* Ribbed Traditional Lotus Dome (Gumbad) */}
      <mesh position={[0, 5.5, 0]}>
        <sphereGeometry args={[2.0, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#1f140e" roughness={0.8} />
      </mesh>

      {/* Sacred Golden Kalash Finial */}
      <mesh position={[0, 7.7, 0]}>
        <cylinderGeometry args={[0.1, 0.28, 0.8, 8]} />
        <meshStandardMaterial color="#d97706" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 8.2, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#d97706"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Interior Warm Festival Light from within Pavilion */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// --- OVERHEAD FESTIVE BUNTING SPAN (TRIANGULAR PENNANTS) ---
const OverheadBuntingSpan: React.FC<{
  z: number;
  width?: number;
  height?: number;
}> = ({ z, width = 9.0, height = 5.4 }) => {
  const flagsGroupRef = useRef<THREE.Group>(null);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const flags = useMemo(() => {
    const colors = ['#ea580c', '#f59e0b', '#be123c', '#0891b2', '#15803d', '#7c3aed'];
    const count = 15;
    const list: Array<{ x: number; y: number; color: string; rotationZ: number }> = [];

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = -width / 2 + t * width;
      // Catenary sag
      const sag = Math.sin(t * Math.PI) * 0.55;
      const y = height - sag;
      const slope = -Math.cos(t * Math.PI) * 0.12;

      list.push({
        x,
        y: y - 0.22,
        color: colors[i % colors.length],
        rotationZ: slope,
      });
    }
    return list;
  }, [width, height]);

  // Gentle flutter of festival bunting pennants in the evening breeze
  useFrame(({ clock }) => {
    if (flagsGroupRef.current && !reducedMotion) {
      const t = clock.getElapsedTime();
      flagsGroupRef.current.children.forEach((child, idx) => {
        child.rotation.x = Math.sin(t * 2.2 + idx * 0.45 + z * 0.3) * 0.12;
        child.rotation.z = Math.PI + flags[idx].rotationZ + Math.sin(t * 1.6 + idx * 0.35) * 0.06;
      });
    }
  });

  return (
    <group position={[0, 0, z]}>
      {/* Supporting Side Posts */}
      <mesh position={[-width / 2 - 0.15, height / 2, 0]}>
        <cylinderGeometry args={[0.12, 0.15, height, 8]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
      <mesh position={[width / 2 + 0.15, height / 2, 0]}>
        <cylinderGeometry args={[0.12, 0.15, height, 8]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>

      {/* Top Post Finials */}
      <mesh position={[-width / 2 - 0.15, height + 0.15, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[width / 2 + 0.15, height + 0.15, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Guide Cable (Dark wire) */}
      <mesh position={[0, height - 0.28, 0]}>
        <boxGeometry args={[width, 0.02, 0.02]} />
        <meshStandardMaterial color="#1c1917" roughness={0.5} />
      </mesh>

      {/* Triangular Pennant Flags with subtle breeze animation */}
      <group ref={flagsGroupRef}>
        {flags.map((flag, idx) => (
          <mesh
            key={idx}
            position={[flag.x, flag.y, 0]}
            rotation={[0, 0, Math.PI + flag.rotationZ]}
          >
            <coneGeometry args={[0.18, 0.38, 3]} />
            <meshStandardMaterial
              color={flag.color}
              roughness={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const DistantScenery: React.FC = () => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);

  return (
    <group>
      {/* ========================================================
          1. NORTH HORIZON: HISTORIC FORT & HAVELI SILHOUETTE
             (Beyond Cultural Stage, Z: 58 to 80)
      ======================================================== */}
      <group position={[0, 0, 64]}>
        {/* Massive Sandstone Rampart Wall Base */}
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[94, 12, 4]} />
          <meshStandardMaterial color="#170f0b" roughness={0.95} />
        </mesh>

        {/* Crenelated Battlements along the wall top */}
        {Array.from({ length: 23 }).map((_, i) => (
          <mesh key={i} position={[-44 + i * 4, 12.6, 0]}>
            <boxGeometry args={[2.2, 1.2, 4.2]} />
            <meshStandardMaterial color="#1f140e" roughness={0.9} />
          </mesh>
        ))}

        {/* Central Grand Chhatri on Rampart */}
        <DistantChhatri position={[0, 12, 0]} scale={1.35} />

        {/* Mid-Flank Chhatris */}
        <DistantChhatri position={[-20, 12, 0]} scale={1.05} />
        <DistantChhatri position={[20, 12, 0]} scale={1.05} />

        {/* Outer Corner Fort Bastions */}
        <DistantChhatri position={[-38, 12, 0]} scale={0.95} />
        <DistantChhatri position={[38, 12, 0]} scale={0.95} />

        {/* Traditional Arched Jharokha Window Slits with Warm Golden Glow */}
        {[-30, -15, 0, 15, 30].map((wx, idx) => (
          <group key={idx} position={[wx, 7, -2.1]}>
            <mesh>
              <planeGeometry args={[1.6, 2.6]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#f59e0b"
                emissiveIntensity={1.4}
                toneMapped={false}
              />
            </mesh>
            {/* Jharokha Stone Frame */}
            <mesh position={[0, 1.4, 0.05]}>
              <boxGeometry args={[2.2, 0.3, 0.2]} />
              <meshStandardMaterial color="#2a1810" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================
          2. WEST HORIZON: TRADITIONAL HAVELI COURTYARDS
             (Beyond Bazaar, X: -54, Z: 5)
      ======================================================== */}
      <group position={[-54, 0, 8]}>
        {/* Haveli Facade Wall */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[4, 10, 60]} />
          <meshStandardMaterial color="#160e0a" roughness={0.95} />
        </mesh>
        {/* Rooftop Chhatris */}
        <DistantChhatri position={[0, 10, -18]} scale={0.95} />
        <DistantChhatri position={[0, 10, 6]} scale={1.1} />
        <DistantChhatri position={[0, 10, 24]} scale={0.95} />

        {/* Warm Window Glows */}
        {[-15, 0, 15].map((wz, idx) => (
          <mesh key={idx} position={[2.1, 5.5, wz]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.5, 2.2]} />
            <meshStandardMaterial
              color="#fed7aa"
              emissive="#ea580c"
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          3. EAST HORIZON: DISTANT FAIRGROUND & FESTIVAL CANOPIES
             (Beyond Ferris Wheel & Games, X: 54, Z: 10)
      ======================================================== */}
      <group position={[54, 0, 10]}>
        {/* Outer Pavilion Wall */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[4, 10, 60]} />
          <meshStandardMaterial color="#160e0a" roughness={0.95} />
        </mesh>
        <DistantChhatri position={[0, 10, -12]} scale={0.95} />
        <DistantChhatri position={[0, 10, 14]} scale={1.05} />

        {/* Distant Colorful Festival Canopies / Shamianas */}
        {[
          { z: -20, col: '#be123c' },
          { z: 0, col: '#ea580c' },
          { z: 22, col: '#0891b2' },
        ].map((tent, idx) => (
          <group key={idx} position={[-2, 10.5, tent.z]}>
            <mesh rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[3.2, 2.8, 4]} />
              <meshStandardMaterial color={tent.col} roughness={0.7} />
            </mesh>
            {/* Canopy Golden Finial */}
            <mesh position={[0, 1.8, 0]}>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================
          4. SOUTH HORIZON: DISTANT DECORATIVE TORAN APPROACH
             (Distant lanterns framing the approach)
      ======================================================== */}
      {/* Placed far back so it never obstructs entrance or camera */}
      <group position={[0, 0, -65]}>
        <DistantChhatri position={[-28, 8, 0]} scale={1.0} />
        <DistantChhatri position={[28, 8, 0]} scale={1.0} />
      </group>

      {/* ========================================================
          5. OVERHEAD FESTIVE BUNTING ACROSS MAIN PROMENADE
             (Between Z: -18 and Z: 24, at height 5.4m)
      ======================================================== */}
      {/* 6 Cross-Bunting Festoons overhead */}
      <OverheadBuntingSpan z={-16} width={8.6} />
      <OverheadBuntingSpan z={-8} width={8.6} />
      <OverheadBuntingSpan z={0} width={8.6} />
      <OverheadBuntingSpan z={8} width={8.6} />
      <OverheadBuntingSpan z={16} width={8.6} />
      <OverheadBuntingSpan z={24} width={8.6} />

      {/* On High graphics setting: Distant Twinkling Battlement Fairy Lights */}
      {quality === 'high' && (
        <group position={[0, 12.8, 62]}>
          {Array.from({ length: 18 }).map((_, i) => (
            <mesh key={i} position={[-38 + i * 4.4, 0, 0]}>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#f59e0b"
                emissiveIntensity={2.0}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
