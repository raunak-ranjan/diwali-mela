import * as THREE from 'three';
import type { InteractionPromptState, InteractionPromptAction } from '../types/game';
import { collisionSystem } from './collision';

export interface InteractionTarget {
  id: string;
  position: [number, number, number];
  radius: number;
  label: string;
  sublabel?: string;
  actionType: InteractionPromptState['actionType'];
  onInteract: () => void;
  secondaryAction?: InteractionPromptAction;
}

class InteractionRegistry {
  private targets: Map<string, InteractionTarget> = new Map();

  public register(target: InteractionTarget) {
    this.targets.set(target.id, target);
  }

  public unregister(id: string) {
    this.targets.delete(id);
  }

  public get(id: string): InteractionTarget | undefined {
    return this.targets.get(id);
  }

  public findNearest(playerPos: THREE.Vector3, checkOcclusion = true): InteractionTarget | null {
    let nearest: InteractionTarget | null = null;
    let minDistanceSq = Infinity;

    for (const target of this.targets.values()) {
      const dx = playerPos.x - target.position[0];
      const dy = playerPos.y - target.position[1];
      const dz = playerPos.z - target.position[2];
      const distSq = dx * dx + dy * dy + dz * dz;
      const radiusSq = target.radius * target.radius;

      if (distSq <= radiusSq && distSq < minDistanceSq) {
        // Prevent interactions through solid walls or booths
        if (
          checkOcclusion &&
          !collisionSystem.hasLineOfSight(playerPos.x, playerPos.z, target.position[0], target.position[2])
        ) {
          continue;
        }

        minDistanceSq = distSq;
        nearest = target;
      }
    }

    return nearest;
  }
}

export const interactionRegistry = new InteractionRegistry();
