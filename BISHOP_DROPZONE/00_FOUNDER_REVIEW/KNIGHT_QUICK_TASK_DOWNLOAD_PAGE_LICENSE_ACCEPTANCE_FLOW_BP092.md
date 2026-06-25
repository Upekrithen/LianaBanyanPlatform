# Knight Quick-Task — Download Page License Acceptance Flow
**Dispatched by**: Bishop B092 (Sonnet 4.6)
**Priority**: HIGH — legal exposure gap · no license acceptance gate live as of v0.5.17
**Canon anchor**: `canon_download_page_license_acceptance_dual_button_during_download_ux_bp092.eblet.md`
**BLOOD**: §14 §15 §17 · MIC per-Block-close · Caithedral · Sonnet 4.6 only
**Estimated wall-clock**: 2–3 hours

---

## Mandatory Preamble

- Model: **Sonnet 4.6 only** — no escalation without Bishop approval
- BLOOD §14: Use SEGs (Structured Execution Gates) for every block. Do not run blocks in parallel.
- BLOOD §15: Postgres only. No SQLite primitives. `gen_random_uuid()` / `TIMESTAMPTZ` / `BIGSERIAL` / `BYTEA`. Self-audit before submitting any migration. Minor Council gemma4:12b validates if uncertain.
- BLOOD §17: DEPLOY-ALL-TOUCHED gate — enumerate every file modified, deploy every touched Supabase function, verify HTTP 200 on every deployed route.
- MIC per-Block-close: after each block, output a MIC-format close stamp before proceeding.
- Caithedral: all reasoning uses Caithedral discipline — no hallucination, cite file paths verbatim.
- Knight is the OPERATOR MECHANIC. Bishop COMPOSES. Knight EXECUTES. No Bishop-direct Hugo/Firebase deploys.

---

## PRE-BLOCK — Gadget Current State

**Do not skip. Do not assume. Read the actual files.**

### PRE-1: Read the Hugo download page

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content-mnemosynec\download\_index.md
```

Note: current download button points to `MnemosyneC-Setup-0.4.3.exe`. Confirm the current canonical version from `version_trust.json` (read path below) and use that version in modal copy.

### PRE-2: Read version_trust.json (canonical Hugo Tower data source — per BP090 canon)

Search for `version_trust.json` under:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\
```

Extract: current version number + installer size (MB). Use these values verbatim in modal copy.

### PRE-3: Check for existing license_acceptances table

Run against Supabase (§15 psql route):
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'license_acceptances'
ORDER BY ordinal_position;
```

If table exists: gadget its schema. If not: Block 2 migration will create it.

### PRE-4: Check for existing license-choice edge function or modal component

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\license-acceptance\
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\license-choice-modal.html
```

Report: exists or not-exists. If exists, read and gadget before overwriting.

**MIC PRE-BLOCK CLOSE**: Report findings on all 4 items. State exact version number + installer MB from version_trust.json. State whether license_acceptances table exists. State whether any existing modal/edge-fn exists. Then proceed to Block 1.

---

## BLOCK 1 — Hugo Download Page Modal (Vanilla JS)

**Files to create/modify:**
1. `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\license-choice-modal.html` — CREATE
2. `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content-mnemosynec\download\_index.md` — MODIFY (add partial call + download button JS hook)

### license-choice-modal.html requirements

- **Vanilla JS only** — no React, no Vue, no external dependencies on the Hugo side
- Modal triggered by download button click via `onclick="openLicenseModal(event)"` — do NOT delay the file download, trigger it first then open modal
- Modal cannot be dismissed without choosing a license (no X button, no click-outside-to-close, Escape key disabled while modal is open)
- Two big amber-accent buttons (CSS: `background: #f59e0b; color: #1a1a1a; font-size: 1.2rem; font-weight: 800; padding: 1rem 2rem; border: none; border-radius: 8px; cursor: pointer;`) — matching the alpha banner color on mnemosynec.org

**Modal copy (verbatim — do not alter):**

```
Your download has started ([SIZE] MB · 5–10 min depending on connection).

While it downloads, review which license you prefer:
```

Replace `[SIZE]` with the actual MB value from version_trust.json.

