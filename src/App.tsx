import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { MelaScene } from './components/3d/MelaScene';
import { HUD } from './components/ui/HUD';
import { WelcomeScreen } from './components/ui/WelcomeScreen';
import { VirtualJoystick } from './components/ui/VirtualJoystick';
import { InteractionPrompt } from './components/ui/InteractionPrompt';
import { BalloonShootingUI } from './components/ui/MiniGameOverlays/BalloonShootingUI';
import { StallsShopModal } from './components/ui/StallsShopModal';
import { RangoliEditorUI } from './components/ui/RangoliEditorUI';
import { FinaleModal } from './components/ui/FinaleModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { PauseMenu } from './components/ui/PauseMenu';
import { useGameStore } from './stores/useGameStore';
import { useInputStore } from './stores/useInputStore';

export function App() {
  const initializeSave = useGameStore((s) => s.initializeSave);
  const isLoaded = useGameStore((s) => s.isLoaded);
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const setIsTouchDevice = useInputStore((s) => s.setIsTouchDevice);

  useEffect(() => {
    initializeSave();

    // Check touch capabilities
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, [initializeSave, setIsTouchDevice]);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-[#060913] flex flex-col items-center justify-center text-white p-4">
        <div className="text-4xl animate-bounce mb-3">🪔</div>
        <div className="text-lg font-bold text-festive-gold">Igniting Diwali Mela...</div>
        <div className="text-xs text-amber-200/60 mt-1">Lighting hundreds of golden diyas</div>
      </div>
    );
  }

  const dpr = quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.5] : [1, 1];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060913]">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows={quality !== 'low'}
        dpr={dpr as any}
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

      {/* Interactive Modals & Mini-Games */}
      <WelcomeScreen />
      <BalloonShootingUI />
      <StallsShopModal />
      <RangoliEditorUI />
      <FinaleModal />
      <SettingsModal />
      <PauseMenu />
    </div>
  );
}

export default App;
