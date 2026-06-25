# GITHUB READMES BP054 AUDIT

**Date:** 2026-05-24 (BP054)
**Auditor:** Bishop (read-only · no pushes)
**Scope:** liana-banyan/{mnemosyne, cai-core, librarian-mcp} README.md
**Status:** PROPOSALS ONLY · awaiting Bishop+Founder ratify before push

---

## EXECUTIVE SUMMARY

Three repos audited. **One critical defect** (mnemosyne has NO README at all). Two repos have readable READMEs with varying degrees of staleness against BP054 canon.

| Repo | README present | License correct | All-AI-keys | v0.1.10 | Caithedral umbrella | LoC mention | Memory multiplier | TM Use Policy |
|---|---|---|---|---|---|---|---|---|
| mnemosyne | **NO (404)** | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| cai-core | YES | OK (SSPL v1) | partial (lists 4) | absent | partial | absent | absent | OK (linked) |
| librarian-mcp | YES | **WRONG (AGPL-3.0)** | n/a | absent (v0.2.0) | absent | absent | "86.1pp lift" only | absent |

**Priority ranking:**
1. **P0 CRITICAL** mnemosyne missing README entirely
2. **P0 CRITICAL** librarian-mcp shows AGPL-3.0 - violates SSPL canon and Pledge #2260 doctrine
3. **P1 HIGH** all three need Caithedral umbrella mark + LoC Grand Project + canonical memory-multiplier post-SEG-MM
4. **P1 HIGH** cai-core needs explicit all-AI-keys language (not just "Claude/GPT/Gemini/Perplexity")
5. **P2 MEDIUM** version bumps to v0.1.10 across all three
6. **P2 MEDIUM** librarian-mcp needs TM Use Policy link

---

## REPO 1: liana-banyan/mnemosyne

### Finding
**No README.md exists at repository root.** `gh api repos/.../readme` returns HTTP 404. Repository description (visible on GitHub home tile) reads:

> Mnemosyne(tm) -- Cooperative AI Memory . Powered by CAI(tm) Core . Designed to Be Copied

Root contains: LICENSE_SSPL.md, NOTICE, TRADEMARK_USE_POLICY.md, package.json, Mnemosyne.bat, src/, sidecar/, scripts/, docs/, etc. - but no README.md.

### Severity
**P0 CRITICAL.** Mnemosyne is the consumer-facing flagship. A bare repo page with no README is a trust-killer for Show HN, Crown letters, and Anthropic V2 outreach - all of which land in BP054 window.

### Proposed action
CREATE new README.md. Skeleton template:

```markdown
# Mnemosyne(TM) - Cooperative AI Memory

**Powered by CAI(TM) Core under the Caithedral(TM) umbrella . Designed to be Copied**

Mnemosyne is the desktop client for the Caithedral(TM) cooperative memory
substrate. Pre-curated canonical memory + prose/code provenance + sub-millisecond
retrieval, working across every AI assistant you use - Claude, ChatGPT, Gemini,
Perplexity, Copilot, Cursor, Continue, Zed, and any MCP-capable client.
Bring your own API keys from every vendor. No lock-in.

**Memory multiplier:** [CANONICAL_POST_SEG_MM_FIGURE]x effective context vs. cold
baseline (Eyewitness Benchmark R10, 1,200 graded calls, kappa 0.883/0.850).

**Version:** v0.1.10 (BP054 . 2026-05-24)
**Download:** https://mnemosynec.ai/download/
**License:** SSPL v1 + Cooperative Patent Pledge #2260 - see LICENSE_SSPL.md
**Trademarks:** see TRADEMARK_USE_POLICY.md . Linux Foundation defensive
registration model . "Powered by CAI(TM)" attribution welcomed and encouraged.
**LoC Grand Project:** Mnemosyne is the reference client deposited with the
Library of Congress under the Grand Project preservation framework
(filing 2026-06-15).

[Architecture / Quick Start / Contact sections to follow]
```

### Awaits ratify
Founder to fill bracketed canonical memory-multiplier number. Bishop to fact-check LoC filing date once SEG-MM lock confirmed.

---

## REPO 2: liana-banyan/cai-core

### Current state (40 lines, 2342 bytes)
Title "CAI(TM) Core". Tagline "Cooperative AI Memory Architecture . Reference Implementation . Designed to Be Copied". License section names SSPL v1 + Pledge #2260 correctly. Trademark section links TRADEMARK_USE_POLICY.md correctly. Cross-Vendor MCP row of architecture table names "Claude . GPT . Gemini . Perplexity".

### Defects vs. BP054 canon

