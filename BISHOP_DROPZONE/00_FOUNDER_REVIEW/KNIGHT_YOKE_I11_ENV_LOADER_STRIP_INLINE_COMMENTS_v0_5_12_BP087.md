# KNIGHT YOKE · I11 · ENV_LOADER STRIP INLINE COMMENTS · v0.5.12 · BP087

**From:** Bishop · BP087 · final tactical fix · empirically proven root cause
**To:** Knight
**Class:** Surgical — single source-file edit + rebuild + deploy
**Model:** Sonnet 4.6 verbatim (Statutes §3 · NEVER "4.5" per BP079) · **use segs**
**Priority:** UNBLOCKS THE FLEET · last yoke before MAMBA-α

---

## §0 — Root cause locked (Bishop §14 catch · empirically gadget-verified)

Bishop ran direct curl tests against Supabase with the bundled v0.5.11 anon JWT — both returned HTTP 200 with valid data. The JWT itself is GOOD.

The actual root cause: **`src/main/env_loader.ts` L60 does not strip inline `#` comments from values.**

`resources/supabase_public.env` (in source repo) contains:
```
SUPABASE_ANON_KEY=eyJhbGci...b5cLd8_PphlA-MM0zAhe0-Qj5b4GbqReO6cT8tA0ngk  # gitleaks:allow
```

The `# gitleaks:allow` is REQUIRED in the source for gitleaks pre-commit pass. But env_loader's current L60:
```typescript
let val = line.slice(eq + 1).trim();
```

`.trim()` strips leading/trailing whitespace, but does NOT strip inline `#` comments. Result: env_loader loads the value as:
```
eyJhbGci...ngk  # gitleaks:allow
```

The HTTP request sends `Bearer <validJWT>   # gitleaks:allow` → Supabase returns 401 "Invalid API key" because of the trailing junk.

Empirical proof:
- M0 file edited to strip the comment manually → noop_test acked 1/1 GREEN in ~7 seconds
- M1/M2/M3 files unchanged → still 401-ing identically
- Bundled JWT (with comment stripped) tested against Supabase REST: HTTP 200 ✓

---

## §1 — The fix (one function, two added lines)

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\env_loader.ts`

**L60 BEFORE:**
```typescript
let val = line.slice(eq + 1).trim();
```

**L60 AFTER:**
```typescript
let val = line.slice(eq + 1).trim();
// BP087 I11: strip inline # comments (e.g., trailing "# gitleaks:allow" in supabase_public.env)
const hashIdx = val.indexOf('#');
if (hashIdx > -1) val = val.slice(0, hashIdx).trim();
```

That's it. Same logic dotenv libraries use. Standard `.env` parser behavior.

**Constraint:** ensure the strip happens BEFORE the surrounding-quote-strip block (L62-69) so a value like `"value # not a comment"` is preserved if explicitly quoted. Actually — the safer order is: strip quotes FIRST (so `"foo # bar"` becomes `foo # bar`), then strip inline `#` (so it becomes `foo`). Pick whichever Knight thinks cleanest; both work for the immediate fix. The bundled `supabase_public.env` has no quotes, so either order works.

---

## §2 — Build + deploy sequence (use segs)

1. **Edit** `src/main/env_loader.ts` per §1
2. **TSC clean check** (`npm run build:main`)
3. **Bump version** `package.json` 0.5.11 → 0.5.12
4. **Update changelog** (one line: "v0.5.12 · env_loader strips inline `#` comments — fixes bundled anon key being polluted with `# gitleaks:allow` trailing comment")
5. **Build installer:** `npm run dist:win`
   - assert-supabase-anon-key guard should still pass green (the source file SUPABASE_ANON_KEY still starts with `eyJ`)
   - NSIS produces `release\MnemosyneC-Setup-0.5.12.exe`
6. **Copy + Hugo + Firebase deploy:**
   - Copy installer + blockmap into `Cephas/cephas-hugo/static/download/`
   - Regenerate `latest.yml` with v0.5.12 version + SHA512 + size
   - `hugo --minify --config config-mnemosynec.toml`
   - `firebase deploy --only hosting:mnemosyne`
