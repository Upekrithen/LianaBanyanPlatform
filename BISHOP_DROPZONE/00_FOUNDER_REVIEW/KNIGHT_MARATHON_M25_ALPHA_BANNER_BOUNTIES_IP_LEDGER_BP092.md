# KNIGHT MARATHON M25 — ALPHA BANNER · BOUNTIES PAGE · I12 IP LEDGER
## BP092 · 2026-06-23 · Bishop SEG Sonnet 4.6 · [SEG]/[MAIN]
## Caithedral™ · §14 + §15 + §17 BLOOD · Postgres-only · gen_random_uuid() · MIC per-Block-close
## FAST-TEST METHODOLOGY per canon_fast_tests_recalibrate_fast_tests_iterative_methodology_bp092

---

## OPEN QUESTIONS — Founder ratify before fire

**OQ-1 · Alpha banner color/style**
Bishop default: amber/yellow stripe (`background: #f59e0b; color: #1c1917`). Reads clearly as "active development." Override available (e.g., orange, red-orange). Respond: Y (amber) / [hex override].

**OQ-2 · Bounties page nav slot**
Recommend: top nav on mnemosynec.org ("Join the Team" or "Bounties"). Alternative: footer link only (lighter touch). Top nav recommended because Dev Crew recruitment is active and time-sensitive. Respond: Top nav / Footer / Tools dropdown / [other].

**OQ-3 · Bishop pre-applies I12 Postgres migrations §15 BLOOD before Knight Block 3 fires?**
Answer Y to confirm. Migrations listed in PRE-BLOCK section. Bishop will psql-apply before Knight receives Block 3 wake message. Respond: Y / N.

**OQ-4 · Ship I12 work as v0.7.1 or v0.8.0?**
M24 shipped v0.7.0 (build confirmed, Firebase deploy in flight per MIC_M24_BLOCK_LOG). M25b IP Ledger code is net-new infrastructure. Bishop recommends v0.7.1 (patch increment, composes cleanly with v0.7.0). If Founder wants clean minor bump for IP Ledger: use v0.8.0. Respond: v0.7.1 / v0.8.0.

**OQ-5 · Battery-aware default for mesh diff loop**
Bishop default: mesh diff loop PAUSES when battery-only (no AC) per battery-aware default canon. User can override in Settings. Respond: Y (pause on battery) / [override].

---

## RECOMMENDED SPLIT: M25a + M25b

**M25a — Hugo work only (~2-3 hr wall-clock)**
PRE-BLOCK gadget audit + BLOCK 1 (Alpha Banner) + BLOCK 2 (Bounties Page)
Result: alpha banner live on both sites + bounties page live on mnemosynec.org — ships independently of IP Ledger code.

**M25b — IP Ledger code (~7-10 hr wall-clock)**
BLOCK 3 through BLOCK 8 — Schema migration through ship + Hugo redeploy.
Bishop pre-applies migrations (OQ-3) before Knight receives Block 3.

**Total estimated wall-clock: 9-13 hrs Knight time across M25a + M25b.**

---

## PRE-BLOCK — Gadget audit · Hugo structure · deploy state · §17 CANON CARRY

### Hugo site structure (confirmed by Bishop gadget read BP092)

**Repo:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`
**Theme:** PaperMod (both sites)
**mnemosynec.org config:** `config-mnemosynec.toml` · publishDir = `public-mnemosynec` · Firebase target = `mnemosyne`
**lianabanyan.com / cephas.lianabanyan.com config:** `config.toml` · publishDir = `public` · Firebase target = `cephas`

**IMPORTANT — lianabanyan.com clarification:**
The main Liana Banyan public domain (`lianabanyan.com`) is NOT a separate Hugo site in this repo. The repo hosts `cephas.lianabanyan.com` (Knowledge Center) under the `cephas` Firebase target. The Founder-specified banner copy "Cooperative Substrate · ALPHA · Members Welcome" is intended for `cephas.lianabanyan.com`. Knight MUST confirm with Founder if the intent is `lianabanyan.com` (different host) vs `cephas.lianabanyan.com` (this Hugo build). Bishop default: apply banner to both `config.toml` site AND `config-mnemosynec.toml` site — i.e., both PaperMod builds in this repo. Flag in Block 1 smoke notes.

**Existing partials in `layouts/partials/`:**
- `extend_head.html` — canonical head extension point for PaperMod
- `extend_footer.html` — canonical footer extension point for PaperMod
- `footer-additions.html` — custom footer
- `head-additions.html` — custom head additions
- `mnemosynec-homepage.html` — mnemosynec homepage partial

**PaperMod extension pattern:** PaperMod calls `{{ partial "extend_head.html" . }}` inside `<head>` and does NOT have a standalone `header.html` injection point for above-nav banners. The correct pattern for an above-nav banner is to use `extend_head.html` to inject the banner CSS/JS, and place the banner HTML at the TOP of the `<body>` via a custom base template override.

**Correct injection path for above-nav banner:** Override `layouts/_default/baseof.html` (copy from theme, add banner call at top of `<body>`). OR — simpler and non-destructive: inject the banner via `extend_head.html` with a fixed-position CSS overlay that appears above the nav. Knight MUST use the CSS fixed-position approach to avoid duplicating the entire baseof.html — safer given PaperMod theme version pinning.

**`data/` directory contents (confirmed):**
`canonical.json` · `mnemo_island.json` · `platform_metrics.json` · `platform_user_count.json` · `proofs_storm_contact.json` · `substrate_awakens_achievements.json` · `version_trust.json` · `version.json` · `claude-export/` · `registry/`
**Add:** `data/bounties.json` (new, BLOCK 2)

**Deploy commands (both sites — from `Cephas/cephas-hugo/` directory):**
```
# mnemosynec.org build + deploy
hugo --config config-mnemosynec.toml
firebase deploy --only hosting:mnemosyne

