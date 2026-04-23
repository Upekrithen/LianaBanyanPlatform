# Secrets Audit — K425 Workstream A
## Knight K425, April 21, 2026

---

## Executive Summary

The Liana Banyan Platform stores secrets across **6 distinct locations**. This audit catalogs every secret by name, purpose, current storage, which tools/code read it, and the canonical destination under the new single-source-of-truth architecture (Supabase Vault → SDS.env mirror).

**Key findings:**
1. **28 unique secret names** across SDS.env + DOUBLESECRET.env combined
2. **DOUBLESECRETBACKUP.env** is a near-exact copy of DOUBLESECRET.env (missing only `STRIPE_WEBHOOK_SECRET` and `YOUR_ACCESS_TOKEN`) — recommend **deprecation**
3. **Non-standard naming** in DOUBLESECRET.env (camelCase, underscored mixed-case) — needs canonicalization
4. **`.env.staging`** holds 4 staging-only Supabase keys — separate concern, not production secrets
5. **`mcp.json`** holds 2 keys inline — should reference Vault, not store values
6. **`Firebase Login.txt`** exists at `~/.cursor/` — out-of-repo credential file
7. **Edge Functions** read **~25 distinct env vars** via `Deno.env.get()` from Supabase project secrets
8. **`librarian-mcp-public/`** — ZERO secrets detected (independently verified)

---

## Storage Location Inventory

### 1. `Asteroid-ProofVault/LockBox/SDS.env` — AI/LLM vendor keys + Supabase service key

| Env Var Name | Purpose | Read By | Canonical? |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API access | Cursor agents, librarian-mcp, Edge Functions (`star-chamber-analyze`) | YES — Vault canonical |
| `GEMINI_API_KEY` | Google Gemini API | Cursor agents, librarian-mcp benchmarks | YES — Vault canonical |
| `OPENAI_API_KEY` | OpenAI API access | Cursor agents, librarian-mcp benchmarks | YES — Vault canonical |
| `PERPLEXITY_API_KEY` | Perplexity API | Cursor agents, Edge Functions (`generate-business-plan`, `star-chamber-analyze`), mcp.json | YES — Vault canonical |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin access | Platform scripts, Edge Functions (all ~40+ functions) | YES — Vault canonical |
| `OLD_PERPLEXITY_API_KEY` | **LEGACY** — previous Perplexity key | Unknown / likely unused | **DEPRECATE** — remove after confirming no references |
| `AnnoyUpeAnthropKEY` | **NON-STANDARD** — appears to be a duplicate/legacy Anthropic key alias | Unknown | **DEPRECATE** — fold into `ANTHROPIC_API_KEY` or remove |

**Assessment:** 5 canonical keys + 2 legacy/non-standard to deprecate.

---

### 2. `Asteroid-ProofVault/LockBox/DOUBLESECRET.env` — Social/payment/comms vendor keys

