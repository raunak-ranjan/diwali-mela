import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';

interface BalloonTarget {
  id: number;
  pos: [number, number, number];
  color: string;
  isPopped: boolean;
  scale: number;
}

export const BalloonShootingBooth = () => {
  const startBalloonGame = useGameStore((s) => s.startBalloonGame);
  const isPlaying = useGameStore((s) => s.balloonGame.isPlaying);
  const recordBalloonHit = useGameStore((s) => s.recordBalloonHit);

  // 12 balloons on a target board
  const [balloons, setBalloons] = useState<BalloonTarget[]>(() => {
    const list: BalloonTarget[] = [];
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    let id = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        list.push({
          id: id++,
          pos: [14.0, 1.8 + row * 0.65, 4.8 + col * 0.7],
          color: colors[(row * 4 + col) % colors.length],
          isPopped: false,
          scale: 1,
        });
      }
    }
    return list;
  });

  useEffect(() => {
    // Collision for the booth on East side (X: [11.5, 16.5], Z: [3, 9])
    collisionSystem.registerBox('booth_balloon', 11.5, 16.5, 3, 9);

    // Register interaction trigger
    interactionRegistry.register({
      id: 'balloon_shooting_booth',
      position: [10.5, 1.0, 6.0],
      radius: 3.5,
      label: 'Balloon Shooting Carnival Stall',
      sublabel: 'Win Virtual Tokens! Aim & Shoot',
      actionType: 'balloon_game',
      onInteract: () => {
        // Reset balloons
        setBalloons((prev) => prev.map((b) => ({ ...b, isPopped: false, scale: 1 })));
        startBalloonGame();
      },
    });

    return () => {
      interactionRegistry.unregister('balloon_shooting_booth');
    };
  }, [startBalloonGame]);

  // Click on a balloon directly during game
  const handleBalloonClick = (balloonId: number) => {
    if (!isPlaying) return;
    setBalloons((prev) =>
      prev.map((b) => (b.id === balloonId && !b.isPopped ? { ...b, isPopped: true } : b))
    );
    recordBalloonHit(10);
  };

  // Subtle balloon sway
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 2) * 0.02;
    }
  });

  return (
    <group position={[14, 0, 6]}>
      {/* Carnival Booth Structure */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.2, 4.5]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>

      {/* Target Backboard with cork texture color */}
      <mesh position={[0, 2.3, 0]}>
        <boxGeometry args={[0.2, 2.0, 3.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>

      {/* Front Shooting Counter Rail */}
      <mesh position={[-1.8, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.2, 4.2]} />
        <meshStandardMaterial color="#b45309" roughness={0.4} />
      </mesh>

      {/* Striped Carnival Canopy */}
      <mesh position={[0, 3.6, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[4.5, 0.15, 5.0]} />
        <meshStandardMaterial color="#2563eb" roughness={0.6} />
      </mesh>
      <mesh position={[-2.0, 3.3, 0]}>
        <boxGeometry args={[0.2, 0.45, 5.0]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Air Rifle Toy Props on counter */}
      <mesh position={[-1.7, 1.35, -0.6]} rotation={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 1.0]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-1.7, 1.35, 0.6]} rotation={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 1.0]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 3D Colorful Target Balloons */}
      <group ref={groupRef}>
        {balloons.map((b) => {
          if (b.isPopped) return null;
          // Relative coordinates inside booth
          const relY = b.pos[1];
          const relZ = b.pos[2] - 6.0;
          return (
            <group
              key={b.id}
              position={[-0.1, relY, relZ]}
              onClick={(e) => {
                e.stopPropagation();
                handleBalloonClick(b.id);
              }}
            >
              {/* Balloon Sphere */}
              <mesh castShadow>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial
                  color={b.color}
                  roughness={0.3}
                  metalness={0.1}
                />
              </mesh>
              {/* Balloon knot */}
              <mesh position={[0, -0.24, 0]}>
                <coneGeometry args={[0.04, 0.06, 8]} />
                <meshStandardMaterial color={b.color} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Booth Lights */}
      <pointLight position={[-0.8, 2.8, 0]} color="#fef08a" intensity={1.5} distance={6} />
    </group>
  );
};
