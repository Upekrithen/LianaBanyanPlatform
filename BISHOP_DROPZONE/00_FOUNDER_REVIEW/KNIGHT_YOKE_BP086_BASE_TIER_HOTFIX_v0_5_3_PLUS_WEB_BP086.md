# KNIGHT YOKE — Base-Tier Mesh Connection (v0.5.3) + Web Hero Hotfix

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Bishop (Sonnet 4.6 SEG)
**Founder direct:** *"We give them the same Generic Connection Membership which doesn't allow personalization beyond the packages and chocolates that are included as the BASE level."*

**Knight preamble (BP084 HARD BINDING):** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14+§15+§16 BLOOD · §4 secrets BLOOD.

---

## Why now

THUNDERCLAP A3 Wake Fleet is gated on `peer_presence` having ≥ 2 active rows. All 4 Founder machines launched v0.5.2 Pipeline tab BUT got "Realtime connection failed — Disconnected." Root cause: peer registration / Realtime channel requires membership JWT. None of the 4 machines are members.

Founder-direct architectural decision (canon BP086): tier the mesh, don't gate it. Non-members register as `tier='base'` (Generic Connection Membership, free, full substrate read + mesh participation, no personalization). Members register as `tier='member'` (everything + personalization). Both tiers count toward THUNDERCLAP quorum.

Canon source: `canon_generic_connection_membership_base_tier_free_bp086.eblet.md`

---

## SEGs (parallel where disjoint)

### SEG-F1 · RECON — what gates non-member connection today

1. Read `src/main/peer_registration.ts` (or equivalent — Glob for peer_presence INSERT path)
2. Read `src/main/realtime_channel.ts` (or equivalent — Glob for Realtime subscription)
3. Read the `wan-relay-publish` Edge Function (`platform/supabase/functions/wan-relay-publish/index.ts`) — confirm whether it requires JWT for INSERT, or accepts anon
4. Read `peer_presence` table RLS policies via psql safe subshell:
   ```
   (eval "$(grep -E '^SUPABASE_DB_URL=' /c/Users/Administrator/.claude/state/secrets/22May2026.env)"; psql "$SUPABASE_DB_URL" -c "SELECT polname, polcmd, polqual FROM pg_policies WHERE tablename='peer_presence';")
   ```
5. Report: what RLS policy blocks anon, whether Edge Function checks membership, whether Realtime channel requires JWT, whether the table has a `tier` column already

### SEG-F2 · MIGRATION — `peer_presence.tier` column + RLS

Compose `supabase/migrations/20260618000004_peer_presence_tier_column.sql`:

```sql
-- Add tier column with default 'base'
ALTER TABLE peer_presence
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'base'
  CHECK (tier IN ('base', 'member'));

CREATE INDEX IF NOT EXISTS idx_peer_presence_tier ON peer_presence(tier);

-- RLS: anon can INSERT/SELECT/UPDATE own row at tier='base'
-- Members provide JWT and can upgrade their row to tier='member'

CREATE POLICY peer_presence_anon_insert_base ON peer_presence
  FOR INSERT TO anon
  WITH CHECK (tier = 'base');

CREATE POLICY peer_presence_anon_select ON peer_presence
  FOR SELECT TO anon
  USING (true);

CREATE POLICY peer_presence_anon_update_own ON peer_presence
  FOR UPDATE TO anon
  USING (peer_id = current_setting('request.jwt.claims', true)::json->>'peer_id'
         OR auth.role() = 'anon')
  WITH CHECK (tier = 'base');

-- Member tier requires authenticated JWT
CREATE POLICY peer_presence_member_upgrade ON peer_presence
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = email_hash OR true)
  WITH CHECK (tier IN ('base', 'member'));
```

Apply via BP084 autonomous psql safe-subshell pattern. Verify with information_schema query.

### SEG-F3 · Edge Function patch — accept anon INSERT

Patch `platform/supabase/functions/wan-relay-publish/index.ts`:
- Accept POST without Authorization header → register as `tier='base'`
- Accept POST with Authorization header → validate JWT → register as `tier='member'`
- Both paths INSERT into `peer_presence` with appropriate tier
- Return 201 + `{tier, peer_id, last_seen_at}` for client to display tier indicator

Deploy via `npx supabase functions deploy wan-relay-publish --project-ref ruuxzilgmuwddcofqecc --no-verify-jwt` (keep JWT-off, function handles its own tier logic).

### SEG-F4 · Desktop app v0.5.3 — tier-aware connection + UI

1. Locate peer-registration code in MnemosyneC desktop. Patch:
   - On launch: check for cached membership token
   - If none: POST anon to `wan-relay-publish` → receive `tier='base'`
   - If cached token: POST with Bearer → receive `tier='member'`
2. Realtime channel: subscribe with anon Supabase publishable key (Realtime supports anon channels for public payloads). Member tier subscribes with authenticated client.
3. UI changes (`src/renderer/components/PipelineTab.tsx` or equivalent):
   - Replace "Disconnected" with "Connected · Base" (green dot) or "Connected · Member" (gold dot) once successfully registered
   - Replace `"Realtime connection failed — messages may be delayed"` → `"Realtime reconnecting · messages may be delayed"` (em-dash → middot, no AI giveaway)
   - Sweep the entire desktop codebase for `" — "` patterns in user-facing strings — replace with `" · "` or `": "` per context. AI giveaway sweep.