# cephas.lianabanyan.com build + deploy
hugo
firebase deploy --only hosting:cephas
```

### Version deploy state (confirmed from version_trust.json + MIC_M24_BLOCK_LOG)
- v0.7.0 — LATEST tier — build confirmed (SHA256: d70aa26...) — Firebase Cephas deploy in flight at M24 close
- v0.6.1 — HISTORICAL — M23b UI Citadel
- v0.6.2 — REVERTED (ollama bundle missing)

### §17 CANON CARRY — Knight reads these before firing any Block

1. **Postgres-only** — gen_random_uuid() · TIMESTAMPTZ · BIGSERIAL · BYTEA — no SQLite syntax (canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089)
2. **version_trust.json is the canonical Hugo Tower data source** — not version.json (canon_hugo_tower_version_data_source_is_version_trust_json_not_version_jan_bp090)
3. **Knight is the OPERATOR Mechanic** — Bishop COMPOSES, Knight EXECUTES build/deploy — no Bishop-direct Hugo/Firebase (canon_knight_is_operator_mechanic_bp089)
4. **Fast-test methodology** — 3-Q smoke per Block end for code Blocks; 1-page Founder walkthrough for UI/Hugo Blocks (canon_fast_tests_recalibrate_fast_tests_iterative_methodology_bp092)
5. **MIC per-Block-close** — Knight stamps MIC receipt at close of each Block to MIC_M25_BLOCK_LOG.md in BISHOP_DROPZONE/00_FOUNDER_REVIEW/
6. **§15 BLOOD** — Bishop pre-applies I12 Postgres migrations; Knight does NOT run psql migrations autonomously unless §15 explicitly delegated and OQ-3 = Y
7. **LAN-as-WAN constraint** — relay.lianabanyan.com is the mesh test path; no LAN shortcuts (canon_lan_as_wan_test_mode_4_machine_mesh_bp085)
8. **Battery-aware default OFF** — mesh diff loop defaults to pause on battery (OQ-5 pending Founder ratify)
9. **IP Ledger existing store** — `src/main/ip_ledger/ip_ledger_store.ts` is JSONL local-first store (Federal Body Cam doctrine, append-only). The new Postgres schema in BLOCK 3 is ADDITIVE — it does not replace the JSONL store. Both coexist: JSONL = local offline record; Postgres = networked query layer for Frontier Mesh replication.
10. **Thorax Ed25519 library** — `src/main/thorax/ed25519_keypair.ts` exports `getOrCreateKeypair()` — use this for Ring Bearer keygen; do NOT re-implement Ed25519 from scratch.

---

## BLOCK 1 — Alpha Banner Hugo Partial (~30 min)
**M25a Block 1**

### Objective
Add a dismissible amber/yellow "PUBLIC ALPHA" banner above the nav on both Hugo PaperMod sites served from this repo.

### Files to create/modify

**New file: `Cephas/cephas-hugo/layouts/partials/alpha-banner.html`**

```html
{{- /* ALPHA BANNER — BP092 — dismissible via localStorage · amber/yellow stripe */ -}}
{{- /* Canon copy: mnemosynec.org = "PUBLIC ALPHA · Build Log Live · v0.6.1" (update to v0.7.0 at ship) */ -}}
{{- /* Canon copy: cephas.lianabanyan.com = "Cooperative Substrate · ALPHA · Members Welcome" */ -}}
<div id="lb-alpha-banner" style="
  display: block;
  background: #f59e0b;
  color: #1c1917;
  text-align: center;
  padding: 0.55rem 3rem 0.55rem 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  position: relative;
  z-index: 9999;
  border-bottom: 2px solid #d97706;
">
  {{ if .Site.Params.isMnemosynec }}
    PUBLIC ALPHA &middot; Build Log Live &middot; v{{ .Site.Data.version_trust.versions | first | index "version" }}
    &nbsp;&mdash;&nbsp;
    <a href="/how-it-works/" style="color:#1c1917;text-decoration:underline;">How it works</a>
  {{ else }}
    Cooperative Substrate &middot; ALPHA &middot; Members Welcome
    &nbsp;&mdash;&nbsp;
    <a href="https://mnemosynec.org/" style="color:#1c1917;text-decoration:underline;">Learn More</a>
  {{ end }}
  <button
    id="lb-alpha-banner-close"
    aria-label="Dismiss alpha banner"
    onclick="(function(){localStorage.setItem('lb_alpha_dismissed','1');document.getElementById('lb-alpha-banner').style.display='none';})()"
    style="
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      color: #1c1917;
      line-height: 1;
      padding: 0.2rem 0.4rem;
    "
  >&times;</button>
</div>
<script>
  (function(){
    if(localStorage.getItem('lb_alpha_dismissed')==='1'){
      var b=document.getElementById('lb-alpha-banner');
      if(b) b.style.display='none';
    }
  })();
</script>
```

**Modify: `Cephas/cephas-hugo/layouts/partials/extend_head.html`**

Add at the TOP (before existing content):
```html
{{- partial "alpha-banner.html" . -}}
```

**IMPORTANT — CSS positioning note:** `extend_head.html` in PaperMod is injected inside `<head>`, not `<body>`. The banner HTML will not render from `<head>`. The correct approach is to override PaperMod's baseof.html:

**New file: `Cephas/cephas-hugo/layouts/_default/baseof.html`**

Copy from `Cephas/cephas-hugo/themes/PaperMod/layouts/_default/baseof.html`, then add `{{- partial "alpha-banner.html" . -}}` as the FIRST element inside `<body>`, before `{{- partial "header.html" . -}}`.

Knight MUST verify the PaperMod version's baseof.html structure before copying. Do NOT break existing nav, theme toggle, or search. The banner partial is safe to add as first-child of body.

### Fact-Strip — "Substrate Replaces New Data Centers"
**BP092 HARD CANON · canon_substrate_replaces_new_data_centers_economic_claim_banner_pattern_bp092**

AFTER the `#lb-alpha-banner` div and BEFORE the nav/header, render:

```html
<div id="lb-dc-strip" class="substrate-replaces-strip">
  Substrate Replaces New Data Centers.
  <button onclick="(function(){localStorage.setItem('lb_dc_strip_dismissed','1');document.getElementById('lb-dc-strip').style.display='none';})()" aria-label="Dismiss" style="background:transparent;border:none;cursor:pointer;margin-left:0.75em;opacity:0.5;">&times;</button>
</div>
<script>(function(){if(localStorage.getItem('lb_dc_strip_dismissed')==='1'){var s=document.getElementById('lb-dc-strip');if(s)s.style.display='none';}})()</script>
```

Add to the site CSS (extend_head.html or equivalent):
```css
.substrate-replaces-strip {
  font-family: ui-monospace, 'Courier New', monospace;
  font-size: 0.85em;
  letter-spacing: 0.05em;
  padding: 0.5em 1em;
  border-top: 1px dotted currentColor;
  border-bottom: 1px dotted currentColor;
  opacity: 0.85;
  text-align: center;
}
```

