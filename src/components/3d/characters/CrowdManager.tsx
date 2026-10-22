import React, { useMemo } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { useNpcStore } from '../../../stores/useNpcStore';
import { AMBIENT_VISITORS, VENDOR_NPCS } from '../../../systems/npcData';
import { filterVisitors } from '../../../systems/npcLogic';
import { AmbientVisitor } from './AmbientVisitor';
import { VendorNPC } from './VendorNPC';

export const CrowdManager: React.FC = () => {
  const crowdDensity = useNpcStore((s) => s.crowdDensity);
  const graphicsQuality = useGameStore((s) => s.settings.graphicsQuality);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const activeVisitors = useMemo(() => {
    return filterVisitors(AMBIENT_VISITORS, crowdDensity, graphicsQuality);
  }, [crowdDensity, graphicsQuality]);

  return (
    <group name="living_mela_crowd">
      {/* Ambient Visitors */}
      {activeVisitors.map((visitor) => (
        <AmbientVisitor
          key={visitor.id}
          config={visitor}
          reducedMotion={reducedMotion}
        />
      ))}

      {/* Stall Vendors */}
      {VENDOR_NPCS.map((vendor) => (
        <VendorNPC
          key={vendor.id}
          config={vendor}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
};
