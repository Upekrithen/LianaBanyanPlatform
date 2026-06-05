// ============================================================================
// BP073 β-W19 — Gemma 4 12B rerun against BP067 4-of-4 harness (verbatim)
// SAME harness: same prompts, same dimensions, same grading rubric, same
//   kappa-target >= 0.85
// New variables ONLY:
//   (i)  Gemma 4 12B model row
//   (ii) substrate ON / substrate OFF condition pair per model
// Honesty floor: if encoder-free architecture does not compose with Eblet
//   injection, mark audio cell NOT YET — NOT a degraded text score.
// ============================================================================

import type { PredictionCommitment } from './prediction-schema';

export const BP067_HARNESS_DIMENSIONS = [
  'correctness',
  'cost',
  'speed',
  'refusal-rate',
] as const;

export type HarnessDimension = typeof BP067_HARNESS_DIMENSIONS[number];

export const GEMMA4_12B_RERUN_MODELS = [
  { id: 'gemma4-12b-substrate-on',  label: 'Gemma 4 12B + MnemosyneC substrate', substratOn: true  },
  { id: 'gemma4-12b-substrate-off', label: 'Gemma 4 12B baseline (substrate OFF)', substratOn: false },
  { id: 'gpt-frontier',             label: 'GPT frontier (anchor)',                substratOn: true  },
  { id: 'gemini-frontier',          label: 'Gemini frontier (anchor)',             substratOn: true  },
  { id: 'claude-opus',              label: 'Claude Opus (anchor)',                 substratOn: true  },
  { id: 'llama-3x',                 label: 'Llama 3.x successor (anchor)',         substratOn: true  },
  { id: 'gemma2-2b',                label: 'Gemma 2 2B bundled floor (anchor)',    substratOn: true  },
  { id: 'any-substrate-off',        label: 'ANY model substrate OFF (floor)',      substratOn: false },
] as const;

export interface HarnessRunConfig {
  harnessId: 'BP067-4of4-verbatim';
  harnessSha: string;             // git SHA of the harness file — publish on Pinned Proof
  predictionCommitment: PredictionCommitment;
  models: typeof GEMMA4_12B_RERUN_MODELS;
  dimensions: typeof BP067_HARNESS_DIMENSIONS;
  kappaTarget: 0.85;
  historicalKappa: 0.936;         // BP067 anchor — publish for comparison
  honestyFlags: {
    audioInputNotYet: boolean;    // mark audio cells NOT YET if encoder-free does not compose
    mtpDrafterBinding: 'WORKS' | 'PARTIAL' | 'NOT_YET'; // MTP drafter on Ollama
    ramFloorVariance: string;     // "+-2pp variance 16GB Windows DDR vs Mac unified memory"
  };
}