**Rules:**
- Copy verbatim: "Substrate Replaces New Data Centers." (period included, never paraphrase)
- Dismissible SEPARATELY from alpha banner — localStorage key: `lb_dc_strip_dismissed`
- Visual style: monospace, empirical-receipt-aesthetic, low visual weight — reads as fact, not slogan
- Apply to BOTH sites (mnemosynec.org + cephas.lianabanyan.com) inside baseof.html override

### Smoke — Block 1
1. `cd Cephas/cephas-hugo && hugo serve --config config-mnemosynec.toml`
2. Open `http://localhost:1313/` — verify amber banner appears at top, above nav
3. Verify fact-strip "Substrate Replaces New Data Centers." renders BELOW alpha banner, ABOVE nav, in monospace
4. Click X on alpha banner — verify alpha banner hides but fact-strip remains
5. Click X on fact-strip — verify fact-strip hides independently
6. Refresh — verify both dismissals persisted via localStorage (`lb_alpha_dismissed` + `lb_dc_strip_dismissed`)
7. Clear both localStorage keys → reload → verify both reappear
8. `hugo serve` (default config.toml) → verify cephas.lianabanyan.com shows both: alpha banner "Cooperative Substrate · ALPHA · Members Welcome" + fact-strip below it

**Receipt:** 1-page Founder walkthrough smoke. MIC-stamp to MIC_M25_BLOCK_LOG.md.

---

## BLOCK 2 — Bounties Hugo Page + data/bounties.json (~1-2 hr)
**M25a Block 2**

### Objective
Create `mnemosynec.org/bounties/` page listing Dev Crew open bounties. Data-driven via `data/bounties.json` so Bishop can update bounties without Hugo redeploy.

### Files to create

**New file: `Cephas/cephas-hugo/data/bounties.json`**

```json
{
  "meta": {
    "page_title": "Join the MnemosyneC Team · Bounties Open",
    "last_updated": "2026-06-23",
    "bp": "BP092",
    "pool_240_floater_eligibility": true,
    "marks_clearing_rate_work": "10%",
    "marks_clearing_rate_purchase": "5%"
  },
  "tiers": [
    {
      "id": "NANO",
      "marks": 0.05,
      "label": "NANO",
      "description": "Small scoped contributions: documentation fixes, test coverage, minor UX polish, bug reports with repro steps."
    },
    {
      "id": "CORE",
      "marks": 1,
      "label": "CORE",
      "description": "Meaningful code contributions: new feature implementation, significant bug fix, performance optimization, integration work."
    },
    {
      "id": "ULTRA",
      "marks": 10,
      "label": "ULTRA",
      "description": "Transformative contributions that measurably lift benchmark scores or unlock a new capability. 240-floater patent pool eligibility."
    }
  ],
  "bounties": [
    {
      "id": "B001",
      "tier": "ULTRA",
      "marks": 10,
      "floater_eligible": true,
      "title": "Posse Sub-Claim Splitter v2",
      "description": "Improve the Posse decomposition primitive: the sub-claim splitting logic that fans a hard question into sub-claims for swarm agents. Current implementation is version zero. Target: lift MMLU-Pro score from 61.9% toward ≥90% on the 42-question canonical run. Empirical receipt required — show before/after score on canonical 42Q.",
      "acceptance_criteria": [
        "Sub-claim split quality measurably higher (Bishop + Star Chamber validate)",
        "ABSTAIN cascade fires at correct confidence threshold",
        "Round-Up reconciliation receives well-formed sub-answers",
        "Canonical 42Q score improves from current 61.9% baseline",
        "All tests pass; no SQLite syntax introduced"
      ],
      "status": "open",
      "opened": "2026-06-23"
    },
    {
      "id": "B002",
      "tier": "CORE",
      "marks": 1,
      "floater_eligible": true,
      "title": "Mesh Diff Replication Loop",
      "description": "Implement the 15-minute Merkle-diff replication loop for ip_ledger_merkle_diff (Postgres). Diff against Circle of Influence peers, replicate new entries, respect battery-aware default-OFF canon. Composes with peer_artifact_server.ts existing infrastructure.",
      "acceptance_criteria": [
        "15-min interval fires correctly",
        "Merkle root computation matches between simulated 2-peer exchange",
        "Battery-aware pause works (no loop when on battery, resumes on AC)",
        "ip_ledger_merkle_diff rows written correctly",
        "Unit test: 2-peer diff simulation passes"
      ],
      "status": "open",
      "opened": "2026-06-23"
    },
    {
      "id": "B003",
      "tier": "CORE",
      "marks": 1,
      "floater_eligible": true,
      "title": "Star Chamber Variance-to-Risk Calibration",
      "description": "Calibrate the H = Variance/100 risk scoring formula against the MMLU-Pro 42Q canonical run. Document which question domains produce highest variance (highest hallucination risk). Output: calibration report + recommended threshold adjustments for the 15% risk threshold.",
      "acceptance_criteria": [
        "H scores computed for all 14 MMLU-Pro domains",
        "Threshold recommendation backed by empirical receipt",
        "Report format: domain · mean H · recommended flag threshold",
        "Reproducible: another agent running same inputs gets same H scores (±0.01)"
      ],
      "status": "open",
      "opened": "2026-06-23"
    },
    {
      "id": "B004",
      "tier": "NANO",
      "marks": 0.05,
      "floater_eligible": false,
      "title": "IP Ledger UI — Verifiable Proof Download",
      "description": "Wire the 'Download Verifiable Proof' button in MyIPLedgerTab.tsx. Output: a JSON file containing the entry, its Ed25519 signature (Ring Bearer signed), the Ring Bearer public key, and a timestamp. File must be self-verifiable using node:crypto without any cooperative infrastructure.",
      "acceptance_criteria": [
        "Download button produces valid JSON file",
        "JSON contains: entry_id · payload_hash · signature_ed25519 · ring_bearer_pubkey · stamped_at",
        "Verification script (included in download or documented) confirms signature using node:crypto",
        "Works in Electron renderer without main-process round trip on the download trigger"
      ],
      "status": "open",
      "opened": "2026-06-23"
    },
    {
      "id": "B005",
      "tier": "NANO",
      "marks": 0.05,
      "floater_eligible": false,
      "title": "Battery Dispatch — Code Contribution Submit Flow",
      "description": "Add 'Submit Code Contribution' tab to Battery Dispatch UI. Fields: title · description · link (GitHub PR or paste) · bounty_id (optional). On submit: write to ip_ledger_entries via stamp_certify.ts auto-stamp hook. Receipt shown to contributor with their ledger_id.",
      "acceptance_criteria": [
        "Tab renders in Battery Dispatch without breaking existing tabs",
        "Form validates: title required · link required",
        "Submit triggers stamp_certify auto-stamp hook",
        "ip_ledger_entries row written with contribution_type = 'battery_dispatch_submission'",
        "Ledger ID shown in success receipt to contributor"
      ],
      "status": "open",
      "opened": "2026-06-23"
    }
  ]
}
```

