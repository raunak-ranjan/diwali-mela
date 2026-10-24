import { FestivalCollectibles } from './environment/FestivalCollectibles';
import React, { Suspense } from 'react';
import { FestivalLighting } from './environment/FestivalLighting';
import { GroundAndSky } from './environment/GroundAndSky';
import { FloatingEmbers } from './environment/FloatingEmbers';
import { FestivalSmoke } from './environment/FestivalSmoke';
import { WindDecorations } from './environment/WindDecorations';
import { DistantScenery } from './environment/DistantScenery';
import { FairyLights } from './environment/FairyLights';
import { InstancedDiyas } from './environment/InstancedDiyas';
import { MagicalDiyas } from './environment/MagicalDiyas';
import { GrandEntrance } from './zones/GrandEntrance';
import { CentralRangoliPlaza } from './zones/CentralRangoliPlaza';
import { FoodStalls } from './zones/FoodStalls';
import { HandicraftStalls } from './zones/HandicraftStalls';
import { BalloonShootingBooth } from './minigames/BalloonShootingBooth';
import { RingTossBooth } from './minigames/RingTossBooth';
import { FerrisWheel } from './zones/FerrisWheel';
import { CulturalStage } from './zones/CulturalStage';
import { FireworksShow } from './vfx/FireworksShow';
import { FireworksPavilion } from './environment/FireworksPavilion';
import { PlayerController } from './player/PlayerController';
import { CrowdManager } from './characters/CrowdManager';
import { useGameStore } from '../../stores/useGameStore';

export const MelaScene: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const isFireworksActive = activeModal === 'finale';

  return (
    <Suspense fallback={null}>
      {/* Lighting & Atmospherics */}
      <FestivalLighting />

      {/* Ground & Night Sky */}
      <GroundAndSky />

      {/* Wind-Reactive Bunting, Planters & Foliage */}
      <WindDecorations />

      {/* Floating Festival Embers & Sacred Dhoop Smoke */}
      <FloatingEmbers />
      <FestivalSmoke />

      {/* Distant Royal Architecture & Environmental Depth */}
      <DistantScenery />

      {/* Festive Fairy String Lights */}
      <FairyLights />

      {/* Hundreds of Clay Diyas */}
      <InstancedDiyas />

      {/* Sacred Quest Collectible Diyas */}
      <MagicalDiyas />

      {/* Hidden Festival Exploration Keepsakes */}
      <FestivalCollectibles />

      {/* Fairground Zones */}
      <GrandEntrance />
      <CentralRangoliPlaza />
      <FoodStalls />
      <HandicraftStalls />
      <BalloonShootingBooth />
      <RingTossBooth />
      <FerrisWheel />
      <CulturalStage />

      {/* Living Mela: Ambient Visitors & Stall Vendors */}
      <CrowdManager />

      {/* Fireworks VFX & Launch Station */}
      <FireworksPavilion />
      <FireworksShow active={isFireworksActive} />

      {/* Player Controller & Camera */}
      <PlayerController />
    </Suspense>
  );
};
