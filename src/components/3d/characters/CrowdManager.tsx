import React, { useMemo } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { useInputStore } from '../../../stores/useInputStore';
import { useNpcStore } from '../../../stores/useNpcStore';
import { AMBIENT_VISITORS, VENDOR_NPCS } from '../../../systems/npcData';
import { filterVisitors } from '../../../systems/npcLogic';
import { AmbientVisitor } from './AmbientVisitor';
import { VendorNPC } from './VendorNPC';

export const CrowdManager: React.FC = () => {
  const crowdDensity = useNpcStore((s) => s.crowdDensity);
  const graphicsQuality = useGameStore((s) => s.settings.graphicsQuality);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);
  const isTouchDevice = useInputStore((s) => s.isTouchDevice);

  // Mobile / touch devices default to essential visitor tier to reduce CPU animation loops & draw calls
  const effectiveQuality = isTouchDevice && graphicsQuality === 'medium' ? 'low' : graphicsQuality;

  const activeVisitors = useMemo(() => {
    return filterVisitors(AMBIENT_VISITORS, crowdDensity, effectiveQuality);
  }, [crowdDensity, effectiveQuality]);

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
