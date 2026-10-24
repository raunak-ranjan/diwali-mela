import type { Waypoint, NpcState, AmbientVisitorConfig, CrowdDensity, MelaQueueConfig } from '../types/npc';
import type { GraphicsQuality } from '../types/game';

export interface BoundingBox2D {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * Returns the next waypoint index, wrapping around if looping is enabled.
 */
export function getNextWaypointIndex(
  currentIndex: number,
  totalWaypoints: number,
  loop: boolean = true
): number {
  if (totalWaypoints <= 0) return 0;
  const next = currentIndex + 1;
  if (next >= totalWaypoints) {
    return loop ? 0 : currentIndex;
  }
  return next;
}

/**
 * Calculates Euclidean 2D distance on the XZ ground plane.
 */
export function getDistance2D(p1: [number, number, number], p2: [number, number, number]): number {
  const dx = p1[0] - p2[0];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Computes the target yaw angle (in radians) towards a waypoint or orientation.
 */
export function getAngleTowards(
  fromPos: [number, number, number],
  toPos: [number, number, number]
): number {
  const dx = toPos[0] - fromPos[0];
  const dz = toPos[2] - fromPos[2];
  if (Math.abs(dx) < 0.0001 && Math.abs(dz) < 0.0001) return 0;
  return Math.atan2(dx, dz);
}

/**
 * Steps position towards target waypoint based on delta time and speed.
 */
export function stepTowardsWaypoint(
  currentPos: [number, number, number],
  targetWaypoint: [number, number, number],
  stepDistance: number
): [number, number, number] {
  const dx = targetWaypoint[0] - currentPos[0];
  const dz = targetWaypoint[2] - currentPos[2];
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist <= stepDistance || dist === 0) {
    return [targetWaypoint[0], currentPos[1], targetWaypoint[2]];
  }

  const ratio = stepDistance / dist;
  return [
    currentPos[0] + dx * ratio,
    currentPos[1],
    currentPos[2] + dz * ratio,
  ];
}

// ── Pedestrian Avoidance (Repulsion) ──────────────────────────────────────────

/**
 * Computes a 2D horizontal avoidance vector away from neighboring NPCs within personal space.
 * The repulsive force is stronger the closer the other pedestrian is.
 */
export function computePedestrianAvoidance(
  currentPos: [number, number, number],
  otherPositions: [number, number, number][],
  personalSpace: number = 0.95
): [number, number] {
  let avoidX = 0;
  let avoidZ = 0;

  for (const other of otherPositions) {
    const dx = currentPos[0] - other[0];
    const dz = currentPos[2] - other[2];
    const distSq = dx * dx + dz * dz;

    if (distSq > 0.0001 && distSq < personalSpace * personalSpace) {
      const dist = Math.sqrt(distSq);
      // Normalized linear falloff: 1 at d=0, 0 at d=personalSpace
      const weight = (personalSpace - dist) / personalSpace;
      avoidX += (dx / dist) * weight;
      avoidZ += (dz / dist) * weight;
    }
  }

  return [avoidX, avoidZ];
}

/**
 * Steps towards a target position while incorporating pedestrian avoidance deflection.
 */
export function stepWithAvoidance(
  currentPos: [number, number, number],
  targetPos: [number, number, number],
  stepDistance: number,
  otherPositions: [number, number, number][],
  personalSpace: number = 0.95,
  avoidanceWeight: number = 0.65
): [number, number, number] {
  const dx = targetPos[0] - currentPos[0];
  const dz = targetPos[2] - currentPos[2];
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist <= stepDistance || dist === 0) {
    return [targetPos[0], currentPos[1], targetPos[2]];
  }

  // Direct unit direction towards goal
  let dirX = dx / dist;
  let dirZ = dz / dist;

  // Add avoidance force
  const [avoidX, avoidZ] = computePedestrianAvoidance(currentPos, otherPositions, personalSpace);
  if (avoidX !== 0 || avoidZ !== 0) {
    dirX += avoidX * avoidanceWeight;
    dirZ += avoidZ * avoidanceWeight;
    const combinedMag = Math.sqrt(dirX * dirX + dirZ * dirZ);
    if (combinedMag > 0.0001) {
      dirX /= combinedMag;
      dirZ /= combinedMag;
    }
  }

  return [
    currentPos[0] + dirX * stepDistance,
    currentPos[1],
    currentPos[2] + dirZ * stepDistance,
  ];
}

// ── Obstacle Resolution ───────────────────────────────────────────────────────

/**
 * Resolves 2D position against bounding box obstacles, sliding along the edges.
 */
