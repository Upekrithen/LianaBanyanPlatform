---
name: Fingerprint-Based Incremental Index Reconciliation for LLM Agent Session Hooks
description: A three-state freshness reporting system (FRESH/DRIFT/UNKNOWN) computed from SHA-256 tree-hash over file modification times, delivered at session-start to enable LLM agents to choose between trusting the index, incremental reindex, or operator warning before any corpus-dependent tool call.
type: aa_formal
innovation_id: "2273"
ratification_session: B117
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - fingerprint incremental index reconciliation
  - three state freshness report fresh drift unknown
  - session start corpus freshness hook
  - tree mtime hash fingerprint corpus
  - incremental reindex session boundary
  - unknown versus drift freshness state
  - aa formal 2273
  - llm agent index freshness detection
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---
# A&A Formal #2273 — Fingerprint-Based Incremental Index Reconciliation for LLM Agent Session Hooks

**Innovation #:** 2273
**Category:** AI Infrastructure / Reliability / Session-Boundary Discipline
**Crown Jewel:** **CANDIDATE** (pending Founder ratification; recommend YES — this is the reliability substrate the Chessboard rests on)
**Bishop Session:** B117 (Formal draft). Originated: K429 implementation, B115 dispatch → B116 ship → B117 commit (`e797320`).
**Date:** April 23, 2026
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Patent Relevance:** **PRIMARY** — fresh inclusion in Prov 14 thresh.
**Related:** #2238 (TouchStone Deterministic Coordinator), #2263 (Triple-Redundant Verification Architecture), #2269 (Three Fates Routing), #2270 (Scribes Cathedral), #2271 (SP-21 Tidbit Scribe).
**Implementation artifact:** `librarian-mcp/src/indexer/fingerprint.ts` (committed B117).

---

## TL;DR (2 lines)

An LLM agent reads a **three-state freshness report** (FRESH / DRIFT / UNKNOWN) at session-start, computed from a SHA-256 hash over the file-mtimes of a declared corpus — and chooses between trusting the index, running an incremental reindex (~3s), or warning the operator — **before** any corpus-dependent tool call executes. Distinguishes UNKNOWN (no prior fingerprint) from DRIFT (changes detected) so the first session after infrastructure changes never silently trusts a stale index.

---

## The Problem Being Solved

LLM agents operating over a curated corpus (documentation, memory, code, session logs, canonical references) depend on a pre-built index for every retrieval-augmented tool call they make. Every minute that index drifts, the agent silently returns stale answers and fabricates continuity it does not have.

Existing solutions fail in three specific ways:

1. **Full-rebuild at session-start is too slow.** At 7,800+ files, a full tree walk + parse takes 30–40 seconds. Agents would hit the wall every session; operators would disable the hook.
2. **mtime-diff caching (make / ninja / sccache) lacks session semantics.** These tools rebuild derived artifacts when inputs change, but they have no vocabulary for "report freshness to a downstream agent that cares about which files changed." They assume the consumer is a compiler, not a reasoning system.
3. **Content-hash stores (git object DB, IPFS) don't distinguish "first run ever" from "changes detected."** Both states look identical to the caller. An agent that can't tell UNKNOWN from DRIFT cannot reason about whether its earlier sessions saw the same index it is now reading.

The innovation is the **three-state freshness vocabulary (FRESH / DRIFT / UNKNOWN) spoken from the indexer to the agent at session-start**, combined with a session-hook integration that makes acting on that report the default path rather than an opt-in feature.

---

## Mechanism

### Freshness report schema

```typescript
interface FingerprintRecord {
  timestamp: string;              // ISO-8601 of last build
  elapsedMs: number;              // full-build wall-clock
  mode: "full" | "incremental";   // which build mode wrote it
  treeHash: string;               // SHA-256 over sorted (path, mtime) tuples
  fileCount: number;
  fileMtimes: Record<string, number>;  // per-file mtime for incremental diff
}

interface FreshnessReport {
  status: "FRESH" | "DRIFT" | "UNKNOWN";
  lastBuild: string | null;       // null if UNKNOWN
  lastBuildMode: string | null;
  ageMs: number | null;
  changedFiles: string[];         // new-or-modified since last build
  deletedFiles: string[];         // present at last build, absent now
  newFiles: string[];
}
```

