Sonnet 4.6

YOKE: KNIGHT_YOKE_MESH_SIGNUP_THRESHOLD_TRACKER_BP085
STATUS: COMPLETE

SEG-1: RECON (pre-complete) — all 3 layers net-new build required
SEG-2: Tracker shortcode written at layouts/shortcodes/mesh-tracker.html · supabaseUrl param added to config-mnemosynec.toml · mode param supports milestones/realtime/realtime_above_100
SEG-3: mesh_signups table created (verified via DB query) · mesh-test-signup Edge Function deployed (no-verify-jwt) · config.toml entry added
SEG-4: 3 placement targets built and deployed:
  - /mesh-test-signup/ page (content-mnemosynec/mesh-test-signup/_index.md + layouts/mesh-test-signup/list.html)
  - /proofs/ footer ({{< mesh-tracker mode="milestones" >}} + link appended to proofs/_index.md)
  - cerostechnology Bounty Wall (CT tracker card injected in ceros-public/index.html — anon key injected safely, no terminal echo)
SEG-5: All deploys 0 errors · smoke test 201 · DB row confirmed (id: 359c1bc3, source_door: ai_dev, verified: true) · cleanup complete

5 SHARPS:
| # | Sharp | Status |
|---|-------|--------|
| 1 | Signup endpoint POST 201 + DB row confirmed | GREEN |
| 2 | Tracker page 200 + milestone message renders | GREEN |
| 3 | Tier thresholds correct in deployed JS ("Going for 30" found) | GREEN |
| 4 | No horizontal scroll on all 3 placements (overflow-x:hidden; no scroll/auto) | GREEN |
| 5 | All Firebase + Supabase deploys 0 errors | GREEN |

tracker_mode default: milestones (realtime/realtime_above_100 toggle preserved as Chassis Rule)
1,000-signup threshold: CANON (unchanged)

DEPLOY RECEIPTS:
- mnemosynec.ai: Firebase hosting:mnemosyne · 227 files · 0 errors
- cerostechnology.com: Firebase hosting:cerostechnology · 1 file · 0 errors
- mesh-test-signup Edge Function: Supabase project ruuxzilgmuwddcofqecc · deployed · no-verify-jwt
- mesh_signups DB table: created + verified via SELECT from information_schema

FILES WRITTEN / MODIFIED:
  NEW: Cephas/cephas-hugo/layouts/shortcodes/mesh-tracker.html
  NEW: Cephas/cephas-hugo/layouts/mesh-test-signup/list.html
  NEW: Cephas/cephas-hugo/content-mnemosynec/mesh-test-signup/_index.md
  NEW: platform/supabase/migrations/20260618000003_mesh_signups.sql
  NEW: platform/supabase/functions/mesh-test-signup/index.ts
  MOD: Cephas/cephas-hugo/config-mnemosynec.toml (supabaseUrl param added)
  MOD: Cephas/cephas-hugo/content-mnemosynec/proofs/_index.md (mesh-tracker shortcode appended)
  MOD: platform/ceros-public/index.html (CT tracker card injected in Bounty Wall)
  MOD: platform/supabase/config.toml (mesh-test-signup function entry added)

MILESTONE WORDING: Founder-ratified wording shipped exactly as written in Yoke spec.
SECRETS HYGIENE: §14+§15+§16 BLOOD — anon key written directly to files; never echoed to terminal.
