import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkAndResolveStuck,
  evaluateSpectatorOrientation,
  selectVisitorDialogue,
  advanceAutonomousNpc,
  type NpcSimulationState,
} from '../systems/npcLogic';
import { AMBIENT_VISITORS } from '../systems/npcData';
import { useNpcStore } from '../stores/useNpcStore';
import { useGameStore } from '../stores/useGameStore';
import { interactionRegistry } from '../systems/interactionRegistry';
import type { AmbientVisitorConfig, Waypoint } from '../types/npc';

describe('Phase 7: Living World & Social Simulation', () => {
  beforeEach(() => {
    useNpcStore.setState({
      activeVisitorDialogue: null,
      visitorCooldowns: {},
      spectatorReaction: { active: false, type: 'focused', timestamp: 0 },
    });
    useGameStore.setState({ activeModal: 'none' });
  });

  describe('Visitor Personalities & Cultural Profiles', () => {
    it('verifies all ambient visitors possess distinct personalities, activities, and authentic dialogues', () => {
      expect(AMBIENT_VISITORS.length).toBeGreaterThanOrEqual(7);

      for (const visitor of AMBIENT_VISITORS) {
        expect(visitor.id).toBeDefined();
        expect(visitor.name).toBeDefined();
        expect(visitor.personality).toBeDefined();
        expect(['cheerful', 'curious', 'devout', 'foodie', 'spectator', 'elder']).toContain(
          visitor.personality
        );
        expect(visitor.currentActivity).toBeDefined();
        expect(visitor.currentActivity!.length).toBeGreaterThan(5);
        expect(visitor.activityHindi).toBeDefined();

        expect(visitor.dialogues).toBeDefined();
        expect(visitor.dialogues!.length).toBeGreaterThanOrEqual(1);

        const firstDialogue = visitor.dialogues![0];
        expect(firstDialogue.greeting).toBeDefined();
        expect(firstDialogue.festivalTip).toBeDefined();
        expect(firstDialogue.currentThought).toBeDefined();
      }
    });

    it('selects dialogue predictably and cycles with interaction count', () => {
      const visitor = AMBIENT_VISITORS[0];
      const d0 = selectVisitorDialogue(visitor, 0);
      expect(d0.greeting).toBe(visitor.dialogues![0].greeting);

      const d1 = selectVisitorDialogue(visitor, 1);
      expect(d1).toBeDefined();
      expect(d1.festivalTip).toBeDefined();
    });

    it('gracefully falls back when visitor has no defined dialogues', () => {
      const bareVisitor: AmbientVisitorConfig = {
        id: 'visitor_test',
        name: 'Kavita',
        role: 'stroller',
        tier: 'standard',
        speed: 1.0,
        pauseDuration: 3.0,
        waypoints: [[0, 0, 0]],
        outfit: {
          skinColor: '#d49b6a',
          kurtaColor: '#1e3a8a',
          pyjamaColor: '#ffffff',
          juttiColor: '#78350f',
        },
      };

      const fallback = selectVisitorDialogue(bareVisitor, 0);
      expect(fallback.greeting).toContain('Kavita');
      expect(fallback.festivalTip).toBeDefined();
    });
  });

  describe('Visitor Dialogue State & Interaction Cooldowns', () => {
    it('opens visitor dialogue, records timestamp cooldown, and transitions activeModal', () => {
      const visitor = AMBIENT_VISITORS[0];
      const store = useNpcStore.getState();

      store.openVisitorDialogue({
        visitorId: visitor.id,
        visitorName: visitor.name,
        role: visitor.role,
        personality: visitor.personality || 'curious',
        outfit: visitor.outfit,
        greeting: visitor.dialogues![0].greeting,
        greetingHindi: visitor.dialogues![0].greetingHindi,
        festivalTip: visitor.dialogues![0].festivalTip,
        currentThought: visitor.dialogues![0].currentThought,
        currentActivity: visitor.currentActivity!,
      });

      const updated = useNpcStore.getState();
      expect(updated.activeVisitorDialogue).not.toBeNull();
      expect(updated.activeVisitorDialogue?.visitorName).toBe(visitor.name);
      expect(useGameStore.getState().activeModal).toBe('dialogue');

      // Verify cooldown is active
      expect(updated.isVisitorOnCooldown(visitor.id)).toBe(true);
    });

    it('closes visitor dialogue cleanly and resets modal to none', () => {
      const store = useNpcStore.getState();
      store.openVisitorDialogue({
        visitorId: 'visitor_priya',
        visitorName: 'Priya',
        role: 'devotee',
        personality: 'devout',
        outfit: AMBIENT_VISITORS[1].outfit,
        greeting: 'Shubh Deepavali!',
        festivalTip: 'Light the diyas!',
        currentThought: 'Peaceful evening',
        currentActivity: 'Praying',
      });

      expect(useGameStore.getState().activeModal).toBe('dialogue');

      useNpcStore.getState().closeVisitorDialogue();
      expect(useNpcStore.getState().activeVisitorDialogue).toBeNull();
      expect(useGameStore.getState().activeModal).toBe('none');
    });

    it('evaluates cooldown expiration deterministically', () => {
      const store = useNpcStore.getState();
      // Set cooldown 100ms in the future
      store.setVisitorCooldown('visitor_test', 0.1);
      expect(store.isVisitorOnCooldown('visitor_test')).toBe(true);

      // Fast forward time
      vi.setSystemTime(Date.now() + 200);
      expect(store.isVisitorOnCooldown('visitor_test')).toBe(false);
      vi.useRealTimers();
    });
  });

  describe('Anti-Stuck & Collision Resilience', () => {
    it('detects stuck state when position fails to advance over duration threshold', () => {
      const pos: Waypoint = [0, 0, 0];
      const lastPos: Waypoint = [0.02, 0, 0.01]; // Distance < 0.08m

      // After 1 second, not yet stuck
      const check1 = checkAndResolveStuck(pos, lastPos, 0, 1.0, 0.08, 2.5);
      expect(check1.isStuck).toBe(false);
      expect(check1.newStuckTimer).toBeCloseTo(1.0);

      // After 2.6 seconds, marked as stuck
      const check2 = checkAndResolveStuck(pos, lastPos, 2.0, 0.6, 0.08, 2.5);
      expect(check2.isStuck).toBe(true);
      expect(check2.newStuckTimer).toBeCloseTo(2.6);
    });

    it('resets stuck timer when movement progresses normally', () => {
      const pos: Waypoint = [1.0, 0, 2.0];
      const lastPos: Waypoint = [0.0, 0, 0.0]; // Distance > 0.08m

      const check = checkAndResolveStuck(pos, lastPos, 2.0, 0.5, 0.08, 2.5);
      expect(check.isStuck).toBe(false);
      expect(check.newStuckTimer).toBe(0);
    });

    it('advances to next waypoint when stuck in advanceAutonomousNpc simulation', () => {
      const visitor = AMBIENT_VISITORS[0];
      // Place NPC mid-path towards waypoint 1, blocked against obstacle
      const stuckSimState: NpcSimulationState = {
        position: [-2.5, 0, -4.5],
        waypointIndex: 1,
        state: 'walking',
        pauseTimer: 0,
        yaw: 0,
        stuckTimer: 2.6, // Exceeds 2.5s threshold
        lastPosition: [-2.5, 0, -4.5], // Has not moved
      };

      const { nextState } = advanceAutonomousNpc(stuckSimState, visitor, 0.1);
      // Waypoint index should have advanced to 2 to bypass blockage
      expect(nextState.waypointIndex).toBe(2);
      expect(nextState.stuckTimer).toBe(0);
    });
  });

  describe('Environmental Reactivity & Social Orientation', () => {
    it('orients towards Cultural Stage when stage is active and focus point is provided', () => {
      const npcPos: Waypoint = [0, 0, 20];
      const stageFocus: Waypoint = [0, 2, 36];
      const angle = evaluateSpectatorOrientation(npcPos, true, stageFocus);

      expect(angle).toBeDefined();
      expect(angle).toBeCloseTo(0); // Facing directly North towards stage at Z=36
    });

    it('orients towards nearby player within conversational distance during pauses', () => {
      const npcPos: Waypoint = [0, 0, 10];
      const playerPos: Waypoint = [2, 0, 10]; // 2m East of NPC (< 2.8m)
      const angle = evaluateSpectatorOrientation(npcPos, false, undefined, playerPos);

      expect(angle).toBeDefined();
      expect(angle).toBeCloseTo(Math.PI / 2); // Facing East towards player
    });

    it('ignores distant player orientation beyond conversational distance', () => {
      const npcPos: Waypoint = [0, 0, 10];
      const playerPos: Waypoint = [10, 0, 10]; // 10m away (> 2.8m)
      const angle = evaluateSpectatorOrientation(npcPos, false, undefined, playerPos);

      expect(angle).toBeNull();
    });

    it('triggers spectator reactions in store without errors', () => {
      useNpcStore.getState().triggerSpectatorReaction('applause', [0, 2, 36]);
      const state = useNpcStore.getState().spectatorReaction;

      expect(state.active).toBe(true);
      expect(state.type).toBe('applause');
      expect(state.focusPoint).toEqual([0, 2, 36]);
      expect(state.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Interaction Registry & Visitor Prompt Integration', () => {
    it('allows registering and discovering talk action targets in interactionRegistry', () => {
      const targetId = 'visitor_test_target';
      interactionRegistry.register({
        id: targetId,
        position: [5, 0, 5],
        radius: 3.2,
        label: 'Greet Aarav',
        sublabel: 'Exploring lights • बातचीत',
        actionType: 'talk',
        onInteract: () => {
          useNpcStore.getState().openVisitorDialogue({
            visitorId: 'visitor_aarav',
            visitorName: 'Aarav',
            role: 'stroller',
            personality: 'curious',
            outfit: AMBIENT_VISITORS[0].outfit,
            greeting: 'Namaste!',
            festivalTip: 'Check out the Rangoli!',
            currentThought: 'Strolling around',
            currentActivity: 'Walking',
          });
        },
      });

      const nearest = interactionRegistry.findNearest({ x: 5.5, y: 0, z: 5.2 } as any);
      expect(nearest).not.toBeNull();
      expect(nearest?.id).toBe(targetId);
      expect(nearest?.actionType).toBe('talk');

      // Execute onInteract
      nearest?.onInteract();
      expect(useNpcStore.getState().activeVisitorDialogue?.visitorName).toBe('Aarav');

      interactionRegistry.unregister(targetId);
    });
  });
});
