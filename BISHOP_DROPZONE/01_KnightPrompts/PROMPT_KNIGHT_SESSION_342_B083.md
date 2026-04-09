# K342: Cephas hybrid-compensation.md SEC Scrub + Dedup
# Priority: CRITICAL — 6 duplicate copies, 59 equity flags each

## Objective
The file Cephas_hybrid-compensation.md exists as 6 duplicate copies in the archive,
each with 59 instances of "equity" in user-facing content. This is the single worst
SEC offender in the entire archive.

## Steps
1. Find all 6 copies in the codebase and archive
2. Identify the canonical version (most recent, most complete)
3. Replace all "equity" instances with SEC-safe alternatives:
   - "equity stake" → "contribution benefit"
   - "equity compensation" → "deferred credit compensation"
   - "earn equity" → "earn contribution credits"
   - "equity vesting" → "benefit vesting"
4. Delete the 5 duplicate copies
5. Verify the canonical version is the one served by Cephas
6. Also fix: ALL_PLATFORM_MECHANICS.md (83 equity flags)
7. Also fix: MEDALLION_HOLDER_OPTIONS.md (59 equity flags)
8. Also fix: BOARD_GOVERNANCE_FRAMEWORK.md (55 flags including securities/dividend/shareholder)

## Validation
- grep -r "equity" on fixed files returns 0 user-facing hits
- Cephas serves the cleaned version
- Only 1 copy of hybrid-compensation exists
