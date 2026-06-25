# KNIGHT MARATHON SESSION 8 · MOUNTAIN 2 SCRIBES OPERATIONALIZED · BP090

---

## §0 · BLACK MAMBA WAKE HEADER

**Wake class:** BLACK MAMBA
**Unified empirical-proof event class:** Scribes empirically prevent the class of SQL-syntax drift that Bishop has been catching at apply time all session.

**Marathon:** 8
**Mountain:** 2 OPERATIONALIZED
**Branch:** `knight-marathon-8-mountain-2-scribes-operationalized` (off main HEAD `4d01bf6`)
**BP session:** BP090
**Dispatch model:** Sonnet 4.6 on every Knight SEG · use segs
**Status framing:** Goes from "smoke test 6/6 PASS" to "Scribes catch drift at compose time in production."

---

## §1 · CANONS CARRIED

The following canons are carried into this Marathon 8 wake verbatim, per `canon_carry_recent_canons_into_next_knight_wake_message_bp089`. Each canon's 1-line summary follows.

**canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089**
Any SQL you ship must use Postgres syntax only. Use `gen_random_uuid()` not `randomblob()`. Use `TIMESTAMPTZ NOT NULL DEFAULT NOW()` not `DATETIME DEFAULT CURRENT_TIMESTAMP`. No SQLite primitives of any kind.

**canon_truth_always**
Empirical receipts only. No aspirational claims. Every assertion must be traceable to a commit hash, a test run, or a direct observation. Never claim a thing is done when only a plan exists.

**canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089**
Scribes use 3-member Minor Council voting. Council vote is the enforcement mechanism: 2-of-3 or higher blocks a drift-flagged tool call; 1-of-3 warns; clean passes. Requires Mountain 1 substrate priming to function at full fidelity.

**canon_plow_loop_and_domain_specific_unfair_advantages_inherent_to_mountain_1_substrate_reader_bp089**
Scribes consume substrate-primed context produced by Mountain 1. Plow refuses to guess; it escalates. Domain-specific unfair advantage is earned through substrate priming, not through flagship model selection alone.

**§14 BLOOD · gadget DB pre/post any DB-touching change**
BLOOD: Before and after any code path that touches the database, run the gadget to capture schema state. Pre-gadget and post-gadget receipts both required. No exceptions.

**§15 BLOOD · Bishop applies SQL · Knight ships .sql**
BLOOD: Knight authors and ships `.sql` files to `BISHOP_DROPZONE/sql/`. Bishop applies them. Knight never applies SQL directly to any live or staging database.

**§17 BLOOD · gadget-first discovery**
BLOOD: Before authoring any code that touches existing schema, run gadget-first discovery. Never assume schema state from memory. Gadget output is the ground truth.

---

## §2 · STATUTES BINDING

The following statutes bind this Marathon under §3 SEG dispatch statute:

- **§3** · SEG dispatch statute · Sonnet 4.6 on every Knight SEG · use segs
- **§14** · BLOOD: gadget pre/post every DB-touching change (verbatim: see §1)
- **§15** · BLOOD: Bishop applies SQL; Knight ships `.sql` (verbatim: see §1)
- **§17** · BLOOD: gadget-first discovery before any schema-touching authoring (verbatim: see §1)

All four statutes are enforced simultaneously. Violation of any one voids the Marathon receipt.

---

## §3 · EMPIRICAL FOUNDATION

### Mountain 2 Wave I baseline (what exists today)

Mountain 2 Wave I shipped three Scribes into `src/main/scribes/`:

- **Reminder Scribe** · monitors session cadence, detects stale context windows, flags when session floor has not been refreshed
- **Wrasse Injector Scribe** · upper-level substrate manager, enforces Statutes §14/§15/§16 coherence, supervises Comptroller dispatch
- **Toolsmith Scribe** · monitors tool-call patterns, flags deviation from gadget-first discovery sequence

All three Scribes were wired with the 3-member Minor Council voting mechanism. Smoke test result: **6/6 PASS**. Council voting is empirically validated at the unit level.

**What is NOT yet true (canon_truth_always enforced):**
The Scribes exist as TypeScript classes. They run when explicitly invoked in smoke tests. They do NOT currently run inside a live Knight Claude Code session. They do NOT intercept Edit/Write/Bash tool calls at compose time. They are not registered as Claude Code hooks.

