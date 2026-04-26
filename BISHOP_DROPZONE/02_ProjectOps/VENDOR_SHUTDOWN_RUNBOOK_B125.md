# VENDOR-SHUTDOWN RESPONSE RUNBOOK

**Filed**: B125 (2026-04-25) — Bishop micro-task following 7-layer defense canon ([project_vendor_lockout_resilience_layered_defense.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/project_vendor_lockout_resilience_layered_defense.md))
**Purpose**: When a cloud LLM vendor revokes API access, raises pricing prohibitively, deprecates an endpoint we depend on, or changes ToS to prohibit substrate-injection — this is the documented migration path. Knight should not have to reverse-engineer the migration under pressure.
**Status**: Living document. Update on every vendor migration actually performed; cross-reference Toolsmith entries.

---

## Layer-2 bring-up (canonical pattern — K510)

Layer 2 = Vendor API direct, mediated by the Helm daemon REST server.

**One-click bring-up (production):**
```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp-helm-pwa
.\Start-PawnPortal.ps1
```
Script: loads `PPLX_API_KEY` from SDS.env (via `PERPLEXITY_API_KEY` alias), starts `daemon_wrapper.py`
on port 7712 (REST) + 7711 (MCP SSE), starts Vite dev server on port 5173, opens browser.
Idempotent -- safe to re-run; detects healthy daemon via `GET http://127.0.0.1:7712/health`.
Teardown: `.\Stop-PawnPortal.ps1`

**Manual bring-up (if script unavailable):**
```powershell
# 1. Load key into session
Get-Content "Asteroid-ProofVault\LockBox\SDS.env" | ForEach-Object { if ($_ -match "^([A-Z_]+)=(.+)$") { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") } }
$env:PPLX_API_KEY = $env:PERPLEXITY_API_KEY   # alias for daemon_wrapper.py

# 2. Start daemon
& "librarian-mcp-public\.venv\Scripts\python.exe" "librarian-mcp-helm-pwa\daemon_wrapper.py" --port 7711

# 3. Start web UI (new terminal)
cd librarian-mcp-helm-pwa; npm run dev:web

# 4. Health check
Invoke-RestMethod http://127.0.0.1:7712/health
```

---

## Detection signals (before runbook fires)

Any one of these is sufficient cause to consult this runbook:

1. **API call returns 401/403** consistently after fresh key issuance attempt
2. **Vendor email** announcing tier deprecation, ToS change, or LB-specific suspension
3. **Cost spike** beyond budget threshold (per-call cost rises >5×)
4. **Latency degradation** beyond P95 of 30s on calls that previously ran <5s
5. **Output policy change** that prohibits substrate-injection (vendor-imposed system-prompt override blocks our context)
6. **Feature deprecation** (e.g., `messages.create` endpoint removed for non-enterprise)
7. **R-series benchmark regression** showing this vendor's lift signature dropping >20pp from baseline

If signal triggers: log Toolsmith entry, fall to next layer per the table.

---

## Per-vendor migration paths

### Perplexity Sonar Pro (current Pawn-API CLI vendor — K507)

**Code path**: `librarian-mcp/scripts/pawn_with_substrate.py`
**API key location**: `DOUBLESECRET.env` — variable name `PERPLEXITY_API_KEY`
**Daily cap**: configured in script header

**If Perplexity locks down:**

1. **Acquire replacement vendor API key**:
   - Anthropic Claude (preferred replacement — cheapest cathedral tier per R13: Haiku 4.5 at +90% lift)
   - OpenAI GPT-5.4-mini (R13: 82%, mid-tier)
   - Google Gemini 2.5 Flash (R13: 80%, lowest cost-per-HOT at $0.0040)
2. **Add new env var** to `DOUBLESECRET.env`:
   - `ANTHROPIC_API_KEY=...` or `OPENAI_API_KEY=...` or `GEMINI_API_KEY=...`
3. **Modify `pawn_with_substrate.py`**:
   - Replace `import requests; requests.post("https://api.perplexity.ai/...")` with the corresponding vendor SDK call
   - Replace model ID: Perplexity uses `sonar-pro`; Anthropic uses `claude-haiku-4-5-20251001` or `claude-sonnet-4-6`; OpenAI uses `gpt-5.4-mini`; Gemini uses `gemini-2.5-flash`
   - **Vendor parameter divergence (TS-027)**: OpenAI uses `max_completion_tokens`; Anthropic + Google use `max_tokens`. Adjust accordingly.
   - **Model ID convention divergence (TS-028)**: Anthropic 4.6+ models drop date suffixes; older models retain them. Verify against live API docs.
4. **Smoke test**:
   ```bash
   pawn-substrate --test
   pawn-substrate "What is the LB membership cost?"  # canonical-class query
   ```
   Expected: real `request_id`, citations array (or vendor equivalent), correct LB-canonical answer.
