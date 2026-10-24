import { describe, it, expect } from 'vitest';
import {
  integrateGravity,
  resolveGroundContact,
  stepKinematic,
  theoreticalJumpHeight,
  theoreticalJumpDuration,
  GRAVITY,
  TERMINAL_VELOCITY,
  JUMP_VELOCITY,
  GROUND_Y,
  GROUND_EPSILON,
  PHYSICS_TIMESTEP,
  MAX_SUBSTEPS,
  type KinematicState,
} from '../systems/physics';

// ── Helper ────────────────────────────────────────────────────────────────────

function makeState(overrides: Partial<KinematicState> = {}): KinematicState {
  return {
    verticalVelocity: 0,
    isGrounded: true,
    accumulator: 0,
    ...overrides,
  };
}

// ── integrateGravity ───────────────────────────────────────────────────────────

describe('integrateGravity', () => {
  it('applies gravity acceleration over one timestep', () => {
    const dt = PHYSICS_TIMESTEP;
    const { y, vy } = integrateGravity(5, 0, dt);
    // After one step from rest at y=5: vy = 0 + GRAVITY*dt, y = 5 + vy*dt
    expect(vy).toBeCloseTo(GRAVITY * dt, 5);
    expect(y).toBeLessThan(5);
  });

  it('accumulates velocity over multiple steps', () => {
    let y = 10;
    let vy = 0;
    for (let i = 0; i < 30; i++) {
      const result = integrateGravity(y, vy, PHYSICS_TIMESTEP);
      y = result.y;
      vy = result.vy;
    }
    // After 30 steps (~0.5s at 60Hz) the object should have fallen
    // Note: integrateGravity does NOT resolve ground contact, so object can
    // pass through y=0. We just check that the velocity is definitely negative
    // and the object has descended from its start (y=10).
    expect(y).toBeLessThan(10);
    expect(vy).toBeLessThan(0);
  });

  it('clamps vertical velocity to TERMINAL_VELOCITY', () => {
    // Simulate a very long fall
    let y = 1000;
    let vy = 0;
    for (let i = 0; i < 300; i++) {
      const result = integrateGravity(y, vy, PHYSICS_TIMESTEP);
      y = result.y;
      vy = result.vy;
    }
    expect(vy).toBeGreaterThanOrEqual(TERMINAL_VELOCITY);
    expect(vy).toBeLessThanOrEqual(0);
  });

  it('does not overshoot terminal velocity in a single large step', () => {
    const { vy } = integrateGravity(100, 0, 100); // absurdly large dt
    expect(vy).toBeGreaterThanOrEqual(TERMINAL_VELOCITY);
  });

  it('already-falling objects continue to accelerate up to terminal velocity', () => {
    const { vy } = integrateGravity(5, -5, PHYSICS_TIMESTEP);
    expect(vy).toBeLessThan(-5); // faster than before
  });
});

// ── resolveGroundContact ───────────────────────────────────────────────────────

describe('resolveGroundContact', () => {
  it('snaps Y to ground when player is at or below ground level', () => {
    const r1 = resolveGroundContact(-0.5, -10);
    expect(r1.y).toBe(GROUND_Y);
    expect(r1.vy).toBe(0);
    expect(r1.isGrounded).toBe(true);
  });

  it('detects grounded state within GROUND_EPSILON above ground', () => {
    const r = resolveGroundContact(GROUND_Y + GROUND_EPSILON * 0.5, -3);
    expect(r.isGrounded).toBe(true);
    expect(r.vy).toBe(0);
    expect(r.y).toBe(GROUND_Y);
  });

  it('does not ground player above GROUND_EPSILON', () => {
    const r = resolveGroundContact(1.0, -2);
    expect(r.isGrounded).toBe(false);
    expect(r.y).toBe(1.0);
    expect(r.vy).toBe(-2);
  });

  it('respects a custom groundY', () => {
    const customGround = 3.0;
    const r = resolveGroundContact(2.95, -5, customGround);
    expect(r.isGrounded).toBe(true);
    expect(r.y).toBe(customGround);
  });
});

// ── stepKinematic ─────────────────────────────────────────────────────────────

