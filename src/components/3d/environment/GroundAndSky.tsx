import React, { useMemo } from 'react';

export const GroundAndSky: React.FC = () => {
  // Generate procedural starry night sky points
  const starsData = useMemo(() => {
    const coords = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const radius = 80 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.8 + 0.2); // Upper dome only

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 10]} receiveShadow>
        <planeGeometry args={[90, 95]} />
        <meshStandardMaterial
          color="#1e1510" // Warm nocturnal festival earth / morrum
          roughness={0.92}
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
          color="#2e1a12" // Weathered terracotta flagstone
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* B. East Carnival Alley Apron (Balloon Shooting Booth) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13.5, 0.003, 6]} receiveShadow>
        <planeGeometry args={[8.5, 14]} />
        <meshStandardMaterial
          color="#291a13"
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* C. East Giant Ferris Wheel Circular Apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[22, 0.003, 20]} receiveShadow>
        <circleGeometry args={[9.5, 32]} />
        <meshStandardMaterial
          color="#261711"
          roughness={0.85}
          metalness={0.08}
        />
      </mesh>

      {/* D. Grand Entrance Threshold Apron (South: Z: -26 to -18) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -22]} receiveShadow>
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial
          color="#331c13"
          roughness={0.78}
          metalness={0.1}
        />
      </mesh>

      {/* E. Cultural Stage Forecourt Apron (North: Z: 28 to 33) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 30.5]} receiveShadow>
        <planeGeometry args={[18, 6]} />
        <meshStandardMaterial
          color="#331c13"
          roughness={0.78}
          metalness={0.1}
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
          color="#3b2319" // Red Dholpur sandstone paving
          roughness={0.75}
          metalness={0.08}
        />
      </mesh>

      {/* East-West Bazaar Crossway (X: -26 to 26 at Z: 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <planeGeometry args={[52, 8.2]} />
        <meshStandardMaterial
          color="#3b2319"
          roughness={0.75}
          metalness={0.08}
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
          color="#482b1e" // Polished buff sandstone runner
          roughness={0.68}
          metalness={0.12}
        />
      </mesh>

      {/* East-West Crossway Central Runner Band */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} receiveShadow>
        <planeGeometry args={[52, 2.6]} />
        <meshStandardMaterial
          color="#482b1e"
          roughness={0.68}
          metalness={0.12}
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
          <meshStandardMaterial color="#21130d" roughness={0.9} />
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
          color="#361f15"
          roughness={0.75}
          metalness={0.1}
        />
      </mesh>

      {/* Inner Decorative Paved Band */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <ringGeometry args={[7.8, 9.4, 8]} />
        <meshStandardMaterial
          color="#4c2c1f" // Warmer contrasting stone border
          roughness={0.72}
          metalness={0.12}
        />
      </mesh>

      {/* ========================================================
          6. RAISED CARVED SANDSTONE KERB BORDERS (Height: y = 0.022)
             Believable Stone Edges framing walkways & walkways
      ======================================================== */}
      {/* West Edge of Main Promenade (South & North segments) */}
      <mesh position={[-4.18, 0.022, -15]}>
        <boxGeometry args={[0.26, 0.038, 26]} />
        <meshStandardMaterial color="#4f2719" roughness={0.7} />
      </mesh>
      <mesh position={[-4.18, 0.022, 19]}>
        <boxGeometry args={[0.26, 0.038, 26]} />
        <meshStandardMaterial color="#4f2719" roughness={0.7} />
      </mesh>

      {/* East Edge of Main Promenade (South & North segments) */}
      <mesh position={[4.18, 0.022, -15]}>
        <boxGeometry args={[0.26, 0.038, 26]} />
        <meshStandardMaterial color="#4f2719" roughness={0.7} />
      </mesh>
      <mesh position={[4.18, 0.022, 19]}>
        <boxGeometry args={[0.26, 0.038, 26]} />
        <meshStandardMaterial color="#4f2719" roughness={0.7} />
      </mesh>

      {/* North & South Kerbs for East-West Crossway */}
      <mesh position={[-16, 0.022, -4.18]}>
        <boxGeometry args={[20, 0.038, 0.26]} />
        <meshStandardMaterial color="#4f2719" roughness={0.7} />
      </mesh>
      <mesh position={[16, 0.022, -4.18]}>
        <boxGeometry args={[20, 0.038, 0.26]} />
        <meshStandardMaterial color="#4f2719" roughness={0.7} />
      </mesh>
      <mesh position={[-16, 0.022, 4.18]}>
        <boxGeometry args={[20, 0.038, 0.26]} />
        <meshStandardMaterial color="#4f2719" roughness={0.7} />
      </mesh>
      <mesh position={[16, 0.022, 4.18]}>
        <boxGeometry args={[20, 0.038, 0.26]} />
        <meshStandardMaterial color="#4f2719" roughness={0.7} />
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
          size={0.7}
          color="#fff8e7"
          transparent
          opacity={0.8}
        />
      </points>

      {/* ========================================================
          8. PERIMETER BOUNDARY WALLS WITH CORNICE & BUTTRESSES
      ======================================================== */}
      {/* North Wall Base & Main Body */}
      <group position={[0, 0, 52]}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[85, 3.6, 0.8]} />
          <meshStandardMaterial color="#2d170e" roughness={0.9} />
        </mesh>
        {/* Wall Top Cornice */}
        <mesh position={[0, 3.7, 0]}>
          <boxGeometry args={[85.4, 0.25, 1.1]} />
          <meshStandardMaterial color="#422115" roughness={0.8} />
        </mesh>
      </group>

      {/* South Wall Base & Main Body */}
      <group position={[0, 0, -32]}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[85, 3.6, 0.8]} />
          <meshStandardMaterial color="#2d170e" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.7, 0]}>
          <boxGeometry args={[85.4, 0.25, 1.1]} />
          <meshStandardMaterial color="#422115" roughness={0.8} />
        </mesh>
      </group>

      {/* West Wall Base & Main Body */}
      <group position={[-42, 0, 10]}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.8, 3.6, 85]} />
          <meshStandardMaterial color="#2d170e" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.7, 0]}>
          <boxGeometry args={[1.1, 0.25, 85.4]} />
          <meshStandardMaterial color="#422115" roughness={0.8} />
        </mesh>
      </group>

      {/* East Wall Base & Main Body */}
      <group position={[42, 0, 10]}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.8, 3.6, 85]} />
          <meshStandardMaterial color="#2d170e" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.7, 0]}>
          <boxGeometry args={[1.1, 0.25, 85.4]} />
          <meshStandardMaterial color="#422115" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
