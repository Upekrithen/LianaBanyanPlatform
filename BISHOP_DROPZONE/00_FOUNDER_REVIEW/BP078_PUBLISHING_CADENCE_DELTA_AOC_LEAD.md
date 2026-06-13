# BP078 Publishing Cadence DELTA: AOC letter leads + Pawn angles integrated

**Authored:** Bishop, BP078, 2026-06-09
**Supersedes:** SEG-AT cadence ordering (Show HN at position 1) — kept for receipt-cadence positions only.

## Revised cadence order (Founder direct)

| # | Day | Piece | Primary outlet | Anchor receipt | Source |
|---|---|---|---|---|---|
| 1 | Day 1 | **Open letter to AOC** — AI Centers debate angle | Cephas + Substack + direct-send + social amplification | Local-AI-no-datacenter architecture + RoseBush thesis | Founder direct BP078 |
| 2 | Day 4 | **Open letter to MacKenzie Scott** | Cephas + Substack + direct-send via Yield Giving Foundation | Cooperative model + 16 initiatives + 21 USPTO filings | Founder vision trilogy |
| 3 | Day 7 | **How to Save the World in Six Easy Steps** | NYT or WaPo Outlook (NYT held per canon, lean WaPo first cycle) | Six Steps canon | Founder vision trilogy |
| 4 | Day 10 | **A Considered Approach to Universal Sustained Economic Prosperity** | The Atlantic Ideas OR ProPublica | Cooperative thesis writ large | Founder vision trilogy |
| 5 | Day 13 | **The 83 Percent Manifesto** | The Atlantic | 21 USPTO filings + SSPL + CDPP + 83.3/Cost+20/$5 architecture | Pawn drafted lead-graf-ready |
| 6 | Day 16 | **What a $5 Membership and a Free Model Actually Beat** | Wired | Phase 7 50/50 + Tier 3 head-to-head benchmark | Pawn drafted; gated on Tier 3 receipt |
| 7 | Day 19 | **Your AI Has Amnesia and Needs a Substrate Cure** (Founder reframe BP078 — supersedes Pawn's "Memory Wall" critique framing) | **The Verge** (primary — accessible-tech publication, diagnostic register fits) OR WaPo Tech (backup) | BP070 session-close ingest GATE — but framed as diagnosis + cure, not as critique-of-omission | Pawn drafted lead graf; Founder reframed BP078 to diagnostic-positive register. New lead graf needed in the cooperative-doctor voice, not critique voice. |
| 8 | Day 22 | **Show HN: MnemosyneC** | Hacker News | v0.1.27 + working Stripe + clean /proofs | SEG-AT, BP075 canon order preserved |
| 9 | Day 25 | **The Cooperative AI Model (83.3% creator keep)** | Bloomberg Opinion (Atlantic taken at position 5) | BP072 prose + receipt | SEG-AT |
| 10 | Day 28 | **Free AI Beats Paid Flagships** | The Verge | Tier 3 receipt + RoseBush story | SEG-AT |
| 11 | Day 31 | **The Substrate Cure: How Mnemosynec Cures AI Amnesia (Technical Companion)** | MIT Tech Review — technical-depth companion to position 7's accessible diagnostic piece | BP070 GATE + BP078 Phase A receipts + the Plow-First canon | SEG-AT; reframed to be the technical depth piece that follows the position 7 popular piece. If position 7 publishes successfully, this becomes the "for engineers who want the architecture" follow-up. If position 7 is killed, this becomes Bishop's standalone technical piece. |
| 12 | Day 34 | **Truth-Always: How We Caught Our Own Overclaims** | ProPublica (after #4 if #4 went Atlantic, otherwise ProPublica is fresh) | Verify-net catches BP067/BP069/BP078 | SEG-AT |

## Truth-Always notes per piece

- **Piece #1 (AOC)**: Bishop SEG-AV gadgeting for an existing draft on disk. If none, Bishop drafts from canon (local-AI / 16 initiatives / AI Centers debate framing). Counsel-class check before send: open letters to elected officials have different etiquette than op-eds; verify Founder voice and any lobbying-disclosure considerations are non-issues per canon BP077 counsel-settled.
- **Piece #2 (Scott)**: SEG-AU surfaced "three counsel review flags" SEG-AT mentioned — Bishop verifies as drafting markup (canon BP077 says counsel settled; embedded `FLAG:` comments are author-side TODOs, not new concerns).
- **Pieces #3 + #4**: Vision trilogy completion.
- **Pieces #5-7 (Pawn)**: Pawn ranked her #1 (83% Manifesto) for Atlantic, #2 ($5 vs Flagships) for Wired, #3 (Memory Wall) for NYT. Bishop preserves her ranking + outlet picks.
- **Piece #6 ($5 vs Flagships)**: HARD GATE on Tier 3 benchmark receipt. Do NOT fire this piece before Knight Tier 3 benchmark lands. If receipt slips, move position back.
- **Piece #8 (Show HN)**: HARD GATE on v0.1.27 working + Stripe live + clean /proofs page.
- **NYT at position 7**: First post-rejection re-approach. Use Atlantic published credential (position 5) as a query-letter asset.

## Tracker schema (per SEG-AT)

New Supabase migration `LianaBanyanPlatform/supabase/migrations/20260608_publishing_cadence.sql`. Schema in SEG-AT receipt. Knight dispatches this BEFORE first piece fires.

## Pre-fire Founder action items

1. **Substack account setup** — open since BP069. Without it, Cephas-only fallback for pieces 1-4. Founder action, ~5 minutes.
2. **AOC letter draft state** — SEG-AV verifying.
3. **Vision trilogy state** — SEG-AU verifying (Scott + Six Steps + Universal Prosperity).
4. **Counsel review flags in Scott letter** — SEG-AU confirming drafting-markup vs real-concern.
5. **AI Centers debate context briefing** — Bishop SEG to compile current state of the AOC AI Centers debate for the open letter framing.

## Pipeline

Bishop drafts → Pawn fact-checks → Rook reviews voice → Founder ratifies → Bishop staging on Cephas always-on + submission to primary outlet → tracks state in `publishing_cadence` table → if rejected, auto-publish to Cephas full.

End of delta.
