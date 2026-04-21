# Knight Session K414 — Live System Verification (Pre-Opening Gambit)

**Author:** Bishop B101
**Date:** April 12, 2026
**Priority:** HIGH — blocks Opening Gambit launch
**Depends on:** K411 (Helm Schedule), K412 (Glass Door), K413 (Canonical Reconciliation) all deployed B100

---

## Mission

Hit the live site and verify every system deployed in the B100 bundle. This is the pre-launch checklist before the Opening Gambit fires. Report PASS/FAIL for each item. Fix anything that fails.

---

## Test Matrix

### 1. Canonical Numbers (K413)
- [ ] Visit any page showing canonical stats
- [ ] Verify innovation count shows **2,262**
- [ ] Verify Crown Jewel count shows **221**
- [ ] Check `useCanonicalStats.ts` defaults match YAML (2262/221/2405/35)
- [ ] Verify `canonical_values.yaml` shows patent_provisionals_filed: **13**

### 2. Glass Door System (K412)
- [ ] Navigate to `/outreach` route — page renders
- [ ] Verify 95 letters appear in the outreach list
- [ ] Click into a letter detail page (`/outreach/:slug`) — renders correctly
- [ ] Vote panel displays (even if voting is gated)
- [ ] `outreach_letters` table has 95 rows
- [ ] `outreach_letter_votes` table exists and is queryable
- [ ] `outreach_letter_responses` table exists
- [ ] `outreach_letter_retractions` table exists
- [ ] TouchStone predicate #8 (`letter_dispatch_authorized`) is registered
- [ ] `dispatch-outreach-letter` edge function deploys and responds
- [ ] `cast-outreach-letter-vote` edge function deploys and responds
- [ ] `outreach-dispatch-cron` edge function exists

### 3. Helm Schedule System (K411)
- [ ] Navigate to Helm page — HelmScheduleCard renders
- [ ] `helm_tasks` table has correct schema (16 columns)
- [ ] `helm_task_dispatch_log` table exists
- [ ] `dispatch-helm-task` edge function responds
- [ ] `helm-task-dispatcher` edge function responds
- [ ] pg_cron job is registered and firing (check `cron.job` table)
- [ ] Create a test helm task, verify it appears in the card
- [ ] Verify hemispheric validation works (rejects invalid hemisphere values)

### 4. Battery Dispatch System (K160/K285/K288/K360)
- [ ] `battery_dispatch` table exists and has content
- [ ] `battery_dispatch_access` gating table exists
- [ ] Access gating trigger is functional
- [ ] Battery Dispatch UI page renders
- [ ] Verify dispatch sequence is loaded (Day 1 through Day 15+)

### 5. Letter Dispatch Pipeline
- [ ] `letter_dispatch_queue` table — verify 92+ rows
- [ ] `letter_send_log` table exists
- [ ] `dispatch-letter` edge function responds
- [ ] `send-transactional-email` edge function responds
- [ ] `log-letter-response` edge function responds
- [ ] Crown letter delegation table exists

### 6. TouchStone System (K402)
- [ ] Run `touchstone_list` — verify manifest loads
- [ ] Run `touchstone_verify` on all deliverables — report pass/fail counts
- [ ] Verify ledger is append-only and contains recent events
- [ ] Check all 8 predicates are registered

### 7. Response Playbook (K409)
- [ ] `response_received_within` predicate (7th) is registered
- [ ] Response tracking tables exist
- [ ] K409 integration: Crown letter dispatch creates Helm follow-up task
- [ ] K409 integration: Response receipt auto-cancels follow-up task

### 8. Museum Subdomain
- [ ] `museum.lianabanyan.com` loads
- [ ] IslandCard tour links point to `https://lianabanyan.com/marketplace?tour=true` (not relative `/marketplace`)
- [ ] DeckCardActions shows full MascotAuthGate (not tiny lock icon)

### 9. Firebase Hosting (all 9 targets)
- [ ] main (lianabanyan.com) — loads
- [ ] dotcom — loads
- [ ] biz — loads
- [ ] org — loads
- [ ] net — loads
- [ ] the2ndsecond — loads
- [ ] hexisle — loads
- [ ] upekrithen — loads
- [ ] museum — loads

### 10. Core Platform Health
- [ ] Login/auth works
- [ ] Supabase connection healthy
- [ ] No console errors on key pages (Helm, Glass Door, Door1, Door2, Door3)
- [ ] Build passes (`npm run build` clean)

---

## Reporting

For each section, report:
```
## Section X — [Name]
Status: PASS / FAIL / PARTIAL
Items passed: X/Y
Issues found:
- [description of any failure]
- [fix applied or fix needed]
```

If anything FAILS, fix it in the same session if possible. If the fix requires a migration or edge function change, report what's needed and Bishop will assess priority.

---

## Post-Verification

Once all sections pass, update the session index with:
- Session: K414
- Summary: "Pre-Opening Gambit system verification. X/Y tests passed. [issues found/fixed]."
- Status: PASS or PARTIAL with details

**This is the last gate before the Opening Gambit fires. Everything must be green.**

---

*Bishop B101 · FOR THE KEEP.*