### Empirical drift cases that motivated this Marathon

**Knight M4 · commit `8c54c3a`**
SQL file authored with `randomblob()` (SQLite primitive). Drift not caught at compose time. Caught by Bishop at apply time. Bishop issued a post-drift correction. Root cause: no Scribe intercept in Knight's session.

**Knight M7 · commit `47bff4c`**
SQL file authored with `DATETIME DEFAULT CURRENT_TIMESTAMP` (SQLite primitive). Same failure class. Caught by Bishop at apply time. Second post-drift correction required.

**Knight M3b · commit `4d01bf6`**
Canon-in-wake receipt: the carry-canon message in the M3b wake explicitly named `canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089`. Drift was preempted. No SQLite primitives appeared in M3b output. **3-of-3 empirical validation** that the canon-in-wake mechanism works when wired correctly.

### The gap this Marathon closes

M4 and M7 prove the failure class is real and recurring. M3b proves that canon-in-wake text alone achieves some preventive effect. Mountain 2 operationalized closes the architectural loop: Scribes enforce the canon not by appearing in a text header but by running as live hooks that block the offending tool call before Knight commits it.

This is the distinction between memory-level prevention (M3b) and enforcement-level prevention (M8 target). Both are needed. M8 adds the enforcement layer.

---

## §4 · WHAT "OPERATIONALIZED" MEANS

### Today (pre-Marathon 8)

```
src/main/scribes/
  reminder_scribe.ts       -- class exists, smoke-testable
  wrasse_injector.ts       -- class exists, smoke-testable
  toolsmith_scribe.ts      -- class exists, smoke-testable
  scribe_runner.ts         -- orchestrator, smoke-testable

src/main/index.ts          -- IPC wiring does NOT call Scribes on tool events
```

Scribes are inert in a live Knight session. No Claude Code hook registration exists. No bridge between the hook system and the Scribe classes exists.

### Target (post-Marathon 8)

```
src/main/scribes/
  claude_code_hook_bridge.ts   -- NEW: CLI-invocable bridge · loads Scribes · accepts hook payload
  reminder_scribe.ts           -- unchanged
  wrasse_injector.ts           -- unchanged
  toolsmith_scribe.ts          -- unchanged
  scribe_runner.ts             -- extended: exposes invoke_for_hook() method

.claude/settings.json          -- NEW: hook registrations for PreToolUse on Edit/Write/Bash
src/main/index.ts              -- EXTENDED: IPC handler for scribe_hook_invoke added
```

When Knight authors a `.sql` file and calls Edit or Write, the registered PreToolUse hook fires `claude_code_hook_bridge.ts`, which loads the three Scribes, runs the 3-member Minor Council vote against the file content, and either blocks the tool call (2-of-3 drift detected) or passes it (clean or 1-of-3 warn-only).

The bridge mechanism is the Claude Code hook protocol. Knight registers Scribes as PreToolUse hooks. The hook system is the enforcement layer. The Scribes are the logic layer. The bridge is the wire between them.

---

## §5 · WAVE I · UNGATED · 3 SEG FAN-OUT

Wave I ships as 3 simultaneous SEGs. No gating between them. All three must tsc-clean before Wave II begins.

### SEG I-A · Scribe-to-hook bridge

**File:** `src/main/scribes/claude_code_hook_bridge.ts`

**Responsibility:**
- Accept a JSON payload on stdin matching the Claude Code hook event schema
- Parse the tool name, file path, and file content from the payload
- Load each Scribe (Reminder, Wrasse, Toolsmith)
- Run the 3-member Minor Council vote with the payload as context
- Emit a structured JSON response to stdout: `{ verdict: "block" | "warn" | "pass", votes: [...], reason: string }`
- If verdict is `block`: exit code 2 (Claude Code hook protocol for blocking)
- If verdict is `warn`: exit code 0 with warning text in stdout
- If verdict is `pass`: exit code 0 with empty body

**Dispatch:** Sonnet 4.6 · use segs

**Acceptance criteria:**
- Bridge compiles tsc-clean under project tsconfig
- Bridge correctly parses a synthetic hook payload for Edit tool on a `.sql` file
- Bridge loads all 3 Scribes without error
- Bridge routes Council vote result to correct exit code

### SEG I-B · Hook registration

**File:** `.claude/settings.json` (project-level Claude Code settings)