export function resolveObstacleCollision2D(
  currentPos: [number, number, number],
  targetPos: [number, number, number],
  obstacles: BoundingBox2D[],
  npcRadius: number = 0.35,
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number } = {
    minX: -36,
    maxX: 36,
    minZ: -28,
    maxZ: 46,
  }
): [number, number, number] {
  let resolvedX = targetPos[0];
  let resolvedZ = targetPos[2];

  // 1. Clamp to fairground boundary
  resolvedX = Math.max(bounds.minX + npcRadius, Math.min(bounds.maxX - npcRadius, resolvedX));
  resolvedZ = Math.max(bounds.minZ + npcRadius, Math.min(bounds.maxZ - npcRadius, resolvedZ));

  // 2. Resolve against obstacles
  for (const box of obstacles) {
    const minX = box.minX - npcRadius;
    const maxX = box.maxX + npcRadius;
    const minZ = box.minZ - npcRadius;
    const maxZ = box.maxZ + npcRadius;

    if (resolvedX >= minX && resolvedX <= maxX && resolvedZ >= minZ && resolvedZ <= maxZ) {
      if (currentPos[0] >= maxX) {
        resolvedX = maxX;
      } else if (currentPos[0] <= minX) {
        resolvedX = minX;
      } else if (currentPos[2] >= maxZ) {
        resolvedZ = maxZ;
      } else if (currentPos[2] <= minZ) {
        resolvedZ = minZ;
      } else {
        const dLeft = Math.abs(resolvedX - minX);
        const dRight = Math.abs(resolvedX - maxX);
        const dBottom = Math.abs(resolvedZ - minZ);
        const dTop = Math.abs(resolvedZ - maxZ);
        const minD = Math.min(dLeft, dRight, dBottom, dTop);

        if (minD === dRight) resolvedX = maxX;
        else if (minD === dLeft) resolvedX = minX;
        else if (minD === dTop) resolvedZ = maxZ;
        else resolvedZ = minZ;
      }
    }
  }

  return [resolvedX, targetPos[1], resolvedZ];
}

// ── Queue System ─────────────────────────────────────────────────────────────

export interface MelaQueueState {
  id: string;
  name: string;
  servicePoint: Waypoint;
  slots: Waypoint[];
  facingYaw: number;
  serviceDuration: number;
  /** Occupants ordered from front (index 0) to tail */
  occupants: string[];
}

export function createMelaQueue(config: MelaQueueConfig): MelaQueueState {
  return {
    id: config.id,
    name: config.name,
    servicePoint: config.servicePoint,
    slots: config.slots,
    facingYaw: config.facingYaw,
    serviceDuration: config.serviceDuration,
    occupants: [],
  };
}

export function isQueueFull(queue: MelaQueueState): boolean {
  return queue.occupants.length >= queue.slots.length;
}

export function getNpcQueueSlot(queue: MelaQueueState, npcId: string): number {
  return queue.occupants.indexOf(npcId);
}

export function tryJoinQueue(
  queue: MelaQueueState,
  npcId: string
): { queue: MelaQueueState; slotIndex: number; success: boolean } {
  // If already in queue, return existing slot
  const existingSlot = queue.occupants.indexOf(npcId);
  if (existingSlot !== -1) {
    return { queue, slotIndex: existingSlot, success: true };
  }

  if (isQueueFull(queue)) {
    return { queue, slotIndex: -1, success: false };
  }

  const updatedOccupants = [...queue.occupants, npcId];
  const slotIndex = updatedOccupants.length - 1;

  return {
    queue: {
      ...queue,
      occupants: updatedOccupants,
    },
    slotIndex,
    success: true,
  };
}

export function leaveQueue(queue: MelaQueueState, npcId: string): MelaQueueState {
  const index = queue.occupants.indexOf(npcId);
  if (index === -1) return queue;

  const updatedOccupants = queue.occupants.filter((id) => id !== npcId);
  return {
    ...queue,
    occupants: updatedOccupants,
  };
}

// ── Simulation State & Autonomous Advancement ────────────────────────────────

export interface NpcSimulationState {
  position: [number, number, number];
  waypointIndex: number;
  state: NpcState;
  pauseTimer: number;
  yaw: number;
  // Queue & autonomous extensions
  queueId?: string | null;
  queueSlotIndex?: number;
  serviceTimer?: number;
  watchingTimer?: number;
}

export interface AutonomousNpcOptions {
  otherNpcPositions?: [number, number, number][];
  personalSpace?: number;
  obstacles?: BoundingBox2D[];
  currentQueue?: MelaQueueState | null;
}

/**
 * Pure state machine evaluator for an NPC update step (Original baseline).
 */
