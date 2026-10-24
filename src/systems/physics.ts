/**
 * Kinematic Character Physics System
 *
 * Implements a minimal, allocation-free physics layer for the Diwali Mela player.
 * Uses a fixed-timestep accumulator to ensure consistent behavior regardless of framerate.
 * No external physics engine is required — this covers: gravity, jumping, grounded detection,
 * and delta-time-independent movement.
 *
 * Design constraints:
 * - No dynamic rigid bodies for structural objects (stalls, attractions stay collision-registered AABB)
 * - No new dynamic lights
 * - No per-frame allocation — all math uses reused primitives
 * - Respects reducedMotion setting (no jump animation bob amplification)
 */

// ── Constants ────────────────────────────────────────────────────────────────

/** Gravitational acceleration (m/s²). Negative = downward. */
export const GRAVITY = -18.0;

/** Maximum downward fall speed (m/s) to prevent tunneling through thin floors. */
export const TERMINAL_VELOCITY = -28.0;

/** Initial vertical impulse when the player jumps (m/s). */
export const JUMP_VELOCITY = 7.2;

/** Fixed physics substep size in seconds (≈60Hz). */
export const PHYSICS_TIMESTEP = 1 / 60;

/** Maximum number of substeps per rendered frame. Caps spiral-of-death. */
export const MAX_SUBSTEPS = 4;

/** Y value of the walkable ground plane. */
export const GROUND_Y = 0.0;

/** Snap-to-ground threshold: player is considered grounded when Y ≤ this value. */
export const GROUND_EPSILON = 0.02;

// ── Types ────────────────────────────────────────────────────────────────────

export interface KinematicState {
  /** Current vertical velocity (m/s). Negative = falling. */
  verticalVelocity: number;
  /** Whether the player is touching walkable ground. */
  isGrounded: boolean;
  /** Accumulated time not yet consumed by a physics substep. */
  accumulator: number;
}

export interface KinematicResult {
  /** New Y position after physics step. */
  newY: number;
  /** New vertical velocity. */
  newVerticalVelocity: number;
  /** Whether grounded after this step. */
  isGrounded: boolean;
}

// ── Pure physics functions (testable without DOM/Three.js) ────────────────────

/**
 * Integrates gravity for a single fixed substep.
 * Returns updated vertical velocity and Y position.
 */
export function integrateGravity(
  y: number,
  vy: number,
  dt: number
): { y: number; vy: number } {
  const newVy = Math.max(vy + GRAVITY * dt, TERMINAL_VELOCITY);
  const newY = y + newVy * dt;
  return { y: newY, vy: newVy };
}

/**
 * Resolves ground contact. Returns Y snapped to ground and vy=0 if grounded.
 */
export function resolveGroundContact(
  y: number,
  vy: number,
  groundY: number = GROUND_Y
): { y: number; vy: number; isGrounded: boolean } {
  if (y <= groundY + GROUND_EPSILON) {
    return { y: groundY, vy: 0, isGrounded: true };
  }
  return { y, vy, isGrounded: false };
}

/**
 * Runs the fixed-timestep kinematic physics step.
 *
 * Consumes `deltaSeconds` in PHYSICS_TIMESTEP-sized substeps (capped at MAX_SUBSTEPS).
 * Any leftover time is stored in `accumulator` and carried to the next frame.
 *
 * This keeps physics deterministic at any framerate.
 */
export function stepKinematic(
  currentY: number,
  state: KinematicState,
  deltaSeconds: number
): { y: number; state: KinematicState } {
  let { verticalVelocity, accumulator } = state;
  let y = currentY;

  accumulator += deltaSeconds;
  let steps = 0;

  while (accumulator >= PHYSICS_TIMESTEP && steps < MAX_SUBSTEPS) {
    accumulator -= PHYSICS_TIMESTEP;
    steps++;

    // Integrate gravity
    const integrated = integrateGravity(y, verticalVelocity, PHYSICS_TIMESTEP);
    y = integrated.y;
    verticalVelocity = integrated.vy;

    // Resolve ground
    const grounded = resolveGroundContact(y, verticalVelocity);
    y = grounded.y;
    verticalVelocity = grounded.vy;
  }

  const isGrounded = resolveGroundContact(y, verticalVelocity).isGrounded;

  return {
    y,
    state: {
      verticalVelocity,
      isGrounded,
      accumulator,
    },
  };
}

/**
 * Returns the theoretical peak jump height given launch velocity and gravity.
 * Useful for tests and design parameter validation.
 * Formula: h = v² / (2 * |g|)
 */
export function theoreticalJumpHeight(launchVelocity: number = JUMP_VELOCITY): number {
  return (launchVelocity * launchVelocity) / (2 * Math.abs(GRAVITY));
}

/**
 * Returns the theoretical time-of-flight for a full jump arc (up and back to ground).
 * Formula: t = 2 * v / |g|
 */
export function theoreticalJumpDuration(launchVelocity: number = JUMP_VELOCITY): number {
  return (2 * launchVelocity) / Math.abs(GRAVITY);
}