**Two button labels (verbatim):**
- `SSPL + Pledge #2260 — Cooperative License`
- `Apache 2.0 + Cooperative Endorsement — Business License`

**SSPL panel (revealed on SSPL button click):**

Plain-English explainer (verbatim — do not alter):
> "Free to use. Free to fork. If you ship the code (or a service built on it), you ship the cooperative obligation — your modifications and your service offering remain SSPL+Pledge available to the cooperative pool. You pay nothing. You accept the obligation to leave the substrate as good as you found it."

Then:
- `[ ] I agree to the SSPL v1 license`
- `[ ] I acknowledge Pledge #2260` (separate checkbox — always required)
- Confirm button (disabled until both checked)

**Apache panel (revealed on Apache button click):**

First show Tier selection:
```
Apache 2.0 requires a paid commercial license. Choose your tier:

[ Tier 1 — 20% of Measured Savings ]
You keep 80% of substrate-replacement savings. Pay 20% to the cooperative.

[ Tier 2 — Sanders Fork · 50% Split ]
You keep 50%. Cooperative receives 20%. Public Sovereign Fund receives 30%.
Hedge against AI equity-tax legislation.
```

After tier selected, show plain-English explainer (verbatim — do not alter):
> "For businesses that need permissive licensing for proprietary distribution. You pay a license fee proportional to substrate-replacement savings. Either Tier 1 (20% of savings to cooperative · 80% you keep) or Tier 2 (Sanders-fork · 50% split — 20% cooperative + 30% public sovereign fund · 50% you keep · regulatory hedge against AI equity-tax legislation)."

Then:
- `[ ] I agree to the Apache 2.0 + Commercial License`
- `[ ] I acknowledge Pledge #2260` (separate checkbox — always required)
- Confirm button (disabled until both checked AND tier selected)

**Pledge #2260 explainer** (shown inline under both paths, before the checkbox):
> "Cooperative-obligation extension that ensures the cooperative pool stays accessible regardless of corporate ownership changes. Required for both license tiers. Irrevocable. Non-weaponizable."

**On Confirm:**
```javascript
// 1. Save to localStorage
localStorage.setItem('lb_license_choice', JSON.stringify({
  license: chosenLicense,   // 'sspl' or 'apache'
  tier: chosenTier,         // null | 1 | 2
  pledge: true,
  ts: new Date().toISOString()
}));

// 2. POST to edge function (fire-and-forget — do not block modal close on network)
fetch('/api/v1/license-choice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    license_choice: chosenLicense,
    tier: chosenTier,
    pledge_acknowledged: true,
    timestamp: new Date().toISOString(),
    session_id: getOrCreateSessionId(),  // read from sessionStorage, create uuid if absent
    email: getMemberEmailIfPresent()     // read from member session cookie if present, else null
  })
});

// 3. Close modal
document.getElementById('license-modal').style.display = 'none';
```

`getOrCreateSessionId()`: check `sessionStorage.getItem('lb_session_id')` — if absent, generate `crypto.randomUUID()`, store it, and return it.
`getMemberEmailIfPresent()`: check for `lb_member_email` cookie or `localStorage.getItem('lb_member_email')` — return null if absent, never prompt user for email in this modal.

**POST target URL mapping**: Hugo partial cannot know the Supabase function URL directly. Use a relative path `/api/v1/license-choice` which must be routed via Firebase Hosting rewrite to the Supabase edge function. Add the rewrite to `firebase.json` in Block 4.

### _index.md modification

- Find the existing download button markup
- Wrap it: `<a ... onclick="openLicenseModal(event)" ...>`
- Add `{{ partial "license-choice-modal.html" . }}` near bottom of page (before closing body)

**MIC BLOCK 1 CLOSE**: List every file touched. Confirm modal created. Confirm _index.md modified. Confirm vanilla JS only (no framework imports). Then proceed to Block 2.

---

## BLOCK 2 — Supabase Edge Function: license-acceptance

**File to create:**
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\license-acceptance\index.ts
```

**Also create migration if table does not exist (from PRE-3 gadget):**
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260623000001_license_acceptances_table.sql
```

### Migration (Postgres only — §15 BLOOD):

