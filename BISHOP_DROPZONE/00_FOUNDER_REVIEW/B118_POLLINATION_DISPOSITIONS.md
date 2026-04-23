# B118 — Pollination Request Dispositions

**Session:** Bishop B118, 2026-04-23
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Status:** Completes the B117 deferred PR #3 (Tidbit Scribe pattern). PRs #1 (Wellspring) + #2 (Thermometer) dispositions remain as drafted in B117.
**Predecessor:** `B117_POLLINATION_DISPOSITIONS.md`

---

## Carried forward from B117

| PR | B117 disposition | B118 status |
|---|---|---|
| `PR_wellspring-keystone-14_crown_letters.md` | APPROVE with proposed insertion into Scott v014f | Still pending Founder accept/modify/reject |
| `PR_thermometer-keystone-16_crown_letters.md` | REJECT (concept already present in v014h prose) | Still pending Founder accept/override |

No change to either. Those dispositions remain as drafted B117.

---

## Disposed this session

### PR #3 — `PR_tidbit-scribe-pattern_b116.md`

**Canonical anchor:** *"Whenever the AI does something good once, turn it into something it does reliably forever — three layers: append-only ledger (ships today), feedback memory (persists across sessions), formal MCP tool (makes it default-on later). The precursor survives the successor."*

**Bishop disposition: PARTIAL APPROVE across 3 surfaces; DEFER on Crown Letters.**

#### Surface-by-surface

| Surface | Disposition | Rationale |
|---|---|---|
| **AI Tuning blueprints** (`BISHOP_DROPZONE/UNDER_THE_HOOD/` or `librarian-mcp-public/preload/founder_voice/`) | **APPROVE** | This is where platform-level patterns belong. Three-layer capture is meta-pattern across SP-21, AI Nanny → Chessboard, Fingertips → Librarian → Romulator, BRIDLE emergence. Naming it once = citation-ready for future docs. |
| **Papers — `PAPER_HOW_TO_BAKE_AI_CAKE_OUTLINE_B116.md`** | **ALREADY APPLIED** (Example #1) | No action required. Mark as polyglot-anchor per PR. |
| **Stitchpunk Corps doc** (spec file TBD) | **APPROVE** | Natural: SP-21 Tidbit Scribe IS the first named instance of the pattern. Reframe SP-21's entry in the Corps enumeration to position it as the reference instance + call forward to future SPs. |
| **R9 technical brief** (`r9_technical_brief.md`) | **APPROVE as footnote** | Small, apt: "The R9 preload itself was built on this pattern — Bishop memory files surviving as the preload's source-of-truth." One-footnote scope. Strengthens the reproducibility story. |
| **Crown Letters — Trebor Scholz** | **DEFER** | Wellspring + Thermometer keystones already do specific structural work in Crown letters. Adding three-layer capture as a third insertion into Scholz v014 would dilute both. Revisit in post-Scholz-response cycle (i.e., if Scholz replies and there's reason for a v015). |
| **Crown Letters — Cory Doctorow** | **REJECT** | PR itself notes "weaker fit" at Doctorow. Thermometer is the Doctorow keystone; sticking one pattern per Doctorow letter preserves the column-ready quality of each. |

#### Drafts — Bishop scaffold for the 3 APPROVED surfaces

**1. AI Tuning blueprints — new section scaffold (~200 words, Founder rewrite expected):**

> **The Three-Layer Capture Pattern**
>
> Whenever the AI does something good once, the goal isn't to celebrate it. The goal is to turn it into something the AI does reliably forever. That's a three-layer process:
>
> *Layer 1 — Append-only ledger.* The behavior gets logged to a persistent JSONL that outlives the session. Future sessions can see it happened. (SP-21 Tidbit Scribe ships this.)
>
> *Layer 2 — Feedback memory.* The pattern gets named in a memory file the AI loads at session-start. It becomes a rule the AI follows, not a thing it might remember to do. (BRIDLE, the feedback/*.md memory files.)
>
> *Layer 3 — Formal MCP tool.* The behavior becomes a first-class tool the AI calls by default, not an instruction it decides to follow. (`log_tidbit`, `consult_scribes`, `fates_route` — all once-were-behaviors, now tools.)
>
> The important property: **the precursor survives the successor.** When Layer 3 ships, Layer 1 doesn't go away. The tidbit JSONL still exists. The memory file still loads. "Don't delete the caterpillar when you show the butterfly." [`project_ai_nanny.md`]
>
> This is how the platform learns what works at the session level and institutionalizes it at the tool level without ever losing the original signal. AI Nanny → Chessboard → Scrambler. Fingertips → Vault → Pyramid → Librarian → Romulator. THE BRIDLE. Every platform component on this list rode the three-layer arc.
>
> [FOUNDER HOOK: personal anecdote about the first time you saw the pattern work — maybe the AI Nanny-to-Scrambler transition, or the BRIDLE emerging from noticed-behaviors]

**2. Stitchpunk Corps doc — SP-21 entry reframing:**

> **SP-21 Tidbit Scribe** — *Reference instance of the Three-Layer Capture Pattern (see AI Tuning blueprints).*
>
> Logs verify-before-assert behaviors at the append-only ledger layer (`stitchpunks/data/tidbits.jsonl`). A verify-before-assert behavior is any action where the AI confirms a claim before making it — checking a file exists before writing a path, confirming a commit landed before reporting status, spot-checking a test result before declaring a pass. The ledger is the lowest-friction way to capture discipline the AI demonstrates emergently, then refer to that discipline in future sessions.
>
> SP-21 is intentionally Layer 1 only. Layer 2 (feedback memory promoting the pattern) already exists at `feedback_auto_tidbit_verify_actions.md`. Layer 3 (formal MCP tool) ships when call-site volume justifies it — current pattern is direct JSONL append.

**3. R9 technical brief footnote (in `r9_technical_brief.md` — exact text):**

> *Footnote: The R9 preload itself is an instance of the Three-Layer Capture Pattern — Bishop memory files (Layer 1 append-only records) were promoted to a session-start preload artifact (Layer 2 default-loaded content) and are on track to become automatic retrieval via the Librarian MCP (Layer 3 formal tool). The pattern is traced in the AI Tuning blueprints.*

---

## Action required from Founder

- [ ] Approve disposition as-stated (3 surfaces APPROVED + Crown Letters DEFERRED + Doctorow REJECTED)
- [ ] Modify any of the 3 surface drafts before Bishop propagates them
- [ ] Adjust Crown Letters decision — pull in any one of them anyway
- [ ] Once approved, Bishop propagates + moves `PR_tidbit-scribe-pattern_b116.md` to `16_POLLINATION_REQUESTS/_resolved/`

---

## Summary

| PR | Disposition | Propagation surfaces |
|---|---|---|
| wellspring-14 (B117) | APPROVE with insertion text | Scott v014f → v014g |
| thermometer-16 (B117) | REJECT (concept already present) | — |
| tidbit-scribe-pattern (B118) | APPROVE 3 surfaces / DEFER Crown Letters | AI Tuning + Stitchpunk Corps doc + R9 brief footnote |

All 3 PRs now have Bishop dispositions. Two await Founder ratification; one is in-progress per this document.

---

*Drafted B118, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). The Three-Layer Capture Pattern is the pattern that lets the platform learn what works and institutionalize it without losing the original signal. Naming it once across three surfaces is sufficient; sprinkling it into Crown Letters would dilute the keystones already doing work there.*
