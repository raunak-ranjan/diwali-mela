import { useMemo } from 'react';

export const GroundAndSky = () => {
  // Generate procedural starry night sky points
  const starsData = useMemo(() => {
    const coords = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const radius = 80 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.8 + 0.2); // Upper dome only

      coords[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      coords[i * 3 + 1] = radius * Math.cos(phi);
      coords[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return coords;
  }, []);

  return (
    <group>
      {/* Ground Fairground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 10]} receiveShadow>
        <planeGeometry args={[90, 95]} />
        <meshStandardMaterial
          color="#1e1814" // Warm nocturnal earth / stone
          roughness={0.78}
          metalness={0.12}
        />
      </mesh>

      {/* Main Walkway Paved Strip (Entrance to Central Plaza & Stage) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 10]} receiveShadow>
        <planeGeometry args={[8.5, 90]} />
        <meshStandardMaterial
          color="#2a201b" // Red sandstone paved walkway
          roughness={0.65}
          metalness={0.08}
        />
      </mesh>

      {/* East-West Crossway Paved Strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <planeGeometry args={[48, 8.5]} />
        <meshStandardMaterial
          color="#2a201b"
          roughness={0.65}
          metalness={0.08}
        />
      </mesh>

      {/* Distant Stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starsData, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.7}
          color="#fff8e7"
          transparent
          opacity={0.8}
        />
      </points>

      {/* Perimeter Boundary Fences with Marigold Festoons */}
      {/* North Wall */}
      <mesh position={[0, 1.8, 52]}>
        <boxGeometry args={[85, 3.6, 0.8]} />
        <meshStandardMaterial color="#3b1d11" roughness={0.9} />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, 1.8, -32]}>
        <boxGeometry args={[85, 3.6, 0.8]} />
        <meshStandardMaterial color="#3b1d11" roughness={0.9} />
      </mesh>
      {/* West Wall */}
      <mesh position={[-42, 1.8, 10]}>
        <boxGeometry args={[0.8, 3.6, 85]} />
        <meshStandardMaterial color="#3b1d11" roughness={0.9} />
      </mesh>
      {/* East Wall */}
      <mesh position={[42, 1.8, 10]}>
        <boxGeometry args={[0.8, 3.6, 85]} />
        <meshStandardMaterial color="#3b1d11" roughness={0.9} />
      </mesh>
    </group>
  );
};
