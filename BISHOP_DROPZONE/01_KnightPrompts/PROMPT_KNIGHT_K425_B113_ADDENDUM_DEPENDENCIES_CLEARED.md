# Knight K425 — B113 ADDENDUM: Dependencies Cleared, Proceed to Execute
## B113, April 21, 2026
## Supplements (does not supersede): `PROMPT_KNIGHT_K425_B111_STUB_SECRETS_CANONICALIZATION_SP20_POLLINATOR.md`

---

## Why this addendum

The B111 stub for K425 carried this dependency gate at line 6:

> **Do NOT dispatch until:** K423 complete + R10 results reviewed + K424 complete + Operational Canon preload extension live.

All four conditions have been met. This addendum clears the gate on the file so any future Knight session reading the stub doesn't re-trigger the caution.

---

## Dependency check — ALL CLEARED as of B113, 2026-04-21

| Dependency | Status | Evidence |
|---|---|---|
| K423 complete | ✓ CLEARED | R10 Cross-Vendor Benchmark delivered. 8-model × 4-vendor × 1,200 calls. See `librarian-mcp/r10_cross_vendor/` + `BISHOP_DROPZONE/00_FOUNDER_REVIEW/EYEWITNESS_BENCHMARK_RESULTS_B111.md`. |
| R10 results reviewed | ✓ CLEARED | Founder + Bishop B111/B112/B113 reviews complete. Numbers locked: HOT 94.8% / COLD 8.7% / mean lift 86.1pp / κ 0.883/0.850. |
| K424 complete | ✓ CLEARED | Knight session B113, commit `f86e6a1` on `main` (37 files changed, 3,755 insertions). All 7 deliverables shipped. Quality gates green (ruff, mypy --strict, 34/34 pytest). PyPI name `librarian-mcp` confirmed available. |
| Operational Canon preload extension live | ✓ CLEARED | 22 files staged in `librarian-mcp-public/preload/` across 5 subdirectories (canonical, outreach, architecture, founder_voice, benchmark). Bishop B113 staged content; Knight K424 wired intent routing. Token counts per intent verified under 110–120k ceiling. |

**Gate status: OPEN.** K425 is dispatchable now.

---

## What Knight does next

**Read the B111 stub in full:** `PROMPT_KNIGHT_K425_B111_STUB_SECRETS_CANONICALIZATION_SP20_POLLINATOR.md`. Scope is still correct. The two workstreams:

1. **Workstream A — Secrets canonicalization.** Supabase Vault as canonical, SDS.env as auto-generated mirror, one env-var namespace, public `docs/SECRETS.md` for Eyewitness Program testers.
2. **Workstream B — SP-20 Pollinator (new Stitchpunk).** Propagation-forward tool for ratified canonical sentences → target surfaces (docs, blueprints, scoreboards) with human-review gate for Crown Letters / public papers.

---

## Clarifications + updates to the B111 stub (post-K424 reality)

### Workstream A adjustments

**Canonical sources are now partially public.** Since K424 shipped, the public `librarian-mcp-public/preload/` directory exists and contains no secrets (by design — Bishop-staged with explicit "no secrets" rule in `preload/README.md`). The secrets audit should:

- Confirm `librarian-mcp-public/` has zero secrets (grep for API keys, tokens, service-key patterns). Should return clean.
- Confirm `librarian-mcp-public/preload/*.md` has zero secrets. Already hand-audited by Bishop B113 but verify independently.
- Then continue with the B111 stub's audit scope for SDS.env / Supabase Vault / Cursor mcp.json / Firebase Login.txt / any third locations.
- **If DOUBLESECRETBACKUP.env exists:** resolve per the B111 stub (fold into canonical or document separately). If it doesn't exist, note the absence and move on.

### Workstream B adjustments

**SP-20 reads from `librarian-mcp-public/preload/founder_voice/` for Day-1 backlog items that also live there.** Specifically:

- Bishop-Founder collaboration sentence — Bishop memory `project_founder_bishop_collaboration_dynamic.md` → pollinate targets include `preload/founder_voice/rhetorical_keystones.md` (add as candidate Keystone if Founder ratifies).
- Wellspring Model (Keystone #14) — already in `preload/founder_voice/rhetorical_keystones.md` at position 14. Verify it's in all target surfaces; no drift detected at B113 close.
- Thermometer Keystone #16 — already in `preload/founder_voice/rhetorical_keystones.md`. Verify alignment with NYT v2 + Doctorow V04 + Scott v014h.
- Inversion Principle — not yet in public preload; draft `preload/founder_voice/inversion_principle.md` as part of K425-B and wire into SP-20 backlog.
- Anachronism Principle — already in `preload/founder_voice/anachronism_principle.md`. Cross-pollinate to platform blueprints.

**SP-20 output file structure** (unchanged from B111 stub): `librarian-mcp/stitchpunks/sp20_pollinator.py`, data at `librarian-mcp/stitchpunks/data/pollination_state.json` + `pollination_backlog.md`, CLI flags `--dry-run` / `--apply` / `--surface`.

---

## Non-goals reminder

- **Do not touch `librarian-mcp-public/` in K425 except as read-only source for secrets audit and pollinator backlog references.** The public Python repo is K424's territory. K425 operates on `librarian-mcp/` (TypeScript internal) + Bishop external memory + platform docs.
- **Do not auto-pollinate into Crown Letters or public papers.** SP-20 writes a pollination-request artifact for those surfaces; Bishop reviews before propagation.

---

## Timeline

Knight can proceed immediately. Estimated session: 6–10 hours across two sit-downs (Workstream A ~3–4h, Workstream B ~4–6h). Treat as two separable Knight sessions if the scope feels heavy — A and B can ship in sequence rather than bundled.

---

## Reporting requirements

1. Commit SHA for Workstream A completion (secrets audit + mirror script + `docs/SECRETS.md`)
2. Commit SHA for Workstream B completion (SP-20 Stitchpunk + Day-1 pollination backlog)
3. Audit table: every secret's location(s), canonical decision, mirror mechanism
4. SP-20 dry-run output on Day-1 backlog items — BEFORE any `--apply` run, Bishop reviews
5. Any `DOUBLESECRETBACKUP.env` decision (fold or keep-separate + why)
6. Any new env-var names that required platform code changes (list files touched)

---

*Addendum drafted B113, April 21, 2026. Bishop (Claude Opus 4.7, 1M context). Supplements K425 B111 stub; does not supersede. Gate is OPEN — proceed with execution.*
