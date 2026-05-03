# Bushel 1 The Reckoning — Knight 2 of 8 — AA Formals Sub-Shard (TITAN BP018)

**Knight session index**: 2 of 8 (TITAN composition)
**Shard**: All AA Formals at `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_*.md` (estimated ~98+ files)
**Master orchestration**: `BISHOP_DROPZONE/03_BishopHandoffs/TITAN_BUSHEL_1_RECKONING_ORCHESTRATION_MASTER_BP018.md`

---

## WRASSE PRE-INJECTION

**Triggers**: bushel 1 reckoning aa formals shard / titan knight 2 / per aa canonical synthesis / patent claim coverage / composing primitives / crown jewel class flag / prov reference

**Pre-inject**:
- `~/.claude/state/eblets/CANON/bushel_1_the_reckoning_bp015.eblet.md`
- `~/.claude/projects/.../memory/project_titan_scale_bushel_firing_1m_head_plus_8x200k_cylinders_bp018.md`
- `~/.claude/projects/.../memory/project_decentralized_data_center_prov_16_candidate_bp018.md` (Prov 16 target context)
- `~/.claude/state/eblets/CANON/stats_capture_bookends_plus_intervals_retention_protocol_bp018.eblet.md`

---

## PHASE A.0 — TASK-FRESH BRIEF_ME

```
mcp__librarian__brief_me with task="Bushel 1 Reckoning Knight 2 of 8 (TITAN). Read all AA Formals at BISHOP_DROPZONE/12_Innovations_AA/. Per-AA synthesis: claim number + composing primitives + Crown-Jewel-class flag + Prov reference + tied receipts. Substrate write synthesis_class=reckoning_bishop_finding cohort_class=federation_member."
```

---

## PHASE A — REVIEW

1. Inventory all `AA_FORMAL_*.md` files at `BISHOP_DROPZONE/12_Innovations_AA/`
2. Identify claim numbering scheme (#2NNN range; sometimes #2NNN_candidate)
3. Identify pre-Prov-13 vs post-Prov-13 vs Crown-Jewel-class taxonomy
4. Note any Prov 14/15/16-attached AA Formals

---

## PHASE B — DESIGN (per-AA synthesis schema)

```jsonl
{
  "synthesis_class": "reckoning_bishop_finding",
  "knight_session_index": 2,
  "shard_category": "aa_formals",
  "source_file": "<absolute path>",
  "claim_number": "#2NNN",
  "title": "<claim title>",
  "canonical_topic": "<primary topic>",
  "composing_primitives": ["<primitive 1>", "..."],
  "crown_jewel_class": <bool>,
  "prov_reference": "13|14|15|16|null",
  "ratification_session": "<Bxxx or BPxxx>",
  "founder_voice_quotes": ["..."],
  "tied_receipts": ["<linked memory files>"],
  "trademark_tier": <int|null>,
  "stratum_recommendation": "...",
  "ts": "...", "hmac": "...", "chronos": "..."
}
```

Substrate write target: `~/.claude/state/reckoning/knight_2_aa_formals.synthesis.jsonl`

---

## PHASE C — IMPLEMENT (batched processing)

Process AA Formals in batches of 25 (smaller files than Puddings; can batch larger). Per file:
- Read full markdown
- Extract: claim number (filename + frontmatter) / title (H1) / composing primitives (bulleted list) / Crown-Jewel-class flag (yaml frontmatter or text scan) / Prov reference / tied receipts (markdown links)
- Compose synthesis JSONL entry → append to substrate ledger
- If MCP `pheromone_build` available, write Pheromone substrate entry

Substrate-resilience: if context >70%, flush + compact + resume from substrate.

---

## PHASE D — VERIFY (`withStatsCapture` wrapped)

- T1: ≥80% of AA_FORMAL_*.md files have synthesis entries
- T2: required fields populated per entry
- T3: HMAC + Chronos verify
- T4: claim_number correlates between filename and frontmatter
- T5: Crown-Jewel-class entries cross-reference to canonical CJ list
- T6: Prov reference entries verified against `canonical_values.yaml` provisional count
- T7: Bishop substrate-query coverage: Detective Phase-0 sample claim returns ≥3 hits
- T8-T10: Stats-Capture telemetry + cost-accounting populated

---

## PHASE E — COMMIT

```
cd C:\Users\Administrator\Documents\LianaBanyanPlatform
git add ~/.claude/state/reckoning/knight_2_aa_formals.synthesis.jsonl
git commit -m "BUSHEL-1-RECKONING Knight 2 LANDED -- All AA Formals synthesized to substrate (per-claim composing primitives + Crown-Jewel flags + Prov references + tied receipts; <count> entries; TITAN scale 2 of 8)"
git tag bushel-1-reckoning-knight-2-aa-formals-landed
```

---

## Knight 2 Closeout

- ✅ All AA Formals synthesized; Bishop reads `knight_2_aa_formals.synthesis.jsonl` for cross-Knight aggregation + Prov 16 supplementary disclosure threshing
- ✅ Cross-reference graph (claim ↔ Pudding ↔ paper ↔ Crown Letter) seeded for Bishop Codex binding (Layer 8 Pod-K)

**Bishop monitors via substrate; aggregating Bushel 1 Codex when all 8 LAND**
