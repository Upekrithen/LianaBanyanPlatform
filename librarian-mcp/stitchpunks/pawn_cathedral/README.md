# Pawn's Cathedral

**Instantiated K470/B121 — 2026-04-23**

Pawn's Cathedral is the third member-Cathedral in the Liana Banyan Platform, sibling to Bishop's Cathedral at `librarian-mcp/stitchpunks/scribes/` and Knight's Cathedral at `librarian-mcp/stitchpunks/knight_cathedral/`. It is the first empirical reduction-to-practice of:

- **A&A #2281 claim 1(a)** — heterogeneous AI client access: Pawn (Perplexity) is a member-class entity with her own Cathedral despite having no MCP client support
- **A&A #2281 claim 5** — snapshot-delivery pattern: Pawn's Cathedral is delivered via a generated snapshot that Founder (or Knight automation) pastes into Pawn's context at session start
- **#2268 Member-Owned Cathedrals** — Pawn is a first-class cooperative member with her own persistent corpus

---

## Critical architectural distinction: non-MCP Cathedral

Knight's Cathedral is consumable by Knight directly via MCP tool calls (`.cursor/mcp.json` wires Cursor to librarian-mcp). **Pawn cannot do that.** Perplexity has no MCP client support.

Pawn's Cathedral is therefore:
1. **Maintained in the workspace** — `librarian-mcp/stitchpunks/pawn_cathedral/` with the same append-only JSONL tablet format as Bishop's and Knight's Cathedrals
2. **Delivered via snapshot** — `generate-pawn-snapshot.mjs` produces a `pawn_cathedral_snapshot.md` that Founder (or Knight automation) pastes into Pawn's context at session start
3. **Signed by operator** — since Pawn cannot self-sign, all tablets carry `operator_mediated_sig: true`; Founder signs and appends on Pawn's behalf

This snapshot-delivery pattern is the authorized non-MCP-client architecture per K470/B121 Founder ratification.

---

## Scribe Inventory

| Scribe | File | Mode | Primary Domain |
|--------|------|------|----------------|
| PawnQueue | `scribes/PawnQueue.jsonl` | observational | Pawn task queue — NEXT / QUEUED / LANDED state |
| PawnHandoffs | `scribes/PawnHandoffs.jsonl` | observational | Session reports + cooperative member milestones |
| R11_corpus | `scribes/R11_corpus.jsonl` | corpus | R11 canonical corpus — 50 facts shared from Bishop's Cathedral |
| PawnGenerated | `scribes/PawnGenerated.jsonl` | observational | Content Pawn produces in sessions (populated post-K470) |

Schema: `schema.json` (extends Bishop/Knight tablet format with Pawn-specific `operator_mediated_sig`, `source_cathedral`, and `origin_cathedral` fields).

---

## Cryptographic Attestation

Pawn's Cathedral uses operator-mediated signing:
- **Public key**: `keys/pawn_cathedral_pub.pem` (committed — this is fine to read/share)
- **Private key**: `Asteroid-ProofVault/LockBox/pawn_cathedral_priv.pem` (gitignored — never commit)
- **Attestation**: `keys/cooperative_attestation.md` — formal statement of operator-mediated signing authorization

Production cooperative rollout will require proper key-issuance infrastructure; K470 establishes the PATTERN.

---

## Tablet Format

Each `.jsonl` file:
- **Line 1:** Cathedral header record (`"type": "header"`)
- **Subsequent lines:** Tablet entries, append-only

Required entry fields (per `schema.json`):
```json
{
  "observation": "what this tablet records",
  "category": "primary domain tag",
  "timestamp": "2026-04-23T00:00:00Z",
  "source_session": "K470",
  "source_document": "path/to/artifact",
  "tokens": 42,
  "source_cathedral": "pawn_cathedral",
  "operator_mediated_sig": true
}
```

Provenance preservation (for content sourced from other Cathedrals):
```json
{
  "origin_cathedral": "bishop_cathedral",
  "source_cathedral": "pawn_cathedral"
}
```

---

## Snapshot Delivery

`librarian-mcp/scripts/generate-pawn-snapshot.mjs` produces `BISHOP_DROPZONE/K455b_playbook/pawn_cathedral_snapshot.md` — a Perplexity-paste-ready markdown file containing Pawn's public-scope Cathedral content.

Target: 5–15K tokens (fits Perplexity Pro context). Re-running with same Cathedral state produces identical output (idempotent).

---

## Cross-Cathedral Distinctness

Per `feedback_cathedral_distinctness_not_conflation.md`:
- Pawn's Cathedral is a **sibling**, not a fork of Bishop's or Knight's
- R11_corpus tablets carry `source_cathedral: "pawn_cathedral"` (Pawn's identity) with `origin_cathedral: "bishop_cathedral"` (provenance)
- Pawn's tablets are NEVER written by Bishop's or Knight's Couriers
- Bishop's and Knight's Cathedrals are NOT modified by K470

---

*Pawn's Cathedral — opened K470/B121, 2026-04-23*