**New file: `Cephas/cephas-hugo/content-mnemosynec/bounties/_index.md`**

```markdown
---
title: "Join the MnemosyneC Team · Bounties Open"
description: "Contribute to MnemosyneC and earn Marks, IP Ledger attribution, and patent-floater eligibility from the 240-pool set aside for contributing developers."
layout: "bounties"
url: "/bounties/"
canonical: "https://mnemosynec.org/bounties/"
noindex: false
ShowReadingTime: false
ShowShareButtons: false
ShowBreadCrumbs: false

# OpenGraph
images: []
---
```

**New file: `Cephas/cephas-hugo/layouts/bounties/list.html`**

```html
{{- define "main" -}}
{{ $bounties := .Site.Data.bounties }}
{{ $meta := $bounties.meta }}

<article class="post-single">
  <header class="post-header">
    <h1 class="post-title">{{ $meta.page_title }}</h1>
    <p class="post-description">
      Contribute to the cooperative substrate. Earn Marks, IP Ledger attribution stamped with your Ed25519 signature, and eligibility from the 240-patent-floater pool set aside for developers who prove it works.
    </p>
  </header>

  <div class="post-content">

    {{/* ── How the Dev Crew Works ──────────────────────────────────── */}}
    <h2>How the Dev Crew Works</h2>
    <p>
      The Dev Crew is the cooperative's contribution pipeline. Every accepted contribution earns Marks
      at the cooperative clearing rate ({{ $meta.marks_clearing_rate_work }} for work,
      {{ $meta.marks_clearing_rate_purchase }} for purchase activity), gets stamped to the IP Ledger
      with your Ring Bearer Ed25519 signature, and accrues toward patent-floater eligibility from
      the 240-pool reserved for contributing developers.
    </p>
    <p>
      The pipeline: Fork → Build → Submit via Battery Dispatch → Star Chamber validates
      (compile + test + spec compliance, automated, no human gate) → Member vote accepts or rejects →
      IP Ledger attribution stamped, immutable across the Frontier Mesh → Marks accrue →
      patent-floater eligibility credited.
    </p>
    <p>
      <strong>You cannot buy your way in.</strong> Participation and contribution determine eligibility.
    </p>

    {{/* ── Bounty Tiers ──────────────────────────────────────────────── */}}
    <h2>Bounty Tiers</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.5rem 0;">
      {{ range $bounties.tiers }}
      <div style="border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:1.2rem;background:rgba(255,255,255,0.03);">
        <div style="font-size:1.1rem;font-weight:700;color:#f59e0b;margin-bottom:0.4rem;">{{ .label }} &mdash; {{ .marks }} Mark{{ if gt .marks 1.0 }}s{{ end }}</div>
        <p style="font-size:0.88rem;margin:0;opacity:0.8;">{{ .description }}</p>
      </div>
      {{ end }}
    </div>

    {{/* ── Open Bounties ─────────────────────────────────────────────── */}}
    <h2>Open Bounties</h2>
    {{ range $bounties.bounties }}
    {{ if eq .status "open" }}
    <div style="border-left:3px solid {{ if eq .tier "ULTRA" }}#f59e0b{{ else if eq .tier "CORE" }}#22c55e{{ else }}#64748b{{ end }};padding:1rem 1.2rem;margin:1.2rem 0;background:rgba(255,255,255,0.02);border-radius:0 6px 6px 0;">
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;flex-wrap:wrap;">
        <span style="font-size:0.72rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:99px;background:{{ if eq .tier "ULTRA" }}#f59e0b{{ else if eq .tier "CORE" }}#22c55e{{ else }}#64748b{{ end }};color:{{ if eq .tier "NANO" }}#fff{{ else }}#1c1917{{ end }};">{{ .tier }}</span>
        <span style="font-weight:700;font-size:1rem;">{{ .title }}</span>
        <span style="margin-left:auto;font-size:0.82rem;opacity:0.6;">{{ .marks }} Mark{{ if gt .marks 1.0 }}s{{ end }}{{ if .floater_eligible }} · floater eligible{{ end }}</span>
      </div>
      <p style="margin:0 0 0.75rem;font-size:0.9rem;">{{ .description }}</p>
      <details>
        <summary style="cursor:pointer;font-size:0.82rem;opacity:0.7;user-select:none;">Acceptance criteria</summary>
        <ul style="margin:0.5rem 0 0;font-size:0.85rem;opacity:0.8;">
          {{ range .acceptance_criteria }}<li>{{ . }}</li>{{ end }}
        </ul>
      </details>
    </div>
    {{ end }}
    {{ end }}

    {{/* ── How to Submit ─────────────────────────────────────────────── */}}
    <h2>How to Submit</h2>
    <ol>
      <li>Fork the canonical repo (link published with Dev Crew Open Call)</li>
      <li>Build your contribution locally — all tests passing, no SQLite syntax</li>
      <li>Open MnemosyneC → Battery Dispatch tab → <strong>Submit Code Contribution</strong></li>
      <li>Star Chamber validates automatically (compile + test + spec compliance)</li>
      <li>Member vote accepts or rejects via Substrate Market</li>
      <li>IP Ledger attribution stamped — Ed25519-signed, immutable, portable</li>
      <li>Marks accrue at cooperative clearing rate</li>
    </ol>
    <p>
      Questions? Read the
      <a href="/how-it-works/">How It Works</a> page or reach out via
      <a href="mailto:Social@lianabanyan.com">Social@lianabanyan.com</a>.
    </p>

    {{/* ── IP Ledger Attribution ──────────────────────────────────────── */}}
    <h2>IP Ledger Attribution</h2>
    <p>
      Every accepted contribution is stamped to the IP Ledger — an append-only, Ed25519-signed record
      that persists regardless of platform fate. Your Ring Bearer public key is your permanent proof of contribution.
      The ledger replicates across the Frontier Mesh (Circle of Influence peers) via Merkle-diff exchange,
      so your attribution is not held by any single server. You can download your verifiable proof at any time
      from the <strong>My IP Ledger</strong> tab in MnemosyneC.
    </p>

    <p style="font-size:0.82rem;opacity:0.55;margin-top:2rem;">
      Last updated: {{ $meta.last_updated }} &middot; BP{{ $meta.bp }}
    </p>

  </div>
</article>
{{- end -}}
```

