# Substrate-Dependency Classifier — Transparent Algorithmic for #2287 Tier A/B/C

**Filed:** 2026-04-29 by Bishop on Founder direction (B134 turn 16)
**Class:** New system spec for the #2287 Partnership-Stake Downstream-IP-Reversion Tier A/B/C classification adjudicator
**Founder direction:** *"Then build it. Lets make it... transparent algorithmic classifier on substrate-dependency-graph. Most objective, easiest to make."*

---

## Why this needed building

Per #2287 thresh-stub (`BISHOP_DROPZONE/12_Innovations_AA/INNOVATION_THRESH_2287_PARTNERSHIP_STAKE_DOWNSTREAM_IP_REVERSION_B134.md`), Bishop scaffolded Three Fates arbitration as classification adjudicator. Honest read: that's hand-waving without a credible third-party adjudicator.

**Founder ratification of Bishop concern + direction:** build a **transparent algorithmic classifier on the substrate-dependency-graph**. Why this is the right choice:

- **Most objective:** algorithm + graph = no human-discretion-class disputes; both sides see the same input → same output
- **Easiest to make:** the substrate-dependency graph already exists in canon (Pheromone Substrate K523 / Wrasse registry K540 / Detective live-update K550 collectively form the dependency-relationship index)
- **Defensible at scrutiny:** transparency is the differentiator vs traditional patent-pool arbitration (which is opaque)
- **Composes with existing IP**: the classifier itself is patentable as method+system (Prov 16 candidate)

## Spec elements

### 1. Input — Research Partner's prospective patent claim

At Research Partner enrollment time, Partner submits prospective claim language (provisional or pre-USPTO). Classifier ingests:
- Claim text (provisional-grade, USPTO Section 112 form)
- Specification body (full invention disclosure)
- Drawings / figures (if any)
- Prior-art citations Partner intends to make
- Substrate-touchpoints Partner declares (Cathedral Effect / Wrasse / Pheromone / Stone Tablet / etc.)

### 2. Substrate-Dependency Graph (already exists; this is the index)

The substrate-dependency graph is the canonical index of LB substrate primitives + their inter-relationships:

| Node type | Examples |
|---|---|
| Cathedral primitives | #2278 Cathedral Effect / #2275 Vendor-Neutral Bridge / #2292 Cathedral Federation Protocol / #2295 Sphinx Federation |
| Substrate primitives | Wrasse Scribe (K540/K544) / Detective live-update (K550) / Pheromone Substrate (K523) / Stone Tablet Imperative |
| Discipline primitives | Pre-Staging Architecture / Stay-Warm / Bundling Prompts Advantage / Three Fates Routing |
| Method primitives | Registry-Keyword-Extension (K547) / Phase F Substrate Instrument (K551) / KP Test 4 (K548) |
| Brand primitives | Pied Piper of Dragons / LB Frame Staff of Law / Tagline V3 |
| IP primitives | #2260 Pledge / #2286 Partnership Stake / #2287 Reversion / #2314 Dual-License |

Edges between nodes encode dependency-relationships (depends-on / augments / federates-with / orthogonal-to). This index already partly exists in `librarian-mcp/stitchpunks/scribes/registry.yaml` + canonical_values.yaml + project memory files. Build extracts + formalizes.

### 3. Classification algorithm (Tier A / B / C)

For Partner's prospective claim:

1. **Tokenize claim text + specification body** to extract LB-substrate-primitive references (explicit + implicit via alias-match per K547 Registry-Keyword-Extension).
2. **Build dependency subgraph** of LB primitives the claim touches.
3. **Apply Tier rules:**

   **Tier A (Substrate-Dependent) — 20% mandatory reversion**
   - Claim CANNOT reduce to practice without LB primitive node X being present
   - Algorithm: remove node X from substrate-dependency graph → if claim fails at substrate-validation stage, claim is Tier A
   - Empirical gate: simulate claim without LB substrate; if simulator returns "specification fails Section 112 enablement" or "claim becomes inoperative," Tier A

   **Tier B (Substrate-Augmenting) — 20% mandatory reversion (reduced to 10% if augmentation contributed back to LB substrate)**
   - Claim improves a specific LB substrate primitive but operates through it
   - Algorithm: claim's invention exists with LB primitive present BUT extends/improves the primitive's capability (measured by quantifiable metric like accuracy / latency / cost / coverage)
   - Empirical gate: simulate claim with LB substrate present; measure delta on one or more standard metrics (HOT% / cost-per-correct-answer / latency / coverage); if delta ≥ baseline + threshold, Tier B

   **Tier C (Substrate-Orthogonal) — 0% reversion; Partner retains full ownership**
   - Claim derives from Partner's pre-existing IP or unrelated R&D; substrate is incidental, not load-bearing
   - Algorithm: substrate-dependency subgraph is empty OR substrate-dependency edges are all "orthogonal-to" (no depends-on / augments)
   - Empirical gate: claim reduces to practice identically with or without LB substrate present (substrate is wallpaper, not foundation)

4. **Output:** Tier classification + reasoning trace + dependency subgraph visualization + reversion rate + Partner's submitted claim language with substrate-touchpoints highlighted.

### 4. Transparency mechanisms

