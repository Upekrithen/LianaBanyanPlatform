# KNIGHT MARATHON · EMPRESS NAMING CAMPAIGN · BP092

**STATUS: STAGED FOR FOUNDER REVIEW — DO NOT FIRE TO KNIGHT UNTIL FOUNDER RATIFIES (A16 BLOOD)**
**Composed by:** Bishop SEG · Sonnet 4.6 · 2026-06-22
**Ratification gate:** Founder verbal or written GO at end of work cycle before Knight wake

---

## §0 · PREAMBLE — OPERATOR DISCIPLINE

**Knight is the OPERATOR MECHANIC. Bishop is the STRATEGIST.**
Bishop composed this dispatch. Knight executes it. Bishop does NOT run Hugo, Firebase, Electron, or build tools.
Bishop verifies via curl/psql only (§15 BLOOD).

**Model dispatch:** Sonnet 4.6 · use SEGs aggressively · Knight main-thread burn ≤ 5%
**A15 BLOOD:** [SEG] tags = sub-agent dispatches. [MAIN] tags = Knight main-thread only (minimal).
**BP087 §14 BLOOD:** Path-B canon inventory + brief_me as Step 0 before any build begins.
**BP087 §15 BLOOD:** Bishop pre-applies all schema migrations before Knight fires Block 1. Confirmed below.
**A16 BLOOD:** Founder ratifies open questions before this dispatch fires.
**Naming discipline:** Caithedral (not Cathedral). Framing: "The substrate cure to AI amnesia" (not "the AI that remembers"). No Lamborghini-Corolla phrasing.
**Truth-Always:** Empirical receipts only. No aspirational claims. No declared wins before verification.

---

## §0a · 4-TAGLINE PLACEMENT ARCHITECTURE (BP092 RETRO-EDIT — Founder-ratified)

The /empress/ Hugo page and /court/ Hugo page implement the full 4-tagline placement architecture per canon_one_of_us_all_of_us_network_effect_tagline_bp092 + canon_founding_foundation_naming_bp092 + canon_grab_an_oar_operational_tagline_bp092.

| Zone | Tagline | Placement | Canon |
|---|---|---|---|
| Above-fold mythic | "Name the Empress. Stop the Nothing. Be a Bastion, in a Time of Storms." | TOP HEADLINE — centered, bold, CSS class `empress-mythic-header` | canon_name_the_empress_tagline_lock_bp092 |
| Mid-fold operational | "Grab an Oar. We're rowing as we Build the Sails." | MID-PIVOT — above submission form, CSS class `empress-oar-pivot` | canon_grab_an_oar_operational_tagline_bp092 |
| Below-mid network-effect | ONE OF US. ALL OF US. + sub-line + CTA | BELOW-MID — below Court leaderboard, above member join form, CSS class `empress-one-of-us-stack` | canon_one_of_us_all_of_us_network_effect_tagline_bp092 |
| Footer scarcity | "Your Name Etched in the Founding Foundation. First 10,000." | FOOTER URGENCY — final line before close, CSS class `empress-founding-footer` | canon_founding_foundation_naming_bp092 |

**ONE OF US stack structure (3-tier):**
```
HEADLINE: ONE OF US. ALL OF US.
SUB: Every peer who joins makes the cooperative smarter — not just for themselves, but for every other member's questions.
CTA: [Join for $5/year →]
```

**Founding Foundation footer verbatim:** "Your Name Etched in the Founding Foundation. First 10,000."
**Truth-Always note:** "Founding Foundation" — Founder gave patents to the cooperative. Family retains 15%. This is not "Founder's Foundation." Never paraphrase.

---

## §0b-SCROLL · SCROLL-LINK SPEC FOR HUGO TEMPLATE (BP092 RETRO-EDIT)

The /empress/ and /court/ Hugo pages render 📜 scroll-links per canon_scroll_link_visual_pattern_for_paper_references_in_copy_bp092.

**CSS class for all scroll-links:**
```css
.scroll-link {
  font-size: 1.1em;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  color: inherit;
}
```

**Hugo template shortcode pattern:**
```html
<a href="{{ .url }}" class="scroll-link" target="_blank">📜 {{ .title }}</a>
```