**config-mnemosynec.toml — add nav menu entry (top nav, pending OQ-2 ratify):**

Add to the `[[menus.main]]` section:
```toml
[[menus.main]]
  identifier = "bounties"
  name = "Join the Team"
  url = "/bounties/"
  weight = 50
```

Knight MUST check that `[[menus.main]]` exists in `config-mnemosynec.toml` before adding. If no menu section exists, add the full `[[menus.main]]` block after `[params]`.

### Smoke — Block 2
1. `cd Cephas/cephas-hugo && hugo serve --config config-mnemosynec.toml`
2. Navigate to `http://localhost:1313/bounties/` — verify page loads with title "Join the MnemosyneC Team · Bounties Open"
3. Verify all 5 bounties render: B001 (ULTRA/amber), B002 (CORE/green), B003 (CORE/green), B004 (NANO/gray), B005 (NANO/gray)
4. Verify Marks tiers display correctly per tier card
5. Verify "Join the Team" nav link appears in top nav
6. Verify acceptance criteria `<details>` expand correctly

**Receipt:** 1-page Founder walkthrough smoke. MIC-stamp to MIC_M25_BLOCK_LOG.md.

---

## BLOCK 3 — I12 IP Ledger Postgres Schema Migration (~30 min)
**M25b Block 3 — Bishop pre-applies §15 BLOOD before Knight fires this Block**

### §15 BLOOD — Bishop pre-applies this migration before Knight Block 3

Bishop will run the following psql commands against the Supabase Postgres instance before handing Block 3 to Knight. Knight does NOT run psql migrations autonomously unless OQ-3 = Y.

**New file: `src/main/ip_ledger/schema.sql`**

```sql
-- I12 IP Ledger Postgres Schema
-- BP092 · Bishop §15 BLOOD pre-apply
-- Postgres-only: gen_random_uuid() · TIMESTAMPTZ · BIGSERIAL · BYTEA
-- Canon: canon_stamp_certified_ip_ledger_ring_bearer_frontier_mesh_replicating_backbone_bp087
-- Canon: canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089
-- IMPORTANT: This schema is ADDITIVE to the existing JSONL local store (ip_ledger_store.ts)
-- Both coexist: JSONL = local offline Federal Body Cam record; Postgres = networked query layer

-- ── ip_ledger_entries ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ip_ledger_entries (
  id                  BIGSERIAL PRIMARY KEY,
  entry_id            UUID NOT NULL DEFAULT gen_random_uuid(),
  ring_bearer_peer_id TEXT NOT NULL,
  contribution_type   TEXT NOT NULL,
  payload_hash        BYTEA NOT NULL,
  payload_url         TEXT,
  stamped_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature_ed25519   BYTEA NOT NULL,
  mesh_replicated     BOOL NOT NULL DEFAULT false,

  CONSTRAINT ip_ledger_entries_entry_id_unique UNIQUE (entry_id)
);

-- Index for peer-based queries (My IP Ledger tab)
CREATE INDEX IF NOT EXISTS idx_ip_ledger_entries_peer
  ON ip_ledger_entries (ring_bearer_peer_id, stamped_at DESC);

-- Index for replication sweep (mesh_replicated = false first)
CREATE INDEX IF NOT EXISTS idx_ip_ledger_entries_unreplicated
  ON ip_ledger_entries (mesh_replicated, stamped_at)
  WHERE mesh_replicated = false;

-- ── ip_ledger_merkle_diff ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ip_ledger_merkle_diff (
  id               BIGSERIAL PRIMARY KEY,
  diff_root_hash   BYTEA NOT NULL,
  peer_a_id        TEXT NOT NULL,
  peer_b_id        TEXT NOT NULL,
  diff_payload     JSONB NOT NULL DEFAULT '{}',
  replicated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for peer-pair diff history
CREATE INDEX IF NOT EXISTS idx_ip_ledger_merkle_diff_peers
  ON ip_ledger_merkle_diff (peer_a_id, peer_b_id, replicated_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE ip_ledger_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_ledger_merkle_diff ENABLE ROW LEVEL SECURITY;

-- Service-role bypass (all ops from backend/Electron main process use service role)
CREATE POLICY IF NOT EXISTS "service_role_all_ip_ledger_entries"
  ON ip_ledger_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "service_role_all_ip_ledger_merkle_diff"
  ON ip_ledger_merkle_diff
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated read own entries (My IP Ledger tab — anon key, ring_bearer_peer_id = auth.uid())
-- NOTE: ring_bearer_peer_id is the Thorax peer_id (UUID), not Supabase auth UID.
-- This policy is permissive for now; tighten to peer_id=auth.uid() mapping once Thorax-auth bridge lands.
CREATE POLICY IF NOT EXISTS "authenticated_read_own_ip_ledger_entries"
  ON ip_ledger_entries
  FOR SELECT
  TO authenticated
  USING (true);
```

### Smoke — Block 3
After Bishop §15 BLOOD apply:
1. `psql $DATABASE_URL -c "\d ip_ledger_entries"` — verify all columns present with correct types
2. `psql $DATABASE_URL -c "\d ip_ledger_merkle_diff"` — verify all columns
3. `psql $DATABASE_URL -c "SELECT tablename, rowsecurity FROM pg_tables WHERE tablename LIKE 'ip_ledger%'"` — verify RLS enabled on both tables
4. `psql $DATABASE_URL -c "\dp ip_ledger_entries"` — verify service_role policy exists

**Receipt:** JSON smoke receipt to `BISHOP_DROPZONE/00_KNIGHT_PROGRESS/M25_BLOCK3_SMOKE_<timestamp>.json`. MIC-stamp to MIC_M25_BLOCK_LOG.md.

---

## BLOCK 4 — Ring Bearer Keypair + Stamp-Certify Primitive (~2-3 hr)
**M25b Block 4**

### Objective
Wire Ring Bearer keypair generation and the Stamp-Certify primitive that signs payload hashes and writes to `ip_ledger_entries` (Postgres).

### Files to create

