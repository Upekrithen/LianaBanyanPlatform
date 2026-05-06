// AMPLIFY Computer — Electron Preload
// Exposes safe IPC bridge to renderer via contextBridge

import { contextBridge, ipcRenderer } from 'electron';

export type FrameMode = 'ai_burst' | 'normal' | 'fallback';

export interface FrameModePayload {
  mode: FrameMode;
}

export interface OllamaStatus {
  running: boolean;
  model: string | null;
  version?: string;
}

export interface ModelPullProgress {
  status: 'pulling' | 'verifying' | 'complete' | 'error';
  bytesDownloaded?: number;
  totalBytes?: number;
  percentComplete?: number;
  error?: string;
}

export interface AMPLIFYSnapshot {
  total_queries: number;
  substrate_hits: number;
  local_ollama_served: number;
  cloud_escalations: number;
  substrate_hit_ratio: number;
  local_ratio: number;
  cloud_ratio: number;
  total_cloud_cost_avoided_usd: number;
  total_tokens_saved_est: number;
  as_of: string;
}

contextBridge.exposeInMainWorld('amplify', {
  // Mode
  getFrameMode: (): Promise<FrameModePayload> =>
    ipcRenderer.invoke('get-frame-mode'),
  setFrameMode: (mode: FrameMode): void =>
    ipcRenderer.send('set-frame-mode', { mode }),
  onFrameModeChanged: (cb: (payload: FrameModePayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: FrameModePayload) => cb(payload);
    ipcRenderer.on('frame-mode-changed', handler);
    return () => ipcRenderer.removeListener('frame-mode-changed', handler);
  },

  // Click-through
  setClickthrough: (enabled: boolean): void =>
    ipcRenderer.send('set-clickthrough', { enabled }),

  // Ollama
  getOllamaStatus: (): Promise<OllamaStatus> =>
    ipcRenderer.invoke('get-ollama-status'),

  // AMPLIFY telemetry
  getAMPLIFYSnapshot: (): Promise<AMPLIFYSnapshot> =>
    ipcRenderer.invoke('get-amplify-snapshot'),

  // Dashboard
  openDashboard: (): void =>
    ipcRenderer.send('open-dashboard'),

  // Ollama model management
  pullDefaultModel: (): Promise<{ success: boolean; alreadyInstalled?: boolean; error?: string }> =>
    ipcRenderer.invoke('pull-default-model'),
  listOllamaModels: (): Promise<string[]> =>
    ipcRenderer.invoke('list-ollama-models'),
  checkDiskSpace: (): Promise<{ ok: boolean; requiredGB: number }> =>
    ipcRenderer.invoke('check-disk-space'),
  onOllamaPullProgress: (cb: (progress: ModelPullProgress) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: ModelPullProgress) => cb(progress);
    ipcRenderer.on('ollama-pull-progress', handler);
    return () => ipcRenderer.removeListener('ollama-pull-progress', handler);
  },
});

// TypeScript global type extension
declare global {
  interface Window {
    amplify: {
      getFrameMode: () => Promise<FrameModePayload>;
      setFrameMode: (mode: FrameMode) => void;
      onFrameModeChanged: (cb: (payload: FrameModePayload) => void) => () => void;
      setClickthrough: (enabled: boolean) => void;
      getOllamaStatus: () => Promise<OllamaStatus>;
      getAMPLIFYSnapshot: () => Promise<AMPLIFYSnapshot>;
      openDashboard: () => void;
    };
  }
}
