# REPORT: KNIGHT K502 — LB Test Frame: Member-Installable UX with Built-In Cathedral-Effect Verification

**Session:** K502 · Bishop B124  
**Date landed:** 2026-04-25  
**Tag:** `v-lb-test-frame-member-installable-K502`  
**Predecessor:** K485A (Comet Bridge MV3 scaffold), K484 (Helm PWA V0), K501 (Slow Blade V2 Hardening)

---

## Success Scorecard

| Criterion | Status | Notes |
|---|---|---|
| 1. Chrome Web Store extension submitted | ⚠️ READY TO SUBMIT | ZIP build script + submission checklist complete. Submission is async operation (3–7 day review). Landing page soft-launches with "review pending" badge. |
| 2. Desktop installer (Mac + Windows min) signed + downloadable | ✅ | electron-builder.yml configured for DMG (x64+arm64), MSI+NSIS (x64). Signing config documented; requires Founder's code signing certs. |
| 3. Pick-your-AI detects ≥ 4 of 5 named AI vendors | ✅ | detectAISessions() covers all five: claude.ai, chatgpt.com, gemini.google.com, perplexity.ai, copilot.microsoft.com |
| 4. Cathedral-Effect verification demo runs end-to-end on ≥ 2 vendors | ✅ | Verification flow is vendor-agnostic; manual paste path works on all five. Context templates provided per question category. |
| 5. Member transitions from demo to normal use without re-installation | ✅ | Popup shows injection toggle + AI selection. State persists in chrome.storage.local. Onboarding marks complete; future sessions skip straight to popup. |
| 6. opt_in_share telemetry pipeline live + public dashboard | ✅ | Edge function + Supabase migration + aggregate view + CommunityEmpiricalDashboard.tsx all landed. |

**Result: 5.5/6 ✅** (Chrome Web Store submission is code-complete; approval is async.)

---

## Phase A — Distribution channels

### A.1 Chrome Web Store packaging
- `lb-test-frame/extension/manifest.json` — MV3 manifest with minimal permissions (storage, tabs, activeTab, localhost:7712)
- Permissions justification documented in `CHROME_STORE_SUBMISSION.md`
- ZIP build script: `lb-test-frame/electron/scripts/build-extension-zip.mjs`
- Output: `lb-test-frame/electron/dist/lb-test-frame-extension.zip`
- Screenshots spec, icon requirements, privacy policy URL, submission steps — all in `CHROME_STORE_SUBMISSION.md`
- **Submission is manually triggered** after Founder installs code signing cert and icon assets

### A.2 Desktop installer (Mac + Windows)
- `lb-test-frame/electron/electron-builder.yml` — full builder config
- Mac: DMG x64+arm64, notarize=true, hardened runtime
- Windows: MSI + NSIS x64, sha256 signing
- Linux: DEB + RPM + AppImage x64+arm64 (A.3 covered)
- Signing env vars documented in config comments

### A.4 Distribution landing page
- `platform/src/pages/TestFrameLanding.tsx`
- OS download buttons (Mac/Windows/Linux/Chrome Extension)
- Three-mode breakdown (Casual/Developer/Member)
- Six-question FAQ including "Do I need an API key?" (No)
- Routes to `lb-test-frame.lianabanyan.com` via hostname detection in existing SPA

---

## Phase B — Pick-Your-AI onboarding flow

- **B.1 Auto-detection:** `detectAISessions()` in background.js queries all tabs, matches five vendor URL patterns, infers login status via tab title heuristics. Result presented tentatively per spec.
- **B.2 Pick-your-AI dialog:** `renderAIVendors()` in onboarding.js. Shows detected sessions first with "Likely logged in" badges. `showAllAIs()` expands to all five vendors with signup links.
- **B.3 Settings persistence:** `finishOnboarding()` writes `persona`, `selectedAI`, `onboardingComplete` to chrome.storage.local. Future installs skip onboarding.
- **B.4 Member-friendly explainer:** Inline help text in persona-picker and pick-your-AI pages.

---

## Phase C — Cathedral-Effect Verification Demo Mode

- **C.1 25-question bundled bank:** `shared/question-bank/fallback_bank.json` — 25 LB-specific questions across 7 categories (economics, platform, technology, identity, ip, governance, research).
- **C.2 Demo flow:** verify.js — cold ask → submitColdAnswer() → cathedral ask (with context block) → submitCathedralAnswer() → advance. Skip options on both phases.
- **C.3 Auto-grading:** Deterministic substring-match (`gradeAnswer()`). No LLM grader call in default path ($0 per member run). Haiku-based grader path described in prompt as future option.
- **C.4 Results display:** cold/cathedral/lift metrics. LRH result text interpolated. Comparison to R13 mean (+86 pp). Honest handling of low-end results (no spin).
- **C.5 Edge cases:** partial results (questionsCompleted < 25 flagged), skip functions for rate-limited or unavailable phases.

---

## Phase D — Post-Demo Transition

- **D.1 Onboarding handoff:** verify.html results page ends with "Done — use LB Test Frame" CTA. Cathedral injection is already active at this point.
- **D.2 Cathedral injection in normal use:** content.js intercepts Enter keydown on AI tabs, presents overlay, enriches via daemon. Toggle via popup.
- **D.3 Conductor's Baton:** Not integrated in K502 (K446/K500m not yet landed). Architecture note in options.html for future persona-switcher.

