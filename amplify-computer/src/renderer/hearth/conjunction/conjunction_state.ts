// B83a — Conjunction State (React context — no Zustand needed)
// Provides shared conjunction state to ConjunctionPanel + HearthConjunctionWindow

import { createContext, useContext } from 'react';
import type { ConjunctionMode, ConjunctionPanelState, ConjunctionResult, BackendAvailability } from './types';

export interface ConjunctionContextValue {
  panelState: ConjunctionPanelState;
  availability: BackendAvailability;
  lastResult: ConjunctionResult | null;
  selectMode: (mode: ConjunctionMode) => Promise<void>;
  dispatch: (prompt: string, mode_override?: ConjunctionMode) => Promise<ConjunctionResult | null>;
  refreshAvailability: () => Promise<void>;
}

export const ConjunctionContext = createContext<ConjunctionContextValue | null>(null);

export function useConjunction(): ConjunctionContextValue {
  const ctx = useContext(ConjunctionContext);
  if (!ctx) throw new Error('useConjunction must be used inside ConjunctionProvider');
  return ctx;
}

export const DEFAULT_PANEL_STATE: ConjunctionPanelState = {
  selected: 'cpu_only',
  per_request_override: null,
  last_dispatch: null,
  in_flight: null,
};

export const DEFAULT_AVAILABILITY: BackendAvailability = {
  cpu_only: true,
  ollama: false,
  knight_cursor: false,
  opus_claude: false,
  all_in_conjunction: true,
};