**New file: `src/main/ip_ledger/ring_bearer_keygen.ts`**

```typescript
/**
 * ring_bearer_keygen.ts — I12 IP Ledger Ring Bearer keypair
 * BP092 · canon_stamp_certified_ip_ledger_ring_bearer_frontier_mesh_replicating_backbone_bp087
 *
 * REUSES thorax Ed25519 library — do NOT re-implement Ed25519.
 * getOrCreateKeypair() from src/main/thorax/ed25519_keypair.ts is the canonical
 * keypair store. This module provides the Ring Bearer interface — same keypair,
 * IP-Ledger-specific accessors and Supabase write on first registration.
 *
 * Federal Body Cam doctrine: Ring Bearer keypair is NEVER rotated after first write.
 * If the keypair is lost, a NEW ring_bearer_peer_id is registered (new identity).
 */

import { getOrCreateKeypair } from '../thorax/ed25519_keypair';

export interface RingBearerIdentity {
  peer_id: string;        // hex(SHA256(public_key_hex)[0..16]) — stable short ID
  public_key_hex: string; // full DER-encoded Ed25519 pubkey as hex
}

/**
 * Returns the Ring Bearer identity for this peer.
 * The peer_id is derived deterministically from the Thorax Ed25519 public key.
 * Stable across restarts (keypair is persisted by thorax/ed25519_keypair.ts).
 */
export function getRingBearerIdentity(): RingBearerIdentity {
  const keypair = getOrCreateKeypair();
  const { createHash } = require('node:crypto');
  const peer_id = createHash('sha256')
    .update(keypair.public_key_hex)
    .digest('hex')
    .slice(0, 32); // 32 hex chars = 16 bytes — sufficient uniqueness

  return {
    peer_id,
    public_key_hex: keypair.public_key_hex,
  };
}
```

**New file: `src/main/ip_ledger/stamp_certify.ts`**

```typescript
/**
 * stamp_certify.ts — I12 IP Ledger Stamp-Certify primitive
 * BP092 · canon_stamp_certified_ip_ledger_ring_bearer_frontier_mesh_replicating_backbone_bp087
 *
 * Signs a payload hash with the Ring Bearer Ed25519 private key and writes
 * a row to ip_ledger_entries (Postgres via Supabase service-role client).
 *
 * Federal Body Cam doctrine: rows are NEVER updated or deleted.
 * Postgres schema: schema.sql migration (Bishop §15 BLOOD pre-applied Block 3).
 */

import { createHash, createPrivateKey, sign } from 'node:crypto';
import { getOrCreateKeypair } from '../thorax/ed25519_keypair';
import { getRingBearerIdentity } from './ring_bearer_keygen';
import { getSupabaseServiceClient } from '../substrate_api'; // existing supabase service client

export type ContributionType =
  | 'battery_dispatch_submission'
  | 'config_set_model_pull'
  | 'member_business_listing_created'
  | 'manual_registration';

export interface StampCertifyParams {
  contribution_type: ContributionType;
  /** Raw payload string to hash. Must be deterministic for the same event. */
  payload: string;
  /** Optional URL pointing to the artifact (GitHub PR, Supabase row URL, etc.) */
  payload_url?: string;
}

export interface StampCertifyResult {
  entry_id: string;
  ring_bearer_peer_id: string;
  payload_hash_hex: string;
  stamped_at: string;
  ok: boolean;
  error?: string;
}

/**
 * Signs the payload hash with the Ring Bearer private key and writes to ip_ledger_entries.
 * Returns the stamped entry_id and Ring Bearer peer_id for the receipt.
 */
export async function stampCertify(params: StampCertifyParams): Promise<StampCertifyResult> {
  const keypair = getOrCreateKeypair();
  const identity = getRingBearerIdentity();

  // Hash the payload (SHA-256, as BYTEA hex)
  const payloadHash = createHash('sha256').update(params.payload, 'utf8').digest();
  const payloadHashHex = payloadHash.toString('hex');

  // Sign the hash with Ed25519 private key (DER PKCS8)
  const privateKeyObj = createPrivateKey({
    key: Buffer.from(keypair.private_key_hex, 'hex'),
    format: 'der',
    type: 'pkcs8',
  });
  const signature = sign(null, payloadHash, privateKeyObj);

  const supabase = getSupabaseServiceClient();
  const stamped_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('ip_ledger_entries')
    .insert({
      ring_bearer_peer_id: identity.peer_id,
      contribution_type:   params.contribution_type,
      payload_hash:        `\\x${payloadHashHex}`,  // Postgres BYTEA hex format
      payload_url:         params.payload_url ?? null,
      stamped_at,
      signature_ed25519:   `\\x${signature.toString('hex')}`,
      mesh_replicated:     false,
    })
    .select('entry_id')
    .single();

  if (error) {
    console.error('[stamp_certify] insert failed:', error.message);
    return { entry_id: '', ring_bearer_peer_id: identity.peer_id, payload_hash_hex: payloadHashHex, stamped_at, ok: false, error: error.message };
  }

  return {
    entry_id:            (data as { entry_id: string }).entry_id,
    ring_bearer_peer_id: identity.peer_id,
    payload_hash_hex:    payloadHashHex,
    stamped_at,
    ok:                  true,
  };
}
```

**Knight must verify `getSupabaseServiceClient()` export path.** Check `src/main/substrate_api.ts` for the correct export name. If it exports something different (e.g., `supabaseServiceClient`), use that. Do not create a second Supabase client instance.

### Smoke — Block 4
Write a unit test at `src/main/ip_ledger/stamp_certify.test.ts`:
1. Call `stampCertify({ contribution_type: 'manual_registration', payload: 'test-payload-block4' })`
2. Assert `result.ok === true`
3. Assert `result.entry_id` is a valid UUID string (non-empty)
4. Assert `result.payload_hash_hex` is a 64-char hex string (SHA-256)
5. Query Supabase: `SELECT * FROM ip_ledger_entries WHERE entry_id = <result.entry_id>` — verify row exists
6. Verify signature: `createPublicKey(Buffer.from(pubkey_hex,'hex'))` → `verify(null, payload_hash_buf, pubkey_obj, sig_buf)` returns `true`

**Receipt:** JSON smoke receipt to `BISHOP_DROPZONE/00_KNIGHT_PROGRESS/M25_BLOCK4_SMOKE_<timestamp>.json`. MIC-stamp to MIC_M25_BLOCK_LOG.md.