```sql
-- 20260623000001_license_acceptances_table.sql
-- BP092 download-page license acceptance gate

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

CREATE INDEX IF NOT EXISTS idx_license_acceptances_member_id ON license_acceptances(member_id);
CREATE INDEX IF NOT EXISTS idx_license_acceptances_email    ON license_acceptances(email);
CREATE INDEX IF NOT EXISTS idx_license_acceptances_session_id ON license_acceptances(session_id);
```

If `license_acceptances` already exists from a prior migration, write an ALTER TABLE migration instead — do NOT DROP and recreate. Add only missing columns.

### Edge function: license-acceptance/index.ts

**Accepts (POST body)**:
```typescript
{
  license_choice: 'sspl' | 'apache',
  tier?: 1 | 2 | null,
  pledge_acknowledged: boolean,
  timestamp: string,   // ISO8601
  session_id: string,  // UUID
  email?: string | null
}
```

**Logic**:
1. Validate: `license_choice` must be `'sspl'` or `'apache'`. `pledge_acknowledged` must be `true`. If either fails, return 400.
2. Extract `ip_address` from `req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'`.
3. Determine `status`:
   - If `license_choice === 'sspl'`: `status = 'accepted'`
   - If `license_choice === 'apache'`: `status = 'pending-cooperative-meeting'`
4. Resolve `member_id`: if `email` provided, query `members` table for matching active member. Use the returned `id` or `null`.
5. Insert into `license_acceptances`.
6. If `member_id` is not null AND `license_choice === 'sspl'`: insert into `ip_ledger_entries` (cooperative attribution):
   ```sql
   INSERT INTO ip_ledger_entries (member_id, entry_type, description, created_at)
   VALUES ($1, 'license-acceptance', 'SSPL + Pledge #2260 accepted at download — BP092', NOW())
   ```
   If `ip_ledger_entries` table does not exist, skip this step and log a warning — do NOT error.
7. Return `{ success: true, status: <status>, id: <inserted row id> }` with HTTP 200.

**CORS**: Allow `https://mnemosynec.org` and `https://mnemosynec.ai` origins.

**DEPLOY-ALL-TOUCHED gate (§17 BLOOD)**:
After writing the edge function, enumerate all Supabase functions that were touched or created.
Deploy each one:
```bash
supabase functions deploy license-acceptance
```
Verify: POST a test payload, confirm HTTP 200 response.

**MIC BLOCK 2 CLOSE**: Confirm migration file path + content (Postgres-only self-audit). Confirm edge function deployed. Confirm HTTP 200 on smoke POST. Confirm ip_ledger_entries write attempted or skip logged. Then proceed to Block 3.

---

## BLOCK 3 — MnemosyneC v0.7.2 Installer Soft-Reminder

**Version bump**: Find the version constant in the MnemosyneC Electron main process. Bump to v0.7.2.

**Files to locate** (gadget first — do not assume path):
- Search for `version` constant or `app.getVersion()` usage in:
  ```
  C:\Users\Administrator\Documents\MnemosyneC\src\main\
  C:\Users\Administrator\Documents\MnemosyneC\package.json
  ```

**Soft-reminder logic** — on first app launch after install:

1. Read `lb_license_choice` from Electron's `localStorage` equivalent (or via `session.defaultSession.cookies` if member cookie is present).
2. If found: show a non-blocking banner at top of app UI:
   ```
   You chose [SSPL / Apache Tier 1 / Apache Tier 2] at download. Continuing with that license.  [Change?]
   ```
3. If NOT found (user did not go through download-page modal — downloaded via direct link or old path):
   - Show a blocking one-time prompt:
     ```
     Before you continue, please confirm your license choice.
     [SSPL + Pledge #2260]   [Apache 2.0 + Commercial]
     ```
   - Same two-panel explainer + checkboxes as the web modal
   - POST to the same edge function with `source: 'installer'`
4. "Change?" link: opens the same two-panel modal — allowed until:
   - Apache: cooperative meeting is confirmed (status = 'meeting-complete')
   - SSPL: first production use (Bishop discretion — no hard lock in v0.7.2)

**Member email resolution**: on first launch, if member is logged in (email in app session), POST to edge function includes `email` — server resolves `member_id` and writes `ip_ledger_entries`.

**version_trust.json update**: bump version to `0.7.2` in `version_trust.json` (canonical Hugo Tower data source per BP090 canon). Do NOT update `version.json` — it is stale and unused.

