---
inventory: BP081_FOUNDER_SMOKE_FINDINGS_v0_1_55
composed_at: 2026-06-12
composed_by: Bishop (Founder direct report)
source: Founder physical install + smoke-walk via flash drive on 2 LAN machines
purpose: capture v0.1.55 runtime findings for v0.1.56–v0.1.60 scope refinement
status: ACTIVE — feeds Knight v0.1.56 wave
---

# v0.1.55 Founder Smoke Findings · BP081

## §1 GREEN findings

- **LAN auto-discovery works across 4 machines** — federation transport landed. Each machine sees the others without manual configuration.
- **NSIS LAN binding works on M0** (admin install path) — `0.0.0.0:11434` bound at install time.
- **Pre-release URL reachable** — staging download path confirmed working.

## §2 RED findings — CRITICAL P0 for v0.1.56

### Finding R-1: LEAN Ask broken on flash-drive installs even though Gemma 4 12B IS on those machines

**Symptom:** On 2 LAN machines where Founder manually flash-drive-installed v0.1.55, LEAN Ask does not work.

**Critical detail:** Those machines DO have Gemma 4 12B already pulled in their local Ollama. v0.1.55 is NOT detecting the existing model.

**Implication:** SEG-1's OllamaManager singleton refactor fixed the *internal-multiple-instances* problem at the code layer — but the *runtime model-detection* problem is independent and still broken. The singleton looks for a default model name string, may not match what `ollama list` actually returns on those machines (tag mismatch? namespace mismatch? `gemma2:12b` vs `gemma4:12b` vs `gemma:12b`?).

**Hypothesis for Knight to verify:**
- Singleton hard-codes a model identifier that doesn't match what's on disk
- `ollama list` parse path fails silently → status shows "no model" → Ask refuses
- OR: connectivity to local Ollama fails (port/host mismatch) — but if LAN discovery works, that's less likely
- OR: model-pull-on-demand fires uselessly because detection failed

**Required Knight action (P0 v0.1.56):** model-detection must enumerate `ollama list` and match by family ("gemma" prefix, any major version 2/3/4, any tag 12b/13b) — not by exact tag string. If a compatible model is present, use it. Only pull if NOTHING compatible is present.

## §3 Founder velocity statement

> *"We just need to get to .1.60 AS SOON AS POSSIBLE."*

Translates to: collapse the v0.1.56 → v0.1.60 ladder timeline. Coffee §5 queue holds but cadence accelerates. Knight should be biased toward shipping smaller, faster v0.1.X bumps rather than batching.

## §4 What this means for v0.1.55 SHIP decision

Open question for Founder: do we SHIP v0.1.55 to Latest given that Ask is broken on machines with pre-existing Ollama+Gemma?

**Bishop recommendation:**
- M0 was admin-install + fresh Ollama path — likely works there
- The 2 flash-drive machines hit the model-detection bug
- If M0 + M1 (wife's) are GREEN, v0.1.55 is a defensible release for FRESH-install users; existing-Ollama users will still hit R-1 until v0.1.56
- Alternative: hold v0.1.55 at staging URL, push hard to v0.1.56 within 24h, ship v0.1.56 as Latest

Founder ratifies the path. Bishop stages both options.

## §5 Carry-forward to v0.1.56 Knight Yoke

- R-1 fix as P0 SEG (model-detection family-match)
- COMMUNITY-CONNECT invite-token availability feature (separate spec at `BP081_FEATURE_SPEC_INVITE_TOKEN_AVAILABILITY_TAB.md`)
- Substrate-accumulator audit gap-matrix items per `BP081_SUBSTRATE_ACCUMULATOR_AUDIT.md`
- Gemma 4 12B progressive auto-pull (already in Coffee §5 v0.1.56 scope)
