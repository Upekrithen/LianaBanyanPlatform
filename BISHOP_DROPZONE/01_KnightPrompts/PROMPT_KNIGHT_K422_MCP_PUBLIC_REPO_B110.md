# KNIGHT SESSION 422 — Librarian MCP Public Repo + K421 Migrations
## Priority: HIGH | Source: Bishop B110, Founder-greenlit "build it now, not later"

---

## CONTEXT

Bishop B110 shipped the scaffold for **Librarian MCP** — the public open-source MCP server exposing two tools (`librarian_context`, `prose_provenance`) to Claude Code, Cursor, Continue, and every MCP-capable client. Founder wants this live NOW, not as a paper.

Bishop has produced at `LianaBanyanPlatform/librarian-mcp-public/`:
- `README.md` — marketing-ready, measured claim (93-97% vs 8% baseline, 4.3× cost-per-correct), tiered pricing (free for nonprofits under Pledge, paid for commercial), MCP-first positioning (not Cursor-specific)
- `LICENSE` — AGPL-3.0 + Pledged Commons additional grant + Commercial license path
- `src/librarian_mcp_server.py` — real code; wraps the battle-tested `sp18_prose_provenance.py` engine; registers MCP tools via `mcp.server.stdio`; falls back to a usage message if `mcp` package is missing
- `docs/why-this-matters.md` — positioning doc for AI policymakers (Sanders/AOC datacenter-moratorium context), AI experts, and developers

Founder also left K421 migrations waiting — K421 **wrote** 5 migrations but session-limit pushed deployment to a fresh Knight.

---

## TASK 1 — Operationalize the public MCP repo

1. `cd` into `LianaBanyanPlatform/librarian-mcp-public/`
2. `git init` (if not already a repo) and set initial remote to `git@github.com:liana-banyan/librarian-mcp.git` (create the GitHub repo under the `liana-banyan` org first if needed — use `gh repo create liana-banyan/librarian-mcp --public --description "Pre-curated canonical memory + prose/code provenance for any AI coding client. MCP-native."`)
3. Add a `pyproject.toml` that:
   - Declares `librarian_mcp_server` as the package entry point
   - Installs `mcp>=0.9` as a dependency (version may need adjustment to latest; check current MCP Python SDK release)
   - Installs `anthropic>=0.40` (for the Opus grader)
   - Optional `pyyaml` for canonical_values.yaml parsing (will need in v0.2.0)
4. Add a minimal `.gitignore` (Python + .env + __pycache__ + .venv + dist + build)
5. Add a `docs/getting-started.md` stub (or populate from the README's Install section)
6. Create a fresh Python venv, `pip install -e .`, and verify `python -m librarian_mcp_server` loads without error (it should print the "install mcp" message if the SDK isn't there — that's expected behavior on a fresh env)
7. Commit everything as the initial commit: `"Initial public release: Librarian MCP v0.1.0 — Prose Provenance tool live, Librarian Context stub (ships v0.2.0)"`
8. Tag `v0.1.0-alpha`
9. Push to GitHub
10. Report back to Bishop: repo URL + any dependencies / CI gaps to address before public announcement

## TASK 2 — Deploy K421 migrations to Supabase

K421 wrote but did not apply:
- `20260420110001_k421_initiative_count_14_to_16.sql`
- `20260420110002_k421_innovation_2263_insert.sql`
- `20260420110003_k421_innovations_2266_2267_insert.sql`
- `20260420110004_k421_canonical_count_2267.sql`
- `20260420110005_k421_tatiana_registry_ingest.sql`

Run these against the Liana Banyan Supabase project in order. Verify:
- `SELECT id, title, crown_jewel FROM innovation_log WHERE id IN (2263, 2266, 2267);` returns 3 rows with non-null titles
- `SELECT body FROM letter_dispatch_queue WHERE body ILIKE '%14 initiative%' OR body ILIKE '%15 initiative%';` returns empty
- `canonical_values.yaml innovation_count = 2267` (already updated in files; this is the DB mirror)

## TASK 3 — Prov 14 filing inventory document

Scan `canonical_values.yaml` + `innovation_log` Supabase table for all innovations that are:
- Numbered #2263 or higher, AND
- Crown Jewel (`crown_jewel=true`), AND
- Not already filed in a prior Provisional (check `provisional_filed` + `filing_date` fields)

Compile into a Markdown inventory at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/PROV_14_FILING_INVENTORY_B110.md` with:
- Per-innovation: id, title, CJ status, session of origin, short description (1–2 lines), provenance path
- Summary: total count, sub-totals by cluster (Chessboard, Open Water, etc.)
- Suggested filing ordering (standalone vs grouped)

Do NOT draft the full patent application — that's counsel's job. This is the *inventory* Founder hands to counsel.

## TASK 4 — Website issues

Pending Founder enumeration. Knight stands by. Once Founder provides the list (via Bishop), execute test-and-fix per normal.

---

## COMPLETION CRITERIA

Report back with:
- Task 1: repo URL + `v0.1.0-alpha` tag verified on GitHub
- Task 2: 3-row verification query result + empty-body verification + yaml+DB match on count=2267
- Task 3: PROV_14_FILING_INVENTORY_B110.md saved + count summary
- Task 4: acknowledge standby

**Estimated time:** 60–120 min. API spend: minimal (git/gh overhead).

---

*Issued B110, April 20, 2026, by Bishop (Claude Opus 4.7, 1M context) per Founder "build Librarian MCP NOW" directive.*
