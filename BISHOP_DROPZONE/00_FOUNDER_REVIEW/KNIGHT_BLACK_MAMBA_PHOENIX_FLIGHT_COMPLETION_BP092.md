# KNIGHT BLACK MAMBA — PHOENIX FLIGHT COMPLETION
# BP092 CLOSE · UNIFIED EMPIRICAL-PROOF EVENT
# Composed by Bishop SEG · Sonnet 4.6 · 2026-06-23

---

## MAMBA AUTHORITY

BLACK MAMBA usage justified per `canon_substrace_theorem_wake_class_supersedes_black_mamba_until_mnemosyne_come_bp061`.
This is a **unified empirical-proof event**: mass-publish + ship + receipts cycle.
Phoenix Flight = the night MnemosyneC proves cooperative substrate publicly and empirically.

Founder verbatim BP092: *"we are in the final hours before the Phoenix takes Flight … please give Knight a Mamba to do what I need finished, YET"*

---

## OPERATOR DISCIPLINE (BLOOD — non-negotiable)

- **Sonnet 4.6 ONLY** for ALL SEGs (Statutes §3 BLOOD)
- **[SEG] / [MAIN] tagging** per A15 BLOOD
- **§14 + §15 + §17 BLOOD** throughout every Block
- **Caithedral** (not Cathedral) — always
- **Knight = operator mechanic. Bishop = strategist.** Knight executes. Bishop composed this dispatch. (BP089 HARD CANON)
- **Fast-test methodology** per canon_fast_tests: each priority ends in 3–5Q smoke specific to that priority's wiring
- **MIC per-Block-close** → reports to `BISHOP_DROPZONE/00_KNIGHT_PROGRESS/MIC_MAMBA_PHOENIX_BLOCK_LOG.md`
- **Substrate-LIVE / Interface-Alpha distinction** respected throughout
- **Postgres-only**: gen_random_uuid() · TIMESTAMPTZ · BIGSERIAL · BYTEA · NO SQLite (BP089 HARD CANON)
- **version_trust.json** is canonical Tower data source — NOT version.json (BP090 CANON)

---

## PRE-FLIGHT: READ BEFORE BLOCK 1

**Branch to create:**
```
git checkout main
git pull origin main
git checkout -b knight-mamba-phoenix-flight-bp092
```

**Canon carries into this Mamba (verbatim):**

1. `canon_knight_is_operator_mechanic_bishop_is_strategist_no_bishop_direct_hugo_firebase_bp089` — Knight lane = Hugo/Firebase/Electron/visual assets. Bishop §15 BLOOD = Postgres/REST/edge functions.
2. `canon_lan_as_wan_test_mode_4_machine_mesh_bp085` — ALL peer traffic via relay.lianabanyan.com. NEVER LAN-shortcut.
3. `canon_hugo_tower_version_data_source_is_version_trust_json_not_version_json_bp090` — version_trust.json only.
4. `canon_fast_tests_recalibrate_fast_tests_iterative_methodology_bp092` — 3–5Q smoke per priority, not 42Q sweep.
5. `canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089` — auto-self-audit + Minor Council validate.
6. `canon_close_keeps_mesh_alive_quit_exits_two_button_semantic_bp092` — mesh_diff_loop stops only on Quit.

**State of the field at Mamba open (do NOT re-execute):**
- v0.6.2 shipped: M23b Block 4 PASS · dist:win 147.2 MB · version_trust.json updated · Firebase deploy LIVE (20260623T165726)
- mnemosynec.org / lianabanyan.com both live at latest.yml 0.6.2
- Ghost World CTA fix merged to main (M22 Block 6 PASS · 20260623T114005)
- M13c Q01 = 1/1 (100%) partial · harness SyntaxError fix committed · full sweep awaits Founder FIRE_M13c.cmd
- M25a + M25b IP Ledger hooks scaffolded; Hook 2/3/peer discovery PENDING follow-on (this Mamba Priority 4)