- **FRESH** — current-tree SHA-256 tree-hash matches stored `treeHash`. Agent may trust index without rebuild.
- **DRIFT** — stored fingerprint exists; current tree diverges. Agent consults `changedFiles` / `deletedFiles` / `newFiles` lists and chooses action (auto-rebuild for small churn; warn for large churn; abort for declared read-only sessions).
- **UNKNOWN** — no stored fingerprint. First session after fresh checkout, or after fingerprint file corruption. Agent MUST NOT assume FRESH. Default behavior: full rebuild.

### Session-start hook integration

```
agent_start
  → read fingerprint.json
  → compute current tree fingerprint
  → report status to agent
  → if FRESH: proceed
  → if DRIFT + churn < threshold: auto-incremental-rebuild (~3s)
  → if DRIFT + churn ≥ threshold: warn, prompt operator
  → if UNKNOWN: full rebuild (block until complete)
  → write new fingerprint after any rebuild
```

### Escape hatch

`npm run rebuild:full` forces a full tree walk regardless of fingerprint state. Preserves operator override for cases of fingerprint corruption, indexer-schema migration, or deliberate reindex.

### Performance measurement (B117 empirical)

- Full rebuild: **27.5s** across 7,861 files, 12 scan directories
- Incremental rebuild (fingerprint match with N < 200 file changes): **~3s** (10× speedup)
- Fingerprint-only check (no rebuild): **<500ms**

---

## Novelty Analysis

### What makes this patentable over prior art

| Prior art | What it does | What it misses |
|---|---|---|
| Make / Ninja / sccache | mtime-diff incremental rebuild | No session-hook integration; no freshness vocabulary for downstream agent |
| Git object store (content-hash) | Per-blob SHA-1/SHA-256 | No tree-level freshness report; doesn't distinguish UNKNOWN from DRIFT |
| IPFS / content-addressed stores | Hash-as-address | Same; no agent-session protocol |
| Elastic / Solr index refresh hooks | Server-side re-indexing on mutation | Server-driven, not agent-session-driven; no three-state vocabulary |
| LangChain / LlamaIndex vector-store cache | Vector-DB freshness via TTL or manual invalidate | Time-based only; no file-tree fingerprint; no session-start handshake |

### Novel over all of the above

1. **Three-state vocabulary (FRESH / DRIFT / UNKNOWN) spoken at the session boundary.** UNKNOWN as an explicit state — not conflated with DRIFT — is the specific contribution. First session after infra change cannot silently pretend the index is trustworthy.
2. **Per-file change lists attached to the DRIFT report.** Agent reasons about *what* changed, not just *that* something changed. A change to one memory file triggers different downstream logic than a change to 50 session logs.
3. **Session-start hook as the default integration point.** The agent's first action after spawn is to read the report; acting on the report is the default execution path, not an opt-in branch.
4. **Tree-hash over sorted (path, mtime) tuples** as the fingerprint primitive — not file content. Cheaper than content-hash, adequate for detecting drift over declared scan paths. Content-hash reserved as escape hatch for corruption cases.

### What we are NOT claiming

- Incremental build is not novel.
- mtime-diff is not novel.
- Session-start hooks are not novel.
- Fingerprint-as-freshness is not novel in isolation.
- **What is novel is the specific combination: (tree-mtime-hash) + (three-state vocabulary including explicit UNKNOWN) + (agent-session-start hook as default integration) + (per-file change lists attached to DRIFT), applied to LLM-agent corpus management.**

---

## Claims (proposed for Prov 14)

### Independent claims

**Claim 1 (Method).** A computer-implemented method for maintaining freshness of an indexed corpus consumed by an LLM agent, comprising:

(a) at the end of an index build, computing a tree-level fingerprint comprising a cryptographic hash over the set of (file path, file modification time) tuples for all files in a declared set of scan directories, and persisting the fingerprint to stable storage;

(b) at the start of each subsequent agent session, reading the persisted fingerprint and computing the current tree-level fingerprint;

(c) emitting to the agent a freshness report whose status field takes exactly one of three values: (i) FRESH when current fingerprint equals persisted fingerprint; (ii) DRIFT when a persisted fingerprint exists and differs from the current fingerprint; and (iii) UNKNOWN when no persisted fingerprint exists or is readable;