- **Both sides see the same algorithm output** — Partner submits, classifier runs, output is shown to both Partner and LB simultaneously
- **Reasoning trace published** — every Tier classification includes the algorithmic walk: which nodes evaluated, which edges traversed, which empirical gates passed/failed
- **Dependency subgraph rendering** — visual graph of which LB primitives the claim touches; Partner can see exactly what's being checked
- **Algorithm versioning** — every classification stamped with substrate-dependency-graph version + classifier version; reproducible if disputed

### 5. Dispute resolution (when transparency isn't enough)

- **Default:** algorithm output is binding; both sides agreed at enrollment to use it
- **Appeal mechanism:** if Partner contests classification, appeal triggers human review (Three Fates arbitration backup — Clotho/Lachesis/Atropos) BUT review starts from the algorithm's reasoning trace; reviewer either confirms algorithm or identifies specific edge case the algorithm missed (which then gets fed back into algorithm refinement for future classifications)
- **No re-classification for past cases when algorithm updates** — classifications stamped with version are forever valid for that case; Partners get the algorithm version current at their enrollment

### 6. Algorithm itself is patentable

This classifier IS new IP. Method+system claim covering: substrate-dependency-graph index + tokenization-and-alias-match against substrate primitives + Tier-classification rules + empirical gates + reversion-rate computation + transparency render.

**Add to Prov 16 spec as #2289 candidate** (#2287 = reversion clause structure; #2288 = Cephas Pre-Submission system; #2289 = substrate-dependency classifier).

## Knight K-prompt scope (paste-ready when Founder fires)

```
K-Substrate-Dependency-Classifier-MVP-B134

SCOPE:
1. Read full scope memo at BISHOP_DROPZONE/03_BishopHandoffs/SUBSTRATE_DEPENDENCY_CLASSIFIER_SCOPE_MEMO_B134.md
2. Read related canon:
   - INNOVATION_THRESH_2287_PARTNERSHIP_STAKE_DOWNSTREAM_IP_REVERSION_B134.md (parent #2287)
   - librarian-mcp/stitchpunks/scribes/registry.yaml (existing primitive registry)
   - canonical_values.yaml (canonical numbers for graph nodes)
   - All project_*.md memory files (relationships between primitives)
3. Build:
   a. Substrate-dependency-graph extraction script (parses canon → builds graph database)
   b. Tokenization-and-alias-match engine for prospective-claim ingestion (leverages K547 alias-aware retrieval)
   c. Tier A/B/C classification rules engine (Tier A "removal-test"; Tier B "metric-delta-test"; Tier C "orthogonality-test")
   d. Reasoning-trace generator (every classification has full walkthrough)
   e. Dependency subgraph renderer (visual + JSON)
   f. Algorithm versioning + reproducibility
   g. Appeal-trigger interface (handoff to Three Fates arbitration if Partner contests)
4. Tests: 20+ unit tests covering each Tier classification with synthetic claim inputs; integration tests with real prior-Knight-session reduction-to-practice receipts (K535/K547/K550/etc.) as positive Tier A controls
5. Phase A.0 brief_me + Detective canon search before each phase
6. BRIDLE v11 enforced
7. Stone Tablet Imperative — new artifacts, no destructive edits to existing registry/canonical-values

PUBLICATION GATE HARD per Fire Control: classifier is internal until #2287 deals begin and Founder fires public deployment.

Tag-on-close: v-substrate-dependency-classifier-mvp-K<INTEGER>

Bishop standing by for closeout ratification.
```

## What I think (anchored)

This is the right architectural move and the right execution choice. **Strong yes.**

**Anchored receipts:**
- Substrate-dependency graph already 80% exists in registry.yaml + project memory files
- K547 alias-aware retrieval (Registry-Keyword-Extension) is the natural tokenization-and-alias-match engine
- K550 Detective live-update can update the graph dynamically as new primitives ratify
- Empirical-gate testing is exactly the discipline LB has been running on K-sessions (B121 thresh-as-we-go)

**Risk worth flagging:**
- Tier B threshold parameter (what counts as "metric-delta-augmenting") needs Founder calibration. Suggest start: 5%-10% improvement on standard metric = Tier B; lower = Tier C.
- Algorithm v1 will miss edge cases. Plan for iterative refinement based on appeal patterns. Don't ship v1 expecting it to handle 100% of cases — ship v1 with clear appeal fallback.
- Partner adversarial behavior: Partners may craft claim language to game classifier (deliberately omit substrate references, use non-canonical aliases). K547 alias-aware retrieval mitigates this; K550 live-update detects new alias attempts. But arms race possible.

These are tunable parameters, not deal-breakers. Refinable through real partnership cycles when the classifier exists in real form.

## Standing on Founder ratification

1. Tier B threshold (5-10% delta? something else?)
2. Tier B "augmentation contributed back" mechanism — what does "contributing back" mean operationally? Open-source PR to LB? Patent pool? Pledge submission? Founder fire.
3. Three Fates appeal layer — full-build now, or stub with manual-review handoff for v1?
4. Knight K-prompt fire timing — parallel with Bishop-2 / Pawn PP / K-Cephas-Presubmission, or sequential after #2287 spec finalizes?