**MIC BLOCK 3 CLOSE**: Confirm version bumped to v0.7.2 in both `package.json` and `version_trust.json`. Confirm soft-reminder added to first-run wizard. Confirm blocking fallback for users who skipped web modal. Then proceed to Block 4.

---

## BLOCK 4 — Smoke + Deploy

### 4a — Firebase Hosting rewrite

Add rewrite to `firebase.json` so `/api/v1/license-choice` routes to the Supabase edge function:

```json
{
  "source": "/api/v1/license-choice",
  "function": "license-acceptance"
}
```

Or if using Supabase direct URL: add rewrite to the Supabase project URL. Gadget existing `firebase.json` rewrites first — do not overwrite existing entries.

### 4b — Hugo build + Firebase deploy (mnemosynec.org)

```bash
# From Hugo site root for mnemosynec.org
hugo --minify
firebase deploy --only hosting:mnemosynec
```

Verify: `curl -I https://mnemosynec.org/download/` returns HTTP 200.

### 4c — Edge function deploy (already done in Block 2 — verify still live)

```bash
supabase functions deploy license-acceptance
```

Confirm HTTP 200 on GET probe or health check.

### 4d — MnemosyneC v0.7.2 dist:win

```bash
npm run dist:win
```

Confirm output `.exe` exists. Upload to Firebase Storage at canonical path. Update `version_trust.json` download URL if path changed.

### 4e — Smoke test checklist

- [ ] `https://mnemosynec.org/download/` loads, HTTP 200
- [ ] Click download button: file download begins AND license modal appears simultaneously
- [ ] Modal cannot be dismissed without choosing a license (no X, Escape blocked)
- [ ] SSPL path: both checkboxes required before Confirm enables
- [ ] Apache path: Tier selection required, then both checkboxes before Confirm enables
- [ ] On Confirm: `lb_license_choice` key appears in localStorage
- [ ] On Confirm: POST to `/api/v1/license-choice` returns HTTP 200
- [ ] `license_acceptances` table has the new row in Supabase
- [ ] v0.7.2 installer: soft-reminder banner appears on first launch after prior web-modal choice
- [ ] v0.7.2 installer: blocking fallback appears for users with no prior choice in localStorage

**MIC BLOCK 4 CLOSE**: Report each smoke test predicate as PASS or FAIL. If any FAIL: fix before reporting complete. Do not report complete with open failures. Return Yoke to Bishop.

---

## Open Questions — Founder Ratify Before Knight Fires

**OQ-1**: Button colors — amber (`#f59e0b`) matching alpha banner is Bishop default. Confirm Y or specify [other color].

**OQ-2**: Apache activation flow — Bishop default is self-serve initial signup that creates `status = 'pending-cooperative-meeting'`, no phone/email contact required to START the download. Confirm Y or specify [other: e.g., require phone contact before download proceeds].

**OQ-3**: Non-member registration timing — Bishop default is track anonymously at download (session_id only), prompt to register inside the app at first launch (not inside the download modal). Confirm Y or specify [other].

**Resolve OQs before firing Knight. Paste resolved answers into KNIGHT_LICENSE_ACCEPTANCE_PASTE_BP092.md.**

---

## Sequencing Note — BLACK MAMBA Coordination

This dispatch composes with BLACK MAMBA. Bishop recommends Founder fires this dispatch ONLY after BLACK MAMBA P1-P3 are complete. Reason: BLACK MAMBA likely touches Hugo layouts and Firebase deploy pipeline — parallel Knight sessions on overlapping files risk merge conflicts in `_index.md` and `firebase.json`. Fire sequentially, not in parallel.

If Founder decides to fire in parallel anyway: scope-isolate by ensuring this Knight works ONLY on:
- `layouts/partials/license-choice-modal.html` (new file — no conflict)
- `content-mnemosynec/download/_index.md` (partial call addition only — minimal conflict surface)
- `platform/supabase/functions/license-acceptance/` (new function — no conflict)
- `platform/supabase/migrations/20260623000001_*` (new file — no conflict)
- `MnemosyneC/src/main/` soft-reminder (scoped to first-run wizard only)

Branch isolation required if parallel: create branch `bp092-license-gate` before Knight starts.
