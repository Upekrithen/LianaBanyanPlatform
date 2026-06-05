/**
 * loadHarnessResults -- I3-W27
 *
 * READ-ONLY local module. No fetch, no network.
 * When I3-W20-W23 results land (Asteroid-ProofVault/BP073_BETA_W20_W23_HARNESS_RESULTS.md
 * contains actual scores), update the ACTUAL_RESULTS constant below and flip
 * soundBarrierVerdict to 'WINS' | 'PARTIAL' | 'LOSES'.
 *
 * UPDATED: 2026-06-05 -- BP074 SEG-1 Sound Barrier Re-run complete.
 * Gemma 4 12B + substrate ON = 100.0% correctness. Verdict: WINS.
 */

export interface HarnessResultCell {
  model: string;
  dimension: 'correctness' | 'cost' | 'speed' | 'refusal-rate';
  score: number | null;          // null = NOT YET (not run)
  status: 'WORKS' | 'PARTIAL' | 'NOT_YET';
  substrateOn: boolean;
  notes?: string;
}

export interface HarnessResults {
  runTimestamp: string;
  harnessId: 'BP067-4of4-verbatim';
  kappa: number | null;
  costRatioLocalVsApi: number | null;
  soundBarrierVerdict: 'WINS' | 'PARTIAL' | 'LOSES' | 'PENDING';
  gemma4Score: number | null;    // Gemma 4 12B + substrate Banyan Metric
  cells: HarnessResultCell[];
}

// ---------------------------------------------------------------------------
// ACTUAL_RESULTS -- populated 2026-06-05 after BP074 SEG-1 Sound Barrier run.
// Gemma 4 12B: 100.0% COLD, 100.0% HOT, avg_lat=4.776s HOT, $0.000/Q, 0% refusal.
// Banyan Metric (substrate ON): 90.45
// Sound Barrier verdict: WINS (>= 85% correctness + kappa 1.000 deterministic grader)
// ---------------------------------------------------------------------------
const ACTUAL_RESULTS: HarnessResults = {
  runTimestamp: '2026-06-05T02:16:34Z',
  harnessId: 'BP067-4of4-verbatim',
  kappa: 1.0,                     // deterministic grader (letter-match + numeric-compare)
  costRatioLocalVsApi: 1000,      // >1000x vs cheapest API (Gemini flash $0.0093/Q)
  soundBarrierVerdict: 'WINS',    // Gemma 4 12B + substrate: 100.0% >= 85 threshold
  gemma4Score: 100,               // Correctness score (25/25 WINS); BM 90.45 noted in chart annotation
  cells: [
    { model: 'gemma2:2b',                       dimension: 'correctness',  score: 36.0,  status: 'WORKS', substrateOn: false },
    { model: 'gemma2:2b',                       dimension: 'correctness',  score: 44.0,  status: 'WORKS', substrateOn: true  },
    { model: 'llama3.1:8b-instruct-q4_K_M',     dimension: 'correctness',  score: 64.0,  status: 'WORKS', substrateOn: false },
    { model: 'llama3.1:8b-instruct-q4_K_M',     dimension: 'correctness',  score: 60.0,  status: 'WORKS', substrateOn: true  },
    { model: 'qwen2.5:7b',                      dimension: 'correctness',  score: 88.0,  status: 'WORKS', substrateOn: false },
    { model: 'qwen2.5:7b',                      dimension: 'correctness',  score: 88.0,  status: 'WORKS', substrateOn: true  },
    { model: 'llama3.3:70b-instruct-q4_K_M',    dimension: 'correctness',  score: 92.0,  status: 'WORKS', substrateOn: false },
    { model: 'llama3.3:70b-instruct-q4_K_M',    dimension: 'correctness',  score: 88.0,  status: 'WORKS', substrateOn: true  },
    { model: 'gemma4:12b',                      dimension: 'correctness',  score: 100.0, status: 'WORKS', substrateOn: false },
    { model: 'gemma4:12b',                      dimension: 'correctness',  score: 100.0, status: 'WORKS', substrateOn: true  },
    { model: 'gemma4:12b',                      dimension: 'speed',        score: 4.958, status: 'WORKS', substrateOn: false, notes: 'avg_latency_s COLD' },
    { model: 'gemma4:12b',                      dimension: 'speed',        score: 4.776, status: 'WORKS', substrateOn: true,  notes: 'avg_latency_s HOT' },
    { model: 'gemma4:12b',                      dimension: 'cost',         score: 0.0,   status: 'WORKS', substrateOn: false, notes: 'USD per inference, local' },
    { model: 'gemma4:12b',                      dimension: 'refusal-rate', score: 0.0,   status: 'WORKS', substrateOn: false },
    { model: 'gemma4:12b',                      dimension: 'refusal-rate', score: 0.0,   status: 'WORKS', substrateOn: true  },
  ],
};

// ---------------------------------------------------------------------------
// Returns PENDING if the harness has not yet run; returns actual results once
// ACTUAL_RESULTS is populated by Knight after results land.
// ---------------------------------------------------------------------------
export function getHarnessResults(): HarnessResults {
  return ACTUAL_RESULTS;
}
