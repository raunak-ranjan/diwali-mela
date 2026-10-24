import { useEffect } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';
import { MarigoldGarland, AkashKandilLantern } from '../environment/FestivalProps';

// Pre-batched static stall geometries (created once at module load to save draw calls)
const stallCornerPolesGeometry = (() => {
  const pole = new THREE.CylinderGeometry(0.05, 0.06, 2.4, 8);
  const positions = [
    [-1.8, 1.9, -1.6],
    [-1.8, 1.9, 1.6],
    [1.8, 1.9, -1.6],
    [1.8, 1.9, 1.6],
  ];
  const geos = positions.map(([x, y, z]) => pole.clone().translate(x, y, z));
  return BufferGeometryUtils.mergeGeometries(geos) || pole;
})();

const canopyStripesGeometry = (() => {
  const stripe = new THREE.BoxGeometry(4.82, 0.015, 0.28);
  const zPositions = [-1.6, -0.96, -0.32, 0.32, 0.96, 1.6];
  const geos = zPositions.map((z) => stripe.clone().translate(0, 0.035, z));
  return BufferGeometryUtils.mergeGeometries(geos) || stripe;
})();

const counterDiyasGeometry = (() => {
  const diya = new THREE.CylinderGeometry(0.09, 0.05, 0.05, 10);
  const zPositions = [-0.7, -0.2, 0.2, 0.7];
  const geos = zPositions.map((z) => diya.clone().translate(1.85, 1.55, z));
  return BufferGeometryUtils.mergeGeometries(geos) || diya;
})();

