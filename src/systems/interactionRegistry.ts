import * as THREE from 'three';
import type { InteractionPromptState } from '../types/game';

export interface InteractionTarget {
  id: string;
  position: [number, number, number];
  radius: number;
  label: string;
  sublabel?: string;
  actionType: InteractionPromptState['actionType'];
  onInteract: () => void;
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

  public findNearest(playerPos: THREE.Vector3): InteractionTarget | null {
    let nearest: InteractionTarget | null = null;
    let minDistance = Infinity;

    for (const target of this.targets.values()) {
      const dx = playerPos.x - target.position[0];
      const dy = playerPos.y - target.position[1];
      const dz = playerPos.z - target.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= target.radius && dist < minDistance) {
        minDistance = dist;
        nearest = target;
      }
    }

    return nearest;
  }
}

export const interactionRegistry = new InteractionRegistry();
