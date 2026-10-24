import {
  type MelaQueueState,
  createMelaQueue,
  tryJoinQueue,
  leaveQueue,
  getNpcQueueSlot,
  isQueueFull,
} from './npcLogic';
import { MELA_QUEUES, RESTRICTED_MELA_ZONES } from './npcData';

/**
 * NpcCoordinator
 *
 * Lightweight, allocation-minimized runtime coordinator for living mela visitors.
 * Runs completely outside React state to avoid frame drops, reconciler passes,
 * or component re-renders.
 */
class NpcCoordinator {
  private positions: Map<string, [number, number, number]> = new Map();
  private queues: Map<string, MelaQueueState> = new Map();

  constructor() {
    this.resetQueues();
  }

  public clearAll() {
    this.positions.clear();
    this.resetQueues();
  }

  public resetQueues() {
    this.queues.clear();
    for (const q of MELA_QUEUES) {
      this.queues.set(q.id, createMelaQueue(q));
    }
  }

  public updatePosition(id: string, pos: [number, number, number]) {
    this.positions.set(id, pos);
  }

  public removeNpc(id: string) {
    this.positions.delete(id);
    for (const [qId, q] of this.queues.entries()) {
      if (q.occupants.includes(id)) {
        this.queues.set(qId, leaveQueue(q, id));
      }
    }
  }

  public getOtherPositions(excludeId: string): [number, number, number][] {
    const others: [number, number, number][] = [];
    for (const [id, pos] of this.positions.entries()) {
      if (id !== excludeId) {
        others.push(pos);
      }
    }
    return others;
  }

  public getQueue(queueId: string): MelaQueueState | undefined {
    return this.queues.get(queueId);
  }

  public tryJoinQueue(queueId: string, npcId: string): { slotIndex: number; success: boolean } {
    const q = this.queues.get(queueId);
    if (!q) return { slotIndex: -1, success: false };

    const result = tryJoinQueue(q, npcId);
    if (result.success) {
      this.queues.set(queueId, result.queue);
    }
    return { slotIndex: result.slotIndex, success: result.success };
  }

  public leaveQueue(queueId: string, npcId: string): void {
    const q = this.queues.get(queueId);
    if (!q) return;
    this.queues.set(queueId, leaveQueue(q, npcId));
  }

  public getNpcQueueSlot(queueId: string, npcId: string): number {
    const q = this.queues.get(queueId);
    if (!q) return -1;
    return getNpcQueueSlot(q, npcId);
  }

  public isQueueFull(queueId: string): boolean {
    const q = this.queues.get(queueId);
    if (!q) return true;
    return isQueueFull(q);
  }

  public getRestrictedZones() {
    return RESTRICTED_MELA_ZONES;
  }
}

export const npcCoordinator = new NpcCoordinator();