4. Bump `package.json` version `0.5.2` → `0.5.3`
5. `npm run build:renderer && npm run build:main && npm run dist:win`
6. Ship to `mnemosynec.ai/download/MnemosyneC-Setup-0.5.3.exe` + update `latest.yml`
7. Auto-update advertises v0.5.3 to all 4 Founder machines + any public installs

### SEG-F5 · Web hero hotfix (mnemosynec.ai homepage)

1. Open `Cephas/cephas-hugo/layouts/partials/mnemosynec-homepage.html`
2. Find the THREE "Join · $5/yr" instances (top nav + twice in hero card)
3. Keep: top nav "Become a Member · $5/yr" AND first hero CTA (above the Dr. M pic, the primary CTA)
4. Replace: the hero CTA UNDER Dr. M's pic
   - Replace with: a `<form>` containing
     - Heading: `<h4>Share This</h4>`
     - Input placeholder: `Enter Email to Share To`
     - Behavior: placeholder stays until user types; when user types `@`, treat as email field (HTML5 `type="email"`)
     - Caption below input: `(Sends from Dr. Mnemosynec)` — small muted text
     - Submit button: `Share →`
   - On submit: POST to a new Edge Function `share-from-mnemosynec` (Knight composes; sends an email from `DrM@mnemosynec.org` to recipient with intro + link to mnemosynec.ai)
5. Remove the broken GitHub link (the one that 404s on visitor machines). E3 verdict confirmed `github.com/liana-banyan/lb-reproducibility-pack` is private — public link should be removed or replaced with the public-mirror that will exist once Founder authorizes.
6. Em-dash AI-giveaway sweep across the homepage: any `" — "` in user-facing copy that COULD be replaced with `" · "` or `": "` should be. Inequality Trinity exception: "Free WITH Substrate > Flagship WITHOUT Substrate" is canon-locked, do NOT sweep there. But "messages may be delayed" class strings are fair game.

### SEG-F6 · share-from-mnemosynec Edge Function (NEW)

Compose `platform/supabase/functions/share-from-mnemosynec/index.ts`:
- POST `{recipient_email, message?}` from public
- Anti-abuse: rate-limit per IP (1/min, 10/day), CAPTCHA optional
- Send email from `DrM@mnemosynec.org` with subject `[From Dr. Mnemosynec] Someone wanted you to see this`
- Body: intro + **https://mnemosynec.org/** link (canonical share target — Founder direct BP086) + base-tier "free to join" CTA
- Log share event to a `shares` table for receipts (no PII beyond hashed email)
- Deploy + smoke

### SEG-F7 · Hugo build + Firebase deploy

- `hugo --config config-mnemosynec.toml`
- `firebase deploy --only hosting:mnemosyne` (the `mnemosynec.ai` target per earlier Knight verdict)
- Live verify: hero changes visible, GitHub link gone, email-share box renders + submits

### SEG-F8 · THUNDERCLAP unblock check

After v0.5.3 ships + auto-update fires + machines refresh:
- Query `peer_presence`:
  ```
  (eval "$(grep -E '^SUPABASE_DB_URL=' ...env)"; psql "$SUPABASE_DB_URL" -c "SELECT peer_id, tier, last_seen_at FROM peer_presence ORDER BY last_seen_at DESC LIMIT 10;")
  ```
- If 4 rows present with `tier='base'` and `last_seen_at` within 5 min → A3 Wake Fleet GREEN → fire A6 (smoke) → A7 (70Q MMLU-Pro cross-machine canonical run) immediately

---

## Sharps return

| # | Sharp | Pass criterion |
|---|---|---|
| F1 | RECON_DONE | What gates non-member, what doesn't — reported |
| F2 | TIER_COLUMN_LIVE | `peer_presence.tier` column + 4 RLS policies applied; psql verifies |
| F3 | EDGE_FN_ACCEPTS_ANON | `wan-relay-publish` POST without auth returns 201 + `tier='base'` |
| F4 | V0_5_3_SHIPPED | `mnemosynec.ai/download/MnemosyneC-Setup-0.5.3.exe` returns 200; auto-update manifest advertises v0.5.3 |
| F5 | HERO_HOTFIX_LIVE | Email-share box renders; GitHub 404 link removed; em-dash sweep complete (homepage) |
| F6 | SHARE_FN_LIVE | `share-from-mnemosynec` deployed + smoke OK |
| F7 | WEB_DEPLOYED | Hugo build + firebase deploy exit 0; live changes visible |
| F8 | FLEET_REGISTERED | 4 rows in `peer_presence` with `tier='base'`, last_seen within 5 min — A3 GREEN |

---

## Composition with BLACK MAMBA × 30

This is an AMENDMENT to BLACK MAMBA Stream A (unblocks A3) + Stream C (v0.5.3 follow-on to v0.5.2) + Stream D (web hero).

**Drop into the same Knight session.** Do not spawn a new one. Knight currently has A1-A5 complete, B running, C/D/E mostly done. Add SEGs F1-F8 to the active fan.

Post-F8 GREEN: A6-A11 fire immediately. THUNDERCLAP completes.

---

**Composed by Bishop BP086. Drop-in extension to BLACK MAMBA × 30.**