---

## BLOCK 5 — Auto-Stamp Hooks (~1-2 hr)
**M25b Block 5**

### Objective
Wire `stampCertify()` into 3 trigger points: config_set model pull, Battery Dispatch submission accept, Member Business listing creation.

### Hook wiring

**Hook 1 — `config_set` model pull**
Location: wherever `config_set` IPC handler processes a model selection. Likely in `src/main/ai_dispatch_ipc.ts` or `src/main/keys_engines/` — Knight MUST read those files before wiring.
Payload to sign: `JSON.stringify({ event: 'config_set_model_pull', model_id, peer_id, timestamp: Date.now() })`
Contribution type: `'config_set_model_pull'`
Pattern: fire-and-forget (do not await; log errors; do not block model pull on stamp).

**Hook 2 — Battery Dispatch submission accept**
Location: Battery Dispatch IPC handler. Likely in `src/main/dispatch/` or `src/main/on_deck/`. Knight MUST read the Battery Dispatch IPC file.
Payload to sign: `JSON.stringify({ event: 'battery_dispatch_submission', dispatch_id, member_id, timestamp: Date.now() })`
Contribution type: `'battery_dispatch_submission'`
Pattern: fire-and-forget.

**Hook 3 — Member Business listing creation**
Location: wherever `entity_membership` or member business rows are created (likely Supabase Edge Function or `src/main/marketplace/`). Knight MUST check.
Payload to sign: `JSON.stringify({ event: 'member_business_listing_created', entity_id, member_id, timestamp: Date.now() })`
Contribution type: `'member_business_listing_created'`
Pattern: fire-and-forget.

### Smoke — Block 5
1. Trigger a Battery Dispatch submit (can use a test fixture in the UI or a direct IPC call from test script)
2. Query Supabase: `SELECT * FROM ip_ledger_entries WHERE contribution_type = 'battery_dispatch_submission' ORDER BY stamped_at DESC LIMIT 1`
3. Verify: row exists · `ring_bearer_peer_id` non-empty · `signature_ed25519` non-null · `mesh_replicated = false`
4. Pick 3 Qs from relevant paths and verify no regressions

**Receipt:** JSON smoke receipt to `BISHOP_DROPZONE/00_KNIGHT_PROGRESS/M25_BLOCK5_SMOKE_<timestamp>.json`. MIC-stamp to MIC_M25_BLOCK_LOG.md.

---

## BLOCK 6 — Mesh Diff Replication Loop (~2-3 hr)
**M25b Block 6**

### Objective
Implement the 15-minute Merkle-diff replication loop against Circle of Influence peers. Battery-aware default OFF. Writes to `ip_ledger_merkle_diff`.

**New file: `src/main/ip_ledger/mesh_diff_loop.ts`**

```typescript
/**
 * mesh_diff_loop.ts — I12 IP Ledger Mesh Diff Replication Loop
 * BP092 · 15-minute interval · Merkle-diff against Circle of Influence peers
 * Battery-aware default OFF per user-cap canon
 * LAN-as-WAN constraint: ALWAYS route via relay.lianabanyan.com — no LAN shortcuts
 * canon_lan_as_wan_test_mode_4_machine_mesh_bp085
 */
```

**Implementation requirements:**

1. **Interval:** 15 minutes (matching Frame-to-Frame Download canon). Use `setInterval` managed by start/stop functions exported from the module.

2. **Battery-aware gate:** Before each diff sweep, check `powerMonitor.onBatteryPower` (Electron API). If `true` AND user has NOT set `ip_ledger_diff_run_on_battery = true` in settings, skip this cycle and log. Default: skip on battery.

3. **Peer discovery:** Use Circle of Influence peer list from existing peer presence infrastructure. Knight MUST check `src/main/mesh-dispatcher.ts` or `src/main/federation/` for the peer list API.

