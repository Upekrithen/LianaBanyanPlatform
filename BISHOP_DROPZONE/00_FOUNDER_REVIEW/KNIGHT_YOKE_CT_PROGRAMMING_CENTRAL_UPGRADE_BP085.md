# KNIGHT YOKE — CT.COM PROGRAMMING CENTRAL UPGRADE · BP085
**Issued by Bishop · BP085 · 2026-06-17**
**Yoke file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_CT_PROGRAMMING_CENTRAL_UPGRADE_BP085.md`

---

## PREAMBLE — MANDATORY BEFORE ALL ACTION

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## BP085 BLOOD — SECRET HYGIENE (NON-NEGOTIABLE)

**NEVER EXPOSE API OR SECRET KEYS EVER.**

BP085 §14 BLOOD — gadget-first before asking Founder to repeat. BP085 §15 BLOOD — Knight main thread for orchestration; spawn SEGs for substantive work.

- Bishop AND Knight AND ALL SEGs are bound.
- Active secrets live at `C:\Users\Administrator\.claude\state\secrets\22May2026.env`.
- PATH is referable. CONTENTS are blood-statute forbidden.
- NEVER read · copy · show · echo · pipe · log · grep-output any credential value.
- Canonical safe loader (subshell scoping, single-var extraction, output-only echo = ZERO credential exposure):
  ```
  (eval "$(grep -E '^SUPABASE_DB_URL=' /path/to/22May2026.env)"; psql "$SUPABASE_DB_URL" -c "QUERY")
  ```
- Any SEG that touches environment vars MUST use this pattern or equivalent zero-exposure approach.
- Violation = immediate yoke halt + Founder alert.

---

## GATE CONDITION — READ BEFORE PROCEEDING

**This yoke gates on the Pawn CT.com base HTML deploy yoke landing GREEN first.**

Gate file to verify: `KNIGHT_YOKE_CEROSTECHNOLOGY_HTML_DEPLOY_BP085.md` — confirm Pawn's base build is live at cerostechnology.com before any SEG in this yoke modifies or deploys to that domain.

Knight: before spawning SEG-1, verify the gate:
```
curl -s -o /dev/null -w "%{http_code}" https://cerostechnology.com
```
Expected: `200`. If not 200, halt and report to Founder. Do not proceed.

---

## CONTEXT — WHAT THIS YOKE BUILDS

CerosTechnology.com becomes **Programming Central** — the cooperative's primary interface for:

| Surface | Description |
|---|---|
| Coding Contracts | Contractor-class bounties · NOID-facing · Guild/Chapter filtered |
| Bounty Posters | Open bounty wall (already in Pawn's HTML baseline) |
| Hiring Directors | 4-step role flow (project → hire → hired users have projects → Node Operator) |
| Guilds Directors | ≥3 per chapter · cannot be one · elected per BP082 vote thresholds |
| Node Operators | Role state display · ouster per BP082 voting thresholds |
| Vote Hub | `/vote` sub-page · reuses BP082 voting infrastructure · NOT rebuilt |
| Division Branching | Structural hooks for new Divisions as levels fill |

**Composes with:**
- `[[guild-node-voting-thresholds-founder-seed-proposal-bp082]]` — voting tiers 20/30/50/75/100/150/200/300/500/1000 + quarterly + 25% emergency · ouster = demote not exile
- `[[canon-many-doors-one-cooperative-membership-unity-bp085]]` — Coding Contracts can include Doors for different Guild types
- `[[canon-become-the-boss-pm-hiring-first-marks-backed-payroll-bp085]]` — Hiring Directors role is the PM-hiring pattern made structural
- `[[canon-noids-noble-order-of-idea-developers-bp085]]` — NOIDs Guild Chapter is a primary consumer of Coding Contracts
- `[[canon-bounty-posters-on-ceros-technology-checkout-enabled-bp085]]` — Bounty Posters baseline from Pawn's deploy

---

## SEG ROSTER

### SEG-1 · Recon — BP082 Voting Infrastructure on Disk
**Model:** Sonnet 4.6
**Role:** Cornerstone recon — identify what exists before any build touches governance

**Instructions:**

1. Glob the platform codebase for governance/voting schema artifacts:
   - `**/guild_node*.sql`
   - `**/voting*.sql`
   - `**/governance*.sql`
   - `**/member_profiles*.sql`
   - `**/marks_allocation*.sql`
   - `**/node_operator*.sql`
   - `**/hiring_director*.sql`

2. Also glob for TypeScript/JS voting endpoints:
   - `**/voting*.ts`
   - `**/vote*.ts`
   - `**/governance*.ts`
   - `**/guild*.ts`

3. For each file found, read the relevant sections and surface:
   - **Existing tables** (schema name, columns, constraints)
   - **Existing endpoints** (route, method, auth guard)
   - **Calling-for-votes flow** (how votes are initiated, recorded, tallied)
   - **Ouster mechanism** (how demotion-not-exile is enforced)
   - **What is MISSING** relative to Programming Central needs (Hiring Directors table, Node Operator state column, Guilds Director election trigger)

4. Output: structured inventory in the SEG return. Knight compiles this into a **Recon Receipt** before proceeding to SEG-3.

**Sharp-1 gate:** "BP082 voting infra recon DONE — [N tables found] · [N endpoints found] · gap list: [...]"

**CRITICAL:** This recon determines whether SEG-3 adds to existing schema or flags a Founder decision. Do NOT skip.

---

### SEG-2 · Design — Coding Contracts + Bounty Posters Surface
**Model:** Sonnet 4.6
**Role:** Surface design for CT.com Programming Central front-end

**Can run in parallel with SEG-1.**

**Instructions:**

1. Read Pawn's deployed HTML at cerostechnology.com (curl or read from Hugo source on disk — glob `**/cerostechnology/**/*.html` or `**/themes/cerostechnology/**`).

2. Identify the bounty card visual treatment from Pawn's baseline. Extract:
   - Card CSS class names
   - Card-flip pattern implementation
   - Color palette variables

3. Design the Coding Contracts + Bounty Posters surface composition:
   - **Layout:** Coding Contracts section ABOVE Bounty Posters
   - **Filters row** (horizontal · no horizontal scroll · flex-wrap · NEVER SCROLL SIDEWAYS):
     - Guild filter (dropdown or pill)
     - Chapter filter (conditional on Guild)
     - Marks bounty toggle
     - Fiat bounty toggle
   - **Contract card** (reuses bounty card visual treatment):
     - Contract title
     - Guild + Chapter badge
     - Bounty amount (Marks and/or Fiat)
     - NOID eligibility indicator
     - Many Doors One Cooperative Door type badge (per `[[canon-many-doors-one-cooperative-membership-unity-bp085]]`)
     - Apply CTA

4. Write the HTML + CSS additions as a Hugo partial: `layouts/partials/programming-central/coding-contracts.html`
   - File path relative to Hugo root (Knight: locate Hugo root from Pawn's deploy yoke)
   - Placeholder data (3 sample contracts spanning NOIDs + Guilds + open)
   - Mobile-responsive · no horizontal scroll · flex-wrap on filter pills

5. Write the CSS additions to the existing theme stylesheet (append only · do not overwrite).

**Sharp-2 gate:** "Coding Contracts surface designed · partial written at [path] · card-flip reused · no horizontal scroll confirmed"

---

### SEG-3 · Implement — Hiring Directors Role Flow
**Model:** Sonnet 4.6
**Role:** DB schema + eligibility logic for Hiring Directors → Node Operator promotion

**FOUNDER GATE — SEG-3 PAUSES FOR REVIEW**

Before SEG-3 executes backend schema changes, Knight presents the following to Founder for sign-off:

> **Founder Gate — Hiring Directors Schema**
> SEG-1 Recon surfaced: [FILL FROM SEG-1 RETURN]
> Proposed additions:
> - `hiring_directors` table (or view) with columns: `user_id`, `project_count`, `hired_user_count`, `node_operator_status`, `created_at`, `last_updated`
> - Eligibility check: `project_count >= 1 AND hired_user_count >= 1`
> - Node Operator promotion: trigger or application-layer check on eligibility satisfied
> - Ouster hook: foreign key to BP082 vote record (whichever tier maps to Node Operator class — likely 100-tier per guild chapter level)
> **Awaiting Founder: approve schema as-is · revise columns · or redirect.**

Knight: do NOT proceed with SEG-3 backend changes until Founder responds. Surface the gate clearly in chat.

**If Founder approves, SEG-3 executes:**

1. Write migration SQL: `supabase/migrations/YYYYMMDDHHMMSS_hiring_directors_node_operator.sql`
   - `CREATE TABLE IF NOT EXISTS hiring_directors (...)` with columns above
   - `CREATE VIEW node_operators AS SELECT * FROM hiring_directors WHERE node_operator_status = true`
   - Index on `user_id`
   - RLS policy: members can read their own row · admins can read all

2. Write eligibility check function (TypeScript Edge Function or DB function):
   - Input: `user_id`
   - Logic: count active projects for user + count hired users → if both ≥1, set `node_operator_status = true`
   - Trigger: on `hiring_directors` INSERT or UPDATE

3. Write ouster stub: `supabase/functions/node-operator-ouster/index.ts`
   - Accepts a BP082 vote result record
   - If vote passes (per tier threshold), sets `node_operator_status = false` (demote · never delete · never exile)
   - Logs ouster event with timestamp + vote record ID

4. Safe loader pattern for all psql calls (BP085 BLOOD — see preamble).

**Sharp-3 gate:** "Hiring Directors schema written · eligibility trigger written · ouster stub written · Founder gate cleared" OR "SEG-3 PAUSED — awaiting Founder sign-off at [gate above]"

---

### SEG-4 · Implement — Guilds Directors Voting Structure
**Model:** Sonnet 4.6
**Role:** Guild Director election display + BP082 vote threshold wiring for CT.com

**Gates on SEG-1 recon return (needs existing voting table names).**

**Instructions:**

1. From SEG-1 recon, identify the existing vote-recording table. Use it — do NOT create a new one.

2. Write or extend Guild Director display schema:
   - View or query: `guild_directors` — JOIN guild chapters + member_profiles + voting records
   - Columns surfaced: `guild_id`, `chapter_id`, `director_user_id`, `director_count`, `election_vote_tier`, `last_election_date`
   - Constraint: `director_count >= 3` required for a chapter to be listed as "active" on CT.com
   - Election tier: 100-tier BP082 threshold applies at chapter level (from `[[guild-node-voting-thresholds-founder-seed-proposal-bp082]]`)

3. Write Hugo partial: `layouts/partials/programming-central/guilds-directors.html`
   - Guild card shows:
     - Guild name + Chapter name
     - Current Directors (up to 3 shown · "+N more" if overflow)
     - Director status badge (ACTIVE · ELECTION OPEN · NEEDS DIRECTORS)
     - "Nominate / Vote" CTA linking to `/vote`
   - Card-flip pattern from Pawn's baseline
   - No horizontal scroll

4. Write CT.com `/directors` sub-page template: `layouts/directors/single.html`
   - Lists all Guild Chapters + their Directors
   - Filter by Guild type
   - NEVER SCROLL SIDEWAYS — vertical stack only

**Sharp-4 gate:** "Guilds Directors partial written · /directors page template written · BP082 vote tier wired · no horizontal scroll confirmed"

---

### SEG-5 · UI Integration — Programming Central Navigation
**Model:** Sonnet 4.6
**Role:** Extend CT.com nav + add all Programming Central sub-pages

**Gates on SEG-2 design return (needs theme CSS class names).**

**Instructions:**

1. Locate CT.com Hugo nav template (glob `**/cerostechnology/**/nav*.html` or `**/layouts/partials/nav*`).

2. Add "Programming Central" nav section with sub-links:
   - `/contracts` — Coding Contracts
   - `/bounties` — Bounty Posters (existing · preserve Pawn's implementation)
   - `/directors` — Guilds Directors
   - `/node-operators` — Node Operators
   - `/vote` — Vote Hub

3. Create sub-page templates (Hugo content files + layout templates):
   - `content/contracts/_index.md` — Programming Central · Coding Contracts
   - `content/directors/_index.md` — Guilds Directors
   - `content/node-operators/_index.md` — Node Operators directory
   - `content/vote/_index.md` — Vote Hub · "Many Doors One Cooperative · Your vote is your voice"

4. `/vote` sub-page content:
   - BP082 vote tiers table (20/30/50/75/100/150/200/300/500/1000 + quarterly + 25% emergency)
   - Reputation weight formula displayed: `1 + log10(Marks+1)`
   - Active elections listed (placeholder: "No active elections · check back soon")
   - Ouster reminder: "Leader ouster = demote not exile · voluntary handoff keeps Marks + rep"

5. `/node-operators` sub-page content:
   - What a Node Operator is (4-step pattern: project → hire → hired users have projects → Node Operator)
   - Current Node Operators listed (placeholder data)
   - "Become a Node Operator" CTA → links to Hiring Directors flow

6. BP085 voice throughout:
   - Many Doors One Cooperative framing on `/contracts`
   - "83.3% to creators" verbatim on bounty surfaces (where applicable)
   - NOIDs Guild Chapter highlighted on `/contracts` as primary Door

7. NEVER SCROLL SIDEWAYS — audit every new template for `overflow-x` before committing.

**Sharp-5 gate:** "Programming Central nav added · 5 sub-pages created · /vote has BP082 tier table · /node-operators has 4-step pattern · no horizontal scroll confirmed"

---

### SEG-6 · Deploy + Smoke Test
**Model:** Sonnet 4.6
**Role:** Hugo build → Firebase deploy → live verification

**Gates on SEG-2, SEG-4, SEG-5 all returning GREEN.**
**Does NOT gate on SEG-3 (backend schema) — front-end can deploy with placeholder data while Founder gate resolves.**

**Instructions:**

1. Run Hugo build from CT.com Hugo root:
   ```
   hugo --minify
   ```
   Confirm exit code 0. If build fails, do not proceed — report error to Knight.

2. Firebase deploy:
   ```
   firebase deploy --only hosting:cerostechnology
   ```
   Safe loader: if Firebase token is in `22May2026.env`, use canonical subshell pattern (BP085 BLOOD — never echo).

3. Post-deploy smoke test — curl live verification:
   ```powershell
   $base = "https://cerostechnology.com"
   $paths = @("/", "/contracts", "/directors", "/node-operators", "/vote")
   foreach ($p in $paths) {
     $code = (Invoke-WebRequest -Uri "$base$p" -UseBasicParsing -Method Head).StatusCode
     Write-Output "$p → $code"
   }
   ```
   Expected: all `200`. Report any non-200 immediately.

4. Content grep verification — confirm key strings are live:
   ```powershell
   $html = (Invoke-WebRequest -Uri "https://cerostechnology.com" -UseBasicParsing).Content
   @("Programming Central", "Coding Contracts", "Hiring Directors", "Node Operator", "Bounty Posters", "Guilds Directors") | ForEach-Object {
     if ($html -match $_) { Write-Output "FOUND: $_" } else { Write-Output "MISSING: $_" }
   }
   ```
   All 6 must return FOUND.

5. Horizontal scroll audit — grep deployed source:
   ```powershell
   $html = (Invoke-WebRequest -Uri "https://cerostechnology.com" -UseBasicParsing).Content
   if ($html -match "overflow-x:\s*scroll") { Write-Output "FAIL: horizontal scroll found" } else { Write-Output "PASS: no horizontal scroll" }
   ```

6. Report full results in Sharp-6 return.

**Sharp-6 gate:** "CT.com Programming Central LIVE · all 5 sub-pages 200 · 6 content strings FOUND · no horizontal scroll · Firebase deploy confirmed"

---

## SHARPS RETURN TABLE

Knight: populate this table as SEGs complete. Report to Founder when all 6 are GREEN (or flag any RED with blocker detail).

| # | SEG | Sharp Gate | Status |
|---|---|---|---|
| 1 | Recon — BP082 voting infra | "BP082 voting infra recon DONE — [N tables] · [N endpoints] · gap list: [...]" | PENDING |
| 2 | Design — Coding Contracts surface | "Coding Contracts surface designed · partial written · card-flip reused · no horizontal scroll confirmed" | PENDING |
| 3 | Implement — Hiring Directors role flow | "Hiring Directors schema written · eligibility trigger written · ouster stub written · Founder gate cleared" OR "PAUSED — awaiting Founder sign-off" | PENDING |
| 4 | Implement — Guilds Directors voting | "Guilds Directors partial written · /directors page written · BP082 vote tier wired · no horizontal scroll confirmed" | PENDING |
| 5 | UI Integration — Programming Central nav | "Programming Central nav added · 5 sub-pages created · /vote BP082 tier table · /node-operators 4-step pattern · no horizontal scroll confirmed" | PENDING |
| 6 | Deploy + smoke test | "CT.com Programming Central LIVE · all 5 sub-pages 200 · 6 strings FOUND · no horizontal scroll · Firebase confirmed" | PENDING |

---

## TRUTH-ALWAYS CANON

- No silent error swallow. Every SEG reports its actual state.
- If a Sharp is RED, Knight halts the dependent chain and reports to Founder before continuing.
- Partial deploys (SEG-6 frontend without SEG-3 backend) are Truth-Always legal ONLY if labeled "placeholder data — Hiring Directors backend pending Founder gate."
- BP084 wan-relay: no stranded partial states. If SEG-6 deploy fails mid-way, roll back to Pawn's baseline and report.
- Belief-vs-binary: Knight confirms Hugo build exit code + Firebase deploy receipt before reporting deploy as GREEN. "Looks like it deployed" is not a receipt.

---

## COMPOSITION CANONS (quick reference)

| Canon ref | Binding |
|---|---|
| `[[guild-node-voting-thresholds-founder-seed-proposal-bp082]]` | BP082 voting tiers 20/30/.../1000 · ouster = demote not exile · rep weight `1 + log10(Marks+1)` |
| `[[canon-many-doors-one-cooperative-membership-unity-bp085]]` | Coding Contracts as Many Doors — different Guild types are different Doors · one cooperative |
| `[[canon-become-the-boss-pm-hiring-first-marks-backed-payroll-bp085]]` | Hiring Directors = PM-hiring pattern made structural · 4-step is the canonical sequence |
| `[[canon-noids-noble-order-of-idea-developers-bp085]]` | NOIDs Guild Chapter = primary NOID-facing consumer of Coding Contracts |
| `[[canon-bounty-posters-on-ceros-technology-checkout-enabled-bp085]]` | Bounty Posters baseline from Pawn's deploy · preserve · Coding Contracts sit above |
| `[[feedback-never-scroll-sideways-ux-canon-bp081]]` | HARD BINDING · no overflow-x scroll · flex-wrap · vertical stacks · NEVER |
| `[[feedback-only-sonnet-4-6-for-segs-ever-bp081]]` | HARD BLOOD · every SEG call passes model: sonnet-4.6 |

---

## ESTIMATED KNIGHT RUNTIME

| Phase | Estimate |
|---|---|
| Gate check (curl cerostechnology.com) | 1 min |
| SEG-1 + SEG-2 (parallel) | 15–25 min |
| Founder gate review at SEG-3 | Founder-paced (Knight waits) |
| SEG-3 (post-gate, if approved) | 20–35 min |
| SEG-4 (gates on SEG-1) | 15–20 min |
| SEG-5 (gates on SEG-2) | 20–30 min |
| SEG-6 (deploy + smoke) | 10–15 min |
| **Total wall clock (excl. Founder gate)** | **~80–125 min** |

---

## PASTE-READY KNIGHT WAKE

Copy and paste to Knight session verbatim:

---

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read yoke at:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_CT_PROGRAMMING_CENTRAL_UPGRADE_BP085.md

GATE FIRST: curl https://cerostechnology.com → must be 200. If not, halt and report.

Then: SEG-1 (voting infra recon) + SEG-2 (Coding Contracts design) in parallel.
SEG-3 PAUSES for Founder gate before any backend schema changes.
SEG-4 gates on SEG-1 return. SEG-5 gates on SEG-2 return.
SEG-6 (deploy) gates on SEG-2 + SEG-4 + SEG-5 GREEN (front-end can deploy before SEG-3 with placeholder data labeled as such).

BP085 BLOOD: NEVER EXPOSE API OR SECRET KEYS EVER. Any SEG touching env vars uses canonical subshell pattern from preamble.

Return: "Sonnet 4.6" verbatim + 6 Sharps table populated + Founder gate status at SEG-3.
```

---

*Bishop · BP085 · 2026-06-17 · CerosTechnology.com — Programming Central Upgrade*
