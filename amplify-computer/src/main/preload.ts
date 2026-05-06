// AMPLIFY Computer — Electron Preload
// B37 Phase 1-3 — Exposes safe IPC bridge to renderer via contextBridge
// Phase 3 additions: substrate query/write, federation status, force-mode

import { contextBridge, ipcRenderer } from 'electron';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FrameMode = 'ai_burst' | 'normal' | 'fallback';

export interface FrameModePayload {
  mode: FrameMode;
  forced_mode: FrameMode | null;
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
  peer_synced: number;
  substrate_hit_ratio: number;
  local_ratio: number;
  cloud_ratio: number;
  total_cloud_cost_avoided_usd: number;
  total_tokens_saved_est: number;
  avg_latency_ms: number;
  index_size: number;
  as_of: string;
}

export interface SubstrateQueryResult {
  hit: boolean;
  record?: {
    id: string;
    text: string;
    source: string;
    keywords: string[];
    ts: string;
  };
  score?: number;
  routing: 'substrate_hit' | 'local_ollama' | 'cloud_escalation' | 'peer_sync' | 'miss';
  latency_ms: number;
  cloud_cost_avoided_usd: number;
  peer_sync_exchanged?: number;
}

export interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'not-available';
  version?: string;
  releaseNotes?: string;
  downloadProgress?: number;
  errorMessage?: string;
}

export interface PeriodStats {
  period: string;
  label: string;
  total_queries: number;
  substrate_hits: number;
  local_ollama_served: number;
  cloud_escalations: number;
  peer_synced: number;
  misses: number;
  substrate_hit_ratio: number;
  local_ratio: number;
  cloud_ratio: number;
  cloud_cost_avoided_usd: number;
  tokens_saved_est: number;
  avg_latency_ms: number;
  avg_local_latency_ms: number;
  cloud_baseline_latency_ms: number;
  latency_improvement_pct: number;
  days_active: number;
}

export interface DailyBreakdown {
  date: string;
  total_queries: number;
  substrate_hits: number;
  local_ollama_served: number;
  cloud_escalations: number;
  cloud_cost_avoided_usd: number;
  tokens_saved_est: number;
  avg_latency_ms: number;
}

export interface TelemetrySummary {
  session: PeriodStats;
  today: PeriodStats;
  week: PeriodStats;
  month: PeriodStats;
  daily_breakdown: DailyBreakdown[];
  all_time_cost_avoided_usd: number;
  all_time_tokens_saved: number;
  all_time_queries: number;
}

export interface FederationPeer {
  address: string;
  port: number;
  lastSeen: string;
  recordCount?: number;
}

export interface FederationStatus {
  online: boolean;
  peerCount: number;
  lastSyncTs: string | null;
  lastSyncRecordsExchanged: number;
  pendingWriteCount: number;
  peers: FederationPeer[];
}

// ─── Bridge ───────────────────────────────────────────────────────────────────

