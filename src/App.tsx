import { useEffect, lazy, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { MelaScene } from './components/3d/MelaScene';
import { HUD } from './components/ui/HUD';
import { WelcomeScreen } from './components/ui/WelcomeScreen';
import { VirtualJoystick } from './components/ui/VirtualJoystick';
import { InteractionPrompt } from './components/ui/InteractionPrompt';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useGameStore } from './stores/useGameStore';
import { useInputStore } from './stores/useInputStore';

// Code-split heavy interactive modals & mini-games to minimize initial JS bundle
const BalloonShootingUI = lazy(() =>
  import('./components/ui/MiniGameOverlays/BalloonShootingUI').then((m) => ({ default: m.BalloonShootingUI }))
);
const StallsShopModal = lazy(() =>
  import('./components/ui/StallsShopModal').then((m) => ({ default: m.StallsShopModal }))
);
const RangoliEditorUI = lazy(() =>
  import('./components/ui/RangoliEditorUI').then((m) => ({ default: m.RangoliEditorUI }))
);
const FinaleModal = lazy(() =>
  import('./components/ui/FinaleModal').then((m) => ({ default: m.FinaleModal }))
);
const SettingsModal = lazy(() =>
  import('./components/ui/SettingsModal').then((m) => ({ default: m.SettingsModal }))
);
const PauseMenu = lazy(() =>
  import('./components/ui/PauseMenu').then((m) => ({ default: m.PauseMenu }))
);

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
        camera={{ position: [0, 3, -13], fov: 60 }}
        gl={{
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <MelaScene />
      </Canvas>

      {/* 2D HUD & Overlay Layers */}
      <HUD />
      <VirtualJoystick />
      <InteractionPrompt />

      {/* Immediate Welcome Screen */}
      <WelcomeScreen />

      {/* Lazy Loaded Interactive Modals & Mini-Games */}
      <Suspense fallback={null}>
        <BalloonShootingUI />
        <StallsShopModal />
        <RangoliEditorUI />
        <FinaleModal />
        <SettingsModal />
        <PauseMenu />
      </Suspense>
    </div>
  );
}

export default App;
