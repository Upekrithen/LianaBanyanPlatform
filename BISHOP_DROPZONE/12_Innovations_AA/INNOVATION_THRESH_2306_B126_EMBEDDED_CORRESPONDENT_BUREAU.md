# INNOVATION THRESH #2306 — The Embedded Correspondent + The Bureau (Cross-Agent Reasoning Observation Plane + Aggregation)

**Founder-naming sequence (B126 2026-04-26 14:48-14:55 CDT):**
1. *"Reporter"* scribe? → *"Journalist"* Scribe? → **"Like an Embedded Correspondent"** ✅ (captures *embedded-in-reasoning-stream* property)
2. *"...which is like the Chroniclers for Chronos. When is that?"* — Founder identifies the **structural parallel**: same Stitchpunk architectural pattern as Chroniclers/Chronos, applied to reasoning-state instead of component-state.

**The Pair:**
- **Embedded Correspondent** = per-agent continuous reasoning-stream observer (sister to Chroniclers #2300 for component state)
- **The Bureau** = aggregation + query layer across all Embedded Correspondents (sister to Chronos #2299 via HourGlass for component-state queries)

This thresh was originally drafted as "Journalist Scribe" (B126 14:50); Founder refined to "Embedded Correspondent + The Bureau" by ratifying the Chroniclers/Chronos structural parallel (B126 14:55). Same architectural primitive; better naming.



**Filed:** B126 (2026-04-26 ~14:50 CDT)
**Status:** SHIPPED — K515 (2026-04-26) reduced-to-practice. Four MCP tools deployed (`correspondent_log`, `bureau_subscribe`, `bureau_query`, `chronos_query`). 17/17 verification checks passed. K512.5 regression test (C.12) empirically proves the failure mode is closed. Promote to A&A Formal per Founder-call (Prov 14 amendment or Prov 15 batch).

**K515 Reduction-to-Practice Anchor (2026-04-26):**
- `discipline_wing/bureau.py` — Embedded Correspondent producer + Bureau query functions + 7 starter risk-pattern Augurs
- `discipline_wing/chronicler.py` — Chronicler tablet writer + Chronos aggregate query (component-state side, A&A #2299/#2300)
- `librarian-mcp/src/server.ts` — MCP tools: `chronos_query`, `correspondent_log`, `bureau_subscribe`, `bureau_query`
- `discipline_wing/tests_k515.py` — 17/17 verification checks (C.1–C.16 + C.14b)
- **C.12 K512.5 regression proof**: Synthesized Knight reasoning chunk *"Let me update the Supabase secret to ensure it's current: supabase secrets set ANTHROPIC_API_KEY=<value>"* → `Augur-Vendor-Secret-Rotation` fires (critical class) → pre-execution advisory generated. The K512.5 failure mode is now **empirically prevented in regression**, not just architecturally addressed.
- Helm PWA: `ChronosBureauPanel.tsx` — Twin Observer dashboard (Chronos tab + Bureau tab) wired into Helm under "Observers"
**Class:** New Stitchpunk class (alongside Bloodhounds / Cerberus / Tribunal / Loom / Augur). Patent-bag candidate.
**Cluster:** AI substrate / Cross-agent observability / Discipline-enforcement extension to Augur Plane (#2295)
**Companion entries:** #2287 (Synapses, post-hoc reasoning capture), #2288 (Tribunal, live verification), #2289 (Cerberus, retrospective examination), #2295 (Augur MAJCOM, discipline plane), #2294 (Personal Discipline Enforcement Layer)

---

## The architectural primitive

A **Embedded Correspondent + The Bureau** is a continuous cross-agent reasoning-stream observer that subscribes to one agent's in-flight reasoning chunks and runs Augur-class risk-pattern detection against them in near-real-time, surfacing pre-execution advisories to a sibling agent (or the human Founder) when reasoning trajectory matches a known-failure-class signature.

**Key distinction from existing primitives:**
- *Synapses (#2287)*: passive append-only capture; visible to Bishop after Knight's done — *too late*
- *Tribunal (#2288)*: live multi-AI verification of reasoning quality; doesn't risk-pattern-match against operational signatures
- *Cerberus (#2289)*: retrospective examination of completed chains; backward-looking
- *Bishop Wing / Augurs (#2295)*: watches one agent's tool calls for discipline-rule violations; scoped to that agent's enforcement plane
- **Embedded Correspondent + The Bureau**: watches another agent's REASONING STREAM (not just tool calls); fires risk pattern matches BEFORE the about-to-be-destructive operation executes; provides cross-agent advisory channel

The Embedded Correspondent + The Bureau operationalizes the architectural gap revealed by B126 K512.5: Knight reasoned aloud about overwriting a Supabase vendor secret; Bishop could have caught the hypothesis from Knight's language; but Bishop had no subscription channel to Knight's reasoning until Founder manually relayed it (~30 min cost).

---

## Founder origin (B126 K512.5 retrospective)

After K512.5 closed (cathedral path live at 1.83s post-restore), Founder articulated the insight:

> *"IF we can replicate that process — where Bishop is able to see Knight's reasoning AS IT HAPPENS ('Reporter' scribe? Or better 'Journalist' Scribe.) Then it would save a lot of heartache."*

**Founder-name ratified**: **Embedded Correspondent + The Bureau** (chosen over Reporter because *Journalist* implies active investigation + surfacing of concerns + holding-the-questioned-thing-accountable — not just passive observation).

The empirical anchor is the K512.5 incident itself: Knight's reasoning chain *"Let me update the Supabase secret to ensure it's current"* contained the destructive intent in plain English; Bishop later diagnosed *"Knight overwrote the working ANTHROPIC_API_KEY"* as the most-likely root cause within minutes of being told. **The hypothesis was reasoning-discoverable in real time; the missing piece was the subscription channel.**

---

## Architecture sketch

### Tier 1 — Stream production (per agent)

Each agent (Knight, Pawn, Bishop, Rook, future-member-AI) writes reasoning chunks to an MCP-mediated shared channel:

```
mcp__librarian__journalist_log({
  agent: "KNIGHT",
  session: "K###",
  ts: <ISO8601>,
  chunk: "<verbatim reasoning text or summary>",
  context: { current_phase, current_file, current_tool_about_to_run, ... }
})
```

Append-only. Cheap to write. Per-agent stream.

### Tier 2 — Stream subscription + risk-pattern matching (per observer)

Sibling agents (or the human Founder via dashboard) subscribe:

```
mcp__librarian__journalist_subscribe({
  watching_agent: "KNIGHT",
  observer_agent: "BISHOP",
  since: <ts>,
  risk_filter: <pattern_set_id>
})
```

Returns a stream of chunks (push or pull). Augur-class risk-pattern matching applied:

| Risk Augur (Knight-reasoning watch) | Pattern signature | Default action |
|---|---|---|
| Augur-Vendor-Secret-Rotation | `supabase secrets set <vendor_key>`, `firebase functions:config:set`, `aws ssm put-parameter`, etc. + reasoning verbs *"update / refresh / ensure / sync"* | **Pre-execution advisory to Bishop**: *"Knight is about to write a vendor secret without explicit Founder approval — flag for confirmation"* |
| Augur-Force-Push | `git push --force`, `git reset --hard`, `git checkout -- .` against shared branch | Pre-execution advisory |
| Augur-Schema-Drop | `DROP TABLE`, `DROP DATABASE`, `DELETE FROM <table> without WHERE` | Pre-execution advisory |
| Augur-Filesystem-Wipe | `rm -rf /`, `rm -rf ~`, `Remove-Item -Recurse -Force` against home/system paths | Pre-execution advisory |
| Augur-Permission-Grant | `chmod 777`, `setfacl`, `Grant-CsAdRoleAssignment` to broad scope | Pre-execution advisory |
| Augur-API-Spend-Spike | reasoning indicates unbounded loop / batch / parallel API calls without budget cap | Pre-execution advisory + cost-cap suggestion |
| _(more — domain-specific Augurs configurable per Wing)_ | | |

### Tier 3 — Advisory delivery + human escalation

When a Embedded-Correspondent Augur fires:
- **Sibling-AI advisory** (Bishop sees Knight's risk pattern → Bishop drafts advisory → Founder relays OR direct-MCP-message to Knight if same shared channel)
- **Human-in-loop pause** (high-class risk → Knight's tool execution gates on explicit Founder confirmation; default-strict for vendor secrets, force-push, schema-destruction, filesystem-wipe)
- **Audit-only signal** (low-class risk → log to Chronicler tablet; no execution interrupt)

### Tier 4 — Federation across agents (extends #2295 Augur MAJCOM)

The Embedded Correspondent + The Bureau is not just Bishop-watches-Knight; it generalizes to:
- Bishop watches Knight (B126 K512.5 use case)
- Knight watches Pawn (catches Pawn's research-pattern over-promising)
- Bishop watches Pawn (catches Pawn dispatch-context omissions)
- Member-Wing watches their own AI (consumer-facing application)
- NAF-level federation (member-Wings opt-in to share Journalist-Scribe risk patterns aggregately, NEVER raw reasoning content) → cross-Wing-pattern surfacing

This positions the Embedded Correspondent + The Bureau as a **cross-agent companion to the per-agent Wings** in #2295 Augur MAJCOM. The Augur primitive watches one agent's tool calls; the Embedded Correspondent + The Bureau watches another agent's reasoning. Together: full-coverage discipline-enforcement plane across the cooperative-AI federation.

---

## Patent claims (provisional — counsel-rewriteable)

**Claim 1 (independent)**: A method for cross-agent reasoning-stream observation in a multi-agent AI system comprising: (a) a reasoning-stream production interface where a first AI agent writes verbatim or summarized reasoning chunks to a shared mediated channel; (b) a subscription interface where a second AI agent or human observer subscribes to said stream filtered by risk-pattern set; (c) Augur-class risk-pattern matching against incoming chunks comparing against a configurable signature library; (d) pre-execution advisory delivery to said second agent or human when a risk-pattern signature matches, prior to the first agent executing the about-to-be-destructive operation that the matched reasoning anticipated.

**Claim 2 (dependent on 1)**: wherein risk-pattern signatures include vendor-secret-rotation reasoning, force-push reasoning, schema-destruction reasoning, filesystem-wipe reasoning, permission-grant-broadening reasoning, and API-spend-spike reasoning.

**Claim 3 (dependent on 1)**: wherein advisory delivery is configurable per risk-class as: (a) sibling-AI text advisory, (b) human-in-loop pause requiring explicit confirmation before tool execution, (c) audit-only log to Chronicler tablet without interrupting execution.

**Claim 4 (dependent on 1)**: wherein the primitive composes recursively across agent pairs in a cooperative-AI federation per #2295 Augur MAJCOM, such that any agent in the federation may subscribe to any sibling agent's reasoning stream subject to opt-in by the producing agent.

**Claim 5 (dependent on 1)**: wherein the reasoning-stream production is itself substrate-injection-aware — chunks may include a substrate-citation field naming the canonical-memory references the producing agent consulted at that reasoning step, allowing risk-pattern matching to incorporate substrate-grounding signal in addition to surface-text patterns.

(More claims to draft at A&A formalization stage.)

---

## Implementation status

| K | Title | Status |
|---|---|---|
| **K514** | Bishop Wing MVP (Augur Plane) | SHIPPED 2026-04-26 — 57df37b / v-bishop-wing-mvp-K514 |
| **K515** | Embedded Correspondent + Bureau MVP (this entry) + Chronos+Chroniclers | SHIPPED 2026-04-26 — v-chronos-chroniclers-bureau-K515 |
| K516 | DragonRiders Sandbox Integration | QUEUED |
| K523+ | Embedded Correspondent Federation across NAFs (Tier 4) | post-K519/K520 |

---

## Cross-references

- B126 K512.5 incident — empirical anchor for the architectural-gap discovery
- A&A #2287 (Synapses) — passive reasoning capture (sister primitive — Journalist is the active version)
- A&A #2288 (Tribunal) — live verification (Tribunal verifies; Journalist watches-and-flags)
- A&A #2289 (Cerberus) — retrospective (Cerberus looks back; Journalist looks forward)
- A&A #2294 (Personal Discipline Enforcement Layer) — the Bishop hook system; Embedded Correspondent + The Bureau extends it across agent boundaries
- A&A #2295 (Augur MAJCOM) — Embedded Correspondent + The Bureau Augurs operate on reasoning streams the same way Wing Augurs operate on tool calls
- A&A #2292 (Cathedral Federation Protocol) — transport for cross-agent reasoning subscriptions
- [feedback_dont_rotate_vendor_secrets_without_confirmation.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_dont_rotate_vendor_secrets_without_confirmation.md) — the discipline rule the Embedded Correspondent + The Bureau would have enforced pre-execution at K512.5

---

## Filing recommendation

Bundle into Prov 14 amendment as #2306 alongside #2293/#2294/#2295 (priority date 2026-04-26 if filed within today's filing window) OR file in Prov 15 batch (post-conversion-deadline cycle). Founder-call.

The Embedded Correspondent + The Bureau is the operational-architecture piece that closes the cross-agent visibility gap exposed by K512.5. With it, Bishop catches Knight's drift in real time without Founder relay overhead — generalizes to every agent pair in the cooperative-AI federation. **This is the architectural primitive that makes the all-hands-on-deck demonstration scale beyond Founder-as-coordinator.**

---

*Filed B126 by Bishop, 2026-04-26 ~14:50 CDT. Founder-named "Embedded Correspondent + The Bureau" in real-time after K512.5 ratification. Long haul. Always.*

— Bishop B126
