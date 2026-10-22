import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';
import { useGameStore } from '../../../stores/useGameStore';

export const FerrisWheel: React.FC = () => {
  const wheelRef = useRef<THREE.Group>(null);
  const cabinsRef = useRef<(THREE.Group | null)[]>([]);
  const boardFerrisWheel = useGameStore((s) => s.boardFerrisWheel);
  const updateFerrisWheelAngle = useGameStore((s) => s.updateFerrisWheelAngle);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const numCabins = 8;
  const wheelRadius = 8.5;

  useEffect(() => {
    // Preserve collision base around Ferris wheel at X: 22, Z: 20
    collisionSystem.registerCylinder('ferris_wheel_base', 22, 20, 5.5);

    // Register interaction prompt
    interactionRegistry.register({
      id: 'ferris_wheel_ride',
      position: [18.0, 1.0, 20.0],
      radius: 4.5,
      label: 'Diwali Giant Ferris Wheel',
      sublabel: 'Ride Ferris Wheel • Panoramic View',
      actionType: 'ferris_wheel',
      onInteract: () => {
        boardFerrisWheel();
      },
    });

    return () => {
      interactionRegistry.unregister('ferris_wheel_ride');
    };
  }, [boardFerrisWheel]);

  // Smooth, continuous rotation with natural gravitational cabin counter-rotation
  useFrame(({ clock }, delta) => {
    if (wheelRef.current) {
      const safeDelta = Math.min(delta, 0.05);
      const speed = reducedMotion ? 0.04 : 0.18;
      wheelRef.current.rotation.z += safeDelta * speed;
      const currentAngle = wheelRef.current.rotation.z;
      updateFerrisWheelAngle(currentAngle);
      const t = clock.getElapsedTime();

      // Keep passenger cabins hanging vertically downwards under gravity
      // with subtle organic pendulum sway
      for (let i = 0; i < numCabins; i++) {
        const cabin = cabinsRef.current[i];
        if (cabin) {
          const sway = reducedMotion
            ? 0
            : Math.sin(t * 1.6 + i * 0.78) * 0.024;
          cabin.rotation.z = -currentAngle + sway;
        }
      }
    }
  });

  // Distinct traditional festival colorways for the 8 gondolas
  const cabinPalettes = useMemo(
    () => [
      { main: '#dc2626', trim: '#fbbf24', roof: '#b91c1c' }, // Vermillion Crimson & Gold
      { main: '#ea580c', trim: '#fde047', roof: '#c2410c' }, // Saffron Amber & Gold
      { main: '#15803d', trim: '#fef08a', roof: '#166534' }, // Emerald Green & Gold
      { main: '#0284c7', trim: '#fbbf24', roof: '#0369a1' }, // Peacock Turquoise & Gold
      { main: '#7c3aed', trim: '#fde047', roof: '#6d28d9' }, // Royal Amethyst & Gold
      { main: '#be123c', trim: '#fef08a', roof: '#9f1239' }, // Festive Rose & Gold
      { main: '#d97706', trim: '#fde047', roof: '#b45309' }, // Marigold Ochre & Gold
      { main: '#0891b2', trim: '#fef08a', roof: '#0e7490' }, // Ocean Cyan & Gold
    ],
    []
  );

  return (
    <group position={[24, 0, 20]}>
      {/* ========================================================
          1. RIGID STRUCTURAL SUPPORT A-FRAMES & FOOTINGS
      ======================================================== */}
      {/* Front A-Frame (Z = +2.2) */}
      <group position={[0, 0, 2.2]}>
        {/* Left Leg */}
        <mesh position={[-1.75, 5.5, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.32, 12.2, 0.32]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Right Leg */}
        <mesh position={[1.75, 5.5, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.32, 12.2, 0.32]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Horizontal Cross-Brace Tie */}
        <mesh position={[0, 4.6, 0]}>
          <boxGeometry args={[3.2, 0.22, 0.24]} />
          <meshStandardMaterial color="#d97706" metalness={0.75} roughness={0.3} />
        </mesh>
        {/* Upper Cross-Brace Tie */}
        <mesh position={[0, 8.2, 0]}>
          <boxGeometry args={[1.8, 0.18, 0.2]} />
          <meshStandardMaterial color="#d97706" metalness={0.75} roughness={0.3} />
        </mesh>
        {/* Diagonal X-Braces */}
        <mesh position={[0, 4.6, 0]} rotation={[0, 0, 0.55]}>
          <boxGeometry args={[0.1, 3.8, 0.1]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.6, 0]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.1, 3.8, 0.1]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
      </group>

      {/* Back A-Frame (Z = -2.2) */}
      <group position={[0, 0, -2.2]}>
        {/* Left Leg */}
        <mesh position={[-1.75, 5.5, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.32, 12.2, 0.32]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Right Leg */}
        <mesh position={[1.75, 5.5, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.32, 12.2, 0.32]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Horizontal Cross-Brace Tie */}
        <mesh position={[0, 4.6, 0]}>
          <boxGeometry args={[3.2, 0.22, 0.24]} />
          <meshStandardMaterial color="#d97706" metalness={0.75} roughness={0.3} />
        </mesh>
        {/* Upper Cross-Brace Tie */}
        <mesh position={[0, 8.2, 0]}>
          <boxGeometry args={[1.8, 0.18, 0.2]} />
          <meshStandardMaterial color="#d97706" metalness={0.75} roughness={0.3} />
        </mesh>
        {/* Diagonal X-Braces */}
        <mesh position={[0, 4.6, 0]} rotation={[0, 0, 0.55]}>
          <boxGeometry args={[0.1, 3.8, 0.1]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.6, 0]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.1, 3.8, 0.1]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
      </group>

      {/* Transverse Cross-Ties Connecting Front & Back A-Frames */}
      {[-1.6, 1.6].map((tx, idx) => (
        <group key={idx}>
          <mesh position={[tx, 4.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 4.4, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
          <mesh position={[tx * 0.5, 8.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 4.4, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 4 Heavy Sandstone & Iron Base Plinths */}
      {[
        [-3.4, 2.2],
        [3.4, 2.2],
        [-3.4, -2.2],
        [3.4, -2.2],
      ].map(([px, pz], idx) => (
        <group key={idx} position={[px, 0.22, pz]}>
          {/* Carved Sandstone Footing Block */}
          <mesh>
            <boxGeometry args={[1.2, 0.44, 1.2]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          {/* Cast Iron Anchor Shoe */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.6, 0.12, 0.6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          2. BOARDING PLATFORM, QUEUE STANCHIONS & OPERATOR BOOTH
      ======================================================== */}
      {/* Boarding Platform Base (West side facing player approach) */}
      <mesh position={[-1.2, 0.22, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.44, 4.4]} />
        <meshStandardMaterial color="#854d0e" roughness={0.7} />
      </mesh>
      {/* Non-Slip Wooden Boardwalk Surface Planks */}
      <mesh position={[-1.2, 0.45, 0]} receiveShadow>
        <boxGeometry args={[4.0, 0.04, 4.2]} />
        <meshStandardMaterial color="#713f12" roughness={0.65} />
      </mesh>
      {/* Access Steps on West Approach */}
      <mesh position={[-3.5, 0.12, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.24, 3.2]} />
        <meshStandardMaterial color="#854d0e" roughness={0.75} />
      </mesh>

      {/* Decorative Brass Stanchions & Velvet Safety Cordon */}
      {[-1.8, -0.6, 0.6, 1.8].map((sz, idx) => (
        <group key={idx} position={[-3.2, 0.45, sz]}>
          {/* Polished Brass Stanchion Post */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 1.0, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Golden Ball Top */}
          <mesh position={[0, 1.04, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}
      {/* Velvet Rope */}
      <mesh position={[-3.2, 1.25, 0]}>
        <boxGeometry args={[0.04, 0.04, 3.6]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} />
      </mesh>

      {/* Carnival Operator Kiosk (Compact, outside walking route) */}
      <group position={[-3.6, 0, -3.4]}>
        {/* Booth Body */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[1.6, 2.4, 1.6]} />
          <meshStandardMaterial color="#854d0e" roughness={0.7} />
        </mesh>
        {/* Ticket Window Aperture */}
        <mesh position={[0.81, 1.4, 0]}>
          <planeGeometry args={[0.7, 0.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} />
        </mesh>
        {/* Striped Canopy Awning */}
        <mesh position={[0.95, 1.85, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.65, 0.04, 1.7]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
        {/* Warm Golden Kiosk Lantern */}
        <mesh position={[0.9, 2.1, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ========================================================
          3. MAIN CENTRAL AXLE HUB & BEARING HOUSINGS
      ======================================================== */}
      {/* Central Rotating Steel Axle */}
      <mesh position={[0, 11, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 4.8, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Fixed Bearing Pillow Blocks at A-frame Junctions */}
      {[-2.2, 2.2].map((bz, idx) => (
        <group key={idx} position={[0, 11, bz]}>
          <mesh>
            <boxGeometry args={[0.9, 0.9, 0.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, bz > 0 ? 0.28 : -0.28]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.12, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          4. ROTATING WHEEL TRUSS ASSEMBLY
      ======================================================== */}
      <group ref={wheelRef} position={[0, 11, 0]}>
        {/* Center Golden Medallion Hub Plates */}
        {[-1.6, 1.6].map((hz, idx) => (
          <group key={idx} position={[0, 0, hz]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.25, 1.25, 0.16, 24]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Medallion Embossed Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.85, 0.08, 8, 24]} />
              <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Center Rosette Accent */}
            <mesh position={[0, 0, hz > 0 ? 0.1 : -0.1]}>
              <sphereGeometry args={[0.26, 12, 12]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#f59e0b"
                emissiveIntensity={1.4}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* Dual Outer Concentric Circular Rims (Front: +1.6, Back: -1.6) */}
        {[-1.6, 1.6].map((rz, idx) => (
          <group key={idx}>
            {/* Main Outer Steel Tubular Rim */}
            <mesh position={[0, 0, rz]}>
              <torusGeometry args={[wheelRadius, 0.1, 12, 48]} />
              <meshStandardMaterial
                color="#b91c1c"
                roughness={0.35}
                metalness={0.5}
              />
            </mesh>
            {/* Concentric Inner Reinforcing Truss Ring */}
            <mesh position={[0, 0, rz]}>
              <torusGeometry args={[wheelRadius * 0.62, 0.07, 8, 36]} />
              <meshStandardMaterial
                color="#d97706"
                metalness={0.75}
                roughness={0.3}
              />
            </mesh>
          </group>
        ))}

        {/* Transverse Cross-Spreader Bars connecting Front & Back Rims */}
        {Array.from({ length: 16 }).map((_, idx) => {
          const angle = (idx / 16) * Math.PI * 2;
          const rx = Math.cos(angle) * wheelRadius;
          const ry = Math.sin(angle) * wheelRadius;
          return (
            <mesh
              key={idx}
              position={[rx, ry, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.05, 0.05, 3.2, 6]} />
              <meshStandardMaterial color="#475569" metalness={0.7} />
            </mesh>
          );
        })}

        {/* Festive Perimeter Rim Bulbs (24 paired bulbs along both rims) */}
        {Array.from({ length: 24 }).map((_, idx) => {
          const bAngle = (idx / 24) * Math.PI * 2;
          const bx = Math.cos(bAngle) * wheelRadius;
          const by = Math.sin(bAngle) * wheelRadius;
          const colorType = idx % 3;
          const bulbColor =
            colorType === 0
              ? '#fbbf24' // Warm Gold
              : colorType === 1
                ? '#f97316' // Saffron Orange
                : '#38bdf8'; // Celestial Turquoise
          const bulbEmissive =
            colorType === 0
              ? '#f59e0b'
              : colorType === 1
                ? '#ea580c'
                : '#0284c7';

          return (
            <group key={idx}>
              {/* Front Rim Bulb */}
              <mesh position={[bx, by, 1.6]}>
                <sphereGeometry args={[0.13, 8, 8]} />
                <meshStandardMaterial
                  color={bulbColor}
                  emissive={bulbEmissive}
                  emissiveIntensity={1.9}
                  toneMapped={false}
                />
              </mesh>
              {/* Back Rim Bulb */}
              <mesh position={[bx, by, -1.6]}>
                <sphereGeometry args={[0.13, 8, 8]} />
                <meshStandardMaterial
                  color={bulbColor}
                  emissive={bulbEmissive}
                  emissiveIntensity={1.9}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}

        {/* 8 Radial Spoke Systems & Upright Passenger Gondolas */}
        {Array.from({ length: numCabins }).map((_, i) => {
          const angle = (i / numCabins) * Math.PI * 2;
          const x = Math.cos(angle) * wheelRadius;
          const y = Math.sin(angle) * wheelRadius;
          const palette = cabinPalettes[i % cabinPalettes.length];

          return (
            <group key={i}>
              {/* Front Spoke Truss */}
              <mesh
                position={[x * 0.5, y * 0.5, 1.6]}
                rotation={[0, 0, angle + Math.PI / 2]}
              >
                <cylinderGeometry args={[0.045, 0.055, wheelRadius, 6]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
              </mesh>
              {/* Back Spoke Truss */}
              <mesh
                position={[x * 0.5, y * 0.5, -1.6]}
                rotation={[0, 0, angle + Math.PI / 2]}
              >
                <cylinderGeometry args={[0.045, 0.055, wheelRadius, 6]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
              </mesh>

              {/* Mid-Spoke Inner Ring Support Node */}
              <mesh position={[x * 0.62, y * 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 3.2, 6]} />
                <meshStandardMaterial color="#334155" metalness={0.6} />
              </mesh>

              {/* Glowing Spoke Accent Jewel */}
              <mesh position={[x * 0.62, y * 0.62, 1.6]}>
                <sphereGeometry args={[0.16, 8, 8]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#f59e0b"
                  emissiveIntensity={2.0}
                  toneMapped={false}
                />
              </mesh>

              {/* Horizontal Gondola Hanger Pivot Axle */}
              <mesh position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 3.6, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* ====================================================
                  UPRIGHT PASSENGER GONDOLA / CABIN
                  (Counter-rotates in useFrame to remain perfectly upright)
              ==================================================== */}
              <group
                ref={(el) => {
                  cabinsRef.current[i] = el;
                }}
                position={[x, y, 0]}
              >
                {/* Dual Vertical Suspension Hanger Arms */}
                <mesh position={[0, -0.65, 1.1]}>
                  <cylinderGeometry args={[0.035, 0.035, 1.3, 6]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
                </mesh>
                <mesh position={[0, -0.65, -1.1]}>
                  <cylinderGeometry args={[0.035, 0.035, 1.3, 6]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
                </mesh>

                {/* Cabin Assembly Origin (Centered at y = -1.35) */}
                <group position={[0, -1.35, 0]}>
                  {/* Sturdy Cabin Floor Plate */}
                  <mesh position={[0, -0.45, 0]} castShadow>
                    <boxGeometry args={[1.5, 0.1, 1.7]} />
                    <meshStandardMaterial color="#1c1917" roughness={0.8} />
                  </mesh>

                  {/* Corner Structural Pillars */}
                  {[
                    [-0.68, -0.75],
                    [0.68, -0.75],
                    [-0.68, 0.75],
                    [0.68, 0.75],
                  ].map(([cx, cz], pIdx) => (
                    <mesh key={pIdx} position={[cx, 0.15, cz]}>
                      <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
                      <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
                    </mesh>
                  ))}

                  {/* Lower Decorative Painted Side Kickplates */}
                  <mesh position={[0, -0.22, 0.76]} castShadow>
                    <boxGeometry args={[1.4, 0.38, 0.04]} />
                    <meshStandardMaterial color={palette.main} roughness={0.4} />
                  </mesh>
                  <mesh position={[0, -0.22, -0.76]} castShadow>
                    <boxGeometry args={[1.4, 0.38, 0.04]} />
                    <meshStandardMaterial color={palette.main} roughness={0.4} />
                  </mesh>
                  <mesh position={[-0.7, -0.22, 0]} castShadow>
                    <boxGeometry args={[0.04, 0.38, 1.5]} />
                    <meshStandardMaterial color={palette.main} roughness={0.4} />
                  </mesh>
                  <mesh position={[0.7, -0.22, 0]} castShadow>
                    <boxGeometry args={[0.04, 0.38, 1.5]} />
                    <meshStandardMaterial color={palette.main} roughness={0.4} />
                  </mesh>

                  {/* Upper Safety Railing / Ornamental Brass Bars */}
                  <mesh position={[0, 0.05, 0.76]}>
                    <boxGeometry args={[1.4, 0.04, 0.04]} />
                    <meshStandardMaterial color={palette.trim} metalness={0.85} roughness={0.2} />
                  </mesh>
                  <mesh position={[0, 0.05, -0.76]}>
                    <boxGeometry args={[1.4, 0.04, 0.04]} />
                    <meshStandardMaterial color={palette.trim} metalness={0.85} roughness={0.2} />
                  </mesh>
                  <mesh position={[-0.7, 0.05, 0]}>
                    <boxGeometry args={[0.04, 0.04, 1.5]} />
                    <meshStandardMaterial color={palette.trim} metalness={0.85} roughness={0.2} />
                  </mesh>
                  <mesh position={[0.7, 0.05, 0]}>
                    <boxGeometry args={[0.04, 0.04, 1.5]} />
                    <meshStandardMaterial color={palette.trim} metalness={0.85} roughness={0.2} />
                  </mesh>

                  {/* Twin Passenger Wooden Bench Seats */}
                  <mesh position={[-0.42, -0.25, 0]}>
                    <boxGeometry args={[0.32, 0.32, 1.4]} />
                    <meshStandardMaterial color="#78350f" roughness={0.7} />
                  </mesh>
                  <mesh position={[0.42, -0.25, 0]}>
                    <boxGeometry args={[0.32, 0.32, 1.4]} />
                    <meshStandardMaterial color="#78350f" roughness={0.7} />
                  </mesh>

                  {/* Festive Carnival Pagoda Canopy Roof */}
                  <mesh position={[0, 0.72, 0]} castShadow>
                    <boxGeometry args={[1.65, 0.08, 1.85]} />
                    <meshStandardMaterial color={palette.roof} roughness={0.35} />
                  </mesh>
                  <mesh position={[0, 0.96, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                    <coneGeometry args={[1.2, 0.42, 4]} />
                    <meshStandardMaterial color={palette.main} roughness={0.4} />
                  </mesh>

                  {/* Golden Pinnacle Spire & Finial */}
                  <mesh position={[0, 1.25, 0]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
                  </mesh>

                  {/* Warm Glowing Diya Lantern suspended beneath canopy ceiling */}
                  <mesh position={[0, 0.6, 0]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial
                      color="#fef08a"
                      emissive="#f59e0b"
                      emissiveIntensity={1.8}
                      toneMapped={false}
                    />
                  </mesh>
                </group>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
};
