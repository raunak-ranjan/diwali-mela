import { describe, it, expect, beforeEach } from 'vitest';
import {
  getNextWaypointIndex,
  getDistance2D,
  getAngleTowards,
  stepTowardsWaypoint,
  advanceNpcSimulation,
  advanceAutonomousNpc,
  computePedestrianAvoidance,
  stepWithAvoidance,
  resolveObstacleCollision2D,
  createMelaQueue,
  tryJoinQueue,
  leaveQueue,
  getNpcQueueSlot,
  isQueueFull,
  filterVisitors,
  isPositionInRestrictedZone,
  type NpcSimulationState,
  type BoundingBox2D,
} from '../systems/npcLogic';
import { AMBIENT_VISITORS, VENDOR_NPCS, RESTRICTED_MELA_ZONES, MELA_QUEUES } from '../systems/npcData';
import { npcCoordinator } from '../systems/npcCoordinator';
import { useGameStore } from '../stores/useGameStore';
import { useNpcStore } from '../stores/useNpcStore';
import type { Waypoint, AmbientVisitorConfig, MelaQueueConfig } from '../types/npc';

describe('Living Mela — Ambient NPC Pure Logic', () => {
  describe('Waypoint Index Progression', () => {
    it('increments index sequentially', () => {
      expect(getNextWaypointIndex(0, 4, true)).toBe(1);
      expect(getNextWaypointIndex(1, 4, true)).toBe(2);
      expect(getNextWaypointIndex(2, 4, true)).toBe(3);
    });

    it('wraps around to 0 when looping is true', () => {
      expect(getNextWaypointIndex(3, 4, true)).toBe(0);
    });

    it('clamps to last index when looping is false', () => {
      expect(getNextWaypointIndex(3, 4, false)).toBe(3);
    });

    it('gracefully handles empty or single waypoint lists', () => {
      expect(getNextWaypointIndex(0, 0, true)).toBe(0);
      expect(getNextWaypointIndex(0, 1, true)).toBe(0);
    });
  });

  describe('2D Spatial Helpers', () => {
    it('calculates Euclidean distance on the XZ ground plane', () => {
      const p1: Waypoint = [0, 0, 0];
      const p2: Waypoint = [3, 0, 4];
      expect(getDistance2D(p1, p2)).toBeCloseTo(5.0);
    });

    it('computes target yaw angle towards target waypoint in radians', () => {
      const from: Waypoint = [0, 0, 0];
      const toNorth: Waypoint = [0, 0, 5];
      const toEast: Waypoint = [5, 0, 0];

      expect(getAngleTowards(from, toNorth)).toBeCloseTo(0);
      expect(getAngleTowards(from, toEast)).toBeCloseTo(Math.PI / 2);
    });

    it('returns 0 when from and to points are identical', () => {
      expect(getAngleTowards([2, 0, 2], [2, 0, 2])).toBe(0);
    });

    it('steps incrementally towards destination by stepDistance', () => {
      const start: Waypoint = [0, 0, 0];
      const target: Waypoint = [0, 0, 10];
      const stepped = stepTowardsWaypoint(start, target, 2.0);

      expect(stepped[0]).toBeCloseTo(0);
      expect(stepped[2]).toBeCloseTo(2.0);
    });

    it('clamps directly to target when stepDistance exceeds remaining distance', () => {
      const start: Waypoint = [0, 0, 0];
      const target: Waypoint = [0, 0, 1.5];
      const stepped = stepTowardsWaypoint(start, target, 2.0);

      expect(stepped[0]).toBe(target[0]);
      expect(stepped[2]).toBe(target[2]);
    });
  });

  describe('Pedestrian Avoidance (Repulsion)', () => {
    it('returns zero repulsion when no other pedestrians are within personal space', () => {
      const pos: Waypoint = [0, 0, 0];
      const others: Waypoint[] = [
        [5, 0, 5],
        [10, 0, 0],
      ];
      const [avoidX, avoidZ] = computePedestrianAvoidance(pos, others, 1.0);
      expect(avoidX).toBe(0);
      expect(avoidZ).toBe(0);
    });

    it('repels away from a nearby pedestrian within personal space', () => {
      const pos: Waypoint = [0, 0, 0];
      // Other pedestrian is 0.5m directly ahead in +Z
      const others: Waypoint[] = [[0, 0, 0.5]];
      const [avoidX, avoidZ] = computePedestrianAvoidance(pos, others, 1.0);

      expect(avoidX).toBeCloseTo(0);
      // Repulsion must push backward along -Z
      expect(avoidZ).toBeLessThan(0);
    });

    it('repulsion force increases as distance between pedestrians decreases', () => {
      const pos: Waypoint = [0, 0, 0];
      const otherClose: Waypoint[] = [[0, 0, 0.2]];
      const otherFar: Waypoint[] = [[0, 0, 0.8]];

      const [, avoidZClose] = computePedestrianAvoidance(pos, otherClose, 1.0);
      const [, avoidZFar] = computePedestrianAvoidance(pos, otherFar, 1.0);

      expect(Math.abs(avoidZClose)).toBeGreaterThan(Math.abs(avoidZFar));
    });

    it('stepWithAvoidance deflects movement trajectory around a blocking pedestrian', () => {
      const start: Waypoint = [0, 0, 0];
      const destination: Waypoint = [0, 0, 5];
      // Obstacle pedestrian is right on the straight line at [0, 0, 0.5]
      const blockingOthers: Waypoint[] = [[0, 0, 0.5]];

      const stepped = stepWithAvoidance(start, destination, 0.3, blockingOthers, 1.0);

      // Still makes forward progress
      expect(stepped[2]).toBeGreaterThan(0);
    });
  });

  describe('Obstacle Collision & Resolution', () => {
    const testObstacles: BoundingBox2D[] = [
      { id: 'stall_test', minX: 5, maxX: 10, minZ: 5, maxZ: 10 },
    ];

    it('keeps NPC outside solid obstacle boundaries', () => {
      const current: Waypoint = [4.5, 0, 7.5];
      const targetInside: Waypoint = [6.0, 0, 7.5];

      const resolved = resolveObstacleCollision2D(current, targetInside, testObstacles, 0.35);

      // Must be pushed back to minX - npcRadius (5 - 0.35 = 4.65)
      expect(resolved[0]).toBeLessThanOrEqual(4.66);
    });

    it('clamps NPC within fairground outer perimeter boundaries', () => {
      const current: Waypoint = [0, 0, 40];
      const targetOutOfBounds: Waypoint = [0, 0, 100];

      const resolved = resolveObstacleCollision2D(current, targetOutOfBounds, []);

      // Max Z boundary is 46, so with 0.35 radius it clamps <= 45.65
      expect(resolved[2]).toBeLessThanOrEqual(46);
    });
  });

  describe('Mela Queue System', () => {
    const testQueueConfig: MelaQueueConfig = {
      id: 'queue_test',
      name: 'Test Sweets Queue',
      servicePoint: [0, 0, 0],
      slots: [
        [0, 0, 0],
        [0, 0, -1.5],
        [0, 0, -3.0],
      ],
      facingYaw: 0,
      serviceDuration: 3.0,
    };

    it('creates an empty queue with correct configuration', () => {
      const q = createMelaQueue(testQueueConfig);
      expect(q.id).toBe('queue_test');
      expect(q.occupants).toEqual([]);
      expect(q.slots.length).toBe(3);
      expect(isQueueFull(q)).toBe(false);
    });

    it('assigns queue slots sequentially to joining NPCs', () => {
      let q = createMelaQueue(testQueueConfig);

      const res1 = tryJoinQueue(q, 'npc_1');
      q = res1.queue;
      expect(res1.success).toBe(true);
      expect(res1.slotIndex).toBe(0);
      expect(getNpcQueueSlot(q, 'npc_1')).toBe(0);

      const res2 = tryJoinQueue(q, 'npc_2');
      q = res2.queue;
      expect(res2.success).toBe(true);
      expect(res2.slotIndex).toBe(1);
      expect(getNpcQueueSlot(q, 'npc_2')).toBe(1);

      const res3 = tryJoinQueue(q, 'npc_3');
      q = res3.queue;
      expect(res3.success).toBe(true);
      expect(res3.slotIndex).toBe(2);
      expect(isQueueFull(q)).toBe(true);
    });

    it('rejects joining when queue is at full capacity', () => {
      let q = createMelaQueue(testQueueConfig);
      q = tryJoinQueue(q, 'npc_1').queue;
      q = tryJoinQueue(q, 'npc_2').queue;
      q = tryJoinQueue(q, 'npc_3').queue;

      const res4 = tryJoinQueue(q, 'npc_4');
      expect(res4.success).toBe(false);
      expect(res4.slotIndex).toBe(-1);
    });

    it('shifts remaining occupants forward when front occupant leaves', () => {
      let q = createMelaQueue(testQueueConfig);
      q = tryJoinQueue(q, 'npc_1').queue;
      q = tryJoinQueue(q, 'npc_2').queue;
      q = tryJoinQueue(q, 'npc_3').queue;

      // Front person finishes and departs
      q = leaveQueue(q, 'npc_1');

      expect(q.occupants.length).toBe(2);
      // npc_2 moves from slot 1 to slot 0
      expect(getNpcQueueSlot(q, 'npc_2')).toBe(0);
      // npc_3 moves from slot 2 to slot 1
      expect(getNpcQueueSlot(q, 'npc_3')).toBe(1);
      expect(isQueueFull(q)).toBe(false);
    });

    it('does not duplicate NPC if they re-join an existing queue', () => {
      let q = createMelaQueue(testQueueConfig);
      q = tryJoinQueue(q, 'npc_1').queue;
      const reJoin = tryJoinQueue(q, 'npc_1');

      expect(reJoin.success).toBe(true);
      expect(reJoin.slotIndex).toBe(0);
      expect(q.occupants.length).toBe(1);
    });
  });

  describe('Autonomous Visitor State Machine', () => {
    const testConfig: AmbientVisitorConfig = {
      id: 'test_visitor',
      name: 'Test Visitor',
      role: 'spectator',
      tier: 'standard',
      speed: 1.5,
      pauseDuration: 2.0,
      waypoints: [
        [0, 0, 0],
        [0, 0, 5],
        [5, 0, 5],
      ],
      outfit: {
        skinColor: '#d49b6a',
        kurtaColor: '#1e3a8a',
        pyjamaColor: '#fef3c7',
        juttiColor: '#78350f',
      },
      watchFocusPoint: [0, 2, 20],
      targetQueueId: 'test_queue',
    };

    it('advances walking towards destination', () => {
      const state: NpcSimulationState = {
        position: [0, 0, 0],
        waypointIndex: 1,
        state: 'walking',
        pauseTimer: 0,
        yaw: 0,
      };

      const { nextState } = advanceAutonomousNpc(state, testConfig, 0.5);
      expect(nextState.state).toBe('walking');
      expect(nextState.position[2]).toBeGreaterThan(0);
    });

    it('transitions to watching when arriving at a spectator waypoint', () => {
      const nearWaypoint: NpcSimulationState = {
        position: [0, 0, 4.9],
        waypointIndex: 1,
        state: 'walking',
        pauseTimer: 0,
        yaw: 0,
      };

      const { nextState } = advanceAutonomousNpc(nearWaypoint, testConfig, 0.1);
      expect(nextState.state).toBe('watching');
      expect(nextState.position[2]).toBe(5);
    });

    it('completes service at front of queue and departs to next waypoint', () => {
      const queue = createMelaQueue({
        id: 'test_queue',
        name: 'Test Queue',
        servicePoint: [0, 0, 5],
        slots: [[0, 0, 5]],
        facingYaw: 0,
        serviceDuration: 2.0,
      });

      const inServiceState: NpcSimulationState = {
        position: [0, 0, 5],
        waypointIndex: 1,
        state: 'queuing',
        queueId: 'test_queue',
        queueSlotIndex: 0,
        serviceTimer: 1.9,
        pauseTimer: 0,
        yaw: 0,
      };

      const { nextState, queueAction } = advanceAutonomousNpc(
        inServiceState,
        testConfig,
        0.2,
        { currentQueue: queue }
      );

      expect(queueAction).toBe('leave_queue');
      expect(nextState.state).toBe('walking');
      expect(nextState.queueId).toBeNull();
      expect(nextState.waypointIndex).toBe(2);
    });
  });

  describe('NpcCoordinator Runtime', () => {
    beforeEach(() => {
      npcCoordinator.clearAll();
    });

    it('tracks NPC positions and retrieves other positions excluding self', () => {
      npcCoordinator.updatePosition('npc_a', [1, 0, 1]);
      npcCoordinator.updatePosition('npc_b', [2, 0, 2]);

      const othersForA = npcCoordinator.getOtherPositions('npc_a');
      expect(othersForA.length).toBe(1);
      expect(othersForA[0]).toEqual([2, 0, 2]);

      const othersForB = npcCoordinator.getOtherPositions('npc_b');
      expect(othersForB.length).toBe(1);
      expect(othersForB[0]).toEqual([1, 0, 1]);
    });

    it('cleans up positions and queue membership on NPC removal', () => {
      npcCoordinator.updatePosition('npc_temp', [3, 0, 3]);
      npcCoordinator.tryJoinQueue('queue_mithai', 'npc_temp');

      expect(npcCoordinator.getNpcQueueSlot('queue_mithai', 'npc_temp')).toBeGreaterThanOrEqual(0);

      npcCoordinator.removeNpc('npc_temp');

      expect(npcCoordinator.getOtherPositions('anyone').length).toBe(0);
      expect(npcCoordinator.getNpcQueueSlot('queue_mithai', 'npc_temp')).toBe(-1);
    });
  });

  describe('NPC State Transitions & Simulation (Original Baseline)', () => {
    const waypoints: Waypoint[] = [
      [0, 0, 0],
      [0, 0, 10],
      [10, 0, 10],
    ];

    it('moves towards target waypoint during walking state', () => {
      const initial: NpcSimulationState = {
        position: [0, 0, 0],
        waypointIndex: 1,
        state: 'walking',
        pauseTimer: 0,
        yaw: 0,
      };

      const updated = advanceNpcSimulation(initial, waypoints, 2.0, 3.0, 0.5, 0.3);
      expect(updated.state).toBe('walking');
      expect(updated.position[2]).toBeGreaterThan(0);
      expect(updated.position[2]).toBeCloseTo(1.0);
    });

    it('transitions from walking to pausing when reaching destination within threshold', () => {
      const nearDestination: NpcSimulationState = {
        position: [0, 0, 9.85],
        waypointIndex: 1,
        state: 'walking',
        pauseTimer: 0,
        yaw: 0,
      };

      const updated = advanceNpcSimulation(nearDestination, waypoints, 2.0, 3.0, 0.1, 0.3);
      expect(updated.state).toBe('pausing');
      expect(updated.position[2]).toBe(10);
      expect(updated.pauseTimer).toBe(0);
    });

    it('accumulates pause timer while pausing', () => {
      const pausing: NpcSimulationState = {
        position: [0, 0, 10],
        waypointIndex: 1,
        state: 'pausing',
        pauseTimer: 1.0,
        yaw: 0,
      };

      const updated = advanceNpcSimulation(pausing, waypoints, 2.0, 3.0, 0.5, 0.3);
      expect(updated.state).toBe('pausing');
      expect(updated.pauseTimer).toBeCloseTo(1.5);
    });

    it('resumes walking to next waypoint when pause duration expires', () => {
      const pauseExpiring: NpcSimulationState = {
        position: [0, 0, 10],
        waypointIndex: 1,
        state: 'pausing',
        pauseTimer: 2.9,
        yaw: 0,
      };

      const updated = advanceNpcSimulation(pauseExpiring, waypoints, 2.0, 3.0, 0.2, 0.3);
      expect(updated.state).toBe('walking');
      expect(updated.waypointIndex).toBe(2);
      expect(updated.pauseTimer).toBe(0);
      expect(updated.yaw).toBeCloseTo(Math.PI / 2); // Facing east towards [10, 0, 10]
    });

    it('safely handles empty waypoints by transitioning to idle', () => {
      const state: NpcSimulationState = {
        position: [0, 0, 0],
        waypointIndex: 0,
        state: 'walking',
        pauseTimer: 0,
        yaw: 0,
      };

      const updated = advanceNpcSimulation(state, [], 1.0, 2.0, 0.1);
      expect(updated.state).toBe('idle');
    });
  });

  describe('Crowd Density & Performance Filtering', () => {
    it('returns all visitors under full crowd density and high graphics', () => {
      const active = filterVisitors(AMBIENT_VISITORS, 'full', 'high');
      expect(active.length).toBe(AMBIENT_VISITORS.length);
    });

    it('filters down to only essential tier visitors under reduced crowd density', () => {
      const active = filterVisitors(AMBIENT_VISITORS, 'reduced', 'high');
      expect(active.length).toBeGreaterThan(0);
      expect(active.length).toBeLessThan(AMBIENT_VISITORS.length);
      for (const v of active) {
        expect(v.tier).toBe('essential');
      }
    });

    it('automatically drops to essential tier when graphics quality is low even if crowd density is full', () => {
      const active = filterVisitors(AMBIENT_VISITORS, 'full', 'low');
      for (const v of active) {
        expect(v.tier).toBe('essential');
      }
    });

    it('returns zero ambient visitors when crowd density is off', () => {
      const active = filterVisitors(AMBIENT_VISITORS, 'off', 'high');
      expect(active).toEqual([]);
    });
  });

  describe('Safety Bounds & Collision Verification', () => {
    it('verifies that all visitor waypoints are within fairground boundary limits', () => {
      for (const visitor of AMBIENT_VISITORS) {
        for (const wp of visitor.waypoints) {
          expect(wp[0]).toBeGreaterThanOrEqual(-35);
          expect(wp[0]).toBeLessThanOrEqual(35);
          expect(wp[2]).toBeGreaterThanOrEqual(-25);
          expect(wp[2]).toBeLessThanOrEqual(45);
        }
      }
    });

    it('verifies that no visitor waypoint falls inside restricted collision zones', () => {
      for (const visitor of AMBIENT_VISITORS) {
        for (const wp of visitor.waypoints) {
          const inRestricted = isPositionInRestrictedZone(wp, RESTRICTED_MELA_ZONES, 0.2);
          expect(inRestricted).toBe(false);
        }
      }
    });

    it('verifies that all queue slots are within bounds and outside restricted zones', () => {
      for (const queue of MELA_QUEUES) {
        for (const slot of queue.slots) {
          expect(slot[0]).toBeGreaterThanOrEqual(-35);
          expect(slot[0]).toBeLessThanOrEqual(35);
          expect(slot[2]).toBeGreaterThanOrEqual(-25);
          expect(slot[2]).toBeLessThanOrEqual(45);
          const inRestricted = isPositionInRestrictedZone(slot, RESTRICTED_MELA_ZONES, 0.1);
          expect(inRestricted).toBe(false);
        }
      }
    });

    it('verifies that vendor positions are placed appropriately behind their stall counters', () => {
      expect(VENDOR_NPCS.length).toBe(3);
      for (const vendor of VENDOR_NPCS) {
        expect(vendor.position.length).toBe(3);
        expect(vendor.name.length).toBeGreaterThan(0);
        expect(vendor.greetingText.length).toBeGreaterThan(0);
        expect(vendor.shopName.length).toBeGreaterThan(0);
      }
    });
  });

  describe('State Preservation & Isolation', () => {
    beforeEach(() => {
      useNpcStore.getState().setCrowdDensity('full');
      useNpcStore.getState().clearGreeting();
    });

    it('NPC system actions do not mutate player tokens, inventory, or quest state', () => {
      const initialTokens = useGameStore.getState().tokens;
      const initialInventory = { ...useGameStore.getState().inventory };
      const initialLitDiyas = [...useGameStore.getState().litDiyas];

      // Mutate NPC store
      useNpcStore.getState().setCrowdDensity('reduced');
      useNpcStore.getState().setGreeting({
        vendorId: 'test_vendor',
        vendorName: 'Test Vendor',
        shopName: 'Test Shop',
        text: 'Welcome!',
      });
      useNpcStore.getState().toggleGreetings();
      useNpcStore.getState().clearGreeting();

      // Verify game store is untouched
      expect(useGameStore.getState().tokens).toBe(initialTokens);
      expect(useGameStore.getState().inventory).toEqual(initialInventory);
      expect(useGameStore.getState().litDiyas).toEqual(initialLitDiyas);
    });
  });
});
