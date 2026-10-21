import React, { Suspense } from 'react';
import { FestivalLighting } from './environment/FestivalLighting';
import { GroundAndSky } from './environment/GroundAndSky';
import { DistantScenery } from './environment/DistantScenery';
import { FairyLights } from './environment/FairyLights';
import { InstancedDiyas } from './environment/InstancedDiyas';
import { GrandEntrance } from './zones/GrandEntrance';
import { CentralRangoliPlaza } from './zones/CentralRangoliPlaza';
import { FoodStalls } from './zones/FoodStalls';
import { HandicraftStalls } from './zones/HandicraftStalls';
import { BalloonShootingBooth } from './minigames/BalloonShootingBooth';
import { FerrisWheel } from './zones/FerrisWheel';
import { CulturalStage } from './zones/CulturalStage';
import { FireworksShow } from './vfx/FireworksShow';
import { PlayerController } from './player/PlayerController';
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

      {/* Distant Royal Architecture & Environmental Depth */}
      <DistantScenery />

      {/* Festive Fairy String Lights */}
      <FairyLights />

      {/* Hundreds of Clay Diyas */}
      <InstancedDiyas />

      {/* Fairground Zones */}
      <GrandEntrance />
      <CentralRangoliPlaza />
      <FoodStalls />
      <HandicraftStalls />
      <BalloonShootingBooth />
      <FerrisWheel />
      <CulturalStage />

      {/* Fireworks VFX */}
      <FireworksShow active={isFireworksActive} />

      {/* Player Controller & Camera */}
      <PlayerController />
    </Suspense>
  );
};
