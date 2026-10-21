import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { CollisionSystem } from '../systems/collision';

describe('CollisionSystem', () => {
  let collision: CollisionSystem;

  beforeEach(() => {
    collision = new CollisionSystem();
  });

  it('clamps movement within fairground outer boundaries', () => {
    const current = new THREE.Vector3(0, 0, 0);
    // Player tries to walk past maxZ (boundary is 50)
    const target = new THREE.Vector3(0, 0, 100);
    const resolved = collision.resolveMovement(current, target, 0.5);

    expect(resolved.z).toBeLessThanOrEqual(50 - 0.5);
  });

  it('prevents player from walking into solid stall box obstacles', () => {
    // Register stall box at X: [-10, -5], Z: [5, 10]
    collision.registerBox('test_stall', -10, -5, 5, 10);

    const current = new THREE.Vector3(-4.0, 0, 7.5);
    // Player tries to walk inside the stall
    const target = new THREE.Vector3(-7.5, 0, 7.5);

    const resolved = collision.resolveMovement(current, target, 0.5);

    // Player should be pushed out to the edge plus radius (-5 + 0.5 = -4.5)
    expect(resolved.x).toBeGreaterThanOrEqual(-4.5);
  });

  it('slides smoothly along cylinder obstacles like the central urli or ferris wheel base', () => {
    // Cylinder obstacle at origin (0, 0) with radius 2.0
    collision.registerCylinder('test_cylinder', 0, 0, 2.0);

    const current = new THREE.Vector3(0, 0, 3.0);
    // Player walks directly towards center of cylinder
    const target = new THREE.Vector3(0, 0, 1.0);

    const resolved = collision.resolveMovement(current, target, 0.5);

    const distFromOrigin = Math.sqrt(resolved.x * resolved.x + resolved.z * resolved.z);
    expect(distFromOrigin).toBeGreaterThanOrEqual(2.5 - 0.001); // radius (2.0) + playerRadius (0.5)
  });
});
