# Knight Marathon 14 — Findings #3, #4, #5 Fix (M0 Overflow · Null Response · Contested Resolution)

**Marathon ID:** K-MARATHON-14
**BP:** BP090
**Date:** 2026-06-22
**Status:** STAGED · sequences AFTER Marathon 13 completes
**Founder ratify:** explicit — "I want to fix 3. 4. and 5." (2026-06-22 morning Central)
**Predecessor:** K-MARATHON-13 (STAGED · pending son's gemma4:12b WAN install)
**Files touched:**
- `tools/mesh-validation/validate-relay.mjs` — orchestrator (Blocks 1, 3)
- `src/main/index.ts` startRelayRoutePoll — peer-side (Block 2)

---

## Architectural context — what M12 surfaced

Marathon 12 ran heterogeneous fleet (gemma4:12b LAN × qwen2.5:7b WAN — Lamborghini-Corolla contamination). Its ensemble number does not count. BUT it exposed three architectural bugs that persist regardless of fleet composition:

- **Finding #3:** M0 (cb4ef450) escalation-overflow — 65 answers at 35.4% accuracy because M0 simultaneously handles orchestrator process, worker Plow Loop, AND escalation routing. Escalation routes preferentially land back on M0 → single-machine cognitive overload.
- **Finding #4:** null-response failure mode — some peers return `answer: null` in `answer_json` after escalation. Council didn't converge AND didn't decline gracefully. Orchestrator currently passes null through to `ensembleVote` which treats it as no-vote but emits no diagnostic trail.
- **Finding #5:** 3 contested questions even after escalation — plurality vote across timed-out partials ∪ escalation completions returned CONTESTED (≥2 answers tied OR no plurality ≥ 50%). No resolution tier existed; questions were marked contested with no fallback attempt.

---

## Dependencies — MUST resolve before Knight fires any block

- **D1:** Marathon 13 must complete and its receipt must be read before Block 5 decision.
- **D2:** Founder budget-ratify required IF Block 3 Tier 2 flagship fallback is to be enabled (DISABLED by default per T3 gate).
- **D3:** M0 peer_id `cb4ef450` confirmed as the orchestrator machine (LAN `192.168.86.*`); verify still true at fire time via peer_presence query.

---

## Block 1 — Fix Finding #3: M0 escalation-overflow (60-90 min)

**File:** `tools/mesh-validation/validate-relay.mjs`

**Root cause (lines 858-895):** escalation dispatch in the ANDON block dispatches to `peerPool` (all peers including M0). Because M0 is also the orchestrator process, it receives escalation routes while simultaneously tracking poll loops for all original routes. Under high question load, M0 handles: orchestrator polling loop + peer worker Plow Loop (12 iterations × 3 judges × ~30s/judge = up to 1080s) + escalation routing inserts. Result: M0 response latency balloons; its escalation answers arrive late or not at all.

**Implement Option A — round-robin escalation routing to NON-M0 peers preferentially.**

In the ANDON escalation block (around line 860), replace `peerPool.map(p => ...)` with a filtered escalation pool:

```js
// Block 1 fix: M0-aware escalation pool
// m0PeerId resolved once before the question loop from peer_presence LAN IP pattern
// (192.168.86.* peers; identify M0 as the local peer or the one matching the orchestrator process IP)
const escPeerPool = peerPool.filter(p => p.peer_id !== m0PeerId);
// Fallback: if filtering removes ALL peers (edge case — only M0 available), allow M0
const escTargets = escPeerPool.length > 0 ? escPeerPool : peerPool;
```

Then replace `peerPool.map(p => insertRoute(...))` in the escalation insert block with `escTargets.map(p => insertRoute(...))`.

**Identify m0PeerId:** after the `peers` array is loaded (around line 534), add:

```js
// Block 1: Identify M0 as the peer whose lan_addresses matches the orchestrator LAN IP
// M0 confirmed as cb4ef450 (LAN 192.168.86.*); also detect dynamically in case of IP change
const orchestratorLanPrefix = '192.168.86.';
const m0Peer = peers.find(p => p.lan_addresses && p.lan_addresses.includes(orchestratorLanPrefix) && !sonPeerId);
// If dynamic detection fails, fall back to known prefix
const m0PeerId = m0Peer?.peer_id ?? 'cb4ef450';
console.log(`M0 orchestrator peer identified: ${m0PeerId.slice(0,8)} (excluded from escalation pool)`);
```

Note: `sonPeerId` detection already runs before this block (lines 572-581); place M0 detection immediately after sonPeerId is resolved.

**Add receipt logging field** in the per-question result push (around line 1013):

```js
m0_escalation_load_distribution: {
  m0_peer_id: m0PeerId.slice(0, 8),
  m0_excluded_from_escalation: escPeerPool.length > 0,
  escalation_target_peer_ids: escTargets.map(p => p.peer_id.slice(0, 8)),
},
```

**T1 gate:** Run 1Q math smoke after this patch. Verify escalation routes in `relay_route_replies` do NOT include M0 route_id (or if included, M0 is last-resort only). Verify non-M0 peers' answers arrive before deadline.

---

## Block 2 — Fix Finding #4: null-response protocol gap (90-120 min)

### Part A — Peer-side patch (`src/main/index.ts` startRelayRoutePoll)

**Current behavior (lines 5576-5591):** peer emits `answer_json: { answer: null, ... }` when Plow Loop produces no `letterVotes` (line 5539 `break` on empty) OR when single-shot Ollama returns empty (line 5571 `ollamaData?.response ?? null`).

**Patch:** replace the `answer_json` write block (lines 5576-5591) with structured ABSTAIN emission:

```typescript
// Block 2 fix: structured ABSTAIN when answer is null
const emitAnswer = answer !== null ? answer : null;
let abstainReason: string | null = null;
if (answer === null) {
  if (plowMaxIter > 0 && plowIterations >= plowMaxIter) {
    abstainReason = 'max_iterations_reached';
  } else if (plowMaxIter > 0) {
    abstainReason = 'council_did_not_converge';
  } else {
    abstainReason = 'model_empty_response';
  }
}

await fetch(`${supabaseUrl}/rest/v1/relay_route_replies`, {
  method: 'POST',
  headers: { ...headers, 'Prefer': 'return=minimal' },
  body: JSON.stringify({
    route_id: route.id,
    peer_id: peerId,
    answer_json: abstainReason !== null ? {
      answer: 'ABSTAIN',
      abstain_reason: abstainReason,
      correct: false,
      escalation_eligible: true,
      plow_loop_iterations: plowIterations,
      council_variance: councilVariance,
      approaching_timeout_signal_sent: approachingTimeoutSignalSent,
      is_star_chamber: isStarChamber,
      legacy_null: null,   // T2 backwards-compat marker for old client readers
    } : {
      answer: emitAnswer,
      plow_loop_iterations: plowIterations,
      council_variance: councilVariance,
      approaching_timeout_signal_sent: approachingTimeoutSignalSent,
      is_star_chamber: isStarChamber,
    },
    processing_ms: processingMs,
  }),
});
```

### Part B — Orchestrator-side patch (`validate-relay.mjs`)

**In the reply parsing block (around lines 944-970):** where `rawText` is extracted from `answer_json`, add ABSTAIN detection:

```js
// Block 2: detect structured ABSTAIN response
const aj3 = typeof reply.answer_json === 'object' && reply.answer_json !== null
  ? reply.answer_json : {};
const isAbstain = aj3.answer === 'ABSTAIN';
const isLegacyNull = !isAbstain && (aj3.answer === null || aj3.answer === undefined) && !rawText;

if (isAbstain || isLegacyNull) {
  // ABSTAIN votes count as no-vote — do NOT degrade plurality calculation
  peerAnswers[peerId] = null;
  const abstainTag = isAbstain
    ? `ABSTAIN(${aj3.abstain_reason ?? 'unknown'})`
    : 'ABSTAIN(null_protocol_violation)';
  console.log(`  [${peerId.slice(0,8)}] ${abstainTag} — escalation_eligible=${aj3.escalation_eligible ?? false}`);
  // If escalation_eligible=true and escalation hasn't fired yet, treat as high-variance for escalation trigger
  if ((aj3.escalation_eligible === true || isLegacyNull) && !escalationFired) {
    // Force variance to 100 so ANDON threshold is crossed at next poll cycle
    // (escalation trigger reads variance; injecting 100 here ensures it fires)
    _abstainForcedEscalation = true;
  }
  continue;
}
```

Declare `let _abstainForcedEscalation = false;` before the reply-parse block. In the escalation check (around line 841), add:

```js
// Block 2: ABSTAIN-forced escalation
if (_abstainForcedEscalation) variancePct = 100;
```

**T2 gate (backwards-compat):** old client peers that emit `answer_json: { answer: null }` (pre-Block-2 firmware) are caught by the `isLegacyNull` path. They are treated identically to ABSTAIN with `reason: null_protocol_violation`. No client version check required.

---

## Block 3 — Fix Finding #5: contested-question residual (90-150 min)

**File:** `tools/mesh-validation/validate-relay.mjs`

**Current behavior (lines 988-1009):** `ensembleVote` returns `{ answer: null, contested: true }` when ≥2 answers tie. The orchestrator logs `CONTESTED` and proceeds. No fallback exists.

**Patch:** after the main poll loop exits (after line 1038), introduce a three-tier fallback for contested questions. Replace the contested branch in the result-recording block:

```js
// Block 3: Contested resolution tiers
let contestedResolutionTier = null;
let tier1FallbackFired = false;
let tier2FallbackFired = false;

if (contested) {
  contestedResolutionTier = 'pending';

  // ── Tier 1: extended council — dispatch qwen2.5:7b on M0 as tiebreaker ─────
  // qwen2.5:7b runs alongside gemma4:12b on M0 as a 5th model-class judge
  // Dispatch a single escalation route targeted ONLY at M0 with is_tiebreaker=true
  try {
    const tier1Route = await insertRoute(SUPABASE_URL, SERVICE_KEY, {
      target_peer_id: m0PeerId,
      hex_frame: Buffer.from(prompt, 'utf8').toString('base64'),
      payload_json: {
        prompt,
        question_id: `${questionId}-tier1`,
        correct_answer_letter: correctLetter,
        source_id: q.source_id,
        wire_format: wire,
        domain: q.domain,
        session_id: sessionId,
        plow_max_iterations: 0,           // single-shot tiebreaker — no full Plow Loop
        allotted_timeout_ms: Math.min(120000, qDeadline - Date.now()),
        is_tiebreaker: true,
        tiebreaker_model: 'qwen2.5:7b',   // peer-side: use qwen2.5:7b not gemma4:12b
        priming_context: {
          contested_answers: Object.values(peerAnswers).filter(a => a !== null),
          per_peer_breakdown: peerAnswers,
        },
      },
      status: 'pending',
      session_id: sessionId,
      ttl_seconds: 180,
    });
    tier1FallbackFired = true;
    const tier1RepliesMap = await pollReplies(SUPABASE_URL, SUPABASE_ANON_KEY, [tier1Route.id], Math.min(120000, qDeadline - Date.now()));
    const tier1Reply = tier1RepliesMap[tier1Route.id];
    if (tier1Reply) {
      let tier1Raw = null;
      if (tier1Reply.hex_reply) { try { tier1Raw = Buffer.from(tier1Reply.hex_reply, 'base64').toString('utf8'); } catch { tier1Raw = tier1Reply.hex_reply; } }
      if (!tier1Raw && tier1Reply.answer_json) {
        const aj4 = tier1Reply.answer_json;
        tier1Raw = typeof aj4 === 'string' ? aj4 : (aj4.response ?? aj4.answer ?? JSON.stringify(aj4));
      }
      const tier1Letter = extractLetter(tier1Raw, q.options.length);
      if (tier1Letter !== null && tier1Letter !== 'ABSTAIN') {
        // Tier 1 resolved: use tiebreaker answer
        peerAnswers[`${m0PeerId}-tier1`] = tier1Letter;
        const { answer: resolvedAnswer, contested: stillContested } = ensembleVote(peerAnswers);
        if (!stillContested && resolvedAnswer !== null) {
          // Re-run final answer logic with resolved answer
          contestedResolutionTier = 'tier_1';
          console.log(`  [CONTESTED → TIER1 RESOLVED] tiebreaker=${tier1Letter} qwen2.5:7b`);
          // Update ensemble tracking
          const tier1Correct = resolvedAnswer === correctLetter;
          if (tier1Correct) ensembleCorrect++;
          results.push({
            ...results.pop(),   // replace the push below with corrected record
            ensemble: { answer: resolvedAnswer, contested: false, correct: tier1Correct },
            contested_resolution_tier: contestedResolutionTier,
            tier_1_fallback_fired: tier1FallbackFired,
            tier_2_fallback_fired: tier2FallbackFired,
          });
          console.log(`  Ensemble (Tier1 resolved): ${resolvedAnswer} [${mark(tier1Correct)}]`);
          console.log('');
          continue;   // skip to next question — resolution complete
        }
      }
    }
  } catch (tier1Err) {
    console.warn(`  [TIER1] tiebreaker dispatch failed: ${tier1Err.message}`);
  }

  // ── Tier 2: flagship API call — DISABLED unless Founder explicit budget-ratify ──
  // T3 gate: tier2Enabled MUST be false by default.
  // Enable only by passing --tier2-flagship=true AND with Founder ratify in receipt header.
  const tier2Enabled = args.tier2Flagship === true;   // always false unless CLI flag added + T3 ratify
  if (tier2Enabled) {
    tier2FallbackFired = true;
    // Tier 2 implementation: call Anthropic claude-3-5-haiku API as definitive resolver.
    // Deferred until Founder explicit budget-ratify. Placeholder logged only.
    console.log(`  [TIER2] flagship fallback: NOT IMPLEMENTED YET — requires Founder budget-ratify`);
  }

  // ── Tier 3: mark CONTESTED with full per-peer breakdown ─────────────────────
  // Default when Tier 1 didn't resolve and Tier 2 is disabled.
  contestedResolutionTier = 'tier_3_contested';
  console.log(`  [CONTESTED → TIER3] no resolution — recording with full per-peer breakdown`);
}
```

Add `tier2Flagship: false` to `parseArgs()` parsed defaults. Add `else if (key === 'tier2-flagship') parsed.tier2Flagship = val === 'true';` in the arg loop.

Add receipt fields to result push:

```js
contested_resolution_tier: contestedResolutionTier,
tier_1_fallback_fired: tier1FallbackFired,
tier_2_fallback_fired: tier2FallbackFired,
```

**Peer-side tiebreaker routing** (`src/main/index.ts`): In `startRelayRoutePoll`, after the `isStarChamber` flag read (around line 5455), add:

```typescript
const isTiebreaker: boolean = payload.is_tiebreaker === true;
const tiebreakerModel: string = typeof payload.tiebreaker_model === 'string'
  ? (payload.tiebreaker_model as string) : 'qwen2.5:7b';
```

In the single-shot path (the `else` branch, around line 5563), add tiebreaker model override:

```typescript
const model = isTiebreaker ? tiebreakerModel : 'gemma4:12b';
```

---

## Block 4 — Smoke tests (15-30 min)

Run four targeted smokes in sequence. All must pass before any 42Q re-fire.

### Smoke 1: biology (regression — normal flow unaffected)
```
node validate-relay.mjs --questions=1 --mode=smoke --routing=round-robin --andon-escalate=none --wire=hex-mcode --plow=mesh-12-blade --flagship-tier=gemma --per-domain-timeout=tools/mesh-validation/per_domain_timeout_config.json --question-bank=tools/mesh-validation/smoke_biology_1q.json
```
Pass criteria: receipt has no `m0_escalation_load_distribution` (escalation not fired), no ABSTAIN, no contested. Normal `council_unanimous` or `council_majority` path.

### Smoke 2: math (verify escalation fires + M0 overflow protection)
```
node validate-relay.mjs --questions=1 --mode=smoke --routing=round-robin --andon-escalate=star-chamber --andon-threshold=15 --wire=hex-mcode --plow=mesh-12-blade --flagship-tier=gemma --per-domain-timeout=tools/mesh-validation/per_domain_timeout_config.json --question-bank=tools/mesh-validation/smoke_math_1q.json
```
Pass criteria: receipt has `escalation_fired: true`, `m0_escalation_load_distribution.m0_excluded_from_escalation: true`, escalation targets are NON-M0 peers only.

### Smoke 3: deliberate-ambiguous (verify ABSTAIN path)
Create `tools/mesh-validation/smoke_ambiguous_1q.json` — a question whose answer is highly contested across local models (select a known M12 null-response source_id if available from receipt JSON, otherwise craft one with no clear plurality). Inject with `--andon-escalate=none --plow=none` to force single-shot path where model returns empty.
```
node validate-relay.mjs --questions=1 --mode=smoke --routing=round-robin --andon-escalate=none --wire=json-legacy --plow=none --flagship-tier=gemma --question-bank=tools/mesh-validation/smoke_ambiguous_1q.json
```
Pass criteria: receipt has at least one peer with `answer_json.answer: "ABSTAIN"` + `abstain_reason` field populated. Orchestrator logs `ABSTAIN(model_empty_response)` or similar. `_abstainForcedEscalation` logic visible in console output.

### Smoke 4: deliberate-contested (verify Tier 1 fallback)
Use a question known to split 2/2 across peers. Can use a law or philosophy question from per-domain dataset where M12 showed 50/50 split.
```
node validate-relay.mjs --questions=1 --mode=smoke --routing=round-robin --andon-escalate=star-chamber --andon-threshold=15 --wire=hex-mcode --plow=mesh-12-blade --flagship-tier=gemma --per-domain-timeout=tools/mesh-validation/per_domain_timeout_config.json --question-bank=tools/mesh-validation/smoke_contested_1q.json
```
Pass criteria: receipt has `contested_resolution_tier: "tier_1"`, `tier_1_fallback_fired: true`, `tier_2_fallback_fired: false`. Final ensemble answer is NOT null/contested.

**T4 gate: ALL FOUR smokes must emit expected fields before Block 5 may proceed. Any failure = diagnose + fix before moving to 42Q.**

---

## Block 5 — 42Q re-fire (only if M13 receipt indicates need) (90-180 min if fired)

**DEPENDENCY:** Marathon 13 must complete first. Read its receipt before making the dispatch decision.

**Decision logic:**
- If M13 ensemble ≥ 85%: Block 5 MAY be skipped — M13 homogeneous fleet result is the canonical measurement. Findings #3/#4/#5 fixes are still deployed (so they're live for future runs), but a full 42Q re-fire to update the score may be unnecessary. Founder ratify call required.
- If M13 ensemble < 85%: Block 5 FIRES — deploy M14 fixes + run full 42Q to see if architectural fixes move the needle.

**If Block 5 fires:**
```
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
node validate-relay.mjs --questions=42 --mode=smoke --routing=round-robin --andon-escalate=star-chamber --andon-threshold=15 --wire=hex-mcode --plow=mesh-12-blade --flagship-tier=gemma --trial-id=TRIAL_02_PREVIEW_42Q_M14_FIXES --pass=A --per-domain-timeout=tools/mesh-validation/per_domain_timeout_config.json
```

Receipt seals at:
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_M14_FIXES\TRIAL_02_PREVIEW_42Q_M14_FIXES_COMPLETE.md`

Comparison receipt (all four marathons):
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\COMPARISON_M10_M12_M13_M14_BP090.md`

Comparison table columns: M10 · M12 · M13 · M14 with rows: architecture, fleet, timeout, escalation, ensemble accuracy, escalations fired, contested count, M0 overflow incidents, null-response count.

---

## Truth-Always gates

| Gate | Condition | Action if fails |
|---|---|---|
| T1 | Block 1 patches do NOT degrade non-escalation routing (Smoke 1 biology passes cleanly) | Diagnose M0 identification logic; verify escPeerPool filter isn't removing too many peers |
| T2 | Block 2 ABSTAIN protocol is backwards-compatible — old `{answer: null}` clients caught by `isLegacyNull` path without error | Check peer firmware version; add version check if needed |
| T3 | Block 3 Tier 2 flagship fallback DISABLED unless `--tier2-flagship=true` AND Founder explicit budget-ratify | HARD STOP — do not enable without ratify; log BLOCKED in receipt |
| T4 | All 4 Block 4 smokes emit expected new receipt fields | Fix failing smoke before 42Q re-fire |
| T5 | Block 5 only fires after M13 receipt read and decision made | HARD STOP — do not fire 42Q cold |

---

## Wall-clock estimates

| Block | Estimate |
|---|---|
| 1 M0 overflow fix | 60-90 min |
| 2 Null-response ABSTAIN protocol | 90-120 min |
| 3 Contested Tier 1/2/3 resolution | 90-150 min |
| 4 Four smokes | 15-30 min |
| 5 42Q re-fire (if fired) | 90-180 min |
| **Total** | **4-8 hrs depending on Block 5** |

---

## Commit hygiene

Each block gets its own commit. Message format:
```
[M14 Block N] <description> · BP090 · Founder-ratify 2026-06-22 morning Central
```
Reference `canon_fix_as_we_go_build_for_the_long_haul_bp053` in each commit body.

---

## Return to Bishop

Brief must include:
- Block 1-3 commit hashes
- Smoke 1-4 pass/fail summary + key receipt field values
- Block 5 decision (fired or skipped) + rationale (M13 ensemble %)
- If Block 5 fired: M14 ensemble accuracy + delta vs M13 + contested-resolved count
- Comparison receipt filepath
- Truth-Always disclosure: M14 result note (homogeneous vs heterogeneous fleet)
- Any Tier 2 flagship status (should be DISABLED BLOCKED unless ratified)
