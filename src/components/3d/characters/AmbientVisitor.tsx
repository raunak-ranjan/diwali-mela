import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FestiveCharacterMesh } from './FestiveCharacterMesh';
import type { AmbientVisitorConfig } from '../../../types/npc';
import {
  advanceAutonomousNpc,
  selectVisitorDialogue,
  type NpcSimulationState,
} from '../../../systems/npcLogic';
import { npcCoordinator } from '../../../systems/npcCoordinator';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { useNpcStore } from '../../../stores/useNpcStore';
import { useGameStore } from '../../../stores/useGameStore';
import { soundEngine } from '../../../audio/soundEngine';

interface AmbientVisitorProps {
  config: AmbientVisitorConfig;
  reducedMotion?: boolean;
}

export const AmbientVisitor: React.FC<AmbientVisitorProps> = ({ config, reducedMotion = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bobRef = useRef(0);
  const nodRef = useRef(0);
  const interactionCountRef = useRef(0);
  const lastRegisteredPos = useRef<[number, number, number]>([
    config.waypoints[0][0],
    config.waypoints[0][1],
    config.waypoints[0][2],
  ]);

  // Initialize simulation state from initial waypoint
  const simState = useRef<NpcSimulationState>({
    position: [config.waypoints[0][0], config.waypoints[0][1], config.waypoints[0][2]],
    waypointIndex: 0,
    state: 'walking',
    pauseTimer: 0,
    yaw: 0,
    queueId: null,
    queueSlotIndex: undefined,
    stuckTimer: 0,
    lastPosition: [config.waypoints[0][0], config.waypoints[0][1], config.waypoints[0][2]],
  });

  const interactionTargetId = `visitor_dialogue_${config.id}`;

  // Register in coordinator and interactionRegistry on mount, clean up on unmount
  useEffect(() => {
    npcCoordinator.updatePosition(config.id, simState.current.position);

    interactionRegistry.register({
      id: interactionTargetId,
      position: simState.current.position,
      radius: 3.2,
      label: `Greet ${config.name}`,
      sublabel: config.activityHindi
        ? `${config.currentActivity || 'Festival Visitor'} • ${config.activityHindi}`
        : config.currentActivity || 'Festival Visitor',
      actionType: 'talk',
      onInteract: () => {
        const isCooldown = useNpcStore.getState().isVisitorOnCooldown(config.id);
        if (isCooldown) {
          soundEngine.playVisitorGreeting();
          return;
        }

        const dialogue = selectVisitorDialogue(config, interactionCountRef.current++);
        soundEngine.playVisitorGreeting();

        useNpcStore.getState().openVisitorDialogue({
          visitorId: config.id,
          visitorName: config.name,
          role: config.role,
          personality: config.personality || 'cheerful',
          outfit: config.outfit,
          greeting: dialogue.greeting,
          greetingHindi: dialogue.greetingHindi,
          festivalTip: dialogue.festivalTip,
          currentThought: dialogue.currentThought,
          currentActivity: config.currentActivity || 'Celebrating Diwali at the Mela',
        });
      },
    });

    return () => {
      npcCoordinator.removeNpc(config.id);
      interactionRegistry.unregister(interactionTargetId);
    };
  }, [config, interactionTargetId]);

  useFrame(({ camera }, delta) => {
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

    // Environmental state from game store
    const gameState = useGameStore.getState();
    const isStageActive = gameState.culturalStageState.isScreenActive;
    const isFireworksActive = gameState.activeModal === 'finale';

    const playerPos: [number, number, number] = [
      camera.position.x,
      camera.position.y,
      camera.position.z,
    ];

    // Advance pure autonomous simulation state with environmental context
    const { nextState, queueAction } = advanceAutonomousNpc(
      simState.current,
      { ...config, speed },
      dt,
      {
        otherNpcPositions: otherPositions,
        obstacles,
        currentQueue: currentQueue || null,
        personalSpace: 0.95,
        environment: {
          isStageActive,
          stageFocusPoint: [0, 2, 36],
          isFireworksActive,
          playerPos,
          playerNearbyRadius: 3.2,
        },
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

    // Update interactionRegistry target position if moved significantly (> 0.4m)
    const dx = nextState.position[0] - lastRegisteredPos.current[0];
    const dz = nextState.position[2] - lastRegisteredPos.current[2];
    if (dx * dx + dz * dz > 0.16) {
      lastRegisteredPos.current = [nextState.position[0], nextState.position[1], nextState.position[2]];
      const target = interactionRegistry.get(interactionTargetId);
      if (target) {
        target.position = nextState.position;
      }
    }

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

    // Subtle walk bobbing or polite greeting / spectator nodding
    const distToPlayer = Math.sqrt(
      Math.pow(nextState.position[0] - playerPos[0], 2) +
      Math.pow(nextState.position[2] - playerPos[2], 2)
    );
    const isInteractingWithPlayer = distToPlayer < 2.8 && (nextState.state === 'pausing' || nextState.state === 'watching');

    if (nextState.state === 'walking' && !reducedMotion) {
      bobRef.current += dt * (speed * 7);
      const bobY = Math.sin(bobRef.current) * 0.04;
      // Slight side-to-side tilt
      groupRef.current.rotation.z = Math.cos(bobRef.current * 0.5) * 0.02;
      groupRef.current.position.y = nextState.position[1] + Math.max(0, bobY);
      groupRef.current.rotation.x = 0;
    } else if (isInteractingWithPlayer && !reducedMotion) {
      // Gentle conversational nod when facing nearby player
      nodRef.current += dt * 2.0;
      groupRef.current.rotation.x = Math.sin(nodRef.current) * 0.04;
      groupRef.current.rotation.z = 0;
      groupRef.current.position.y = nextState.position[1];
    } else {
      groupRef.current.rotation.x = 0;
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
