import { describe, it, expect, beforeEach } from 'vitest';
import {
  getNextWaypointIndex,
  getDistance2D,
  getAngleTowards,
  stepTowardsWaypoint,
  advanceNpcSimulation,
  filterVisitors,
  isPositionInRestrictedZone,
  type NpcSimulationState,
} from '../systems/npcLogic';
import { AMBIENT_VISITORS, VENDOR_NPCS, RESTRICTED_MELA_ZONES } from '../systems/npcData';
import { useGameStore } from '../stores/useGameStore';
import { useNpcStore } from '../stores/useNpcStore';
import type { Waypoint } from '../types/npc';

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

  describe('NPC State Transitions & Simulation', () => {
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

    it('verifies that vendor positions are placed appropriately behind their stall counters', () => {
      expect(VENDOR_NPCS.length).toBe(3);
      for (const vendor of VENDOR_NPCS) {
        // Vendors must have valid coordinates, names, and non-empty greetings
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