5. **Update `feedback_no_ai_impersonation_ever.md`** if vendor capabilities differ — confirm the new vendor returns verifiable real-call metadata (request_id, citations, or equivalent).
6. **Log Toolsmith entry**: category `vendor_migration`, with the specific divergences you hit.
7. **Update Conductor's Baton rankings** ([platform/src/lib/conductor/rankings.ts](C:/Users/Administrator/Documents/LianaBanyanPlatform/platform/src/lib/conductor/rankings.ts)) — mark Perplexity as `unavailable`; auto-route to fallback vendor.

### Anthropic Claude (Bishop substrate / R13 Haiku-Opus baseline)

**Code path**: MCP server runs on Anthropic; cross-vendor benchmarks use direct Messages API
**API key location**: `DOUBLESECRET.env` — `ANTHROPIC_API_KEY`

**If Anthropic locks down:**

1. **Bishop substrate continues on substitute** — the substrate-injection pattern is vendor-agnostic. Migrate Bishop's chat substrate to OpenAI o4 / GPT-5.5 OR Google Gemini 2.5 Pro OR a local Ollama deployment.
2. **R-series benchmarks**: drop Anthropic columns from the active R-series, replicate findings on other vendors (R13 already proves 4-vendor parity).
3. **MCP-protocol consideration**: Model Context Protocol is open-spec; even if Anthropic deprecates their MCP SDK, the protocol persists. Other vendors are adopting MCP. (Layer 4 of the defense.)
4. **Re-run R-series on local Ollama** (Layer 6 fallback) — see K-future "Local-LLM Cathedral Effect Test" prompt.

### OpenAI / Google / other commercial vendors

Same pattern: acquire replacement key, modify call site, smoke-test, log Toolsmith, update Conductor's Baton rankings. The four cloud vendors are interchangeable at the architecture level (R13 proved this empirically). Migration cost is **hours**, not days — the architectural redundancy means the work is in the code-path swap, not the substrate redesign.

### All four cloud vendors lock down simultaneously

This is the "Layer 6 must hold" scenario. Do NOT panic. Steps:

1. **Confirm signal across all four** — distinguish from local network outage. If R13's `pawn_session_savings.py` or canonical health-checks return errors from all four vendor URLs, this is the layered-defense crisis case.
2. **Spin up Ollama on Founder's Pawn rig**:
   ```bash
   ollama pull llama3.3:70b-q4
   ollama serve  # default port 11434
   ```
3. **Modify `librarian-mcp/scripts/pawn_with_substrate.py`** to route to `http://localhost:11434/api/generate` with the substrate-injection pattern. The substrate is data; the LLM is transport. Pattern is identical.
4. **Re-validate substrate-injection signature**: run R13's K499 sealed bank against the local LLM, confirm lift signature is in the +80pp class (theoretical; needs empirical proof — see K-future prompt below).
5. **Public messaging activates**: this is the moment when keystone #42 ("You keep what you make") and the casual register ("It's your cheese") become the public claim. Members are not affected — substrate works on local LLMs, members keep their work-product, vendor lockout is *their* problem not *ours*.

---

## Cross-vendor model-ID reference table (B125 snapshot)

| Vendor | Cathedral-tier model | Cheap-tier model | Cost-per-HOT (R13) |
|---|---|---|---|
| Anthropic | `claude-opus-4-7` | `claude-haiku-4-5-20251001` | $0.3140 / $0.0145 |
| OpenAI | `gpt-5.5` | `gpt-5.4-mini` | $0.1080 / $0.0210 |
| Google | `gemini-2.5-pro` | `gemini-2.5-flash` | $0.0490 / $0.0040 |
| Perplexity | `sonar-pro` | (no cheap tier) | $0.0560 / — |
| Local | (Ollama: `llama3.3:70b-q4`, untested) | — | $0 (compute only) |

**Update on every R-series rerun.** This table is the canonical migration reference.

---

## Toolsmith cross-references

- TS-027 (K499): vendor parameter naming divergence (`max_completion_tokens` vs `max_tokens`)
- TS-028 (K499): vendor model-ID convention divergence (date suffix vs none)
- TS-035 (K506): MCP server token-overhead estimation (model-agnostic — survives vendor migration)
- TS-036 (K507): gitignore carve-out pattern (relevant when adding vendor-specific scripts)
- (To be added on first real migration): TS-K-NNN — first vendor-migration Toolsmith entry, with the specific divergences encountered.

---

---

## Public Demo Bring-Up (K512 — frame.lianabanyan.com)

**Production system #37.** The LB Frame Public Web Demo serves as the consumer ship-vehicle
for Substack / NYT op-eds. Any reader can verify the Cathedral Effect in 30 seconds.

### Where everything lives

