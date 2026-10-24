import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FestiveCharacterMesh } from './FestiveCharacterMesh';
import type { AmbientVisitorConfig } from '../../../types/npc';
import { advanceAutonomousNpc, type NpcSimulationState } from '../../../systems/npcLogic';
import { npcCoordinator } from '../../../systems/npcCoordinator';

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
    queueId: null,
    queueSlotIndex: undefined,
  });

  // Register in coordinator on mount, cleanup on unmount
  useEffect(() => {
    npcCoordinator.updatePosition(config.id, simState.current.position);
    return () => {
      npcCoordinator.removeNpc(config.id);
    };
  }, [config.id]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Cap delta to prevent teleporting on tab switch
    const dt = Math.min(delta, 0.1);
    const speed = reducedMotion ? config.speed * 0.7 : config.speed;

    // Synchronize current queue slot index if in a queue
    if (simState.current.state === 'queuing' && simState.current.queueId) {
      const activeSlot = npcCoordinator.getNpcQueueSlot(simState.current.queueId, config.id);
      if (activeSlot !== -1) {
        simState.current.queueSlotIndex = activeSlot;
      }
    }

    const otherPositions = npcCoordinator.getOtherPositions(config.id);
    const obstacles = npcCoordinator.getRestrictedZones();
    const currentQueue = simState.current.queueId
      ? npcCoordinator.getQueue(simState.current.queueId)
      : config.targetQueueId
        ? npcCoordinator.getQueue(config.targetQueueId)
        : null;

    // Advance pure autonomous simulation state
    const { nextState, queueAction } = advanceAutonomousNpc(
      { ...simState.current, speed: config.speed } as any,
      { ...config, speed },
      dt,
      {
        otherNpcPositions: otherPositions,
        obstacles,
        currentQueue: currentQueue || null,
        personalSpace: 0.95,
      }
    );

    // Handle queue join/leave intents from simulation
    if (queueAction === 'join_queue' && config.targetQueueId) {
      const joinResult = npcCoordinator.tryJoinQueue(config.targetQueueId, config.id);
      if (joinResult.success) {
        nextState.state = 'queuing';
        nextState.queueId = config.targetQueueId;
        nextState.queueSlotIndex = joinResult.slotIndex;
      } else {
        // Queue full, continue pausing/wandering
        nextState.state = 'pausing';
        nextState.queueId = null;
        nextState.queueSlotIndex = undefined;
      }
    } else if (queueAction === 'leave_queue' && simState.current.queueId) {
      npcCoordinator.leaveQueue(simState.current.queueId, config.id);
      nextState.queueId = null;
      nextState.queueSlotIndex = undefined;
    }

    simState.current = nextState;

    // Update coordinator position for neighbor pedestrian avoidance
    npcCoordinator.updatePosition(config.id, nextState.position);

    // Apply 3D transform
    groupRef.current.position.set(
      nextState.position[0],
      nextState.position[1],
      nextState.position[2]
    );

    // Smoothly slerp rotation towards target yaw
    const currentRotY = groupRef.current.rotation.y;
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