7. **4-curl-check verbatim** — both `mnemosynec.ai/download/latest.yml` and `mnemosynec.org/download/latest.yml` return `version: 0.5.12`; both installer URLs return HTTP 200

---

## §3 — After deploy

**Founder must manually install v0.5.12 on M1/M2/M3** (last manual install ever, for real this time). Reason: M1/M2/M3's v0.5.11 listeners are still 401-ing (file has the comment, env_loader doesn't strip), so they can't receive an auto_update broadcast. M0 is fine — its file was manually edited earlier this session.

After M1/M2/M3 are on v0.5.12:
- env_loader strips the inline comment at boot
- Listeners poll cleanly
- noop_test → 4/4 acks within 30s
- Son's Q1 v0.5.10 peer still 401s — that's tomorrow's problem when Son installs v0.5.12 fresh

**Optional polish:** Knight may also update `resources/supabase_public.env` in the repo to remove the `# gitleaks:allow` trailing comment AND add it to `.gitleaks.toml` allowlist instead. Cleaner but not required since the env_loader fix is structural.

---

## §4 — Auto_update never needed for this fix

Since the env_loader fix is at the LOADER layer, NOT the data layer, the installer DOES NOT need to ship a corrected supabase_public.env. Even if the bundled file still has `# gitleaks:allow`, v0.5.12's env_loader strips it at boot. The fix carries forward to any future bundled files automatically.

---

## §5 — Canon eblets to mint at I11 close (Bishop mints)

- `canon_env_loader_must_strip_inline_hash_comments_dotenv_standard_bp087` — the fix itself + reasoning
- `canon_bishop_section_14_root_cause_curl_test_jwt_directly_pattern_bp087` — the diagnostic discipline: when listener 401s, curl the bundled key DIRECTLY against the same endpoint with the same query; if 200, the key is fine and the bug is local; if 401, the key is wrong
- (carried) `canon_supabase_api_key_v2_migration_trap_rest_requires_legacy_jwt_not_sb_publishable_bp087`
- (carried) `canon_supabase_public_env_build_time_jwt_prefix_invariant_guard_bp087`
- (carried) `canon_terminal_stderr_diagnostic_pattern_for_packaged_electron_bp087` — actually superseded by electron-log (v0.5.10), useful as historical pattern

---

## §6 — Statutes binding

- §2 IMMUTABLES — fix-one-thing-FULLY-before-moving-on · ALWAYS mint small canon eblet · Truth-Always · BP053 fix-as-we-go · build-for-the-long-haul (structural fix at loader layer, not patch-at-data-layer)
- §3 SEGs Sonnet 4.6 verbatim
- §4 absolute paths · PowerShell `;` · secrets blacklist
- §12 Knight-direct
- BP076 absolute paths
- A14 BLOOD: empirically gadget-verified (curl test returned 200 with bundled JWT + comment stripped) — Bishop ran this himself in this session
- A15 BLOOD: SEGs do work, main thread stays available
- A16 BLOOD: ratify ONCE at end of cycle (THUNDERCLAP receipt, not this fix)

---

## §7 — Brick Wall scope (pre-authorized)

- env_loader.ts edit per §1
- package.json version bump
- changelog one-liner
- dist:win build
- both-domain Firebase deploy
- 4-curl verify
- (optional) gitleaks allowlist polish if Knight prefers

NOT pre-authorized:
- ANY change to the bundled JWT itself (the JWT is correct; do not regenerate)
- Schema migrations (none needed for this fix)
- MIC broadcast (no auto_update needed; M1/M2/M3 require manual install per §3)

---

## §8 — Return format

Knight yoke return SHALL contain:
1. env_loader.ts diff (just the L60 change)
2. tsc exit code
3. v0.5.12 SHA512 first 20 + size
4. 4-curl-check verbatim from both domains
5. Commit hash
6. Founder manual install instructions paste-ready (for M1/M2/M3)
7. ISO-8601 UTC timestamps

---

— Bishop · BP087 · 🌊⚓ · *Fix at the loader. Comments stripped. Move on to THUNDERCLAP.*