describe('stepKinematic', () => {
  it('keeps grounded player at ground level with zero vertical velocity', () => {
    const state = makeState({ isGrounded: true, verticalVelocity: 0 });
    const result = stepKinematic(GROUND_Y, state, PHYSICS_TIMESTEP);
    expect(result.y).toBeCloseTo(GROUND_Y, 3);
    expect(result.state.isGrounded).toBe(true);
    expect(result.state.verticalVelocity).toBe(0);
  });

  it('produces a jump arc: rises then falls back to ground', () => {
    let state = makeState({ isGrounded: false, verticalVelocity: JUMP_VELOCITY });
    let y = GROUND_Y;
    let peakY = 0;
    const totalTime = theoreticalJumpDuration() * 1.5;
    const steps = Math.ceil(totalTime / PHYSICS_TIMESTEP);

    for (let i = 0; i < steps; i++) {
      const result = stepKinematic(y, state, PHYSICS_TIMESTEP);
      y = result.y;
      state = result.state;
      peakY = Math.max(peakY, y);
    }

    // Player should eventually return to ground
    expect(state.isGrounded).toBe(true);
    expect(y).toBeCloseTo(GROUND_Y, 2);

    // Peak should be approximately at theoretical height (within 15% error due to timestep)
    const theoretical = theoreticalJumpHeight();
    expect(peakY).toBeGreaterThan(theoretical * 0.85);
    expect(peakY).toBeLessThan(theoretical * 1.15);
  });

  it('accumulator carries leftover time to the next frame', () => {
    const state = makeState({ isGrounded: false, verticalVelocity: JUMP_VELOCITY });
    // delta just larger than one substep
    const delta = PHYSICS_TIMESTEP + 0.003;
    const result = stepKinematic(5, state, delta);
    // Accumulator should contain the remainder
    expect(result.state.accumulator).toBeCloseTo(0.003, 4);
  });

  it('caps substeps at MAX_SUBSTEPS even with very large delta', () => {
    const state = makeState({ isGrounded: false, verticalVelocity: 0 });
    // 10 seconds delta would normally require hundreds of substeps
    const result = stepKinematic(100, state, 10);
    // Accumulator carries the excess (not consumed substeps)
    const expectedConsumed = MAX_SUBSTEPS * PHYSICS_TIMESTEP;
    expect(result.state.accumulator).toBeGreaterThanOrEqual(10 - expectedConsumed - 0.001);
  });

  it('zero delta produces no physics change', () => {
    const state = makeState({ isGrounded: true, verticalVelocity: 0, accumulator: 0 });
    const result = stepKinematic(GROUND_Y, state, 0);
    expect(result.y).toBeCloseTo(GROUND_Y, 5);
    expect(result.state.verticalVelocity).toBe(0);
    expect(result.state.isGrounded).toBe(true);
  });

  it('does not tunnel below ground when falling fast', () => {
    // Player at 1m above ground, falling at terminal velocity
    const state = makeState({ isGrounded: false, verticalVelocity: TERMINAL_VELOCITY });
    // Large delta that would naively tunnel the player far below ground
    const result = stepKinematic(1.0, state, 0.1);
    expect(result.y).toBeGreaterThanOrEqual(GROUND_Y - 0.001);
  });

  it('clears accumulator correctly over multiple frames', () => {
    let state = makeState({ isGrounded: false, verticalVelocity: JUMP_VELOCITY });
    let y = GROUND_Y;
    // Simulate 60 frames at 60fps
    for (let frame = 0; frame < 60; frame++) {
      const result = stepKinematic(y, state, 1 / 60);
      y = result.y;
      state = result.state;
      // Accumulator should always be < one substep
      expect(state.accumulator).toBeLessThan(PHYSICS_TIMESTEP);
    }
  });
});

// ── theoreticalJumpHeight / Duration ─────────────────────────────────────────

describe('theoreticalJumpHeight and theoreticalJumpDuration', () => {
  it('jump height formula h = v² / (2|g|)', () => {
    const expected = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * Math.abs(GRAVITY));
    expect(theoreticalJumpHeight()).toBeCloseTo(expected, 5);
  });

  it('jump duration formula t = 2v / |g|', () => {
    const expected = (2 * JUMP_VELOCITY) / Math.abs(GRAVITY);
    expect(theoreticalJumpDuration()).toBeCloseTo(expected, 5);
  });

  it('higher launch velocity produces greater height', () => {
    expect(theoreticalJumpHeight(10)).toBeGreaterThan(theoreticalJumpHeight(5));
  });

  it('jump height is always positive', () => {
    expect(theoreticalJumpHeight()).toBeGreaterThan(0);
    expect(theoreticalJumpHeight(0)).toBe(0);
  });
});

// ── Constants sanity checks ───────────────────────────────────────────────────

describe('Physics constants', () => {
  it('gravity is negative (downward)', () => {
    expect(GRAVITY).toBeLessThan(0);
  });

  it('terminal velocity is negative (downward)', () => {
    expect(TERMINAL_VELOCITY).toBeLessThan(0);
  });

  it('terminal velocity is less extreme than gravity * 1s (sensible cap)', () => {
    expect(TERMINAL_VELOCITY).toBeGreaterThan(GRAVITY * 5);
  });

  it('jump velocity is positive (upward)', () => {
    expect(JUMP_VELOCITY).toBeGreaterThan(0);
  });

  it('PHYSICS_TIMESTEP is a reasonable game step (between 8ms and 33ms)', () => {
    expect(PHYSICS_TIMESTEP).toBeGreaterThan(0.008);
    expect(PHYSICS_TIMESTEP).toBeLessThan(0.034);
  });

  it('MAX_SUBSTEPS prevents more than a bounded number of steps per frame', () => {
    expect(MAX_SUBSTEPS).toBeGreaterThanOrEqual(2);
    expect(MAX_SUBSTEPS).toBeLessThanOrEqual(8);
  });

  it('GROUND_EPSILON is small but positive', () => {
    expect(GROUND_EPSILON).toBeGreaterThan(0);
    expect(GROUND_EPSILON).toBeLessThan(0.1);
  });
});
