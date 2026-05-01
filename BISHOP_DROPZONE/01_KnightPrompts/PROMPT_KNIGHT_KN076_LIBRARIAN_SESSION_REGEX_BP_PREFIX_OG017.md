# PROMPT — Knight KN076: Librarian Session-ID Regex BP-Prefix Fix (closes OG-017)

*(Augur-Pricing exemption: documentation-class K-prompt; LB membership pricing identical for all members at $5/year, unchanged; membership-orthogonal — vendor-API spend industry-term.)*

```
=== WRASSE PRE-INJECTION ===
[OG-017] BP009 90-bean test discovered: log_tidbit + add_gotcha session-id regex rejects BP-prefix (BP009) but scribe_log accepts it. Workaround applied (B-prefix). Substrate-friction recorded. Knight follow-up: align all librarian tool session-id regexes.

Composing canon:
- ~/.claude/projects/C--Users-Administrator-Documents/memory/feedback_bp_number_ground_truth_trust.md
- BISHOP_DROPZONE/03_BishopHandoffs/SUBSTRATE_ROUTED_MEMORY_EXPANSION_90_BEAN_BISHOP_RECEIPT_BP006.md (90-bean receipt §3.6 + Class D bean 44 + Class I bean 87 + bonus add_gotcha OG-017)
- librarian-mcp project source
=== END WRASSE ===

=== BRIDLE v11 ===
Rule 1 (trust-but-verify): inspect each Zod schema in librarian-mcp BEFORE patching; locate ALL session-id regexes (some tools have separate validators)
Rule 2 (pre-assertion): grep for `session.*regex` and `B\\d{3}` patterns to find every occurrence
Rule 3 (Path B): write the failing-test FIRST (asserts BP009 accepted), watch it fail, THEN apply the fix, watch it pass
Rule 4 (no --no-verify): pre-commit hook runs full test suite; do NOT skip
Rule 5 (one new primitive per session — RELAXED BP004): substrate-fix bundle is acceptable since it's substrate maintenance, not new primitive
=== END BRIDLE ===

PHASE A — DESIGN
Locate every session-id Zod regex in librarian-mcp source. Expected file paths (verify):
- librarian-mcp/src/tools/log_tidbit.ts (or .js)
- librarian-mcp/src/tools/add_gotcha.ts
- librarian-mcp/src/tools/scribe_log.ts
- librarian-mcp/src/schemas/session_id.ts (if shared schema exists)
- librarian-mcp/src/registry.yaml (scribe registration; not a regex but verify session normalization)

Design the unified regex pattern:
- Original: /^[BKP]\d{3}$/ (or similar) — only accepts 1-letter prefix + 3 digits
- New: /^(B|BP|K|KP|P|PP|R|RR)\d{3}$/ — accepts B (Bishop legacy), BP (Bishop-Pod era), K (Knight legacy), KP (Knight-Pod era), P (Pawn), PP (Pawn-Pod), R (Rook), RR (Rook-doubled). Founder confirms which agent/prefix combinations are valid.

PHASE B — IMPLEMENT
1. If a shared session-id schema file exists, update it once
2. Otherwise, update each tool's schema individually with the unified regex
3. Update inline JSDoc / TS comments documenting the new accepted patterns
4. Add helpful error message: "Invalid session ID. Expected B###, BP###, K###, KP###, etc."

PHASE C — VERIFY
1. Detective: `mcp__librarian__detective_investigate "session ID regex BP-prefix"` → confirm Phase 0 hits this fix
2. Read the updated schema files to verify regex change is correct
3. Grep `B\\d{3}` patterns across librarian-mcp source — confirm no missed regex sites

PHASE D — TEST
1. Add unit tests:
   - test('accepts BP009', () => expect(parseSessionId('BP009')).toBe('BP009'))
   - test('accepts B009', () => expect(parseSessionId('B009')).toBe('B009'))
   - test('accepts KP024', () => expect(parseSessionId('KP024')).toBe('KP024'))
   - test('rejects 9 (no prefix)', () => expect(() => parseSessionId('9')).toThrow())
   - test('rejects bp009 (lowercase)', () => expect(() => parseSessionId('bp009')).toThrow()) — OR explicitly accept-and-uppercase if Founder prefers
2. Run librarian-mcp test suite: `cd librarian-mcp && npm test`
3. Smoke-test in live Knight session: invoke `mcp__librarian__log_tidbit` with session=BP009 → expect ok=true (not the regex error from BP009 fire)

PHASE E — SHUTTERBUG
Capture dual-monitor screenshot per KN067:
- Monitor 1: passing test suite output
- Monitor 2: live MCP smoke-test response
Filename: `KN076_OG017_FIXED_BP_PREFIX_REGEX_<timestamp>.png`

PHASE F — COMMIT
```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp
git add src/tools/log_tidbit.ts src/tools/add_gotcha.ts src/tools/scribe_log.ts src/schemas/session_id.ts test/session_id.test.ts
git commit -m "fix(librarian/KN076-BP009): align session-id regex to accept BP-prefix (closes OG-017)

Empirical: BP009 90-bean test bean 44 + bean 87 + bean 50 surfaced log_tidbit + add_gotcha session-id regex rejecting BP-prefix while scribe_log accepted it. Workaround was B-prefix; this fix unifies regex across all librarian tools.

Receipt anchor: SUBSTRATE_ROUTED_MEMORY_EXPANSION_90_BEAN_BISHOP_RECEIPT_BP006.md §3.6 + Class D bean 44.

Closes: OG-017"
```

Then:
1. Run `mcp__librarian__add_gotcha` with action: close OG-017 (or manually mark resolved in operational_gotchas tablet)
2. Append `mcp__librarian__scribe_log` to OperationalGotchas: "OG-017 closed by KN076 fix at <commit-sha>"

=== SUCCESS CRITERIA ===
- All 4 librarian tools (log_tidbit, add_gotcha, scribe_log, anything else with session-id regex) accept BP-prefix
- Unit test suite green
- Live MCP smoke-test confirms BP009 accepted
- OG-017 closed in OperationalGotchas Scribe tablet
- Phase-E Shutterbug capture lands
- Knight commit signed; Phase F clean

=== FOUNDER PROSE-PASS ===
None required (substrate-fix; mechanical change). Founder ratifies via Knight session approval.
```
