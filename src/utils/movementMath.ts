import * as THREE from 'three';

export interface MovementInputState {
  forward?: boolean;
  backward?: boolean;
  left?: boolean;
  right?: boolean;
  joystickVector?: { x: number; y: number };
}

export interface MovementAxes {
  forwardInput: number;
  rightInput: number;
}

export interface CameraBasis {
  camForward: THREE.Vector3;
  camRight: THREE.Vector3;
}

/**
 * Computes forward and right input intent scalar values from keyboard states and joystick vectors.
 * Forward is positive when pressing forward (W / Up / joystick up).
 * Right is positive when pressing right (D / Right / joystick right).
 */
export function computeInputAxes(input: MovementInputState): MovementAxes {
  let forwardInput = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
  let rightInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  if (input.joystickVector && (input.joystickVector.x !== 0 || input.joystickVector.y !== 0)) {
    rightInput += input.joystickVector.x;
    forwardInput -= input.joystickVector.y;
  }

  return { forwardInput, rightInput };
}

/**
 * Computes camera forward and right unit vectors in 3D world space given camera yaw.
 *
 * In the Diwali Mela coordinate system:
 * - Camera orbits at [pos.x - sin(yaw) * dist, pos.y + height, pos.z - cos(yaw) * dist], looking toward pos.
 * - At yaw = 0, camera looks along +Z (into the scene).
 * - Looking along +Z, world -X is screen-right, and world +X is screen-left.
 *
 * Vector cross product convention for Right vector:
 * camForward x WorldUp = (sin(yaw), 0, cos(yaw)) x (0, 1, 0) = (-cos(yaw), 0, sin(yaw)).
 */
export function computeCameraBasis(yaw: number): CameraBasis {
  const camForward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
  const camRight = new THREE.Vector3(-Math.cos(yaw), 0, Math.sin(yaw)).normalize();
  return { camForward, camRight };
}

/**
 * Computes desired velocity in world space from movement axes, camera yaw, and maxSpeed.
 * Normalizes diagonal intent to ensure player doesn't move faster diagonally than maxSpeed.
 */
export function computeDesiredVelocity(
  axes: MovementAxes,
  yaw: number,
  maxSpeed: number
): THREE.Vector3 {
  const desiredVel = new THREE.Vector3();
  if (axes.forwardInput !== 0 || axes.rightInput !== 0) {
    const { camForward, camRight } = computeCameraBasis(yaw);

    desiredVel.addScaledVector(camForward, axes.forwardInput);
    desiredVel.addScaledVector(camRight, axes.rightInput);

    if (desiredVel.lengthSq() > 1) {
      desiredVel.normalize();
    }
    desiredVel.multiplyScalar(maxSpeed);
  }
  return desiredVel;
}
