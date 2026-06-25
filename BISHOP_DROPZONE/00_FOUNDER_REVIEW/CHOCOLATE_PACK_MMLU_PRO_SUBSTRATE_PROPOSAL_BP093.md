# Chocolate Pack Proposal · MMLU-Pro Substrate · BP093

**Reference canon:** `canon_chocolate_eblets_bundle_packaging_user_environment_exchange_bp053`
**Session:** BP093 · 2026-06-24 · Bishop Sonnet 4.6
**Status:** STAGED — Founder review required before any dispatch

---

## §1 — Empirical Substrate Audit (BP093 gadget-verified)

**File:** `C:\Users\Administrator\AppData\Roaming\mnemosynec\substrate\verified_eblets.jsonl`

**Total lines: 17,927** across two distinct eblet classes:

### Class A — Context-Seed Eblets (provenance: `context_seed:mmlu_pro:<domain>:bp083`)
Lines 1–~12,099. Schema: `{question, answer, provenance, verified, sha256, timestamp}`.
These are the 316 eblets cited in the BP083 68/70 receipt — MMLU-Pro questions seeded as verified
question-context pairs. The `answer` field stores the domain label, NOT a TIC class.

**NOT TIC-schema. Spider blade cannot read these directly.**

Domain distribution from BP083 receipt:
| Domain | Eblets |
|---|---|
| Mathematics | 30 |
| Physics | 26 |
| Chemistry | 20 |
| Biology | 30 |
| Computer Science | 30 |
| Engineering | 23 |
| History | 18 |
| Philosophy | 19 |
| Law | 19 |
| Business | 12 |
| Economics | 16 |
| Psychology | 30 |
| Health | 25 |
| Other | 18 |
| **Total** | **316** |

### Class B — Plow Retrieval Eblets (provenance: `canonical_plow:<source>:<domain>:bp083`)
Lines ~12,100–17,927 (**~5,827 entries**). Schema: `{question, answer, provenance, verified, sha256, timestamp}`.
These are retrieved specialist content (Wikipedia, arXiv, OpenAlex) accumulated by BP083 Plow runs.
`answer` field stores full retrieved text (~300–500 chars). Same flat schema — **NOT TIC-schema.**

