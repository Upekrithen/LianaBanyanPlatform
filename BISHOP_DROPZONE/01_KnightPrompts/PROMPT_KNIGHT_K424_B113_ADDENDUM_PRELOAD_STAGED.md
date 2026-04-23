# Knight K424 — B113 ADDENDUM: Preload Staged, Repo Disambiguation, Path Forward
## B113, April 21, 2026
## Supplements (does not supersede): `PROMPT_KNIGHT_K424_B112_LIBRARIAN_V020_DISPATCH.md`

---

## Why this addendum

Knight K424 correctly paused in Plan mode after surfacing two blockers:

1. **Repo ambiguity.** Knight explored `LianaBanyanPlatform/librarian-mcp/` (TypeScript internal, ~37 tools, daily-use Bishop tool) and concluded the K424 B112 dispatch was architecturally mismatched (calls for Python + PyPI, but the TS repo is Node + npm).

2. **Content gap.** The Operational Canon preload extension referenced files that aren't in Knight's workspace (they live in Bishop's external memory at `~/.claude/projects/` or in gitignored directories).

Both blockers are real. B112 Bishop (who wrote the original dispatch) didn't disambiguate repo targets and assumed Knight would have preload content access. This addendum resolves both.

---

## Resolution 1 — Repo disambiguation

**K424 targets `LianaBanyanPlatform/librarian-mcp-public/`, NOT `LianaBanyanPlatform/librarian-mcp/`.**

| Repo | Stack | Purpose | K424 involvement |
|---|---|---|---|
| `librarian-mcp/` | TypeScript / Node | **Internal Bishop tool.** 37-tool suite, scrambler/touchstone/stitchpunks/r10_cross_vendor subsystems, daily-use via MCP. Gitignored. | **DO NOT TOUCH.** Stays as-is. |
| `librarian-mcp-public/` | **Python** / FastMCP | Public pip-installable v0.1.0-alpha → v0.2.0. Already shipped at `github.com/Upekrithen/librarian-mcp`. | **THIS IS K424's REPO.** |

The B112 dispatch's Python + PyPI + ruff + mypy + pytest + hatchling language is correct — for `librarian-mcp-public/`. Knight's confusion was reasonable: the two repos have confusingly similar names. The addendum locks the target.

**Knight action:** `cd librarian-mcp-public/` and work entirely inside that directory. Do not modify anything in `librarian-mcp/`.

---

## Resolution 2 — Preload content staged at `librarian-mcp-public/preload/`

Bishop (B113) has staged the full preload directory Knight needed. Structure:

```
librarian-mcp-public/preload/
├── README.md                              # Directory map + intent→file mapping
├── r9v2_base.md                           # Base preload (ALWAYS included)
├── canonical/
│   ├── canonical_values.yaml
│   └── canonical_laws_and_frameworks.md
├── outreach/
│   ├── opening_gambit_v2.md
│   ├── letter_dispatch_queue_summary_STUB.md   # Knight populates via Supabase query
│   ├── cephas_registry.md
│   ├── glass_door_protocol.md
│   └── witness_program.md
├── architecture/
│   ├── pledge_structure.md
│   ├── medallion_sponsorship.md
│   ├── ip_load_balancing.md
│   └── pedestal_stake.md
├── founder_voice/
│   ├── rhetorical_keystones.md
│   ├── pine_books_anchor.md
│   ├── anachronism_principle.md
│   ├── cloyd_pattern.md
│   └── three_clock_timeline.md
└── benchmark/
    ├── eyewitness_results_b111.md
    ├── r9_technical_brief.md
    ├── 75q_bank_overview.md
    ├── grading_rubric.md
    └── posture_disclosure.md
```

**Read `librarian-mcp-public/preload/README.md` first** — it contains the intent-to-directory mapping Knight needs to implement `librarian_context(intent=...)`.

---

## Clarifications on the B112 dispatch (resolved by this addendum)

### Deliverable 1 — `librarian_context` v0.2.0

**Intent-to-directory mapping** (specified in `preload/README.md`, reproduced here):

| Intent | Always includes | Notes |
|---|---|---|
| `""` (empty / default) | `r9v2_base.md` | ~4,500 tokens, base preload only |
| `"canonical"` | `r9v2_base.md` + `canonical/*` | adds canonical_values.yaml + canonical_laws |
| `"outreach"` | `r9v2_base.md` + `canonical/*` + `outreach/*` | adds Opening Gambit + letter queue + Cephas + Glass Door + Witness |
| `"architecture"` | `r9v2_base.md` + `canonical/*` + `architecture/*` | adds Pledge + Medallion + IP split + Pedestal |
| `"founder_voice"` | `r9v2_base.md` + `founder_voice/*` | adds Keystones + Pine Books + Anachronism + Cloyd + Three-clock timeline |
| `"benchmark"` | `r9v2_base.md` + `benchmark/*` | adds R10 results + R9 brief + 75q overview + rubric + posture disclosure |
| `"operational"` | shorthand for `["outreach", "canonical"]` | (union, dedup) |

Lists: union of per-intent files, deduplicated. Priority order for truncation: `r9v2_base.md` > `canonical/` > intent-matched > remaining.

### Deliverable 2 — Operational Canon preload extension

**Already staged by Bishop.** Knight does NOT need to gather content. Knight IMPLEMENTS the `librarian_context` function that reads the files and returns them per the intent mapping.

One exception: `outreach/letter_dispatch_queue_summary_STUB.md` is a stub. Knight populates it at build time via the Supabase query documented inside the stub. Rebuild cadence: nightly, or per release tag.

### Deliverable 3 — `librarian_metrics`

No change from B112 dispatch. Local JSONL at `~/.librarian-mcp/metrics.jsonl`, opt-in share (default OFF, POST path deferred to K425 or later Knight).

### Deliverable 4 — `pyproject.toml`

**Already exists** in `librarian-mcp-public/pyproject.toml` (v0.1.0-alpha). Knight upgrades it to v0.2.0 per B112 spec.

- Target package name: `librarian-mcp` (check PyPI availability first; fallback `liana-banyan-librarian-mcp`)
- Add deps: `tiktoken` (for token counting), keep `mcp>=1.0`, `anthropic`
- Dev deps: `pytest`, `ruff`, `mypy`
- Build: `hatchling`
- Entry point: `librarian-mcp = "librarian_mcp.cli:main"` — note: this requires creating a `cli.py` module; currently `__main__.py` handles startup. Suggest keeping `__main__.py` for `python -m librarian_mcp` and adding a thin `cli.py` wrapper for the console script.

### Deliverable 5, 6, 7 — CI / Publish / Org transfer

No change from B112. Stage, do not execute.

---

## Revised acceptance criteria

All B112 acceptance criteria STAND, with these clarifications:

- [ ] `librarian_context()` reads from `preload/` directory (not from external memory)
- [ ] `librarian_context(intent="outreach")` returns `r9v2_base.md` + `canonical/*` + `outreach/*`, deduplicated
- [ ] `librarian_context(intent=["benchmark", "founder_voice"])` returns union, deduplicated, truncated if > max_tokens with `truncation_note` populated
- [ ] Token counts for each intent are within the ~110–120k target ceiling; document actual counts in K424 closeout report
- [ ] `outreach/letter_dispatch_queue_summary_STUB.md` is replaced by a live-queried snapshot at build time OR Knight documents the deferred implementation clearly in the CHANGELOG

---

## Known gaps / follow-up questions for Bishop

Knight may encounter these; escalate rather than guess:

1. **`cli.py` module structure.** The B112 entry-point spec implies a CLI beyond just `python -m librarian_mcp`. If the CLI requires flags (e.g. `librarian-mcp serve --port 8080`), that spec is under-specified — Knight should draft a minimal CLI surface and flag for Bishop review rather than invent one.

2. **Medallion sponsorship file.** The staged file is Pudding #76 (biographical / narrative). A more structured "mechanism one-pager" could be stronger for `intent="architecture"`. Knight proceeds with the Pudding as-is for K424; a follow-up Bishop task can draft a stricter one-pager if needed.

3. **Three-clock timeline.** File is new (Bishop B113 synthesis). Has not been Founder-ratified. Knight ships as-is; Founder review can revise post-K424.

4. **Org transfer conditional.** If `github.com/liana-banyan/` does not exist at K424 execution time, Knight skips the transfer step, documents the blocker, and flags for K425 or follow-up.

---

## Timeline

Knight can proceed IMMEDIATELY with K424 against the `librarian-mcp-public/` repo and the staged `preload/` directory. No further Bishop staging needed unless Knight hits one of the escalation items above.

Estimated session: 4–6 hours (B112 estimate stands).

---

*Addendum drafted B113, April 21, 2026. Bishop (Claude Opus 4.7, 1M context). Supplements K424 B112 dispatch; does not supersede.*
