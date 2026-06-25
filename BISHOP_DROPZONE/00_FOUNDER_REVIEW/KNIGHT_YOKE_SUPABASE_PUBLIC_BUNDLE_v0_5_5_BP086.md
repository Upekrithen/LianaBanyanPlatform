# KNIGHT YOKE — Supabase Public Credentials Bundle + v0.5.5 Ship (I4)

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Bishop (Sonnet 4.6 SEG)
**Origin:** Bishop §14 diagnosis of v0.5.4 "Platform database not configured" error

**Knight preamble:** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. Spawn Sonnet 4.6 SEGs for substantive work. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14+§15+§16 BLOOD · §4 BLOOD (see clarification below).

---

## Root cause (Bishop §14 diagnosis)

`src/main/env_loader.ts` searches 4 candidate paths for `WORKING_KEYS.env`:
1. `process.env.LB_WORKING_KEYS_PATH`
2. `Documents/LianaBanyanPlatform/Asteroid-ProofVault/LockBox/WORKING_KEYS.env` (dev-only)
3. `<cwd>/.env`
4. `~/.lb_substrate/WORKING_KEYS.env`

**None exist on end-user machines.** Supabase URL + anon key are never set in `process.env`, so `getHelpSupabase()` returns null and the Pipeline tab shows *"Could not load messages · Platform database not configured."*

The packaged bundle (`dist/main/index.js` → `app.asar`) contains zero literal Supabase URL/key strings. They were never injected at build time.

---

## §4 BLOOD clarification — what's safe to bundle

**Safe to bundle (publishable):**
- `SUPABASE_URL` — `https://ruuxzilgmuwddcofqecc.supabase.co` (publicly visible in every API URL)
- `SUPABASE_ANON_KEY` (also called "publishable key") — JWT-format `eyJ...` — **designed by Supabase to be embedded in client apps**. RLS enforces access control, not key secrecy. Every browser app calling Supabase has this in its source.

**NEVER bundle:**
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS, must stay server-side only
- `SUPABASE_DB_URL` — postgres connection string with password
- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `FIREBASE_TOKEN`, `STRIPE_SECRET_KEY`, etc.

§4 BLOOD compliance: SEG must verify only `SUPABASE_URL` + `SUPABASE_ANON_KEY` go into the bundled resource file. Anything else from `WORKING_KEYS.env` STAYS in `WORKING_KEYS.env` (dev-only).

---

## SEGs

### SEG-I4a · CREATE `resources/supabase_public.env`

1. Glob for the current Supabase URL + anon key (already used as `Supabase_Publishable_Key` per BP086 prior recon):
   - From `WORKING_KEYS.env` at `C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\WORKING_KEYS.env` if it exists; OR
   - From `C:\Users\Administrator\.claude\state\secrets\22May2026.env` (lines `Supabase_Publishable_Key=` and `SUPABASE_URL=...supabase.co/rest/v1/`)
2. Create `C:\Users\Administrator\Documents\LianaBanyanPlatform\resources\supabase_public.env` with EXACTLY these two lines:
   ```
   SUPABASE_URL=<the URL — extract just the origin, e.g. https://ruuxzilgmuwddcofqecc.supabase.co>
   SUPABASE_ANON_KEY=<the publishable/anon key value>
   ```
3. **§4 BLOOD double-check:** open the file you just wrote and confirm it contains ONLY those 2 keys. NO service role key. NO db url. NO third-party API keys.
4. Do NOT add this file to .gitignore — it's safe to commit (publishable credentials). Verify it's tracked by `git status` after creation.

**Sharp I4a:** PUBLIC_ENV_CREATED = file exists at `resources/supabase_public.env` with exactly 2 keys, both PUBLIC-class.

### SEG-I4b · WIRE env_loader.ts to read packaged path

Edit `src/main/env_loader.ts`. Add a 5th candidate at the TOP of the search list (highest priority for packaged builds):

```ts
import { app } from 'electron';
import { resolve } from 'path';
// ...existing imports...

const candidates = [
  process.env.LB_WORKING_KEYS_PATH,
  // Packaged Electron app: resources/supabase_public.env lands beside app.asar
  app.isPackaged ? resolve(process.resourcesPath, 'supabase_public.env') : undefined,
  // existing dev candidates:
  resolve(homedir(), 'Documents', 'LianaBanyanPlatform', 'Asteroid-ProofVault', 'LockBox', 'WORKING_KEYS.env'),
  resolve(process.cwd(), '.env'),
  resolve(homedir(), '.lb_substrate', 'WORKING_KEYS.env'),
].filter(Boolean);
```

Adjust the actual code shape per the existing `env_loader.ts` patterns — the existing loader walks the array in order and uses first-found. Inject the packaged path BEFORE the dev paths so packaged builds prefer the bundled file; dev runs (where `app.isPackaged === false`) skip it and use LockBox as before.