export function advanceNpcSimulation(
  currentState: NpcSimulationState,
  waypoints: Waypoint[],
  speed: number,
  pauseDuration: number,
  deltaSeconds: number,
  arrivalThreshold: number = 0.3
): NpcSimulationState {
  if (!waypoints || waypoints.length === 0) {
    return { ...currentState, state: 'idle' };
  }

  const targetWaypoint = waypoints[currentState.waypointIndex] || waypoints[0];
  const dist = getDistance2D(currentState.position, targetWaypoint);

  // If currently pausing at a waypoint
  if (currentState.state === 'pausing') {
    const newTimer = currentState.pauseTimer + deltaSeconds;
    if (newTimer >= pauseDuration) {
      // Pause ended, transition to walking to next waypoint
      const nextIdx = getNextWaypointIndex(currentState.waypointIndex, waypoints.length, true);
      const nextWaypoint = waypoints[nextIdx];
      const nextYaw = getAngleTowards(currentState.position, nextWaypoint);
      return {
        ...currentState,
        waypointIndex: nextIdx,
        state: 'walking',
        pauseTimer: 0,
        yaw: nextYaw,
      };
    }
    return {
      ...currentState,
      pauseTimer: newTimer,
    };
  }

  // If walking towards target
  if (dist <= arrivalThreshold) {
    // Reached destination, pause
    return {
      ...currentState,
      position: [targetWaypoint[0], currentState.position[1], targetWaypoint[2]],
      state: 'pausing',
      pauseTimer: 0,
    };
  }

  // Still walking
  const stepDist = speed * deltaSeconds;
  const newPos = stepTowardsWaypoint(currentState.position, targetWaypoint, stepDist);
  const targetYaw = getAngleTowards(currentState.position, targetWaypoint);

  return {
    ...currentState,
    position: newPos,
    state: 'walking',
    yaw: targetYaw,
  };
}

/**
 * Advanced autonomous NPC simulation:
 * - Supports walking, pausing, watching, and queuing states
 * - Obstacle collision avoidance and sliding
 * - Pedestrian-to-pedestrian repulsion to prevent overlapping
 * - Line queue step-up and service timer progression
 */
