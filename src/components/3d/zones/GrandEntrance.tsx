import { useEffect } from 'react';
import { collisionSystem } from '../../../systems/collision';
import { MarigoldGarland, SacredKalash } from '../environment/FestivalProps';

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
      {/* ========================================================
          LEFT PILLAR (CARVED RAJASTHANI SANDSTONE)
         ======================================================== */}
      {/* Pillar Shaft */}
      <mesh position={[-4.8, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 8, 1.6]} />
        <meshStandardMaterial color="#c28847" roughness={0.7} />
      </mesh>
      {/* Ornate Pillar Base Plinth */}
      <mesh position={[-4.8, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 2.2]} />
        <meshStandardMaterial color="#8c5828" roughness={0.8} />
      </mesh>
      {/* Pillar Capital & Decorative Molding */}
      <mesh position={[-4.8, 7.8, 0]} castShadow>
        <boxGeometry args={[2.0, 0.4, 2.0]} />
        <meshStandardMaterial color="#b45309" roughness={0.6} />
      </mesh>
      {/* Left Chhatri Crown Dome */}
      <mesh position={[-4.8, 8.4, 0]} castShadow>
        <coneGeometry args={[1.4, 1.2, 8]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Left Finial Kalash */}
      <mesh position={[-4.8, 9.2, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} />
      </mesh>

      {/* Auspicious "SHUBH" Medallion on Left Pillar */}
      <group position={[-4.8, 4.8, 0.85]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.06, 24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.41, 0.41, 0.02, 24]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* ========================================================
          RIGHT PILLAR (CARVED RAJASTHANI SANDSTONE)
         ======================================================== */}
      {/* Pillar Shaft */}
      <mesh position={[4.8, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 8, 1.6]} />
        <meshStandardMaterial color="#c28847" roughness={0.7} />
      </mesh>
      {/* Base Plinth */}
      <mesh position={[4.8, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 2.2]} />
        <meshStandardMaterial color="#8c5828" roughness={0.8} />
      </mesh>
      {/* Decorative Molding */}
      <mesh position={[4.8, 7.8, 0]} castShadow>
        <boxGeometry args={[2.0, 0.4, 2.0]} />
        <meshStandardMaterial color="#b45309" roughness={0.6} />
      </mesh>
      {/* Right Chhatri Crown Dome */}
      <mesh position={[4.8, 8.4, 0]} castShadow>
        <coneGeometry args={[1.4, 1.2, 8]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Right Finial Kalash */}
      <mesh position={[4.8, 9.2, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} />
      </mesh>

      {/* Auspicious "LABH" Medallion on Right Pillar */}
      <group position={[4.8, 4.8, 0.85]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.06, 24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.41, 0.41, 0.02, 24]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* ========================================================
          OVERHEAD TORAN ARCHWAY & DECORATIVE GOKHDAS
         ======================================================== */}
      {/* Main Overhead Beam */}
      <mesh position={[0, 7.5, 0]} castShadow>
        <boxGeometry args={[11.6, 1.5, 1.2]} />
        <meshStandardMaterial color="#881337" roughness={0.5} />
      </mesh>

      {/* Left & Right Carved Stone Support Brackets (Gokhdas) */}
      <mesh position={[-3.8, 6.6, 0]} rotation={[0, 0, -0.6]} castShadow>
        <boxGeometry args={[0.4, 1.4, 1.1]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} />
      </mesh>
      <mesh position={[3.8, 6.6, 0]} rotation={[0, 0, 0.6]} castShadow>
        <boxGeometry args={[0.4, 1.4, 1.1]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} />
      </mesh>

      {/* Traditional Marigold Flower Garlands Across Arch (Left & Right Swags) */}
      <MarigoldGarland
        start={[-4.2, 6.8, 0.65]}
        end={[0, 6.25, 0.65]}
        sag={0.35}
        count={15}
        flowerSize={0.09}
      />
      <MarigoldGarland
        start={[0, 6.25, 0.65]}
        end={[4.2, 6.8, 0.65]}
        sag={0.35}
        count={15}
        flowerSize={0.09}
      />

      {/* Central "SHUBH DEEPAVALI" Illuminated Gateway Sign */}
      <group position={[0, 7.5, 0.7]}>
        <mesh castShadow>
          <boxGeometry args={[7.2, 1.3, 0.2]} />
          <meshStandardMaterial
            color="#3b0707"
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
        {/* Golden Ornate Border Frame */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[7.4, 1.45, 0.08]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.3}
            metalness={0.7}
            emissive="#d97706"
            emissiveIntensity={0.35}
          />
        </mesh>
      </group>

      {/* Hanging Brass Bells with Chains below Arch */}
      {[-3, -1.5, 0, 1.5, 3].map((x, idx) => (
        <group key={idx} position={[x, 5.8, 0]}>
          {/* Linked Chain */}
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} />
          </mesh>
          {/* Resonant Bell Body */}
          <mesh position={[0, -0.65, 0]} castShadow>
            <coneGeometry args={[0.18, 0.32, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.88} roughness={0.2} />
          </mesh>
          {/* Bell Clapper */}
          <mesh position={[0, -0.78, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#b45309" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          WELCOME PLINTHS & SACRED KALASH FLANKING ENTRANCE
         ======================================================== */}
      {/* Left Welcome Podium with Sacred Kalash */}
      <group position={[-3.2, 0, 1.2]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.9, 14]} />
          <meshStandardMaterial color="#92400e" roughness={0.75} />
        </mesh>
        <SacredKalash position={[0, 0.9, 0]} />
      </group>

      {/* Right Welcome Podium with Sacred Kalash */}
      <group position={[3.2, 0, 1.2]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.9, 14]} />
          <meshStandardMaterial color="#92400e" roughness={0.75} />
        </mesh>
        <SacredKalash position={[0, 0.9, 0]} />
      </group>
    </group>
  );
};