| Env Var Name | Purpose | Read By | Canonical? |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe payment processing | Edge Functions (`stripe-connect-payout`, `create-connect-account`, `process-withdrawal`, `get-transparency-data`, `create-funding-schedule`, `process-scheduled-funding`, `create-project-funding-checkout`) | YES — Vault canonical |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | Edge Function (`stripe-webhook`) | YES — Vault canonical |
| `TWILIO_ACCOUNT_SID` | Twilio SMS/voice | Edge Functions (future), scripts | YES — Vault canonical |
| `TWILIO_AUTH_TOKEN` | Twilio authentication | Edge Functions (future), scripts | YES — Vault canonical |
| `BLUESKY_APP_PASSWORD` | Bluesky social posting | Edge Function (`social-post`) | YES — Vault canonical |
| `BLUESKY_HANDLE` | Bluesky account handle | Edge Function (`social-post`), platform/.env as `VITE_BLUESKY_HANDLE` | Public data — Vault optional |
| `Consumer_Key` | **NON-STANDARD** — likely Twitter/X API consumer key | Unknown legacy OAuth | **RENAME** → `TWITTER_CONSUMER_KEY` |
| `Consumer_Key_Secret` | **NON-STANDARD** — Twitter/X consumer secret | Unknown legacy OAuth | **RENAME** → `TWITTER_CONSUMER_SECRET` |
| `Access_Token` | **NON-STANDARD** — likely Twitter/X access token | Unknown legacy OAuth | **RENAME** → `TWITTER_ACCESS_TOKEN` |
| `Access_Token_Key` | **NON-STANDARD** — ambiguous | Unknown legacy | **AUDIT** — determine purpose or remove |
| `Twitter_Access_Secret` | Twitter/X access token secret | Unknown legacy OAuth | **RENAME** → `TWITTER_ACCESS_SECRET` |
| `Twitter_Access_Token` | Twitter/X access token (duplicate of `Access_Token`?) | Unknown legacy OAuth | **DEDUPLICATE** — confirm if same as `Access_Token` |
| `AppID` | **NON-STANDARD** — likely Facebook/Meta App ID | Social OAuth | **RENAME** → `FACEBOOK_APP_ID` or `META_APP_ID` |
| `AppSecret` | **NON-STANDARD** — likely Facebook/Meta App Secret | Social OAuth | **RENAME** → `FACEBOOK_APP_SECRET` or `META_APP_SECRET` |
| `ClientID` | **NON-STANDARD** — ambiguous OAuth client | Unknown | **AUDIT** — determine vendor or remove |
| `CLIENT_KEY` | **NON-STANDARD** — ambiguous OAuth client key | Unknown | **AUDIT** — determine vendor or remove |
| `CLIENT_SECRET` | **NON-STANDARD** — ambiguous OAuth client secret | Unknown | **AUDIT** — determine vendor or remove |
| `YOUR_ACCESS_TOKEN` | **NON-STANDARD** — ambiguous general token | Unknown | **AUDIT** — determine purpose or remove |
| `BUFFER` | **NON-STANDARD** — likely Buffer.com social scheduler | Social posting pipeline | **RENAME** → `BUFFER_ACCESS_TOKEN` |
| `MecuryIsRising` | **NON-STANDARD** — typo of "Mercury"? purpose unclear | Unknown | **AUDIT** — determine purpose or remove |
| `PawnKEY` | **NON-STANDARD** — likely Pawn agent API key | Pawn agent scripts | **RENAME** → `PAWN_API_KEY` |

**Assessment:** 3 canonical keys + 18 non-standard/legacy needing rename/audit/deprecation.

---

### 3. `Asteroid-ProofVault/LockBox/DOUBLESECRETBACKUP.env` — Near-clone of DOUBLESECRET.env

Contains **20 of the 21 vars** from DOUBLESECRET.env. Missing: `STRIPE_WEBHOOK_SECRET`, `YOUR_ACCESS_TOKEN`.

**Decision: DEPRECATE.** This file provides no value over DOUBLESECRET.env. Once Supabase Vault is canonical, the mirror script regenerates SDS.env on demand. A backup-of-a-backup is unnecessary. The Vault is the backup (cloud-hosted, survives machine loss).

**Action:** Delete after Vault migration is complete. Document the deprecation in the sync script README.

---

### 4. `Asteroid-ProofVault/LockBox/.env.staging` — Staging-only Supabase keys

| Env Var Name | Purpose |
|---|---|
| `SUPABASE_ANON_KEY` | Staging anon key |
| `SUPABASE_DB_PASSWORD` | Staging DB password |
| `SUPABASE_PROJECT_REF` | Staging project reference |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging service role key |

**Assessment:** Staging-only. Not production secrets. Keep separate from canonical Vault flow. Rename to `.env.staging.supabase` for clarity, or merge into a `staging` scope in Vault.

---

### 5. `~/.cursor/mcp.json` — MCP server configurations (outside repo)

| Env Var Name | Purpose | Notes |
|---|---|---|
| `PERPLEXITY_API_KEY` | Pawn MCP perplexity server | **DUPLICATED** from SDS.env — should read from Vault/SDS.env instead of inline |
| `RESEND_API_KEY` | Resend email MCP server | Also used by Edge Functions (`dispatch-letter`, `send-membership-reminders`, `family-vote`) |

**Assessment:** Values stored inline in JSON. Can't easily reference Vault from mcp.json (Cursor reads it at startup). Acceptable as a **second read-path** but must stay in sync with Vault. Mirror script should validate mcp.json keys match Vault values (warn, don't auto-overwrite).

---

### 6. `~/.cursor/FireBase Login.txt` — Firebase CLI credentials (outside repo)

Single file containing Firebase authentication. Not an env var; a credential file.

**Assessment:** Out of scope for Vault migration. Firebase CLI manages its own auth via `firebase login`. Document its existence; do not attempt to Vault-ify.

---

### 7. `platform/.env` — Vite build-time public keys (committed to repo)

