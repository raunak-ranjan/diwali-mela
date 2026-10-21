import { useEffect } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';

export const CentralRangoliPlaza = () => {
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

  return (
    <group position={[0, 0, 0]}>
      {/* Central Circular Plinth */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[7.0, 7.2, 0.05, 36]} />
        <meshStandardMaterial
          color="#382218"
          roughness={0.6}
        />
      </mesh>

      {/* Intricate Geometric Rangoli Pattern Rings */}
      {/* Outer Ring: Festive Vermillion */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.8, 5.8, 36]} />
        <meshStandardMaterial
          color="#e11d48"
          roughness={0.7}
          emissive="#9f1239"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Marigold Petals Ring */}
      <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.6, 4.7, 36]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.7}
          emissive="#b45309"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Turmeric & Rice Flour Middle Floral Ring */}
      <mesh position={[0, 0.054, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3.5, 36]} />
        <meshStandardMaterial
          color="#10b981"
          roughness={0.7}
          emissive="#047857"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Innermost Peacock Blue Lotus Core */}
      <mesh position={[0, 0.056, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.1, 36]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.7}
          emissive="#0369a1"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* 8 Floral Lotus Petals along circumference */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 3.8;
        const z = Math.sin(angle) * 3.8;
        return (
          <mesh key={i} position={[x, 0.058, z]} rotation={[-Math.PI / 2, 0, angle]}>
            <coneGeometry args={[0.7, 1.4, 4]} />
            <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.25} />
          </mesh>
        );
      })}

      {/* Central Brass Urli Bowl with floating flower petals & diyas */}
      <group position={[0, 0, 0]}>
        {/* Carved stone plinth */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.5, 0.8, 16]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>

        {/* Brass Urli Vessel */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[1.4, 0.8, 0.4, 24]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.85}
            roughness={0.22}
          />
        </mesh>
        {/* Embossed Urli Rim */}
        <mesh position={[0, 1.1, 0]}>
          <torusGeometry args={[1.4, 0.035, 8, 24]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Floating scented water surface */}
        <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.35, 24]} />
          <meshStandardMaterial
            color="#be123c" // Deep rose water
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