4. **Merkle root computation:** Compute SHA-256 of sorted, concatenated `entry_id` values from `ip_ledger_entries WHERE mesh_replicated = false`. Exchange root hash with peer. If roots differ: fetch diff (entries peer has that local doesn't, and vice versa). Insert new entries from peer. Mark own new entries as `mesh_replicated = true` after confirmed receipt by peer.

5. **Write to `ip_ledger_merkle_diff`:** One row per peer-pair diff exchange containing `diff_root_hash`, `peer_a_id`, `peer_b_id`, `diff_payload` (JSONB with entry IDs exchanged), `replicated_at`.

6. **LAN-as-WAN constraint:** ALL peer traffic MUST route via relay.lianabanyan.com. No direct LAN connections.

7. **Start/stop exports:**
```typescript
export function startMeshDiffLoop(): void { /* ... */ }
export function stopMeshDiffLoop(): void { /* ... */ }
```

Start is called from `src/main/index.ts` after mesh is ready (check existing mesh startup hook). Stop is called on app quit (BUT: per `canon_close_keeps_mesh_alive_quit_exits_two_button_semantic_bp092` — the loop continues on Close (minimize to tray); only truly stops on Quit).

### Smoke — Block 6
1. Simulate 2-peer scenario (local test peers or 2 dev machines on the fleet)
2. Insert 3 test entries to `ip_ledger_entries` on peer A (`mesh_replicated = false`)
3. Run one diff cycle manually (`startMeshDiffLoop()` + trigger cycle)
4. Verify: peer B receives those 3 entries (SELECT from B's Supabase or via IPC check)
5. Verify: `ip_ledger_merkle_diff` has 1 row with correct `peer_a_id` / `peer_b_id` / `diff_payload` containing the 3 entry IDs
6. Verify: Merkle root hashes match after sync

**Receipt:** JSON smoke receipt to `BISHOP_DROPZONE/00_KNIGHT_PROGRESS/M25_BLOCK6_SMOKE_<timestamp>.json`. MIC-stamp to MIC_M25_BLOCK_LOG.md.

---

## BLOCK 7 — My IP Ledger UI Tab (~1-2 hr)
**M25b Block 7**

### Objective
Add "My IP Ledger" tab to the Electron renderer. Route: `/my-ip-ledger`. Shows Ring Bearer pubkey, lists own contributions, download verifiable proof.

**New file: `src/renderer/components/MyIPLedgerTab.tsx`**

**Requirements:**
1. **Route:** `/my-ip-ledger` — add to existing router (Knight MUST check `src/renderer/` for the router file — likely `App.tsx` or a routes file)
2. **Ring Bearer pubkey display:** Fetch from main process via IPC (`window.electronAPI.getRingBearerIdentity()` or equivalent). Display as monospace hex string with copy-to-clipboard button.
3. **Contribution list:** Query Supabase (via IPC) `ip_ledger_entries WHERE ring_bearer_peer_id = <local_peer_id> ORDER BY stamped_at DESC`. Display: entry_id · contribution_type · stamped_at · payload_url (if present) · mesh_replicated badge.
4. **Download verifiable proof:** Per-entry button. Downloads a JSON file:
```json
{
  "entry_id": "...",
  "ring_bearer_peer_id": "...",
  "ring_bearer_public_key_hex": "...",
  "contribution_type": "...",
  "payload_hash_hex": "...",
  "signature_ed25519_hex": "...",
  "stamped_at": "...",
  "verify_with": "node:crypto verify('ed25519', Buffer.from(payload_hash_hex,'hex'), createPublicKey({key:Buffer.from(ring_bearer_public_key_hex,'hex'),format:'der',type:'spki'}), Buffer.from(signature_ed25519_hex,'hex'))"
}
```
5. **Tab label:** "My IP Ledger" — add to existing tab strip (Knight MUST check existing tab strip component).
6. **Empty state:** "No contributions stamped yet. Submit via Battery Dispatch to begin your IP Ledger record."

### Smoke — Block 7
1. Open MnemosyneC Electron app
2. Navigate to My IP Ledger tab
3. Verify Ring Bearer pubkey displays (non-empty hex string)
4. Verify any existing entries from Block 5 smoke appear in the list
5. Click "Download Verifiable Proof" on one entry — verify file downloads with correct JSON structure
6. Run the `verify_with` one-liner in a terminal — verify it returns `true`

**Receipt:** 1-page Founder walkthrough smoke. MIC-stamp to MIC_M25_BLOCK_LOG.md.

---

## BLOCK 8 — Build + Ship v0.7.1 + Hugo Redeploy (~1-2 hr)
**M25b Block 8 — Final Block**

### Build sequence

```
# From LianaBanyanPlatform/ root:

# 1. TypeScript compile check
npx tsc --noEmit

# 2. Run unit tests (fast subset)
npm test -- --testPathPattern="ip_ledger" --passWithNoTests

# 3. Electron build
npm run make  (or the existing build script — Knight checks package.json)

# 4. Verify build artifact
# Expected: ~515 MB EXE, sha256 not matching 0.7.0 (new code included)

# 5. Update version_trust.json — add v0.7.1 entry (latest tier)
# Cephas/cephas-hugo/data/version_trust.json
# Knight adds: version "0.7.1" · tier "latest" · notes "M25 Alpha Banner · Bounties Page · I12 IP Ledger Postgres + Stamp-Certify + Mesh Diff Loop · My IP Ledger UI"
# Demote v0.7.0 to tier "historical"

# 6. Hugo build + deploy — mnemosynec.org (alpha banner + bounties page)
cd Cephas/cephas-hugo
hugo --config config-mnemosynec.toml
firebase deploy --only hosting:mnemosyne

# 7. Hugo build + deploy — cephas.lianabanyan.com (alpha banner)
hugo
firebase deploy --only hosting:cephas

# 8. Final HTTP smoke
curl -I https://mnemosynec.org/bounties/          # expect 200
curl -I https://mnemosynec.org/                   # expect 200, verify alpha banner in HTML
curl -I https://cephas.lianabanyan.com/           # expect 200, verify alpha banner in HTML
```

### version_trust.json new entry (add at top of versions array)
```json
{
  "version": "0.7.1",
  "tier": "latest",
  "release_date": "2026-06-23",
  "install_reports": 0,
  "verified_eblets": 0,
  "zero_issue_days": 0,
  "open_issues": 0,
  "trust_score": 1,
  "filename": "MnemosyneC-Setup-0.7.1.exe",
  "size_bytes": 0,
  "size_display": "~515 MB",
  "notes": "M25: Alpha Banner (both sites) · Bounties Page (mnemosynec.org/bounties/) · I12 IP Ledger Postgres schema + Stamp-Certify + Ring Bearer + Mesh Diff Loop (15min) · My IP Ledger UI tab",
  "sha256": "PENDING_BUILD"
}
```

(Fill `size_bytes`, `size_display`, `sha256` from actual build artifact before committing.)

### Smoke — Block 8
1. `curl -I https://mnemosynec.org/bounties/` → HTTP 200
2. `curl -s https://mnemosynec.org/ | grep -i "alpha"` → verify alpha banner HTML present
3. `curl -s https://cephas.lianabanyan.com/ | grep -i "alpha"` → verify alpha banner HTML present
4. Open Electron v0.7.1 — navigate to My IP Ledger tab — verify it loads
5. Submit a test Battery Dispatch — verify IP Ledger entry created (Block 5 smoke re-run)

**Full receipt:** JSON receipt to `BISHOP_DROPZONE/00_KNIGHT_PROGRESS/M25_BLOCK8_FINAL_<timestamp>.json`. MIC-stamp to MIC_M25_BLOCK_LOG.md.

---

## MIC LOG TEMPLATE — each Block close

Knight appends to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/MIC_M25_BLOCK_LOG.md`:

```
## BLOCK <N> CLOSE — <timestamp>
- Block: <N> — <Block title>
- Status: COMPLETE / PARTIAL / ESCALATE
- Smoke result: PASS / FAIL
- Files changed: [list]
- MIC stamp: Sonnet 4.6 · BP092 · M25 · Block <N>
```

---

## BISHOP §15 BLOOD PRE-APPLY CHECKLIST (before Block 3 fires)

Bishop will run the following against Supabase Postgres (DATABASE_URL from .env) after Founder ratifies OQ-3 = Y:

```bash
psql $DATABASE_URL -f src/main/ip_ledger/schema.sql
```

Then verify:
```bash
psql $DATABASE_URL -c "\d ip_ledger_entries"
psql $DATABASE_URL -c "\d ip_ledger_merkle_diff"
psql $DATABASE_URL -c "SELECT tablename, rowsecurity FROM pg_tables WHERE tablename LIKE 'ip_ledger%'"
```

Bishop posts psql output to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/BISHOP_BLOCK3_MIGRATION_RECEIPT_BP092.md` before waking Knight for Block 3.

---

Caithedral™ · §14 §15 §17 BLOOD · Postgres-only · gen_random_uuid() · Sonnet 4.6 · BP092
