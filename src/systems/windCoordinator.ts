import { computeGlobalWind, type WindVector } from './environmentMath';

class WindCoordinator {
  private currentWind: WindVector = { x: 0.8, z: 0.6, speed: 1.0, gust: 0.2 };
  private lastUpdateTime: number = -1;

  public update(time: number): WindVector {
    if (Math.abs(time - this.lastUpdateTime) > 0.001) {
      this.currentWind = computeGlobalWind(time);
      this.lastUpdateTime = time;
    }
    return this.currentWind;
  }

  public getWind(): WindVector {
    return this.currentWind;
  }
}

export const windCoordinator = new WindCoordinator();