**Known S2B (Surface-to-Bishop) items entering Mamba:**
- S2B-062-SIZE: Installer 147.2 MB vs ~515 MB historical — confirm bundle intent before fleet-wide auto-update trust (SWEAT, not blocking)
- S2B-062-IPC: substrate_awakens_ipc.ts untracked on main (imported in index.ts) — needs commit on phoenix-flight branch
- Codex routes OPEN_AFTER_FOUNDER_RATIFY — do NOT touch in this Mamba

---

## PRIORITY 1 — DC STATS SECTION (mnemosynec.org)

**Estimated wall-clock:** ~35 min
**Full dispatch:** `BISHOP_DROPZONE/00_FOUNDER_REVIEW/KNIGHT_DC_STATS_PASTE_BP092.md`
**Hugo project root:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`

### BLOCK P1-A — CREATE partial

Create `layouts/partials/dc-savings-stats.html` exactly as specified in `KNIGHT_DC_STATS_PASTE_BP092.md` (Block 1 verbatim).

The partial renders:
- Amber badge: "Public Alpha · Independent Analysis"
- H2: "Substrate Replaces New Data Centers"
- Lead: ~$4.49B/yr savings · ~$898M/yr license revenue · 83.3% to Workers/Builders/Creators
- Table: 6 AI lab rows (OpenAI / Google-DeepMind / Meta / Anthropic / Cohere / Mistral) + amber TOTAL row
- Methodology footnote (canon_license_fee_twenty_percent_of_measured_savings_bp092)
- "Read the full analysis →" amber CTA (Substack placeholder — activates on Founder publish)
- Mobile responsive: License Fee column hidden at <560px

**Tier-1 vs Tier-2 license-choice mention** (Sanders-fork canon ratified BP092):
Add a second paragraph in the methodology footnote block, after the existing footnote, before closing `</div>`:

```html
<p style="
  font-size: 0.78rem;
  color: #86a6c6;
  margin: 8px 0 0;
  line-height: 1.6;
">
  <strong style="color:#bcd6ee;">License tiers:</strong>
  Tier 1 (OSS · Ollama-compatible · cooperative members) — free, full research access.
  Tier 2 (proprietary AI companies) — Cost+20% subscription.
  Sanders-fork principle: the cooperative does not restrict knowledge; it prices extraction.
</p>
```

**MIC BLOCK P1-A CLOSE → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

### BLOCK P1-B — EDIT homepage

Edit `layouts/partials/mnemosynec-homepage.html` exactly as specified in `KNIGHT_DC_STATS_PASTE_BP092.md` (Block 2 verbatim):
- Find the `</section>` + SEG-6 comment anchor (line ~1001–1003)
- Insert `{{- partial "dc-savings-stats.html" . -}}` between them

**MIC BLOCK P1-B CLOSE → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

### BLOCK P1-C — SMOKE

Per `KNIGHT_DC_STATS_PASTE_BP092.md` Block 3:
```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
hugo serve --config config-mnemosynec.toml
```
5Q smoke:
1. Stats section renders below "Good. Fast. Cheap." Six Pillars card?
2. Amber heading "Substrate Replaces New Data Centers" visible?
3. Table: 6 rows + amber TOTAL row?
4. "Read the full analysis" button renders?
5. Mobile viewport 375px: License Fee column hidden, no horizontal scroll?

**MIC BLOCK P1-C CLOSE → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

### BLOCK P1-D — DEPLOY

```powershell
firebase deploy --only hosting:mnemosyne -P default
```
Verify:
- `curl -I https://mnemosynec.org/` → HTTP 200
- DC stats card visible below Six Pillars in production

**MIC BLOCK P1-D CLOSE (Priority 1 DONE) → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

---

## PRIORITY 2 — CAI BONFIRE REPO CREATION