### Class C — TIC-Schema Vault Eblets (plow-cli-12blade.js output)
Location: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\plow_first_42q_bp093\`
Files: `7687.json`, `7688.json`, `7689.json` (3 files from current BP093 Plow run).
Schema: full TIC 5-field (`known`, `theories_open`, `eliminated`, `dependencies_upstream`,
`applications_downstream`). **Spider-compatible.**

**Truth-Always finding:** The 17,927-entry `verified_eblets.jsonl` is a FLAT schema file that
MnemosyneC app writes. It is NOT TIC-schema. The 12-blade Plow Spider blade reads `.json` files
from `--vault` with TIC structure. The two substrates are parallel — Plow generates TIC `.json`
files; MnemosyneC accumulates flat JSONL. They do not share a vault path by default.

---

## §2 — Spider Blade Routing Fix (Why BP093 First Run Gets 0 Hits)

The default vault path in `plow-cli-12blade.js` line 56:
```
const DEFAULT_VAULT = path.join(__dirname, '..', '..', 'Asteroid-ProofVault', 'state', 'eblets', 'active');
```

`state/eblets/active` does NOT EXIST (verified BP093). The directory was never created; eblets
from prior runs went to `state/eblets/plow_first_42q_bp093/` (3 files from current run only).

**If Founder wants substrate compounding:** the `--vault` flag must point to a directory containing
TIC-schema `.json` files from prior completed Plow runs. No such accumulated vault exists yet.
The current BP093 run is minting the first 3 TIC eblets into `plow_first_42q_bp093/`.

**The `verified_eblets.jsonl` flat substrate CANNOT feed Spider.** Bridging requires either:
1. A conversion script that transforms flat eblets → TIC `.json` files (Knight dispatch)
2. Point Spider at completed BP093 vault after full 42-Q run finishes

---

## §3 — Chocolate Pack Design

### What Is a Chocolate Pack?
Per `canon_chocolate_eblets_bundle_packaging_user_environment_exchange_bp053`: a curated,
content-addressed, signed bundle of eblets that any Frame user can download to pre-prime their
substrate before their first run. "Download a small file, get instant Spider hits."

### What Goes In the BP093 MMLU-Pro Chocolate Pack?

**Option A: Class A context-seed eblets (316 total, flat schema)**
Requires schema bridge conversion (Knight work ~1 sprint). Converts question+provenance pairs to
TIC THEORY_OPEN entries. Low Plow-hit value because no `known[]` content, but establishes
domain-indexed presence. Spider would find them but with minimal pull-through.

**Option B: Class B Plow-retrieval content (5,827 entries, flat schema)**
Higher value — these contain actual Wikipedia/arXiv/OpenAlex text. Requires same schema bridge.
Once converted to TIC `known[]` entries, Spider hits would carry real content weight (weight ≥ 0.6
per Miner threshold canon). This is the high-value Chocolate Pack.

**Option C: Class C TIC vault eblets (BP093 ongoing, grows with each Plow run)**
Native TIC format, Spider-ready today. Only 3 files exist currently. Value grows as BP093
42-Q run completes (expected ~42 TIC files after full run) and each subsequent Plow run adds more.

**Recommended: Option B + C combined**, after Knight builds the flat→TIC bridge.

---

## §4 — Tier Proposals

| Tier | Contents | Est. Size | Price |
|---|---|---|---|
| NANO | 1 domain (highest-density: math, 30 seed + ~400 Plow retrieval TIC) | ~5 MB | Free |
| CORE | 7 domains (math, physics, chemistry, biology, CS, engineering, health) | ~35 MB | Marks-priced |
| ULTRA | All 14 domains, full Class B + Class C TIC-converted | ~80 MB | Joules-priced |

---

## §5 — Why Other Frame Users Want This

A new Frame user without MMLU-Pro substrate runs 42 questions and sees Spider return 0 hits for
every question — BMV score of ~38 (confirmed by BP093 Q 7687: BMV 38.2, THEORY_OPEN,
DISCORDANT). With the MMLU-Pro Chocolate Pack pre-loaded:

- Spider finds relevant prior retrieved content (Wikipedia/arXiv text from Class B conversions)
- Miner passes weight-qualified candidates (≥0.6 weight threshold)
- Furnace filters, Three Fates votes, KNOWN eblets mint
- BMV rises from ~38 to projected 60–80+ on first run

**That is the substrate-compounds demonstration.** Run 1 (fresh vault) = 38 BMV.
Run 2 (Chocolate Pack loaded) = 60–80+ BMV. Same question. Same model. Different substrate.
This is "save money on AI inference by downloading a small file" made empirical on Day 1.

---

## §6 — Verification + Distribution

**Each Chocolate Pack:**
- sha256-verifiable (every eblet carries sha256 in its TIC record)
- Ed25519 signed by Founder's IP Ledger Ring Bearer key (per BP087 canon)
- Content-addressed via soccerball hash (manifest.json per 16-folder canon)

**Distribution:**
- Package Store tab in Coffee §0 (memory rule 14)
- Helm for members / Personal Library for non-members
- Free to non-profits per Folder-Tier Licensing canon (BP087 §5)
- NANO tier free to all

---

## §7 — Required Knight Work Before Pack Ships

1. **Flat→TIC bridge script** — converts Class B `canonical_plow:*` entries to TIC `.json` files
   with `known[{statement: retrieved_text, domain, confidence: 'medium', verified_by: 'canonical_plow_bp083'}]`
2. **Plow run on shared vault** — run 12-blade Plow with `--vault` pointing to converted Class B
   eblets to elevate THEORY_OPEN → KNOWN via Three Fates confirmation
3. **Pack assembler** — bundles `.json` files per domain tier, generates manifest.json, sha256,
   Ed25519 sign
4. **Package Store integration** — Coffee §0 tab wiring (UI Citadel pending per interface-alpha canon)

**Estimated Knight sprints:** 2–3 Marathons to ship NANO tier. CORE and ULTRA after.

---

## §8 — The Cooperative Narrative

The MMLU-Pro Chocolate Pack is the **first commercial deliverable** of the cooperative substrate.

- Founder ran BP083: 68/70 = 97.1%, grew 316 eblets + 5,827 Plow-retrieval entries
- Those eblets are NOW a product: downloadable by any Frame user
- The substrate that proved the benchmark becomes the substrate that bootstraps every new member's Frame
- "I didn't rent this knowledge from a cloud vendor. I downloaded it from a cooperative I'm part of."
- Composes with: canon_broke_the_sound_barrier_substrate_metaphor_bp085 · canon_dual_license_save_more_than_you_pay_sspl_pledge_or_apache_business_bp092 · canon_chocolate_eblets_bundle_packaging_user_environment_exchange_bp053

---

## §9 — Open Questions for Founder

1. Approve flat→TIC bridge conversion approach (§4 Option B+C)?
2. NANO price: free to all or free to non-profits only? (canon says "free to non-profits" — NANO free-to-all may be Founder's override)
3. Which domain goes in NANO tier? (Bishop recommends math: highest density, clearest benchmark story)
4. Chocolate Pack naming: "MMLU-Pro Starter Pack" or "Knowledge Seed: 14 Domains"?

---

*Staged for Founder review · no auto-dispatch · BP093 · 2026-06-24*
