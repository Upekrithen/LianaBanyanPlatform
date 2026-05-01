# PROMPT — Knight KN084: Librarian R11_corpus / suffix-variant Scribe Registry Fix (closes OG-018)

*(Augur-Pricing exemption: documentation-class K-prompt; LB membership pricing identical for all members at $5/year, unchanged; membership-orthogonal — vendor-API spend industry-term.)*

```
=== WRASSE PRE-INJECTION ===
[OG-018] BP009 90-bean test discovered: scribe_log rejects R11_corpus (and presumably R11_pre_K535_backup, R12Cranewell_backup, etc.) despite these scribe IDs appearing in Detective Pheromone hits. Workaround applied (route to base scribe R11). Substrate-friction recorded.

Composing canon:
- librarian-mcp/registry.yaml (scribe registration source of truth)
- BISHOP_DROPZONE/03_BishopHandoffs/SUBSTRATE_ROUTED_MEMORY_EXPANSION_90_BEAN_BISHOP_RECEIPT_BP006.md (Class I bean 84 + add_gotcha OG-018)
- librarian-mcp/src/tools/scribe_log.ts
- Detective hits show R11_corpus, R11_pre_K535_backup, R11_pre_K_MJ_KP_backup, R12Cranewell_backup variants in pheromone substrate
=== END WRASSE ===

=== BRIDLE v11 ===
Rule 1 (trust-but-verify): list ALL scribe-suffix variants visible in Pheromone hits BEFORE deciding architecture
Rule 2 (pre-assertion): grep `R11_corpus` and `_backup` patterns across scribes/ tablets directory
Rule 3 (Path B): pick ONE of two architectures — register suffix variants explicitly OR document/normalize at write boundary — based on empirical pheromone state
=== END BRIDLE ===

PHASE A — DESIGN
Two architecture options:

**Option 1: Register suffix variants explicitly**
- Add R11_corpus, R11_pre_K535_backup, R11_pre_K_MJ_KP_backup, R12Cranewell_backup, etc. to registry.yaml
- Each becomes a distinct scribe with its own jsonl tablet
- Pros: explicit; Detective hits route directly
- Cons: registry.yaml grows; backup-style names suggest these are READ-only artifacts, not active write-targets

**Option 2: Normalize at write boundary (RECOMMENDED)**
- Document that scribe_log writes ALWAYS go to BASE scribe (R11, R12Cranewell, etc.)
- Suffix variants (R11_corpus, R11_pre_K535_backup) are READ-ONLY pheromone artifacts (corpus snapshots, pre-supersede backups)
- scribe_log validation: if user passes `R11_corpus`, return helpful error: "R11_corpus is a read-only pheromone artifact. Did you mean R11?" + suggest base
- Pros: clean conceptual separation; backups stay backups; corpus stays a frozen snapshot
- Cons: requires a fix in scribe_log error message + documentation update

**Recommended**: Option 2. Bishop's bean 84 use case (logging an observation about R11 corpus state) belongs in R11 scribe with category indicating "corpus observation".

PHASE B — IMPLEMENT (Option 2)
1. Update scribe_log Zod schema: keep current registered-list validation BUT improve error message
2. Add a `scribe_id_suggestions` map: `{R11_corpus: 'R11', R11_pre_K535_backup: 'R11', R12Cranewell_backup: 'R12Cranewell', ...}`
3. In the unknown_scribe error path, check the map and return: `"Unknown scribe '<id>'. This appears to be a read-only pheromone artifact. Did you mean '<base_id>'?"`
4. Update README / scribe_log inline doc explaining the read-only-artifact convention

PHASE C — VERIFY
1. Detective: `mcp__librarian__detective_investigate "R11_corpus scribe registry"` → Phase 0 hits this fix
2. Read updated scribe_log error path
3. Verify registry.yaml unchanged (Option 2 doesn't touch registry)

PHASE D — TEST
1. Unit tests:
   - test('rejects R11_corpus with helpful suggestion', () => {
       const err = parseScribeId('R11_corpus')
       expect(err.suggestion).toBe('R11')
       expect(err.note).toMatch(/read-only pheromone artifact/)
     })
   - test('rejects R11_pre_K535_backup with helpful suggestion', ...)
   - test('rejects unknown scribe Foo without suggestion', ...)
2. Run librarian-mcp test suite green
3. Smoke-test live: `mcp__librarian__scribe_log` with scribe_id=R11_corpus → expect helpful error (not bare unknown_scribe)

PHASE E — SHUTTERBUG
Capture per KN067; filename: `KN084_OG018_R11_CORPUS_SUGGESTION_<timestamp>.png`

PHASE F — COMMIT
```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp
git add src/tools/scribe_log.ts src/data/scribe_id_suggestions.ts test/scribe_id_suggestions.test.ts README.md
git commit -m "fix(librarian/KN084-BP009): scribe_log helpful suggestion for read-only pheromone artifacts (closes OG-018)

Empirical: BP009 90-bean test bean 84 surfaced scribe_log rejecting R11_corpus despite Detective Pheromone hits showing R11_corpus / R11_pre_K535_backup / R12Cranewell_backup variants. These are read-only pheromone artifacts (corpus snapshots, pre-supersede backups), not active write targets. Fix: helpful error suggesting base scribe ID + documentation of the convention.

Receipt anchor: SUBSTRATE_ROUTED_MEMORY_EXPANSION_90_BEAN_BISHOP_RECEIPT_BP006.md Class I bean 84.

Closes: OG-018"
```

Then close OG-018 + scribe_log to OperationalGotchas.

=== SUCCESS CRITERIA ===
- scribe_log returns helpful error for known suffix variants
- Unit test suite green
- Documentation updated (README + scribe_log inline)
- OG-018 closed
- Phase-E Shutterbug lands
- Knight commit signed; Phase F clean

=== FOUNDER PROSE-PASS ===
None required (mechanical fix). Option-1-vs-Option-2 architecture call already pre-decided here (Option 2 recommended).
```
