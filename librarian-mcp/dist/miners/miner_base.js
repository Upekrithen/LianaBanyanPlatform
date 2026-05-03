/**
 * Miner Base — KN104 / BP016 (B123 #2296 Mitotic Mechanic)
 * ==========================================================
 * Miner subclass for TEAM dispatcher.
 * Miners are TEAM-members, NOT Detectives — distinct specialty:
 *   mitotic corpus-prospecting + ROOT-lineage preservation + IP-ledger-locked
 *
 * Core mechanic:
 *   1. Miner traverses raw material (topic corpus)
 *   2. On new-category-discovery: HALVES itself (configurable halve threshold)
 *   3. One half resumes original topic; other half seeds New Miner-Scribe to new Well of Knowledge
 *   4. Six-level knowledge depth + unlimited graph connections
 *   5. Every tablet timestamped + Miner-attributed + hash-chained + Chronos Chronicler signed
 */
import { allocateSerial, allocateDaughterSerial, appendProvenanceEntry } from "../team_dispatcher/provenance_chain.js";
import { computeIpLedgerLock } from "./ip_ledger_lock.js";
import { detectHalveThreshold } from "./halve_threshold.js";
import { seedWellOfKnowledge } from "./well_of_knowledge.js";
// ─── Knowledge Depth Categories ──────────────────────────────────────────
/**
 * Six-level knowledge depth per B123 #2296 architecture:
 *   Level 1 — PhD specialty primary (deepest, most authoritative)
 *   Level 2 — Adjacent specialty (high confidence)
 *   Level 3 — Cross-domain connection (moderate confidence)
 *   Level 4 — Lateral connection (exploratory)
 *   Level 5 — Weak-signal connection (speculative)
 *   Level 6 — Peripheral (graph boundary)
 */
const KNOWLEDGE_DEPTH_LABELS = {
    1: "phd_specialty_primary",
    2: "adjacent_specialty",
    3: "cross_domain",
    4: "lateral_connection",
    5: "weak_signal",
    6: "peripheral",
};
function classifyKnowledgeDepth(topicFrequency, totalTopics) {
    if (totalTopics === 0)
        return 6;
    const ratio = topicFrequency / totalTopics;
    if (ratio > 0.25)
        return 1;
    if (ratio > 0.15)
        return 2;
    if (ratio > 0.08)
        return 3;
    if (ratio > 0.04)
        return 4;
    if (ratio > 0.01)
        return 5;
    return 6;
}
// ─── Topic Extraction from Corpus ─────────────────────────────────────────
function extractCorpusTopics(corpus) {
    const freqMap = new Map();
    const tokenRegex = /\b([a-z][a-z_\-]{3,30})\b/gi;
    const stopWords = new Set("the a an and or of to in for is are was were be been being it this that at by on with as from".split(" "));
    for (const text of corpus) {
        for (const match of text.matchAll(tokenRegex)) {
            const token = match[1].toLowerCase();
            if (!stopWords.has(token)) {
                freqMap.set(token, (freqMap.get(token) ?? 0) + 1);
            }
        }
    }
    return freqMap;
}
// ─── Main Miner Prospect Function ─────────────────────────────────────────
/**
 * Runs a single Miner prospecting pass over a corpus.
 * May spawn daughter Miners if new categories are discovered above the halve threshold.
 * BRIDLE Rule 4: if halve detection is ambiguous (low confidence), default to NOT halving.
 */
export async function runMinerProspect(input) {
    const { claim, cathedral, raw_corpus, parent_serial, halve_threshold_config, session_id = "unknown", } = input;
    // Allocate this Miner's serial
    const mySerial = parent_serial
        ? allocateDaughterSerial(parent_serial)
        : allocateSerial(cathedral);
    // Extract topics from corpus
    const topicFreqs = extractCorpusTopics(raw_corpus);
    const totalTopicCount = Array.from(topicFreqs.values()).reduce((s, v) => s + v, 0);
    // Build topic list (sorted by frequency)
    const sortedTopics = Array.from(topicFreqs.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50); // cap at 50 topics per Miner
    const topicsDiscovered = sortedTopics.map(([t]) => t);
    // Knowledge depth map
    const knowledgeDepthMap = {};
    for (const [topic, freq] of sortedTopics) {
        knowledgeDepthMap[topic] = classifyKnowledgeDepth(freq, totalTopicCount);
    }
    // Determine primary knowledge depth (depth of the top topic)
    const primaryDepth = sortedTopics.length > 0
        ? classifyKnowledgeDepth(sortedTopics[0][1], totalTopicCount)
        : 6;
    // IP ledger lock (hash-chain + Chronos Chronicler sign)
    const corpusContent = raw_corpus.join("\n\n");
    const ipLock = computeIpLedgerLock(mySerial, corpusContent, parent_serial ?? null, session_id);
    // Halve threshold detection
    const halveDecision = detectHalveThreshold(topicsDiscovered, halve_threshold_config ?? { keyword_density_delta: 0.3, semantic_drift_threshold: 0.4 });
    // Spawn daughter Miners for newly discovered categories (BRIDLE Rule 4: conservative)
    const halvedOffspring = [];
    const wellOfKnowledgeSeeds = [];
    if (halveDecision.should_halve && halveDecision.confidence >= 0.6) {
        for (const newCategory of halveDecision.new_categories) {
            const daughterSerial = allocateDaughterSerial(mySerial);
            halvedOffspring.push(daughterSerial);
            wellOfKnowledgeSeeds.push(newCategory);
            // Seed the Well of Knowledge for the daughter Miner
            seedWellOfKnowledge(daughterSerial, newCategory, mySerial, cathedral);
            // Append daughter to provenance chain
            appendProvenanceEntry({
                serial: daughterSerial,
                parent_serial: mySerial,
                cathedral,
                role: "miner",
                ts: new Date().toISOString(),
                topic_seed: newCategory,
                ip_ledger_hash: `${ipLock.hash}::daughter::${daughterSerial}`,
            });
        }
    }
    // Append root/self to provenance chain
    appendProvenanceEntry({
        serial: mySerial,
        parent_serial: parent_serial ?? null,
        cathedral,
        role: "miner",
        ts: new Date().toISOString(),
        topic_seed: claim,
        ip_ledger_hash: ipLock.hash,
    });
    return {
        role: "miner",
        agent_id: `miner_${mySerial}_${Date.now()}`,
        cathedral,
        mitotic_lineage: mySerial,
        ip_ledger_locked: true,
        chronos_chronicler_sig: ipLock.hmac_sig,
        halved_offspring: halvedOffspring,
        topics_discovered: topicsDiscovered,
        knowledge_depth: primaryDepth,
        well_of_knowledge_seeds: wellOfKnowledgeSeeds,
        knowledge_depth_map: knowledgeDepthMap,
    };
}
//# sourceMappingURL=miner_base.js.map