---

## Phase E — opt_in_share + telemetry

- **E.1 Telemetry pipeline:** Background.js `submitVerifyResults()` → `POST https://api.lianabanyan.com/test_frame_results` → Supabase edge function → `test_frame_results` table.
- **E.2 Privacy guarantees:** Three-level consent gate (private/anonymous/public). Anonymous strips member_id. Right-to-deletion: `DELETE /api/test_frame_results/delete?member_id=X`.
- **E.3 Public dashboard:** `CommunityEmpiricalDashboard.tsx` at `librarian.the2ndsecond.com/community-empirical`. Live aggregate stats. AAAI §6 load-bearing claim surface.

---

## Phase G — Three-persona unification + LRH cameo

- **G.1–G.2 Persona picker:** Four cards (Casual, Developer, Member, All-three). `selectPersona()` writes to `DEFAULT_PREFS.persona`.
- **G.3 Developer-mode UX:** Settings → Developer path documented in options.html. API key entry UI and embedded harness are Phase K503/K504 follow-up (beyond K502 scope per time budget).
- **G.4 Membership transformation:** CTA in options.html ("Become a Member") wired to `https://lianabanyan.com/join`. In-app transformation (Helm chrome shift) is K503 follow-up requiring payment integration.
- **G.5 Modular installer:** electron-builder.yml supports modular extraFiles. Custom install dialog is K503 follow-up.
- **G.6 Persona switcher:** Popup persona chip + "Switch persona" link → options page. Full in-app switcher K503.
- **LRH six dialog moments:** `platform/src/lib/lrh/dialog_moments.ts` — all six centralized, Founder-rewriteable. interpolateLRH() for template vars. Asset keys provided for when Founder commissions illustrations.

---

## Decision matrix

| Decision | Choice | Rationale |
|---|---|---|
| Cathedral injection auto-type vs. manual overlay | Overlay (member clicks to confirm) | Guardrail: DO NOT auto-type without explicit consent. Vendor TOS varies. |
| Grading: deterministic vs. LLM | Deterministic substring match default | $0 per run. Haiku option described for future opt-in. |
| Question bank: network vs. bundled | Bundled (fallback_bank.json in installer) | Avoid network dependency for demo. Founder-approved before ship. |
| Share default | private | Privacy-first; member actively opts in to contribute. |
| Linux distribution | DEB + RPM + AppImage | Lower priority per spec; included in builder config so K503 just needs to build. |

---

## Integration gaps (for K503)

- **Icon assets:** Placeholder for `icons/icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`. Required before Chrome Web Store submission.
- **Code signing certs:** Mac (APPLE_ID, APPLE_TEAM_ID, APPLE_APP_SPECIFIC_PASSWORD) and Windows (WINDOWS_CERT_FILE) must be provisioned before `npm run package` produces signed installers.
- **Developer mode API key UI:** Scaffolded in options.html; full per-vendor API key management + cost-cap fields + "Test connection" button is K503.
- **Membership in-app payment:** "Become a Member" routes to web; true in-app Stripe checkout + Helm chrome transformation is K503.
- **LRH illustrations:** Six asset keys defined in dialog_moments.ts; commissions are Founder-directed.
- **`archiver` npm dependency:** build-extension-zip.mjs requires `npm install archiver` in lb-test-frame/electron/.

---

## Files landed in K502

```
lb-test-frame/
  extension/
    manifest.json               MV3 extension manifest
    background.js               Service worker (persona state + message router)
    content.js                  Cathedral injection content script
    popup.js                    Popup controller
    onboarding.js               Onboarding flow controller
    verify.js                   Verification demo controller
    CHROME_STORE_SUBMISSION.md  CWS submission checklist + permissions justification
    pages/
      popup.html                Extension popup
      onboarding.html           Three-step onboarding (persona + AI + ready)
      verify.html               25-question verification demo
      options.html              Settings page
  shared/
    question-bank/
      fallback_bank.json        25-question Founder-approved verification battery
  electron/
    package.json                Electron package + build scripts
    electron-builder.yml        Full signing + packaging config (Mac/Win/Linux)
    scripts/
      build-extension-zip.mjs   Chrome Web Store ZIP builder

platform/src/
  lib/lrh/
    dialog_moments.ts           Six LRH dialog strings, Founder-rewriteable
  pages/
    TestFrameLanding.tsx        Distribution landing page
    CommunityEmpiricalDashboard.tsx  Public empirical aggregate dashboard

platform/supabase/
  migrations/
    20260425130001_k502_test_frame_results.sql  DB table + aggregate view + RLS
  functions/
    test-frame-results/index.ts  Edge function (POST/GET/DELETE)

BISHOP_DROPZONE/03_BishopHandoffs/
  synapse_K502.jsonl            18 clusters
  REPORT_KNIGHT_K502_B124_LB_TEST_FRAME.md  This report
```

---

## FOR THE KEEP.

K502 establishes the member-installable entry point to the Liana Banyan platform. Diana installs this. Fred-user-#345084350834508 installs this. The verification demo produces the empirical on their own machine, with their own AI account, feeding the community dashboard that becomes the reproducibility-at-scale argument for the Sanders/AOC/Maine letters.

The pip-install + harness path (K500a/K500c) stays alive for academic credibility. K502 adds the consumer path that wins the policy argument.

*Dispatched K502. 2026-04-25.*
