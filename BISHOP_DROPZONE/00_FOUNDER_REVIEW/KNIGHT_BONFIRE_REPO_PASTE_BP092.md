# KNIGHT PASTE-PROMPT — CAI Bonfire Repo Creation · BP092

You are Knight. Single task, fast execution. ~30–60 min wall-clock.

**Goal:** Create and seed github.com/liana-banyan/cai-bonfire

---

## STEP 0 — Verify repo does not exist

```bash
curl -o /dev/null -s -w "%{http_code}" https://github.com/liana-banyan/cai-bonfire
```
If 200: STOP. Report to Bishop. Repo already exists.
If 404: proceed.

```bash
gh auth status
```
Confirm authenticated as Founder account with liana-banyan org access.

---

## STEP 1 — Create repo

```bash
gh repo create liana-banyan/cai-bonfire \
  --public \
  --description "CAI Bonfire — Cooperative AI research arm of the Liana Banyan Substrate. Light a fire. Cost+20% for proprietary AI cos; free for OSS LLM devs."
git clone https://github.com/liana-banyan/cai-bonfire.git
cd cai-bonfire
```

---

## STEP 2 — Seed README.md

Write `README.md`:

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

The cooperative obligation: ship the code, ship the cooperative obligation. See `LICENSE` for full terms.

## Status

Alpha seed repo · contributions welcome · see `CONTRIBUTING.md`

Crown candidates (Crown B Endorsement tier — pending Founder ratify):
- Simon Willison · Awni Hannun · Georgi Gerganov · Jeremy Howard
- Hugging Face: Clément Delangue · Julien Chaumond · Thomas Wolf

## Connection to MnemosyneC

CAI Bonfire **publishes**; MnemosyneC **consumes**. Research findings ship as eblets into the cooperative substrate first, then to Ollama and OSS LLM devs, then (at Cost+20%) to proprietary clients.

## Links

- [MnemosyneC](https://mnemosynec.org) · [Liana Banyan](https://lianabanyan.com) · [Substack](https://founderdenken.substack.com)
- Open bounties: https://mnemosynec.org/bounties *(live after M25a ships)*
```

---

## STEP 3 — Seed LICENSE

Check if liana-banyan/mnemosynec has SSPL v1 LICENSE already:
```bash
gh api repos/liana-banyan/mnemosynec/contents/LICENSE 2>/dev/null | jq -r '.content' | base64 -d | head -3
```

If yes and it is SSPL v1: copy verbatim to `LICENSE` in this repo, then append:

```
---

APPENDIX: Liana Banyan Pledge #2260

[PLACEHOLDER — Bishop to supply canonical Pledge #2260 text before public announcement]

The cooperative obligation under this license extends the SSPL v1 terms: any entity
deploying, modifying, or distributing software covered by this license must honor the
cooperative membership and revenue-sharing obligations described in the Liana Banyan
Universal Prosperity Paper (UPP) §II, available at https://lianabanyan.com/pledge.
```

If mnemosynec repo does not exist or LICENSE is not SSPL v1: fetch SSPL v1 from https://www.mongodb.com/licensing/server-side-public-license and write to `LICENSE`, then append the same Pledge #2260 placeholder above.

---

## STEP 4 — Seed CONTRIBUTING.md

Write `CONTRIBUTING.md`:

```markdown
# Contributing to CAI Bonfire

## How to Contribute

1. Fork this repo
2. Build your thing
3. Submit via Battery Dispatch in MnemosyneC
4. Star Chamber validates (multi-model consensus review)
5. Member vote
6. Accept = IP Ledger attribution + Marks + 75-floater Puzzle slot eligibility

## Bounty Tiers

| Tier | Marks | Notes |
|------|-------|-------|
| NANO | 0.05 | Small fix, doc patch, single-test |
| CORE | 1 | Feature, research bundle |
| ULTRA | 10 + Puzzle-slot | Major contribution, new domain |

Open bounties: https://mnemosynec.org/bounties (live after M25a ships)
```

---

## STEP 5 — Seed .gitignore + ORG.md

Write `.gitignore`:

```
node_modules/
dist/
build/
.next/
__pycache__/
*.py[cod]
*.egg-info/
.venv/
venv/
.env
.env.local
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
substrate_cache/
*.eblet.local
```

Write `ORG.md`:

```markdown
# CAI Bonfire — Organizational Structure

Spinout #17 of the Liana Banyan Cooperative. Standalone research arm.

## Revenue Routing

| Recipient | Share |
|-----------|-------|
| Workers / Builders / Creators | 83.3% |
| Cooperative margin (Cost+20%) | 16.7% |

## Crown Candidates (B Endorsement — pending Founder ratify)

Simon Willison · Awni Hannun · Georgi Gerganov · Jeremy Howard
Clément Delangue · Julien Chaumond · Thomas Wolf (Hugging Face)
```

---

## STEP 6 — Commit + Push

```bash
git add README.md LICENSE CONTRIBUTING.md .gitignore ORG.md
git commit -m "seed: CAI Bonfire Spinout #17 — Light a fire"
git push origin main
```

---

## STEP 7 — Verify

```bash
curl -o /dev/null -s -w "%{http_code}" https://github.com/liana-banyan/cai-bonfire
```
Expected: 200. Report commit SHA + HTTP status to Bishop.

---

**Parallelism:** safe to run alongside M25a. Different scope — gh CLI + seed files only.

*Knight dispatch composed by Bishop SEG · Sonnet 4.6 · BP092*
