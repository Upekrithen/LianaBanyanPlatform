# Knight K438 — STUB (not dispatch-ready) — Member-Facing Scribes Cathedral
## Per-member tablets + consent-gated Scribe-share UI + personal-preload feed into R9
## Bishop B116 — 2026-04-22 (night) — STUB ONLY
## **GATE:** K437 SCEV-1 must pass (≥5pp Cathedral lift + cross-session widening) before this dispatches.
## **Per `project_prove_then_product_principle.md` — proof before commitment. No K438 ship before K437 numbers.**

---

## Why this is a stub, not a full dispatch

Liana Banyan canonical methodology (B116 Founder-ratified): *"Prove it first. Product it second."*

K437 SCEV-1 produces the proof. If it passes, K438 gets fully drafted with the design informed by the numbers — e.g., Scribe-overlap configurations that produced the biggest lift become the default shape of a member's starter Cathedral. If it fails or is marginal, K438 does not ship until architecture is adjusted.

Building K438 before K437 results is the anti-pattern the paper `PAPER_PROOF_BEFORE_COMMITMENT_OUTLINE_B116.md` argues against.

---

## What K438 will cover (scope sketch — to be detailed AFTER K437)

1. **Supabase schema** — `member_cathedrals` + `member_scribes` + `scribe_entries` tables in an appropriate schema (`public` or a new `cathedral` schema). RLS per member.
2. **Member Cathedral UI**:
   - `/my/cathedral` — landing showing member's Scribes + recent entries
   - `/my/cathedral/new` — register a new Scribe (pick primary field, pick 2-12 adjacents, keyword library)
   - `/my/cathedral/<scribe_id>` — tablet view (paginated, searchable)
3. **Consent-gated share-out**:
   - Per-Scribe share flags: `private` / `guild` / `tribe` / `commons` (under #2260 Pledge)
   - Share targets appear in Guild / Tribe / Commons aggregated views
   - Member can revoke share at any time — shared entries remain where they were shared to (immutable append-history preserved), but no new entries flow
4. **Personal-preload feed**:
   - Member's Cathedral feeds their personal R9 preload layer
   - `librarian_context(member_id="...", intent="...")` extension — pulls the member's Scribes alongside the canonical preload
   - Cost-Slasher applies per-member: their personal numbers on their own workflow
5. **Export on close**:
   - Explicit download of entire Cathedral as a ZIP of JSONL tablets + registry YAML
   - Member-friendly anti-lock-in; membership termination does not delete the Cathedral, just stops new entries and revokes platform-side storage obligation
6. **Pricing alignment**:
   - Unlimited Scribes included in $5/yr basic (default proposal — confirm with Founder)
   - Cost-Slasher math: a member whose Cathedral saves them $N/month in AI spend pays $5/month → ROI argument baked into the pitch

## Open questions to resolve AFTER K437 lands

- How many Scribes does an empirically-effective Cathedral need? (Answer comes from K437 error-attribution subscore: if 2 Scribes produced 80% of Cathedral lift, default member setup = 3 Scribes, not 20.)
- Does the Rule-of-Three overlap actually matter at member-scale, or does it only matter at cathedral-scale (many Scribes)? (Answer comes from K437 cross-validation analysis.)
- Is Fates-routing necessary, or can members get away with direct `scribe_log` calls? (Answer: if K437 shows Fates adds meaningful routing quality, member UI surfaces it; if not, skip.)
- Budget-cost of maintaining 10,000 member Cathedrals in Supabase? (Rough estimate: negligible — JSONL rows are tiny. Verify at K438 draft time.)

## Marketing alignment (for Chapter 3 teaser on landing, when K437 passes)

Post-K437 numbers will anchor claims:
- *"Your personal Cathedral made Haiku N% more accurate on YOUR workflow, at Y× lower cost than Opus."* (Per-member Cost-Slasher.)
- *"R9 alone forgets between sessions. With your Cathedral, accuracy on week-old questions is Z% higher."* (Cross-session continuity — the SCEV-1 distinctive claim.)
- No numbers, no claims. Follow the landing-page discipline.

## Sizing

Based on K432's comparable scope (Pedestal Stake Phase 2: 8-step wizard + 2 adapters + schema + dashboard + badge, 18/18 tests), this is probably **2 Knight sessions** — Phase 1 schema + basic UI, Phase 2 share-gating + R9 integration. Split when K437 lands.

---

## Next step

**For Bishop (post-K437 results):**
- If PASS: draft K438 Phase 1 + Phase 2 as full dispatches, incorporating SCEV-1 findings into default design
- If MARGINAL: Founder+Bishop decision. Options in K437's decision tree.
- If FAIL: expand this stub into an *architecture-redesign* brief, NOT a build dispatch

**For Founder (post-K437 results):**
- Receive SCEV-1 summary
- Make the go/no-go call on K438
- If go: approve the honest public write-up of the numbers alongside the member-feature launch

---

*Stub authored by Bishop B116, 2026-04-22. Do NOT dispatch until K437 pass criterion is met.*
