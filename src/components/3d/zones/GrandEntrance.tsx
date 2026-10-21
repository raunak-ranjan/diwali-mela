import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { collisionSystem } from '../../../systems/collision';
import { useGameStore } from '../../../stores/useGameStore';
import { MarigoldGarland, SacredKalash, AkashKandilLantern } from '../environment/FestivalProps';

export const GrandEntrance: React.FC = () => {
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);
  const bellGroupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // Register left and right pillar obstacles with collision system
    // Left pillar: [-5.8, -4.0], Z: [-25.5, -23.5]
    collisionSystem.registerBox('entrance_pillar_left', -5.8, -4.0, -25.5, -23.5);
    collisionSystem.registerBox('entrance_pillar_right', 4.0, 5.8, -25.5, -23.5);

    // Register welcome podium obstacles
    collisionSystem.registerCylinder('entrance_podium_left', -3.4, -23.3, 0.7);
    collisionSystem.registerCylinder('entrance_podium_right', 3.4, -23.3, 0.7);

    return () => {
      // unregister
    };
  }, []);

  // Subtle natural swaying of hanging temple bells in the night breeze
  useFrame(({ clock }) => {
    if (bellGroupRef.current && !reducedMotion) {
      const t = clock.getElapsedTime();
      bellGroupRef.current.children.forEach((bell, i) => {
        bell.rotation.z = Math.sin(t * 1.5 + i * 0.9) * 0.04;
        bell.rotation.x = Math.cos(t * 1.2 + i * 0.7) * 0.03;
      });
    }
  });

  // Procedural Cusped Arch Shape & Geometry (Traditional Indian Multifoil Arch)
  const archGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 5.0; // Outer span to pillar face
    const topY = 7.8;
    const bottomY = 4.0;

    // Start top-left and trace rectangular exterior
    shape.moveTo(-w, bottomY);
    shape.lineTo(-w, topY);
    shape.lineTo(w, topY);
    shape.lineTo(w, bottomY);
    shape.lineTo(3.8, bottomY);

    // Cusped arch profile (right to left)
    // 1. Right lower cusp
    shape.quadraticCurveTo(3.5, 4.6, 2.9, 4.85);
    // 2. Right middle cusp
    shape.quadraticCurveTo(2.35, 5.55, 1.45, 5.85);
    // 3. Center apex pointed cusp
    shape.quadraticCurveTo(0.65, 6.35, 0.0, 6.75);
    // 4. Left apex to middle cusp
    shape.quadraticCurveTo(-0.65, 6.35, -1.45, 5.85);
    // 5. Left middle to lower cusp
    shape.quadraticCurveTo(-2.35, 5.55, -2.9, 4.85);
    // 6. Left lower cusp to vertical wall
    shape.quadraticCurveTo(-3.5, 4.6, -3.8, bottomY);
    shape.lineTo(-w, bottomY);

    const extrudeSettings = {
      steps: 1,
      depth: 1.2,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelOffset: 0,
      bevelSegments: 3,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.computeVertexNormals();
    // Center depth so arch extends symmetrically from Z: -0.6 to +0.6
    geom.translate(0, 0, -0.6);
    return geom;
  }, []);

  // Recessed Inner Gold Molding Geometry
  const innerGoldTrimGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const bottomY = 4.0;
    const offset = 0.08;

    shape.moveTo(3.8 + offset, bottomY);
    shape.quadraticCurveTo(3.5 + offset, 4.6 + offset, 2.9 + offset, 4.85 + offset);
    shape.quadraticCurveTo(2.35 + offset, 5.55 + offset, 1.45 + offset, 5.85 + offset);
    shape.quadraticCurveTo(0.65 + offset, 6.35 + offset, 0.0, 6.75 + offset);
    shape.quadraticCurveTo(-0.65 - offset, 6.35 + offset, -1.45 - offset, 5.85 + offset);
    shape.quadraticCurveTo(-2.35 - offset, 5.55 + offset, -2.9 - offset, 4.85 + offset);
    shape.quadraticCurveTo(-3.5 - offset, 4.6 + offset, -3.8 - offset, bottomY);

    // Inner contour
    shape.lineTo(-3.8, bottomY);
    shape.quadraticCurveTo(-3.5, 4.6, -2.9, 4.85);
    shape.quadraticCurveTo(-2.35, 5.55, -1.45, 5.85);
    shape.quadraticCurveTo(-0.65, 6.35, 0.0, 6.75);
    shape.quadraticCurveTo(0.65, 6.35, 1.45, 5.85);
    shape.quadraticCurveTo(2.35, 5.55, 2.9, 4.85);
    shape.quadraticCurveTo(3.5, 4.6, 3.8, bottomY);
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 1.28,
      bevelEnabled: false,
    });
    geom.computeVertexNormals();
    geom.translate(0, 0, -0.64);
    return geom;
  }, []);

  return (
    <group position={[0, 0, -24.5]}>
      {/* ========================================================
          1. LEFT PILLAR (CARVED RAJASTHANI SANDSTONE COLUMN)
         ======================================================== */}
      <group position={[-4.8, 0, 0]}>
        {/* Stepped Base Plinth */}
        {/* Lower tier */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.4, 2.5]} />
          <meshStandardMaterial color="#6e3926" roughness={0.85} />
        </mesh>
        {/* Middle tier with carved beveled molding */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.4, 2.1]} />
          <meshStandardMaterial color="#8c5828" roughness={0.8} />
        </mesh>
        {/* Upper tier plinth collar with brass trim */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[1.9, 0.2, 1.9]} />
          <meshStandardMaterial color="#b45309" roughness={0.65} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[1.95, 0.05, 1.95]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Main Shaft (12-sided faceted column with fluting) */}
        <mesh position={[0, 4.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.82, 0.88, 6.7, 12]} />
          <meshStandardMaterial color="#c28847" roughness={0.7} />
        </mesh>
        {/* Mid-height carved belt molding */}
        <mesh position={[0, 4.4, 0]} castShadow>
          <cylinderGeometry args={[0.92, 0.92, 0.35, 12]} />
          <meshStandardMaterial color="#92400e" roughness={0.65} />
        </mesh>
        <mesh position={[0, 4.4, 0]}>
          <torusGeometry args={[0.93, 0.03, 8, 24]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Capital & Bracket Assembly */}
        <mesh position={[0, 7.85, 0]} castShadow>
          <boxGeometry args={[2.1, 0.3, 2.1]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        <mesh position={[0, 8.05, 0]} castShadow>
          <boxGeometry args={[2.3, 0.15, 2.3]} />
          <meshStandardMaterial color="#8c5828" roughness={0.7} />
        </mesh>

        {/* Auspicious "SHUBH" Medallion (South Face - Entrance) */}
        <group position={[0, 4.8, 0.9]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.06, 24]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.02, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.02, 12]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.4} />
          </mesh>
        </group>

        {/* Auspicious "SHUBH" Medallion (North Face - Inner Fairground) */}
        <group position={[0, 4.8, -0.9]} rotation={[0, Math.PI, 0]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.06, 24]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.02, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>

        {/* --- LEFT ROOFTOP CHHATRI PAVILION --- */}
        <group position={[0, 8.1, 0]}>
          {/* Chhatri Base Plinth */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[2.0, 0.3, 2.0]} />
            <meshStandardMaterial color="#6e3926" roughness={0.8} />
          </mesh>

          {/* 4 Slender Sandstone Pillars */}
          {[
            [-0.7, -0.7],
            [0.7, -0.7],
            [-0.7, 0.7],
            [0.7, 0.7],
          ].map(([px, pz], idx) => (
            <mesh key={idx} position={[px, 1.2, pz]} castShadow>
              <cylinderGeometry args={[0.1, 0.12, 1.8, 8]} />
              <meshStandardMaterial color="#c28847" roughness={0.65} />
            </mesh>
          ))}

          {/* Scalloped Square Chhajja Canopy */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[2.3, 0.2, 2.3]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          <mesh position={[0, 2.32, 0]}>
            <boxGeometry args={[2.35, 0.05, 2.35]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>

          {/* Ribbed Traditional Lotus Dome (Gumbad) */}
          <mesh position={[0, 2.9, 0]} castShadow>
            <sphereGeometry args={[1.05, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            <meshStandardMaterial
              color="#eab308"
              roughness={0.4}
              metalness={0.5}
            />
          </mesh>

          {/* Dome Rib Trim Accent */}
          <mesh position={[0, 2.9, 0]}>
            <torusGeometry args={[1.05, 0.03, 6, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Sacred Golden Kalash Finial */}
          <mesh position={[0, 4.0, 0]}>
            <cylinderGeometry args={[0.08, 0.22, 0.5, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 4.35, 0]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d97706"
              emissiveIntensity={0.6}
              metalness={0.8}
            />
          </mesh>

          {/* Glowing Interior Chhatri Lantern */}
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial
              color="#fff7d6"
              emissive="#ffaa33"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          2. RIGHT PILLAR (CARVED RAJASTHANI SANDSTONE COLUMN)
         ======================================================== */}
      <group position={[4.8, 0, 0]}>
        {/* Stepped Base Plinth */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.4, 2.5]} />
          <meshStandardMaterial color="#6e3926" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.4, 2.1]} />
          <meshStandardMaterial color="#8c5828" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[1.9, 0.2, 1.9]} />
          <meshStandardMaterial color="#b45309" roughness={0.65} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[1.95, 0.05, 1.95]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Main Shaft (12-sided faceted column with fluting) */}
        <mesh position={[0, 4.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.82, 0.88, 6.7, 12]} />
          <meshStandardMaterial color="#c28847" roughness={0.7} />
        </mesh>
        <mesh position={[0, 4.4, 0]} castShadow>
          <cylinderGeometry args={[0.92, 0.92, 0.35, 12]} />
          <meshStandardMaterial color="#92400e" roughness={0.65} />
        </mesh>
        <mesh position={[0, 4.4, 0]}>
          <torusGeometry args={[0.93, 0.03, 8, 24]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Capital & Bracket Assembly */}
        <mesh position={[0, 7.85, 0]} castShadow>
          <boxGeometry args={[2.1, 0.3, 2.1]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        <mesh position={[0, 8.05, 0]} castShadow>
          <boxGeometry args={[2.3, 0.15, 2.3]} />
          <meshStandardMaterial color="#8c5828" roughness={0.7} />
        </mesh>

        {/* Auspicious "LABH" Medallion (South Face - Entrance) */}
        <group position={[0, 4.8, 0.9]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.06, 24]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.02, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.02, 12]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.4} />
          </mesh>
        </group>

        {/* Auspicious "LABH" Medallion (North Face - Inner Fairground) */}
        <group position={[0, 4.8, -0.9]} rotation={[0, Math.PI, 0]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.06, 24]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.02, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>

        {/* --- RIGHT ROOFTOP CHHATRI PAVILION --- */}
        <group position={[0, 8.1, 0]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[2.0, 0.3, 2.0]} />
            <meshStandardMaterial color="#6e3926" roughness={0.8} />
          </mesh>

          {[
            [-0.7, -0.7],
            [0.7, -0.7],
            [-0.7, 0.7],
            [0.7, 0.7],
          ].map(([px, pz], idx) => (
            <mesh key={idx} position={[px, 1.2, pz]} castShadow>
              <cylinderGeometry args={[0.1, 0.12, 1.8, 8]} />
              <meshStandardMaterial color="#c28847" roughness={0.65} />
            </mesh>
          ))}

          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[2.3, 0.2, 2.3]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          <mesh position={[0, 2.32, 0]}>
            <boxGeometry args={[2.35, 0.05, 2.35]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>

          <mesh position={[0, 2.9, 0]} castShadow>
            <sphereGeometry args={[1.05, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            <meshStandardMaterial
              color="#eab308"
              roughness={0.4}
              metalness={0.5}
            />
          </mesh>
          <mesh position={[0, 2.9, 0]}>
            <torusGeometry args={[1.05, 0.03, 6, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>

          <mesh position={[0, 4.0, 0]}>
            <cylinderGeometry args={[0.08, 0.22, 0.5, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 4.35, 0]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d97706"
              emissiveIntensity={0.6}
              metalness={0.8}
            />
          </mesh>

          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial
              color="#fff7d6"
              emissive="#ffaa33"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          3. GRAND MULTIFOIL CUSPED ARCHWAY (RAJPUT/MUGHAL POL)
         ======================================================== */}
      {/* Solid Sandstone Archway Spandrel Wall */}
      <mesh geometry={archGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#991b1b" // Deep festival crimson sandstone
          roughness={0.65}
        />
      </mesh>

      {/* Recessed Polished Gold Molding along cusped arch profile */}
      <mesh geometry={innerGoldTrimGeometry}>
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.8}
          roughness={0.25}
          emissive="#d97706"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Carved Lotus Rosettes in Spandrels (South & North faces) */}
      {[-1, 1].map((faceZ) => (
        <group key={faceZ} position={[0, 0, faceZ * 0.62]}>
          {/* Left Rosette */}
          <group position={[-2.7, 6.2, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.04, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.75} roughness={0.3} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, faceZ * 0.025]}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 12]} />
              <meshStandardMaterial color="#dc2626" roughness={0.5} />
            </mesh>
          </group>

          {/* Right Rosette */}
          <group position={[2.7, 6.2, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.04, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.75} roughness={0.3} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, faceZ * 0.025]}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 12]} />
              <meshStandardMaterial color="#dc2626" roughness={0.5} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Carved Stone Corbels / Brackets Under Arch Springers */}
      <mesh position={[-3.6, 4.3, 0]} rotation={[0, 0, -0.65]} castShadow>
        <boxGeometry args={[0.35, 1.2, 1.15]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} />
      </mesh>
      <mesh position={[3.6, 4.3, 0]} rotation={[0, 0, 0.65]} castShadow>
        <boxGeometry args={[0.35, 1.2, 1.15]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} />
      </mesh>

      {/* Outer Cantilevered Brackets for Lanterns */}
      <mesh position={[-4.5, 6.6, 0.8]} rotation={[0, 0, -0.45]} castShadow>
        <boxGeometry args={[0.25, 1.1, 0.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} />
      </mesh>
      <mesh position={[4.5, 6.6, 0.8]} rotation={[0, 0, 0.45]} castShadow>
        <boxGeometry args={[0.25, 1.1, 0.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} />
      </mesh>

      {/* Hanging Akash Kandils on Outer Brackets */}
      <AkashKandilLantern
        position={[-4.5, 5.8, 1.1]}
        primaryColor="#e11d48"
        ribbonColor="#fbbf24"
      />
      <AkashKandilLantern
        position={[4.5, 5.8, 1.1]}
        primaryColor="#f97316"
        ribbonColor="#38bdf8"
      />

      {/* ========================================================
          4. CEREMONIAL LINTEL FRIEZE & ILLUMINATED GATEWAY MARQUEE
         ======================================================== */}
      {/* Molded Sandstone Entablature / Frieze Base */}
      <mesh position={[0, 7.8, 0]} castShadow>
        <boxGeometry args={[11.8, 0.4, 1.35]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>
      {/* Gold Trim Runner Band */}
      <mesh position={[0, 8.0, 0]}>
        <boxGeometry args={[12.0, 0.1, 1.4]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Central Illuminated Festival Gateway Signboard (Double-Sided) */}
      {/* South Facing Gateway Cartouche (for approaching visitors) */}
      <group position={[0, 8.65, 0.7]}>
        {/* Royal Maroon Backing Frame */}
        <mesh castShadow>
          <boxGeometry args={[7.8, 1.35, 0.18]} />
          <meshStandardMaterial color="#3b0707" roughness={0.35} metalness={0.3} />
        </mesh>
        {/* Golden Ornate Filigree Border */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[8.0, 1.5, 0.08]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.25}
            metalness={0.85}
            emissive="#d97706"
            emissiveIntensity={0.35}
          />
        </mesh>
        {/* Luminous Inner Inscription Plate */}
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[7.4, 1.05, 0.02]} />
          <meshStandardMaterial
            color="#450a0a"
            emissive="#b45309"
            emissiveIntensity={0.4}
            roughness={0.4}
          />
        </mesh>
        {/* Auspicious Golden Medallion Crest on Sign */}
        <mesh position={[0, 0.55, 0.12]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* North Facing Gateway Cartouche (visible from inside fairground) */}
      <group position={[0, 8.65, -0.7]} rotation={[0, Math.PI, 0]}>
        <mesh castShadow>
          <boxGeometry args={[7.8, 1.35, 0.18]} />
          <meshStandardMaterial color="#3b0707" roughness={0.35} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[8.0, 1.5, 0.08]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.25}
            metalness={0.85}
            emissive="#d97706"
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[7.4, 1.05, 0.02]} />
          <meshStandardMaterial
            color="#450a0a"
            emissive="#b45309"
            emissiveIntensity={0.4}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.55, 0.12]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ========================================================
          5. SLOPED CANTILEVERED CHHAJJA (EAVES) & KANGURA PARAPET
         ======================================================== */}
      {/* Front Eaves (Sloped outward towards South) */}
      <group position={[0, 9.4, 0.8]} rotation={[0.3, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[12.4, 0.12, 1.1]} />
          <meshStandardMaterial color="#9a3412" roughness={0.65} />
        </mesh>
        {/* Golden edge strip */}
        <mesh position={[0, -0.02, 0.52]}>
          <boxGeometry args={[12.42, 0.06, 0.06]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* Back Eaves (Sloped outward towards North) */}
      <group position={[0, 9.4, -0.8]} rotation={[-0.3, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[12.4, 0.12, 1.1]} />
          <meshStandardMaterial color="#9a3412" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.02, -0.52]}>
          <boxGeometry args={[12.42, 0.06, 0.06]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* Parapet Base Roof Slab */}
      <mesh position={[0, 9.55, 0]} castShadow>
        <boxGeometry args={[11.8, 0.25, 1.5]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>

      {/* Traditional Kangura Cresting (Ornamental Stepped Merlons) */}
      {Array.from({ length: 11 }).map((_, idx) => {
        const mx = (idx - 5) * 0.95;
        return (
          <group key={idx} position={[mx, 9.85, 0]}>
            {/* Merlon Body */}
            <mesh castShadow>
              <boxGeometry args={[0.55, 0.45, 0.3]} />
              <meshStandardMaterial color="#b45309" roughness={0.65} />
            </mesh>
            {/* Pointed Merlon Cap */}
            <mesh position={[0, 0.35, 0]} castShadow>
              <coneGeometry args={[0.32, 0.3, 4]} />
              <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* ========================================================
          6. TORAN GARLANDS & SUSPENDED TEMPLE BELLS
         ======================================================== */}
      {/* Lower Sweeping Cusped Toran Garland */}
      <MarigoldGarland
        start={[-3.8, 5.2, 0.65]}
        end={[0, 6.6, 0.65]}
        sag={0.4}
        count={16}
        flowerSize={0.09}
      />
      <MarigoldGarland
        start={[0, 6.6, 0.65]}
        end={[3.8, 5.2, 0.65]}
        sag={0.4}
        count={16}
        flowerSize={0.09}
      />

      {/* Second Layered Garland (Deeper Swag along Front Face) */}
      <MarigoldGarland
        start={[-4.4, 7.2, 0.72]}
        end={[0, 6.8, 0.72]}
        sag={0.3}
        count={14}
        flowerSize={0.08}
      />
      <MarigoldGarland
        start={[0, 6.8, 0.72]}
        end={[4.4, 7.2, 0.72]}
        sag={0.3}
        count={14}
        flowerSize={0.08}
      />

      {/* Symmetrical Rear Toran Garlands for Fairground View */}
      <MarigoldGarland
        start={[-3.8, 5.2, -0.65]}
        end={[0, 6.6, -0.65]}
        sag={0.4}
        count={16}
        flowerSize={0.09}
      />
      <MarigoldGarland
        start={[0, 6.6, -0.65]}
        end={[3.8, 5.2, -0.65]}
        sag={0.4}
        count={16}
        flowerSize={0.09}
      />

      {/* Hanging Brass Temple Bells with Chains underneath Arch */}
      <group ref={bellGroupRef}>
        {[-2.8, -1.4, 0, 1.4, 2.8].map((x, idx) => {
          // Calculate hanging Y position to follow the arch curve
          const archY = 6.4 - Math.abs(x) * 0.35;
          return (
            <group key={idx} position={[x, archY - 0.5, 0]}>
              {/* Linked Chain */}
              <mesh position={[0, -0.25, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.5, 6]} />
                <meshStandardMaterial color="#eab308" metalness={0.8} />
              </mesh>
              {/* Resonant Bell Body */}
              <mesh position={[0, -0.6, 0]} castShadow>
                <coneGeometry args={[0.18, 0.32, 12]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={0.88}
                  roughness={0.2}
                />
              </mesh>
              {/* Bell Rim Accent */}
              <mesh position={[0, -0.74, 0]}>
                <torusGeometry args={[0.18, 0.02, 6, 16]} />
                <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
              </mesh>
              {/* Bell Clapper */}
              <mesh position={[0, -0.76, 0]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshStandardMaterial color="#b45309" metalness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ========================================================
          7. ENTRANCE FLANKING PODIUMS WITH TIERED DEEPSTAMBHS
         ======================================================== */}
      {/* Left Deepstambh & Sacred Kalash Podium */}
      <group position={[-3.4, 0, 1.2]}>
        {/* Sandstone Base Podium */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.65, 0.75, 0.7, 14]} />
          <meshStandardMaterial color="#92400e" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.68, 0.68, 0.05, 14]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Tiered Brass Lamp Saucers with Glowing Diyas */}
        {/* Tier 1 (Lower) */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.45, 0.06, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* 4 Small Glowing Oil Diyas on Tier 1 */}
        {[-0.38, 0.38].map((dx, di) =>
          [-0.38, 0.38].map((dz, dzi) => (
            <mesh key={`l1-${di}-${dzi}`} position={[dx * 0.7, 0.83, dz * 0.7]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial
                color="#fff7d6"
                emissive="#ff7700"
                emissiveIntensity={2.8}
                toneMapped={false}
              />
            </mesh>
          ))
        )}

        {/* Center Pillar Shaft to Tier 2 */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 0.3, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Sacred Kalash on Podium Crown */}
        <SacredKalash position={[0, 1.05, 0]} />

        {/* Soft Golden Warm Local Illumination */}
        <pointLight
          position={[0, 1.4, 0]}
          color="#ffaa33"
          intensity={2.8}
          distance={10}
          decay={1.2}
        />
      </group>

      {/* Right Deepstambh & Sacred Kalash Podium */}
      <group position={[3.4, 0, 1.2]}>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.65, 0.75, 0.7, 14]} />
          <meshStandardMaterial color="#92400e" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.68, 0.68, 0.05, 14]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>

        <mesh position={[0, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.45, 0.06, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
        </mesh>
        {[-0.38, 0.38].map((dx, di) =>
          [-0.38, 0.38].map((dz, dzi) => (
            <mesh key={`r1-${di}-${dzi}`} position={[dx * 0.7, 0.83, dz * 0.7]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial
                color="#fff7d6"
                emissive="#ff7700"
                emissiveIntensity={2.8}
                toneMapped={false}
              />
            </mesh>
          ))
        )}

        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 0.3, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
        </mesh>

        <SacredKalash position={[0, 1.05, 0]} />

        <pointLight
          position={[0, 1.4, 0]}
          color="#ffaa33"
          intensity={2.8}
          distance={10}
          decay={1.2}
        />
      </group>

      {/* ========================================================
          8. WARM GOLDEN GATEWAY AMBIENT LANTERN ILLUMINATION
         ======================================================== */}
      <pointLight
        position={[-4.8, 4.8, 1.2]}
        color="#ffaa33"
        intensity={3.8}
        distance={18}
        decay={1.2}
      />
      <pointLight
        position={[4.8, 4.8, 1.2]}
        color="#ffaa33"
        intensity={3.8}
        distance={18}
        decay={1.2}
      />
      {/* Central Under-Arch Warm Lantern Glow */}
      <pointLight
        position={[0, 5.6, 0]}
        color="#ffaa33"
        intensity={4.5}
        distance={16}
        decay={1.2}
      />
    </group>
  );
};
