import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { interactionRegistry } from '../systems/interactionRegistry';

describe('InteractionRegistry', () => {
  beforeEach(() => {
    // clean up targets if needed
  });

  it('detects interaction target when within proximity radius', () => {
    const onInteractMock = vi.fn();

    interactionRegistry.register({
      id: 'test_sweet_stall',
      position: [10, 0, 5],
      radius: 3.0,
      label: 'Sweet Stall',
      actionType: 'shop',
      onInteract: onInteractMock,
    });

    // Player position within 2 meters
    const playerPosInside = new THREE.Vector3(11, 0, 5);
    const target = interactionRegistry.findNearest(playerPosInside);

    expect(target).not.toBeNull();
    expect(target?.id).toBe('test_sweet_stall');

    target?.onInteract();
    expect(onInteractMock).toHaveBeenCalledTimes(1);

    // Player position far outside (20m)
    const playerPosOutside = new THREE.Vector3(30, 0, 5);
    const targetFar = interactionRegistry.findNearest(playerPosOutside);
    expect(targetFar).toBeNull();
  });

  it('unregisters target correctly', () => {
    interactionRegistry.register({
      id: 'temporary_target',
      position: [0, 0, 0],
      radius: 5.0,
      label: 'Temp',
      actionType: 'diya',
      onInteract: () => {},
    });

    interactionRegistry.unregister('temporary_target');
    const target = interactionRegistry.findNearest(new THREE.Vector3(0, 0, 0));
    expect(target?.id).not.toBe('temporary_target');
  });
});
