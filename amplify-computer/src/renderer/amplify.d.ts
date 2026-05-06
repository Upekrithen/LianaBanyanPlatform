// AMPLIFY Computer — Renderer-side type declarations for window.amplify
// Mirrors the contextBridge API defined in src/main/preload.ts

export type FrameMode = 'ai_burst' | 'normal' | 'fallback';

export interface FrameModePayload {
  mode: FrameMode;
}

export interface OllamaStatus {
  running: boolean;
  model: string | null;
  version?: string;
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