(d) causing the agent to select a next-action path from a set of at least three paths distinguished by said status value, before any corpus-dependent retrieval tool call of the agent executes.

**Claim 2 (Apparatus).** A system comprising: an indexer module configured to perform Claim 1; a fingerprint-persistence module; an agent-session-start hook configured to invoke Claim 1(b)–(d); and a corpus the indexer is built over; wherein the freshness report of Claim 1(c) further includes per-file lists of changed files, new files, and deleted files when the status field is DRIFT.

### Dependent claims

- **Claim 3.** The method of Claim 1 wherein the next-action path for DRIFT is further selected based on a count of changed files crossing a declared threshold.
- **Claim 4.** The method of Claim 1 wherein the next-action path for UNKNOWN forces a full rebuild and blocks the agent's first tool call until rebuild completion.
- **Claim 5.** The method of Claim 1 wherein the cryptographic hash of Claim 1(a) is SHA-256 computed over a path-sorted serialization of the (file path, file modification time) tuples.
- **Claim 6.** The method of Claim 1 further comprising an escape-hatch command-line interface that forces a full rebuild regardless of the persisted fingerprint's status.
- **Claim 7.** The method of Claim 1 wherein the corpus comprises at least: documentation files, canonical memory files, session closeout files, and agent transcripts, and wherein the LLM agent is one of a coordinated multi-agent system with distinct session-identifier-prefixed roles (B/K/R/P).
- **Claim 8.** The method of Claim 2 wherein the indexer module further writes a human-readable summary of the freshness report to a log consumable by a system operator distinct from the agent.
- **Claim 9.** The method of Claim 1 wherein the set of scan directories is declared externally in a configuration file, and the method includes a validation step that warns when newly-added top-level directories are not covered by the declared set.

---

## Cross-References

1. **#2238** — TouchStone Deterministic Coordinator (this fingerprint mechanism is the read-side substrate; TouchStone is the write-side coordination)
2. **#2263** — Triple-Redundant Verification Architecture (this is the *index* leg of the triple-redundancy; Scrambler A/B/C and trigger-mechanism redundancy compose with it)
3. **#2269** — Three Fates Routing Pipeline (Fates run against a known-fresh index; freshness report feeds Clotho's candidate extraction with confidence)
4. **#2270** — Scribes Cathedral (Cathedral tablets are append-only, but the registry.yaml is covered by this fingerprint — a Scribe added to registry without index rebuild creates a DRIFT report)
5. **#2271** — SP-21 Tidbit Scribe (verify-before-assert pattern; fingerprint check at session-start IS the structural implementation of Rule 2 for corpus freshness)

---

## Implementation evidence

- **Code:** `librarian-mcp/src/indexer/fingerprint.ts` (committed B117, `e797320`, 160+ lines).
- **Integration:** `librarian-mcp/src/server.ts` session-start hook wired to `checkFreshness()`.
- **Performance:** 27.5s full / ~3s incremental / <500ms fingerprint-only verified B117.
- **Coverage:** 7,861 files, 12 scan directories.
- **Public instance:** internal TypeScript librarian-mcp. (The Python public `librarian-mcp` on PyPI does not yet use this — that's a K-session candidate follow-on.)

---

## Pollination Checklist

- [x] Save as A&A formal in `12_Innovations_AA/` (this file)
- [x] Cross-reference from `PROV_14_DRAFT.md` Section 2 #2273 entry (existing description covers this A&A)
- [ ] Update `PROV_14_DRAFT.md` to note A&A Formal file path for #2273 (B117 follow-on)
- [ ] Counsel review before Prov 14 filing (Harrity & Harrity or Lloyd & Mousilli — Founder picks)
- [ ] Optional: cite Claim 1 in R9 Technical Brief when explaining how Librarian avoids silent staleness
- [ ] Optional: include fingerprint report diagram in a future BST episode on "what makes a librarian a librarian"

---

**Innovation count:** no change (this formalizes #2273 which was already counted in B116).
**Crown Jewels:** candidate — Founder ratification needed. Recommend YES.
**Claims:** +9 claims (2 independent, 7 dependent) proposed for Prov 14.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). First A&A Formal of the Prov 14 thresh. Implementation preceded formalization — code landed B117 `e797320`, A&A landed same session.*

**FOR THE KEEP.**
