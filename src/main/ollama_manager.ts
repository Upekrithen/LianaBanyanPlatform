// AMPLIFY Computer — Ollama Lifecycle Manager
// B37 Phase 2 scaffold (Phase 1: stubs that Phase 2 will fill)
// Manages local Ollama process: spawn, health check, graceful shutdown

import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const OLLAMA_API_BASE = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.1:8b-instruct-q4_K_M';
const HEALTH_CHECK_INTERVAL_MS = 30_000;

export interface OllamaStatus {
  running: boolean;
  model: string | null;
  version?: string;
  pid?: number;
}

export class OllamaManager {
  private process: ChildProcess | null = null;
  private status: OllamaStatus = { running: false, model: null };
  private healthTimer: ReturnType<typeof setInterval> | null = null;

  async init(): Promise<void> {
    // Check if Ollama is already running (user may have it pre-installed)
    const alreadyRunning = await this.isReachable();
    if (alreadyRunning) {
      this.status = { running: true, model: DEFAULT_MODEL };
      this._startHealthMonitor();
      return;
    }

    // Phase 2 will spawn bundled Ollama binary
    // For Phase 1: just record status without spawning
    this.status = { running: false, model: null };
  }

  async isReachable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${OLLAMA_API_BASE}/api/tags`, {
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
      return res.ok;
    } catch {
      return false;
    }
  }

  getStatus(): OllamaStatus {
    return { ...this.status };
  }

  async pullModel(modelName: string = DEFAULT_MODEL): Promise<void> {
    // Phase 2: implement streaming pull with progress reporting
    const res = await fetch(`${OLLAMA_API_BASE}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: false }),
    });
    if (!res.ok) throw new Error(`Ollama pull failed: ${res.statusText}`);
    this.status.model = modelName;
  }

  private _startHealthMonitor(): void {
    this.healthTimer = setInterval(async () => {
      const alive = await this.isReachable();
      this.status.running = alive;
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  async shutdown(): Promise<void> {
    if (this.healthTimer) clearInterval(this.healthTimer);
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
    this.status = { running: false, model: null };
  }
}