| Env Var Name | Purpose | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | No — public |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | No — public by design |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | No — public |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No — public by design |
| `VITE_BLUESKY_HANDLE` | Bluesky handle | No — public |
| `VITE_TWITTER_CLIENT_ID` | Twitter OAuth client ID | No — public |
| `VITE_LINKEDIN_CLIENT_ID` | LinkedIn OAuth client ID | No — public |
| `VITE_FACEBOOK_APP_ID` | Facebook App ID | No — public |
| `VITE_TIKTOK_CLIENT_KEY` | TikTok client key | No — public |
| `VITE_IMGUR_CLIENT_ID` | Imgur client ID | No — public |

**Assessment:** All public keys. These are correctly in `platform/.env` (committed). No Vault migration needed.

---

### 8. Edge Functions — `Deno.env.get()` (Supabase project secrets)

These are read from **Supabase project secrets** (Dashboard → Settings → Edge Functions → Environment Variables). They are effectively already in "Vault" — the Supabase secrets store. The full list:

**Core (used by nearly all functions):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

**Stripe:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CONNECT_WEBHOOK_SECRET`
- `STRIPE_PROJECT_FUNDING_WEBHOOK_SECRET`
- `STRIPE_FUNDING_WEBHOOK_SECRET`

**Email/Comms:**
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID` (referenced but not yet active in Edge Functions)
- `TWILIO_AUTH_TOKEN` (referenced but not yet active)

**AI/LLM:**
- `ANTHROPIC_API_KEY`
- `PERPLEXITY_API_KEY`

**Google:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `GMAIL_WATCH_EMAIL`
- `GMAIL_PUBSUB_TOPIC`

**Social:**
- `BLUESKY_SERVICE`
- `META_ACCESS_TOKEN`

**Blockchain/Fintech:**
- `ADMIN_WALLET_PRIVATE_KEY`
- `LB_SYSTEM_KEY`
- `LB_CARD_PROVIDER`
- `LITHIC_WEBHOOK_SECRET`

**Misc:**
- `NOTION_API_KEY`
- `KICKSTARTER_API_KEY`
- `CONGRESS_API_KEY`
- `PINATA_API_KEY`
- `PINATA_SECRET_KEY`
- `FOUNDER_PHONE_NUMBER`
- `PUBLIC_SITE_URL`
- `VIEWING_ACCESS_IP_SALT`

---

### 9. `librarian-mcp-public/` — VERIFIED CLEAN

Grep for `sk-`, `pplx-`, `re_`, `AIza`, `pk_live`, `pk_test`, `sk_live`, `sk_test`, `eyJh`, `supabase.co.*service_role` returned **zero matches**. Bishop's B113 hand-audit independently confirmed.

---

## Canonical Architecture (Post-K425)

```
┌─────────────────────────────────────┐
│     SUPABASE VAULT (canonical)      │
│   vault.secrets table + project     │
│   secrets for Edge Functions        │
│         SINGLE SOURCE OF TRUTH      │
└──────────────┬──────────────────────┘
               │
               │  scripts/sync-sds-from-vault.py
               │  (pull from Vault → write local)
               │
┌──────────────▼──────────────────────┐
│     SDS.env (auto-generated mirror) │
│   Read by: Cursor agents, Knight    │
│   scripts, Bishop (via set -a)      │
│   NEVER commit. NEVER edit by hand. │
│   Regenerate on demand.             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     platform/.env (public keys)     │
│   VITE_* prefixed, committed,       │
│   safe for client-side bundling     │
│   NOT managed by Vault              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     mcp.json (Cursor MCP config)    │
│   2 keys inline (can't avoid)       │
│   Mirror script validates sync      │
└─────────────────────────────────────┘
```

**Direction:** Vault → SDS.env. Never SDS.env → Vault.

---

## Recommended Canonical Env Var Namespace

