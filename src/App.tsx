import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { MelaScene } from './components/3d/MelaScene';
import { HUD } from './components/ui/HUD';
import { WelcomeScreen } from './components/ui/WelcomeScreen';
import { VirtualJoystick } from './components/ui/VirtualJoystick';
import { InteractionPrompt } from './components/ui/InteractionPrompt';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { BalloonShootingUI } from './components/ui/MiniGameOverlays/BalloonShootingUI';
import { RingTossUI } from './components/ui/MiniGameOverlays/RingTossUI';
import { StallsShopModal } from './components/ui/StallsShopModal';
import { RangoliEditorUI } from './components/ui/RangoliEditorUI';
import { FinaleModal } from './components/ui/FinaleModal';
import { CulturalStageModal } from './components/ui/CulturalStageModal';
import { FireworksControlModal } from './components/ui/FireworksControlModal';
import { FerrisWheelRideOverlay } from './components/ui/FerrisWheelRideOverlay';
import { SettingsModal } from './components/ui/SettingsModal';
import { PauseMenu } from './components/ui/PauseMenu';
import { RewardsProgressionModal } from './components/ui/RewardsProgressionModal';
import { FestivalPouchModal } from './components/ui/FestivalPouchModal';
import { VendorGreetingBanner } from './components/ui/VendorGreetingBanner';
import { useGameStore } from './stores/useGameStore';
import { useInputStore } from './stores/useInputStore';

export function App() {
  const initializeSave = useGameStore((s) => s.initializeSave);
  const isLoaded = useGameStore((s) => s.isLoaded);
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const isTouchDevice = useInputStore((s) => s.isTouchDevice);
  const setIsTouchDevice = useInputStore((s) => s.setIsTouchDevice);

  useEffect(() => {
    initializeSave();

    // Check touch capabilities
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);

    // Expose for testing & debug inspection
    if (typeof window !== 'undefined') {
      (window as any).__gameStore = useGameStore;
      (window as any).__inputStore = useInputStore;
    }
  }, [initializeSave, setIsTouchDevice]);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // Device-aware responsive pixel ratio: mobile caps at 1.5 to protect battery and fill-rate
  const maxDpr = isTouchDevice
    ? quality === 'high'
      ? 1.5
      : 1.0
    : quality === 'high'
    ? 2.0
    : quality === 'medium'
    ? 1.5
    : 1.0;
  const dpr: [number, number] = [1, maxDpr];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060913]">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows={quality !== 'low'}
        dpr={dpr}
        camera={{ position: [0, 2.3, -25], fov: 60 }}
        gl={{
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.35;
        }}
      >
        <MelaScene />
      </Canvas>

      {/* 2D HUD & Overlay Layers */}
      <HUD />
      <VirtualJoystick />
      <InteractionPrompt />
      <VendorGreetingBanner />
      <FerrisWheelRideOverlay />

      {/* Immediate Welcome Screen */}
      <WelcomeScreen />

      {/* Interactive Modals & Mini-Games */}
      <BalloonShootingUI />
      <RingTossUI />
      <StallsShopModal />
      <RangoliEditorUI />
      <FinaleModal />
      <CulturalStageModal />
      <FireworksControlModal />
      <SettingsModal />
      <PauseMenu />
      <RewardsProgressionModal />
      <FestivalPouchModal />
    </div>
  );
}

export default App;