export function advanceAutonomousNpc(
  currentState: NpcSimulationState,
  config: AmbientVisitorConfig,
  deltaSeconds: number,
  options: AutonomousNpcOptions = {},
  arrivalThreshold: number = 0.35
): { nextState: NpcSimulationState; queueAction?: 'leave_queue' | 'join_queue' } {
  const waypoints = config.waypoints;
  const speed = config.speed;
  const pauseDuration = config.pauseDuration;
  const otherPositions = options.otherNpcPositions || [];
  const obstacles = options.obstacles || [];
  const queue = options.currentQueue;

  // 1. Queuing state
  if (currentState.state === 'queuing' && queue && currentState.queueSlotIndex !== undefined) {
    const slotIdx = currentState.queueSlotIndex;
    const targetSlotPos = queue.slots[slotIdx] || queue.servicePoint;
    const distToSlot = getDistance2D(currentState.position, targetSlotPos);

    if (distToSlot > arrivalThreshold) {
      // Walking into or forward in queue
      const stepDist = speed * deltaSeconds;
      const stepped = stepWithAvoidance(
        currentState.position,
        targetSlotPos,
        stepDist,
        otherPositions,
        options.personalSpace ?? 0.8
      );
      const resolved = obstacles.length > 0
        ? resolveObstacleCollision2D(currentState.position, stepped, obstacles)
        : stepped;
      const targetYaw = getAngleTowards(currentState.position, targetSlotPos);

      return {
        nextState: {
          ...currentState,
          position: resolved,
          yaw: targetYaw,
        },
      };
    }

    // In slot position
    // If at front of queue (slot 0), advance service timer
    if (slotIdx === 0) {
      const currentService = (currentState.serviceTimer || 0) + deltaSeconds;
      if (currentService >= queue.serviceDuration) {
        // Finished at stall/ride! Leave queue and resume tour
        const nextWpIdx = getNextWaypointIndex(currentState.waypointIndex, waypoints.length, true);
        const nextWp = waypoints[nextWpIdx] || [0, 0, 0];
        const nextYaw = getAngleTowards(currentState.position, nextWp);

        return {
          nextState: {
            ...currentState,
            state: 'walking',
            waypointIndex: nextWpIdx,
            queueId: null,
            queueSlotIndex: undefined,
            serviceTimer: 0,
            pauseTimer: 0,
            yaw: nextYaw,
          },
          queueAction: 'leave_queue',
        };
      }

      return {
        nextState: {
          ...currentState,
          position: [targetSlotPos[0], currentState.position[1], targetSlotPos[2]],
          serviceTimer: currentService,
          yaw: queue.facingYaw,
        },
      };
    }

    // Waiting behind in line, facing the counter
    return {
      nextState: {
        ...currentState,
        position: [targetSlotPos[0], currentState.position[1], targetSlotPos[2]],
        yaw: queue.facingYaw,
      },
    };
  }

  // 2. Watching state (e.g. at Cultural Stage or Rangoli)
  if (currentState.state === 'watching') {
    const watchingTimer = (currentState.watchingTimer || 0) + deltaSeconds;
    const maxWatchTime = pauseDuration * 1.5;

    if (watchingTimer >= maxWatchTime) {
      const nextIdx = getNextWaypointIndex(currentState.waypointIndex, waypoints.length, true);
      const nextWp = waypoints[nextIdx];
      const nextYaw = getAngleTowards(currentState.position, nextWp);
      return {
        nextState: {
          ...currentState,
          state: 'walking',
          waypointIndex: nextIdx,
          watchingTimer: 0,
          pauseTimer: 0,
          yaw: nextYaw,
        },
      };
    }

    // Face the spectacle focus point if provided
    let watchYaw = currentState.yaw;
    if (config.watchFocusPoint) {
      watchYaw = getAngleTowards(currentState.position, config.watchFocusPoint);
    }

    return {
      nextState: {
        ...currentState,
        watchingTimer,
        yaw: watchYaw,
      },
    };
  }

  // 3. Pausing state
  if (currentState.state === 'pausing') {
    const newTimer = currentState.pauseTimer + deltaSeconds;
    if (newTimer >= pauseDuration) {
      // Transition: if near a target queue, attempt to join queue
      if (config.targetQueueId && queue && queue.id === config.targetQueueId && !isQueueFull(queue)) {
        return {
          nextState: {
            ...currentState,
            state: 'queuing',
            queueId: config.targetQueueId,
            pauseTimer: 0,
          },
          queueAction: 'join_queue',
        };
      }

      const nextIdx = getNextWaypointIndex(currentState.waypointIndex, waypoints.length, true);
      const nextWaypoint = waypoints[nextIdx];
      const nextYaw = getAngleTowards(currentState.position, nextWaypoint);
      return {
        nextState: {
          ...currentState,
          waypointIndex: nextIdx,
          state: 'walking',
          pauseTimer: 0,
          yaw: nextYaw,
        },
      };
    }

    return {
      nextState: {
        ...currentState,
        pauseTimer: newTimer,
      },
    };
  }

  // 4. Walking state
  if (!waypoints || waypoints.length === 0) {
    return { nextState: { ...currentState, state: 'idle' } };
  }

  const targetWaypoint = waypoints[currentState.waypointIndex] || waypoints[0];
  const dist = getDistance2D(currentState.position, targetWaypoint);

  if (dist <= arrivalThreshold) {
    // Determine whether this waypoint is a spectator/watching spot
    const isSpectatorSpot = config.role === 'spectator' && config.watchFocusPoint;
    const nextStateMode: NpcState = isSpectatorSpot ? 'watching' : 'pausing';

    return {
      nextState: {
        ...currentState,
        position: [targetWaypoint[0], currentState.position[1], targetWaypoint[2]],
        state: nextStateMode,
        pauseTimer: 0,
        watchingTimer: 0,
      },
    };
  }

  // Step with pedestrian avoidance and obstacle sliding
  const stepDist = speed * deltaSeconds;
  const stepped = stepWithAvoidance(
    currentState.position,
    targetWaypoint,
    stepDist,
    otherPositions,
    options.personalSpace ?? 0.95
  );

  const resolved = obstacles.length > 0
    ? resolveObstacleCollision2D(currentState.position, stepped, obstacles)
    : stepped;

  const targetYaw = getAngleTowards(currentState.position, resolved);

  return {
    nextState: {
      ...currentState,
      position: resolved,
      state: 'walking',
      yaw: targetYaw,
    },
  };
}

/**
 * Filters the active ambient visitors based on user config and graphics quality.
 */
export function filterVisitors(
  visitors: AmbientVisitorConfig[],
  density: CrowdDensity,
  graphicsQuality: GraphicsQuality
): AmbientVisitorConfig[] {
  if (density === 'off') {
    return [];
  }

  // If graphics quality is 'low' or user selected 'reduced', only include essential tier
  if (density === 'reduced' || graphicsQuality === 'low') {
    return visitors.filter((v) => v.tier === 'essential');
  }

  return visitors;
}

/**
 * Checks whether a given position collides with any designated restricted zones.
 */
export function isPositionInRestrictedZone(
  pos: [number, number, number],
  restrictedZones: BoundingBox2D[],
  padding: number = 0.5
): boolean {
  const x = pos[0];
  const z = pos[2];
  for (const zone of restrictedZones) {
    if (
      x >= zone.minX - padding &&
      x <= zone.maxX + padding &&
      z >= zone.minZ - padding &&
      z <= zone.maxZ + padding
    ) {
      return true;
    }
  }
  return false;
}