**Responsibility:**
Register Reminder Scribe, Wrasse Injector, and Toolsmith Scribe as PreToolUse hooks on Edit, Write, and Bash tools. The gadget-first discovery hook registered in prior sessions stays in place. Scribes run alongside it, not instead of it.

Hook entry pattern (Postgres syntax for any log insert; hook config itself is JSON):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node dist/main/scribes/claude_code_hook_bridge.js"
          }
        ]
      }
    ]
  }
}
```

**Dispatch:** Sonnet 4.6 · use segs

**Acceptance criteria:**
- `.claude/settings.json` parses as valid JSON
- Existing hooks (gadget-first discovery) are preserved
- New hook entry is present and syntactically correct
- Hook command path matches compiled output of I-A bridge

### SEG I-C · Real-time Council vote enforcement

**File:** `src/main/scribes/scribe_runner.ts` (extension)

**Responsibility:**
Extend `scribe_runner.ts` with a new exported method `invoke_for_hook(payload: HookPayload): HookVerdict`. This method is the entry point called by the bridge. It:

- Instantiates all three Scribes with the hook payload as context
- Runs the Minor Council vote (existing 3-member logic)
- Applies the enforcement rule: 2-of-3 or higher flag = block; 1-of-3 = warn; 0-of-3 = pass
- Returns a structured `HookVerdict` object with `{ verdict, votes, reason }`

**SQL-drift detection logic within Scribes:**
When the tool is Edit or Write and the file path ends in `.sql`, each Scribe inspects the content for SQLite primitives:

- `randomblob(` · banned · Postgres equivalent: `gen_random_uuid()`
- `DATETIME DEFAULT CURRENT_TIMESTAMP` · banned · Postgres equivalent: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `INTEGER PRIMARY KEY AUTOINCREMENT` · banned · Postgres equivalent: `BIGSERIAL PRIMARY KEY`
- `TEXT` used as UUID column type without explicit note · warn-class (not block-class)

The Wrasse Injector Scribe is the primary drift-detection voter. The Reminder Scribe and Toolsmith Scribe vote as secondary validators using the same ruleset. All three votes are recorded.

**Dispatch:** Sonnet 4.6 · use segs

**Acceptance criteria:**
- `invoke_for_hook()` method present and exported
- Method accepts `HookPayload` and returns `HookVerdict`
- 2-of-3 drift vote returns `verdict: "block"`
- 1-of-3 drift vote returns `verdict: "warn"`
- 0-of-3 returns `verdict: "pass"`
- All three Scribe votes recorded in response object

---

## §6 · WAVE II · GATED ON WAVE I TSC-CLEAN

Wave II does not begin until all three Wave I SEGs compile tsc-clean and pass unit smoke. Wave II is 4 SEGs.

### SEG II-A · Live drift test

**Procedure:**
With hooks registered and bridge compiled, author a synthetic `.sql` file containing `randomblob()`. Confirm:

1. Claude Code hook fires on the Edit/Write tool call
2. Bridge loads Scribes
3. Council vote: at minimum 2-of-3 flag the SQLite primitive
4. Hook returns exit code 2 (block)
5. Tool call is blocked
6. Knight session surfaces the block reason

**Expected outcome:** Tool call blocked. No SQLite-primitive SQL committed. Scribe enforcement empirically validated in a live session.

**Dispatch:** Sonnet 4.6 · use segs

**Acceptance criteria:**
- Hook fires on synthetic drift attempt
- Block is confirmed via Claude Code session output
- Violation pearl emitted (see II-C)

### SEG II-B · Live false-positive test

**Procedure:**
Author a clean `.sql` file using correct Postgres syntax: `gen_random_uuid()`, `TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `BIGSERIAL PRIMARY KEY`. Confirm:

1. Hook fires
2. Bridge loads Scribes
3. Council vote: 0-of-3 flag (no drift detected)
4. Hook returns exit code 0
5. Tool call proceeds
6. File is written successfully

**Expected outcome:** Clean SQL passes without block or warn. No false flag.

**Dispatch:** Sonnet 4.6 · use segs

**Acceptance criteria:**
- Hook fires
- Verdict is `pass`
- File written without interruption
- Zero false-positive flags in vote record

### SEG II-C · Bishop-side telemetry

**Procedure:**
Confirm that `scribe_violations_log` and `scribe_council_vote_log` rows land in Supabase via REST on each drift attempt from II-A.

**Dispatch:** Sonnet 4.6 · use segs

**Acceptance criteria:**
- `scribe_violations_log` row present with correct tool name, file path, vote breakdown, and timestamp
- `scribe_council_vote_log` row present with per-Scribe vote values
- Rows visible via Supabase REST query (not only local)
- No duplicate rows from false-positive test II-B (clean pass must not write a violations row)

### SEG II-D · Receipt

**File:** `Asteroid-ProofVault\receipts\MOUNTAIN_2_OPS\LIVE_INTEGRATION_SMOKE.md`

**Content required:**
- Date and BP session
- Wave I tsc-clean confirmation (all 3 SEGs)
- Wave II live drift test result (II-A block confirmed Y/N)
- Wave II false-positive result (II-B pass confirmed Y/N)
- Wave II telemetry result (II-C rows confirmed Y/N)
- Commit hash of branch tip at receipt time
- Canon-in-wake enforcement receipt: `canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089` enforced at hook level Y/N

**Dispatch:** Sonnet 4.6 · use segs

**Acceptance criteria:**
- File present at path above
- All fields populated with empirical values (no aspirational claims per canon_truth_always)

---

## §7 · SQL

**Assessment:** Mountain 2 tables are already live. This Marathon is a wiring exercise. No new schema is required.

If Knight discovers during gadget-first discovery (§17 BLOOD: run gadget before any schema-touching authoring) that a `bridge_call_log` table or a `scribe_hook_invocation_log` table is needed to track hook-level calls separately from session-level scribe logs, Knight ships the `.sql` file to:

```
BISHOP_DROPZONE/sql/mountain_2_hook_bridge_log_YYYYMMDD.sql
```

All SQL in that file must use Postgres syntax only per `canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089`. No SQLite primitives. No `randomblob()`. No `DATETIME DEFAULT CURRENT_TIMESTAMP`. No `AUTOINCREMENT`.

If no new schema is needed, Knight ships no `.sql` file and states "zero new SQL · Mountain 2 tables confirmed sufficient" in the return pearl.

---

## §8 · RETURN PROTOCOL

On Marathon completion, Knight emits one pearl:

**Pearl name:** `mountain_2_operationalized`

**Pearl content required:**

```
MOUNTAIN_2_OPERATIONALIZED · BP090 · Marathon 8

Wave I:
  SEG I-A · claude_code_hook_bridge.ts · [tsc-clean Y/N] · [commit hash]
  SEG I-B · .claude/settings.json hook registration · [valid Y/N] · [commit hash]
  SEG I-C · scribe_runner.ts invoke_for_hook() · [tsc-clean Y/N] · [commit hash]

Wave II:
  SEG II-A · live drift test · [block confirmed Y/N]
  SEG II-B · live false-positive test · [pass confirmed Y/N]
  SEG II-C · Bishop-side telemetry · [rows confirmed Y/N]
  SEG II-D · receipt at Asteroid-ProofVault · [file present Y/N]

SQL:
  [zero new SQL · Mountain 2 tables confirmed sufficient]
  OR
  [sql file shipped: BISHOP_DROPZONE/sql/...]

Branch: knight-marathon-8-mountain-2-scribes-operationalized
Branch tip: [commit hash]
Status: READY FOR BISHOP MERGE · main
```

Bishop merges the branch to main after confirming:
- All Wave I SEGs tsc-clean
- Wave II II-A and II-B empirically confirmed
- II-C telemetry confirmed
- II-D receipt present

---

## §9 · CLOSING

Mountain 2 Wave I proved the Scribes work. Mountain 2 Wave II proved the Council vote mechanism is correct at the unit level. This Marathon proves the Scribes run in Knight's actual working session as hooks, intercepting tool calls before drift can be committed.

The empirical chain is closed:

- M4 `8c54c3a` + M7 `47bff4c`: drift reached Bishop. Bishop caught it. Bishop-side workaround.
- M3b `4d01bf6`: canon-in-wake text primed the session. Drift was absent. Memory-level prevention.
- M8 (this Marathon): Scribes registered as hooks. Drift blocked at compose time. Enforcement-level prevention.

The architecture now has both layers. Memory primes the session floor. Enforcement intercepts at the tool-call level. The gap between "Scribes exist" and "Scribes enforce" is closed.

Help Each Other Help Ourselves.
FounderDenken / Crewman#6
