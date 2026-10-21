import { useEffect } from 'react';
import { collisionSystem } from '../../../systems/collision';

export const GrandEntrance = () => {
  useEffect(() => {
    // Register left and right pillar obstacles with collision system
    // Left pillar: [-5.5, -4.0], Z: [-25.5, -23.5]
    collisionSystem.registerBox('entrance_pillar_left', -5.8, -4.0, -25.5, -23.5);
    collisionSystem.registerBox('entrance_pillar_right', 4.0, 5.8, -25.5, -23.5);

    return () => {
      // unregister
    };
  }, []);

  return (
    <group position={[0, 0, -24.5]}>
      {/* Left Ornate Stone Pillar */}
      <mesh position={[-4.8, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 8, 1.6]} />
        <meshStandardMaterial color="#c28847" roughness={0.7} />
      </mesh>
      {/* Left Pillar Base */}
      <mesh position={[-4.8, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 2.2]} />
        <meshStandardMaterial color="#8c5828" roughness={0.8} />
      </mesh>
      {/* Left Pillar Crown / Chhatri */}
      <mesh position={[-4.8, 8.4, 0]} castShadow>
        <coneGeometry args={[1.4, 1.2, 8]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Right Ornate Stone Pillar */}
      <mesh position={[4.8, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 8, 1.6]} />
        <meshStandardMaterial color="#c28847" roughness={0.7} />
      </mesh>
      {/* Right Pillar Base */}
      <mesh position={[4.8, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 2.2]} />
        <meshStandardMaterial color="#8c5828" roughness={0.8} />
      </mesh>
      {/* Right Pillar Crown */}
      <mesh position={[4.8, 8.4, 0]} castShadow>
        <coneGeometry args={[1.4, 1.2, 8]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Main Archway Overhead Beam */}
      <mesh position={[0, 7.5, 0]} castShadow>
        <boxGeometry args={[11.6, 1.5, 1.2]} />
        <meshStandardMaterial color="#991b1b" roughness={0.5} />
      </mesh>

      {/* Toran / Marigold Garland swag */}
      <mesh position={[0, 6.4, 0.6]}>
        <torusGeometry args={[3.8, 0.16, 8, 24, Math.PI]} />
        <meshStandardMaterial
          color="#f97316" // Vibrant marigold orange
          emissive="#ea580c"
          emissiveIntensity={0.6}
          roughness={0.7}
        />
      </mesh>

      {/* Mango Leaf Garland accent */}
      <mesh position={[0, 6.6, 0.55]}>
        <torusGeometry args={[4.2, 0.12, 8, 24, Math.PI]} />
        <meshStandardMaterial
          color="#16a34a" // Fresh green mango leaves
          roughness={0.6}
        />
      </mesh>

      {/* Central "SHUBH DIWALI" Illuminated Sign Board */}
      <group position={[0, 7.5, 0.7]}>
        <mesh>
          <boxGeometry args={[7.2, 1.3, 0.2]} />
          <meshStandardMaterial
            color="#450a0a"
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
        {/* Golden border */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[7.4, 1.45, 0.08]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.3}
            metalness={0.6}
            emissive="#d97706"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {/* Hanging Brass Bells below Arch */}
      {[-3, -1.5, 0, 1.5, 3].map((x, idx) => (
        <group key={idx} position={[x, 5.8, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.65, 0]}>
            <coneGeometry args={[0.2, 0.35, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Welcome Diya Podiums */}
      <mesh position={[-3.2, 0.5, 1.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 1.0, 12]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>
      <mesh position={[3.2, 0.5, 1.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 1.0, 12]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>
    </group>
  );
};
