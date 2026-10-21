import { useEffect } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';
import {
  MarigoldGarland,
  LaddooPlate,
  JalebiPlate,
  GulabJamunHandi,
  SamosaKadhai,
  BrassThali,
} from '../environment/FestivalProps';

export const FoodStalls = () => {
  const openModal = useGameStore((s) => s.openModal);

  useEffect(() => {
    // Register Food Stall collision boxes on West side (X ~ -14)
    // Stall 1 (Mithai): X: [-17, -11], Z: [3, 9]
    collisionSystem.registerBox('stall_mithai', -17, -11, 3, 9);
    // Stall 2 (Chaat): X: [-17, -11], Z: [12, 18]
    collisionSystem.registerBox('stall_chaat', -17, -11, 12, 18);

    // Register shopping interaction
    interactionRegistry.register({
      id: 'mithai_shop',
      position: [-10.5, 1.0, 6.0],
      radius: 3.2,
      label: 'Shree Ganesh Sweets & Mithai',
      sublabel: 'Gulab Jamun, Jalebi & Kaju Katli',
      actionType: 'shop',
      onInteract: () => {
        openModal('shop');
      },
    });

    interactionRegistry.register({
      id: 'chaat_shop',
      position: [-10.5, 1.0, 15.0],
      radius: 3.2,
      label: 'Old Delhi Chaat & Snacks',
      sublabel: 'Crispy Samosa & Festive Treats',
      actionType: 'shop',
      onInteract: () => {
        openModal('shop');
      },
    });

    return () => {
      interactionRegistry.unregister('mithai_shop');
      interactionRegistry.unregister('chaat_shop');
    };
  }, [openModal]);

  return (
    <group>
      {/* ========================================================
          STALL 1: ROYAL MITHAI BHANDAR (TRADITIONAL SWEET SHOP)
         ======================================================== */}
      <group position={[-14, 0, 6]}>
        {/* Teakwood Stall Counter Structure */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 1.5, 3.6]} />
          <meshStandardMaterial color="#6b371b" roughness={0.7} />
        </mesh>

        {/* Polished Countertop Serving Slab */}
        <mesh position={[1.85, 1.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.08, 3.8]} />
          <meshStandardMaterial color="#9a4312" roughness={0.35} metalness={0.1} />
        </mesh>

        {/* Brass Counter Corner Protectors */}
        {[-1.85, 1.85].map((z, idx) => (
          <mesh key={idx} position={[2.2, 1.48, z]}>
            <boxGeometry args={[0.08, 0.09, 0.08]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}

        {/* 4 Wooden Corner Canopy Support Poles */}
        {[
          [-1.8, -1.6],
          [-1.8, 1.6],
          [1.8, -1.6],
          [1.8, 1.6],
        ].map(([x, z], idx) => (
          <mesh key={idx} position={[x, 1.9, z]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 2.4, 8]} />
            <meshStandardMaterial color="#542b14" roughness={0.8} />
          </mesh>
        ))}

        {/* Traditional Striped Fabric Canopy (Alternating Crimson & Cream Stripes) */}
        <group position={[0, 3.25, 0]} rotation={[0, 0, -0.15]}>
          {/* Main Canopy Base */}
          <mesh castShadow>
            <boxGeometry args={[4.8, 0.06, 4.2]} />
            <meshStandardMaterial color="#991b1b" roughness={0.7} />
          </mesh>

          {/* 6 Alternating Cream Stripes */}
          {[-1.6, -0.96, -0.32, 0.32, 0.96, 1.6].map((z, idx) => (
            <mesh key={idx} position={[0, 0.035, z]}>
              <boxGeometry args={[4.82, 0.015, 0.28]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.75} />
            </mesh>
          ))}

          {/* Scalloped Front Valance with Antique Gold Trim */}
          <mesh position={[2.38, -0.22, 0]}>
            <boxGeometry args={[0.06, 0.42, 4.2]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.65} />
          </mesh>
          <mesh position={[2.41, -0.4, 0]}>
            <boxGeometry args={[0.04, 0.06, 4.22]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* Marigold Flower Garland Draped Along Stall Front */}
        <MarigoldGarland
          start={[2.1, 2.9, -1.8]}
          end={[2.1, 2.9, 1.8]}
          sag={0.35}
          count={16}
          flowerSize={0.08}
        />

        {/* Carved Halwai Hindi Signboard */}
        <group position={[2.05, 2.7, 0]}>
          {/* Wooden board */}
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.55, 3.4]} />
            <meshStandardMaterial color="#451a03" roughness={0.6} />
          </mesh>
          {/* Ornate Gold Trim Border */}
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.02, 0.59, 3.44]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Golden Lettering Inset */}
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

        {/* Sweets Display Trays (Indian Mithai on Counter) */}
        {/* 1. Motichoor Laddoo Pyramid */}
        <LaddooPlate position={[1.85, 1.52, -1.1]} />

        {/* 2. Crispy Saffron Jalebis */}
        <JalebiPlate position={[1.85, 1.52, -0.35]} />

        {/* 3. Gulab Jamun Bronze Handi */}
        <GulabJamunHandi position={[1.85, 1.52, 0.4]} />

        {/* 4. Silver Foil Kaju Katli Platter */}
        <group position={[1.85, 1.52, 1.15]}>
          <BrassThali radius={0.3} />
          {/* Diamond Cut Cashew Sweets with Silver Vark */}
          {[-0.08, 0.08].map((x, xi) =>
            [-0.09, 0, 0.09].map((z, zi) => (
              <mesh
                key={`${xi}-${zi}`}
                position={[x, 0.04, z]}
                rotation={[0, 0.785, 0]}
                castShadow
              >
                <boxGeometry args={[0.07, 0.025, 0.07]} />
                <meshStandardMaterial
                  color="#e2e8f0"
                  metalness={0.85}
                  roughness={0.2}
                />
              </mesh>
            ))
          )}
        </group>

        {/* Traditional Brass Weighing Scale (Taraazu) on side shelf */}
        <group position={[1.8, 1.52, 1.65]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.01, 0.015, 0.35, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.28, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[-0.12, 0.18, 0]}>
            <cylinderGeometry args={[0.08, 0.05, 0.03, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} />
          </mesh>
          <mesh position={[0.12, 0.18, 0]}>
            <cylinderGeometry args={[0.08, 0.05, 0.03, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          STALL 2: OLD DELHI CHAAT & SNACKS (DELHI SPICE CORNER)
         ======================================================== */}
      <group position={[-14, 0, 15]}>
        {/* Stall Base Frame */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 1.5, 3.6]} />
          <meshStandardMaterial color="#6b371b" roughness={0.7} />
        </mesh>

        {/* Counter Serving Shelf */}
        <mesh position={[1.85, 1.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.08, 3.8]} />
          <meshStandardMaterial color="#9a4312" roughness={0.4} />
        </mesh>

        {/* 4 Wooden Corner Poles */}
        {[
          [-1.8, -1.6],
          [-1.8, 1.6],
          [1.8, -1.6],
          [1.8, 1.6],
        ].map(([x, z], idx) => (
          <mesh key={idx} position={[x, 1.9, z]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 2.4, 8]} />
            <meshStandardMaterial color="#4a2511" roughness={0.8} />
          </mesh>
        ))}

        {/* Saffron & Emerald Green Striped Canopy */}
        <group position={[0, 3.25, 0]} rotation={[0, 0, -0.15]}>
          <mesh castShadow>
            <boxGeometry args={[4.8, 0.06, 4.2]} />
            <meshStandardMaterial color="#ea580c" roughness={0.7} />
          </mesh>
          {/* Alternating Emerald Green Stripes */}
          {[-1.6, -0.96, -0.32, 0.32, 0.96, 1.6].map((z, idx) => (
            <mesh key={idx} position={[0, 0.035, z]}>
              <boxGeometry args={[4.82, 0.015, 0.28]} />
              <meshStandardMaterial color="#047857" roughness={0.75} />
            </mesh>
          ))}
          {/* Front Frill */}
          <mesh position={[2.38, -0.22, 0]}>
            <boxGeometry args={[0.06, 0.42, 4.2]} />
            <meshStandardMaterial color="#c2410c" roughness={0.65} />
          </mesh>
          <mesh position={[2.41, -0.4, 0]}>
            <boxGeometry args={[0.04, 0.06, 4.22]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* Marigold Garland Front Accent */}
        <MarigoldGarland
          start={[2.1, 2.9, -1.8]}
          end={[2.1, 2.9, 1.8]}
          sag={0.35}
          count={16}
          flowerSize={0.08}
        />

        {/* Chaat Corner Signboard */}
        <group position={[2.05, 2.7, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.55, 3.4]} />
            <meshStandardMaterial color="#2d1505" roughness={0.6} />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.02, 0.59, 3.44]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0.05, 0, 0]}>
            <boxGeometry args={[0.01, 0.35, 3.1]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={0.35}
              roughness={0.3}
            />
          </mesh>
        </group>

        {/* Large Cast-Iron Samosa Kadhai */}
        <SamosaKadhai position={[1.8, 1.52, -1.0]} />

        {/* Stacked Earthen Clay Kulhads (for Masala Chai & Lassi) */}
        <group position={[1.85, 1.52, -0.15]}>
          {[-0.08, 0.08].map((x, xi) =>
            [-0.08, 0.08].map((z, zi) => (
              <mesh key={`${xi}-${zi}`} position={[x, 0.08, z]} castShadow>
                <cylinderGeometry args={[0.055, 0.04, 0.16, 12]} />
                <meshStandardMaterial
                  color="#8c4722" // Terracotta clay kulhad
                  roughness={0.85}
                />
              </mesh>
            ))
          )}
          {/* Top stacked kulhad */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.04, 0.16, 12]} />
            <meshStandardMaterial color="#8c4722" roughness={0.85} />
          </mesh>
        </group>

        {/* Stainless Steel Spice / Chutney Canisters */}
        {/* Sweet Tamarind Saunth (Red-Brown Chutney Jar) */}
        <group position={[1.85, 1.52, 0.55]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.11, 0.28, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} />
          </mesh>
        </group>

        {/* Spicy Mint-Coriander Chutney (Green Jar) */}
        <group position={[1.85, 1.52, 0.95]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.11, 0.28, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} />
          </mesh>
        </group>

        {/* Traditional Brass Water Lotas / Serving Tumblers */}
        <mesh position={[1.85, 1.62, 1.45]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.2, 14]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};
