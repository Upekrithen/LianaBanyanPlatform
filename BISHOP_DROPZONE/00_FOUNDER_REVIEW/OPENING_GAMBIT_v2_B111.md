# Opening Gambit v2 — Letter Priority & Social Media Rollout
## B111, April 20, 2026 — Founder-authorized corrections to v1

**Why v2:** v1 was written before the current launch window opened (Apr 12 launch, Wave 1 opens Apr 22–23). Four corrections:
1. **Circle 1 — disambiguate Gates.** Bill Gates is on hold (Epstein); Melinda French Gates (Pivotal Ventures) is separate post-divorce and is NOT on hold. Verify intent.
2. **Circle 2 — add missing amplifiers.** Cory Doctorow (V04 dispatching Wave 2), Farhad Manjoo (NYT Opinion columnist, pitch target), Julia Angwin (NYT Opinion contributing writer, backup pitch target), Ezra Klein (NYT Opinion columnist + podcast, second pitch target after Manjoo).
3. **Circle 3 — move Schlossberg.** Tatiana Schlossberg is Memorial, not active academic contact. "In Honor Of" tribute ratified B109. Retain Scholz / Schneider / Brynjolfsson as active academic contacts.
4. **Circle 4 — add Tom Simon.** Named CFO candidate in Scott v014f (26-year FBI forensic accountant). Belongs in Initiative Leaders lane.
5. **Priority triggers — replace member-count gates with canonical Wave windows.** "Week 2+ IF 25+ members" was a pre-launch guardrail; current canon is the letter-by-letter Wave schedule regardless of member count.

---

## Circle Priority (AA / AB / AC mapped to Circles)

| Circle | Recipients | Priority | When to Send |
|---|---|---|---|
| **Circle 1** | Investors / Philanthropists: Warren Buffett, MacKenzie Scott, **Melinda French Gates** (Founder-ratified B111 as Circle 1 member; Bill Gates REMAINS on hold, Epstein), Craig Newmark | HIGHEST | Scott: Wave 1 send window **Apr 22–23, 2026** (v014f send-ready; v014g Courtesy SSL + v014h Thermometer addendum pending Founder ratification). Buffett / Newmark / Melinda: Wave 2 per `project_b108_letters_queue.md`. |
| **Circle 2** | Media / Amplifiers: Casey Newton, Hank Green, Taylor Swift, Kara Swisher, Tim Ingham, **Cory Doctorow**, **Farhad Manjoo**, **Julia Angwin**, **Ezra Klein** | HIGH | Doctorow V04: Wave 2 (dispatches after Cephas publication of op-ed + Scott Wave 1 lands; target Apr 23–25). Manjoo pitch: **after The Eyewitness Benchmark table lands** (est. Apr 26–27). Klein pitch: 7 days after Manjoo pitch if no Manjoo response. Angwin: backup if both pass. One pitch per editor per week — never parallel. |
| **Circle 3** | Academics: Trebor Scholz, Nathan Schneider, Erik Brynjolfsson. *(Schlossberg moved to Memorial lane.)* | MEDIUM | Scholz: reframe Red Carpet → **co-authorship on Paper #49 (The Eyewitness Benchmark)** (Wave 2–3). Schneider / Brynjolfsson: Wave 3–4 with Pledge + Witness Program ask. |
| **Circle 4** | Initiative Leaders: Sal Khan, Dale Dougherty, Michael Seibel, José Andrés, **Tom Simon** (CFO candidate) | STANDARD | Wave 3+ after academic amplification in Circle 3. Tom Simon: special case — already named in Scott v014f; if Scott lands, consider Simon contact accelerated into Wave 2. |
| **Memorial** | **Tatiana Schlossberg** (Health Accords tribute) | MEMORIAL | "In Honor Of" second letter staged (FOUNDER_REVIEW). Send timing: coordinate with family / representative. Separate lane from active outreach. |

---

## Social Media Schedule (7-Day Stagger Pattern)

v1 schedule preserved — structurally sound per [project_preface_burst_dispatch.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_preface_burst_dispatch.md). Minor clarifications in v2:

| Day | Content Type | Posts | Purpose |
|---|---|---|---|
| Day 1 | **NEWS HOOK** | 1–2 | Urgency. For Wave 1 (Apr 22–23): "Librarian MCP public repo ships" + "13 provisional patents, 80% pledged, Nov 26 deadline" |
| Day 2 | **EMOTIONAL** | 1–2 | Founder story, mission. Pine Books / Tiffany Brost anecdote + Cardboard Boots excerpt |
| Day 3 | **PRACTICAL** | 1–2 | How members earn. $5/yr membership payoff math (AI savings > membership), Medallion sponsorship walk-through |
| Day 4 | **THEORETICAL** | 1 | Moral/economic foundation. Paired Provenance pattern / Inversion Principle / System of Wells (Keystone #14) |
| Day 5 | **PROOFS** | 1–2 | R10 cross-vendor table (once landed); Pledge bylaw codification; Cost+20% transparency |
| Day 6–7 | **CONSOLIDATION** | 0 | Engage mode only — no new posts, respond to comments / DMs / mentions |

**Platform role assignments (per project_preface_burst_dispatch):** Twitter 4 posts (breadth), LinkedIn 1 (depth), Facebook / Bluesky / Mastodon mirror Twitter at lower cadence.

---

## Cross-reference: Battery Dispatch integration

Battery Dispatch system is live (Supabase `letter_dispatch_queue` + access-gating ACL per B076 verification migration). Opening Gambit entries should propagate into `letter_dispatch_queue` so the dispatch platform can drive the actual sends. Proposed companion migration staged at `BISHOP_DROPZONE/01_KnightPrompts/...` for Knight to apply — adds named-columnist rows (Manjoo, Klein, Angwin, Doctorow-V04) to the existing `letter_dispatch_queue` table which already has the K368 media contacts. See `BATTERY_DISPATCH_INSERT_MANJOO_KLEIN_ANGWIN_B111.sql`.

---

## Decision prompts for Founder

1. Confirm Melinda French Gates (not Bill) in Circle 1?
2. Confirm Schlossberg in Memorial lane, not Circle 3?
3. Approve Manjoo → 7-day-wait → Klein → 7-day-wait → Angwin pitch cadence?
4. Approve one pitch per editor per week rule as canonical (not just for NYT, for all media)?
5. Authorize Battery Dispatch INSERT migration to add Manjoo/Klein/Angwin/Doctorow-V04 as named rows?

---

*Saved B111, April 20, 2026. Bishop (Claude Opus 4.7, 1M context). v1 → v2 corrections Founder-authorized same turn.*
