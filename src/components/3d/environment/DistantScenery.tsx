import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';

// ========================================================
// 1. SHARED DISTANT ARCHITECTURAL COMPONENTS
// ========================================================

// Traditional Chhatri (Domed Rooftop Pavilion)
const DistantChhatri: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Plinth Platform */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[4.2, 0.8, 4.2]} />
        <meshStandardMaterial color="#19110c" roughness={0.92} />
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
          <meshStandardMaterial color="#241812" roughness={0.88} />
        </mesh>
      ))}

      {/* Scalloped Eaves / Chhajja */}
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[4.6, 0.3, 4.6]} />
        <meshStandardMaterial color="#2b1c15" roughness={0.82} />
      </mesh>

      {/* Ribbed Traditional Lotus Dome (Gumbad) */}
      <mesh position={[0, 5.5, 0]}>
        <sphereGeometry args={[2.0, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#1e130d" roughness={0.85} />
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
          emissiveIntensity={0.8}
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

// Traditional Indian Temple Spire (Nagara Shikhara)
const TempleSpire: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Sanctum Plinth (Mandapa Base) */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[6.5, 4.4, 6.5]} />
        <meshStandardMaterial color="#1b120c" roughness={0.92} />
      </mesh>

      {/* Stepped Shikhara Spire Body */}
      <mesh position={[0, 6.8, 0]}>
        <boxGeometry args={[5.2, 5.0, 5.2]} />
        <meshStandardMaterial color="#20150e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 10.8, 0]}>
        <boxGeometry args={[4.0, 3.6, 4.0]} />
        <meshStandardMaterial color="#1e140d" roughness={0.88} />
      </mesh>
      <mesh position={[0, 13.8, 0]}>
        <coneGeometry args={[2.8, 3.2, 8]} />
        <meshStandardMaterial color="#1b120c" roughness={0.88} />
      </mesh>

      {/* Ribbed Crown Disk (Amalaka) */}
      <mesh position={[0, 15.6, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.5, 12]} />
        <meshStandardMaterial color="#261912" roughness={0.8} />
      </mesh>

      {/* Sacred Radiant Kalash & Dhvaja Finial */}
      <mesh position={[0, 16.5, 0]}>
        <cylinderGeometry args={[0.12, 0.35, 1.3, 8]} />
        <meshStandardMaterial color="#d97706" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, 17.3, 0]}>
        <sphereGeometry args={[0.26, 8, 8]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>

      {/* Glowing Sanctum Entrance Niche */}
      <mesh position={[0, 2.0, 3.3]}>
        <planeGeometry args={[1.6, 2.8]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={1.9}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// Octagonal Fortress Bastion Tower
const FortBastionTower: React.FC<{
  position: [number, number, number];
  height?: number;
  radius?: number;
}> = ({ position, height = 14, radius = 3.6 }) => {
  return (
    <group position={position}>
      {/* Tapered Octagonal Tower Body */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius, height, 8]} />
        <meshStandardMaterial color="#180f0b" roughness={0.95} />
      </mesh>

      {/* Machicolation Cornice Shelf */}
      <mesh position={[0, height + 0.35, 0]}>
        <cylinderGeometry args={[radius * 1.15, radius * 0.95, 0.7, 8]} />
        <meshStandardMaterial color="#241711" roughness={0.88} />
      </mesh>

      {/* Parapet Crenellations */}
      <mesh position={[0, height + 1.1, 0]}>
        <cylinderGeometry args={[radius * 1.12, radius * 1.12, 0.8, 8, 1, true]} />
        <meshStandardMaterial color="#1e130e" roughness={0.92} />
      </mesh>

      {/* Crown Chhatri Pavilion */}
      <DistantChhatri position={[0, height + 0.7, 0]} scale={0.9} />

      {/* Vertical Arch Window Slits with Warm Firelight */}
      {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((rot, idx) => (
        <group key={idx} rotation={[0, rot, 0]}>
          <mesh position={[0, height * 0.55, radius * 0.92]}>
            <planeGeometry args={[0.7, 1.8]} />
            <meshStandardMaterial
              color="#fed7aa"
              emissive="#ea580c"
              emissiveIntensity={1.3}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Modular Stepped Haveli Townhouse Block
const HaveliTownhouse: React.FC<{
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  rotationY?: number;
  windowCount?: number;
  hasChhatri?: boolean;
}> = ({
  position,
  width,
  height,
  depth,
  rotationY = 0,
  windowCount = 3,
  hasChhatri = false,
}) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main Townhouse Plinth & Body */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#1a110d" roughness={0.94} />
      </mesh>

      {/* Projecting Sandstone Eaves / Chhajja */}
      <mesh position={[0, height + 0.15, 0]}>
        <boxGeometry args={[width + 0.6, 0.28, depth + 0.6]} />
        <meshStandardMaterial color="#281a13" roughness={0.88} />
      </mesh>

      {/* Rooftop Parapet Wall */}
      <mesh position={[0, height + 0.65, 0]}>
        <boxGeometry args={[width + 0.3, 0.7, depth + 0.3]} />
        <meshStandardMaterial color="#1f140f" roughness={0.92} />
      </mesh>

      {/* Warm Incandescent Jali Screen Windows on Front Facade */}
      {Array.from({ length: windowCount }).map((_, i) => {
        const spacing = width / (windowCount + 1);
        const wx = -width / 2 + spacing * (i + 1);
        const wy = height * 0.55 + (i % 2 === 0 ? 0.6 : -0.6);
        return (
          <group key={i} position={[wx, wy, depth / 2 + 0.04]}>
            <mesh>
              <planeGeometry args={[1.1, 1.7]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive={i % 2 === 0 ? '#f59e0b' : '#ea580c'}
                emissiveIntensity={1.3}
                toneMapped={false}
              />
            </mesh>
            {/* Window Stone Lintel */}
            <mesh position={[0, 0.95, 0.04]}>
              <boxGeometry args={[1.4, 0.2, 0.12]} />
              <meshStandardMaterial color="#2d1c14" roughness={0.85} />
            </mesh>
          </group>
        );
      })}

      {/* Optional Rooftop Chhatri Pavilion */}
      {hasChhatri && (
        <DistantChhatri position={[0, height + 0.8, 0]} scale={0.78} />
      )}
    </group>
  );
};

// Overhead Festive Bunting Span Across Main Promenade
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
      // Natural Catenary sag
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

// ========================================================
// 2. MAIN DISTANT SCENERY & WORLD DEPTH COMPONENT
// ========================================================

export const DistantScenery: React.FC = () => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);

  return (
    <group>
      {/* ========================================================
          1. NORTH HORIZON: HISTORIC FORTRESS, PALACE & TEMPLE SILHOUETTES
             (Beyond Cultural Stage, Z: 62 to 88)
      ======================================================== */}
      <group position={[0, 0, 64]}>
        {/* Massive Sandstone Rampart Wall Base */}
        <mesh position={[0, 6.2, 0]}>
          <boxGeometry args={[104, 12.4, 4.4]} />
          <meshStandardMaterial color="#160e0a" roughness={0.96} />
        </mesh>

        {/* Crenelated Battlements along the wall top */}
        {Array.from({ length: 26 }).map((_, i) => (
          <mesh key={i} position={[-50 + i * 4, 13.0, 0]}>
            <boxGeometry args={[2.2, 1.4, 4.6]} />
            <meshStandardMaterial color="#1e130d" roughness={0.92} />
          </mesh>
        ))}

        {/* Massive Flanking Bastion Towers on North Wall */}
        <FortBastionTower position={[-48, 0, 0]} height={15.5} radius={3.8} />
        <FortBastionTower position={[48, 0, 0]} height={15.5} radius={3.8} />

        {/* Central Grand Chhatri on Rampart */}
        <DistantChhatri position={[0, 12.4, 0]} scale={1.4} />

        {/* Mid-Flank Chhatris */}
        <DistantChhatri position={[-24, 12.4, 0]} scale={1.05} />
        <DistantChhatri position={[24, 12.4, 0]} scale={1.05} />

        {/* Traditional Arched Jharokha Window Slits with Warm Golden Glow */}
        {[-36, -20, -6, 6, 20, 36].map((wx, idx) => (
          <group key={idx} position={[wx, 7.5, -2.3]}>
            <mesh>
              <planeGeometry args={[1.7, 2.8]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#f59e0b"
                emissiveIntensity={1.4}
                toneMapped={false}
              />
            </mesh>
            {/* Jharokha Carved Stone Frame & Bracket */}
            <mesh position={[0, 1.5, 0.06]}>
              <boxGeometry args={[2.3, 0.35, 0.24]} />
              <meshStandardMaterial color="#29170f" roughness={0.9} />
            </mesh>
            <mesh position={[0, -1.5, 0.06]}>
              <boxGeometry args={[2.0, 0.3, 0.2]} />
              <meshStandardMaterial color="#29170f" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* LAYER 2: Towers and Shikhara Rising Behind Fort Rampart (Z: 74 to 82) */}
        {/* West Nagara Temple Shikhara */}
        <TempleSpire position={[-32, 0, 12]} scale={1.15} />

        {/* East Nagara Temple Shikhara */}
        <TempleSpire position={[30, 0, 14]} scale={1.1} />

        {/* Historic Palace Pavilion with Gumbad Dome (Z: 78) */}
        <group position={[0, 0, 16]}>
          <mesh position={[0, 9, 0]}>
            <boxGeometry args={[24, 18, 10]} />
            <meshStandardMaterial color="#140c09" roughness={0.95} />
          </mesh>
          {/* Central Lotus Dome on Palace */}
          <mesh position={[0, 19.5, 0]}>
            <sphereGeometry args={[4.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#1c110b" roughness={0.88} />
          </mesh>
          {/* Palace Finial */}
          <mesh position={[0, 24.2, 0]}>
            <sphereGeometry args={[0.45, 8, 8]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* LAYER 3: Distant Nocturnal Hill Silhouette (Z: 96) */}
        <mesh position={[0, 8, 32]}>
          <boxGeometry args={[160, 24, 4]} />
          <meshBasicMaterial color="#080c1a" fog />
        </mesh>
      </group>

      {/* ========================================================
          2. WEST HORIZON: DENSE OLD CITY HAVELI BAZAAR TOWN
             (Beyond Handicrafts & Sweets, X: -54 to -74, Z: -26 to 34)
      ======================================================== */}
      <group position={[-56, 0, 6]}>
        {/* Primary Fortified Haveli Spine Wall */}
        <mesh position={[0, 5.5, 0]}>
          <boxGeometry args={[5, 11, 72]} />
          <meshStandardMaterial color="#150d09" roughness={0.96} />
        </mesh>

        {/* Multi-tier Stepped Townhouses & Havelis */}
        {/* North-West Haveli Block (Z: 24) */}
        <HaveliTownhouse
          position={[4, 0, 22]}
          width={10}
          height={11.5}
          depth={14}
          rotationY={Math.PI / 2}
          windowCount={3}
          hasChhatri
        />

        {/* Mid-West Merchant Haveli (Z: 4) */}
        <HaveliTownhouse
          position={[3, 0, 2]}
          width={12}
          height={13.5}
          depth={16}
          rotationY={Math.PI / 2}
          windowCount={4}
          hasChhatri
        />

        {/* South-West Artisan Quarter (Z: -18) */}
        <HaveliTownhouse
          position={[4, 0, -18]}
          width={10}
          height={10.5}
          depth={14}
          rotationY={Math.PI / 2}
          windowCount={3}
          hasChhatri
        />

        {/* Far Background Haveli Layer (X: -14 relative, actual X: -70) */}
        <HaveliTownhouse
          position={[-12, 0, 12]}
          width={14}
          height={16}
          depth={20}
          rotationY={Math.PI / 2}
          windowCount={4}
        />
        <HaveliTownhouse
          position={[-12, 0, -10]}
          width={14}
          height={15}
          depth={18}
          rotationY={Math.PI / 2}
          windowCount={3}
        />

        {/* West Corner Bastion anchoring the wall junction */}
        <FortBastionTower position={[2, 0, -38]} height={14} radius={3.6} />

        {/* LAYER 3: Distant Western Ridge Silhouette */}
        <mesh position={[-28, 6, 0]}>
          <boxGeometry args={[4, 20, 110]} />
          <meshBasicMaterial color="#070b18" fog />
        </mesh>
      </group>

      {/* ========================================================
          3. EAST HORIZON: FAIRGROUND CANOPIES, GHATS & TOWN
             (Beyond Ferris Wheel & Games, X: +54 to +74, Z: -26 to 34)
             *Height is restrained between Z: -22 and -10 to keep the
              celestial Moon (at [42, 28, -16]) fully visible and framed!*
      ======================================================== */}
      <group position={[56, 0, 6]}>
        {/* Primary Outer Wall */}
        <mesh position={[0, 5.0, 0]}>
          <boxGeometry args={[5, 10, 72]} />
          <meshStandardMaterial color="#150d09" roughness={0.96} />
        </mesh>

        {/* East Corner Bastion anchoring South-East wall junction */}
        <FortBastionTower position={[-2, 0, -38]} height={13.5} radius={3.6} />

        {/* North-East Carnival Quarter Townhouses (Z: 14 to 26 - well clear of moon) */}
        <HaveliTownhouse
          position={[-3, 0, 20]}
          width={11}
          height={12.5}
          depth={15}
          rotationY={-Math.PI / 2}
          windowCount={3}
          hasChhatri
        />
        <HaveliTownhouse
          position={[-2, 0, 6]}
          width={10}
          height={10.5}
          depth={12}
          rotationY={-Math.PI / 2}
          windowCount={3}
        />

        {/* Restrained Height South-East Ghat Pavilions (Z: -18, directly below Moon horizon) */}
        <HaveliTownhouse
          position={[-3, 0, -18]}
          width={9}
          height={7.8}
          depth={12}
          rotationY={-Math.PI / 2}
          windowCount={2}
        />

        {/* Distant Colorful Festival Canopies / Shamianas */}
        {[
          { z: -8, col: '#be123c', h: 9.5 },
          { z: 12, col: '#ea580c', h: 11.5 },
          { z: 28, col: '#0891b2', h: 10.5 },
        ].map((tent, idx) => (
          <group key={idx} position={[-2, tent.h, tent.z]}>
            <mesh rotation={[0, Math.PI * 0.25, 0]}>
              <coneGeometry args={[3.4, 3.0, 4]} />
              <meshStandardMaterial color={tent.col} roughness={0.75} />
            </mesh>
            {/* Canopy Golden Finial */}
            <mesh position={[0, 1.9, 0]}>
              <sphereGeometry args={[0.26, 8, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        ))}

        {/* Far Background East Town Silhouette (X: +18 relative, actual X: +74) */}
        <HaveliTownhouse
          position={[14, 0, 16]}
          width={12}
          height={14}
          depth={18}
          rotationY={-Math.PI / 2}
          windowCount={3}
        />

        {/* LAYER 3: Distant Eastern Ridge Silhouette */}
        <mesh position={[28, 6, 0]}>
          <boxGeometry args={[4, 20, 110]} />
          <meshBasicMaterial color="#070b18" fog />
        </mesh>
      </group>

      {/* ========================================================
          4. SOUTH HORIZON: DISTANT TOWN ENTRANCE APPROACH
             (Framing the arrival road, Z: -62 to -78)
      ======================================================== */}
      <group position={[0, 0, -66]}>
        {/* Left Gatehouse Bastion Pavilion */}
        <group position={[-28, 0, 0]}>
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[12, 9, 8]} />
            <meshStandardMaterial color="#160e0a" roughness={0.95} />
          </mesh>
          <DistantChhatri position={[0, 9.4, 0]} scale={1.05} />
          {/* Warm Archway Window */}
          <mesh position={[0, 4.2, 4.1]}>
            <planeGeometry args={[1.6, 2.5]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={1.3}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Right Gatehouse Bastion Pavilion */}
        <group position={[28, 0, 0]}>
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[12, 9, 8]} />
            <meshStandardMaterial color="#160e0a" roughness={0.95} />
          </mesh>
          <DistantChhatri position={[0, 9.4, 0]} scale={1.05} />
          {/* Warm Archway Window */}
          <mesh position={[0, 4.2, 4.1]}>
            <planeGeometry args={[1.6, 2.5]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={1.3}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Far Background Distant Village Roofline Silhouette (Z: -82) */}
        <mesh position={[0, 5, -16]}>
          <boxGeometry args={[120, 14, 4]} />
          <meshBasicMaterial color="#070a18" fog />
        </mesh>
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

      {/* ========================================================
          6. SPARKLING BATTLEMENT FAIRY LIGHTS & ROOFTOP DIYAS
             (Festive illumination along the historic parapet)
      ======================================================== */}
      {quality !== 'low' && (
        <group position={[0, 13.8, 62]}>
          {Array.from({ length: 24 }).map((_, i) => (
            <mesh key={i} position={[-48 + i * 4.1, 0, 0]}>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#f59e0b"
                emissiveIntensity={2.2}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
