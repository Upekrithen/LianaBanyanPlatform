/**
 * Halve Threshold — Configurable Category-Discovery Detector (KN104 / BP016)
 * ===========================================================================
 * Determines when a Miner should halve itself upon discovering a new topic category.
 *
 * Two detection signals (per B123 #2296 architecture):
 *   1. Keyword density delta — how much the topic distribution has shifted
 *   2. Semantic drift metric — how far the new content is from the original topic vector
 *
 * BRIDLE Rule 4 (CONSERVATIVE DEFAULT):
 *   If detection is ambiguous (confidence < 0.6), default to NOT halving.
 *   This preserves ROOT-lineage integrity.
 */
export interface HalveThresholdConfig {
    keyword_density_delta: number;
    semantic_drift_threshold: number;
    founder_ratification_override?: boolean;
}
export interface HalveDecision {
    should_halve: boolean;
    confidence: number;
    new_categories: string[];
    detection_signals: {
        keyword_density_delta: number;
        semantic_drift_score: number;
        topic_count_before: number;
        topic_count_after: number;
    };
    bridle_note: string;
}
/**
 * Simplified category-discovery detection.
 *
 * Production upgrade path: replace semantic_drift_score with actual
 * embedding-cosine-distance computation when embedding service is available.
 */
export declare function detectHalveThreshold(topicsDiscovered: string[], config: HalveThresholdConfig): HalveDecision;
