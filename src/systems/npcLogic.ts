import type { Waypoint, NpcState, AmbientVisitorConfig, CrowdDensity } from '../types/npc';
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
 * Computes the target yaw angle (in radians) towards a waypoint.
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

/**
 * Pure state machine evaluator for an NPC update step.
 */
export interface NpcSimulationState {
  position: [number, number, number];
  waypointIndex: number;
  state: NpcState;
  pauseTimer: number;
  yaw: number;
}

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
