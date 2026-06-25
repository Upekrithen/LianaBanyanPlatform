# KNIGHT QUICK TASK — CAI Bonfire Repo Creation
**BP092 · Sonnet 4.6 · §14 + §15 + §17 BLOOD · Caithedral always · MIC per-Block-close**
**Knight = operator mechanic per BP089 · Bishop composes, Knight creates**
**NO patent claims · NO empirical receipt claims**
**Estimated wall-clock: 30–60 min**

---

## PRE-BLOCK — Gadget Verify

**Gadget 1 — Confirm repo does not yet exist:**
```bash
curl -o /dev/null -s -w "%{http_code}" https://github.com/liana-banyan/cai-bonfire
```
Expected: 404. If 200, STOP and report to Bishop — repo already exists, reconcile before proceeding.

**Gadget 2 — Confirm gh CLI auth and org access:**
```bash
gh auth status
gh org list
```
Expected: authenticated as Founder account; liana-banyan org visible. If not, resolve auth before proceeding.

**MIC Block-close PRE-BLOCK:** gadgets run, statuses confirmed, proceed to BLOCK 1.

---

## BLOCK 1 — Create Repo via gh CLI

```bash
gh repo create liana-banyan/cai-bonfire \
  --public \
  --description "CAI Bonfire — Cooperative AI research arm of the Liana Banyan Substrate. Light a fire. Cost+20% for proprietary AI cos; free for OSS LLM devs."
```

Do NOT initialize with README via gh CLI flag — seed files are created manually in BLOCK 2–5, then committed in BLOCK 6.

After creation:
```bash
git clone https://github.com/liana-banyan/cai-bonfire.git
cd cai-bonfire
```

**MIC Block-close BLOCK 1:** repo created, clone confirmed, cwd = cai-bonfire root.

---

## BLOCK 2 — Seed README.md

Create `README.md` at repo root with the following content verbatim:

```markdown
# CAI Bonfire — Light a Fire

> Cooperative research arm of the Liana Banyan Substrate. Designed to Be Copied.

## What It Is

CAI Bonfire is the research-and-tooling publication arm of the [Liana Banyan Cooperative Substrate](https://lianabanyan.com).

**Mission:** Publish ALL substrate research free to [Ollama](https://ollama.com) and open-source LLM developers. Charge proprietary AI companies (Anthropic, OpenAI, Google, Meta, Cohere, Mistral) Cost+20% subscription for the same body of work.

One fire spreads to many. Cooperative substrate research lights the public-domain torch that proprietary labs can warm themselves at — at Cost+20%.

## Who Gets It Free

- Ollama and all Ollama-compatible local LLM runners
- Open-source LLM developers (Hugging Face, llama.cpp, whisper.cpp, FastAI, etc.)
- Any researcher publishing under OSI-approved or equivalent open license
- Cooperative Substrate members

## Who Pays Cost+20%

Proprietary AI companies with closed-weight models and/or closed training pipelines:
Anthropic · OpenAI · Google DeepMind · Meta AI · Cohere · Mistral AI · and equivalents

Cost+20% is the cooperative standard margin. No extraction. No lock-in. Full research access.

## License

**SSPL v1 + Liana Banyan Pledge #2260**

The cooperative obligation: ship the code, ship the cooperative obligation. See `LICENSE` for full terms and the Pledge #2260 appendix.

## Status

Alpha seed repo · contributions welcome · see `CONTRIBUTING.md`

Crown candidates (Crown B Endorsement tier — pending Founder ratify):
- Simon Willison
- Awni Hannun
- Georgi Gerganov
- Jeremy Howard
- Hugging Face co-founders: Clément Delangue · Julien Chaumond · Thomas Wolf

## Connection to MnemosyneC

CAI Bonfire **publishes**; MnemosyneC **consumes**.

Research findings ship as eblets into the cooperative substrate first, then to Ollama and OSS LLM devs, then (at Cost+20%) to proprietary clients. The substrate is the distribution rail.

## Links

- [MnemosyneC](https://mnemosynec.org) — the cooperative AI substrate
- [Liana Banyan](https://lianabanyan.com) — the cooperative
- [Founder's Substack](https://founderdenken.substack.com) — Paper-a-Day cadence
- Open bounties: https://mnemosynec.org/bounties *(live after M25a ships)*
```

**MIC Block-close BLOCK 2:** README.md written to repo root.

---

## BLOCK 3 — Seed LICENSE File

**OQ-1 (open question, Founder ratify):**
Knight pulls SSPL v1 canonical text from where?

Bishop default: copy from canonical MongoDB source at https://www.mongodb.com/licensing/server-side-public-license — or, if MnemosyneC repo already has a `LICENSE` file containing SSPL v1, pull verbatim from there.

**Knight action:** resolve OQ-1 by checking MnemosyneC repo first:
```bash
gh repo view liana-banyan/mnemosynec --json name 2>/dev/null || echo "no-mnemosynec-repo"
# If exists:
gh api repos/liana-banyan/mnemosynec/contents/LICENSE | jq -r '.content' | base64 -d 2>/dev/null | head -5
```

If MnemosyneC LICENSE is SSPL v1, pull verbatim. Otherwise, fetch from MongoDB canonical URL.

**LICENSE file structure:**

```
[SSPL v1 full text — verbatim from canonical source]

---

APPENDIX: Liana Banyan Pledge #2260

[Pledge #2260 canonical text — pull from cooperative substrate eblet or BISHOP_DROPZONE if staged]
```

If Pledge #2260 text is not yet accessible via filesystem, Knight uses this placeholder and flags for Bishop:

```
APPENDIX: Liana Banyan Pledge #2260

[PLACEHOLDER — Bishop to supply canonical Pledge #2260 text before public announcement]

The cooperative obligation under this license extends the SSPL v1 terms as follows:
any entity deploying, modifying, or distributing software covered by this license
must honor the cooperative membership and revenue-sharing obligations described
in the Liana Banyan Universal Prosperity Paper (UPP) §II, available at
https://lianabanyan.com/pledge.
```

**MIC Block-close BLOCK 3:** LICENSE written, OQ-1 resolution noted in commit message.

---

## BLOCK 4 — Seed CONTRIBUTING.md

Create `CONTRIBUTING.md` at repo root:

```markdown
# Contributing to CAI Bonfire

CAI Bonfire follows the 9-step Liana Banyan dev recruitment funnel
(canon_dev_recruitment_funnel_social_letter_fork_bounty_ip_ledger_attribute_loop_bp092).

## How to Contribute

1. Fork this repo
2. Build your thing
3. Submit via Battery Dispatch in MnemosyneC
4. Star Chamber validates (multi-model consensus review)
5. Member vote
6. Accept = IP Ledger attribution + Marks accrual + 75-floater Puzzle slot eligibility

Puzzle slot eligibility is separate from the 60 Empress winner slots and the
~165 country baseline slots.

## Bounty Tiers

| Tier | Marks | Notes |
|------|-------|-------|
| NANO | 0.05 Marks | Small fix, doc patch, single-test addition |
| CORE | 1 Mark | Feature, non-trivial refactor, domain research bundle |
| ULTRA | 10 Marks + Puzzle-slot eligibility | Major contribution, new domain, validated research |

Bounty tiers per `canon_generate_dev_contribution_bounty_poster_gadget_spec`.

## Open Bounties

Open bounties will be listed at https://mnemosynec.org/bounties after M25a ships.

## IP Ledger

All accepted contributions are logged in the cooperative IP Ledger with contributor
attribution. Marks accrue at acceptance time. One-year clearing window applies per
canonical Marks clearing table (BP086).
```

**MIC Block-close BLOCK 4:** CONTRIBUTING.md written.

---

## BLOCK 5 — Seed .gitignore + ORG.md

**`.gitignore`** — standard for TS/Node/Python research project:

```gitignore
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
dist/
build/
.next/
.nuxt/
.cache/

# Python
__pycache__/
*.py[cod]
*$py.class
*.egg-info/
.eggs/
dist/
build/
.venv/
venv/
env/
.env

# Research artifacts
*.ipynb_checkpoints/
.jupyter/

# OS
.DS_Store
Thumbs.db
desktop.ini

# Editor
.vscode/
.idea/
*.swp
*.swo

# Local env
.env
.env.local
.env.*.local

# Substrate
*.eblet.local
substrate_cache/
```

**`ORG.md`** — Spinout #17 governance:

```markdown
# CAI Bonfire — Organizational Structure

## Spinout #17

CAI Bonfire is Spinout #17 of the Liana Banyan Cooperative, above the Sweet 16.
It operates as a standalone research arm reporting to Liana Banyan Corporation.

## Governance

- Reports to: Liana Banyan Corporation
- Operates as: standalone cooperative research arm
- License: SSPL v1 + Pledge #2260

## Revenue Routing

All revenue follows the canonical cooperative split:

| Recipient | Share |
|-----------|-------|
| Workers / Builders / Creators | 83.3% |
| Cooperative margin (Cost+20%) | 16.7% |

No extraction. No investor dividend. No proprietary lock-in.

## Who Pays

Proprietary AI companies with closed-weight models pay Cost+20% subscription
for access to the same research published free to OSS LLM developers.

## Crown Candidates (B Endorsement Tier)

Pending Founder ratify:
- Simon Willison
- Awni Hannun
- Georgi Gerganov
- Jeremy Howard
- Clément Delangue (Hugging Face)
- Julien Chaumond (Hugging Face)
- Thomas Wolf (Hugging Face)
```

**MIC Block-close BLOCK 5:** .gitignore and ORG.md written.

---

## BLOCK 6 — Commit + Push

```bash
git add README.md LICENSE CONTRIBUTING.md .gitignore ORG.md
git commit -m "seed: CAI Bonfire Spinout #17 — Light a fire"
git push origin main
```

If default branch is `master` not `main`, adjust accordingly.

**MIC Block-close BLOCK 6:** commit SHA logged, push confirmed.

---

## BLOCK 7 — Verify

```bash
curl -o /dev/null -s -w "%{http_code}" https://github.com/liana-banyan/cai-bonfire
```
Expected: 200.

Spot-check all 5 files render in browser:
- README.md (root)
- LICENSE
- CONTRIBUTING.md
- .gitignore
- ORG.md

Report commit SHA + HTTP 200 receipt to Bishop.

**MIC Block-close BLOCK 7:** HTTP 200 confirmed, all files render, dispatch complete.

---

## Open Questions — Founder Ratify Pre-Fire

**OQ-1 (only open question):**
SSPL v1 source for LICENSE file.
Bishop default: MongoDB canonical URL or existing MnemosyneC repo LICENSE if present.
**Y to Bishop default / [specify alternate source]**

---

## Parallelism Note

This dispatch CAN fire in parallel with M25a (Hugo + bounties page).
Scope isolation: gh repo create + 5 seed files — zero overlap with Hugo build/Firebase deploy.
Worktree isolation: not needed. gh CLI operates in its own cwd.

---

*Bishop SEG · Sonnet 4.6 · BP092 · Composed for Founder review*
