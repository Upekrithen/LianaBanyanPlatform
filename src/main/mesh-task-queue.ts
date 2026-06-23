// mesh-task-queue.ts
// BP091 · M22 · Continuous Cooperative Task Queue
// Accepts tasks from any subsystem, routes via mesh-dispatcher, returns aggregated results.

import crypto from 'crypto';
import {
  CooperativeTask,
  DispatchResult,
  routeTask,
  dispatchToAssignedPeers,
  accrueMarks,
} from './mesh-dispatcher';

export class MeshTaskQueue {
  private queue: CooperativeTask[] = [];
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private resultHandlers: Array<(results: DispatchResult[]) => void> = [];
  private running = false;

  constructor(private readonly heartbeatIntervalMs = 5 * 60 * 1000) {}

  enqueue(task: CooperativeTask): void {
    this.queue.push(task);
    console.log(`[mesh-task-queue] enqueued task ${task.task_id} source=${task.source}`);
  }

  onResult(handler: (results: DispatchResult[]) => void): void {
    this.resultHandlers.push(handler);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.heartbeatTimer = setInterval(() => {
      this.runHeartbeat().catch(err => console.error('[mesh-task-queue] heartbeat error:', err));
    }, this.heartbeatIntervalMs);
    console.log(`[mesh-task-queue] started · heartbeat every ${this.heartbeatIntervalMs / 1000}s`);
  }

  stop(): void {
    this.running = false;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    console.log('[mesh-task-queue] stopped');
  }

  private async drainBatch(): Promise<void> {
    const batch = this.queue.splice(0, this.queue.length);
    if (batch.length === 0) return;

    const allResults: DispatchResult[] = [];
    for (const task of batch) {
      try {
        const assignments = await routeTask(task);
        if (assignments.length === 0) {
          console.log(`[mesh-task-queue] no eligible peers for task ${task.task_id}`);
          continue;
        }
        const results = await dispatchToAssignedPeers(assignments, task);
        for (const r of results) {
          await accrueMarks(r, task.source);
        }
        allResults.push(...results);
      } catch (err) {
        console.error(`[mesh-task-queue] task ${task.task_id} dispatch error:`, err);
      }
    }

    if (allResults.length > 0) {
      for (const handler of this.resultHandlers) {
        try { handler(allResults); } catch { /* non-fatal handler error */ }
      }
    }
  }

  private async runHeartbeat(): Promise<void> {
    if (this.queue.length > 0) {
      await this.drainBatch();
    } else {
      // Cooperative substrate maintenance — idle peers stay warm
      const freshnessTask: CooperativeTask = {
        task_id:    crypto.randomUUID(),
        difficulty: 'SHORT',
        modality:   'VERIFICATION',
        urgency:    'BATCH',
        payload:    await this.selectFreshnessCheckPayload(),
        source:     'heartbeat_maintenance',
      };
      this.queue.push(freshnessTask);
      await this.drainBatch();
    }
  }

  private async selectFreshnessCheckPayload(): Promise<string> {
    // Random canon domain freshness check — keeps peers warm between explicit fires
    const domains = ['biology', 'chemistry', 'physics', 'history', 'mathematics', 'law', 'economics'];
    const d = domains[Math.floor(Math.random() * domains.length)];
    return `Cooperative substrate freshness check · domain=${d} · timestamp=${new Date().toISOString()}`;
  }
}

// Singleton instance (initialized on first access from IPC registration)
let _meshTaskQueue: MeshTaskQueue | null = null;

export function getMeshTaskQueue(): MeshTaskQueue {
  if (!_meshTaskQueue) {
    _meshTaskQueue = new MeshTaskQueue();
    _meshTaskQueue.start();
  }
  return _meshTaskQueue;
}
