import React, { useEffect, useMemo } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';

export const RingTossBooth: React.FC = () => {
  const openModal = useGameStore((s) => s.openModal);

  useEffect(() => {
    // East side carnival game stall (X: [11.5, 16.5], Z: [-12, -6])
    collisionSystem.registerBox('booth_ring_toss', 11.5, 16.5, -12, -6);

    // Register interaction trigger for Ring Toss stall
    interactionRegistry.register({
      id: 'ring_toss_booth',
      position: [10.5, 1.0, -9.0],
      radius: 3.5,
      label: 'Diwali Ring Toss Carnival',
      sublabel: 'Win Fair Tokens! Toss Rings on Bottles',
      actionType: 'ring_toss',
      onInteract: () => {
        openModal('ring_toss');
      },
    });

    return () => {
      interactionRegistry.unregister('ring_toss_booth');
    };
  }, [openModal]);

  // Target bottle positions on tiered counter
  const targetBottles = useMemo(() => {
    const list: Array<{ x: number; y: number; z: number; color: string; metalness: number; radius: number; height: number }> = [];

    // Row 1 (Front tier): 4 brass bottles
    for (let i = 0; i < 4; i++) {
      list.push({
        x: -1.2 + i * 0.8,
        y: 1.45,
        z: -0.6,
        color: '#f59e0b',
        metalness: 0.7,
        radius: 0.08,
        height: 0.38,
      });
    }

    // Row 2 (Middle tier): 3 terracotta bottles
    for (let i = 0; i < 3; i++) {
      list.push({
        x: -0.8 + i * 0.8,
        y: 1.65,
        z: 0.0,
        color: '#dc2626',
        metalness: 0.2,
        radius: 0.09,
        height: 0.42,
      });
    }

    // Row 3 (Back tier): 2 royal golden kalash vases
    for (let i = 0; i < 2; i++) {
      list.push({
        x: -0.4 + i * 0.8,
        y: 1.85,
        z: 0.6,
        color: '#ffd700',
        metalness: 0.9,
        radius: 0.11,
        height: 0.48,
      });
    }

    return list;
  }, []);

  return (
    <group position={[14, 0, -9]}>
      {/* Carnival Booth Main Wooden Structure */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.2, 4.5]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>

      {/* Target Stepped Bleachers for Bottles */}
      <mesh position={[-0.2, 1.35, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      <mesh position={[-0.2, 1.55, 0.0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#542b14" roughness={0.8} />
      </mesh>
      <mesh position={[-0.2, 1.75, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>

      {/* Front Serving Counter */}
      <mesh position={[-1.8, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.2, 4.2]} />
        <meshStandardMaterial color="#b45309" roughness={0.4} />
      </mesh>

      {/* Target Upright Bottles and Pegs */}
      {targetBottles.map((bottle, idx) => (
        <group key={idx} position={[bottle.z, bottle.y, bottle.x]}>
          {/* Bottle body */}
          <mesh castShadow position={[0, bottle.height / 2, 0]}>
            <cylinderGeometry args={[bottle.radius * 0.6, bottle.radius, bottle.height, 12]} />
            <meshStandardMaterial
              color={bottle.color}
              metalness={bottle.metalness}
              roughness={0.3}
            />
          </mesh>
          {/* Bottle neck/peg */}
          <mesh castShadow position={[0, bottle.height + 0.08, 0]}>
            <cylinderGeometry args={[bottle.radius * 0.35, bottle.radius * 0.4, 0.16, 10]} />
            <meshStandardMaterial
              color={bottle.color}
              metalness={bottle.metalness}
              roughness={0.2}
            />
          </mesh>
          {/* Decorative neck collar */}
          <mesh position={[0, bottle.height + 0.14, 0]}>
            <torusGeometry args={[bottle.radius * 0.4, 0.015, 8, 12]} />
            <meshStandardMaterial color="#fef08a" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Display Rings on Front Counter */}
      {[-0.8, -0.3, 0.2, 0.7].map((offset, idx) => (
        <mesh
          key={idx}
          position={[-1.75, 1.33, offset]}
          rotation={[Math.PI / 2, 0, idx * 0.3]}
          castShadow
        >
          <torusGeometry args={[0.14, 0.022, 10, 20]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}

      {/* Striped Carnival Canopy */}
      <mesh position={[0, 3.6, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[4.5, 0.15, 5.0]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} />
      </mesh>
      {/* Canopy Scalloped Valance Trim */}
      <mesh position={[-2.0, 3.3, 0]}>
        <boxGeometry args={[0.2, 0.45, 5.0]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 4 Wooden Canopy Corner Pillars */}
      {[
        [-1.7, -1.9],
        [-1.7, 1.9],
        [1.7, -1.9],
        [1.7, 1.9],
      ].map(([px, pz], idx) => (
        <mesh key={idx} position={[px, 2.2, pz]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.4, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
      ))}

      {/* Signboard Banner: "DIWALI RING TOSS" */}
      <group position={[-2.05, 3.15, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 0.55, 0.08]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[3.0, 0.42, 0.02]} />
          <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Warm Ambient Carnival Stall Light */}
      <pointLight position={[-1.0, 2.8, 0]} color="#fbbf24" intensity={2.5} distance={7.0} decay={1.5} />
    </group>
  );
};