export const HandicraftStalls = () => {
  const openShopWithCategory = useGameStore((s) => s.openShopWithCategory);

  useEffect(() => {
    // West stalls further back:
    // Stall 3 (Handicrafts & Diyas): X: [-17, -11], Z: [-12, -6]
    collisionSystem.registerBox('stall_handicrafts', -17, -11, -12, -6);

    // Register shopping interaction
    interactionRegistry.register({
      id: 'handicraft_shop',
      position: [-10.5, 1.0, -9.0],
      radius: 3.2,
      label: 'Diwali Diyas & Festive Handicrafts',
      sublabel: 'Kandils, Clay Diyas & Golden Sparklers',
      actionType: 'shop',
      onInteract: () => {
        openShopWithCategory('diya');
      },
    });

    return () => {
      interactionRegistry.unregister('handicraft_shop');
    };
  }, [openShopWithCategory]);

  return (
    <group position={[-14, 0, -9]}>
      {/* ========================================================
          HANDICRAFT STALL: DIWALI DIYAS, KANDILS & SOUVENIRS
         ======================================================== */}
      {/* Dark Walnut Wooden Base Frame */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 1.5, 3.6]} />
        <meshStandardMaterial color="#6b371b" roughness={0.7} />
      </mesh>

      {/* Counter Serving Shelf */}
      <mesh position={[1.85, 1.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.75, 0.08, 3.8]} />
        <meshStandardMaterial color="#9a4312" roughness={0.4} />
      </mesh>

      {/* Stepped Wooden Display Shelves for Pottery & Diyas */}
      <mesh position={[1.4, 1.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.2, 3.4]} />
        <meshStandardMaterial color="#542b14" roughness={0.7} />
      </mesh>
      <mesh position={[1.0, 1.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.2, 3.4]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>

      {/* 4 Wooden Corner Canopy Poles (Batched into 1 draw call) */}
      <mesh geometry={stallCornerPolesGeometry} castShadow>
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>

      {/* Royal Magenta & Turmeric Gold Striped Fabric Canopy */}
      <group position={[0, 3.25, 0]} rotation={[0, 0, -0.15]}>
        <mesh castShadow>
          <boxGeometry args={[4.8, 0.06, 4.2]} />
          <meshStandardMaterial color="#831843" roughness={0.7} />
        </mesh>
        {/* Turmeric Gold Alternating Stripes (Batched into 1 draw call) */}
        <mesh geometry={canopyStripesGeometry}>
          <meshStandardMaterial color="#f59e0b" roughness={0.75} />
        </mesh>
        {/* Scalloped Gold-Trimmed Valance */}
        <mesh position={[2.38, -0.22, 0]}>
          <boxGeometry args={[0.06, 0.42, 4.2]} />
          <meshStandardMaterial color="#701a75" roughness={0.65} />
        </mesh>
        <mesh position={[2.41, -0.4, 0]}>
          <boxGeometry args={[0.04, 0.06, 4.22]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Marigold Flower Garland Across Front */}
      <MarigoldGarland
        start={[2.1, 2.9, -1.8]}
        end={[2.1, 2.9, 1.8]}
        sag={0.35}
        count={16}
        flowerSize={0.08}
      />

      {/* Ornate Handicrafts Signboard */}
      <group position={[2.05, 2.7, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.55, 3.4]} />
          <meshStandardMaterial color="#3b1d11" roughness={0.6} />
        </mesh>
        <mesh position={[0.04, 0, 0]}>
          <boxGeometry args={[0.02, 0.59, 3.44]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0.05, 0, 0]}>
          <boxGeometry args={[0.01, 0.35, 3.1]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#d97706"
            emissiveIntensity={0.35}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Hanging Traditional Akash Kandils (Faceted Star Sky Lanterns) */}
      <AkashKandilLantern
        position={[2.0, 2.3, -1.2]}
        primaryColor="#e11d48"
        ribbonColor="#fbbf24"
      />
      <AkashKandilLantern
        position={[2.0, 2.3, 0]}
        primaryColor="#f59e0b"
        ribbonColor="#10b981"
      />
      <AkashKandilLantern
        position={[2.0, 2.3, 1.2]}
        primaryColor="#0284c7"
        ribbonColor="#fbbf24"
      />

      {/* Handcrafted Pottery & Painted Matkas on Stepped Shelves */}
      {/* 1. Large Painted Terracotta Kalash */}
      <group position={[1.4, 1.84, -1.2]}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 14, 14]} />
          <meshStandardMaterial color="#c2410c" roughness={0.75} />
        </mesh>
        {/* White Rangoli-style Painted Bands */}
        <mesh position={[0, 0.05, 0]}>
          <torusGeometry args={[0.13, 0.012, 6, 16]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.8} />
        </mesh>
      </group>

      {/* 2. Painted Terracotta Diya Stack */}
      {[-0.5, 0.3].map((z, idx) => (
        <group key={idx} position={[1.4, 1.78, z]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.08, 0.08, 12]} />
            <meshStandardMaterial
              color={idx === 0 ? '#0284c7' : '#ea580c'} // Painted blue / red
              roughness={0.65}
            />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.06, 0.07, 12]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.65} />
          </mesh>
        </group>
      ))}

      {/* 3. Traditional Brass Panchmukhi Diya Stand */}
      <group position={[1.85, 1.52, -1.2]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.015, 0.04, 0.3, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Circular Oil Pan with 5 wick spouts */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.12, 0.07, 0.05, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Peacock Finial Top */}
        <mesh position={[0, 0.37, 0]}>
          <coneGeometry args={[0.04, 0.1, 6]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* 4. Display of Diwali Earthen Diyas on Front Counter (Batched into 1 draw call) */}
      <mesh geometry={counterDiyasGeometry} castShadow>
        <meshStandardMaterial color="#8a431d" roughness={0.78} />
      </mesh>

      {/* 5. Phooljhadi (Golden Sparklers) Boxes Display */}
      <group position={[1.85, 1.52, 1.25]}>
        {[-0.08, 0.08].map((offset, idx) => (
          <mesh key={idx} position={[0, 0.08, offset]} rotation={[0, 0.1 * idx, 0]} castShadow>
            <boxGeometry args={[0.14, 0.16, 0.1]} />
            <meshStandardMaterial
              color={idx === 0 ? '#dc2626' : '#2563eb'}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
