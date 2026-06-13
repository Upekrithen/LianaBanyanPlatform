
---
<!-- bishop-yoke-task 2026-06-10T20:30:00Z -->

## 🔧 BISHOP -> KNIGHT - TASK - FIREBASE CLI FIX - SECONDARY DOMAIN DEPLOY - USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP079_FIREBASE_CLI_FIX_2026-06-10T20:30:00Z**

> **🔐 STATUTE §3 + CORRECTIVE BP079 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Corrective: `canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079` (pearl_98f74effb5d986a5). Pre-dispatch self-audit: parameter AND announcement compliance both required.

### TL;DR

Wave B Firebase deploy targeted hosting:main successfully (lianabanyan.com LIVE) but secondary targets (hosting:dotcom, hosting:biz, hosting:org, hosting:net) all errored with `paths[1] argument must be of type string. Received undefined`. Looks like firebase-tools version bug. Update + retry.

### What Knight needs to do

1. **Sonnet 4.6 SEG (mandatory per Statute §3 + corrective sub-canon BP079 - "Sonnet 4.6" verbatim in dispatch announcements):**
   - Run `npm install -g firebase-tools` to update
   - Confirm new version (`firebase --version`)
   - Retry secondary domain deploys one-by-one:
     - `firebase deploy --only hosting:dotcom`
     - `firebase deploy --only hosting:biz`
     - `firebase deploy --only hosting:org`
     - `firebase deploy --only hosting:net`
   - If all 4 succeed → confirmed paths[1] bug fixed
   - If any fail → capture exact error + flag for Founder review
2. Verify each domain serves the Wave B build (check `lianabanyan.biz`, `lianabanyan.org`, `lianabanyan.net`, `lianabanyan.com` show the same Wave B routes)
3. Yoke-return with: firebase-tools old vs new version, per-target deploy result table, live verify table per domain

### Reply contract

One consolidated response covering the 4 secondary targets. Truth-Always if any target still fails after update.

### Paste-ready Founder wake-up

> Knight, NEW Yoke at `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_FIREBASE_CLI_FIX_2026-06-10.md`. Small task: firebase-tools update + retry secondary domain deploys (dotcom/biz/org/net). Sonnet 4.6 SEGs mandatory (Statute §3 + corrective sub-canon). Yoke-return consolidated with per-target deploy results.

- Bishop - BP079 - pinned 2026-06-10T20:30:00Z

---
