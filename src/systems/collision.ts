import * as THREE from 'three';

export interface BoundingBoxObstacle {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CylinderObstacle {
  id: string;
  x: number;
  z: number;
  radius: number;
}

/**
 * 2D segment-box intersection test in the XZ plane.
 * Returns true if segment (x1, z1)->(x2, z2) crosses through the box interior.
 */
function segmentIntersectsBox(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): boolean {
  let tmin = 0;
  let tmax = 1;
  const dx = x2 - x1;
  const dz = z2 - z1;

  if (Math.abs(dx) < 1e-6) {
    if (x1 < minX || x1 > maxX) return false;
  } else {
    const invD = 1 / dx;
    let t1 = (minX - x1) * invD;
    let t2 = (maxX - x1) * invD;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }

  if (Math.abs(dz) < 1e-6) {
    if (z1 < minZ || z1 > maxZ) return false;
  } else {
    const invD = 1 / dz;
    let t1 = (minZ - z1) * invD;
    let t2 = (maxZ - z1) * invD;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }

  // Crosses interior of the obstacle if the interval overlaps between 0.05 and 0.95
  return tmax > 0.05 && tmin < 0.95;
}

export class CollisionSystem {
  private boxes: BoundingBoxObstacle[] = [];
  private cylinders: CylinderObstacle[] = [];

  // Fairground outer boundary
  public bounds = {
    minX: -40,
    maxX: 40,
    minZ: -30,
    maxZ: 50,
  };

  public registerBox(id: string, minX: number, maxX: number, minZ: number, maxZ: number) {
    this.boxes = this.boxes.filter((b) => b.id !== id);
    this.boxes.push({ id, minX, maxX, minZ, maxZ });
  }

  public registerCylinder(id: string, x: number, z: number, radius: number) {
    this.cylinders = this.cylinders.filter((c) => c.id !== id);
    this.cylinders.push({ id, x, z, radius });
  }

  /**
   * Verifies unobstructed line-of-sight between two XZ coordinates.
   * Prevents players from interacting through solid stall walls, booths, or buildings.
   */
  public hasLineOfSight(x1: number, z1: number, x2: number, z2: number): boolean {
    for (const box of this.boxes) {
      // Slightly inset the obstacle box (by 0.12) so interacting directly at a counter edge is allowed
      const bMinX = box.minX + 0.12;
      const bMaxX = box.maxX - 0.12;
      const bMinZ = box.minZ + 0.12;
      const bMaxZ = box.maxZ - 0.12;
      if (bMinX >= bMaxX || bMinZ >= bMaxZ) continue;

      if (segmentIntersectsBox(x1, z1, x2, z2, bMinX, bMaxX, bMinZ, bMaxZ)) {
        return false;
      }
    }
    return true;
  }

  public resolveMovement(currentPos: THREE.Vector3, targetPos: THREE.Vector3, playerRadius: number = 0.5): THREE.Vector3 {
    let resolvedX = targetPos.x;
    let resolvedZ = targetPos.z;

    // 1. Clamp to fairground boundary
    resolvedX = Math.max(this.bounds.minX + playerRadius, Math.min(this.bounds.maxX - playerRadius, resolvedX));
    resolvedZ = Math.max(this.bounds.minZ + playerRadius, Math.min(this.bounds.maxZ - playerRadius, resolvedZ));

    // 2. Check and slide against Box Obstacles (Stalls, Stage, Fences)
    for (const box of this.boxes) {
      const expandedMinX = box.minX - playerRadius;
      const expandedMaxX = box.maxX + playerRadius;
      const expandedMinZ = box.minZ - playerRadius;
      const expandedMaxZ = box.maxZ + playerRadius;

      if (
        resolvedX >= expandedMinX &&
        resolvedX <= expandedMaxX &&
        resolvedZ >= expandedMinZ &&
        resolvedZ <= expandedMaxZ
      ) {
        // If current position was outside the box, push back toward where they entered from
        if (currentPos.x >= expandedMaxX) {
          resolvedX = expandedMaxX;
        } else if (currentPos.x <= expandedMinX) {
          resolvedX = expandedMinX;
        } else if (currentPos.z >= expandedMaxZ) {
          resolvedZ = expandedMaxZ;
        } else if (currentPos.z <= expandedMinZ) {
          resolvedZ = expandedMinZ;
        } else {
          // Fallback to nearest edge
          const distLeft = Math.abs(resolvedX - expandedMinX);
          const distRight = Math.abs(resolvedX - expandedMaxX);
          const distBottom = Math.abs(resolvedZ - expandedMinZ);
          const distTop = Math.abs(resolvedZ - expandedMaxZ);
          const minDist = Math.min(distLeft, distRight, distBottom, distTop);

          if (minDist === distRight) resolvedX = expandedMaxX;
          else if (minDist === distLeft) resolvedX = expandedMinX;
          else if (minDist === distTop) resolvedZ = expandedMaxZ;
          else resolvedZ = expandedMinZ;
        }
      }
    }

    // 3. Check and slide against Cylinder Obstacles
    for (const cyl of this.cylinders) {
      const dx = resolvedX - cyl.x;
      const dz = resolvedZ - cyl.z;
      const distSq = dx * dx + dz * dz;
      const minDist = cyl.radius + playerRadius;

      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq) || 0.001;
        const pushX = (dx / dist) * minDist;
        const pushZ = (dz / dist) * minDist;
        resolvedX = cyl.x + pushX;
        resolvedZ = cyl.z + pushZ;
      }
    }

    return new THREE.Vector3(resolvedX, targetPos.y, resolvedZ);
  }
}

export const collisionSystem = new CollisionSystem();
