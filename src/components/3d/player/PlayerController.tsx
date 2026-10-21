import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../../stores/useGameStore';
import { useInputStore } from '../../../stores/useInputStore';
import { collisionSystem } from '../../../systems/collision';
import { interactionRegistry } from '../../../systems/interactionRegistry';

export const PlayerController = () => {
  const { camera } = useThree();
  const playerRef = useRef<THREE.Group>(null);
  const avatarMeshRef = useRef<THREE.Group>(null);

  const setPrompt = useGameStore((s) => s.setPrompt);
  const setCurrentZone = useGameStore((s) => s.setCurrentZone);
  const activeModal = useGameStore((s) => s.activeModal);
  const openModal = useGameStore((s) => s.openModal);

  // Position and camera state
  const pos = useRef(new THREE.Vector3(0, 0, -20)); // Start right by the grand entrance threshold
  const yaw = useRef(0); // Camera horizontal rotation
  const pitch = useRef(0.12); // Subtle natural camera tilt towards the fairground horizon
  const targetCamPos = useRef(new THREE.Vector3(0, 2.3, -25));

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing or modal active (except Esc)
      if (e.key === 'Escape') {
        const currentModal = useGameStore.getState().activeModal;
        if (currentModal === 'none') {
          openModal('pause');
        } else if (currentModal === 'pause') {
          useGameStore.getState().closeModal();
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
  }, [openModal]);

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
      pitch.current = Math.max(0.05, Math.min(1.1, pitch.current + dy * 0.005));
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

    const input = useInputStore.getState();
    const moveSpeed = 7.0;

    // Incorporate touch look delta from mobile gestures
    if (input.touchLookDelta.x !== 0 || input.touchLookDelta.y !== 0) {
      const touchSens = useGameStore.getState().settings.touchSensitivity;
      yaw.current -= input.touchLookDelta.x * 0.006 * touchSens;
      pitch.current = Math.max(
        0.05,
        Math.min(1.1, pitch.current + input.touchLookDelta.y * 0.006 * touchSens)
      );
      input.resetTouchLookDelta();
    }

    // Direction vector relative to camera yaw
    let forwardInput = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
    let rightInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);

    // Virtual Joystick blend
    if (input.joystickVector.x !== 0 || input.joystickVector.y !== 0) {
      rightInput += input.joystickVector.x;
      forwardInput -= input.joystickVector.y;
    }

    const moveDir = new THREE.Vector3();
    if (forwardInput !== 0 || rightInput !== 0) {
      // Forward relative to camera heading (+Z into the fairground)
      const camForward = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current)).normalize();
      const camRight = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current)).normalize();

      moveDir.addScaledVector(camForward, forwardInput);
      moveDir.addScaledVector(camRight, rightInput);
      if (moveDir.lengthSq() > 1) moveDir.normalize();

      // Smooth rotate avatar to face movement direction
      if (avatarMeshRef.current) {
        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        avatarMeshRef.current.rotation.y = THREE.MathUtils.lerp(
          avatarMeshRef.current.rotation.y,
          targetRot,
          delta * 14
        );
      }
    }

    // Target displacement
    const targetPos = pos.current.clone().addScaledVector(moveDir, moveSpeed * delta);

    // Collision detection & sliding
    const resolved = collisionSystem.resolveMovement(pos.current, targetPos, 0.45);
    pos.current.copy(resolved);

    if (playerRef.current) {
      playerRef.current.position.copy(pos.current);
    }

    // Smooth Third-Person Camera Follow (behind player looking forward into fairground)
    const camDist = 4.8;
    const camHeight = 1.9 + pitch.current * 1.5;
    targetCamPos.current.set(
      pos.current.x - Math.sin(yaw.current) * camDist,
      pos.current.y + camHeight,
      pos.current.z - Math.cos(yaw.current) * camDist
    );

    camera.position.lerp(targetCamPos.current, delta * 8);
    camera.lookAt(pos.current.x, pos.current.y + 1.2, pos.current.z + 1.5);

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
    <group ref={playerRef} position={[pos.current.x, pos.current.y, pos.current.z]}>
      {/* 3D Festive Avatar (Festive Kurta & Dupatta/Scarf) */}
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
    </group>
  );
};
