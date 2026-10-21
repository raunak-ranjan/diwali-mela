import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';

// Deterministic seeded random number generator for stable celestial positions
const createSeededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Generate celestial stars avoiding the moon's halo cone
const generateStarCoordinates = (
  count: number,
  minRadius: number,
  maxRadius: number,
  minPhi: number,
  maxPhi: number,
  seed: number,
  moonDir: THREE.Vector3
): Float32Array => {
  const coords = new Float32Array(count * 3);
  const rand = createSeededRandom(seed);
  let placed = 0;
  let attempts = 0;

  while (placed < count && attempts < count * 5) {
    attempts++;
    const radius = minRadius + rand() * (maxRadius - minRadius);
    const theta = rand() * Math.PI * 2;
    const phi = minPhi + rand() * (maxPhi - minPhi);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Filter out stars located too close to the celestial moon disk
    const starDir = new THREE.Vector3(x, y, z).normalize();
    if (starDir.dot(moonDir) > 0.95) {
      continue;
    }

    coords[placed * 3] = x;
    coords[placed * 3 + 1] = y;
    coords[placed * 3 + 2] = z;
    placed++;
  }

  return coords.subarray(0, placed * 3);
};

// Generate smooth vertical celestial gradient for the inverted sky dome
const createSkyGradientTexture = (): THREE.CanvasTexture | null => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  // In Three.js SphereGeometry BackSide UV mapping:
  // y = 0 is Zenith (90° overhead); y = 256 (0.5) is Horizon (0°); y = 512 is Nadir
  grad.addColorStop(0.0, '#02040c'); // Deep cosmic midnight zenith
  grad.addColorStop(0.18, '#05091c'); // Deep nocturnal indigo
  grad.addColorStop(0.32, '#09122c'); // Rich festival royal twilight
  grad.addColorStop(0.42, '#141026'); // Transition to warm evening glow
  grad.addColorStop(0.47, '#241427'); // Radiant festival horizon glow (light from millions of lamps)
  grad.addColorStop(0.505, '#070a1a'); // Perfect seamless blend with scene fog & background
  grad.addColorStop(0.68, '#050814'); // Sub-horizon depth
  grad.addColorStop(1.0, '#020308'); // Nadir

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
};

