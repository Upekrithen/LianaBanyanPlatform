// B83a — Conjunction Window — Renderer-Side Types
// Mirrors main-process types for the contextBridge surface

export type ConjunctionMode =
  | 'cpu_only'
  | 'ollama'
  | 'knight_cursor'
  | 'opus_claude'
  | 'all_in_conjunction';

export interface ConjunctionPanelState {
  selected: ConjunctionMode;
  per_request_override: ConjunctionMode | null;
  last_dispatch: {
    mode: ConjunctionMode;
    ts: string;
    latency_ms: number;
    success: boolean;
  } | null;
  in_flight: { mode: ConjunctionMode; started_at: string } | null;
}

export interface AdapterReceipt {
  name: ConjunctionMode;
  result: string | null;
  error: string | null;
  latency_ms: number;
  cost_usd?: number;
  tokens?: { in: number; out: number };
}

export interface ConjunctionResult {
  dispatch_id: string;
  routed_to: ConjunctionMode[];
  receipts: AdapterReceipt[];
  synthesized: string | null;
  synthesizer_mode: string;
  total_latency_ms: number;
}

export interface BackendAvailability {
  cpu_only: boolean;
  ollama: boolean;
  knight_cursor: boolean;
  opus_claude: boolean;
  all_in_conjunction: boolean;
}
