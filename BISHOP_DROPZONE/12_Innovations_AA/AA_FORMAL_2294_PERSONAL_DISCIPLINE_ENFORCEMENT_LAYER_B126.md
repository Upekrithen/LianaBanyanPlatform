---
name: Personal Discipline Enforcement Layer
description: A client-side architectural primitive that intercepts user interactions with third-party AI systems and structurally blocks them unless a configurable substrate-consultation rule has been satisfied within a freshness window, enforced at a layer the AI itself does not control.
type: aa_formal
innovation_id: "2294"
ratification_session: B126
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - personal discipline enforcement layer
  - client side substrate consultation gating
  - augur rule freshness window enforcement
  - user defined interaction blocker
  - substrate consultation required gate
  - ai interaction harness enforcement
  - aa formal 2294
  - bishop librarian gate hook
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---
# A&A Formal #2294 — Personal Discipline Enforcement Layer (Client-Side Substrate Consultation Gating)

**Filed:** B126 (2026-04-25, priority date 2026-04-26 for Prov 14 amendment)
**Class:** Cooperative-Defensive-Patent-Pledge-eligible architectural primitive
**Status:** DRAFT — Founder rewrite expected; counsel review prior to formal filing
**Cluster:** AI substrate / Cathedral Effect / member tooling / vendor-resilience layer
**Companion entries:** #2275 (AI Companion Vendor-Neutral Bridge), #2278 (Cathedral Effect Resonance), #2290 (The Loom), #2293 (Tiered Vendor Adoption Framework)

---

## The architectural primitive

A **Personal Discipline Enforcement Layer** is a client-side architectural primitive that intercepts a user's interactions with a third-party AI (or with the user's own AI orchestration tooling) and **structurally blocks** those interactions unless a configurable substrate-consultation rule has been satisfied within a configurable freshness window.

The user defines:
1. **Triggers** — patterns over the interaction context (file path being written, query keywords, target AI vendor, request domain) that activate the rule
2. **Required consultations** — one or more substrate-query operations that must have completed (e.g., a Cathedral lookup, a contracts-substrate query, an MCP-tool call to a personal knowledge store)
3. **Freshness window** — maximum age of the most-recent satisfying consultation, beyond which the rule is treated as unsatisfied
4. **Failure action** — what to do when the rule is unsatisfied at trigger time: block (refuse the interaction), warn (allow with surfaced caution), enrich (auto-perform the consultation in-line), or substitute (redirect to a different AI / surface a different response)

The primitive is enforced at a layer the AI itself does not control: a browser-extension content script for vendor web UIs, a CLI hook or settings-file hook for local AI tooling, a daemon middleware for hosted AI orchestration, an IDE-extension pre-commit gate for AI code assistants. The AI's *advice* about whether it should consult is replaced with the *harness's enforcement* that it must.

---

## What the prior art does NOT cover

- **Vendor-supplied "guardrails" / "policies"** are vendor-defined, vendor-enforced, vendor-modifiable. The user does not write them, cannot inspect them, cannot guarantee their continuity, and cannot port them across vendors. This primitive inverts that: the user writes the rules, the user owns enforcement, the rules survive vendor changes (because they live client-side, in user-controlled infrastructure).
- **Retrieval-augmented generation (RAG)** automatically performs retrieval before the model answers, but the model still controls whether to use the retrieved context. RAG is *advisory* in practice. This primitive is *coercive*: the AI's answer is blocked at the harness layer if the retrieval rule is unsatisfied, not merely augmented.
- **AI-side "tool use" patterns** (where the AI decides to call a tool) leave the consultation decision to the AI. The AI may decide a query doesn't warrant the tool. The primitive removes that decision from the AI; the harness decides based on user-defined trigger patterns.
- **System-prompt instructions** ("always consult X before answering") are advisory and routinely bypassed when the AI judges the prompt unrelated, when context window pressure forces dropping, or when adversarial inputs override. The primitive bypasses the AI entirely; enforcement is in the call-router, not in the model's prompt-following discretion.
- **Editor pre-commit hooks for code linting** are in the same architectural family but operate on file content, not on AI-interaction context. The primitive generalizes the pre-commit pattern from "code about to be committed" to "AI interaction about to be sent."

---

## Reduction-to-practice anchors (three live deployments, B126)

### Anchor 1 — Bishop hook system (this session, 2026-04-26)