// Generate soft natural moon texture with subtle lunar maria
const createMoonTexture = (): THREE.CanvasTexture | null => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Luminous pearlescent lunar gradient
  const grad = ctx.createRadialGradient(58, 58, 0, 64, 64, 64);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.72, '#fffded');
  grad.addColorStop(0.9, '#fef3c7');
  grad.addColorStop(1, '#fde68a');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 63, 0, Math.PI * 2);
  ctx.fill();

  // Subtle lunar maria (craters & ancient basaltic plains) for organic realism
  ctx.fillStyle = 'rgba(215, 215, 200, 0.18)';
  ctx.beginPath();
  ctx.arc(48, 46, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(210, 205, 190, 0.15)';
  ctx.beginPath();
  ctx.arc(76, 68, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(220, 215, 195, 0.12)';
  ctx.beginPath();
  ctx.arc(44, 76, 16, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
};

export const GroundAndSky: React.FC = () => {
  // Directional moonlight vector matching FestivalLighting ([42, 28, -16])
  const moonDir = useMemo(() => new THREE.Vector3(42, 28, -16).normalize(), []);

  // Moon position along moonlight vector at radius 92m
  const moonPos = useMemo<[number, number, number]>(() => {
    return [moonDir.x * 92, moonDir.y * 92, moonDir.z * 92];
  }, [moonDir]);

  // Compute rotation so moon disk faces the scene origin [0, 0, 0]
  const moonRotation = useMemo<[number, number, number]>(() => {
    const dummy = new THREE.Object3D();
    dummy.position.set(moonPos[0], moonPos[1], moonPos[2]);
    dummy.lookAt(0, 0, 0);
    return [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z];
  }, [moonPos]);

  // Procedural celestial sky gradient and lunar textures
  const skyTexture = useMemo(() => createSkyGradientTexture(), []);
  const moonTexture = useMemo(() => createMoonTexture(), []);

  useEffect(() => {
    return () => {
      skyTexture?.dispose();
      moonTexture?.dispose();
    };
  }, [skyTexture, moonTexture]);

  // Tier 1: Faint stardust background field
  const faintStarsData = useMemo(() => {
    return generateStarCoordinates(450, 100, 110, 0.1, 1.25, 101, moonDir);
  }, [moonDir]);

  // Tier 2: Bright navigational constellation stars
  const brightStarsData = useMemo(() => {
    return generateStarCoordinates(90, 98, 108, 0.15, 1.2, 202, moonDir);
  }, [moonDir]);

  // Tier 3: Rare sparkling jewel stars (Sirius/Rohini)
  const jewelStarsData = useMemo(() => {
    return generateStarCoordinates(18, 96, 106, 0.2, 1.1, 303, moonDir);
  }, [moonDir]);

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
          7. CELESTIAL SKY GRADIENT DOME
             Smooth midnight-indigo-to-warm-horizon festival atmosphere
      ======================================================== */}
      {skyTexture && (
        <mesh renderOrder={-100}>
          <sphereGeometry args={[114, 32, 24]} />
          <meshBasicMaterial
            map={skyTexture}
            side={THREE.BackSide}
            depthWrite={false}
            fog={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* ========================================================
          8. CELESTIAL MOON DISK & WARM FESTIVAL HALO
             Precisely aligned with scene's directional moonlight
      ======================================================== */}
      <group position={moonPos} rotation={moonRotation}>
        {/* Core Luminous Moon Disk */}
        <mesh renderOrder={-90}>
          <circleGeometry args={[3.2, 48]} />
          <meshBasicMaterial
            map={moonTexture ?? undefined}
            color="#fffdf0"
            side={THREE.DoubleSide}
            depthWrite={false}
            fog={false}
            toneMapped={false}
          />
        </mesh>

        {/* Soft Lunar Limb Glow */}
        <mesh position={[0, 0, -0.01]} renderOrder={-91}>
          <ringGeometry args={[3.0, 4.5, 48]} />
          <meshBasicMaterial
            color="#fef3c7"
            transparent
            opacity={0.34}
            side={THREE.DoubleSide}
            depthWrite={false}
            fog={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* Warm Atmospheric Moisture & Incense Halo */}
        <mesh position={[0, 0, -0.02]} renderOrder={-92}>
          <ringGeometry args={[4.2, 9.8, 48]} />
          <meshBasicMaterial
            color="#fcd34d"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
            fog={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* Distant Golden Festive Corona */}
        <mesh position={[0, 0, -0.03]} renderOrder={-93}>
          <ringGeometry args={[9.5, 20.0, 48]} />
          <meshBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.06}
            side={THREE.DoubleSide}
            depthWrite={false}
            fog={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ========================================================
          9. STRATIFIED CELESTIAL STARFIELD
             Restrained, varied brightness & sizes; avoids moon disk
      ======================================================== */}
      {/* Tier 1: Faint Stardust Field */}
      <points renderOrder={-96}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[faintStarsData, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.55}
          color="#cbd5e1"
          transparent
          opacity={0.65}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </points>

      {/* Tier 2: Bright Constellation Stars */}
      <points renderOrder={-95}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[brightStarsData, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.95}
          color="#fffbeb"
          transparent
          opacity={0.88}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </points>

      {/* Tier 3: Rare Sparkling Jewel Stars (Sirius/Rohini) */}
      <points renderOrder={-94}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[jewelStarsData, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.35}
          color="#fef08a"
          transparent
          opacity={0.95}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </points>

      {/* ========================================================
          10. PERIMETER BOUNDARY WALLS WITH CORNICE & BUTTRESSES
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
