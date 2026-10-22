import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FestiveCharacterMesh } from './FestiveCharacterMesh';
import type { AmbientVisitorConfig } from '../../../types/npc';
import { advanceNpcSimulation, type NpcSimulationState } from '../../../systems/npcLogic';

interface AmbientVisitorProps {
  config: AmbientVisitorConfig;
  reducedMotion?: boolean;
}

export const AmbientVisitor: React.FC<AmbientVisitorProps> = ({ config, reducedMotion = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bobRef = useRef(0);

  // Initialize simulation state from initial waypoint
  const simState = useRef<NpcSimulationState>({
    position: [config.waypoints[0][0], config.waypoints[0][1], config.waypoints[0][2]],
    waypointIndex: 0,
    state: 'walking',
    pauseTimer: 0,
    yaw: 0,
  });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Cap delta to prevent teleporting on tab switch
    const dt = Math.min(delta, 0.1);
    const speed = reducedMotion ? config.speed * 0.7 : config.speed;

    // Advance pure simulation state
    const nextState = advanceNpcSimulation(
      simState.current,
      config.waypoints,
      speed,
      config.pauseDuration,
      dt
    );
    simState.current = nextState;

    // Apply 3D transform
    groupRef.current.position.set(
      nextState.position[0],
      nextState.position[1],
      nextState.position[2]
    );

    // Smoothly slerp rotation towards target yaw
    const currentRotY = groupRef.current.rotation.y;
    // Shortest angular difference
    let diff = nextState.yaw - currentRotY;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    groupRef.current.rotation.y += diff * Math.min(1, dt * 5);

    // Calculate subtle walk bobbing
    if (nextState.state === 'walking' && !reducedMotion) {
      bobRef.current += dt * (speed * 7);
      const bobY = Math.sin(bobRef.current) * 0.04;
      // Slight side-to-side tilt
      groupRef.current.rotation.z = Math.cos(bobRef.current * 0.5) * 0.02;
      groupRef.current.position.y = nextState.position[1] + Math.max(0, bobY);
    } else {
      groupRef.current.rotation.z = 0;
      groupRef.current.position.y = nextState.position[1];
    }
  });

  return (
    <group
      ref={groupRef}
      position={[config.waypoints[0][0], config.waypoints[0][1], config.waypoints[0][2]]}
      name={config.id}
    >
      <FestiveCharacterMesh outfit={config.outfit} accessory={config.accessory} />
    </group>
  );
};
