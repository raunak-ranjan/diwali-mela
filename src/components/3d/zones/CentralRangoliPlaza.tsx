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
          emissiveIntensity={0.3}
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
          emissiveIntensity={0.3}
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
            <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.3} />
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
            color="#eab308"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Floating scented water & rose petals */}
        <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.35, 24]} />
          <meshStandardMaterial
            color="#fb7185" // Rose petal water
            roughness={0.2}
            metalness={0.4}
            emissive="#e11d48"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Central Akhand Jyoti / Big Plaza Diya */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <coneGeometry args={[0.3, 0.5, 12]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={4.0}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
};
