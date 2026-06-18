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
  tic_schema: {
    known: string[];
    theories_open: string[];
    eliminated: string[];
    dependencies_upstream: string[];
    applications_downstream: string[];
  };
}