| Thing | Location |
|---|---|
| Demo page (React) | `platform/src/pages/TestFrameDemo.tsx` |
| Edge function | `platform/supabase/functions/cathedral-demo/index.ts` |
| Migration (DB schema) | `platform/supabase/migrations/20260425220001_k512_cathedral_demo.sql` |
| Route registration | `platform/src/routes/public.tsx` (routes: `/demo`, `/frame`, `/try`) |
| API key (Anthropic) | Supabase Vault secret `ANTHROPIC_API_KEY` (set via Supabase dashboard → Functions → Secrets) |
| Spend-cap env var | `DEMO_DAILY_SPEND_CAP` (default `50` = $50/day; set in Supabase Functions Secrets) |
| Rate limit | 5 cathedral calls per IP per 24h (server-side, `demo_rate_limits` table) |

### Redeploy after code change

```powershell
# Rebuild + deploy hosting (same as all portal domains)
cd platform; npm run build
firebase deploy --only hosting:main -P default

# Redeploy edge function only (if only backend changed)
npx supabase functions deploy cathedral-demo --project-ref ruuxzilgmuwddcofqecc
```

### If the demo goes down

1. **Check Supabase dashboard** → Functions → cathedral-demo → Logs (look for `anthropic_api_error` or `anthropic_fetch_error`)
2. **Check spend cap**: query `SELECT * FROM demo_spend_tracking WHERE spend_date = CURRENT_DATE;`
   - If `estimated_usd_spend >= 50`, the kill switch fired. Raise `DEMO_DAILY_SPEND_CAP` if justified, or wait until midnight UTC.
3. **Fall back to pre-computed-only mode**: if Anthropic key is revoked/invalid, the edge function returns a graceful `demo_unavailable` message. Users are directed to the LB Test Frame extension. No stack trace, no key exposure.
4. **Verify ANTHROPIC_API_KEY is set**: Supabase dashboard → Project Settings → API → Edge Functions Secrets. Must be set as `ANTHROPIC_API_KEY` (not `ANTHROPIC_KEY` or similar).

### DNS setup for frame.lianabanyan.com

DNS provider: **Squarespace** (per `project_dns_provider_split.md`).

**Required**: add `frame.lianabanyan.com` as a custom domain on Firebase Hosting `hosting:main` target.

1. Firebase Console → Hosting → lianabanyan-main target → Add custom domain → `frame.lianabanyan.com`
2. Firebase provides a CNAME or A-record — add it at Squarespace DNS for `lianabanyan.com`:
   - Type: `CNAME`
   - Host: `frame`
   - Value: `lianabanyan-main.firebaseapp.com` (or whatever Firebase provides)
   - TTL: 3600
3. Firebase auto-provisions HTTPS cert (Let's Encrypt) — wait ~15 min for propagation.
4. Test: `curl -I https://frame.lianabanyan.com` — expect 200.

The SPA detects `window.location.hostname === 'frame.lianabanyan.com'` in `HomepageGateway`
and redirects `/` → `/demo` automatically. No separate build required.

### Founder live-test (the morning command)

1. Open `https://frame.lianabanyan.com` in Chrome (or `https://lianabanyan.com/demo` before DNS is live)
2. Click **"How much does a Liana Banyan membership cost per year?"**
3. Wait ~5 seconds
4. See the cold answer ("I'm not familiar with Liana Banyan's pricing…") vs. cathedral answer ("$5/year, identical for every member forever…")
5. Screenshot the side-by-side — this is the empirical anchor for the morning Substack / NYT op-ed
6. Expect: cold = MISS, cathedral = HOT, lift = +100 pp for this question

---

## What this runbook does NOT do

- **Member-facing substrate**: members run their own `librarian-mcp` install (Layer 5). Their substrate is local. A vendor lockout affecting LB does not affect member substrate; only their *answer-construction* layer is affected, and they fall to local-LLM the same way LB does.
- **Pledge / IP commitments**: keystone #40 and #2260 are vendor-neutral by design. Vendor lockout doesn't change LB's commitments to members. (This is the structural argument for the Pledge.)
- **R-series empirical claims**: R13's +86.2pp mean lift across 4 vendors is *evidence in the historical record*. A vendor lockout doesn't retract historical empirical findings. Future R-series re-runs will reflect the new vendor mix.

---

## Next-up hardening (still TODO)

Per the 7-layer-defense canon, items still theoretical:

1. **Layer 6 empirical proof** — Local-LLM Cathedral Effect test against R13's sealed bank (K511; see `BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K511_B125_LOCAL_LLM_CATHEDRAL_EFFECT_TEST.md`; gate cleared, hardware allocation pending)
2. **Multi-distribution-channel for librarian-mcp** — currently PyPI-only; conda-forge + Docker Hub + GitHub Releases binaries to harden Layer 5
3. **MCP-protocol-version pinning** — CI test against multiple MCP SDK versions
4. **Founder-controlled substrate mirror** — off-Founder-rig backup of canonical substrate (NAS / geographically-separated)

These are queued K-future tasks; this runbook is the vendor-API-tier piece of the defense, not the whole defense.

---

*Filed B125 per Founder direction. Layer 2 / Layer 3 migration is now documented before crisis. Long haul. Always.*

— Bishop B125
