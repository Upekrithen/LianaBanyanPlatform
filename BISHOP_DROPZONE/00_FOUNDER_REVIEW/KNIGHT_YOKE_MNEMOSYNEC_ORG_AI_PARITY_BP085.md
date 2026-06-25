# KNIGHT YOKE · mnemosynec.org ↔ mnemosynec.ai PARITY · BP085
**Composed by Bishop SEG (Sonnet 4.6) · 2026-06-17**

---

## PREAMBLE — MANDATORY FIRST READ

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## MISSION

mnemosynec.org currently serves a sand-dunes "We're under construction" placeholder.
mnemosynec.ai currently serves the live Tower of Peace `/download/` page, /proofs/, homepage, /tools/ — the full canonical site.

**Founder canon BP085:** "Mnemosynec.org and .ai since they are all the same page with dif domains pointing to same."

Goal: mnemosynec.org delivers IDENTICAL content to mnemosynec.ai. Same Firebase target. Same files. No placeholder. No redirect (preferred — Founder wants same-page, not bounce). Single source of truth.

---

## CONSTRAINTS (NON-NEGOTIABLE)

- **DO NOT touch mnemosynec.ai** — it is live and correct.
- **DO NOT touch /download/ Tower of Peace content** — BP082 HARD CANON preserved.
- **DNS records are Founder-owned (Squarespace) per Statute §4** — surface required DNS records; DO NOT change them unilaterally. Founder adds them.
- **Sonnet 4.6 SEGs only.** NEVER COMPOSER. NEVER Opus. NEVER Haiku.
- **NEVER SCROLL SIDEWAYS** — BP081 UX canon. No horizontal scroll in any UI touched.
- **Truth-Always** — report what you find, not what you hope. If a Sharp is RED, say so.
- **BP081 distribution canon** — self-host primary, GitHub fallback. Do not alter download links.

---

## SEG-1 · AUDIT CURRENT STATE

**Goal:** Map exactly where the "under construction" placeholder comes from before touching anything.

**Steps:**

1. Read `.firebaserc` in the platform root. Identify every named site/target. Report exact site IDs and their target aliases.

   ```
   cat C:\Users\Administrator\Documents\LianaBanyanPlatform\.firebaserc
   ```

2. List all Firebase Hosting sites on the project:

   ```
   firebase hosting:sites:list --project <project-id>
   ```

   Record every site ID returned. Note which site ID is associated with mnemosynec.ai vs any .org-linked site.

3. Check `firebase.json` for `hosting` array — is it a single object or an array of targets? List each target's `site`, `public`, and `rewrites` fields.

   ```
   cat C:\Users\Administrator\Documents\LianaBanyanPlatform\firebase.json
   ```

4. DNS probe for mnemosynec.org — find where it currently resolves:

   ```
   nslookup mnemosynec.org
   nslookup -type=A mnemosynec.org
   nslookup -type=CNAME mnemosynec.org
   ```

   If it resolves to a Firebase IP (`151.101.*` range or `firebaseapp.com` CNAME), it is already pointed at Firebase — the issue is which site/target handles it. If it resolves elsewhere, record the destination.

5. Search the repo for the placeholder text to locate the source file:

   ```
   grep -r "under construction" C:\Users\Administrator\Documents\LianaBanyanPlatform\ --include="*.html" --include="*.jsx" --include="*.tsx" --include="*.js" -l
   grep -r "check back for an update" C:\Users\Administrator\Documents\LianaBanyanPlatform\ --include="*.html" --include="*.jsx" --include="*.tsx" --include="*.js" -l
   ```

