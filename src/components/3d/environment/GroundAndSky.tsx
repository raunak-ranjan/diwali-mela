import React, { useMemo } from 'react';

// Deterministic seeded random number generator for stable celestial stars
const createSeededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

export const GroundAndSky: React.FC = () => {
  // Generate deterministic starry night sky points
  const starsData = useMemo(() => {
    const coords = new Float32Array(500 * 3);
    const rand = createSeededRandom(42);
    for (let i = 0; i < 500; i++) {
      const radius = 80 + rand() * 30;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(rand() * 0.8 + 0.2); // Upper dome only

      coords[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      coords[i * 3 + 1] = radius * Math.cos(phi);
      coords[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return coords;
  }, []);

  return (
    <group>
      {/* ========================================================
          1. BASE GROUND FAIRGROUND PLANE (Compacted Festival Earth)
      ======================================================== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[130, 130]} />
        <meshStandardMaterial
          color="#54382b" // Warm nocturnal festival earth / morrum
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>

      {/* Welcoming South Entrance Approach Promenade (Z: -42 to -24) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -32]} receiveShadow>
        <planeGeometry args={[8.2, 18]} />
        <meshStandardMaterial
          color="#8a4d38"
          roughness={0.72}
          metalness={0.06}
        />
      </mesh>

      {/* ========================================================
          2. ZONE-SPECIFIC PATIO APRONS (Height: y = 0.003)
      ======================================================== */}
      {/* A. West Bazaar Courtyard Apron (Mithai, Chaat & Handicrafts) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13.5, 0.003, 3]} receiveShadow>
        <planeGeometry args={[10, 36]} />
        <meshStandardMaterial
          color="#6c4232" // Weathered terracotta flagstone
          roughness={0.8}
          metalness={0.06}
        />
      </mesh>

      {/* B. East Carnival Alley Apron (Balloon Shooting Booth) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13.5, 0.003, 6]} receiveShadow>
        <planeGeometry args={[8.5, 14]} />
        <meshStandardMaterial
          color="#6c4232"
          roughness={0.8}
          metalness={0.06}
        />
      </mesh>

      {/* C. East Giant Ferris Wheel Circular Apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[22, 0.003, 20]} receiveShadow>
        <circleGeometry args={[9.5, 32]} />
        <meshStandardMaterial
          color="#663e2e"
          roughness={0.82}
          metalness={0.06}
        />
      </mesh>

      {/* D. Grand Entrance Threshold Apron (South: Z: -26 to -18) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -22]} receiveShadow>
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial
          color="#754634"
          roughness={0.76}
          metalness={0.08}
        />
      </mesh>

      {/* E. Cultural Stage Forecourt Apron (North: Z: 28 to 33) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 30.5]} receiveShadow>
        <planeGeometry args={[18, 6]} />
        <meshStandardMaterial
          color="#754634"
          roughness={0.76}
          metalness={0.08}
        />
      </mesh>

      {/* ========================================================
          3. MAIN PAVED WALKWAYS (Height: y = 0.006)
             Warm Red & Buff Sandstone Paving Slabs
      ======================================================== */}
      {/* North-South Main Promenade (Z: -28 to 32) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 2]} receiveShadow>
        <planeGeometry args={[8.2, 60]} />
        <meshStandardMaterial
          color="#8a4d38" // Agra red sandstone paving
          roughness={0.72}
          metalness={0.06}
        />
      </mesh>

      {/* East-West Bazaar Crossway (X: -26 to 26 at Z: 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <planeGeometry args={[52, 8.2]} />
        <meshStandardMaterial
          color="#8a4d38"
          roughness={0.72}
          metalness={0.06}
        />
      </mesh>

      {/* ========================================================
          4. CENTRAL RUNNER & SUBTLE PAVEMENT DETAIL (Height: y = 0.008)
             Decorative Inner Paved Bands & Textural Variation
      ======================================================== */}
      {/* North-South Walkway Central Runner Band */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 2]} receiveShadow>
        <planeGeometry args={[2.6, 60]} />
        <meshStandardMaterial
          color="#ad7952" // Polished Jaisalmer/Dholpur buff sandstone runner
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* East-West Crossway Central Runner Band */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} receiveShadow>
        <planeGeometry args={[52, 2.6]} />
        <meshStandardMaterial
          color="#ad7952"
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Transverse Paving Joints along Promenade (subtle paver separation lines) */}
      {[-24, -18, -12, -6, 6, 12, 18, 24, 30].map((pz, idx) => (
        <mesh
          key={idx}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.009, pz]}
        >
          <planeGeometry args={[8.2, 0.12]} />
          <meshStandardMaterial color="#4f2c20" roughness={0.85} />
        </mesh>
      ))}

      {/* ========================================================
          5. CENTRAL PLAZA OCTAGONAL APRON (Height: y = 0.010)
             Sandstone Transition Courtyard around Central Rangoli
      ======================================================== */}
      {/* Outer Plaza Stone Apron Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.010, 0]} receiveShadow>
        <circleGeometry args={[9.8, 8]} />
        <meshStandardMaterial
          color="#854832"
          roughness={0.72}
          metalness={0.08}
        />
      </mesh>

      {/* Inner Decorative Paved Band */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <ringGeometry args={[7.8, 9.4, 8]} />
        <meshStandardMaterial
          color="#b0744c" // Warmer contrasting stone border
          roughness={0.68}
          metalness={0.1}
        />
      </mesh>

      {/* ========================================================
          6. RAISED CARVED SANDSTONE KERB BORDERS (Height: y = 0.022)
             Believable Stone Edges framing walkways
      ======================================================== */}
      {/* West Edge of Main Promenade (South & North segments) */}
      <mesh position={[-4.18, 0.022, -15]}>
        <boxGeometry args={[0.26, 0.038, 26]} />
        <meshStandardMaterial color="#994d35" roughness={0.68} />
      </mesh>
      <mesh position={[-4.18, 0.022, 19]}>
        <boxGeometry args={[0.26, 0.038, 26]} />
        <meshStandardMaterial color="#994d35" roughness={0.68} />
      </mesh>

      {/* East Edge of Main Promenade (South & North segments) */}
      <mesh position={[4.18, 0.022, -15]}>
        <boxGeometry args={[0.26, 0.038, 26]} />
        <meshStandardMaterial color="#994d35" roughness={0.68} />
      </mesh>
      <mesh position={[4.18, 0.022, 19]}>
        <boxGeometry args={[0.26, 0.038, 26]} />
        <meshStandardMaterial color="#994d35" roughness={0.68} />
      </mesh>

      {/* North & South Kerbs for East-West Crossway */}
      <mesh position={[-16, 0.022, -4.18]}>
        <boxGeometry args={[20, 0.038, 0.26]} />
        <meshStandardMaterial color="#994d35" roughness={0.68} />
      </mesh>
      <mesh position={[16, 0.022, -4.18]}>
        <boxGeometry args={[20, 0.038, 0.26]} />
        <meshStandardMaterial color="#994d35" roughness={0.68} />
      </mesh>
      <mesh position={[-16, 0.022, 4.18]}>
        <boxGeometry args={[20, 0.038, 0.26]} />
        <meshStandardMaterial color="#994d35" roughness={0.68} />
      </mesh>
      <mesh position={[16, 0.022, 4.18]}>
        <boxGeometry args={[20, 0.038, 0.26]} />
        <meshStandardMaterial color="#994d35" roughness={0.68} />
      </mesh>

      {/* ========================================================
          7. DISTANT STARRY NIGHT SKY
      ======================================================== */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starsData, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.75}
          color="#fff8e7"
          transparent
          opacity={0.85}
        />
      </points>

      {/* ========================================================
          8. PERIMETER BOUNDARY WALLS WITH CORNICE & BUTTRESSES
      ======================================================== */}
      {/* North Wall Base & Main Body */}
      <group position={[0, 0, 52]}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[85, 3.6, 0.8]} />
          <meshStandardMaterial color="#6e3926" roughness={0.85} />
        </mesh>
        {/* Wall Top Cornice */}
        <mesh position={[0, 3.7, 0]}>
          <boxGeometry args={[85.4, 0.25, 1.1]} />
          <meshStandardMaterial color="#8a4932" roughness={0.75} />
        </mesh>
      </group>

      {/* South Wall (Flanking Wings leaving Grand Entrance Gateway open) */}
      <group position={[0, 0, -32]}>
        {/* Left Wing */}
        <mesh position={[-25, 1.8, 0]}>
          <boxGeometry args={[34, 3.6, 0.8]} />
          <meshStandardMaterial color="#6e3926" roughness={0.85} />
        </mesh>
        <mesh position={[-25, 3.7, 0]}>
          <boxGeometry args={[34.4, 0.25, 1.1]} />
          <meshStandardMaterial color="#8a4932" roughness={0.75} />
        </mesh>
        {/* Right Wing */}
        <mesh position={[25, 1.8, 0]}>
          <boxGeometry args={[34, 3.6, 0.8]} />
          <meshStandardMaterial color="#6e3926" roughness={0.85} />
        </mesh>
        <mesh position={[25, 3.7, 0]}>
          <boxGeometry args={[34.4, 0.25, 1.1]} />
          <meshStandardMaterial color="#8a4932" roughness={0.75} />
        </mesh>
      </group>

      {/* West Wall Base & Main Body */}
      <group position={[-42, 0, 10]}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.8, 3.6, 85]} />
          <meshStandardMaterial color="#6e3926" roughness={0.85} />
        </mesh>
        <mesh position={[0, 3.7, 0]}>
          <boxGeometry args={[1.1, 0.25, 85.4]} />
          <meshStandardMaterial color="#8a4932" roughness={0.75} />
        </mesh>
      </group>

      {/* East Wall Base & Main Body */}
      <group position={[42, 0, 10]}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.8, 3.6, 85]} />
          <meshStandardMaterial color="#6e3926" roughness={0.85} />
        </mesh>
        <mesh position={[0, 3.7, 0]}>
          <boxGeometry args={[1.1, 0.25, 85.4]} />
          <meshStandardMaterial color="#8a4932" roughness={0.75} />
        </mesh>
      </group>
    </group>
  );
};
