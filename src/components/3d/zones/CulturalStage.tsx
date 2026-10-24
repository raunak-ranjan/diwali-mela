import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { interactionRegistry } from '../../../systems/interactionRegistry';
import { collisionSystem } from '../../../systems/collision';
import { useGameStore } from '../../../stores/useGameStore';
import { SANGEET_VIDEO_CONFIG } from '../../../utils/attractionConfig';

export const CulturalStage = () => {
  const openModal = useGameStore((s) => s.openModal);
  const isPlayingMusic = useGameStore((s) => s.culturalStageState.isPlayingMusic);
  const lightingTheme = useGameStore((s) => s.culturalStageState.lightingTheme);
  const isScreenActive = useGameStore((s) => s.culturalStageState.isScreenActive);
  const setStageScreenActive = useGameStore((s) => s.setStageScreenActive);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  useEffect(() => {
    // Collision for stage at North end: X: [-9, 9], Z: [32, 42]
    collisionSystem.registerBox('cultural_stage', -9, 9, 32, 42);

    // Register interaction prompt
    interactionRegistry.register({
      id: 'cultural_performance_stage',
      position: [0, 1.0, 30.5],
      radius: 4.0,
      label: 'Diwali Cultural Sangeet Stage',
      sublabel: 'Live Traditional Ragas & Concert Experience',
      actionType: 'stage',
      onInteract: () => {
        openModal('stage');
      },
      secondaryAction: isScreenActive
        ? undefined
        : {
            label: 'Watch Performance on Stage Screen',
            sublabel: 'Play Live YouTube Video in 3D Mela',
            keyHint: 'V',
            onAction: () => {
              setStageScreenActive(true);
            },
          },
    });

    return () => {
      interactionRegistry.unregister('cultural_performance_stage');
    };
  }, [openModal, setStageScreenActive, isScreenActive]);

  // Stage Spotlight movement and animated concert lighting
  useFrame(({ clock }) => {
    if (spotlightRef.current) {
      const t = clock.getElapsedTime();
      if (isPlayingMusic || isScreenActive) {
        // Dynamic concert spotlight sweep
        spotlightRef.current.position.x = Math.sin(t * 2.2) * 6;
        spotlightRef.current.position.z = -2 + Math.cos(t * 1.8) * 1.5;
        spotlightRef.current.intensity = 4.5 + Math.sin(t * 4.0) * 1.5;

        // Theme colors
        if (lightingTheme === 'peacock') {
          spotlightRef.current.color.set(Math.sin(t) > 0 ? '#06b6d4' : '#d946ef');
        } else if (lightingTheme === 'saffron') {
          spotlightRef.current.color.set(Math.sin(t) > 0 ? '#ea580c' : '#fbbf24');
        } else {
          spotlightRef.current.color.set('#fef08a');
        }
      } else {
        spotlightRef.current.position.x = Math.sin(t * 0.8) * 2;
        spotlightRef.current.position.z = -2;
        spotlightRef.current.intensity = 2.5;
        spotlightRef.current.color.set('#fef08a');
      }
    }
  });

  return (
    <group position={[0, 0, 37]}>
      {/* Elevated Wooden Stage Platform */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 1.2, 9]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>

      {/* Stage Front Steps */}
      <mesh position={[0, 0.25, -4.8]} receiveShadow>
        <boxGeometry args={[6, 0.5, 1.2]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>

      {/* Decorative Jharokha Backdrop Wall */}
      <mesh position={[0, 4.2, 4.2]} castShadow>
        <boxGeometry args={[16, 6.0, 0.6]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.7} />
      </mesh>

      {/* ========================================================
          PHYSICAL 3D STAGE LED CONCERT SCREEN DISPLAY
      ======================================================== */}
      <group position={[0, 4.2, 3.88]}>
        {/* Carved Wooden Screen Bezel Housing */}
        <mesh position={[0, 0, -0.04]} castShadow>
          <boxGeometry args={[10.0, 5.8, 0.08]} />
          <meshStandardMaterial color="#2d1b0d" roughness={0.7} />
        </mesh>

        {/* Festive Golden Outer Border Trim */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[9.76, 5.56, 0.04]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#b45309"
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Physical LED Screen Display Mesh (Black Glass Ambient Surface) */}
        <mesh position={[0, 0, 0.01]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[9.6, 5.4]} />
          <meshStandardMaterial
            color={isScreenActive ? '#020617' : '#080c1e'}
            emissive={isScreenActive ? '#000000' : '#1e1b4b'}
            emissiveIntensity={0.5}
            roughness={0.25}
            metalness={0.7}
          />
        </mesh>

        {/* Idle Festive Stage Graphics (Shown when video is not active) */}
        {!isScreenActive && (
          <group position={[0, 0, 0.02]} rotation={[0, Math.PI, 0]}>
            {/* Header Ribbon */}
            <mesh position={[0, 1.9, 0]}>
              <planeGeometry args={[8.0, 0.6]} />
              <meshBasicMaterial color="#b45309" />
            </mesh>
            {/* Center Golden Diya & Mandala Motif */}
            <mesh position={[0, 0.2, 0]}>
              <circleGeometry args={[1.1, 32]} />
              <meshBasicMaterial color="#d97706" />
            </mesh>
            <mesh position={[0, 0.2, 0.005]}>
              <circleGeometry args={[0.9, 32]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
            {/* Bottom Info Banner */}
            <mesh position={[0, -1.9, 0]}>
              <planeGeometry args={[7.2, 0.5]} />
              <meshBasicMaterial color="#1e1b4b" />
            </mesh>
          </group>
        )}

        {/* Live In-World YouTube Screen Video via Drei <Html transform> */}
        {isScreenActive && (
          <Html
            transform
            distanceFactor={SANGEET_VIDEO_CONFIG.STAGE_SCREEN.DISTANCE_FACTOR}
            position={[0, 0, 0.03]}
            rotation={[0, Math.PI, 0]}
            pointerEvents="auto"
            style={{
              width: `${SANGEET_VIDEO_CONFIG.STAGE_SCREEN.PIXEL_WIDTH}px`,
              height: `${SANGEET_VIDEO_CONFIG.STAGE_SCREEN.PIXEL_HEIGHT}px`,
            }}
          >
            <div
              data-testid="stage-screen-video-container"
              className="w-full h-full bg-black rounded-lg overflow-hidden border border-amber-500/50 shadow-2xl relative select-none"
              style={{
                width: `${SANGEET_VIDEO_CONFIG.STAGE_SCREEN.PIXEL_WIDTH}px`,
                height: `${SANGEET_VIDEO_CONFIG.STAGE_SCREEN.PIXEL_HEIGHT}px`,
              }}
            >
              <iframe
                src={SANGEET_VIDEO_CONFIG.EMBED_URL}
                title={SANGEET_VIDEO_CONFIG.TITLE}
                data-testid="stage-screen-youtube-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </Html>
        )}
      </group>

      {/* Stage Drapes (Festive Crimson & Gold Fabric) */}
      <mesh position={[-7.5, 4.2, 3.8]}>
        <boxGeometry args={[1.2, 6.0, 0.4]} />
        <meshStandardMaterial color="#991b1b" roughness={0.5} />
      </mesh>
      <mesh position={[7.5, 4.2, 3.8]}>
        <boxGeometry args={[1.2, 6.0, 0.4]} />
        <meshStandardMaterial color="#991b1b" roughness={0.5} />
      </mesh>

      {/* Indian Classical Instruments on Carpet */}
      {/* Red Carpet */}
      <mesh position={[0, 1.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#881337" roughness={0.9} />
      </mesh>

      {/* Dhol (Traditional double-headed festival drum) */}
      <group position={[-2.5, 1.6, 0]} rotation={[0, 0.4, 0]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 1.1, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        {/* Leather Drum heads */}
        <mesh position={[-0.56, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 16]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
        <mesh position={[0.56, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 16]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
      </group>

      {/* Tabla Pair (Bayan and Dayan) */}
      <group position={[1.8, 1.4, 0]}>
        {/* Bayan (Bass metal drum) */}
        <mesh position={[-0.35, 0, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Dayan (Treble wooden drum) */}
        <mesh position={[0.35, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.45, 16]} />
          <meshStandardMaterial color="#92400e" roughness={0.5} />
        </mesh>
      </group>

      {/* Dynamic Stage Spotlight */}
      <spotLight
        ref={spotlightRef}
        position={[0, 9, -2]}
        target-position={[0, 1.5, 0]}
        color="#fef08a"
        intensity={3.0}
        angle={0.6}
        penumbra={0.5}
        castShadow
      />
    </group>
  );
};
