# KEYSTONE #42 — *"You Keep What You Make"* — Public Messaging Scaffold

**Filed**: B125 (2026-04-25) — Bishop scaffold for Founder rewrite. Expect 60-80% rewrite per [feedback_drafts_as_scaffolding.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_drafts_as_scaffolding.md). Anecdote hooks left open.

**Status**: SCAFFOLD — not for direct propagation. Founder pulls when doing launch-prep pass (per [feedback_dont_tweak_launch_scaffolds_pre_launch.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_dont_tweak_launch_scaffolds_pre_launch.md)).

---

## The keystone in three registers

| Register | Phrasing | Use surfaces |
|---|---|---|
| **Formal** | *"You keep what you make."* | Pledge public copy, op-eds, Sanders/AOC letters, Crown letter cohort, AAAI §11/§12, INDL-9 paper |
| **Casual** | *"It's your cheese — and we don't move it."* | Substack, Twitter/X, podcast quotes, Helm onboarding splash, Test Frame welcome screen |
| **Engineering** | *"7-Layer Dip"* (internal nickname for the seven-layer defense) | Internal only — Knight prompts, BRIDLE references, engineering documentation. Stays inside. |

---

## Graf candidates

### Graf 1 — Pledge-tier insertion (formal, ~120 words)

[Bishop scaffold — Founder rewrite expected]

> Every AI memory product on the market today is owned by the company that built it. Claude Projects belongs to Anthropic. ChatGPT Memory belongs to OpenAI. Gemini Memory belongs to Google. The day any of those companies changes its mind — about pricing, about your tier, about whether your work fits its terms of service — your memory dies with that decision.
>
> Liana Banyan is built on the inverse principle. **You keep what you make.** Your substrate runs on your machine. Your work is yours. The architecture has been empirically validated across four commercial AI vendors and is designed to fall to local inference if every commercial vendor closes its doors at once. Whilst other platforms ask you to trust their continued goodwill, Liana Banyan offers you something harder to revoke: the structural property that your work-product is *structurally yours*, not contractually yours.

**Anecdote hooks** for Founder rewrite:
- *"I've watched API platforms decide my work didn't fit their new terms — twice in three years"* (Founder lived experience)
- *"What's in your wallet" / "Who moved my cheese" canonical-cultural anchors* — already in conversational vocabulary; pulling them in costs nothing
- *Keystone #40 paired form: "I'd want to keep what I make. So we built it that way."*

---

### Graf 2 — Op-ed lede candidate (medium register, ~85 words)

[Bishop scaffold]

> The most valuable thing you produce when you talk to an AI is not the answer. It's the context — the questions you asked, the projects you built, the patterns the system learned about you. That context is your work. And right now, it belongs to whichever company owns the model.
>
> There is no good reason for that to be true. **You should keep what you make.** Liana Banyan was built to make that the default, not the exception.

