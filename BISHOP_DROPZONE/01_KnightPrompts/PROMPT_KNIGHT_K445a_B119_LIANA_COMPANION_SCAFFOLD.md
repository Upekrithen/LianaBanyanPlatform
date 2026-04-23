---
knight_session: K445a
bishop_session: B119
bridle_version: 10
status: READY TO DISPATCH (spec ratified B119)
predecessor_gate: K451 baseline (v-migration-baseline-K451, eec98a7) ✓; K438b Member Cathedral substrate ✓
target_tag: v-liana-companion-k445a-scaffold
task_class: new Python package scaffold + core member-facing CLI commands
estimated_model: Sonnet 4.6
scope_size: medium-large (single-session, 3-4 hours)
---

**THE BRIDLE — read this before you respond. Follow all ten rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.
10. **MCP tooling discipline.** Always use `npm run build-guarded` (not raw `npm run build`) when modifying `librarian-mcp/src/`. Always use `npm start` (not raw `node dist/server.js`) to run the MCP server. The guard emits structured `server_rebuilding` errors during build windows; the supervisor auto-restarts on silent crash. Bypassing either returns us to the pre-K448 / pre-K449 silent-hang regime.

**End of BRIDLE. Task follows.**

---

## Canonical source

Full spec at `BISHOP_DROPZONE/00_FOUNDER_APPROVED/K445_COMPANION_CLI_SPEC_V01_B119.md`. Read the entire spec before writing a line of code. Everything in this prompt is a subset of that spec.

## Ratified decisions (non-negotiable)

| Decision | Value |
|---|---|
| CLI command name | **`liana`** |
| Package name (PyPI) | **`liana-companion`** (if taken, use `liana` as binary on a different package name — see below) |
| Auth flow | **Magic link** (Supabase gotrue email-OTP) |
| License | **AGPL-3.0-or-later** |
| Org repo | **github.com/liana-banyan/liana-companion** (create during this session) |
| Python minimum | `>=3.10` |

## PyPI name-collision protocol (ratified)

1. Try `pip index versions liana` — if NOT found, register `liana` as the package.
2. If `liana` taken, try `pip index versions liana-companion` — if NOT found, register `liana-companion`.
3. If BOTH taken: **STOP and file a BRIDLE Rule 3 clarifying question to Founder with the owners/versions of each conflict.** Do NOT auto-pick a fallback.

## Scope (K445a — scaffold + core commands)

### Phase 1 — Repo scaffold

Create a new top-level directory `liana-companion/` in the monorepo (sibling of `librarian-mcp-public/`). This is the LOCAL working copy of what will push to `github.com/liana-banyan/liana-companion`. Structure exactly per spec Section 5:

```
liana-companion/
├── pyproject.toml         (from spec Section 6 draft — modify only if PyPI name changes)
├── README.md              (placeholder — Founder will author later per feedback_founder_prefers_own_writing)
├── LICENSE                (AGPL-3.0-or-later — copy the exact license text)
├── CHANGELOG.md           (v0.1.0-alpha initial entry)
├── .github/workflows/publish-pypi.yml   (K445b lands the full publish workflow; K445a stubs with a skeleton)
├── src/liana_companion/
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py             (argparse dispatch; every subcommand wired)
│   ├── auth.py            (magic-link flow)
│   ├── session.py         (~/.liana/session.json r/w + refresh)
│   ├── cathedral.py       (list / read / export / import)
│   ├── scribes.py         (consult-scribes → member_consult_scribes MCP)
│   ├── fates.py           (route → member_fates_route MCP)
│   ├── tidbit.py          (log → tidbit endpoint)
│   ├── client.py          (thin Supabase REST + edge-function client, httpx-based)
│   └── reader.py          (wraps librarian-mcp/stitchpunks/member_cathedral_reader.py for offline export view)
└── tests/
    ├── test_cli.py
    ├── test_auth.py
    ├── test_cathedral.py
    ├── test_client.py
    └── fixtures/
        └── mock_cathedral.jsonl
```

Add `liana-companion/` to the monorepo `.gitignore`? **NO** — unlike `librarian-mcp-public/` (which has its own `.git` and is gitignored), `liana-companion/` lives in the monorepo initially. Once we push to `github.com/liana-banyan/liana-companion`, we convert it to a separate clone (same pattern as librarian-mcp-public) and gitignore it. That transition is K445b scope, not K445a.

### Phase 2 — Core dependencies

`pyproject.toml` per spec Section 6. Hard dependency: **`httpx>=0.27`** only. `rich>=13` and `mcp>=1.6` go under optional extras (`[cli]`, `[mcp]`).

Use **hatchling** build-backend (matches librarian-mcp).

### Phase 3 — Auth: magic link flow

