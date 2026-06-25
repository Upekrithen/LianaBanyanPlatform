# YOKE-RETURN — BP084: Gemma Page + Interactive Comments + SUBSTRATE Blue Link Restore

**Date:** 2026-06-15  
**Model used: Sonnet 4.6**  
**Commit SHA:** `f6d45083c4eedda412190fb5e3a1bbf1fea97a9d`  
**Deploy target:** `mnemosynec.ai` (Firebase `hosting:mnemosyne` → `public-mnemosynec/`)

---

## SEG Status

| SEG | Deliverable | Status | Notes |
|---|---|---|---|
| SEG-1 | Dedicated `/gemma/` page | ✅ LANDED | `content-mnemosynec/gemma/_index.md` · mimic-trunk-eligible · comments-enabled · Gemma variant table · 97.1% benchmark |
| SEG-2 | Supabase comments backend | ✅ LANDED | Migration `20260616000001_comments.sql` + 5 edge functions (post/list/vote/flag/soft-delete) |
| SEG-3 | Comments client widget | ✅ LANDED | `static/js/comments.js` — vanilla JS, member-gated, threaded, HMAC-signed |
| SEG-4 | Gemma anchor in how-it-works | ✅ LANDED | `{#gemma}` heading + `→ /gemma/` link + `how-it-works-gemma-section` comments div |
| SEG-5 | Substrate page + blue link | ✅ LANDED | `how-to-read-the-substrate/_index.md` populated · substrate links in homepage partial restored |
| SEG-6 | Mimic Trunk footer conditional | ✅ LANDED | `extend_footer.html` conditional on `.Params.mimicTrunkEligible` |
| SEG-7 | Deploy + Sharps | ✅ ALL 8 PASS | Hugo build 35 pages · Firebase deployed |

---

## All 8 Sharps — Literal Results

| Sharp | Test | Result |
|---|---|---|
| **Sharp 1** | `GET https://mnemosynec.ai/gemma/` → 200 + body contains "Gemma" | **200 · PASS** |
| **Sharp 2** | `GET https://mnemosynec.ai/how-to-read-the-substrate/` → 200 + body contains "verified-knowledge accumulator" | **200 · PASS** |
| **Sharp 3** | `GET https://mnemosynec.ai/` body contains substrate link path | **200 · PASS** (minified: `href=/how-to-read-the-substrate/`) |
| **Sharp 4** | Migration file exists at `platform/supabase/migrations/20260616000001_comments.sql` | **PASS** |
| **Sharp 5** | 4+ edge function files in `platform/supabase/functions/` | **PASS · 5 functions** (comments-post, list, vote, flag, soft-delete) |
| **Sharp 6** | `Cephas/cephas-hugo/static/js/comments.js` exists | **PASS** |
| **Sharp 7** | `/gemma/` HTML contains `data-comments-thread="gemma-main"` | **PASS** (minified: `data-comments-thread=gemma-main`) |
| **Sharp 8** | Mimic Trunk footer conditional exists in footer partial | **PASS** (`.Params.mimicTrunkEligible` in `extend_footer.html`) |

> **Note on Sharps 3, 7:** Hugo's `--minify` flag strips quotes from single-value HTML attributes per HTML5 spec. The pattern matching was adjusted to confirm the semantic content is present; the anchor `href` and `data-comments-thread` attributes both verified in the live response body.

---

## Thread Slugs Introduced

| Thread Slug | Page | Purpose |
|---|---|---|
| `gemma-main` | `/gemma/` | Primary Gemma page comments |
| `how-it-works-gemma-section` | `/how-it-works/` | Gemma subsection in canonical pipeline doc |
| `substrate-main` | `/how-to-read-the-substrate/` | Substrate architecture page comments |

---

## Files Changed in This Commit

```
Cephas/cephas-hugo/content-mnemosynec/gemma/_index.md              [NEW]
Cephas/cephas-hugo/content-mnemosynec/how-to-read-the-substrate/_index.md  [NEW]
Cephas/cephas-hugo/content-mnemosynec/how-it-works/_index.md       [MODIFIED]
Cephas/cephas-hugo/layouts/partials/mnemosynec-homepage.html        [MODIFIED]
Cephas/cephas-hugo/layouts/partials/extend_footer.html              [MODIFIED]
Cephas/cephas-hugo/static/js/comments.js                           [NEW]
platform/supabase/migrations/20260616000001_comments.sql            [NEW]
platform/supabase/functions/comments-post/index.ts                  [NEW]
platform/supabase/functions/comments-list/index.ts                  [NEW]
platform/supabase/functions/comments-vote/index.ts                  [NEW]
platform/supabase/functions/comments-flag/index.ts                  [NEW]
platform/supabase/functions/comments-soft-delete/index.ts           [NEW]
```

---

## Pending Actions (Founder/Bishop)

1. **Apply Supabase migration:** `cd platform; npx supabase db push` — migration file is written but not yet applied to the live DB (requires Supabase credentials + network access to the project).
2. **Deploy edge functions:** `npx supabase functions deploy comments-post comments-list comments-vote comments-flag comments-soft-delete` — functions are written, not yet deployed to Supabase edge runtime.
3. **Set `COMMENTS_HMAC_SECRET`** in Supabase project environment (edge function secret). Generate with: `openssl rand -hex 32`.
4. **Update anon key placeholder** in gemma and substrate `_index.md` comments divs — the `data-supabase-anon-key` currently has a placeholder JWT. Replace with the actual project anon key from Supabase dashboard.

---

## Architecture Notes

**HMAC Signature (comments-post):** The client generates `HMAC-SHA256(member_id || thread_slug || created_at || body)` using the anon key as the shared secret client-side. The server re-derives using `COMMENTS_HMAC_SECRET`. This provides a lightweight anti-replay signature — not cryptographic non-repudiation, but sufficient to block unsigned POST attempts.

**Soft delete:** `deleted_at` is set; RLS `comments_read_public` policy filters `where deleted_at is null`. Body is preserved for audit trail.

**Comments widget auth:** Reads `member_token` from `localStorage` (set by `verify-mnemosynec-checkout` join flow). Decodes JWT sub field for `member_id`. Join prompt triggers the existing join modal via `[data-mn-join]` selector or falls back to `/join/`.

---

**FOR THE KEEP.**

*Knight (Cursor · Sonnet 4.6) · BP084 · 2026-06-15*
