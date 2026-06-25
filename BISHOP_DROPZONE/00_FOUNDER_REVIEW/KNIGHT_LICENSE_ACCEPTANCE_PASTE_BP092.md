# Knight Paste-Prompt — License Acceptance Gate BP092
**Model**: Sonnet 4.6 only · **BLOOD**: §14 §15 §17 · MIC per-Block-close · Caithedral

---

You are Knight. Bishop B092 dispatches you to implement the MnemosyneC download-page license acceptance gate per Founder-direct BP092.

## Canon rule (verbatim)
"Click download and it starts downloading and says 'while it's downloading (558MB) review which license you prefer' and then show two buttons: SSPL and APACHE." — Founder direct.

## What you are building

A license-choice modal that fires ON THE DOWNLOAD PAGE the moment a user clicks the download button. The file download starts immediately. The modal opens simultaneously. The modal cannot be dismissed without choosing a license. Two big amber buttons: SSPL + Pledge #2260 OR Apache 2.0 + Cooperative Endorsement. Each button reveals a plain-English explainer + checkbox + Pledge #2260 checkbox. Apache path also requires Tier 1 / Tier 2 selection. On Confirm: save to localStorage + POST to Supabase edge function.

## Four blocks

**PRE-BLOCK**: Gadget the download page (`content-mnemosynec/download/_index.md`), read `version_trust.json` for current version + installer size, check whether `license_acceptances` Supabase table exists, check whether `layouts/partials/license-choice-modal.html` exists. Report all 4 findings before proceeding.

**BLOCK 1**: Create `layouts/partials/license-choice-modal.html` (vanilla JS only, no framework). Modify `_index.md` to add partial call + JS hook on download button. Modal copy: "Your download has started ([SIZE] MB · 5–10 min depending on connection). While it downloads, review which license you prefer." Two amber buttons. SSPL panel: explainer + 2 checkboxes + Confirm. Apache panel: tier selection first, then explainer + 2 checkboxes + Confirm. On Confirm: `localStorage.setItem('lb_license_choice', ...)` + `fetch('/api/v1/license-choice', { method: 'POST', ... })`.

**BLOCK 2**: Create Supabase edge function `platform/supabase/functions/license-acceptance/index.ts`. Accepts: `{ license_choice, tier, pledge_acknowledged, timestamp, session_id, email? }`. Validates input, extracts IP from headers, inserts into `license_acceptances` table (Postgres only — BIGSERIAL, TIMESTAMPTZ, TEXT CHECK constraints). Apache choice sets `status = 'pending-cooperative-meeting'`. SSPL choice for a known member writes `ip_ledger_entries` row. Return `{ success: true, status, id }`. Deploy: `supabase functions deploy license-acceptance`. Verify HTTP 200 on smoke POST. Add Firebase Hosting rewrite so `/api/v1/license-choice` routes to this function.

**BLOCK 3**: Bump MnemosyneC to v0.7.2 in `package.json` AND `version_trust.json` (canonical — per BP090, `version.json` is stale, do NOT touch it). Add soft-reminder to first-run wizard: if `lb_license_choice` found in localStorage → show non-blocking banner "You chose [SSPL/Apache] at download. Continuing with that. [Change?]". If NOT found → show blocking two-panel modal same as web (POST with `source: 'installer'`). Build `npm run dist:win`. Upload to Firebase Storage. Update download URL in `version_trust.json` if path changed.

**BLOCK 4**: Hugo build + Firebase deploy mnemosynec.org. Smoke checklist: (a) download page HTTP 200, (b) click download → file starts + modal opens simultaneously, (c) modal cannot dismiss without choice, (d) SSPL + Apache paths both require both checkboxes, (e) Apache requires tier selection first, (f) Confirm → localStorage key written, (g) Confirm → POST returns 200, (h) row in `license_acceptances`, (i) v0.7.2 soft-reminder shows on first app launch. Report each predicate PASS/FAIL. Fix failures before reporting complete.

## Key copy (verbatim — do not alter without Founder ratify)

**SSPL explainer**: "Free to use. Free to fork. If you ship the code (or a service built on it), you ship the cooperative obligation — your modifications and your service offering remain SSPL+Pledge available to the cooperative pool. You pay nothing. You accept the obligation to leave the substrate as good as you found it."

**Apache explainer**: "For businesses that need permissive licensing for proprietary distribution. You pay a license fee proportional to substrate-replacement savings. Either Tier 1 (20% of savings to cooperative · 80% you keep) or Tier 2 (Sanders-fork · 50% split — 20% cooperative + 30% public sovereign fund · 50% you keep · regulatory hedge against AI equity-tax legislation)."

**Pledge #2260 explainer**: "Cooperative-obligation extension that ensures the cooperative pool stays accessible regardless of corporate ownership changes. Required for both license tiers. Irrevocable. Non-weaponizable."

## Postgres schema (§15 BLOOD — no SQLite primitives)

```sql
CREATE TABLE IF NOT EXISTS license_acceptances (
  id                  BIGSERIAL PRIMARY KEY,
  session_id          UUID NOT NULL,
  member_id           UUID REFERENCES members(id) ON DELETE SET NULL,
  email               TEXT,
  license_choice      TEXT NOT NULL CHECK (license_choice IN ('sspl', 'apache')),
  tier                INTEGER CHECK (tier IN (1, 2)),
  pledge_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address          TEXT,
  status              TEXT NOT NULL DEFAULT 'accepted'
                      CHECK (status IN ('accepted', 'pending-cooperative-meeting', 'meeting-complete', 'superseded')),
  source              TEXT NOT NULL DEFAULT 'download-page'
                      CHECK (source IN ('download-page', 'installer', 'api')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

If table already exists from a prior migration: ALTER TABLE to add missing columns only — do NOT DROP.

## MIC per-Block-close required

After each block: output a MIC stamp summarizing files touched, actions taken, predicates verified. Do not start the next block until MIC close is written.

## Sequencing note

Fire this task ONLY after BLACK MAMBA P1-P3 are complete, OR if firing in parallel: work on branch `bp092-license-gate` and do not touch files that overlap with BLACK MAMBA scope.

## Full dispatch (for deep reference)

`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_QUICK_TASK_DOWNLOAD_PAGE_LICENSE_ACCEPTANCE_FLOW_BP092.md`
