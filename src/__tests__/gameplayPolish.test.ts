import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../stores/useGameStore';
import { saveRepository, DEFAULT_SAVE_DATA } from '../systems/saveRepository';
import { collisionSystem } from '../systems/collision';
import { interactionRegistry } from '../systems/interactionRegistry';
import * as THREE from 'three';
import type { SaveDataV1 } from '../types/game';

describe('Phase 6: Gameplay Polish, Onboarding & Accessibility', () => {
  beforeEach(async () => {
    await useGameStore.getState().resetProgress();
  });

  describe('Onboarding & Tutorial State', () => {
    it('initializes with tutorialCompleted as false for fresh players', () => {
      const state = useGameStore.getState();
      expect(state.tutorialCompleted).toBe(false);
    });

    it('opens tutorial modal and updates completion status persistently', () => {
      useGameStore.getState().openTutorial();
      expect(useGameStore.getState().activeModal).toBe('tutorial');

      useGameStore.getState().setTutorialCompleted(true);
      expect(useGameStore.getState().tutorialCompleted).toBe(true);

      useGameStore.getState().closeModal();
      expect(useGameStore.getState().activeModal).toBe('none');
    });

    it('persists tutorialCompleted status across save and load cycles', async () => {
      const customSave: SaveDataV1 = {
        ...DEFAULT_SAVE_DATA,
        tutorialCompleted: true,
      };

      await saveRepository.save(customSave);
      const loaded = await saveRepository.load();
      expect(loaded.tutorialCompleted).toBe(true);
    });

    it('safely defaults missing or non-boolean tutorialCompleted in legacy saves', async () => {
      const legacySave: any = {
        ...DEFAULT_SAVE_DATA,
        tutorialCompleted: 'unexpected_string_value',
      };

      // saveRepository validator rejects non-boolean if present
      const isValid = (saveRepository as any).isValid(legacySave);
      expect(isValid).toBe(false);

      // migrateAndSanitize safely coerces or defaults to boolean
      const sanitized = (saveRepository as any).migrateAndSanitize(legacySave);
      expect(sanitized).not.toBeNull();
      expect(typeof sanitized.tutorialCompleted).toBe('boolean');
      expect(sanitized.tutorialCompleted).toBe(false);
    });
  });

  describe('Interaction Consistency & Wall Occlusion', () => {
    beforeEach(() => {
      // Register a mock stall box at X: [-9, -5], Z: [5, 10]
      collisionSystem.registerBox('mock_stall', -9, -5, 5, 10);
    });

    it('allows line of sight between points with clear unobstructed space', () => {
      // Player at [0, 0], Target at [0, 5] -> No obstacles
      const clear = collisionSystem.hasLineOfSight(0, 0, 0, 5);
      expect(clear).toBe(true);
    });

    it('blocks line of sight when an obstacle box sits directly between player and target', () => {
      // Player is behind stall at [-11, 7.5], target is in front of stall at [-3, 7.5]
      // Segment crosses X: [-9, -5], Z: [5, 10]
      const blocked = collisionSystem.hasLineOfSight(-11, 7.5, -3, 7.5);
      expect(blocked).toBe(false);
    });

    it('prevents interactionRegistry from selecting targets through solid obstacle walls', () => {
      interactionRegistry.register({
        id: 'counter_in_front',
        position: [-4.0, 1.0, 7.5], // In front of stall
        radius: 6.5,
        label: 'Front Counter',
        actionType: 'shop',
        onInteract: () => {},
      });

      // Player stands behind the stall at X: -10.0, Z: 7.5 (distance = 6.0 <= 6.5 radius)
      // Blocked by stall box [-9, -5]
      const playerPosBehind = new THREE.Vector3(-10.0, 1.0, 7.5);

      // Without occlusion check, radius overlaps and target is found
      const unoccluded = interactionRegistry.findNearest(playerPosBehind, false);
      expect(unoccluded?.id).toBe('counter_in_front');

      // With occlusion check enabled, target is blocked by the stall
      const occluded = interactionRegistry.findNearest(playerPosBehind, true);
      expect(occluded).toBeNull();

      // Clean up target
      interactionRegistry.unregister('counter_in_front');
    });
  });

  describe('Modal Navigation & State Safety', () => {
    it('opens pause menu and transitions cleanly between modal states without leaking input', () => {
      useGameStore.getState().openModal('pause');
      expect(useGameStore.getState().activeModal).toBe('pause');

      // Open settings from pause
      useGameStore.getState().openModal('settings');
      expect(useGameStore.getState().activeModal).toBe('settings');

      // Close modal
      useGameStore.getState().closeModal();
      expect(useGameStore.getState().activeModal).toBe('none');
    });

    it('guarantees that opening and closing modals does not alter token balance or inventory', () => {
      const initialTokens = useGameStore.getState().tokens;
      const initialInventory = { ...useGameStore.getState().inventory };

      useGameStore.getState().openModal('shop');
      useGameStore.getState().closeModal();

      useGameStore.getState().openModal('rewards');
      useGameStore.getState().closeModal();

      expect(useGameStore.getState().tokens).toBe(initialTokens);
      expect(useGameStore.getState().inventory).toEqual(initialInventory);
    });
  });
});
