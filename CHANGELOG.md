# MnemosyneC Changelog

## v0.6.1 · 2026-06-22 · BP092

### Ghost World UX Fix (BP092)
- MembershipGate.tsx now Ghost World compliant: "Maybe later" dismiss added, BP085-ratified copy applied
- Unauthenticated join flow: inline email capture (no /auth redirect) — anonymous Stripe checkout via `create-membership-checkout` edge function
- ProtectedRoute: already redirects to `/join` (not `/auth`) — confirmed pre-existing Ghost World fix
- Auth-gate audit CSV generated: AUTH_GATE_AUDIT_GHOST_WORLD_BP092.csv (B2 output)
- Platform .firebaseignore added: excludes non-web binary types (.obj/.backup) from deploy
- Firebase hash cache CRLF bug resolved: 150 locale files normalized to LF

### WS Transport Fix (BP092)
- M22 WS transport fix: Node 20 RealtimeClient patched, Coop Mesh Activity panel restored
- v0.6.1 installer shipped to mnemosynec.org/download/ (540009782 bytes, SHA256 4a1253e4)
- latest.yml updated on CDN: version 0.6.1

## v0.5.14 · 2026-06-20 · BP087 P0 EMERGENCY
**Fixes white-screen on install (v0.5.13 regression)**
- src/renderer/lib/supabase.ts now lazy-initializes the Supabase client via a Proxy pattern. The previous module-load-time createClient() call threw "Node.js 20 no native WebSocket" in the Electron renderer, crashing the static import chain through CompaniesJoiningInTab + PreferenceInferencePanel + MnemosyneTabView + App.tsx + main.tsx -- React root never mounted -- blank white window.
- Added .env at repo root with VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (gitignored -- sourced from resources/supabase_public.env). vite.renderer.config.ts envDir extended to read repo-root .env.
- No functional changes to Wave 3 + Wave 4 features (TrialFirePanel -- MultiSegGemmaPanel -- CompaniesJoiningInTab -- PreferenceInferencePanel -- Keys & Engines -- BrainSwapSelector -- all preserved as wired).
- Detected and patched per §15 Bishop-Direct-Supabase BLOOD -- Founder NOT asked to fix renderer code.

## [0.5.13] - 2026-06-20 / Heartbeat version propagation: presencePayload now carries capabilities.version for homogeneity-gated health_snapshot and auto-update targeting.

## v0.5.12 · 2026-06-19 · BP087 (MAMBA release)

**BLACK MAMBA wiring — Plow-on-mesh · Hex wire format · Domain-affinity routing · Substrate primitives · Star Chamber escalation**

- MAMBA-α: `mesh_plow_dispatcher.ts` — dispatch MMLU-Pro questions to mesh peers via wan-relay-route; Ascending Andon fires on confidence variance > threshold; per-question hex-mcode frame encoding; δ6 byte-size receipt logging. `tools/plow/run-plow-on-mesh.mjs` CLI entry point.
- MAMBA-δ4: `wan-relay-route` now accepts `application/x-hex-mcode` Content-Type in addition to legacy JSON; `wire_format` field added to relay_routes row (migration 20260619120001). Bi-directional: peer replies decoded as hex-mcode frames with JSON fallback (δ5).
- MAMBA-β1: `mic-broadcast` extended with `pheromone_sync` and `eblet_sync` broadcast types. `pheromone_signals` table migration (20260619120002) — mesh-shared salience weights broadcast from M0 to peers.
- MAMBA-β4/γ: `wrasse_quartermaster.ts` — domain-affinity pool selection: 0.7 × affinity + 0.3 × capacity composite score; `peer_domain_affinity` table migration (20260619120000); updated after each question verdict.
- MAMBA-β7: `peer_eblet_sync_manifest` table migration (20260619120004) — per-peer domain-selective eblet sync tracking.
- MAMBA-γ: `validate-relay.mjs` — `--routing=domain-affinity`, `--andon-escalate`, `--wire`, `--plow`, `--andon-threshold` flags; domain-affinity peer sort; affinity update after each verdict.
- MAMBA-ε: `star-chamber-analyze` — new `mode: "mesh_benchmark_verify"` path: Ascending Andon escalation triggers 4-judge verification on uncertain questions; H = Variance / 100 threshold; 3 honest falsification criteria pre-recorded per fire; `star_chamber_mesh_fires` table migration (20260619120003).
- β3 DRIFT: Ed25519 Thorax auth structural hook added (field in capabilities); full PKI deferred (post-THUNDERCLAP key provisioning pass).
- MAMBA-ζ HELD: THUNDERCLAP fire gates on fleet readiness per dispatch spec.

## v0.5.12 · 2026-06-19 · BP087
**env_loader strips inline `#` comments — fixes bundled anon key polluted with `# gitleaks:allow` trailing comment**

- Root cause: `env_loader.ts` loaded `SUPABASE_ANON_KEY` as `eyJ…ngk  # gitleaks:allow` — the trailing gitleaks suppression comment was included in `process.env`, causing Supabase REST to return 401 on every `fleet_broadcast` poll.
- Fix: standard dotenv parser behavior — unquoted values now strip inline `#` comments; quoted values preserve `#` verbatim. (BP087 I11 · empirically gadget-verified on M0)
- Build-time invariant `assert-supabase-anon-key.mjs` (v0.5.11) continues to guard the source `eyJ` prefix and carries forward.

## v0.5.2 · 2026-06-18 · BP085
**In-App Membership Purchase — Become a Member from inside MnemosyneC**

### New Features
- **"Become a Member · $5/yr" button** visible in the top-bar (TabBar) on every screen for non-members
- **Help tab membership CTA** — full section with description, button, and member status confirmation
- **Onboarding nudge** — "Maybe later" advances always; never blocks the onboarding flow
- **`membership:open-checkout` IPC** — opens `https://lianabanyan.com/join?source=mnemosynec-app&user_id=<peer_id>`
- **`mnemosynec://` protocol registered** — handles `mnemosynec://membership-active?member_id=...&token=...` return
- **One-time token validation** — server-side via `membership-callback-mnemosynec` Edge Function
- **`membership_activation_tokens` table** — token hash-only storage, 15-min expiry, one-time consumption
- **Local persistence** — `userData/member_status.json` written on activation; read at startup

### Security
- Token value is NEVER logged (BP085 BLOOD)
- Only SHA-256 hash stored in database
- `/validate` returns `{ valid: false }` on second call (consumed_at enforced)

## v0.5.1 · 2026-06-17 · BP085
- Pipeline tab (Founder↔Son peer copy/paste + screenshot pipeline)
- Help Tab expanded with community connections

## v0.5.0 · 2026-06-15 · BP083–BP084
- The Diagnosis tab (federated human-salt queries)
- Battery Publish tab
- v0.4.x — Pinch Seasoning, Salt Tiers, Glow