contextBridge.exposeInMainWorld('amplify', {
  // ── Mode ──────────────────────────────────────────────────────────────────
  getFrameMode: (): Promise<FrameModePayload> =>
    ipcRenderer.invoke('get-frame-mode'),

  setFrameMode: (mode: FrameMode): void =>
    ipcRenderer.send('set-frame-mode', { mode }),

  forceFrameMode: (mode: FrameMode | null): Promise<{ ok: boolean; forced_mode: FrameMode | null }> =>
    ipcRenderer.invoke('force-frame-mode', { mode }),

  onFrameModeChanged: (cb: (payload: FrameModePayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: FrameModePayload) => cb(payload);
    ipcRenderer.on('frame-mode-changed', handler);
    return () => ipcRenderer.removeListener('frame-mode-changed', handler);
  },

  // ── Overlay ───────────────────────────────────────────────────────────────
  setClickthrough: (enabled: boolean): void =>
    ipcRenderer.send('set-clickthrough', { enabled }),

  // ── Ollama ────────────────────────────────────────────────────────────────
  getOllamaStatus: (): Promise<OllamaStatus> =>
    ipcRenderer.invoke('get-ollama-status'),

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

  // ── Substrate (Phase 3) ───────────────────────────────────────────────────

  /** Route a query through the three-mode substrate router (AI Burst / Normal / Fallback) */
  substrateQuery: (
    query: string,
    model?: string,
  ): Promise<SubstrateQueryResult> =>
    ipcRenderer.invoke('substrate-query', { query, model }),

  /** Write a new record to the local substrate index + queue federation sync */
  substrateWrite: (
    text: string,
    source?: string,
    keywords?: string[],
  ): Promise<{ ok: boolean; id?: string }> =>
    ipcRenderer.invoke('substrate-write', { text, source, keywords }),

  // ── Federation (Phase 3) ──────────────────────────────────────────────────

  getFederationStatus: (): Promise<FederationStatus> =>
    ipcRenderer.invoke('get-federation-status'),

  setMemberToken: (token: string | null): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke('set-member-token', { token }),

  // ── AMPLIFY Telemetry ─────────────────────────────────────────────────────
  getAMPLIFYSnapshot: (): Promise<AMPLIFYSnapshot> =>
    ipcRenderer.invoke('get-amplify-snapshot'),

  /** Full historical summary — today / week / month / daily breakdown / all-time */
  getAMPLIFYSummary: (): Promise<TelemetrySummary> =>
    ipcRenderer.invoke('get-amplify-summary'),

  // ── Auto-Update ───────────────────────────────────────────────────────────
  getUpdateState: (): Promise<UpdateState> =>
    ipcRenderer.invoke('get-update-state'),

  checkForUpdates: (): void =>
    ipcRenderer.send('check-for-updates'),

  installUpdate: (): void =>
    ipcRenderer.send('install-update'),

  onUpdateStateChanged: (cb: (state: UpdateState) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: UpdateState) => cb(state);
    ipcRenderer.on('update-state-changed', handler);
    return () => ipcRenderer.removeListener('update-state-changed', handler);
  },

  // ── MoneyPenny Mobile ─────────────────────────────────────────────────────
  getMoneyPennyUrl: (): Promise<{ url: string; ips: string[]; port: number }> =>
    ipcRenderer.invoke('get-moneypenny-url'),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  openDashboard: (): void =>
    ipcRenderer.send('open-dashboard'),
});

// ─── Global type extension ────────────────────────────────────────────────────

declare global {
  interface Window {
    amplify: {
      // Mode
      getFrameMode: () => Promise<FrameModePayload>;
      setFrameMode: (mode: FrameMode) => void;
      forceFrameMode: (mode: FrameMode | null) => Promise<{ ok: boolean; forced_mode: FrameMode | null }>;
      onFrameModeChanged: (cb: (payload: FrameModePayload) => void) => () => void;
      // Overlay
      setClickthrough: (enabled: boolean) => void;
      // Ollama
      getOllamaStatus: () => Promise<OllamaStatus>;
      pullDefaultModel: () => Promise<{ success: boolean; alreadyInstalled?: boolean; error?: string }>;
      listOllamaModels: () => Promise<string[]>;
      checkDiskSpace: () => Promise<{ ok: boolean; requiredGB: number }>;
      onOllamaPullProgress: (cb: (progress: ModelPullProgress) => void) => () => void;
      // Substrate
      substrateQuery: (query: string, model?: string) => Promise<SubstrateQueryResult>;
      substrateWrite: (text: string, source?: string, keywords?: string[]) => Promise<{ ok: boolean; id?: string }>;
      // Federation
      getFederationStatus: () => Promise<FederationStatus>;
      setMemberToken: (token: string | null) => Promise<{ ok: boolean }>;
      // Telemetry
      getAMPLIFYSnapshot: () => Promise<AMPLIFYSnapshot>;
      getAMPLIFYSummary: () => Promise<TelemetrySummary>;
      // Auto-Update
      getUpdateState: () => Promise<UpdateState>;
      checkForUpdates: () => void;
      installUpdate: () => void;
      onUpdateStateChanged: (cb: (state: UpdateState) => void) => () => void;
      // MoneyPenny
      getMoneyPennyUrl: () => Promise<{ url: string; ips: string[]; port: number }>;
      // Dashboard
      openDashboard: () => void;
    };
  }
}
