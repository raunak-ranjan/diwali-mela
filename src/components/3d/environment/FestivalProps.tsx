import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';

// --- 1. TRADITIONAL MARIGOLD GARLAND SWAG ---
export const MarigoldGarland: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  sag?: number;
  count?: number;
  flowerSize?: number;
  sway?: boolean;
}> = ({ start, end, sag = 0.35, count = 14, flowerSize = 0.09, sway = true }) => {
  const garlandRef = useRef<THREE.Group>(null);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const flowers = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; color: string }> = [];
    const orange = '#ea580c';
    const yellow = '#f59e0b';

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = start[0] + (end[0] - start[0]) * t;
      const yBase = start[1] + (end[1] - start[1]) * t;
      const z = start[2] + (end[2] - start[2]) * t;
      // Parabolic catenary sag
      const y = yBase - Math.sin(t * Math.PI) * sag;

      list.push({
        pos: [x, y, z],
        color: i % 2 === 0 ? orange : yellow,
      });
    }
    return list;
  }, [start, end, sag, count]);

  // Subtle living festive sway in gentle evening breeze
  useFrame(({ clock }) => {
    if (garlandRef.current && sway && !reducedMotion) {
      const t = clock.getElapsedTime();
      garlandRef.current.rotation.x = Math.sin(t * 1.3 + start[0] * 1.2 + start[2]) * 0.024;
    }
  });

  return (
    <group ref={garlandRef}>
      {flowers.map((f, idx) => (
        <group key={idx} position={f.pos}>
          {/* Flower Blossom Head */}
          <mesh castShadow>
            <dodecahedronGeometry args={[flowerSize, 1]} />
            <meshStandardMaterial
              color={f.color}
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
          {/* Green Leaf Accent on every 3rd flower */}
          {idx % 3 === 0 && (
            <mesh position={[0, flowerSize * 0.7, 0]} rotation={[0, 0, 0.4]}>
              <boxGeometry args={[flowerSize * 0.8, flowerSize * 0.25, flowerSize * 1.5]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// --- 2. EMBOSSED BRASS THALI (SERVING PLATTER) ---
export const BrassThali: React.FC<{ radius?: number }> = ({ radius = 0.45 }) => {
  return (
    <group>
      {/* Platter Base */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius * 0.9, 0.03, 24]} />
        <meshStandardMaterial
          color="#d97706"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
      {/* Raised Rim */}
      <mesh position={[0, 0.025, 0]}>
        <torusGeometry args={[radius * 0.98, 0.02, 8, 24]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

// --- 3. MOTICHOOR LADDOO PYRAMID ---
export const LaddooPlate: React.FC<{ position?: [number, number, number] }> = ({
  position = [0, 0, 0],
}) => {
  const laddooPositions: Array<[number, number, number]> = useMemo(() => {
    const list: Array<[number, number, number]> = [];
    // Base ring (7 laddoos)
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      list.push([Math.cos(angle) * 0.16, 0.06, Math.sin(angle) * 0.16]);
    }
    // Inner center base
    list.push([0, 0.06, 0]);
    // Middle tier (4 laddoos)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.4;
      list.push([Math.cos(angle) * 0.09, 0.14, Math.sin(angle) * 0.09]);
    }
    // Top crown laddoo
    list.push([0, 0.22, 0]);
    return list;
  }, []);

  return (
    <group position={position}>
      <BrassThali radius={0.32} />
      {laddooPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh castShadow>
            <dodecahedronGeometry args={[0.055, 1]} />
            <meshStandardMaterial
              color="#f59e0b" // Saffron gold boondi
              roughness={0.7}
              metalness={0.08}
            />
          </mesh>
          {/* Pistachio / Silver speck */}
          {idx % 2 === 0 && (
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.015, 0.015, 0.015]} />
              <meshStandardMaterial color="#84cc16" roughness={0.6} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// --- 4. CRISPY SAFFRON JALEBI TRAY ---
export const JalebiPlate: React.FC<{ position?: [number, number, number] }> = ({
  position = [0, 0, 0],
}) => {
  const jalebis: Array<{ pos: [number, number, number]; rot: number }> = useMemo(() => {
    return [
      { pos: [-0.1, 0.04, -0.08], rot: 0.2 },
      { pos: [0.12, 0.04, -0.05], rot: 0.9 },
      { pos: [-0.08, 0.04, 0.1], rot: 1.7 },
      { pos: [0.09, 0.04, 0.09], rot: 2.4 },
      { pos: [0.0, 0.07, 0.0], rot: 0.6 },
    ];
  }, []);

  return (
    <group position={position}>
      <BrassThali radius={0.32} />
      {jalebis.map((j, idx) => (
        <group key={idx} position={j.pos} rotation={[0, j.rot, 0]}>
          {/* Outer spiral ring */}
          <mesh castShadow>
            <torusGeometry args={[0.08, 0.022, 8, 16]} />
            <meshStandardMaterial
              color="#ea580c"
              emissive="#f59e0b"
              emissiveIntensity={0.25}
              roughness={0.25}
              metalness={0.15}
            />
          </mesh>
          {/* Inner spiral loop */}
          <mesh position={[0.02, 0.01, 0]}>
            <torusGeometry args={[0.045, 0.02, 8, 12]} />
            <meshStandardMaterial
              color="#ea580c"
              emissive="#f59e0b"
              emissiveIntensity={0.25}
              roughness={0.25}
              metalness={0.15}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// --- 5. GULAB JAMUN BRONZE HANDI ---
export const GulabJamunHandi: React.FC<{ position?: [number, number, number] }> = ({
  position = [0, 0, 0],
}) => {
  const jamuns: Array<[number, number, number]> = [
    [-0.08, 0.16, -0.07],
    [0.08, 0.16, -0.06],
    [-0.07, 0.16, 0.08],
    [0.07, 0.16, 0.07],
    [0, 0.18, 0],
  ];

  return (
    <group position={position}>
      {/* Traditional Indian Handi (Pot) */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.26, 0.16, 0.22, 20]} />
        <meshStandardMaterial
          color="#92400e" // Dark bronze
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      {/* Handi Rim */}
      <mesh position={[0, 0.21, 0]}>
        <torusGeometry args={[0.26, 0.025, 8, 20]} />
        <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Cardamom Sugar Syrup Surface */}
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 20]} />
        <meshStandardMaterial
          color="#78350f"
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      {/* Plump Dark Brown Gulab Jamuns */}
      {jamuns.map((pos, idx) => (
        <mesh key={idx} position={pos} castShadow>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial
            color="#271105" // Deep fried milk solid dumplings
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

// --- 6. TRADITIONAL IRON KADHAI (WOK) WITH SAMOSAS ---
export const SamosaKadhai: React.FC<{ position?: [number, number, number] }> = ({
  position = [0, 0, 0],
}) => {
  const samosas: Array<{ pos: [number, number, number]; rot: number }> = [
    { pos: [-0.15, 0.18, -0.1], rot: 0.3 },
    { pos: [0.16, 0.18, -0.08], rot: 1.1 },
    { pos: [-0.08, 0.18, 0.14], rot: 2.2 },
    { pos: [0.12, 0.18, 0.12], rot: 0.7 },
    { pos: [0.0, 0.2, 0.0], rot: 1.9 },
  ];

  return (
    <group position={position}>
      {/* Clay / Brick Chulha Stove Base */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.24, 16]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>

      {/* Heavy Cast Iron Kadhai Body */}
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.22, 0.26, 20]} />
        <meshStandardMaterial
          color="#1e293b" // Wrought iron
          metalness={0.7}
          roughness={0.5}
        />
      </mesh>
      {/* Iron Rim */}
      <mesh position={[0, 0.39, 0]}>
        <torusGeometry args={[0.42, 0.03, 8, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Ring Handles */}
      <mesh position={[-0.43, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.07, 0.015, 6, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[0.43, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.07, 0.015, 6, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>

      {/* Golden Samosas */}
      {samosas.map((s, idx) => (
        <group key={idx} position={s.pos} rotation={[0, s.rot, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.08, 0.12, 3]} />
            <meshStandardMaterial
              color="#b45309" // Golden fried pastry
              roughness={0.65}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Long Slotted Skimmer / Spatula resting on kadhai */}
      <mesh position={[0.3, 0.42, 0.2]} rotation={[0.4, 0.5, 0.8]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.65, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// --- 7. COLORFUL TRADITIONAL AKASH KANDIL (STAR LANTERN) ---
export const AkashKandilLantern: React.FC<{
  position?: [number, number, number];
  primaryColor?: string;
  ribbonColor?: string;
}> = ({ position = [0, 0, 0], primaryColor = '#e11d48', ribbonColor = '#fbbf24' }) => {
  const lanternRef = useRef<THREE.Group>(null);
  const ribbonsRef = useRef<THREE.Group>(null);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  useFrame(({ clock }) => {
    if (!reducedMotion) {
      const t = clock.getElapsedTime();
      // Gentle lantern pendular sway
      if (lanternRef.current) {
        lanternRef.current.rotation.z = Math.sin(t * 1.4 + position[0] * 1.5) * 0.035;
        lanternRef.current.rotation.x = Math.cos(t * 1.1 + position[2] * 1.5) * 0.025;
      }
      // Trailing silk ribbon flutter
      if (ribbonsRef.current) {
        ribbonsRef.current.children.forEach((ribbon, idx) => {
          ribbon.rotation.z = Math.sin(t * 2.2 + idx * 0.7 + position[0]) * 0.08;
          ribbon.rotation.x = Math.cos(t * 1.8 + idx * 0.5 + position[2]) * 0.06;
        });
      }
    }
  });

  return (
    <group ref={lanternRef} position={position}>
      {/* Suspension thread */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.8]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} />
      </mesh>

      {/* Central Diamond/Octahedron Lantern Body */}
      <mesh castShadow>
        <octahedronGeometry args={[0.26]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={1.2}
          toneMapped={false}
          roughness={0.35}
        />
      </mesh>

      {/* Golden Accent Frame */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <octahedronGeometry args={[0.26]} />
        <meshStandardMaterial
          color="#f59e0b"
          wireframe
          wireframeLinewidth={2}
          emissive="#d97706"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Hanging Tail Ribbons (Jhalar) with independent flutter */}
      <group ref={ribbonsRef}>
        {[-0.08, 0, 0.08].map((offset, idx) => (
          <group key={idx} position={[offset, -0.32, (idx % 2 === 0 ? 0.03 : -0.03)]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.03, 0.35, 6]} />
              <meshStandardMaterial
                color={ribbonColor}
                roughness={0.5}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

// --- 8. AUSPICIOUS SACRED KALASH WITH COCONUT & MANGO LEAVES ---
export const SacredKalash: React.FC<{ position?: [number, number, number] }> = ({
  position = [0, 0, 0],
}) => {
  return (
    <group position={position}>
      {/* Polished Brass Kalash Vessel */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#d97706"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
      {/* Kalash Neck & Flared Lip */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.1, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Sacred Red Mauli / Kalava Thread tied around neck */}
      <mesh position={[0, 0.34, 0]}>
        <torusGeometry args={[0.14, 0.018, 6, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.8} />
      </mesh>

      {/* 5 Sacred Mango Leaves fan outwards */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0.12, 0.44, 0]} rotation={[0, 0, -0.6]} castShadow>
              <coneGeometry args={[0.05, 0.22, 4]} />
              <meshStandardMaterial color="#15803d" roughness={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* Sacred Brown Coconut (Nariyal) sitting on top */}
      <mesh position={[0, 0.54, 0]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#593113" roughness={0.9} />
      </mesh>
      {/* Coconut husk tuft */}
      <mesh position={[0, 0.64, 0]}>
        <coneGeometry args={[0.04, 0.09, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
    </group>
  );
};