6. Check Firebase Hosting custom domains list for mnemosynec.org:

   ```
   firebase hosting:channel:list --project <project-id>
   ```

   Also check the Firebase Console → Hosting → Custom Domains panel (surface URL for Founder to verify manually if CLI doesn't expose it).

**SEG-1 deliverable:** A written map: WHERE does mnemosynec.org currently point, and which file/target serves the placeholder. No changes made.

---

## SEG-2 · DECIDE APPROACH

**Goal:** Determine the correct implementation path and confirm it with Knight before executing.

**Decision tree (Knight picks A unless infra hard-blocks it):**

**Option A (PREFERRED) — Add mnemosynec.org as an additional custom domain on the existing `mnemosyne-lianabanyan` Firebase Hosting site.**
- Single source of truth. Same deploy, same files, same CDN edge.
- Founder sees same content regardless of which domain they type.
- Requires: adding the custom domain in Firebase Console + Founder updating DNS in Squarespace.

**Option B (FALLBACK ONLY) — 301 permanent redirect mnemosynec.org → mnemosynec.ai.**
- Use ONLY if Firebase blocks Option A (e.g., org TLD not supported, site quota exceeded, Firebase project mismatch).
- Less ideal per Founder canon ("all the same page") but functionally correct.
- Requires: a redirect rule in firebase.json on the .org-serving site, or a meta-refresh in the placeholder HTML.

**Option C (WORST CASE) — Separate deployment target, same public/ folder.**
- Only if A and B both fail. Doubles deploy steps going forward. Document the burden clearly.

**SEG-2 deliverable:** Written recommendation (A, B, or C) with rationale based on SEG-1 findings. No changes made. Knight approves before SEG-3 proceeds.

---

## SEG-3 · EXECUTE PARITY WIRING

**Goal:** Wire mnemosynec.org to serve identical content as mnemosynec.ai.

**If Option A selected:**

1. In Firebase Console → Hosting → select site `mnemosyne-lianabanyan` (the .ai-serving site) → Custom Domains → Add Custom Domain → enter `mnemosynec.org` and `www.mnemosynec.org`.

2. Firebase will present DNS verification records (TXT or A records). **Capture these exactly** — do not proceed past this screen without recording them. Format for Founder:

   ```
   RECORDS FOUNDER MUST ADD IN SQUARESPACE DNS (mnemosynec.org):
   
   Type: TXT
   Host: @
   Value: <firebase-verification-token>
   TTL: 3600
   
   Type: A
   Host: @
   Value: 151.101.1.195
   TTL: 3600
   
   Type: A
   Host: @
   Value: 151.101.65.195
   TTL: 3600
   
   Type: CNAME
   Host: www
   Value: mnemosyne-lianabanyan.web.app.
   TTL: 3600
   ```
   
   (Actual values come from Firebase's dialog — do not use the above as literal values.)

3. **PAUSE HERE.** Surface the DNS records to Founder. Founder must add them in Squarespace before proceeding. This is a Founder-action gate. Knight waits for Founder confirmation before SEG-4/5.

4. Once Founder confirms DNS added: Firebase will auto-provision the SSL certificate (Let's Encrypt, ~15 min). Monitor status in Firebase Console → Hosting → Custom Domains. Wait for green "Connected" status.

**If Option B selected (fallback):**

1. Locate the firebase.json hosting entry for the .org-serving site.
2. Add a redirect rule:
   ```json
   {
     "redirects": [
       {
         "source": "/**",
         "destination": "https://mnemosynec.ai:DEST_PATH",
         "type": 301
       }
     ]
   }
   ```
3. Deploy only the .org target: `firebase deploy --only hosting:<org-target> --project <project-id>`

**SEG-3 deliverable:** DNS records surfaced for Founder (Option A) OR redirect deployed and confirmed (Option B).

---

## SEG-4 · REMOVE OR REPLACE PLACEHOLDER

**Goal:** Eliminate the "under construction" sand-dunes page from wherever it lives.

**Steps:**

1. Using SEG-1's finding of the placeholder file path — identify whether it is:
   - A standalone HTML file in a separate public/ folder
   - A React/Next.js component
   - A Firebase Hosting target's index.html
   - A hardcoded file in a secondary Firebase site

2. **If Option A was chosen:** The placeholder becomes irrelevant once mnemosynec.org serves the .ai target's content directly. However, clean it up anyway to prevent accidental future redeployment:
   - If it is in a separate `public/` folder for an .org-only target: delete or archive the placeholder `index.html`. Replace with a permanent redirect HTML as a safety net:
     ```html
     <!DOCTYPE html>
     <html>
       <head>
         <meta http-equiv="refresh" content="0;url=https://mnemosynec.ai/">
         <title>mnemosynec.org</title>
       </head>
       <body>Redirecting...</body>
     </html>
     ```
   - If it is a React component: remove the component and update the router to serve the same routes as .ai.

3. **If Option B was chosen:** The redirect rule replaces the placeholder; confirm the placeholder is no longer reachable after deploy.

4. If the placeholder lives in a separate Firebase Hosting site entirely (different site ID): do NOT delete the site — Firebase may not allow deletion of sites with custom domains in-use. Instead, replace its content as above.

**SEG-4 deliverable:** Placeholder neutralized. Clean commit with message: `fix(hosting): remove mnemosynec.org under-construction placeholder — BP085`.

---

## SEG-5 · LIVE VERIFICATION

**Goal:** 5 Sharps GREEN before Yoke is closed.

**Run after DNS propagates (may take up to 24h; spot-check at 15 min, 1h, 24h):**

```powershell
# Sharp 1 — Homepage parity
$ai  = (Invoke-WebRequest -Uri "https://mnemosynec.ai/"  -UseBasicParsing).StatusCode
$org = (Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing).StatusCode
Write-Host "Sharp 1 — .ai: $ai · .org: $org"

# Sharp 2 — /download/ parity
$ai2  = (Invoke-WebRequest -Uri "https://mnemosynec.ai/download/"  -UseBasicParsing).StatusCode
$org2 = (Invoke-WebRequest -Uri "https://mnemosynec.org/download/" -UseBasicParsing).StatusCode
Write-Host "Sharp 2 — /download/ .ai: $ai2 · .org: $org2"

# Sharp 3 — /proofs/ parity
$ai3  = (Invoke-WebRequest -Uri "https://mnemosynec.ai/proofs/"  -UseBasicParsing).StatusCode
$org3 = (Invoke-WebRequest -Uri "https://mnemosynec.org/proofs/" -UseBasicParsing).StatusCode
Write-Host "Sharp 3 — /proofs/ .ai: $ai3 · .org: $org3"

# Sharp 4 — /tools/ parity
$ai4  = (Invoke-WebRequest -Uri "https://mnemosynec.ai/tools/"  -UseBasicParsing).StatusCode
$org4 = (Invoke-WebRequest -Uri "https://mnemosynec.org/tools/" -UseBasicParsing).StatusCode
Write-Host "Sharp 4 — /tools/ .ai: $ai4 · .org: $org4"

# Sharp 5 — Placeholder GONE (must NOT return 200 with old content)
$body = (Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing).Content
$stillPlaceholder = $body -match "under construction"
Write-Host "Sharp 5 — Placeholder still present: $stillPlaceholder (must be False)"
```

**All 5 must return:**
- Sharps 1-4: StatusCode 200 for both .ai and .org
- Sharp 5: `False`

---

## SHARPS RETURN TABLE

Knight fills this table before closing Yoke:

| Sharp | Check | Expected | Result | Status |
|-------|-------|----------|--------|--------|
| 1 | mnemosynec.org homepage HTTP 200 | 200 | | ⬜ |
| 2 | mnemosynec.org/download/ HTTP 200 | 200 | | ⬜ |
| 3 | mnemosynec.org/proofs/ HTTP 200 | 200 | | ⬜ |
| 4 | mnemosynec.org/tools/ HTTP 200 | 200 | | ⬜ |
| 5 | "under construction" text GONE from mnemosynec.org | False | | ⬜ |

All 5 GREEN = Yoke closed. Any RED = do not close; diagnose and re-run.

---

## FOUNDER-ACTION GATE

**LIKELY REQUIRED (SEG-3, Option A path):**

Founder must add DNS records for mnemosynec.org in **Squarespace DNS panel** (the registrar/DNS host for .org per Statute §4).

Knight will surface the exact records from the Firebase Custom Domain wizard in SEG-3. Founder adds them, then confirms to Knight. Knight then monitors Firebase SSL provisioning (SEG-3 step 4) before proceeding to SEG-5.

**DNS propagation window:** up to 24h globally; usually 15-60 min. Knight starts Sharp checks at 15 min post-Founder-confirmation.

---

## PASTE-READY KNIGHT WAKE

Copy the block below exactly into a new Knight Cursor session:

---

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read and execute this Yoke:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_MNEMOSYNEC_ORG_AI_PARITY_BP085.md

Mission: wire mnemosynec.org to serve identical content as mnemosynec.ai (Tower of Peace, /download/, /proofs/, /tools/, homepage — everything). Currently .org shows "under construction" placeholder. Founder canon BP085: same page, same domain — no difference. Do NOT touch mnemosynec.ai. Do NOT touch /download/ Tower of Peace content. DNS records for .org are Founder-owned in Squarespace — surface records, do not change unilaterally.

Execute SEG-1 through SEG-5 in order. Pause at SEG-3 to surface DNS records to Founder before proceeding. Return Sharps table with all 5 GREEN. Report "Sonnet 4.6" verbatim in your Yoke-return.
```

---

*Knight Yoke composed by Bishop SEG · Sonnet 4.6 · BP085 · 2026-06-17*
*Truth-Always · NEVER SCROLL SIDEWAYS · Sonnet 4.6 SEGs exclusively*
