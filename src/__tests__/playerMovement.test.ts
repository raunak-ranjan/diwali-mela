import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  computeInputAxes,
  computeCameraBasis,
  computeDesiredVelocity,
} from '../utils/movementMath';

describe('Player Movement Math & Controls', () => {
  const MAX_SPEED = 4.2;

  describe('computeInputAxes', () => {
    it('maps keyboard keys correctly', () => {
      // D / Right
      const rightOnly = computeInputAxes({ right: true });
      expect(rightOnly.rightInput).toBe(1);
      expect(rightOnly.forwardInput).toBe(0);

      // A / Left
      const leftOnly = computeInputAxes({ left: true });
      expect(leftOnly.rightInput).toBe(-1);
      expect(leftOnly.forwardInput).toBe(0);

      // W / Forward
      const fwdOnly = computeInputAxes({ forward: true });
      expect(fwdOnly.rightInput).toBe(0);
      expect(fwdOnly.forwardInput).toBe(1);

      // S / Backward
      const backOnly = computeInputAxes({ backward: true });
      expect(backOnly.rightInput).toBe(0);
      expect(backOnly.forwardInput).toBe(-1);
    });

    it('cancels out opposing inputs', () => {
      const opposingX = computeInputAxes({ left: true, right: true });
      expect(opposingX.rightInput).toBe(0);

      const opposingZ = computeInputAxes({ forward: true, backward: true });
      expect(opposingZ.forwardInput).toBe(0);
    });

    it('maps virtual joystick axes correctly', () => {
      // Dragging joystick right (positive X)
      const joyRight = computeInputAxes({ joystickVector: { x: 0.8, y: 0 } });
      expect(joyRight.rightInput).toBeCloseTo(0.8);
      expect(joyRight.forwardInput).toBeCloseTo(0);

      // Dragging joystick left (negative X)
      const joyLeft = computeInputAxes({ joystickVector: { x: -0.8, y: 0 } });
      expect(joyLeft.rightInput).toBeCloseTo(-0.8);
      expect(joyLeft.forwardInput).toBeCloseTo(0);

      // Dragging joystick up/forward (negative Y in screen coords)
      const joyUp = computeInputAxes({ joystickVector: { x: 0, y: -0.7 } });
      expect(joyUp.forwardInput).toBeCloseTo(0.7);
      expect(joyUp.rightInput).toBeCloseTo(0);

      // Dragging joystick down/backward (positive Y in screen coords)
      const joyDown = computeInputAxes({ joystickVector: { x: 0, y: 0.7 } });
      expect(joyDown.forwardInput).toBeCloseTo(-0.7);
      expect(joyDown.rightInput).toBeCloseTo(0);
    });

    it('combines keyboard and joystick inputs seamlessly', () => {
      const combined = computeInputAxes({
        right: true,
        joystickVector: { x: 0.5, y: -0.5 },
      });
      expect(combined.rightInput).toBeCloseTo(1.5);
      expect(combined.forwardInput).toBeCloseTo(0.5);
    });
  });

  describe('computeCameraBasis', () => {
    it('produces unit vectors perpendicular to each other', () => {
      const testYaws = [0, Math.PI / 4, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, -Math.PI / 3];

      for (const yaw of testYaws) {
        const { camForward, camRight } = computeCameraBasis(yaw);
        expect(camForward.length()).toBeCloseTo(1.0, 5);
        expect(camRight.length()).toBeCloseTo(1.0, 5);
        expect(camForward.dot(camRight)).toBeCloseTo(0, 5);
      }
    });

    it('evaluates to expected world vectors at cardinal angles', () => {
      // yaw = 0 (looking into +Z, camera behind at -Z)
      const basis0 = computeCameraBasis(0);
      expect(basis0.camForward.x).toBeCloseTo(0, 5);
      expect(basis0.camForward.z).toBeCloseTo(1, 5);
      expect(basis0.camRight.x).toBeCloseTo(-1, 5); // World -X is screen-right
      expect(basis0.camRight.z).toBeCloseTo(0, 5);

      // yaw = PI/2 (looking into +X, camera behind at -X)
      const basis90 = computeCameraBasis(Math.PI / 2);
      expect(basis90.camForward.x).toBeCloseTo(1, 5);
      expect(basis90.camForward.z).toBeCloseTo(0, 5);
      expect(basis90.camRight.x).toBeCloseTo(0, 5);
      expect(basis90.camRight.z).toBeCloseTo(1, 5); // World +Z is screen-right

      // yaw = PI (looking into -Z, camera behind at +Z)
      const basis180 = computeCameraBasis(Math.PI);
      expect(basis180.camForward.x).toBeCloseTo(0, 5);
      expect(basis180.camForward.z).toBeCloseTo(-1, 5);
      expect(basis180.camRight.x).toBeCloseTo(1, 5); // World +X is screen-right
      expect(basis180.camRight.z).toBeCloseTo(0, 5);

      // yaw = -PI/2 (looking into -X, camera behind at +X)
      const basisNeg90 = computeCameraBasis(-Math.PI / 2);
      expect(basisNeg90.camForward.x).toBeCloseTo(-1, 5);
      expect(basisNeg90.camForward.z).toBeCloseTo(0, 5);
      expect(basisNeg90.camRight.x).toBeCloseTo(0, 5);
      expect(basisNeg90.camRight.z).toBeCloseTo(-1, 5); // World -Z is screen-right
    });

    it('verifies camRight always projects to screen-right in a Three.js perspective camera', () => {
      const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 100);
      const playerPos = new THREE.Vector3(10, 0, 15);
      const camDist = 5.2;
      const camHeight = 2.4;

      // Test across full 360 degree rotation in 15 degree increments
      for (let deg = 0; deg < 360; deg += 15) {
        const yaw = (deg * Math.PI) / 180;
        const { camRight } = computeCameraBasis(yaw);

        // Position camera as in PlayerController: playerPos - camForward * dist + height
        camera.position.set(
          playerPos.x - Math.sin(yaw) * camDist,
          playerPos.y + camHeight,
          playerPos.z - Math.cos(yaw) * camDist
        );
        camera.lookAt(playerPos.x, playerPos.y + 1.2, playerPos.z);
        camera.updateMatrixWorld(true);

        const playerScreen = playerPos.clone().project(camera);
        const rightTarget = playerPos.clone().add(camRight).project(camera);
        const leftTarget = playerPos.clone().sub(camRight).project(camera);

        // Right movement must project to the right (x > center)
        expect(rightTarget.x).toBeGreaterThan(playerScreen.x);
        // Left movement must project to the left (x < center)
        expect(leftTarget.x).toBeLessThan(playerScreen.x);
      }
    });
  });

  describe('computeDesiredVelocity', () => {
    it('returns zero velocity when no input is active', () => {
      const axes = { forwardInput: 0, rightInput: 0 };
      const vel = computeDesiredVelocity(axes, 0, MAX_SPEED);
      expect(vel.length()).toBe(0);
    });

    it('moves player right along camRight with maxSpeed when pressing D or joystick right', () => {
      const axes = { forwardInput: 0, rightInput: 1 };
      const yaw = Math.PI / 6;
      const { camRight } = computeCameraBasis(yaw);
      const vel = computeDesiredVelocity(axes, yaw, MAX_SPEED);

      expect(vel.length()).toBeCloseTo(MAX_SPEED);
      expect(vel.clone().normalize().dot(camRight)).toBeCloseTo(1.0);
    });

    it('moves player left along -camRight with maxSpeed when pressing A or joystick left', () => {
      const axes = { forwardInput: 0, rightInput: -1 };
      const yaw = Math.PI / 3;
      const { camRight } = computeCameraBasis(yaw);
      const vel = computeDesiredVelocity(axes, yaw, MAX_SPEED);

      expect(vel.length()).toBeCloseTo(MAX_SPEED);
      expect(vel.clone().normalize().dot(camRight)).toBeCloseTo(-1.0);
    });

    it('moves player forward along camForward with maxSpeed when pressing W', () => {
      const axes = { forwardInput: 1, rightInput: 0 };
      const yaw = 0.5;
      const { camForward } = computeCameraBasis(yaw);
      const vel = computeDesiredVelocity(axes, yaw, MAX_SPEED);

      expect(vel.length()).toBeCloseTo(MAX_SPEED);
      expect(vel.clone().normalize().dot(camForward)).toBeCloseTo(1.0);
    });

    it('normalizes diagonal input so speed does not exceed maxSpeed', () => {
      // W + D simultaneously
      const diagonalAxes = { forwardInput: 1, rightInput: 1 };
      const vel = computeDesiredVelocity(diagonalAxes, 0, MAX_SPEED);

      // Raw unnormalized length would be sqrt(2) * MAX_SPEED (~5.94)
      // Normalized length must be exactly MAX_SPEED (4.2)
      expect(vel.length()).toBeCloseTo(MAX_SPEED);
    });

    it('scales sub-maximal joystick input proportionally', () => {
      const partialAxes = { forwardInput: 0, rightInput: 0.5 };
      const vel = computeDesiredVelocity(partialAxes, 0, MAX_SPEED);

      expect(vel.length()).toBeCloseTo(MAX_SPEED * 0.5);
    });
  });
});