`auth.py`:
- `liana login` → prompts for email → calls Supabase gotrue `POST /auth/v1/otp` with `{ email, create_user: false, options: { email_redirect_to: "https://liana-banyan.com/auth/terminal" } }` → tells user "Check your email for the magic link. Click it, then return here and run `liana login --resume`."
- `liana login --resume` → polls Supabase `/auth/v1/user` with a temporary token → if authenticated, writes session JSON
- Session file: `~/.liana/session.json` (Windows: `%USERPROFILE%\.liana\session.json`). Create directory with `0700` perms on Unix, Windows ACL equivalent.
- Refresh token logic: transparent. `liana whoami` triggers refresh if access token < 60s from expiry.
- `liana logout` → deletes session file.

**Supabase config for Companion:**
- URL: `https://ruuxzilgmuwddcofqecc.supabase.co` (hardcoded in `client.py`)
- Anon key: use the `SUPABASE_ANON_KEY` value from `SDS.env` (do NOT hardcode the JWT — bake a fetch-from-env pattern so the key can rotate without code change)

### Phase 4 — Core commands

All per spec Section 2.1:

```
liana login / login --resume / logout / whoami
liana cathedral list / read <scribe> / export / import
liana scribes query "<text>"
liana fates route "<text>"
liana tidbit log "<text>"
liana --version / --help
```

Server-side surfaces to call (all exist as of K438b):
- `member_consult_scribes` MCP tool (via Supabase PostgREST or direct MCP HTTP bridge — pick defensibly; spec doesn't dictate)
- `member_fates_route` MCP tool
- `cathedral-export` edge function: `POST https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/cathedral-export`
- `cathedral-import` edge function: `POST https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/cathedral-import`

For `tidbit log` — there is no dedicated public tidbit endpoint yet (`mcp__librarian__log_tidbit` is a MCP-scoped tool). K445a punts: log locally to `~/.liana/tidbits.jsonl` with a `// TODO(K445b): wire to server-side tidbit endpoint` comment, and document in the CLI help text that tidbits are local-only for v0.1.0-alpha.

### Phase 5 — Tests

`pytest` suite targeting ≥60% coverage. Mock `httpx` calls with `respx` or `httpx_mock`. Fixtures in `tests/fixtures/`. No real network calls in CI.

One **integration** test (marked `@pytest.mark.integration`, skipped by default) that exercises `liana login` against a real Supabase dev project. Document how to run it in `tests/README.md`.

### Phase 6 — End-to-end smoke

Run locally:
```
cd liana-companion
python -m pip install -e .
liana --version       # should print 0.1.0-alpha
liana --help          # should list all subcommands
```

Capture the output in the handoff report.

### Phase 7 — Tag + handoff

Tag `v-liana-companion-k445a-scaffold` on the commit. Handoff report at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K445a_B119_LIANA_COMPANION_SCAFFOLD.md`.

## Non-goals (do not do in K445a)

- Do NOT publish to PyPI. That's K445b.
- Do NOT build MCP server mode for Companion. That's K445c-future.
- Do NOT touch `librarian-mcp/` or `librarian-mcp-public/`. Companion is a new package; don't modify the existing one.
- Do NOT create the GitHub org repo via API. Founder creates the remote by hand; local repo initializes, first push lands in K445b.
- Do NOT write README marketing copy. Placeholder stub only — Founder authors final per `feedback_founder_prefers_own_writing`.
- Do NOT ship a `tidbit log` that posts anywhere. Local-only for v0.1.0-alpha.

## Deliverables checklist

| # | Deliverable | Gate |
|---|---|---|
| 1 | `liana-companion/` directory scaffolded per spec Section 5 | Phase 1 |
| 2 | `pyproject.toml` with correct package name (collision-check first) | Phase 2 |
| 3 | Magic-link auth flow (`login`, `login --resume`, `logout`) working against real Supabase | Phase 3 |
| 4 | All 9 commands from spec Section 2.1 implemented + tested | Phase 4 |
| 5 | `pytest` green, ≥60% coverage, mocked network | Phase 5 |
| 6 | `liana --version` + `liana --help` captured in report | Phase 6 |
| 7 | Tag + handoff report filed | Phase 7 |

## BRIDLE compliance

| Rule | Demonstrate |
|---|---|
| Rule 2 | PyPI name-collision check output quoted in handoff |
| Rule 5 | Exact Supabase endpoint paths (not paraphrased) |
| Rule 6 | Zero PyPI publish, zero MCP mode, zero README marketing |
| Rule 10 | No librarian-mcp/src edits, so N/A — but still run `npm start` if you touch anything there |

---

*Knight K445a authored by Bishop B119, 2026-04-23. Spec ratified same session. K445b (PyPI publish + CI) follows. FOR THE KEEP.*
