import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';

export const CentralRangoliPlaza: React.FC = () => {
  const openModal = useGameStore((s) => s.openModal);

  useEffect(() => {
    // Register central fountain / urli pedestal obstacle
    collisionSystem.registerCylinder('central_urli', 0, 0, 1.8);

    // Register interaction for Rangoli Creation Challenge
    interactionRegistry.register({
      id: 'central_rangoli_challenge',
      position: [0, 0, 2.5],
      radius: 3.5,
      label: 'Diwali Rangoli Challenge',
      sublabel: 'Design & Color Sacred Rangoli',
      actionType: 'rangoli',
      onInteract: () => {
        openModal('rangoli');
      },
    });

    return () => {
      interactionRegistry.unregister('central_rangoli_challenge');
    };
  }, [openModal]);

  // Symmetrical 16-point petal array
  const outerPetals = useMemo(() => {
    const list: Array<{ x: number; z: number; angle: number }> = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      list.push({
        x: Math.cos(angle) * 4.65,
        z: Math.sin(angle) * 4.65,
        angle,
      });
    }
    return list;
  }, []);

  // Inner 16-point petal array offset by half an angle step
  const innerPetals = useMemo(() => {
    const list: Array<{ x: number; z: number; angle: number }> = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + Math.PI / 16;
      list.push({
        x: Math.cos(angle) * 2.7,
        z: Math.sin(angle) * 2.7,
        angle,
      });
    }
    return list;
  }, []);

  // Outer border perimeter diyas
  const perimeterDiyas = useMemo(() => {
    const list: Array<{ x: number; z: number; angle: number }> = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      list.push({
        x: Math.cos(angle) * 6.85,
        z: Math.sin(angle) * 6.85,
        angle,
      });
    }
    return list;
  }, []);

  // Radial marigold flower petal dots around outer border
  const flowerClusters = useMemo(() => {
    const list: Array<{ x: number; z: number; color: string }> = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      list.push({
        x: Math.cos(angle) * 6.6,
        z: Math.sin(angle) * 6.6,
        color: i % 2 === 0 ? '#f59e0b' : '#ea580c',
      });
    }
    return list;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. TIERED CARVED SANDSTONE PLINTH BASE
      ======================================================== */}
      {/* Lower Stepped Plinth Tier */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[7.4, 7.6, 0.04, 48]} />
        <meshStandardMaterial
          color="#703c28" // Warm Jaisalmer / Agra carved red sandstone
          roughness={0.7}
        />
      </mesh>

      {/* Upper Raised Plinth Platform */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[7.0, 7.15, 0.03, 48]} />
        <meshStandardMaterial
          color="#8c4e36"
          roughness={0.65}
        />
      </mesh>

      {/* Outer Molded Stone Lip */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[7.05, 0.025, 8, 48]} />
        <meshStandardMaterial color="#a65d40" roughness={0.6} />
      </mesh>

      {/* ========================================================
          2. OUTER BORDER: MARIGOLD PETAL RING & DIYA GARLAND
      ======================================================== */}
      {/* Golden Marigold Flower Petal Outer Band */}
      <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.5, 6.95, 48]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.75}
          emissive="#b45309"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Natural Marigold Petal Clusters along circumference */}
      {flowerClusters.map((fl, idx) => (
        <mesh key={idx} position={[fl.x, 0.053, fl.z]} rotation={[-Math.PI / 2, 0, idx * 0.5]}>
          <circleGeometry args={[0.16, 6]} />
          <meshStandardMaterial color={fl.color} roughness={0.8} />
        </mesh>
      ))}

      {/* 16 Perimeter Diya Pedestals with Golden Glow */}
      {perimeterDiyas.map((diya, idx) => (
        <group key={idx} position={[diya.x, 0.052, diya.z]}>
          {/* Terracotta/Brass Base */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.1, 0.04, 12]} />
            <meshStandardMaterial color="#c2410c" roughness={0.7} />
          </mesh>
          {/* Diya Oil Well */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.08, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.5} />
          </mesh>
          {/* Golden Flame */}
          <mesh position={[0, 0.08, 0]}>
            <coneGeometry args={[0.045, 0.1, 8]} />
            <meshStandardMaterial
              color="#fff5cc"
              emissive="#ff9900"
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          3. CONCENTRIC GEOMETRIC RANGOLI PATTERN RINGS
             Traditional Powder Palette: Rice White, Sindoor Crimson,
             Peacock Turquoise, Saffron Gold, and Royal Indigo
      ======================================================== */}
      {/* Ring 1: Rice Flour White Kolam / Alpana Wave Border */}
      <mesh position={[0, 0.054, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.95, 6.45, 48]} />
        <meshStandardMaterial
          color="#fdfbf7"
          roughness={0.72}
          emissive="#fed7aa"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Ring 2: Festive Sindoor / Vermillion Crimson Band */}
      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.0, 5.9, 48]} />
        <meshStandardMaterial
          color="#be123c"
          roughness={0.7}
          emissive="#881337"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Ring 3: Royal Peacock Turquoise Band */}
      <mesh position={[0, 0.056, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.05, 4.95, 48]} />
        <meshStandardMaterial
          color="#0891b2"
          roughness={0.7}
          emissive="#0e7490"
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Ring 4: Saffron & Turmeric Golden Sunburst Ring */}
      <mesh position={[0, 0.057, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.95, 4.0, 48]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.7}
          emissive="#b45309"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Ring 5: Ivory Cream Lotus Ring */}
      <mesh position={[0, 0.058, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 2.9, 48]} />
        <meshStandardMaterial
          color="#fdf2f8"
          roughness={0.72}
          emissive="#f472b6"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Ring 6: Deep Royal Indigo Peacock Lotus Core */}
      <mesh position={[0, 0.059, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.85, 36]} />
        <meshStandardMaterial
          color="#1e1b4b"
          roughness={0.75}
          emissive="#312e81"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* ========================================================
          4. SYMMETRICAL MANDALA FLORAL & GEOMETRIC MOTIFS
      ======================================================== */}
      {/* 16 Outer Lotus Petals (Crimson & Gold tips) */}
      {outerPetals.map((petal, idx) => (
        <group key={idx} position={[petal.x, 0.060, petal.z]} rotation={[-Math.PI / 2, 0, petal.angle]}>
          {/* Main Petal Blade */}
          <mesh position={[0, 0.35, 0]}>
            <coneGeometry args={[0.42, 1.1, 4]} />
            <meshStandardMaterial
              color="#e11d48"
              emissive="#9f1239"
              emissiveIntensity={0.3}
              roughness={0.7}
            />
          </mesh>
          {/* Golden Petal Spine Inlay */}
          <mesh position={[0, 0.3, 0.02]} scale={[0.5, 0.8, 0.5]}>
            <coneGeometry args={[0.3, 0.9, 4]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d97706"
              emissiveIntensity={0.35}
              roughness={0.65}
            />
          </mesh>
        </group>
      ))}

      {/* 16 Inner Lotus Petals (Turquoise & Ivory tips) */}
      {innerPetals.map((petal, idx) => (
        <group key={idx} position={[petal.x, 0.061, petal.z]} rotation={[-Math.PI / 2, 0, petal.angle]}>
          <mesh position={[0, 0.28, 0]}>
            <coneGeometry args={[0.32, 0.85, 4]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0369a1"
              emissiveIntensity={0.3}
              roughness={0.7}
            />
          </mesh>
          {/* Pearl White Rice Powder Center Dot */}
          <mesh position={[0, 0.5, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.07, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#fed7aa"
              emissiveIntensity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 8 Mango / Paisley Leaf Accents (Emerald Green) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const x = Math.cos(angle) * 3.65;
        const z = Math.sin(angle) * 3.65;
        return (
          <mesh
            key={i}
            position={[x, 0.062, z]}
            rotation={[-Math.PI / 2, 0, angle + 0.3]}
          >
            <boxGeometry args={[0.3, 0.65, 0.02]} />
            <meshStandardMaterial
              color="#059669"
              emissive="#047857"
              emissiveIntensity={0.25}
              roughness={0.7}
            />
          </mesh>
        );
      })}

      {/* ========================================================
          5. CENTRAL BRASS URLI BOWL WITH FLOATING FLOWER PETALS & DIYAS
      ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Carved Stone Pedestal */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.5, 0.8, 16]} />
          <meshStandardMaterial color="#612707" roughness={0.7} />
        </mesh>

        {/* Polished Brass Urli Vessel */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[1.4, 0.8, 0.4, 24]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.85}
            roughness={0.22}
          />
        </mesh>
        {/* Embossed Urli Rolled Rim */}
        <mesh position={[0, 1.1, 0]}>
          <torusGeometry args={[1.4, 0.035, 8, 24]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Floating scented water surface */}
        <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.35, 24]} />
          <meshStandardMaterial
            color="#be123c" // Deep scented rose water
            roughness={0.15}
            metalness={0.3}
          />
        </mesh>

        {/* Floating Rose & Marigold Petal Clusters */}
        {[
          [-0.6, 0.4, '#fb7185'],
          [0.7, -0.3, '#fbbf24'],
          [-0.3, -0.7, '#f43f5e'],
          [0.5, 0.6, '#ea580c'],
          [-0.8, -0.2, '#f59e0b'],
          [0.2, -0.8, '#f43f5e'],
        ].map(([px, pz, col], idx) => (
          <mesh
            key={idx}
            position={[Number(px), 1.06, Number(pz)]}
            rotation={[-Math.PI / 2, 0, idx * 0.8]}
          >
            <circleGeometry args={[0.12, 6]} />
            <meshStandardMaterial color={String(col)} roughness={0.7} />
          </mesh>
        ))}

        {/* Central Akhand Jyoti Brass Diya Base */}
        <mesh position={[0, 1.12, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.28, 0.16, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Central Akhand Jyoti Sacred Flame */}
        <mesh position={[0, 1.28, 0]} castShadow>
          <coneGeometry args={[0.22, 0.48, 12]} />
          <meshStandardMaterial
            color="#fff5cc"
            emissive="#ff7700"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
};
