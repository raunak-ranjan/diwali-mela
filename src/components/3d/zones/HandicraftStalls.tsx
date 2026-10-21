import { useEffect } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';

export const HandicraftStalls = () => {
  const openModal = useGameStore((s) => s.openModal);

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
        openModal('shop');
      },
    });

    return () => {
      interactionRegistry.unregister('handicraft_shop');
    };
  }, [openModal]);

  return (
    <group position={[-14, 0, -9]}>
      {/* Wooden Structure */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 2.2, 3.5]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>

      {/* Front Shelf */}
      <mesh position={[2.0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.15, 3.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.4} />
      </mesh>

      {/* Royal Magenta & Gold Canopy */}
      <mesh position={[0, 3.4, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[5.2, 0.15, 4.2]} />
        <meshStandardMaterial color="#9d174d" roughness={0.6} />
      </mesh>

      {/* Canopy Frill */}
      <mesh position={[2.4, 3.1, 0]}>
        <boxGeometry args={[0.2, 0.45, 4.2]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Hanging Akash Kandils (Traditional Star Lanterns) */}
      {[-1.2, 0, 1.2].map((z, idx) => (
        <group key={idx} position={[2.3, 2.5, z]}>
          {/* Central geometric lantern core */}
          <mesh>
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial
              color={idx === 1 ? '#f59e0b' : '#ec4899'}
              emissive={idx === 1 ? '#d97706' : '#db2777'}
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          {/* Hanging tails / ribbons */}
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.2, 0.4, 6]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Painted Teracotta Pots & Diya pyramids on shelf */}
      {[-1.0, -0.3, 0.4, 1.1].map((z, idx) => (
        <mesh key={idx} position={[2.0, 1.6, z]} castShadow>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};
