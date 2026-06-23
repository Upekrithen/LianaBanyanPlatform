export interface PeerNode {
  node_id: string;
  machine_label: string; // M0, M1, M2, M3
  last_seen: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
}

export interface PlowBladeResult {
  blade_name: string;
  blade_output: string;
  blade_latency_ms: number;
  andon_quarantine: boolean;
}

export interface NodeAnswer {
  node_id: string;
  machine_label: string;
  answer: string;
  blade_results: PlowBladeResult[];
  response_time_ms: number;
  hex_frame_bytes: number;
  hex_parse_latency_ms: number;
}

export interface QuestionResult {
  q_id: string;
  question_text: string;
  correct_answer: string;
  node_answers: NodeAnswer[];
  ensemble_winner: string;
  is_correct: boolean;
  disagreement_flag: boolean;
  contested: boolean;
  contested_resolution_tier?: 'tier_1' | 'tier_3_contested' | null;
  tier_1_fallback_fired?: boolean;
  tier_2_fallback_fired?: boolean;
}

export interface MeshReceiptEblet {
  run_id: string;
  topology: string;
  node_list: string[];
  question_count: number;
  start_utc: string;
  end_utc: string;
  aggregate_score: string;
  accuracy_pct: number;
  per_question: QuestionResult[];
  plow_blade_summary: Array<{blade_name: string; total_fires: number; andon_events: number; avg_latency_ms: number}>;
  unfair_advantages_exercised: string[];
  hex_wire_stats: {total_frames: number; avg_bytes: number; avg_parse_ms: number};
  single_node_comparison: string;
  fleet_composition?: FleetPeerEntry[];
  fleet_summary?: FleetSummary;
  tic_schema: {
    known: string[];
    theories_open: string[];
    eliminated: string[];
    dependencies_upstream: string[];
    applications_downstream: string[];
  };
}

// M22 · fleet_composition per-peer contribution block
export interface FleetPeerEntry {
  peer_id:              string;   // SHORT form (first 16 hex chars of Soccerball L1)
  ramTier:              string;   // 'ultra' | 'full' | 'core' | 'lite' | 'nano'
  model:                string;
  questions_handled:    number;
  questions_correct:    number;
  escalations_received: number;   // escalated FROM this peer to higher tier
  escalations_solved:   number;   // escalated INTO this peer that were solved
  marks_earned:         number;   // = questions_handled per Marks canon
}

export interface FleetSummary {
  total_peers:         number;
  tier_breakdown:      Record<string, number>;  // { ultra: 1, full: 2, core: 2, lite: 0, nano: 0 }
  fleet_accuracy:      number;   // 0-1
  per_tier_accuracy:   Record<string, number>;  // { ultra: 0.889, full: 0.821, core: 0.708 }
  total_marks_accrued: number;
}