User: AI Tuner / LB Founder, operating Claude Code with Bishop persona (Claude Opus 4.7).

Trigger: any `Write` or `Edit` tool call targeting a path matching one of five gated artifact-class patterns:
- `BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_*.md` (Knight prompt files)
- `BISHOP_DROPZONE/00_FOUNDER_REVIEW/*.md` (Founder-facing scaffolds)
- `BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_*.md` (session closeouts)
- `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_*.md` (A&A draft files)
- `*/memory/*.md` (auto-memory files)

Required consultation: one of `mcp__librarian__brief_me`, `mcp__librarian__consult_scribes`, or `mcp__librarian__run_session_start` (LB's substrate-query tools).

Freshness window: 600 seconds (10 minutes).

Failure action: block (PreToolUse hook exits 2 with stderr message, harness refuses tool call).

Implementation: `~/.claude/hooks/bishop_librarian_gate.py` (Python script reading tool_input JSON from stdin, normalizing path slashes, regex-matching against gated patterns, comparing state-file timestamp against staleness window) + paired PostToolUse hook in `~/.claude/settings.json` that writes `~/.claude/state/bishop_last_librarian_consult.ts` on every satisfying consult.

Empirical: installed B126, hook confirmed firing in same session via state-file timestamp update, prevented next-call drift in real-time. Failure case it patches: K512 (LB Frame Public Web Demo) prompt drafted without first-pass Librarian consult; second-pass consult caught three bugs (wrong CTA URL, missing Privacy Bylaw framing, missing WildFire-Tour-mode framing); hook makes the same failure architecturally impossible for future sessions.

### Anchor 2 — LB Test Frame extension (K502 build + K508 patch, B124)

User: any LB member with a third-party AI account (Claude.ai, ChatGPT, Gemini, Perplexity, Copilot).

Trigger: user submits a query in the AI vendor's web UI (browser extension content-script intercepts).

Required consultation: substrate enrichment via local daemon at `http://127.0.0.1:7712/enrich` (LB Cathedral substrate retrieval).

Freshness window: per-query (substrate fetched live for each query).

Failure action: enrich (default — substrate prepended to user query before send) OR fail-loud overlay (if daemon unavailable, user sees explicit "substrate unavailable, sending un-grounded query" notice).

Implementation: `lb-test-frame/extension/` (MV3 Chrome extension) with content-script injection on five vendor URL patterns; K508 added MAIN-world script-tag injection for Perplexity (XHR-aware fetch override).

Empirical: shipped K502, K508 patched Perplexity-specific Layer 1b case, downloadable via Chrome Web Store (submission pending) or unpacked sideload.

### Anchor 3 — Helm PWA + daemon /pawn endpoint (K509 + K510, B125)

User: any user with a browser; no extension required.

Trigger: user submits a query through the Helm PWA chat UI.

Required consultation: substrate enrichment via daemon `/enrich` then API call to Perplexity (or other vendor) via daemon-mediated `/pawn` endpoint.

Freshness window: per-query.

Failure action: server-side enrich (substrate is server-fetched, never reaches the user's browser unencrypted; if substrate retrieval fails, error message replaces the AI response).

Implementation: `librarian-mcp-helm-pwa/daemon_wrapper.py` (Python daemon with `/pawn` endpoint) + Helm PWA chat UI; K510 added turnkey Windows launcher (`Start-PawnPortal.ps1`).

Empirical: K509 shipped, K510 verified via C.1/C.2/C.3/C.4 pass at commit `99cd12f` tag `v-pawn-portal-turnkey-K510`.

---

## Structural claims (8 proposed; counsel-rewriteable)

**Claim 1 (independent)** — A method for enforcing substrate consultation in human-AI interactions, comprising: (a) defining one or more triggers over interaction context; (b) defining one or more required substrate-query operations associated with each trigger; (c) defining a freshness window for each required operation; (d) maintaining state recording the most-recent satisfying operation per trigger-rule; (e) intercepting interactions at a layer external to the AI model, and structurally blocking the interaction when the trigger pattern matches AND the freshness state for the associated required operation is unsatisfied.

**Claim 2 (dependent on 1)** — wherein triggers are defined over file-path patterns being written, AI-vendor URL patterns being interacted with, query-keyword patterns, request-domain patterns, or any composition thereof.

**Claim 3 (dependent on 1)** — wherein the required substrate-query operations are user-defined and reference user-controlled substrate stores (personal knowledge bases, organizational document repositories, contract archives, project memories, code repositories, or other named substrate sources) — distinct from vendor-supplied or model-internal stores.

**Claim 4 (dependent on 1)** — wherein the failure action when the rule is unsatisfied is configurable to one of: block (interaction refused), warn (interaction allowed with caution surfaced to user), enrich (consultation auto-performed in-line and result prepended to interaction), or substitute (interaction redirected to alternative AI or alternative response surface).

**Claim 5 (dependent on 1)** — wherein the freshness window is configurable per rule and may be expressed in time units, in number-of-interactions, in session boundaries, or in any composition.

**Claim 6 (dependent on 1)** — wherein enforcement is implemented at one of: a browser-extension content script intercepting AI-vendor web UI submissions; a CLI tool hook in user's shell or AI-orchestration harness; a daemon middleware between user's interface and AI-vendor API; an IDE-extension pre-commit gate for AI-assisted code edits; a desktop application interceptor for local AI tools.

**Claim 7 (dependent on 1)** — wherein the state recording the most-recent satisfying operation is held in user-controlled storage (local filesystem, user-controlled cloud account, user-controlled key-value store) — never in vendor-controlled storage — preserving the user's ability to inspect, modify, port, and continue the rule across vendor changes.

**Claim 8 (dependent on 1)** — wherein the user defines, owns, modifies, and ports the rules without dependence on the AI vendor's policies, guardrails, system-prompts, tool-use decisions, or model behavior — and wherein the rules are portable across AI vendors via a common rule-definition format.

---

## Cooperative Defensive Patent Pledge applicability

This primitive is filed under the existing #2260 Cooperative Defensive Patent Pledge framework. Every nonprofit, cooperative, and academic institution gets the architecture **free, forever**, on nothing more than an IRS-verified EIN. Members of LB get a turnkey rule-editor and rule-library as part of the $5/yr membership tier (canonical pricing per [project_membership_pricing_identical_for_all.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/project_membership_pricing_identical_for_all.md) — identical for the first member and the five-millionth, lifetime guarantee at signup price). Vendor commercial licensing follows the Tiered Vendor Adoption Framework (#2293).

---

## Cross-references

- [AI_CAKE_EXAMPLES_LOG.md](../99_Misc/AI_CAKE_EXAMPLES_LOG.md) — Example #4 captures the B126 reduction-to-practice narrative
- [INNOVATION_NO_ATOMO_AI_COLLABORATION_VALUE.md](./INNOVATION_NO_ATOMO_AI_COLLABORATION_VALUE.md) — Directed-Thought ROI theorem; B126 cross-reference added
- [feedback_librarian_consult_first_always.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_librarian_consult_first_always.md) — Bishop-side discipline memo
- `~/.claude/hooks/bishop_librarian_gate.py` — Anchor 1 implementation
- `~/.claude/settings.json` (lines 28-50) — Anchor 1 hook configuration
- `lb-test-frame/extension/manifest.json` — Anchor 2 implementation
- `librarian-mcp-helm-pwa/Start-PawnPortal.ps1` — Anchor 3 turnkey launcher
- [project_vendor_lockout_resilience_layered_defense.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/project_vendor_lockout_resilience_layered_defense.md) — adjacent: 7-Layer Defense (#2294 strengthens user-side resilience layer)

---

## Filing notes for Founder rewrite

- Prose throughout is structural scaffolding per [feedback_drafts_as_scaffolding.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_drafts_as_scaffolding.md); expect 60-80% rewrite. Claims language is the load-bearing piece — counsel will polish those further.
- Recommend bundling with #2293 in the Prov 14 amendment filing tonight/morning to share the priority date 2026-04-26.
- The B126 narrative (Founder's single sentence triggering installation in <30 minutes) is genuine evidence-of-conception-and-reduction-to-practice in the same session — preserve in the formal filing as evidentiary record.
- The "user keeps what they make" / cooperative-economic framing (Keystone #42) deserves a paragraph in the patent's background-of-the-invention section: the primitive exists *because* member sovereignty over substrate is load-bearing for the LB cooperative model.

---

*Filed B126 by Bishop, 2026-04-26 ~03:50 UTC. The architectural primitive that just made Bishop reliable, generalized to make any LB member reliable. One Founder sentence in, one Crown Jewel candidate out. Long haul. Always.*

— Bishop B126