| Canonical Name | Current Name(s) | Action |
|---|---|---|
| `ANTHROPIC_API_KEY` | `ANTHROPIC_API_KEY`, `AnnoyUpeAnthropKEY` | Keep standard; deprecate alias |
| `OPENAI_API_KEY` | `OPENAI_API_KEY` | No change |
| `GEMINI_API_KEY` | `GEMINI_API_KEY` | No change |
| `PERPLEXITY_API_KEY` | `PERPLEXITY_API_KEY`, `OLD_PERPLEXITY_API_KEY` | Keep standard; deprecate old |
| `SUPABASE_URL` | `SUPABASE_URL` | No change |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | No change |
| `SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` | No change |
| `STRIPE_SECRET_KEY` | `STRIPE_SECRET_KEY` | No change |
| `STRIPE_WEBHOOK_SECRET` | `STRIPE_WEBHOOK_SECRET` | No change |
| `RESEND_API_KEY` | `RESEND_API_KEY` | No change |
| `TWILIO_ACCOUNT_SID` | `TWILIO_ACCOUNT_SID` | No change |
| `TWILIO_AUTH_TOKEN` | `TWILIO_AUTH_TOKEN` | No change |
| `BLUESKY_APP_PASSWORD` | `BLUESKY_APP_PASSWORD` | No change |
| `TWITTER_CONSUMER_KEY` | `Consumer_Key` | **RENAME** |
| `TWITTER_CONSUMER_SECRET` | `Consumer_Key_Secret` | **RENAME** |
| `TWITTER_ACCESS_TOKEN` | `Access_Token`, `Twitter_Access_Token` | **DEDUPLICATE + RENAME** |
| `TWITTER_ACCESS_SECRET` | `Access_Token_Key`, `Twitter_Access_Secret` | **DEDUPLICATE + RENAME** |
| `FACEBOOK_APP_ID` | `AppID` | **RENAME** |
| `FACEBOOK_APP_SECRET` | `AppSecret` | **RENAME** |
| `BUFFER_ACCESS_TOKEN` | `BUFFER` | **RENAME** |
| `PAWN_API_KEY` | `PawnKEY` | **RENAME** |

**Variables requiring Founder audit (purpose unclear):**
- `MecuryIsRising` — typo of "Mercury"? Purpose unknown.
- `ClientID` — which vendor?
- `CLIENT_KEY` — which vendor?
- `CLIENT_SECRET` — which vendor?
- `YOUR_ACCESS_TOKEN` — which service?

---

## DOUBLESECRETBACKUP.env Resolution

**Decision: DEPRECATE.**

Rationale:
1. Contains 20/21 vars from DOUBLESECRET.env (missing `STRIPE_WEBHOOK_SECRET`, `YOUR_ACCESS_TOKEN`)
2. With Vault as canonical, local backups are redundant — Vault is cloud-hosted
3. The sync script regenerates SDS.env on demand from Vault
4. Keeping a backup-of-a-backup adds confusion without security benefit

**Action:** Do not delete yet. Rename to `DOUBLESECRETBACKUP.env.DEPRECATED` after Vault migration. Delete after 30-day bake period.

---

## Namespace Standardization — Code Impact

Searched all `.ts`, `.tsx`, `.js`, `.cjs`, `.mjs`, `.py`, `.sh`, `.ps1` files in the platform for non-standard env var names (`AnnoyUpeAnthropKEY`, `OLD_PERPLEXITY_API_KEY`, `PawnKEY`, `MecuryIsRising`, `Consumer_Key`, `AppID`, `AppSecret`, `ClientID`, `CLIENT_KEY`, `CLIENT_SECRET`, `YOUR_ACCESS_TOKEN`).

**Result: ZERO code references.** All Edge Functions and platform code use standard names (`ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, etc.). The non-standard names are isolated to the `.env` files themselves.

**No code changes needed.** The cleanup is purely in the env files:
1. **SDS.env** — the sync script (`scripts/sync-sds-from-vault.py`) regenerates this file with canonical names. Legacy names (`AnnoyUpeAnthropKEY`, `OLD_PERPLEXITY_API_KEY`) will not be carried forward.
2. **DOUBLESECRET.env** — Founder action required. Rename 11 non-standard vars to canonical names per the mapping table above. No code depends on the old names.
3. **DOUBLESECRETBACKUP.env** — Deprecate (see resolution above).

---

## Deliverables

| # | Deliverable | Status | Location |
|---|---|---|---|
| 1 | Secrets audit | COMPLETE | `BISHOP_DROPZONE/03_BishopHandoffs/SECRETS_AUDIT_K425.md` (this file) |
| 2 | Sync script (Vault → SDS.env) | COMPLETE | `scripts/sync-sds-from-vault.py` |
| 3 | Public secrets documentation | COMPLETE | `librarian-mcp-public/docs/SECRETS.md` |
| 4 | Canonical namespace mapping | COMPLETE | This file, "Recommended Canonical Env Var Namespace" table |
| 5 | DOUBLESECRETBACKUP.env resolution | COMPLETE | This file, "DOUBLESECRETBACKUP.env Resolution" section |
| 6 | Code audit for non-standard names | COMPLETE | This file, "Namespace Standardization" section (zero changes needed) |

---

*Audit completed K425, April 21, 2026. Knight (Cursor). For the Keep.*
