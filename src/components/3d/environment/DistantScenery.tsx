import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';
import { useInputStore } from '../../../stores/useInputStore';

// ========================================================
// 1. DESKTOP DETAILED ARCHITECTURAL COMPONENTS
//    (Full fidelity for desktop / high-end hardware)
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
// 2. MOBILE STREAMLINED ARCHITECTURAL SILHOUETTE COMPONENTS
//    (Low-overhead LOD for mobile WebGL / touch devices)
//    Retains full skyline massing, dome/spire shapes, and warm
//    festival window illumination while reducing draw calls by ~80%.
// ========================================================

// Mobile Streamlined Bastion Tower (3 meshes vs 17)
const MobileBastionTower: React.FC<{
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
      {/* Domed Roof Silhouette */}
      <mesh position={[0, height + 0.9, 0]}>
        <sphereGeometry args={[radius * 0.65, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#1e130d" roughness={0.88} />
      </mesh>
      {/* Glowing Golden Finial Beacon */}
      <mesh position={[0, height + 1.9, 0]}>
        <sphereGeometry args={[0.26, 6, 6]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// Mobile Streamlined Temple Spire (3 meshes vs 8)
const MobileTempleSpire: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Mandapa Sanctum Base */}
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[6.5, 6.0, 6.5]} />
        <meshStandardMaterial color="#1b120c" roughness={0.92} />
      </mesh>
      {/* Stepped Shikhara Spire Pyramid */}
      <mesh position={[0, 10.5, 0]}>
        <coneGeometry args={[3.2, 9.0, 6]} />
        <meshStandardMaterial color="#20150e" roughness={0.88} />
      </mesh>
      {/* Glowing Sacred Kalash Finial */}
      <mesh position={[0, 15.6, 0]}>
        <sphereGeometry args={[0.35, 6, 6]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// Mobile Streamlined Haveli Townhouse Block (3-4 meshes vs 21)
const MobileHaveli: React.FC<{
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  rotationY?: number;
  hasDome?: boolean;
}> = ({ position, width, height, depth, rotationY = 0, hasDome = false }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main Townhouse Mass */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#1a110d" roughness={0.94} />
      </mesh>
      {/* Parapet / Cornice Eaves */}
      <mesh position={[0, height + 0.25, 0]}>
        <boxGeometry args={[width + 0.4, 0.5, depth + 0.4]} />
        <meshStandardMaterial color="#281a13" roughness={0.88} />
      </mesh>
      {/* Front Glowing Window Band */}
      <mesh position={[0, height * 0.55, depth / 2 + 0.05]}>
        <planeGeometry args={[width * 0.75, 1.8]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#ea580c"
          emissiveIntensity={1.3}
          toneMapped={false}
        />
      </mesh>
      {/* Optional Rooftop Lotus Dome */}
      {hasDome && (
        <mesh position={[0, height + 1.6, 0]}>
          <sphereGeometry args={[1.8, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#1e130d" roughness={0.85} />
        </mesh>
      )}
    </group>
  );
};

// Mobile Lightweight Bunting Span (Zero per-frame animation loops, 6 meshes vs 21)
const MobileBuntingSpan: React.FC<{
  z: number;
  width?: number;
  height?: number;
}> = ({ z, width = 8.6, height = 5.4 }) => {
  const flags = useMemo(() => {
    const colors = ['#ea580c', '#f59e0b', '#be123c', '#0891b2', '#15803d'];
    const count = 5;
    return Array.from({ length: count }).map((_, i) => {
      const t = (i + 0.5) / count;
      const x = -width / 2 + t * width;
      const sag = Math.sin(t * Math.PI) * 0.5;
      return { x, y: height - sag - 0.25, color: colors[i % colors.length] };
    });
  }, [width, height]);

  return (
    <group position={[0, 0, z]}>
      {/* Side Posts */}
      <mesh position={[-width / 2 - 0.15, height / 2, 0]}>
        <cylinderGeometry args={[0.12, 0.15, height, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
      <mesh position={[width / 2 + 0.15, height / 2, 0]}>
        <cylinderGeometry args={[0.12, 0.15, height, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
      {/* Guide Cable */}
      <mesh position={[0, height - 0.26, 0]}>
        <boxGeometry args={[width, 0.03, 0.03]} />
        <meshStandardMaterial color="#1c1917" roughness={0.5} />
      </mesh>
      {/* 5 Static Festoon Pennants */}
      {flags.map((flag, idx) => (
        <mesh key={idx} position={[flag.x, flag.y, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.26, 0.5, 3]} />
          <meshStandardMaterial color={flag.color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

// ========================================================
// 3. FULL DESKTOP DISTANT SCENERY
// ========================================================

const DesktopDistantScenery: React.FC<{ quality: string }> = ({ quality }) => {
  return (
    <group>
      {/* 1. NORTH HORIZON */}
      <group position={[0, 0, 64]}>
        <mesh position={[0, 6.2, 0]}>
          <boxGeometry args={[104, 12.4, 4.4]} />
          <meshStandardMaterial color="#160e0a" roughness={0.96} />
        </mesh>

        {Array.from({ length: 26 }).map((_, i) => (
          <mesh key={i} position={[-50 + i * 4, 13.0, 0]}>
            <boxGeometry args={[2.2, 1.4, 4.6]} />
            <meshStandardMaterial color="#1e130d" roughness={0.92} />
          </mesh>
        ))}

        <FortBastionTower position={[-48, 0, 0]} height={15.5} radius={3.8} />
        <FortBastionTower position={[48, 0, 0]} height={15.5} radius={3.8} />

        <DistantChhatri position={[0, 12.4, 0]} scale={1.4} />
        <DistantChhatri position={[-24, 12.4, 0]} scale={1.05} />
        <DistantChhatri position={[24, 12.4, 0]} scale={1.05} />

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

        <TempleSpire position={[-32, 0, 12]} scale={1.15} />
        <TempleSpire position={[30, 0, 14]} scale={1.1} />

        <group position={[0, 0, 16]}>
          <mesh position={[0, 9, 0]}>
            <boxGeometry args={[24, 18, 10]} />
            <meshStandardMaterial color="#140c09" roughness={0.95} />
          </mesh>
          <mesh position={[0, 19.5, 0]}>
            <sphereGeometry args={[4.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#1c110b" roughness={0.88} />
          </mesh>
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

        <mesh position={[0, 8, 32]}>
          <boxGeometry args={[160, 24, 4]} />
          <meshBasicMaterial color="#080c1a" fog />
        </mesh>
      </group>

      {/* 2. WEST HORIZON */}
      <group position={[-56, 0, 6]}>
        <mesh position={[0, 5.5, 0]}>
          <boxGeometry args={[5, 11, 72]} />
          <meshStandardMaterial color="#150d09" roughness={0.96} />
        </mesh>

        <HaveliTownhouse
          position={[4, 0, 22]}
          width={10}
          height={11.5}
          depth={14}
          rotationY={Math.PI / 2}
          windowCount={3}
          hasChhatri
        />
        <HaveliTownhouse
          position={[3, 0, 2]}
          width={12}
          height={13.5}
          depth={16}
          rotationY={Math.PI / 2}
          windowCount={4}
          hasChhatri
        />
        <HaveliTownhouse
          position={[4, 0, -18]}
          width={10}
          height={10.5}
          depth={14}
          rotationY={Math.PI / 2}
          windowCount={3}
          hasChhatri
        />
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

        <FortBastionTower position={[2, 0, -38]} height={14} radius={3.6} />

        <mesh position={[-28, 6, 0]}>
          <boxGeometry args={[4, 20, 110]} />
          <meshBasicMaterial color="#070b18" fog />
        </mesh>
      </group>

      {/* 3. EAST HORIZON */}
      <group position={[56, 0, 6]}>
        <mesh position={[0, 5.0, 0]}>
          <boxGeometry args={[5, 10, 72]} />
          <meshStandardMaterial color="#150d09" roughness={0.96} />
        </mesh>

        <FortBastionTower position={[-2, 0, -38]} height={13.5} radius={3.6} />

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
        <HaveliTownhouse
          position={[-3, 0, -18]}
          width={9}
          height={7.8}
          depth={12}
          rotationY={-Math.PI / 2}
          windowCount={2}
        />

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
            <mesh position={[0, 1.9, 0]}>
              <sphereGeometry args={[0.26, 8, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        ))}

        <HaveliTownhouse
          position={[14, 0, 16]}
          width={12}
          height={14}
          depth={18}
          rotationY={-Math.PI / 2}
          windowCount={3}
        />

        <mesh position={[28, 6, 0]}>
          <boxGeometry args={[4, 20, 110]} />
          <meshBasicMaterial color="#070b18" fog />
        </mesh>
      </group>

      {/* 4. SOUTH HORIZON */}
      <group position={[0, 0, -66]}>
        <group position={[-28, 0, 0]}>
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[12, 9, 8]} />
            <meshStandardMaterial color="#160e0a" roughness={0.95} />
          </mesh>
          <DistantChhatri position={[0, 9.4, 0]} scale={1.05} />
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

        <group position={[28, 0, 0]}>
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[12, 9, 8]} />
            <meshStandardMaterial color="#160e0a" roughness={0.95} />
          </mesh>
          <DistantChhatri position={[0, 9.4, 0]} scale={1.05} />
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

        <mesh position={[0, 5, -16]}>
          <boxGeometry args={[120, 14, 4]} />
          <meshBasicMaterial color="#070a18" fog />
        </mesh>
      </group>

      {/* 5. OVERHEAD FESTIVE BUNTING */}
      <OverheadBuntingSpan z={-16} width={8.6} />
      <OverheadBuntingSpan z={-8} width={8.6} />
      <OverheadBuntingSpan z={0} width={8.6} />
      <OverheadBuntingSpan z={8} width={8.6} />
      <OverheadBuntingSpan z={16} width={8.6} />
      <OverheadBuntingSpan z={24} width={8.6} />

      {/* 6. SPARKLING BATTLEMENT FAIRY LIGHTS */}
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

// ========================================================
// 4. MOBILE STREAMLINED DISTANT SCENERY
// ========================================================

const MobileDistantScenery: React.FC = () => {
  return (
    <group>
      {/* 1. NORTH HORIZON (Rampart, Bastions, Palace Dome & Spire Silhouettes) */}
      <group position={[0, 0, 64]}>
        {/* Continuous Rampart Sandstone Wall */}
        <mesh position={[0, 6.2, 0]}>
          <boxGeometry args={[104, 12.4, 4.4]} />
          <meshStandardMaterial color="#160e0a" roughness={0.96} />
        </mesh>

        {/* Unified Battlement Cap */}
        <mesh position={[0, 12.9, 0]}>
          <boxGeometry args={[104, 1.0, 4.6]} />
          <meshStandardMaterial color="#1e130d" roughness={0.92} />
        </mesh>

        {/* Flanking Bastion Towers */}
        <MobileBastionTower position={[-48, 0, 0]} height={15.5} radius={3.8} />
        <MobileBastionTower position={[48, 0, 0]} height={15.5} radius={3.8} />

        {/* Central Royal Chhatri Silhouette with Warm Glow */}
        <group position={[0, 12.4, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[5.0, 0.8, 5.0]} />
            <meshStandardMaterial color="#19110c" roughness={0.92} />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <sphereGeometry args={[2.4, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#1e130d" roughness={0.85} />
          </mesh>
          <mesh position={[0, 5.8, 0]}>
            <sphereGeometry args={[0.35, 6, 6]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <sphereGeometry args={[0.5, 6, 6]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Mid-Flank Chhatri Domes */}
        {[-24, 24].map((px, idx) => (
          <group key={idx} position={[px, 12.4, 0]}>
            <mesh position={[0, 2.0, 0]}>
              <sphereGeometry args={[1.8, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <meshStandardMaterial color="#1e130d" roughness={0.85} />
            </mesh>
            <mesh position={[0, 4.0, 0]}>
              <sphereGeometry args={[0.25, 6, 6]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#f59e0b"
                emissiveIntensity={1.8}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* Warm Golden Jharokha Windows along the Rampart */}
        {[-36, -20, -6, 6, 20, 36].map((wx, idx) => (
          <mesh key={idx} position={[wx, 7.5, -2.3]}>
            <planeGeometry args={[1.7, 2.8]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* West & East Nagara Temple Spires Rising Behind Rampart */}
        <MobileTempleSpire position={[-32, 0, 12]} scale={1.15} />
        <MobileTempleSpire position={[30, 0, 14]} scale={1.1} />

        {/* Historic Palace Pavilion with Lotus Dome (Z: 78) */}
        <group position={[0, 0, 16]}>
          <mesh position={[0, 9, 0]}>
            <boxGeometry args={[24, 18, 10]} />
            <meshStandardMaterial color="#140c09" roughness={0.95} />
          </mesh>
          <mesh position={[0, 19.5, 0]}>
            <sphereGeometry args={[4.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#1c110b" roughness={0.88} />
          </mesh>
          <mesh position={[0, 24.2, 0]}>
            <sphereGeometry args={[0.45, 6, 6]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Nocturnal Hill Silhouette */}
        <mesh position={[0, 8, 32]}>
          <boxGeometry args={[160, 24, 4]} />
          <meshBasicMaterial color="#080c1a" fog />
        </mesh>
      </group>

      {/* 2. WEST HORIZON (Old City Haveli Bazaar Skyline) */}
      <group position={[-56, 0, 6]}>
        {/* Haveli Fortified Wall */}
        <mesh position={[0, 5.5, 0]}>
          <boxGeometry args={[5, 11, 72]} />
          <meshStandardMaterial color="#150d09" roughness={0.96} />
        </mesh>

        {/* Front Haveli Townhouses with Warm Jali Glow */}
        <MobileHaveli position={[4, 0, 22]} width={10} height={11.5} depth={14} rotationY={Math.PI / 2} hasDome />
        <MobileHaveli position={[3, 0, 2]} width={12} height={13.5} depth={16} rotationY={Math.PI / 2} hasDome />
        <MobileHaveli position={[4, 0, -18]} width={10} height={10.5} depth={14} rotationY={Math.PI / 2} hasDome />

        {/* Far Background Haveli Mass */}
        <mesh position={[-12, 8, 0]}>
          <boxGeometry args={[14, 16, 44]} />
          <meshStandardMaterial color="#120a07" roughness={0.96} />
        </mesh>

        {/* Corner Bastion */}
        <MobileBastionTower position={[2, 0, -38]} height={14} radius={3.6} />

        {/* Distant Western Ridge Silhouette */}
        <mesh position={[-28, 6, 0]}>
          <boxGeometry args={[4, 20, 110]} />
          <meshBasicMaterial color="#070b18" fog />
        </mesh>
      </group>

      {/* 3. EAST HORIZON (Carnival Quarter, Canopies & Moon Frame) */}
      <group position={[56, 0, 6]}>
        {/* Outer Wall */}
        <mesh position={[0, 5.0, 0]}>
          <boxGeometry args={[5, 10, 72]} />
          <meshStandardMaterial color="#150d09" roughness={0.96} />
        </mesh>

        {/* East Corner Bastion */}
        <MobileBastionTower position={[-2, 0, -38]} height={13.5} radius={3.6} />

        {/* North-East Carnival Quarter Havelis */}
        <MobileHaveli position={[-3, 0, 20]} width={11} height={12.5} depth={15} rotationY={-Math.PI / 2} hasDome />
        <MobileHaveli position={[-2, 0, 6]} width={10} height={10.5} depth={12} rotationY={-Math.PI / 2} />

        {/* South-East Ghat Pavilions (Restrained Height: 7.8m to preserve clear view of Moon!) */}
        <MobileHaveli position={[-3, 0, -18]} width={9} height={7.8} depth={12} rotationY={-Math.PI / 2} />

        {/* Distant Festive Canopies */}
        {[
          { z: -8, col: '#be123c', h: 9.5 },
          { z: 12, col: '#ea580c', h: 11.5 },
          { z: 28, col: '#0891b2', h: 10.5 },
        ].map((tent, idx) => (
          <mesh key={idx} position={[-2, tent.h, tent.z]} rotation={[0, Math.PI * 0.25, 0]}>
            <coneGeometry args={[3.4, 3.0, 4]} />
            <meshStandardMaterial color={tent.col} roughness={0.75} />
          </mesh>
        ))}

        {/* Far Background East Town Mass */}
        <mesh position={[14, 7, 16]}>
          <boxGeometry args={[12, 14, 24]} />
          <meshStandardMaterial color="#120a07" roughness={0.96} />
        </mesh>

        {/* Distant Eastern Ridge Silhouette */}
        <mesh position={[28, 6, 0]}>
          <boxGeometry args={[4, 20, 110]} />
          <meshBasicMaterial color="#070b18" fog />
        </mesh>
      </group>

      {/* 4. SOUTH HORIZON (Arrival Road Gatehouse) */}
      <group position={[0, 0, -66]}>
        {/* Left Gatehouse Bastion Pavilion */}
        <group position={[-28, 0, 0]}>
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[12, 9, 8]} />
            <meshStandardMaterial color="#160e0a" roughness={0.95} />
          </mesh>
          <mesh position={[0, 10.5, 0]}>
            <sphereGeometry args={[2.2, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#1e130d" roughness={0.85} />
          </mesh>
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
          <mesh position={[0, 10.5, 0]}>
            <sphereGeometry args={[2.2, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#1e130d" roughness={0.85} />
          </mesh>
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

        {/* Far Background Distant Village Silhouette */}
        <mesh position={[0, 5, -16]}>
          <boxGeometry args={[120, 14, 4]} />
          <meshBasicMaterial color="#070a18" fog />
        </mesh>
      </group>

      {/* 5. OVERHEAD FESTIVE BUNTING (Mobile Lightweight - 0 CPU useFrame overhead) */}
      <MobileBuntingSpan z={-16} width={8.6} />
      <MobileBuntingSpan z={-8} width={8.6} />
      <MobileBuntingSpan z={0} width={8.6} />
      <MobileBuntingSpan z={8} width={8.6} />
      <MobileBuntingSpan z={16} width={8.6} />
      <MobileBuntingSpan z={24} width={8.6} />
    </group>
  );
};

// ========================================================
// 5. MAIN DISTANT SCENERY & WORLD DEPTH COMPONENT
// ========================================================

export const DistantScenery: React.FC = () => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const isTouchDevice = useInputStore((s) => s.isTouchDevice);

  // Mobile / touch devices or low-spec mode uses streamlined LOD silhouettes
  const isMobile = isTouchDevice || quality === 'low';

  if (isMobile) {
    return <MobileDistantScenery />;
  }

  return <DesktopDistantScenery quality={quality} />;
};
