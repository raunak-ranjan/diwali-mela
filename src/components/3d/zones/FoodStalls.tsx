import { useEffect } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';

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
      {/* --- STALL 1: ROYAL MITHAI BHANDAR --- */}
      <group position={[-14, 0, 6]}>
        {/* Wooden Stall Counter Structure */}
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 2.2, 3.5]} />
          <meshStandardMaterial color="#451a03" roughness={0.7} />
        </mesh>

        {/* Countertop Front Serving Shelf */}
        <mesh position={[2.0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.15, 3.8]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>

        {/* Striped Festive Fabric Canopy Roof */}
        <mesh position={[0, 3.4, 0]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[5.2, 0.15, 4.2]} />
          <meshStandardMaterial
            color="#dc2626" // Festive scarlet
            roughness={0.6}
          />
        </mesh>
        {/* Canopy Frill / Gold trim */}
        <mesh position={[2.4, 3.1, 0]}>
          <boxGeometry args={[0.2, 0.45, 4.2]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Stall Signboard */}
        <mesh position={[2.1, 2.9, 0]}>
          <boxGeometry args={[0.1, 0.7, 3.6]} />
          <meshStandardMaterial color="#fef08a" roughness={0.3} />
        </mesh>

        {/* Sweet Display Trays (Thalis) */}
        {/* Gulab Jamun Bowl */}
        <mesh position={[2.0, 1.55, -1.0]} castShadow>
          <cylinderGeometry args={[0.45, 0.35, 0.2, 16]} />
          <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Golden Jalebi Coil Tray */}
        <mesh position={[2.0, 1.55, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.4, 0.1, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.2} />
        </mesh>
        {/* Kaju Katli Diamond Platter */}
        <mesh position={[2.0, 1.55, 1.0]} castShadow>
          <cylinderGeometry args={[0.45, 0.4, 0.1, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Hanging Lanterns */}
        <mesh position={[2.2, 2.4, -1.6]}>
          <octahedronGeometry args={[0.25]} />
          <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={2.0} toneMapped={false} />
        </mesh>
        <mesh position={[2.2, 2.4, 1.6]}>
          <octahedronGeometry args={[0.25]} />
          <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={2.0} toneMapped={false} />
        </mesh>
      </group>

      {/* --- STALL 2: OLD DELHI CHAAT & SNACKS --- */}
      <group position={[-14, 0, 15]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 2.2, 3.5]} />
          <meshStandardMaterial color="#3b1d11" roughness={0.8} />
        </mesh>

        <mesh position={[2.0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.15, 3.8]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>

        {/* Saffron & Amber Fabric Canopy */}
        <mesh position={[0, 3.4, 0]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[5.2, 0.15, 4.2]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>

        <mesh position={[2.1, 2.9, 0]}>
          <boxGeometry args={[0.1, 0.7, 3.6]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.3} />
        </mesh>

        {/* Large Cooking Kadhai (Wok) for Hot Samosas */}
        <mesh position={[1.9, 1.6, -0.8]} castShadow>
          <cylinderGeometry args={[0.55, 0.35, 0.35, 16]} />
          <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Spice jars and clay kulhads */}
        {[-0.2, 0.2, 0.6, 1.0].map((z, idx) => (
          <mesh key={idx} position={[2.0, 1.55, z]} castShadow>
            <cylinderGeometry args={[0.12, 0.08, 0.25, 10]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
