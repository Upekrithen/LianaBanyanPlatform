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
// ─── Detection Algorithm ───────────────────────────────────────────────────
/**
 * Simplified category-discovery detection.
 *
 * Production upgrade path: replace semantic_drift_score with actual
 * embedding-cosine-distance computation when embedding service is available.
 */
export function detectHalveThreshold(topicsDiscovered, config) {
    // If Founder ratification explicitly overrides, honor it
    if (config.founder_ratification_override !== undefined) {
        return {
            should_halve: config.founder_ratification_override,
            confidence: 1.0,
            new_categories: config.founder_ratification_override ? topicsDiscovered.slice(0, 3) : [],
            detection_signals: {
                keyword_density_delta: 0,
                semantic_drift_score: 0,
                topic_count_before: 0,
                topic_count_after: topicsDiscovered.length,
            },
            bridle_note: "Founder ratification override applied.",
        };
    }
    // Heuristic: look for multi-domain spread across topics
    // Estimate "categories" from topic prefix diversity (simplified signal)
    const topicPrefixes = new Set(topicsDiscovered.map(t => t.slice(0, 3)));
    const prefixDiversity = topicPrefixes.size / Math.max(1, topicsDiscovered.length);
    // Keyword density delta: ratio of new topics to total
    const keywordDensityDelta = Math.min(1.0, topicsDiscovered.length / 20);
    // Semantic drift: proxy as prefix diversity × topic count ratio
    const semanticDriftScore = Math.min(1.0, prefixDiversity * 2);
    // Identify candidate new categories (high-frequency distinct prefixes)
    const prefixCounts = new Map();
    for (const t of topicsDiscovered) {
        const prefix = t.slice(0, 3);
        const existing = prefixCounts.get(prefix) ?? [];
        existing.push(t);
        prefixCounts.set(prefix, existing);
    }
    const newCategories = Array.from(prefixCounts.entries())
        .filter(([, topics]) => topics.length >= 2)
        .map(([, topics]) => topics[0])
        .slice(0, 5);
    // Confidence score
    const thresholdsMet = (keywordDensityDelta >= config.keyword_density_delta ? 0.5 : 0) +
        (semanticDriftScore >= config.semantic_drift_threshold ? 0.5 : 0);
    const confidence = thresholdsMet;
    // BRIDLE Rule 4: if confidence < 0.6, default to NOT halving
    const shouldHalve = confidence >= 0.6 && newCategories.length > 0;
    const bridleNote = !shouldHalve
        ? "BRIDLE Rule 4 applied: halve detection ambiguous (confidence < 0.6); defaulting to NO halve."
        : `Halve threshold met (confidence=${confidence.toFixed(2)}); ${newCategories.length} new categories detected.`;
    return {
        should_halve: shouldHalve,
        confidence,
        new_categories: shouldHalve ? newCategories : [],
        detection_signals: {
            keyword_density_delta: keywordDensityDelta,
            semantic_drift_score: semanticDriftScore,
            topic_count_before: 0,
            topic_count_after: topicsDiscovered.length,
        },
        bridle_note: bridleNote,
    };
}
//# sourceMappingURL=halve_threshold.js.map