**D1. Caithedral umbrella mark absent at top.** Line 5 mentions "Caithedral(TM) retrieval" inside a feature list, but the umbrella relationship (Caithedral = top-level mark, CAI Core + Mnemosyne = children) is not surfaced.

**D2. All-AI-keys not explicit.** Line 21 enumerates four vendors. Canon is "all AI keys" (BYO any vendor key, symmetric MCP across all). Risk: reader assumes the four named vendors are the universe.

**D3. Version absent.** No "v0.1.10" or BP054 date stamp. Reader cannot tell whether they are looking at current canon or stale prose.

**D4. LoC Grand Project absent.** No mention that CAI Core source is deposited with Library of Congress under Grand Project framework.

**D5. Memory multiplier absent.** No benchmark headline. Cross-repo asymmetry: librarian-mcp leads with numbers; cai-core (the engine) cites none.

### Proposed edits

**Edit 2A (D1, D2)** - replace line 5:

BEFORE:
```
CAI(TM) Core is a complete, self-contained substrate ecosystem in 160 MB. Every install runs autonomously - no cloud account, no central server, no Founder. Caithedral(TM) retrieval, Pheromone substrate, Cross-Vendor symmetric MCP, Banyan Metric(TM) scoring. Fork it, study it, integrate it, run it forever.
```

AFTER:
```
CAI(TM) Core is the engine inside Caithedral(TM), the cooperative AI memory umbrella. A complete, self-contained substrate ecosystem in 160 MB. Every install runs autonomously - no cloud account, no central server, no Founder. Bring your own API keys from any AI vendor (Claude, ChatGPT, Gemini, Perplexity, Copilot, Llama, Mistral, local models - symmetric MCP across all). Caithedral(TM) retrieval, Pheromone substrate, Cross-Vendor symmetric MCP, Banyan Metric(TM) scoring. Fork it, study it, integrate it, run it forever.
```

**Edit 2B (D3)** - add immediately under H1 (new line 2):

```
**Version:** v0.1.10 . BP054 . 2026-05-24
```

**Edit 2C (D4)** - add new section after "Distribution":

```
## Library of Congress Grand Project

CAI(TM) Core source code is deposited with the Library of Congress under the
Grand Project preservation framework (filing 2026-06-15). The deposit ensures
the substrate ecosystem survives the 50-year corporate dissipation window
and remains accessible to humanity in perpetuity.
```

**Edit 2D (D5)** - add new section after the Architecture table:

```
## Independently Measured

Eyewitness Benchmark R10 (April 2026, eight models across four vendors,
1,200 graded calls, inter-rater kappa 0.883/0.850):

- COLD baseline: mean 8.7% correct
- HOT (with CAI(TM) Core): mean 94.8% correct - 86.1pp lift
- Effective memory multiplier: [CANONICAL_POST_SEG_MM_FIGURE]x
- Haiku 4.5 (cheapest) ties Opus 4.7 (most expensive) at 19x cost difference
- 4.3x more right answers per dollar of compute
```

### Awaits ratify
Founder to confirm canonical memory-multiplier figure post-SEG-MM. Memory stub currently shows "847x" with note "or canonical memory-multiplier post SEG-MM" - implies SEG-MM may have revised the number. Bishop should not commit "847x" without explicit Founder ack.

---

## REPO 3: liana-banyan/librarian-mcp

### Current state (188 lines, 7526 bytes)
Long and detailed. Title "Librarian MCP". Tools table, benchmark numbers, pricing table, install instructions for Claude Code / Cursor / Continue, status line dated April 21 2026 v0.2.0.

### Defects vs. BP054 canon

**D1. License is WRONG.** Line 8 badge "License: AGPL-3.0". Line 167 says "[AGPL-3.0](LICENSE). Commercial licensing for the paid tiers is a separate agreement; the Pledged Commons tier is covered by AGPL + the Cooperative Defensive Patent Pledge." **Canonical license is SSPL v1, not AGPL-3.0.** Memory immutable: "SSPL+Pledge#2260". This is a publication-level error visible on every clone and every PyPI page.

**D2. Caithedral umbrella mark absent.** No mention anywhere that Librarian MCP sits under the Caithedral umbrella alongside Mnemosyne and CAI Core.