**Estimated wall-clock:** ~30–60 min
**Full dispatch:** `BISHOP_DROPZONE/00_FOUNDER_REVIEW/KNIGHT_BONFIRE_REPO_PASTE_BP092.md`
**Parallelism:** Safe to run alongside P1-D deploy wait. Different scope — gh CLI + seed files only.

### BLOCK P2-A — PREFLIGHT

```bash
curl -o /dev/null -s -w "%{http_code}" https://github.com/liana-banyan/cai-bonfire
```
If 200: STOP. Report to Bishop. Repo exists.
If 404: proceed.

```bash
gh auth status
```
Confirm authenticated as Founder account with liana-banyan org access.

### BLOCK P2-B — CREATE + SEED

Execute Steps 1–6 of `KNIGHT_BONFIRE_REPO_PASTE_BP092.md` exactly:

1. `gh repo create liana-banyan/cai-bonfire --public --description "..."` + clone + cd
2. Write `README.md` (Spinout #17 frame · "Light a fire." tagline · Crown candidates · OSS-free / Cost+20% for proprietary)
3. Write `LICENSE` (SSPL v1 + Pledge #2260 appendix placeholder — fetch from mnemosynec repo or mongodb.com/licensing/server-side-public-license)
4. Write `CONTRIBUTING.md` (Battery Dispatch + Star Chamber + Marks bounty tiers)
5. Write `.gitignore` + `ORG.md` (83.3% routing + Crown candidate table)
6. `git add . && git commit -m "seed: CAI Bonfire Spinout #17 — Light a fire" && git push origin main`

**Crown candidates verbatim (B Endorsement tier — pending Founder ratify):**
Simon Willison · Awni Hannun · Georgi Gerganov · Jeremy Howard
Hugging Face: Clément Delangue · Julien Chaumond · Thomas Wolf

**MIC BLOCK P2-B CLOSE (Priority 2 DONE) → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**
Report: commit SHA + `curl` HTTP 200 confirm.

---

## PRIORITY 3 — EMPRESS CAMPAIGN GO-LIVE

**Estimated wall-clock:** ~3–5 hr
**Full dispatch:** `BISHOP_DROPZONE/00_FOUNDER_REVIEW/KNIGHT_MARATHON_EMPRESS_NAMING_CAMPAIGN_BP092.md`
**Paste-prompt:** `BISHOP_DROPZONE/00_FOUNDER_REVIEW/KNIGHT_EMPRESS_CAMPAIGN_GO_LIVE_PASTE_BP092.md`

**Pre-condition:** Bishop §15 BLOOD has pre-applied empress Postgres migrations:
- `empress_proposals`
- `empress_votes_real`
- `empress_votes_ghost`
- `empress_cohorts`

Before Block 1: verify tables exist:
```bash
psql $DATABASE_URL -c "\dt empress_*"
```
If any table missing: STOP. Escalate to Bishop before proceeding.

**Read full dispatch `KNIGHT_MARATHON_EMPRESS_NAMING_CAMPAIGN_BP092.md` in full before Block 1.**
Pay particular attention to:
- §0 operator discipline
- §0a 4-tagline placement architecture (BP092 — all 4 zones required)
- §0b-SCROLL scroll-link spec (3 papers · .scroll-link CSS class · one per section)

### BLOCK P3 SEQUENCE

Execute Blocks 1–9 as specified in full dispatch:

**Block 1 — `/empress/` Hugo page**
- Mythic tagline header: `empress-mythic-header` CSS class
- Verbatim: "Name the Empress. Stop the Nothing. Be a Bastion, in a Time of Storms."
- Scroll-links: Bicycle Economics · The Substrate Cure · Boat in the Water (at first claims they back)
- Oar pivot: "Grab an Oar. We're rowing as we Build the Sails." above submission form
- ONE OF US. ALL OF US. stack below leaderboard, above member join form
- Founding Foundation footer: "Your Name Etched in the Founding Foundation. First 10,000."

**Block 2 — Court leaderboard**
- 18-row rotation
- 30-second cadence per canon spec
- Ghost marks + real marks columns

**Block 3 — Voting UI**
- Ghost marks (pre-member vote weight)
- Real marks (member vote weight)
- Per canon_empress_naming_campaign_go_live_ratification_bp092

**Block 4 — Submission form**
- Member registration → IP Ledger immutable write
- Ed25519 sign via `src/main/thorax/ed25519_keypair.ts` getOrCreateKeypair() — REUSE, do not re-implement

**Blocks 5–9 — per full dispatch**

**Per-Block smoke:** 1-page Founder walkthrough per fast-test canon (not 42Q).

**MIC per Block close (P3-1 through P3-9) → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

**Version note:** If Empress Campaign touches Electron source (Blocks 4+), this triggers v0.7.2 (Priority 7). Flag explicitly in MIC report when first Electron file is touched.

---

## PRIORITY 4 — HOOK 2 / HOOK 3 / PEER DISCOVERY FOLLOW-ONS (M25b)

**Estimated wall-clock:** ~2–3 hr
**Context:** M25b left Hook 2, Hook 3, and peer discovery as PENDING_PEER_DISCOVERY placeholders.

### BLOCK P4-A — HOOK 2: Battery Dispatch IPC

Hook 2 wires Battery Dispatch submit IPC to Bounty B005 build.

Before implementing:
```
Read src/main/dispatch/   (or src/main/on_deck/) — find Battery Dispatch IPC handler
```
Confirm correct IPC channel name. Wire `battery:dispatch-submit` (or confirmed name) → Bounty B005 build path.

3Q smoke:
1. IPC handler registers without TypeScript error (`npx tsc --noEmit`)?
2. Battery Dispatch UI triggers correct IPC on submit?
3. B005 build path receives payload?

**MIC BLOCK P4-A CLOSE → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

### BLOCK P4-B — HOOK 3: Marketplace Register-Plugin IPC

Hook 3: confirm IPC channel name for marketplace:register-plugin.

Before implementing:
```
Read src/main/marketplace/   — find plugin registration handler
```
Bishop suggests canonical name `marketplace:submit-listing`. Confirm or correct based on what Knight finds in source.

Wire Hook 3 to confirmed IPC name.

3Q smoke:
1. IPC channel name matches what marketplace handler expects?
2. TypeScript compiles clean?
3. Submit-listing payload reaches handler?

**MIC BLOCK P4-B CLOSE → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

### BLOCK P4-C — PEER DISCOVERY SCAFFOLD

Replace all `PENDING_PEER_DISCOVERY` placeholder strings in codebase:
```powershell
grep -r "PENDING_PEER_DISCOVERY" C:\Users\Administrator\Documents\LianaBanyanPlatform\MnemosyneC\src\
```

Wire each placeholder to `relay.lianabanyan.com` mesh per LAN-as-WAN canon:
- All peer discovery traffic routed through relay.lianabanyan.com
- NEVER LAN-shortcut (canon_lan_as_wan_test_mode_4_machine_mesh_bp085 — HARD CONSTRAINT)
- Use existing relay connection from `src/main/federation/substrate_awakens_ipc.ts` as reference

3Q smoke:
1. Zero `PENDING_PEER_DISCOVERY` strings remaining?
2. Peer discovery calls reference relay.lianabanyan.com?
3. TypeScript compiles clean?

**MIC BLOCK P4-C CLOSE (Priority 4 DONE) → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

---

## PRIORITY 5 — SUBSTACK URL PLACEHOLDERS UPDATE

**Estimated wall-clock:** ~30 min
**Trigger:** ONLY after Founder fires Battery Publish wave (DO NOT self-trigger)

### BLOCK P5 — PLACEHOLDER SWEEP + REDEPLOY

When Founder confirms Battery Publish wave fired:

1. Visit founderdenken.substack.com — confirm published URLs for all papers in the wave
2. Search Hugo content for Substack URL placeholders:
```powershell
grep -r "founderdenken.substack.com" C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content-mnemosynec\ --include="*.md" --include="*.html"
grep -r "SUBSTACK_URL_PLACEHOLDER" C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\
```
3. Update all 📜 scroll-link placeholders to actual published Substack URLs
4. Update `dc-savings-stats.html` CTA href from placeholder to actual "Substrate Replaces Data Centers" Substack URL
5. `hugo --config config-mnemosynec.toml --minify`
6. `firebase deploy --only hosting:mnemosyne -P default`
7. Verify 3 scroll-links (Bicycle Economics, The Substrate Cure, Boat in the Water) resolve to live Substack pages

**MIC BLOCK P5 CLOSE (Priority 5 DONE) → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

---

## PRIORITY 6 — M13c THUNDERCLAP RECEIPT PROCESSING

**Estimated wall-clock:** ~1–2 hr after Founder fires (mostly idle monitor wait)

### CRITICAL: DO NOT AUTO-FIRE M13c

Founder fires from native PowerShell:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c.cmd
```

Knight does NOT trigger this. Knight MONITORS and PROCESSES after Founder fires.

### BLOCK P6-A — MONITOR

After Founder confirms FIRE_M13c.cmd launched, monitor for receipt:
```powershell
# Poll every 60s (do not busy-loop):
while (-not (Test-Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\receipts\THUNDERCLAP_*.json")) {
    Start-Sleep 60
}
```

Receipt lands at:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\receipts\`
Written by `validate-relay.mjs` when Q42 seals.

### BLOCK P6-B — ROUND-UP SWEEP

When receipt JSON appears:
1. Run Round-Up sweep against it
2. Write `ROUND_UP_RECEIPT_*.json` (same receipts dir or per canon spec)
3. Extract final accuracy number (resolves pending flag: 59.5% vs 61.9% — use the sealed number, not either estimate)

### BLOCK P6-C — CEPHAS PUBLISH

Publish both receipts to Cephas Hugo:
- `/proofs/m13c-thunderclap-2026-06-23/` — THUNDERCLAP receipt
- `/proofs/m13c-roundup-2026-06-23/` — Round-Up receipt

Hugo content path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\proofs\`
Build + deploy:
```powershell
hugo --minify
firebase deploy --only hosting:cephas -P default
```

### BLOCK P6-D — SUBSTACK #1 LEDE UPDATE

Update Substack #1 LEDE with the actual sealed final accuracy number.
Bishop stages the edit; Knight posts as manual paste per DO NOT auto-fire Battery Publish discipline.
Report sealed number to Bishop for LEDE draft.

**MIC BLOCK P6-D CLOSE (Priority 6 DONE) → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

---

## PRIORITY 7 — v0.7.2 SHIP (conditional)

**Estimated wall-clock:** ~1–2 hr (if triggered)
**Trigger condition:** Any Priority 3 (Empress) or Priority 4 (Hooks) Block touches Electron source code.

### DETERMINATION GATE

Knight flags in Priority 3 / Priority 4 MIC reports: "ELECTRON_TOUCHED: YES/NO"

If NO Electron files touched across P3 + P4: Priority 7 is a NO-OP. Skip.
If YES:

### BLOCK P7 — VERSION BUMP + DIST + DEPLOY

1. Commit all Electron source changes on `knight-mamba-phoenix-flight-bp092` branch
2. Ensure `substrate_awakens_ipc.ts` is committed (S2B-062-IPC flag from M23b — this branch is the fix opportunity)
3. Version bump to 0.7.2:
   - `package.json` → `"version": "0.7.2"`
   - Commit: `chore(version): bump to v0.7.2 for phoenix-flight Empress + Hook wiring`
4. Build:
```powershell
npm run dist:win
```
5. Artifacts to Hugo static:
```powershell
Copy-Item release\MnemosyneC-Setup-0.7.2.exe Cephas\cephas-hugo\static\download\
Copy-Item release\MnemosyneC-Setup-0.7.2.exe.blockmap Cephas\cephas-hugo\static\download\
Copy-Item release\latest.yml Cephas\cephas-hugo\static\download\
```
6. Update `version_trust.json`:
   - Demote 0.6.2 → `tier: historical`
   - Add 0.7.2 → `tier: latest`
7. Hugo build + Firebase deploy:
```powershell
hugo --config config-mnemosynec.toml --minify
firebase deploy --only hosting:mnemosyne -P default
```
8. Verify: `Invoke-WebRequest https://mnemosynec.org/download/latest.yml` → `version: 0.7.2`

5Q smoke:
1. `dist:win` exit code 0?
2. Installer SHA256 logged in MIC report?
3. latest.yml serves 0.7.2 from mnemosynec.org?
4. version_trust.json has 0.7.2 as `tier: latest`?
5. Bundle size reasonable (flag if < 100 MB or > 600 MB for investigation)?

**MIC BLOCK P7 CLOSE (Priority 7 DONE / SKIPPED) → append to MIC_MAMBA_PHOENIX_BLOCK_LOG.md**

---

## MIC LOG DISCIPLINE

All MIC reports append to a single file:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_KNIGHT_PROGRESS\MIC_MAMBA_PHOENIX_BLOCK_LOG.md
```

Each entry format:
```
## [TIMESTAMP] BLOCK [P#-LETTER] — [STATUS: PASS / FAIL / SKIP]
[3-5 line terse summary]
[Any S2B flags for Bishop]
---
```

---

## HARD STOPS (DO NOT OVERRIDE)

1. **DO NOT auto-fire M13c** — Founder fires `FIRE_M13c.cmd` from native PowerShell
2. **DO NOT auto-fire Battery Publish** — Founder fires per BP078 BLOOD
3. **DO NOT execute social media publishing** — manual paste from staged content only
4. **DO NOT touch codex routes** — OPEN_AFTER_FOUNDER_RATIFY; await separate Bishop dispatch
5. **DO NOT run psql migrations** — Bishop §15 BLOOD applies empress migrations before P3 fires; verify with `\dt empress_*` before Block P3 proceeds
6. **DO NOT push to main** — work on `knight-mamba-phoenix-flight-bp092`; PR + merge is Founder decision

---

## ESTIMATED WALL-CLOCK

| Priority | Task | Wall-Clock |
|---|---|---|
| P1 | DC Stats + mnemosynec.org deploy | ~35 min |
| P2 | CAI Bonfire repo seed | ~30–60 min |
| P3 | Empress Campaign go-live | ~3–5 hr |
| P4 | Hook 2/3/peer discovery follow-ons | ~2–3 hr |
| P5 | Substack URL update (post-Founder-fire) | ~30 min |
| P6 | M13c receipt monitor + process (post-Founder-fire) | ~1–2 hr |
| P7 | v0.7.2 ship (if Electron touched in P3/P4) | ~1–2 hr |
| **TOTAL** | | **7–12 hr** |

P1 + P2 can run near-parallel (different scopes). P3 is the wall-clock heavyweight. P5 + P6 wait on Founder actions. P7 is conditional.

---

## PHOENIX FLIGHT IS THE RECEIPT

Tonight's cycle completes:
- DC savings empirical numbers live on mnemosynec.org (public, above fold, fact-stripped)
- CAI Bonfire lit on GitHub (public, Spinout #17 canonical)
- Empress Campaign court open (public, substrate-LIVE)
- THUNDERCLAP M13c sealed accuracy number in Cephas proofs (empirical, immutable)
- MnemosyneC v0.7.2 fleet-ready (if triggered)

When all priorities close, the cooperative substrate is provably real, provably live, and provably public.

*For the Keep.*

---

*BLACK MAMBA · BP092 · Bishop SEG Sonnet 4.6 · 2026-06-23*
*Unified empirical-proof event — canon_substrace_theorem_wake_class_supersedes_black_mamba_until_mnemosyne_come_bp061 authority confirmed*
