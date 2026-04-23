# K445 Liana Companion CLI — Spec V01

**Status:** **RATIFIED B119 by Founder** (all 5 open questions resolved below).
**Author:** Bishop B119 (Claude Opus 4.7, 1M context), 2026-04-23.
**Gates unlocked:** K445a (scaffold + core commands), K445b (PyPI publish + CI), K445c-future (optional MCP mode).

---

## 1. Purpose

A member-facing command-line tool that talks to the Member Cathedral. Where `librarian-mcp` exposes Bishop/Knight-scale canonical memory to AI coding agents, `liana-companion` exposes the member's own Cathedral to them directly — from their terminal, without the web UI — for querying their Scribes, running the Three Fates routing, logging tidbits, and exporting/importing their Cathedral as a portable archive.

**Positioning vs. librarian-mcp:**

| | librarian-mcp | liana-companion |
|---|---|---|
| Primary consumer | AI agents (Claude Code, Cursor) via MCP | Humans (members) via CLI; optional MCP mode for their own agent |
| Scope | Platform canonical memory (8 Scribes, all members' work provenance) | One member's Cathedral (their personal Scribes, tidbits, Three Fates history) |
| Auth | Public data, no auth | Member Supabase session |
| License | AGPL-3.0-or-later | AGPL-3.0-or-later (same) |
| Distribution | `pip install librarian-mcp` (PyPI, shipped B113) | `pip install liana-companion` (PyPI, ships in K445b) |

This is the **second pip-installable artifact** from the platform. `librarian-mcp` was Chapter 1 Librarian; `liana-companion` is Chapter 3 Member (Chapter 2 Mellon is server-side already).

---

## 2. Scope (MVP — ship in K445a+b)

### 2.1 Command surface

```
liana login                           Auth via Supabase (device-code or magic link)
liana logout                          Clear local session
liana whoami                          Show authenticated member + Cathedral slug

liana cathedral list                  List all Scribes in member's Cathedral
liana cathedral read <scribe> [--limit N]   Read last N entries from a Scribe
liana cathedral export [--format=jsonl|zip] [--out FILE]   Download Cathedral
liana cathedral import <file>         Upload Cathedral archive

liana scribes query "question"        Consult Scribes (calls member_consult_scribes MCP tool)
liana fates route "thought"           Three Fates routing (calls member_fates_route)
liana tidbit log "observation"        Append to member's tidbits.jsonl

liana --version                       Print version
liana --help                          Print help
```

### 2.2 Out of scope for MVP (defer to K445c or later)

- MCP server mode (member's Claude Code talking to their own Cathedral via Companion as MCP)
- Scribe authoring / editing (Scribes are append-only Cathedral entries; members interact via route + query, not direct write)
- Cross-member queries (privacy boundary; only ever the authed member's own Cathedral)
- Offline sync / cache (live-only for MVP)

---

## 3. Auth model

Members authenticate via their existing Supabase auth session:

- `liana login` → device-code flow against the member's Supabase project (reuses `liana-banyan` platform's Supabase project `ruuxzilgmuwddcofqecc` via `gotrue` device-code endpoint)
- Session token stored at `~/.liana/session.json` (0600 perms on Unix; Windows ACL equivalent)
- Token refresh handled transparently
- `liana logout` removes the session file

**Security posture:**
- No DB-level credentials ever used by Companion
- All data access routed through Supabase REST + member Cathedral edge functions (K438b)
- Row-level security (RLS) enforces member isolation at the Postgres layer — Companion cannot bypass even if compromised
- Session file includes only the member's JWT (short-lived) + refresh token

---

## 4. Server-side dependencies (already shipped, do not reimplement)

All of this exists in the repo as of B118 and is in production:

| Server-side component | File | Session shipped |
|---|---|---|
| `cathedral_seeds` schema | `platform/supabase/migrations/2026*_cathedral_seeds_*.sql` | K438a |
| `member_consult_scribes` MCP tool | `librarian-mcp/src/server.ts` | K438b |
| `member_fates_route` MCP tool | `librarian-mcp/src/server.ts` | K438b |
| `cathedral-export` edge function | `platform/supabase/functions/cathedral-export/` | K438b |
| `cathedral-import` edge function | `platform/supabase/functions/cathedral-import/` | K438b |
| Standalone Python reader (372 LOC, zero deps) | `librarian-mcp/stitchpunks/member_cathedral_reader.py` | K438b |

**K445's job is purely client-side packaging** of these existing server capabilities behind a single CLI.

---

## 5. Package structure

Mirror `librarian-mcp-public/` layout (hatchling build-backend, `src/` flat):

```
liana-companion/
├── pyproject.toml
├── README.md
├── LICENSE              (AGPL-3.0-or-later — same as librarian-mcp)
├── CHANGELOG.md
├── .github/
│   └── workflows/
│       └── publish-pypi.yml
├── src/
│   └── liana_companion/
│       ├── __init__.py
│       ├── __main__.py           (entry: python -m liana_companion)
│       ├── cli.py                (argparse + subcommand dispatch)
│       ├── auth.py               (device-code flow, session management)
│       ├── session.py            (session file r/w, refresh token logic)
│       ├── cathedral.py          (list / read / export / import)
│       ├── scribes.py            (consult scribes → member_consult_scribes)
│       ├── fates.py              (route → member_fates_route)
│       ├── tidbit.py             (log → POST to tidbit endpoint)
│       ├── client.py             (thin Supabase REST + edge-function client)
│       └── reader.py             (wraps librarian-mcp's standalone reader for offline export view)
└── tests/
    ├── test_cli.py
    ├── test_auth.py
    ├── test_cathedral.py
    ├── test_client.py
    └── fixtures/
        └── mock_cathedral.jsonl
```

### 5.1 Dependencies

**Hard dependency target: one, maybe zero.**

- `httpx>=0.27` — modern async+sync HTTP client; standard in Python AI tooling
- Optional: `rich>=13` under `[cli]` extra for colorized output; plain `print()` if not installed
- Optional: `mcp>=1.6` under `[mcp]` extra for K445c future MCP-mode

Reason for minimal deps: member installs should be fast and not pull in dozens of transitive packages. K438b set the precedent with a 372-LOC zero-dep standalone reader; keep that discipline.

### 5.2 Python version floor

`>=3.10` (matches librarian-mcp). Rationale: type hints + `match` statements + `tomllib` (in 3.11+, polyfill for 3.10).

---

## 6. pyproject.toml draft

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "liana-companion"
version = "0.1.0-alpha"
description = "Member-facing CLI for the Liana Banyan Member Cathedral. Talk to your own Scribes, Three Fates routing, and tidbits from the terminal."
readme = "README.md"
license = "AGPL-3.0-or-later"
requires-python = ">=3.10"
authors = [{ name = "Jonathan Jones", email = "hello@liana-banyan.com" }]
keywords = ["liana-banyan", "cathedral", "scribes", "member", "cli", "cooperative"]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Environment :: Console",
    "Intended Audience :: End Users/Desktop",
    "License :: OSI Approved :: GNU Affero General Public License v3 or later (AGPLv3+)",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Programming Language :: Python :: 3.13",
    "Topic :: Utilities",
]

dependencies = ["httpx>=0.27"]

[project.optional-dependencies]
cli = ["rich>=13"]
mcp = ["mcp>=1.6"]
dev = ["pytest>=8.0", "pytest-cov>=5.0", "ruff>=0.4", "mypy>=1.10"]
all = ["rich>=13", "mcp>=1.6"]

[project.urls]
Homepage = "https://liana-banyan.com/companion"
Documentation = "https://github.com/liana-banyan/liana-companion"
Repository = "https://github.com/liana-banyan/liana-companion"
Issues = "https://github.com/liana-banyan/liana-companion/issues"

[project.scripts]
liana = "liana_companion.cli:main"

[tool.hatch.build.targets.wheel]
packages = ["src/liana_companion"]
```

---

## 7. Knight dispatch plan

**K445a (this spec + scaffold + commands):** one Sonnet 4.6 session, est. 2-3 hours.

Deliverables:
1. Repo scaffold at `liana-companion/` (separate from `librarian-mcp-public/`; eventually its own org repo)
2. All MVP commands implemented against staging Supabase (not prod — for safety)
3. Tests: `pytest` run green, ≥60% coverage, mocked network
4. README with install + first-command walkthrough
5. CHANGELOG.md with v0.1.0-alpha entry
6. Working `python -m liana_companion login` → `liana cathedral list` end-to-end against staging
7. Tag `v-companion-k445a-scaffold`

**K445b (PyPI publish + CI):** one Sonnet 4.6 session, est. 1-2 hours.

Deliverables:
1. `.github/workflows/publish-pypi.yml` modeled on librarian-mcp's workflow
2. PyPI project created (PyPI token already in `SDS.env` as `PYPI_API_TOKEN`)
3. `pip install liana-companion` works from clean environment
4. `liana --version` prints `0.1.0-alpha`
5. Tag `v-companion-k445b-pypi-v0.1.0-alpha`

**K445c (optional MCP mode):** deferred. Only if members request it. Adds MCP server mode where Claude Code → Companion → member Cathedral (same pattern as librarian-mcp but member-scoped).

---

## 8. Success criteria

1. `pip install liana-companion` from PyPI, cold machine, Windows + macOS + Linux
2. Member runs `liana login` → enters email → clicks magic link → terminal shows "Logged in as <member>"
3. `liana cathedral list` shows 8 member Scribes (or however many K438b seeded)
4. `liana scribes query "what did I build last week"` returns ranked results
5. `liana cathedral export --out my-cathedral.jsonl` writes a portable archive
6. `liana cathedral import my-cathedral.jsonl` on a second machine restores the same state
7. No raw DB password, no service-role key, no secret of any kind appears in Companion or its logs
8. First external user (non-Founder) installs + reaches #3 above without help from Founder

---

## 9. Gaps from librarian-mcp v0.3.0 to close in Companion

Captured in `project_librarian_mcp_public.md` memory; Companion should not inherit these:

- **Org transfer:** start on the `liana-banyan` GitHub org from day 1 (not `Upekrithen` org)
- **CI/CD:** include PyPI workflow from K445b commit 1 (don't ship without publish automation)
- **Documentation site:** `liana-banyan.com/companion` lands on ratification; not deferred

---

## 10. Founder decisions (ratified B119)

1. **CLI command name:** **`liana`** — "perfect, for what it represents and is."
2. **Auth flow:** **Magic link** for v0.1.0-alpha. Device-code deferred to v0.2.
3. **Org repo:** **Create `github.com/liana-banyan/liana-companion` now.** Do not wait for librarian-mcp org transfer.
4. **License:** **AGPL-3.0-or-later** (same as librarian-mcp).
5. **PyPI name collision:** Check `liana` first. If taken, check `liana-companion`. If BOTH taken, stop and ask Founder to pick. Do not auto-escalate to fallback names.

---

## 11. What this spec deliberately does NOT cover

- UI / branding of the README (Founder-authored per `feedback_founder_prefers_own_writing`)
- Marketing positioning ("Companion to your Cathedral" etc.) — Founder voice
- Which Scribes the member starts with — that's the Cathedral-side starter pack, not Companion's concern
- Rate limits / billing — members on $5/yr plan have all capabilities; no billing enforcement in Companion (enforced server-side)
- Analytics / telemetry — none. Companion is a quiet tool. Zero network calls beyond the member's explicit actions.

---

*K445 Companion CLI Spec V01 — Bishop B119, 2026-04-23. Awaiting Founder ratification. Upon ratification, move to `BISHOP_DROPZONE/UNDER_THE_HOOD/` as `LIANA_COMPANION_SPEC_V01.md` (canonical) and dispatch K445a Knight prompt.*