**D3. Version stale.** Status line line 163 says "v0.2.0" dated April 21 2026. Canon is v0.1.10 (or whatever librarian-mcp's current point release is - needs Founder confirm; numbering scheme inconsistent with mnemosyne/cai-core).

**D4. TM Use Policy not referenced.** No link to TRADEMARK_USE_POLICY.md. Risk: ambiguity around "Librarian", "Cephas", "Pheromone" mark usage by third-party packagers.

**D5. LoC Grand Project absent.**

**D6. Memory-multiplier figure absent.** Has the "86.1pp lift" but no x-multiplier headline.

**D7. Pledge URL stale.** Lines 9 and 167 link `https://liana-banyan.com/pledge`. Canonical Pledge identifier is #2260 - URL should resolve to a stable page that names that number.

### Proposed edits

**Edit 3A (D1) - HIGHEST PRIORITY** - replace line 8 badge:

BEFORE:
```
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
```

AFTER:
```
[![License: SSPL v1 + Pledge #2260](https://img.shields.io/badge/License-SSPL_v1_%2B_Pledge_%232260-blue.svg)](LICENSE_SSPL.md)
```

**Edit 3B (D1)** - replace lines 165-167 License section:

BEFORE:
```
## License

[AGPL-3.0](LICENSE). Commercial licensing for the paid tiers is a separate agreement; the Pledged Commons tier is covered by AGPL + the [Cooperative Defensive Patent Pledge](https://liana-banyan.com/pledge).
```

AFTER:
```
## License

[SSPL v1](LICENSE_SSPL.md) + [Cooperative Patent Pledge #2260](https://liana-banyan.com/pledge-2260).
Free for cooperatives and individuals. Commercial use requires patent license
under declining 50%-off-cost terms - first mover gets 5 years; each year of
delay costs you 1 year off the deal. See [TRADEMARK_USE_POLICY.md](TRADEMARK_USE_POLICY.md)
for mark usage (Linux Foundation defensive-registration model - ubiquity welcomed).
```

**Edit 3C (D2)** - replace lines 1-2 (title block):

BEFORE:
```
# Librarian MCP
```

AFTER:
```
# Librarian MCP

**Part of the Caithedral(TM) cooperative AI memory umbrella . sibling to
[CAI(TM) Core](https://github.com/liana-banyan/cai-core) and
[Mnemosyne(TM)](https://github.com/liana-banyan/mnemosyne)**
```

**Edit 3D (D3)** - replace line 163:

BEFORE:
```
**April 21, 2026 - v0.2.0.** Intent-aware `librarian_context` live with bundled preload (R10-validated). Benchmark metrics recording live. Prose Provenance tool upgraded to v0.2.0. PyPI name `librarian-mcp` reserved. CI/CD staged.
```

AFTER:
```
**May 24, 2026 - v0.1.10 (BP054).** Intent-aware `librarian_context` live with bundled preload (R10-validated). Benchmark metrics recording live. Prose Provenance tool upgraded. PyPI name `librarian-mcp` reserved. CI/CD live.
```

(Founder: confirm version-number harmonization - librarian-mcp shipping at v0.2.0 may be intentional and the v0.1.10 stub refers to Mnemosyne app specifically. If so, leave version alone and only update date.)

**Edit 3E (D5)** - add new section before "License":

```
## Library of Congress Grand Project

Librarian MCP source is deposited with the Library of Congress under the Grand
Project preservation framework (filing 2026-06-15) alongside Caithedral(TM)
sibling projects.
```

**Edit 3F (D6)** - add bullet to "Why we built this" section after line 37:

```
- **Effective memory multiplier: [CANONICAL_POST_SEG_MM_FIGURE]x** vs. cold baseline
```

---

## CONSOLIDATED PUSH ORDER (post-ratify)

1. mnemosyne: CREATE README.md (P0)
2. librarian-mcp: License correction SSPL + Pledge #2260 (P0)
3. cai-core: Caithedral umbrella + all-AI-keys language (P1)
4. All three: LoC Grand Project section (P1)
5. All three: canonical memory-multiplier figure (P1 - blocked on SEG-MM ratify)
6. All three: version + BP054 date stamps (P2)
7. librarian-mcp: TM Use Policy link + Caithedral sibling header (P2)

---

## BISHOP NOTES

- No edits pushed. All proposals require Founder ratify + Bishop second-read.
- Memory-multiplier number ("847x" per stub, but stub flags "or canonical post SEG-MM") is the single biggest unknown blocking 3 of the 6 edits. Recommend Founder pin canonical number before any push.
- librarian-mcp AGPL-3.0 error is publication-grade defect - visible on every PyPI render and every github.com tile. Recommend P0 hotfix even ahead of full BP054 wave if Founder concurs.
- TRADEMARK_USE_POLICY.md exists in mnemosyne root and is referenced by cai-core; confirm it also exists in librarian-mcp before linking.

**End of audit.**