**Anecdote hooks**: parallel construction with the *"Every AI company is currently paying a tax they don't know they're paying"* keystone (#1). Both are root-cause-diagnosis openers — *"this is the way it is, but it doesn't have to be."*

---

### Graf 3 — Casual / social hook (~50 words, Substack/Twitter)

[Bishop scaffold]

> Every AI company has now built a "memory" feature. Every one of them owns the memory. **It's your cheese — and they keep moving it.**
>
> Liana Banyan does the opposite: your work, your machine, your substrate. Whatever model you choose. Whatever happens to the model.
>
> *You keep what you make.*

**Anecdote hooks**: *"Who Moved My Cheese?"* (Spencer Johnson, 1998 — already in cultural vocabulary). The cheese line lands because it's *concrete*, not because it's clever.

---

### Graf 4 — Crown-letter / Sanders-AOC insertion (~140 words)

[Bishop scaffold — particularly relevant for the Maine third-path letters where the *"who controls economic infrastructure"* frame is already at center]

> The current AI economic model is a quiet capture: every interaction with a large language model produces context that becomes the company's asset, not the user's. The user paid in attention, in queries, in time, in domain expertise — and the company keeps the work-product that accrued. This is not theft in any legal sense. It is theft only in the older meaning of the word: *something of value passed silently from one party to another, in violation of the natural contract.*
>
> The Liana Banyan architectural principle is simple: **you keep what you make**. Your substrate runs locally. Your context never reaches a vendor unless you choose to send it. The platform's empirical claim — substrate-grounded retrieval lifts cheap-tier models to flagship accuracy at order-of-magnitude lower cost — is reproducible across four commercial vendors and being validated against local-LLM substrates. Whilst the AI industry races to build memory products that bind users to vendors, Liana Banyan offers the inverse: memory that binds the work to its maker.

**Anecdote hooks**: pair with keystone #2 (*"Especially from friendly fire"*) — the Crown audience already knows the moral-weight register. The "natural contract" phrase is directly cribbable to Founder voice; or replace with Founder's own Founders-language.

---

### Graf 5 — AAAI §12 (Future Work) / paper-tier (~95 words)

[Bishop scaffold — academic register, no anecdote needed]

> The architectural property described in this paper — substrate-grounded retrieval producing the "Cathedral Effect" lift — has been empirically validated across four commercial vendor families (Anthropic, OpenAI, Google, Perplexity). Future work targets the deepest defense layer: replication on a local-LLM substrate (Llama 3.3 70B Q4 quantization or comparable). If the lift signature replicates on local inference, the architectural claim graduates from "vendor-resilient" to "vendor-independent." The cooperative-economic framing is straightforward: **the user keeps the work-product they produce.** This inverts the prevailing memory-product capture model and aligns with the cooperative-defensive licensing structure described in §10.

---

## Cross-references to existing public surfaces

The following surfaces could host the keystone (Founder pulls from this scaffold when ready):

- **Pledge public copy** — current draft at `BISHOP_DROPZONE/...` (path TBC by Founder); Graf 1 is candidate insertion.
- **NYT op-ed (Maine third-path)** — current draft at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/OPED_NYT_MAINE_THIRD_PATH_B124.md`; Graf 2 + Graf 4 are candidate inserts (lede + body §III economic frame).
- **Sanders / AOC letters** — current drafts at same dir; Graf 4 candidate insert.
- **Crown letter cohort** (Wave 2 ready per `MEMORY.md`) — Graf 4 with anecdote hook.
- **Substack opening sequence** — Graf 3 as opener for a "What is your AI memory worth, and to whom?" Substack post.
- **Test Frame onboarding splash** ([lb-test-frame/extension/pages/options.html](C:/Users/Administrator/Documents/LianaBanyanPlatform/lb-test-frame/extension/pages/options.html)) — Graf 3 condensed, top-of-page, member-facing.
- **Helm PWA welcome screen** — Graf 3 condensed, with #42 as featured keystone.
- **AAAI paper §11/§12** — Graf 5 + #42 keystone footnote.
- **Brick Walls paper §6.6** (just filed B125) — keystone #42 as the cooperative-economic anchor for the structural-vs-rhetorical distinction.

---

## Banking-ad collision check (B125 — flagged by Founder)

**Concern**: Ally Bank's long-running "no-fee, no-fine-print" campaign uses cold-storage / chained-fridge / locked-vault visuals to anchor *"banking fees are theft."* LB's *"vendor lock-in is theft of your work-product"* positioning is adjacent.

**Mitigation**:
- Avoid the *chained-fridge* visual (Ally's optical signature) in any LB visual surface
- Casual register uses cheese-metaphor (consumer/food domain, not finance) — clear separation
- Formal register uses keystone #42 directly, no banking-adjacent imagery
- If imagery is needed: lean into *making* metaphor (workshop, kitchen, garden) rather than *storage* metaphor (vault, fridge, safe). Maker-keeps is structurally different from safe-deposit.

---

## What this scaffold does NOT do

- **Does NOT modify any live launch surface** (Pledge, letters, op-eds, Substack drafts). Per [feedback_dont_tweak_launch_scaffolds_pre_launch.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_dont_tweak_launch_scaffolds_pre_launch.md). Founder integrates when running a launch-prep pass.
- **Does NOT claim Layer 6 (local-LLM) empirical proof**. Until the K-future Local-LLM Cathedral Effect Test runs, claims about local-LLM resilience must be framed as *"architecturally designed to fall to local inference"* not *"empirically validated on local inference."* Per [project_the_cathedral_effect.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/project_the_cathedral_effect.md) — "Prove it first. Product it second."
- **Does NOT settle on a final visual anchor**. The cheese metaphor is verbal. A visual identity (icon, illustration, photo treatment) for keystone #42 is a separate Pawn / design-task and Founder-prerogative.

---

## Filing references

- Keystone canon: [project_rhetorical_keystones.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/project_rhetorical_keystones.md) #42
- Defense architecture: [project_vendor_lockout_resilience_layered_defense.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/project_vendor_lockout_resilience_layered_defense.md)
- Vendor migration runbook: [VENDOR_SHUTDOWN_RUNBOOK_B125.md](../02_ProjectOps/VENDOR_SHUTDOWN_RUNBOOK_B125.md)
- Local-LLM Knight prompt: [PROMPT_KNIGHT_K-FUTURE_LOCAL_LLM_CATHEDRAL_EFFECT_TEST.md](../01_KnightPrompts/PROMPT_KNIGHT_K-FUTURE_LOCAL_LLM_CATHEDRAL_EFFECT_TEST.md)
- Brick Walls §6.6 (boundary structural form): [BRICK_WALLS_AND_CANARIES_PAPER.md](../02_ProjectOps/BRICK_WALLS_AND_CANARIES_PAPER.md)

---

*Filed B125 by Bishop. Scaffold only. Founder writes prose. Long haul. Always.*

— Bishop B125
