import type { BulkLoadResult } from "./pheromone_bulk_loader.js";
export declare const BASE_CAMP_DIR: string;
export declare const RECEIPT_PATH: string;
export type ReceiptStatus = "comfortable" | "partial" | "failed";
export interface MakeComfortableReceipt {
    receipt_id: string;
    ts: string;
    user_choice_scope: {
        default_integrated: string[];
        user_added: string[];
        user_opted_out: string[];
    };
    shadow_results: Array<{
        shadow_id: string;
        files_indexed: number;
        pheromone_count: number;
        error_count: number;
        duration_ms: number;
    }>;
    files_indexed: number;
    pheromones_emitted: number;
    completeness_pct: number;
    canonical_file_count_target: number;
    detective_phase0_hit_ratio_pre_load: number;
    detective_phase0_hit_ratio_post_load: number;
    hit_ratio_improvement_factor: number;
    chronos_chronicler_sig: string;
    status: ReceiptStatus;
    next_recommended_action: string;
    error_count: number;
    errors: string[];
}
export declare function measurePhase0HitRatio(): number;
export interface ReceiptOptions {
    shadowResults: BulkLoadResult[];
    defaultIntegrated: string[];
    userAdded?: string[];
    userOptedOut?: string[];
    canonicalFileCountTarget?: number;
    /** Pre-load hit ratio (measured before bulk-load; pass from caller) */
    preLoadHitRatio?: number;
}
export declare function generateReceipt(opts: ReceiptOptions): MakeComfortableReceipt;