**Scroll-links to wire on /empress/ page:**
- 📜 [Bicycle Economics](https://founderdenken.substack.com/p/bicycle-economics) — at the member economics paragraph (83.3% / Cost+20% / $5-membership claims)
- 📜 [The Substrate Cure](https://mnemosynec.org/substrate-cure) — at the AI-amnesia / cooperative-substrate framing paragraph
- 📜 [Boat in the Water](https://mnemosynec.org/boat-in-water) — at the No-VC / No-Ads section (if present on /empress/ page)

**Placement rule:** link at FIRST claim in a section the paper backs. One scroll-link per paper per section. Do not repeat the same link in the same section.

---

## §1 · CANONS CARRIED INTO THIS MARATHON

These canons bind Knight throughout. All active simultaneously. No canon overrides another.

**canon_knight_is_operator_mechanic_bishop_is_strategist_no_bishop_direct_hugo_firebase (BP089)**
Knight owns Hugo build, Firebase deploy, Electron build. Bishop does not touch those tools. Ever.

**canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086 (BP086)**
Any MIC broadcast emitted by the IP Ledger write hook (Block 2) MUST carry Ed25519 signature.
State-changing broadcasts require explicit user approval. No silent install. No silent broadcast.

**canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089 (BP089)**
All SQL in this Marathon uses Postgres syntax only.
gen_random_uuid() · TIMESTAMPTZ · BIGSERIAL · BYTEA · ENUM via CREATE TYPE.
No INTEGER PRIMARY KEY AUTOINCREMENT. No TEXT DEFAULT (datetime('now')). No SQLite.
Knight self-audits every .sql file before applying. Minor Council validates if uncertain.

**canon_hugo_tower_version_data_source_is_version_trust_json_not_version_json_bp090 (BP090)**
Tower download button reads version_trust.json. version.json is stale (v0.5.1). Knight reads version_trust.json for any version references.

**canon_truth_always**
Gadget receipts are empirical. Claims require receipts. If a gadget fails, Knight stops and reports. Knight does not paper over failures with aspirational prose.

**canon_tagline_substrate_cure_to_ai_amnesia_supersedes_ai_that_remembers_bp089 (BP089)**
All copy on mnemosynec.org produced by this Marathon uses "The Substrate Cure to AI Amnesia" framing.
"The AI that remembers" is forbidden on public-facing surfaces.

**canon_name_the_empress_stop_the_nothing_be_a_bastion_in_a_time_of_storms_tagline_lock_bp092 (BP092)**
Tagline lock canon = `canon_name_the_empress_stop_the_nothing_be_a_bastion_in_a_time_of_storms_tagline_lock_bp092`
Verbatim: "Name the Empress. Stop the Nothing. Be a Bastion, in a Time of Storms."
Never paraphrase. Never reorder. Never drop the third clause. Storms is plural — locked.
Apply to: /empress/ Hugo page headline · /court/ page header · Wildfire card campaign_headline field · MIC broadcast event label.

**canon_lan_as_wan_test_mode_4_machine_mesh_bp085 (BP085)**
Any mesh or relay references in this Marathon route via relay.lianabanyan.com. Never LAN-shortcut.
WAN roundtrip is the honest end-to-end test.

**canon_preferences_inferred_not_interrogated_no_questionnaire_substrate_bp086 (BP086)**
The Empress Naming Campaign leaderboard and Ghost World views NEVER ask members to fill out preference forms. Ghost-mark allocation is inferred from session behavior. No interrogation questionnaires.

---

## §2 · STATUTES BINDING

**§3** Role binding. Bishop = strategist. Knight = mechanic. Roles do not swap.
**§4** Firebase deploy canonical. NEVER raw gcloud. All deploys: `firebase deploy --only hosting:mnemosyne`
**§14** Path-B inventory before any mutation. Read before write.
**§15** Bishop pre-applies Postgres migrations before Knight fires Block 1. Schema is live when Knight starts.
**§16** Ring Bearer IP Ledger pattern. Proposal registrations write immutably. No delete permitted on ip_ledger rows.

---

## §0b · STEP 0 — PATH-B INVENTORY + BRIEF ME (MANDATORY BEFORE BLOCK 1)

[MAIN] Knight executes the following before any block fires. This is the gadget-first gate.

### STEP 0-A · brief_me

```
Knight calls: brief_me
Purpose: Load current session context, outstanding canons, open yokes, live state summary.
PASS condition: brief_me returns without error.
FAIL action: Stop. Report to Founder. Do not proceed.
```

### STEP 0-B · Path-B Canon Inventory Glob

```
[MAIN] Glob: C:\Users\Administrator\Documents\LianaBanyanPlatform\state\eblets\CANON\**\*.eblet.md
Report: Count of canon eblets found.
Assert: Count >= 96 (96 canon eblets sealed as of BP092).
FAIL action: Report discrepancy. Do not treat as blocking if count is >= 90 — log delta and proceed.
```

### STEP 0-C · Gadget — Live Hugo site reachability

```
[MAIN] Command: curl -s -o /dev/null -w "%{http_code}" https://mnemosynec.org
Assert: 200
FAIL action: Stop. Hugo site is unreachable. Do not attempt Block 3 until resolved.

Command: curl -s -o /dev/null -w "%{http_code}" https://mnemosynec.ai
Assert: 200
FAIL action: Log. Non-blocking for campaign blocks but report.
```

### STEP 0-D · Gadget — Supabase connectivity

```
[MAIN] Command: psql $SUPABASE_DB_URL -c "SELECT NOW();" 
Assert: Returns timestamp without error.
FAIL action: Stop. All schema blocks depend on Supabase being live.
```

### STEP 0-E · Gadget — version_trust.json current version

```
[MAIN] Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\data\version_trust.json
Assert: File exists and contains a "version" field.
Capture current version string. Log it. Used in Block 8 gate decision.
FAIL action: Stop. Report. version_trust.json is the canonical Tower source (BP090 canon).
```

### STEP 0-F · Gadget — Existing empress_proposals table check

```
[MAIN] Command: psql $SUPABASE_DB_URL -c "\dt public.empress_proposals"
Purpose: Determine if schema already partially exists (idempotency protection).
PASS (exists): Log. Bishop pre-applied schema. Proceed.
PASS (not exists): Log. Confirm Bishop pre-apply ran. Proceed — Bishop applied schema before this Marathon fired.
FAIL (connection error): Stop. Report.
```

### STEP 0-G · Gadget — Wildfire Cue Deck Card schema check

```
[MAIN] Command: psql $SUPABASE_DB_URL -c "\dt public.wildfire_cue_deck_cards" 2>/dev/null || echo "NOT_FOUND"
Purpose: Block 5 depends on whether existing wildfire schema exists.
Capture result. Pass to Block 5 SEG as precondition context.
```

### STEP 0-H · Gadget — Edge Functions currently deployed

```
[MAIN] Command: supabase functions list
Assert: Returns list without error.
Capture: List of deployed edge function names.
Used in Block 4 and Block 8 gate decisions.
FAIL action: Log. Non-blocking but note gap.
```

### STEP 0-I · Gadget — Geo-IP infra check

```
[MAIN] Grep: C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\ for "geoip" OR "geo_ip" OR "ip_location" OR "country_code"
Purpose: Block 7 country-detection depends on whether geo-IP infra already exists.
Capture: YES_EXISTS or NOT_FOUND.
Pass result to Block 7 SEG.
```

### STEP 0-J · Gadget — Influencer referral schema check

```
[MAIN] Command: psql $SUPABASE_DB_URL -c "\dt public.referral_codes" 2>/dev/null || echo "NOT_FOUND"
Purpose: Block 6 depends on referral_codes table state.
Capture result. Pass to Block 6 SEG.
```

**STEP 0 COMPLETE GATE:** All gadget receipts logged. Step 0 inventory written to:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\KNIGHT_DROPZONE\EMPRESS_CAMPAIGN_STEP0_INVENTORY_BP092.md`

Knight does not proceed to Block 1 until this file is written with all 10 gadget results.

---

## §3 · BISHOP PRE-APPLY NOTE (§15 BLOOD — CONFIRMED)

Bishop applies the following Postgres migrations BEFORE Knight fires.
Knight reads them as already-live on arrival. Knight does NOT re-apply them.
If Knight finds them missing via Step 0-F, Knight stops and reports — Bishop has a pre-apply failure.

**Migrations to be pre-applied by Bishop:**

```sql
-- FILE: 20260622_empress_proposals_BISHOP_APPLY.sql
-- FILE: 20260622_empress_votes_real_BISHOP_APPLY.sql  
-- FILE: 20260622_empress_votes_ghost_BISHOP_APPLY.sql
-- FILE: 20260622_empress_prize_eligibility_view_BISHOP_APPLY.sql
-- FILE: 20260622_empress_rls_policies_BISHOP_APPLY.sql
```

Schema specified in Block 1 below. Bishop composes and applies these files as a separate step
before this dispatch fires to Knight.

---

## BLOCK 1 — SCHEMA (Bishop pre-applies via §15 BLOOD · Knight gadget-verifies only)

**[MAIN] Knight role in Block 1:** Read-only verification. Knight does NOT apply schema. Bishop already applied it.

### BLOCK 1-A — Schema Verification SEG

[SEG] Sub-agent: Verify empress schema is live.

```
Dispatch: Schema verification agent
Task: Confirm the following tables exist in public schema with correct columns.

TABLE: empress_proposals
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY
  member_id       UUID NOT NULL REFERENCES members(id)
  proposed_name   TEXT NOT NULL
  appearance_image_url TEXT
  ip_ledger_hash  TEXT
  created_at      TIMESTAMPTZ DEFAULT NOW()
  country_local   TEXT
  real_votes      INT DEFAULT 0
  ghost_votes     INT DEFAULT 0
  status          proposal_status (ENUM: 'pending', 'approved', 'rejected', 'winner')

TABLE: empress_votes_real
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY
  proposal_id     UUID NOT NULL REFERENCES empress_proposals(id)
  member_id       UUID NOT NULL REFERENCES members(id)
  marks_amount    INT NOT NULL DEFAULT 1
  created_at      TIMESTAMPTZ DEFAULT NOW()
  CONSTRAINT uq_empress_real_vote UNIQUE (proposal_id, member_id)
  -- NOTE: UNIQUE per (proposal, member) enforces 1 vote per member per proposal.
  -- Founder must confirm this is the intended mechanic (Open Question #5).

TABLE: empress_votes_ghost
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY
  proposal_id     UUID NOT NULL REFERENCES empress_proposals(id)
  ghost_session_id TEXT NOT NULL
  ghost_marks_amount INT NOT NULL DEFAULT 1
  created_at      TIMESTAMPTZ DEFAULT NOW()
  evaporates_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 day')
  -- Ghost votes evaporate end-of-day. Scheduled cleanup via pg_cron or edge function.

VIEW: empress_prize_eligibility
  -- 60 winners draw — 1 per country_local
  -- Ranked by real_votes DESC within each country_local partition
  -- Members only (member_id NOT NULL, status = 'approved')
  -- Definition: ROW_NUMBER() OVER (PARTITION BY country_local ORDER BY real_votes DESC)
  -- Winner candidates: row_number = 1 per country_local, top 60 by country_local coverage
  -- Founder must confirm country_local definition (Open Question #3)

RLS POLICIES:
  empress_proposals: SELECT = public (anon + authenticated)
  empress_proposals: INSERT = authenticated (members only, own rows)
  empress_proposals: UPDATE = service_role only (moderation)
  empress_votes_real: SELECT = public
  empress_votes_real: INSERT = authenticated (member, own vote only)
  empress_votes_ghost: SELECT = public
  empress_votes_ghost: INSERT = anon + authenticated (Ghost World ungated)

Verification commands:
  psql $SUPABASE_DB_URL -c "\d public.empress_proposals"
  psql $SUPABASE_DB_URL -c "\d public.empress_votes_real"
  psql $SUPABASE_DB_URL -c "\d public.empress_votes_ghost"
  psql $SUPABASE_DB_URL -c "\d public.empress_prize_eligibility"

PASS condition: All 4 objects return column descriptions without error.
FAIL action: Stop. Report missing objects to Founder. Bishop pre-apply failed.
```

**[MAIN] Block 1 receipt:** Knight writes pass/fail for each table to EMPRESS_CAMPAIGN_STEP0_INVENTORY file. Proceeds to Block 2 only on full PASS.

---

## BLOCK 2 — IP LEDGER WRITE HOOK

[SEG] Sub-agent: Implement IP Ledger write service for proposal registration.

**Scope:** When a member submits an empress proposal (INSERT into empress_proposals), a trigger or edge function:
1. Computes Ed25519-signed hash of the proposal payload (proposed_name + member_id + appearance_image_url + created_at)
2. Writes a row to the ip_ledger table (BP087 §16 Ring Bearer pattern)
3. Emits a MIC broadcast event (signed per canon_mic_stamped)
4. Updates empress_proposals.ip_ledger_hash with the resulting hash

**Gadget-first precondition:**
```
[SEG] Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\ip_ledger\
Assert: ip_ledger directory exists and contains at least one schema or implementation file.
Capture: Existing ip_ledger schema (table name, columns, insert pattern).
Use existing ip_ledger pattern — do NOT invent a new one.
FAIL (directory missing): Stop. Report. ip_ledger infra does not exist yet. Bishop must scaffold first.
```

**Implementation:**
```
[SEG] Create edge function: supabase/functions/empress-ip-ledger-hook/index.ts

Function trigger: On empress_proposals INSERT (via Supabase webhook or pg trigger calling edge fn)

Logic:
  1. Receive proposal payload (id, member_id, proposed_name, appearance_image_url, created_at)
  2. Compute SHA-256 of JSON.stringify(payload) — deterministic field ordering
  3. Sign hash with Ed25519 private key (from env: EMPRESS_LEDGER_SIGNING_KEY)
  4. INSERT into ip_ledger: { subject_type: 'empress_proposal', subject_id: proposal.id,
       hash: computed_hash, signature: ed25519_sig, signed_by: 'empress-ip-ledger-hook',
       created_at: NOW(), replication_status: 'local' }
     -- replication_status = 'local' now; frontier mesh replication deferred (frontier bug open per MEMORY)
  5. UPDATE empress_proposals SET ip_ledger_hash = computed_hash WHERE id = proposal.id
  6. Emit MIC broadcast event: { event: 'empress_proposal_registered', proposal_id: id,
       ledger_hash: computed_hash, signed: true }
     -- MIC broadcast MUST be Ed25519 signed (canon_mic_stamped BP086)

Environment variable required:
  EMPRESS_LEDGER_SIGNING_KEY — Founder must confirm key provisioning (or generate new keypair for this function)

PASS condition: Edge function deploys without error. Test with mock proposal INSERT.
FAIL action: Log error. Do not block other blocks — but flag for Founder: IP Ledger hook not live.
```

**Deployment:**
```
[SEG] Deploy: supabase functions deploy empress-ip-ledger-hook
Assert: Deploy succeeds.
Test: psql $SUPABASE_DB_URL -c "INSERT INTO empress_proposals (member_id, proposed_name) VALUES ('<test_member_uuid>', 'Test Empress Name') RETURNING id;"
Verify: ip_ledger row created with matching subject_id.
Clean up test row after verification.
```

---

## BLOCK 3 — HUGO "THE COURT" PAGE

[SEG] Sub-agent: Build The Court leaderboard page on mnemosynec.org.

**Gadget-first precondition:**
```
[SEG] Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\
List: Existing pages. Look for court.md, empress.md, or any campaign page.
Capture: Whether a "court" page already exists.
Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\
Capture: Available layout templates (list, single, custom).
Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\
Note existing JS patterns — vanilla JS confirmed per dispatch (no React, no framework).
```

**Page structure:**

```
File: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\court.md
Title: "The Court"
Layout: court (custom layout — see below)
Description: "The Empress needs a name. Be a Bastion. Name the Empress. STOP the Nothing."

Page sections:
  - Page header (above all content, above the leaderboard): Tagline lock verbatim — "Name the Empress. Stop the Nothing. Be a Bastion, in a Time of Storms." — centered, bold, CSS class `court-tagline-header`. Canon: `canon_name_the_empress_stop_the_nothing_be_a_bastion_in_a_time_of_storms_tagline_lock_bp092`. Never paraphrase. Never reorder. Never drop the third clause. Storms is plural — locked.
  - Hero: Crown icon (SVG inline). Headline verbatim: "The Empress MnemosyneC needs a New Name. Be a Bastion. Name the Empress. STOP the Nothing."
  - Ghost World notice: "Anyone can vote. Members' proposals win prizes. Join for $5/yr."
  - Mid-page CTA (above the "join the campaign / submit proposal" form): Oar tagline verbatim — "Grab an Oar. We're rowing as we Build the Sails." — centered, bold, CSS class `court-oar-cta`. Canon: `canon_grab_an_oar_rowing_while_building_sails_operational_tagline_pair_bp092`. Placed BELOW the Empress mythic header, ABOVE the submission form.
  - Leaderboard table (18 rows, 30-second auto-rotate)
  - Below-mid network-effect stack (below leaderboard, above submission form): CSS class `empress-one-of-us-stack`
      HEADLINE: "ONE OF US. ALL OF US."
      SUB: "Every peer who joins makes the cooperative smarter — not just for themselves, but for every other member's questions."
      CTA: "Join for $5/year →" (links to join modal)
  - Submit proposal CTA button (members only — auth-gated click handler)
  - Footer scarcity line (final line above page close): "Your Name Etched in the Founding Foundation. First 10,000." — CSS class `empress-founding-footer`, centered, bold
```

**Leaderboard layout (18 rows, 30-second rotation):**

Rows 1-3: Newest proposals (newest first)
Rows 4-6: Day top-3 by real_votes (highlighted — distinct color/border)
Rows 7-9: Next newest proposals
Rows 10-12: Week top-3 by real_votes (highlighted — distinct color/border)
Rows 13-15: Next newest proposals
Rows 16-18: Overall top-3 by real_votes (highlighted — distinct color/border)

Highlighted rows (4-6, 10-12, 16-18): distinct CSS class `court-top-row` with border accent.
Standard rows (1-3, 7-9, 13-15): class `court-new-row`.

**Each row contains:**
- Member display name (does not have to be real name — display_name from member profile)
- Proposed name for the Empress
- Appearance picture (img tag from appearance_image_url — fallback placeholder if null)
- Real vote count (solid label)
- Ghost vote count (ghost/faded label)
- Vote button: "Cast Vote" — triggers vote-empress edge function

**REST endpoint:**
```
Supabase REST: GET /rest/v1/empress_proposals?select=*&order=created_at.desc&limit=50
Knight composes client-side JS fetch calls with appropriate sort/filter per bucket:
  Newest: order=created_at.desc&limit=9&status=eq.approved
  Day top: order=real_votes.desc&limit=3&created_at=gte.(today 00:00 UTC)&status=eq.approved
  Week top: order=real_votes.desc&limit=3&created_at=gte.(7 days ago)&status=eq.approved
  Overall top: order=real_votes.desc&limit=3&status=eq.approved
```

**Auto-rotate (vanilla JS):**
```javascript
// 30-second rotation cycle
// Buckets: newest-A (rows 1-3), day-top (rows 4-6), newest-B (rows 7-9),
//          week-top (rows 10-12), newest-C (rows 13-15), overall-top (rows 16-18)
// On each 30s tick: refetch all buckets from REST endpoint. Re-render all 18 rows.
// No page reload. Fetch → render loop via setInterval(refreshCourt, 30000)
// Failure handling: on fetch error, keep existing rows displayed. Log to console.
```

**Court leaderboard page-foot (above pagination):**
```
Page footer text (above pagination controls, below the 18-row leaderboard):
  "Grab an Oar. We're rowing as we Build the Sails."
  CSS class: `court-oar-footer` — centered, muted weight (not bold; body weight, italic acceptable).
  Canon: `canon_grab_an_oar_rowing_while_building_sails_operational_tagline_pair_bp092`.
  Appears on every rotate cycle — static, does not refresh with the leaderboard rows.
```

**Home page button:**
```
[SEG] Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\_index.md
Add: "The Court" button in navigation or hero section.
Button text: "The Court →"
Button href: /court/
Position: After primary CTA buttons. Before footer.
Do NOT remove existing buttons.
```

**Hugo build:**
```
[MAIN] Knight runs: cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo && hugo --minify
Assert: Build completes with 0 errors. Warning count logged (non-blocking).
FAIL action: Stop. Report build error. Do not deploy broken build.
```

**Firebase deploy:**
```
[MAIN] Knight runs: firebase deploy --only hosting:mnemosyne
Assert: Deploy succeeds. Hosting URL returned.
Verification: curl -s -o /dev/null -w "%{http_code}" https://mnemosynec.org/court/
Assert: 200
FAIL action: Stop. Report.
```

---

## BLOCK 4 — VOTE HANDLERS

[SEG] Sub-agent: Implement vote-empress edge function.

**Precondition gadget:**
```
[SEG] Capture Step 0-H result: Is a "vote-empress" function already deployed?
If YES: Read existing function source before modifying.
If NO: Implement fresh.
```

**Edge function: vote-empress**

```
File: supabase/functions/vote-empress/index.ts

Input payload: {
  proposal_id: string (UUID),
  session_token: string | null,  // null = ghost session
  ghost_session_id: string | null,  // populated if no auth
  marks_amount: number (default 1)
}

Auth detection:
  - Read Authorization header. If valid JWT → member vote flow.
  - If no JWT or invalid JWT → ghost vote flow.

MEMBER VOTE FLOW:
  1. Decode JWT. Extract member_id.
  2. Check empress_votes_real for existing (proposal_id, member_id) pair.
     If exists: return 409 { error: "already_voted" }
     -- UNIQUE constraint also enforces this at DB level.
  3. Deduct marks_amount from member's marks balance.
     (Read: SELECT marks_balance FROM members WHERE id = member_id)
     If insufficient marks: return 402 { error: "insufficient_marks" }
  4. INSERT into empress_votes_real: { proposal_id, member_id, marks_amount }
  5. UPDATE empress_proposals SET real_votes = real_votes + marks_amount WHERE id = proposal_id
  6. Deduct from member marks balance: UPDATE members SET marks_balance = marks_balance - marks_amount
  7. Return 200 { success: true, vote_type: "real", new_real_votes: <updated count> }

GHOST VOTE FLOW:
  1. ghost_session_id is required. If missing: return 400.
  2. Check daily ghost-mark allowance for this ghost_session_id.
     -- Founder must confirm ghost mark daily allowance (Open Question #1 — default: 500/day).
     SELECT SUM(ghost_marks_amount) as used FROM empress_votes_ghost
       WHERE ghost_session_id = $1
         AND created_at >= NOW() - INTERVAL '1 day'
     If used + marks_amount > GHOST_DAILY_ALLOWANCE: return 429 { error: "ghost_limit_reached" }
  3. INSERT into empress_votes_ghost: { proposal_id, ghost_session_id, ghost_marks_amount: marks_amount,
       evaporates_at: NOW() + INTERVAL '1 day' }
  4. UPDATE empress_proposals SET ghost_votes = ghost_votes + marks_amount WHERE id = proposal_id
  5. Return 200 { success: true, vote_type: "ghost", ghost_votes_remaining: <allowance - used> }

GHOST DAILY ALLOWANCE constant:
  const GHOST_DAILY_ALLOWANCE = parseInt(Deno.env.get("GHOST_DAILY_ALLOWANCE") ?? "500")
  -- Default 500 pending Founder confirmation (Open Question #1).

DOUBLE-VOTE PROTECTION:
  - Member: UNIQUE constraint (proposal_id, member_id) on empress_votes_real + application check.
  - Ghost: Daily allowance cap. No per-proposal unique constraint for ghosts (ghosts can spread votes).
  -- Founder must confirm ghost per-proposal uniqueness preference (Open Question #5 covers member side;
     ghost side is open — current spec allows ghosts to vote on same proposal multiple times up to daily cap).

LEADERBOARD DISPLAY NOTE:
  Both real_votes and ghost_votes display on The Court page.
  Ghost votes are visually distinguished (faded/italic label: "👻 ghost marks").
  Only real_votes count for prize eligibility.
  -- Founder to confirm: two separate leaderboard columns or side-by-side leaderboards? (Open Question #4)
```

**Deploy:**
```
[SEG] supabase functions deploy vote-empress
Assert: Deploy succeeds.
Smoke test: curl POST to function with ghost_session_id, valid proposal_id.
Assert: 200 response with vote_type: "ghost".
```

---

## BLOCK 5 — WILDFIRE CUE DECK CARD INTEGRATION

[SEG] Sub-agent: Generate Wildfire Cue Deck Cards for empress proposals.

**Precondition gadget (uses Step 0-G result):**
```
[SEG] Read Step 0-G wildfire schema result.

IF wildfire_cue_deck_cards EXISTS:
  Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\ — find existing wildfire edge function or card generation logic.
  Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\ — find existing wildfire card Hugo template.
  Map: How existing cards are generated. Replicate pattern for empress proposals.

IF wildfire_cue_deck_cards NOT FOUND:
  Report: Wildfire Cue Deck Card schema not yet live. Knight creates a stub schema.
  CREATE TABLE wildfire_cue_deck_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_type TEXT NOT NULL,
    subject_id UUID,
    subject_type TEXT,
    member_share_url TEXT,
    card_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  Log: Stub only. Full wildfire schema is a separate future Knight Marathon.
```

**Card generation logic:**
```
On empress_proposals INSERT (approved status):
  Generate card: {
    card_type: 'empress_proposal',
    subject_id: proposal.id,
    subject_type: 'empress_proposal',
    member_share_url: 'https://mnemosynec.org/court/?proposal=' + proposal.id + '&ref=' + member.id,
    card_data: {
      proposed_name: proposal.proposed_name,
      appearance_image_url: proposal.appearance_image_url,
      member_display_name: member.display_name,
      campaign_headline: "Name the Empress. STOP the Nothing."
    }
  }
  INSERT INTO wildfire_cue_deck_cards (...)

Share URL pattern: /court/?proposal=<uuid>&ref=<member_id>
  - proposal param: pre-highlights that row on The Court leaderboard.
  - ref param: referral tracking (feeds Block 6 influencer contest).
```

**Hugo card template:**
```
[SEG] If wildfire Hugo template exists, add empress_proposal card_type rendering branch.
      If not, create: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\wildfire-empress-card.html
      Card renders: crown icon + proposed_name + appearance_image + share button.
```

---

## BLOCK 6 — INFLUENCER CONTEST SCAFFOLDING

[SEG] Sub-agent: Implement referral-code tracking and influencer leaderboard sub-page.

**Precondition gadget (uses Step 0-J result):**
```
[SEG] Read Step 0-J referral_codes result.

IF referral_codes EXISTS:
  Read existing schema. Map referral code pattern.
  Extend to include: source_type = 'empress_campaign', campaign_id = 'empress_bp092'.

IF referral_codes NOT FOUND:
  CREATE TABLE referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id),
    code TEXT NOT NULL UNIQUE,
    source_type TEXT,
    campaign_id TEXT,
    click_count INT DEFAULT 0,
    conversion_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  Postgres only. No SQLite primitives.
```

**Referral tracking:**
```
Share URL: /court/?proposal=<uuid>&ref=<member_id>
On page load in The Court JS:
  Read URL params. If ref param present:
    POST /rest/v1/referral_codes?member_id=ref_param PATCH click_count + 1
    Store ref_member_id in sessionStorage for conversion tracking.
On member conversion (new $5/yr membership after clicking ref link):
  POST to referral tracking edge function: { ref_member_id, new_member_id, campaign_id: 'empress_bp092' }
  UPDATE referral_codes SET conversion_count = conversion_count + 1 WHERE member_id = ref_member_id AND campaign_id = 'empress_bp092'
```

**Influencer leaderboard sub-page:**
```
File: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\court-influencers.md
Title: "Empress Campaign — Influence Leaderboard"
Layout: Simple table. Columns: Influencer display name | Proposals submitted | Votes referred | Members converted
Data: Live REST fetch from referral_codes + empress_proposals JOIN.
Link from The Court page: small footer link "Influencer Board →"

Note: Bookworm / Influence / Participate winner-path weighting = Open Question #7.
Knight scaffolds the tracking. Weighting formula awaits Founder ratification.
```

---

## BLOCK 7 — COUNTRY/LOCAL DETECTION

[SEG] Sub-agent: Implement country/local detection for the 60-winner draw.

**Precondition gadget (uses Step 0-I result):**
```
[SEG] Read Step 0-I geo-IP result.

IF geo-IP infra EXISTS:
  Map how it works. Wire empress_proposals.country_local on INSERT from geo-IP lookup.
  Log: Geo-IP infra found at <path>. Using existing pattern.

IF geo-IP infra NOT FOUND:
  Implement: Member self-declares country_local at proposal submission time.
  UI: country_local field on proposal submission form.
    - Dropdown: ISO 3166-1 alpha-2 country codes (standard list).
    - Optional sub-field: US state (if country = US) or province/region.
    - Field label: "Your country (for prize draw)"
    - Placeholder: "Select country"
  Schema: empress_proposals.country_local already TEXT — no migration needed.
  Note: Founder must confirm country_local definition (Open Question #3).
    Current default: ISO country code. US = separate state entries if Founder confirms.
```

**Prize draw logic:**
```
empress_prize_eligibility view already defined in Block 1.
View partitions by country_local, ranks by real_votes DESC within each partition.
Knight gadget-verifies the view returns expected results with test data:
  psql $SUPABASE_DB_URL -c "SELECT * FROM empress_prize_eligibility LIMIT 10;"
Assert: Returns rows with rank column. Row with rank=1 per country_local = winner candidate.
PASS condition: View returns without error.
FAIL action: Report view definition error to Bishop.
```

---

## BLOCK 8 — DEPLOY-ALL-TOUCHED GATE

[MAIN] Knight main-thread executes all final verification steps. No SEG for this block — Knight confirms personally.

### BLOCK 8-A · Edge Function Deployment Verification

```
[MAIN] Run: supabase functions list
Assert: The following functions appear in the list as DEPLOYED:
  - empress-ip-ledger-hook  (Block 2)
  - vote-empress            (Block 4)
  Any Block 5/6 edge functions if created.
FAIL condition: Any expected function missing from list.
FAIL action: Re-deploy missing function. Confirm before proceeding to 8-B.
```

### BLOCK 8-B · Hugo Rebuild Confirmation

```
[MAIN] Confirm: Hugo build completed in Block 3 with 0 errors.
If Block 3 was blocked or failed: Run hugo --minify now.
Assert: Build artifact in public/ or dist/ directory — verify with file count check.
```

### BLOCK 8-C · Firebase Hosting Deploy Confirmation

```
[MAIN] Confirm: firebase deploy --only hosting:mnemosyne ran in Block 3.
Verification curl:
  curl -s -o /dev/null -w "%{http_code}" https://mnemosynec.org/court/
Assert: 200
  curl -s -o /dev/null -w "%{http_code}" https://mnemosynec.org/court-influencers/
Assert: 200 (or 404 if sub-page not added — log, non-blocking)
  curl -s https://mnemosynec.org/ | grep -i "the court"
Assert: "The Court" button present in homepage HTML.
FAIL action: Stop. Report. Do not mark Marathon complete.
```

### BLOCK 8-D · version_trust.json Bump Decision Gate

```
[MAIN] Decision: Does this Marathon warrant a version bump?

Rule (from canon_hugo_tower_version_data_source_is_version_trust_json_bp090):
  - Version bump is warranted for functional capability additions.
  - Content-only or feature-add campaigns: Bishop judgment call.

This Marathon adds:
  - New Supabase tables (empress_proposals, empress_votes_real, empress_votes_ghost)
  - New edge functions (empress-ip-ledger-hook, vote-empress)
  - New Hugo page (/court/)
  - New influencer scaffolding

Recommendation: MINOR version bump warranted (new user-facing feature + backend schema).
Founder to confirm. If Founder says yes: Knight bumps version_trust.json
  current_version → <current_version + 0.0.1 or next minor per Founder direction>

IF NO BUMP (Founder says no): Skip this step. Log: No bump per Founder direction.
IF BUMP (Founder says yes):
  Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\data\version_trust.json
  Edit: version field to new value.
  Hugo rebuild: hugo --minify
  Firebase redeploy: firebase deploy --only hosting:mnemosyne
  Verify: curl https://mnemosynec.org and check version displayed.
```

### BLOCK 8-E · Marathon Return File

```
[MAIN] Knight writes Marathon return file:
Path: C:\Users\Administrator\Documents\LianaBanyanPlatform\KNIGHT_DROPZONE\EMPRESS_CAMPAIGN_MARATHON_RETURN_BP092.md

Contents:
  - Step 0 gadget results (all 10)
  - Block 1 schema verification result
  - Block 2 IP Ledger hook deploy status + test receipt
  - Block 3 Hugo build receipt (page URL live)
  - Block 4 vote-empress deploy status + smoke test receipt
  - Block 5 wildfire integration status (existing schema or stub created)
  - Block 6 referral scaffold status
  - Block 7 country detection method (geo-IP found or self-declare)
  - Block 8 deploy verification results
  - Open Questions encountered during build (any new ones surfaced)
  - Anything Knight was unable to complete with reason
```

---

## OPEN QUESTIONS — FOUNDER RATIFICATION REQUIRED BEFORE FIRE

**10 open questions. All must be answered before Knight fires this dispatch.**

### OQ-1 · Ghost-mark daily allowance
Current default in code: 500/day per ghost_session_id.
**Founder to confirm:** Is 500 the right number, or different?
Consequence: Sets GHOST_DAILY_ALLOWANCE env var before Block 4 deploys.

### OQ-2 · Ghost-to-member unlock threshold
The vote-empress function references ghost→real marks conversion ("there is a whole system").
**Founder to confirm:** What is the unlock spec?
  - Does accumulating ghost marks create any benefit at membership conversion?
  - Does ghost vote history carry over on signup?
  - Is there a ghost-mark threshold that triggers a join prompt?
Consequence: Block 4 ghost vote flow logic. Stub present; full spec needed for correct implementation.

### OQ-3 · Country/local definition for 60-winner draw
Current default: ISO 3166-1 alpha-2 country code (2-letter).
**Founder to confirm:**
  a) ISO country code only (e.g., "US", "CA", "DE") → 60 country slots
  b) US = per-state entries (50 + territories) + other countries → more than 60 total slots possible
  c) Smaller: city/local level?
  d) Exactly 60 slots: which 60 countries are eligible?
Consequence: Determines empress_prize_eligibility view partition key and winner pool size.

### OQ-4 · Vote-weighting formula — real vs ghost display
Two options:
  a) Single leaderboard: 1 real mark = N ghost marks (combined score). Founder sets N.
  b) Two separate columns: real_votes and ghost_votes displayed side-by-side. Ghost votes are informational only.
Current implementation: Option b (separate columns, ghost informational only).
**Founder to confirm:** Is option b correct, or does Founder want a combined weighted score?
Consequence: Changes leaderboard sort logic in The Court page + empress_prize_eligibility view.

### OQ-5 · Vote constraints — ✅ LOCKED (BP092 Founder-direct Q8)

Founder ratified (verbatim Q8): "Unlimited marks within constraints imposed long ago. We make it
impossible for anyone to gain more than 5% of any project (gadget how). Number of marks just adds
weight to your vote — it's still only your vote. For binary 'do you want this feature or not' = 1
vote only. For 'voting for getting this product made' or 'voting AGAINST something getting made' =
mark-weighted, have at."

Canon ref: `canon_vote_constraints_5_percent_max_per_project_marks_weight_single_vote_binary_unlimited_directional_bp092`

**Implementation for Knight Block 1 schema:**

empress_votes_real UNIQUE constraint:
- The empress vote IS a binary vote ("do you want this name or not") — one vote per member per proposal.
- UNIQUE constraint (proposal_id, member_id) STAYS as written.

empress_votes_real marks_amount:
- marks_amount = marks WEIGHT added (still only 1 vote identity). Default = 1 mark.
- Members can spend more marks to add weight but cannot cast a second vote for same proposal.

5% per-project cap:
- Pre-vote check: member's existing project ownership stake < 5%.
- [[Sibling SEG Q8 5% enforcement mechanism — pending]] — Bishop cross-binds when landed.
- For now: Knight adds a stub check function referencing this open work item.

GHOST votes: no UNIQUE constraint (ghosts can spread marks across proposals; daily allowance cap applies).

### OQ-6 · Campaign start/end dates — ✅ PARTIALLY LOCKED (BP092 Founder-direct)

EVENT-DRIVEN, NOT TIME-DRIVEN (Founder verbatim Q10):
- Campaign starts: ASAP
- Campaign ends: When membership hits 10,000 (the event, not a date)
- Cohort model: Rolling 3-week cohorts (new cohort weekly, always 3 concurrent)
  See full Bishop analysis: `BISHOP_ANALYSIS_EMPRESS_CAMPAIGN_DATES_EVENT_VS_ROLLING_COHORT_BP092.md`
  See canon: `canon_empress_campaign_event_driven_rolling_3_week_cohorts_bp092_proposed`

Knight Block implementation note: NO countdown timer to a date. Show "Cohort X · closes in N days"
instead (countdown to cohort close, not campaign end). Campaign-wide: show member count progress
toward 10,000 milestone.

Still open: exact prize pool per cohort (60 winners total vs 60 per cohort — Bishop proposes
proportional slice; Founder confirms). Ghost World voting window = cohort duration (3 weeks).
Consequence: empress_cohorts table needed (see canon for schema).

### OQ-7 · Bookworm / Influence / Participate winner-path weighting
Three win paths for the 60-winner draw:
  - Bookworm: heavy usage/engagement metric
  - Influence: referral + conversion (Block 6)
  - Participate: simply registered a proposal
**Founder to confirm:**
  a) Equal-third buckets: 20 winners per path?
  b) Judged allocation: Founder selects winners across paths?
  c) Vote-only: real_votes determine all 60 winners regardless of path?
Consequence: empress_prize_eligibility view + referral_codes weighting formula in Block 6.

### OQ-8 · Existing Wildfire Cue Deck Card schema
Step 0-G gadgets this. But if Founder knows the answer now:
**Founder to confirm:** Is wildfire_cue_deck_cards live in Supabase?
  YES → Knight reads existing schema in Block 5 and integrates.
  NO → Knight creates stub in Block 5 (schema above).
Consequence: Block 5 path selection. If stub, full wildfire Marathon is a separate dispatch.

### OQ-9 · Appearance image storage
Member uploads a drawing/image for the Empress appearance.
Two options:
  a) Supabase Storage bucket: `empress-appearances` bucket (Knight creates in Block 1 or separately).
     Upload via Supabase Storage API. appearance_image_url = Supabase Storage public URL.
  b) External CDN: member provides URL directly. No upload infrastructure needed now.
**Founder to confirm:** Supabase Storage bucket (a) or external URL (b)?
Consequence: Block 1 schema fine either way. Upload UI complexity differs significantly.
  Option a requires a file upload edge function or client-side Supabase Storage SDK call.
  Option b is simpler now but less controlled.

### OQ-10 · Moderation policy — ✅ LOCKED HYBRID (BP092 Founder-direct)

Founder ratified Q7 (verbatim): "Hybrid. At least Minor Council if not full Star Chamber review,
which categorizes it, and then based on each member's settings (non-members default to Shirley Temple
level; can only change by being members so they have a stamp to prove it that gets recorded in ledger
as transaction), they can see it or not, and community can either say miscategorized and vote to
change it. Part of the Reputation and XP system."

Canon ref: `canon_empress_moderation_hybrid_minor_council_to_star_chamber_reputation_xp_shirley_temple_default_bp092`

**Implementation for Knight Block 1 schema:**
empress_proposals.status ENUM: ('pending_review', 'approved', 'rejected', 'winner')
empress_proposals.category: TEXT — written by Minor Council after review
empress_proposals.category_confidence: FLOAT — Star Chamber confidence score

Knight Block 2 (empress-ip-ledger-hook): INSERT status='pending_review' always.
Minor Council categorization call fires async — sets category + updates status to 'approved'.
Low-confidence or contested → escalates to Star Chamber.

Knight Block 3 (The Court JS): filter by viewer auth state:
- Non-member: WHERE category IN ('shirley_temple', 'general') AND status='approved'
- Member default: WHERE status='approved' (full category range)
- Member with changed settings: WHERE category IN (<their ledger-recorded setting>) AND status='approved'

Community recategorization: separate endpoint, vote via Reputation/XP rails. Knight scaffolds
endpoint; full Reputation/XP wiring = follow-on Marathon.

empress_proposals schema ADD before Block 1 Bishop pre-apply:
  `category TEXT DEFAULT 'pending_categorization'`
  `category_confidence FLOAT`

---

## §4 · RATIFICATION STATUS (updated BP092)

### LOCKED (Founder-direct answers received):
- **OQ-10 (Moderation)** — ✅ LOCKED: Hybrid Minor-Council + Star-Chamber + Shirley Temple default + community vote
- **OQ-6 (Campaign dates)** — ✅ LOCKED: EVENT-driven, starts ASAP, ends at 10k; rolling 3-week cohorts
- **OQ-5 (Vote constraints)** — ✅ LOCKED: Binary = 1 vote per member per proposal (UNIQUE stays); marks = weight; 5% project cap

### PENDING — awaiting sibling SEG gadget results or Founder:
- **OQ-1 (Ghost daily allowance)** — PENDING Founder confirm exact number (~500 default)
- **OQ-2 (Ghost-to-member unlock)** — PENDING: stub in Block 4; full spec = follow-on Marathon
- **OQ-3 (Country/local definition)** — PENDING: ISO alpha-2 default; US state breakdown TBD
- **OQ-4 (Vote weighting formula)** — PENDING: two-column default (separate real/ghost) in code; Founder to confirm
- **OQ-7 (Win-path weighting)** — PENDING sibling SEG + Founder
- **OQ-8 (Wildfire schema)** — PENDING Step 0-G gadget
- **OQ-9 (Image storage)** — PENDING: Supabase Storage vs external URL; significant scope difference
- **OQ-11 through OQ-16** (if any surfaced by sibling SEG) — PENDING sibling SEG gadget results

**Note:** OQs 9, 11-16 listed as awaiting Bishop main thread (sibling SEG working Q8 5% rule and
Q12-Q16 in parallel — do NOT lock those until sibling returns results to Bishop main thread).

---

## §5 · ARCHBISHOP NOTES (Bishop to Founder)

- **Empress IS the Substrate.** The Court copy must reflect this. The Empress is not Dr. MnemosyneC — she IS the cooperative substrate itself. Dr. MnemosyneC's portrait + crown = Empress portrait. Knight renders no Empress portrait independently; existing Dr. M art asset + crown overlay is the identity lock.
- **"STOP the Nothing"** — this phrase is campaign-class copy. It must appear verbatim on The Court page hero, on the Wildfire card, and in the MIC broadcast event label. Knight does not paraphrase it.
- **Ghost World** — ungated leaderboard viewing and ghost voting are the default state. No login wall before The Court page renders. Ghost votes display immediately. This is the cooperative inversion: attention first, membership when value is felt.
- **Frontier mesh replication** — IP Ledger rows marked `replication_status = 'local'` until PATH X unblock (Realtime bug + I9 + v0.5.8 per MEMORY). Knight codes the column; does not attempt frontier replication in this Marathon.
- **$5/yr membership** — proposal registration requires membership. The Court page shows a Join modal (canon_join_modal_benefits_over_barrier BP085) on proposal submit attempt for non-members. Knight does not build a new modal — reuse existing join modal infra.

---

*End of dispatch. STAGED FOR FOUNDER REVIEW. DO NOT FIRE TO KNIGHT UNTIL ALL 10 OPEN QUESTIONS ANSWERED AND FOUNDER RATIFIES.*
*Composed: Bishop SEG · Sonnet 4.6 · BP092 · 2026-06-22*
