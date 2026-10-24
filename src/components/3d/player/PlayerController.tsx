import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';
import { useInputStore } from '../../../stores/useInputStore';
import { collisionSystem } from '../../../systems/collision';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { PlayerCosmetics } from './PlayerCosmetics';
import { PlayerSparkler } from './PlayerSparkler';

export const PlayerController = () => {
  const { camera } = useThree();
  const playerRef = useRef<THREE.Group>(null);
  const avatarMeshRef = useRef<THREE.Group>(null);

  const setPrompt = useGameStore((s) => s.setPrompt);
  const setCurrentZone = useGameStore((s) => s.setCurrentZone);
  const activeModal = useGameStore((s) => s.activeModal);
  const openModal = useGameStore((s) => s.openModal);
  const isFerrisWheelRiding = useGameStore((s) => s.ferrisWheelRide.isRiding);
  const exitFerrisWheel = useGameStore((s) => s.exitFerrisWheel);

  // Position and camera state
  const pos = useRef(new THREE.Vector3(0, 0, -20)); // Start right by the grand entrance threshold
  const yaw = useRef(0); // Camera horizontal rotation
  const pitch = useRef(0.12); // Subtle natural camera tilt towards the fairground horizon
  const targetCamPos = useRef(new THREE.Vector3(0, 2.3, -25));

  // Smooth movement: velocity accumulator for acceleration/deceleration
  const velocity = useRef(new THREE.Vector3());
  // Head-bob accumulator
  const bobPhase = useRef(0);
  // Track whether player was moving last frame for bob reset
  const wasMoving = useRef(false);
  // Smoothed speed magnitude for camera FOV breathing
  const smoothSpeed = useRef(0);

  // Expose positioning for automated audit & testing inspection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__teleportPlayer = (x: number, y: number, z: number, newYaw?: number, newPitch?: number) => {
        pos.current.set(x, y, z);
        if (newYaw !== undefined) yaw.current = newYaw;
        if (newPitch !== undefined) pitch.current = newPitch;
      };
    }
  }, []);

  // Safe grounded dismount on exiting Ferris Wheel
  const wasRidingRef = useRef(false);
  useEffect(() => {
    if (wasRidingRef.current && !isFerrisWheelRiding) {
      // Safely place player on grounded boardwalk steps beside attraction
      pos.current.set(18.0, 0, 20.0);
      velocity.current.set(0, 0, 0);
      yaw.current = 0;
      pitch.current = 0.12;
      if (playerRef.current) {
        playerRef.current.position.set(18.0, 0, 20.0);
      }
    }
    wasRidingRef.current = isFerrisWheelRiding;
  }, [isFerrisWheelRiding]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing or modal active (except Esc)
      if (e.key === 'Escape') {
        const currentModal = useGameStore.getState().activeModal;
        const currentRide = useGameStore.getState().ferrisWheelRide;
        if (currentRide.isRiding) {
          exitFerrisWheel();
          return;
        }
        if (currentModal === 'none') {
          openModal('pause');
        } else if (currentModal === 'pause') {
          useGameStore.getState().closeModal();
        }
        return;
      }

      if (useGameStore.getState().ferrisWheelRide.isRiding) {
        if (e.code === 'KeyE') {
          exitFerrisWheel();
        }
        return;
      }

      if (useGameStore.getState().activeModal !== 'none') return;

      const setKey = useInputStore.getState().setKey;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') setKey('forward', true);
      if (e.code === 'KeyS' || e.code === 'ArrowDown') setKey('backward', true);
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKey('left', true);
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setKey('right', true);

      if (e.code === 'KeyE') {
        const prompt = useGameStore.getState().prompt;
        if (prompt && prompt.active) {
          const nearest = interactionRegistry.findNearest(pos.current);
          if (nearest) nearest.onInteract();
        }
      }

      if (e.code === 'KeyI' || e.code === 'KeyB') {
        openModal('inventory');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const setKey = useInputStore.getState().setKey;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') setKey('forward', false);
      if (e.code === 'KeyS' || e.code === 'ArrowDown') setKey('backward', false);
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKey('left', false);
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setKey('right', false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [openModal, exitFerrisWheel]);

  // Mouse camera rotation when dragging or moving
  useEffect(() => {
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Right click or left click drag
      if (e.button === 0 || e.button === 2) {
        isMouseDown = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || useGameStore.getState().activeModal !== 'none') return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      yaw.current -= dx * 0.005;
      pitch.current = Math.max(-0.6, Math.min(1.0, pitch.current + dy * 0.005));
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Frame simulation loop
  useFrame((_, delta) => {
    if (activeModal !== 'none') return;

    const safeDelta = Math.min(delta, 0.05);
    const input = useInputStore.getState();

    // Ferris Wheel riding camera & position lock
    const currentRide = useGameStore.getState().ferrisWheelRide;
    if (currentRide.isRiding) {
      if (input.touchLookDelta.x !== 0 || input.touchLookDelta.y !== 0) {
        const touchSens = useGameStore.getState().settings.touchSensitivity;
        yaw.current -= input.touchLookDelta.x * 0.006 * touchSens;
        pitch.current = Math.max(
          -0.6,
          Math.min(0.8, pitch.current + input.touchLookDelta.y * 0.006 * touchSens)
        );
        input.resetTouchLookDelta();
      }

      // Wheel hub is at [24, 11, 20], radius 8.5, floor offset -1.8
      const cabinIdx = currentRide.cabinIndex || 0;
      const angle = currentRide.rotationAngle + (cabinIdx / 8) * Math.PI * 2;
      const cabinX = 24 + Math.cos(angle) * 8.5;
      const cabinY = 11 + Math.sin(angle) * 8.5 - 1.8;
      const cabinZ = 20;

      pos.current.set(cabinX, cabinY, cabinZ);
      if (playerRef.current) {
        playerRef.current.position.copy(pos.current);
      }

      // First-person panoramic riding camera
      const camY = cabinY + 1.2;
      camera.position.set(cabinX, camY, cabinZ);
      const lookTarget = new THREE.Vector3(
        cabinX - Math.cos(yaw.current) * 8,
        camY + Math.sin(pitch.current) * 6,
        cabinZ + Math.sin(yaw.current) * 8
      );
      camera.lookAt(lookTarget);

      setPrompt(null);
      return;
    }

    const maxSpeed = 7.0;
    // How fast velocity ramps up and down (higher = snappier, lower = floatier)
    const accelFactor = 14.0;

    // Incorporate touch look delta from mobile gestures
    if (input.touchLookDelta.x !== 0 || input.touchLookDelta.y !== 0) {
      const touchSens = useGameStore.getState().settings.touchSensitivity;
      yaw.current -= input.touchLookDelta.x * 0.006 * touchSens;
      pitch.current = Math.max(
        -0.6,
        Math.min(1.0, pitch.current + input.touchLookDelta.y * 0.006 * touchSens)
      );
      input.resetTouchLookDelta();
    }

    // Desired movement direction relative to camera yaw
    let forwardInput = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
    let rightInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);

    // Virtual Joystick blend
    if (input.joystickVector.x !== 0 || input.joystickVector.y !== 0) {
      rightInput += input.joystickVector.x;
      forwardInput -= input.joystickVector.y;
    }

    // Build desired velocity vector in world space
    const desiredVel = new THREE.Vector3();
    if (forwardInput !== 0 || rightInput !== 0) {
      const camForward = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current)).normalize();
      const camRight = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current)).normalize();

      desiredVel.addScaledVector(camForward, forwardInput);
      desiredVel.addScaledVector(camRight, rightInput);
      if (desiredVel.lengthSq() > 1) desiredVel.normalize();
      desiredVel.multiplyScalar(maxSpeed);
    }
    // desiredVel is zero when no input → velocity decelerates to zero

    // Lerp current velocity toward desired (smooth acceleration & deceleration)
    velocity.current.lerp(desiredVel, 1 - Math.exp(-accelFactor * safeDelta));

    const currentSpeedSq = velocity.current.lengthSq();
    const isMoving = currentSpeedSq > 0.01;

    // Smooth speed magnitude for FOV breathing and bob
    smoothSpeed.current = THREE.MathUtils.lerp(
      smoothSpeed.current,
      isMoving ? velocity.current.length() / maxSpeed : 0,
      1 - Math.exp(-8 * safeDelta)
    );

    // Smooth rotate avatar to face movement direction when moving
    if (isMoving && avatarMeshRef.current) {
      const targetRot = Math.atan2(velocity.current.x, velocity.current.z);
      avatarMeshRef.current.rotation.y = THREE.MathUtils.lerp(
        avatarMeshRef.current.rotation.y,
        targetRot,
        1 - Math.exp(-14 * safeDelta)
      );
    }

    // Head-bob: advance phase only while moving
    if (isMoving) {
      // Bob frequency ~2.5 Hz at full speed
      bobPhase.current += safeDelta * 2.5 * Math.PI * 2 * smoothSpeed.current;
      wasMoving.current = true;
    } else if (wasMoving.current) {
      // Ease bob back to zero when player stops
      bobPhase.current = THREE.MathUtils.lerp(bobPhase.current, Math.round(bobPhase.current / Math.PI) * Math.PI, 1 - Math.exp(-8 * safeDelta));
      if (Math.abs(Math.sin(bobPhase.current)) < 0.02) {
        bobPhase.current = 0;
        wasMoving.current = false;
      }
    }
    const bobOffset = Math.sin(bobPhase.current) * 0.038 * smoothSpeed.current;

    // Apply velocity to position
    const targetPos = pos.current.clone().addScaledVector(velocity.current, safeDelta);

    // Collision detection & sliding
    const resolved = collisionSystem.resolveMovement(pos.current, targetPos, 0.45);
    pos.current.copy(resolved);

    if (playerRef.current) {
      playerRef.current.position.copy(pos.current);
    }

    // ── Camera ──────────────────────────────────────────────────────────────
    const camDist = 4.8;
    const camHeight = 1.9 + pitch.current * 1.5;
    targetCamPos.current.set(
      pos.current.x - Math.sin(yaw.current) * camDist,
      pos.current.y + camHeight + bobOffset * 0.3, // camera bobs very slightly less than head
      pos.current.z - Math.cos(yaw.current) * camDist
    );

    // Slightly slower spring for a weighty, cinematic follow feel
    camera.position.lerp(targetCamPos.current, 1 - Math.exp(-6 * safeDelta));

    // Camera lookAt leads in yaw direction and adjusts with pitch
    const lookAheadDist = 1.4 * smoothSpeed.current;
    const lookTarget = new THREE.Vector3(
      pos.current.x + Math.sin(yaw.current) * (1.4 + lookAheadDist),
      pos.current.y + 1.3 + bobOffset * 0.5 + (0.4 - pitch.current) * 2.2,
      pos.current.z + Math.cos(yaw.current) * (1.4 + lookAheadDist)
    );
    camera.lookAt(lookTarget);

    // FOV breathing: expand slightly when moving at full speed (+4°), contract at rest
    const perspCam = camera as THREE.PerspectiveCamera;
    if (perspCam.isPerspectiveCamera) {
      const targetFov = 60 + smoothSpeed.current * 4;
      const nextFov = THREE.MathUtils.lerp(perspCam.fov, targetFov, 1 - Math.exp(-4 * safeDelta));
      if (Math.abs(nextFov - perspCam.fov) > 0.02) {
        perspCam.fov = nextFov;
        perspCam.updateProjectionMatrix();
      }
    }
    // ── End Camera ─────────────────────────────────────────────────────────

    // Interaction Proximity Check
    const nearest = interactionRegistry.findNearest(pos.current);
    if (nearest) {
      setPrompt({
        active: true,
        id: nearest.id,
        label: nearest.label,
        sublabel: nearest.sublabel,
        actionType: nearest.actionType,
        position: nearest.position,
      });
    } else {
      setPrompt(null);
    }

    // Determine current zone by player Z position
    const pz = pos.current.z;
    if (pz < -15) setCurrentZone('entrance');
    else if (pz < 10) setCurrentZone('central_plaza');
    else if (pz < 25) setCurrentZone('food_street');
    else setCurrentZone('cultural_stage');
  });

  return (
    <group ref={playerRef} position={[0, 0, -20]}>
      {/* 3D Festive Avatar (Festive Kurta & Dupatta/Scarf) */}
      {/* avatarMeshRef handles rotation; the inner group applies head-bob Y offset */}
      <group ref={avatarMeshRef} position={[0, 0, 0]}>
        {/* Head */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#e0a96d" roughness={0.7} />
        </mesh>

        {/* Festive Golden Turban / Pagri */}
        <mesh position={[0, 1.62, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.24, 0.22, 12]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.4}
            metalness={0.4}
          />
        </mesh>
        {/* Turban jewel feather */}
        <mesh position={[0, 1.76, 0.18]}>
          <coneGeometry args={[0.06, 0.2, 8]} />
          <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={0.5} />
        </mesh>

        {/* Kurta Torso (Festive Silk Saffron / Maroon) */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.35, 0.8, 12]} />
          <meshStandardMaterial
            color="#991b1b"
            roughness={0.5}
          />
        </mesh>

        {/* Gold Border Stole / Dupatta draped over shoulder */}
        <mesh position={[0.08, 0.98, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.15, 0.82, 0.42]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Pyjama Legs */}
        <mesh position={[-0.14, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.7, 10]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.7} />
        </mesh>
        <mesh position={[0.14, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.7, 10]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.7} />
        </mesh>

        {/* Traditional Jutti Shoes */}
        <mesh position={[-0.14, 0.05, 0.05]} castShadow>
          <boxGeometry args={[0.15, 0.1, 0.3]} />
          <meshStandardMaterial color="#b45309" metalness={0.3} />
        </mesh>
        <mesh position={[0.14, 0.05, 0.05]} castShadow>
          <boxGeometry args={[0.15, 0.1, 0.3]} />
          <meshStandardMaterial color="#b45309" metalness={0.3} />
        </mesh>

        {/* Handheld Festive Little Sparkler / Diya with Soft Golden Ambient Illumination */}
        <mesh position={[0.38, 0.9, 0.2]}>
          <coneGeometry args={[0.05, 0.12, 8]} />
          <meshStandardMaterial
            color="#fff7d6"
            emissive="#ff7700"
            emissiveIntensity={3.2}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          position={[0.38, 1.05, 0.2]}
          color="#ffaa44"
          intensity={2.2}
          distance={8.0}
          decay={1.2}
        />
      </group>

      {/* Active Unlocked Cosmetic Effect */}
      <PlayerCosmetics />

      {/* Active Golden Sparkler Effect */}
      <PlayerSparkler />
    </group>
  );
};