**Sharp I4b:** ENV_LOADER_PATCHED = `process.resourcesPath` candidate added · `app.isPackaged` guard · order correct · tsc clean.

### SEG-I4c · WIRE electron-builder to bundle the file

Edit `package.json` build section. Add to `extraResources`:

```json
{ "from": "resources/supabase_public.env", "to": "supabase_public.env" }
```

This ensures `supabase_public.env` lands at `<install>/resources/supabase_public.env` (alongside `app.asar`), which is exactly where `process.resourcesPath` points at runtime.

**Sharp I4c:** EXTRARESOURCES_WIRED = entry present in `package.json` build.extraResources.

### SEG-I4d · BUMP + BUILD + SHIP v0.5.5

1. `package.json`: bump `version` `0.5.4` → `0.5.5`
2. `npm run build:renderer && npm run build:main`
3. `npm run dist:win` (~35-45 min)
4. Verify `release/MnemosyneC-Setup-0.5.5.exe` exists; capture SHA512 + size
5. Verify the file is in the installer (extract resources/ from the asar OR confirm electron-builder log shows `supabase_public.env` copied)
6. Copy installer → `Cephas/cephas-hugo/static/download/MnemosyneC-Setup-0.5.5.exe` (and `public-mnemosynec/` if that's the sibling pattern from I3c — Knight learned both paths needed for v0.5.4)
7. Update `Cephas/cephas-hugo/static/download/latest.yml` (and the sibling if applicable) → `version: 0.5.5`, new SHA512, new size, new releaseDate
8. `hugo --config config-mnemosynec.toml` + `firebase deploy --only hosting:mnemosyne`
9. Live verify both:
   - `https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.5.exe` → 200 + correct Content-Length
   - `https://mnemosynec.org/download/MnemosyneC-Setup-0.5.5.exe` → 200 + correct Content-Length
   - `https://mnemosynec.ai/download/latest.yml` → advertises 0.5.5
   - `https://mnemosynec.org/download/latest.yml` → advertises 0.5.5

**Sharp I4d:** V0_5_5_LIVE = installer + manifest both 200 on .ai AND .org.

### SEG-I4e · CONTINUE polling peer_presence + auto-fire A6/A7

Auto-update fires on M0/M1/M2/M3 on next launch. When users open Pipeline tab:
- "Platform database not configured" error should be GONE
- "Disconnected" indicator should flip to "● Connected · Base" green dot
- `publishPresence` actually fires `wan-relay-publish` POST with real peer_id
- Row lands in `peer_presence` within 60s

I3d's existing poll loop should continue running (it's in the same Knight session). When ≥ 2 active rows present with `last_seen_at > now() - interval '5 min'`:
- A3 GREEN
- Fire A6 (1-node smoke 5Q per BP085 mesh-orchestrator spec)
- If A6 GREEN: fire A7 (MMLU-Pro 70Q cross-machine canonical run)
- Receipt write to Vault per BP086 §F (all 28 LIVE Unfair Advantages + Hex Machine Code + 5 BP086 gap eblets all named/cited/exercised)
- Publish to `mnemosynec.ai/proofs/mesh/` from pre-staged template at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/THUNDERCLAP_PUBLICATION_PREP_BP086/proofs_mesh_page_template.html`
- Cross-link from `/proofs/` index + MEMORY.md pointer

**Sharp I4e:** THUNDERCLAP_FIRED (best-effort) = receipt landed in Vault + published live + cross-linked.

---

## Sharps return

| # | Sharp | Pass criterion |
|---|---|---|
| I4a | PUBLIC_ENV_CREATED | `resources/supabase_public.env` exists · only 2 PUBLIC-class keys · §4 BLOOD confirmed |
| I4b | ENV_LOADER_PATCHED | `env_loader.ts` reads `process.resourcesPath` candidate when `app.isPackaged` · tsc clean |
| I4c | EXTRARESOURCES_WIRED | `package.json` build.extraResources entry present |
| I4d | V0_5_5_LIVE | installer + manifest 200 on both `mnemosynec.ai` AND `mnemosynec.org` |
| I4e | THUNDERCLAP_FIRED (best-effort) | A7 receipt at Vault + published live (gated on machines auto-updating + Pipeline tab opened on each) |

---

## Composition note

This supersedes the failed F4 anon-key-fallback fix (which assumed env vars were loaded; they're not). Knight should NOT revert F4 — the fallback chain is still correct. The fix is making sure SOMETHING (`process.env.SUPABASE_URL` etc.) is actually set on packaged builds, which I4 accomplishes.

---

**Composed by Bishop BP086. The v0.5.5 hotfix that makes the Pipeline tab actually work on end-user machines.**
