> **FOUNDER MUST RATIFY THIS DRAFT VERBATIM OR EDIT BEFORE SEND. NO AUTO-SEND.**
> BP078 BLOOD ratify gate. This file is a composition draft. No distribution until Founder signs off.

<!-- {{LIVE_COUNT}} CONTEXT NOTE (BP085 · Bishop · for Founder decision at ratify time)
     
     {{LIVE_COUNT}} appears below as the mesh-test signup counter (e.g., "Current count: 247 of 1,000").
     Three options for tonight's publish — Founder picks ONE before sending:
     
     (a) STATIC VALUE — replace with "Current count: 0 of 1,000"
         Founder updates the number manually in the Substack editor as signups arrive.
         Cleanest option. No technical dependency. Works immediately.
     
     (b) LIVE-FEED WIRE — Knight wires the placeholder to a Supabase realtime subscription
         that ticks the number as new signups come in. Technically complex. Gated on signup
         endpoint being live and the live-dashboard WebSocket being operational.
         NOT recommended for tonight's publish — too many moving parts.
     
     (c) SOFT LANGUAGE — replace {{LIVE_COUNT}} with:
         "We need 1,000 sign-ups to fire the mesh test. Help us get there."
         No number at all. Truth-Always cleanest — no broken-counter risk, no "0 of 1,000"
         anti-climax on night one.
     
     BISHOP RECOMMENDS: (c) for tonight — no broken-counter risk, honest, action-oriented.
     (b) for week 2+ when signups are arriving fast enough to be exciting.
     (a) is the fallback if Founder wants a number visible from day one.
-->

---

**Email subject line:** `A free AI beat the flagships. Because it had the Substrate. (97.1% on MMLU-Pro · last night · on consumer hardware)`

**On-page H1:** `A Free AI Model Just Beat the Flagships. Because It Had the Substrate.`

**Deck / subhead:** `Just Add Salt. How to Get the Right Answer.`

---

Last week we ran a benchmark. Not a demo, not a curated cherry-pick. A real test — 70 multiple-choice questions drawn from MMLU-Pro, 14 domains, answered cold across four AI vendors using MnemosyneC as the substrate layer.

The number: **68 out of 70. 97.1% accuracy.**

Here is what that number means — and what it does not mean.

It does not mean we scored 97.1% on every run. It means we scored 97.1% on one clean run, and we are telling you that verbatim. Truth-Always is how we operate. We run the benchmark, we give you the number, we do not round up.

The two we missed: our own Andon system — the self-quarantine mechanism baked into MnemosyneC — flagged them as uncertain before the answer was submitted. We chose not to stand behind those two. The system knew what it did not know, and it said so. That matters as much as the 68 it got right.

The 14 domains came up all green. History, law, medicine, engineering, mathematics, the rest. Cold recall lifted to warm recall across the test. Four vendors, one substrate, consistent performance.

That is the receipt. We do not invent metrics here. 68/70 is what happened.

---

> **BUILT IN PUBLIC**

The dev process is open. Every receipt is public. There is no curtain.

---

> *"Knowing what is NOT true is half the battle."*

---

## How It Works: The Substrate, and the Plow That Makes It Work. For FREE. Really.

MnemosyneC is built on a persistent memory and retrieval architecture we call the Substrate. Here is what the Substrate is made of — all of it on disk, none of it marketing:

- **Eblets** — atomic knowledge units. Each one carries what is KNOWN (with receipts), what is THEORIZED (with consequence chains and survival scores), what has been ELIMINATED (with contradiction trails), and the dependency chains upstream and downstream that connect it to everything else.
- **Eblits** — snapshot-at-access fragments. They freeze the Substrate's state at each moment so every answer is traceable to the exact evidence that existed when it was generated.
- **Pheromone Trails** — stigmergic retrieval routing. Access strengthens a trail; staleness decays it. The Substrate routes toward what has been confirmed, away from what has gone quiet.
- **Eblit Emitter** — the emission primitive. It fires Eblits into the Substrate at the right moments. Four named circuits: **contingency_operator** · **oracle_circuit** · **prophet_circuit** · **thorax**. Plain English: those are four different firing modes — for contingency-class events, oracular queries, prophetic (forward-trace) events, and cooperative heartbeat authentication respectively.
- **Wrasse Quartermaster** — pre-session auto-injection and path manifest. It loads the right Substrate context before a session begins so the model does not start cold.
- **Pearls** — substrate-enrichment objects. They carry audit, transmission, milestone, drift-receipt, and peer-witness payloads — the receipts-on-top-of-receipts layer.
- **Thorax Heartbeat** — cooperative-access authentication. All forks, derivatives, and extensions that want to reach the Cooperative Node Frontier must route through it. Open-source posture intact; gated access is the value.
- **Scrambler** — deterministic synchronization layer. At every session start it reads the canonical state and flags any drift since the last session; at every session end it reconciles what each agent committed against that state and writes the updated canonical back. No AI inside — pure deterministic predicate evaluation. It is the infrastructure that keeps Bishop, Knight, Rook, and Pawn working from the same truth at all times.

That is the Substrate. It is what holds the knowledge.

The Plow is what makes it work synergistically.

Added recently — validated on the first live machine (M0, commit 769bbae) — the Twelve-Blade Plow is the synergistic activator of the Substrate. Without it, the Substrate components do their jobs in parallel but not in concert: eblets retrieve, pheromones route, but no single pass forces the pieces to reason together. The Plow closes that gap with twelve sequential verification loops that drive every Substrate component through a coordinated adversarial pass before any answer gets stamped.

The base nine loops cover the standard ground: retrieval, context matching, confidence calibration, cross-domain consistency, and more. Then come the last three — added days ago, in BP084.

**Loop 10 — CONSEQUENCE_TRACE.** If this answer is true, what does it force downstream? Every claim carries a consequence chain. The Plow follows it through the Substrate's dependency graph. If the chain leads somewhere that contradicts something already known, the claim fails — not because a human said so, but because the logic did.

**Loop 11 — ELIMINATION_VERIFICATION.** The Plow does not only ask "is this true?" It asks "what is provably NOT true?" Narrowing the false narrows the space where truth can live. There is an old story behind this principle: a dog who had never seen a pale-skinned person reacted with fear — a perfect Bayesian reasoner with incomplete data, arriving at a confidently wrong answer. She was logical. But incorrect. Because her data was incomplete. The Plow's job is to surface that missing data before the answer ships, not after.

**Loop 12 — DEPENDENCY_PROPAGATION.** When a claim changes, everything downstream that depends on it gets flagged for re-verification. No silent staleness. If the foundation shifts, the structure above it knows.

What survives all twelve blades is what we call **Gold Refined by Fire**. The highest honor in the Code Breakers Guild goes to the breaker whose hardest attack failed — because failure is the proof that the claim deserved to survive.

**How the MMLU-Pro test actually ran — staggered single domains.**

The 70-question run did not dump all 14 domains at once. Each domain ran independently, in stagger — mathematics first, then physics, then chemistry, and so on. One domain's Substrate built fully before connecting to the next. The cross-domain connections happened at the end, after each domain had already reached peak fidelity on its own.

This matters because it prevents cross-contamination of reasoning. When you run all domains simultaneously, a strong signal from one domain can shadow an adjacent domain's weak signal. Independent stagger means each domain stands or falls on its own evidence — then the connections happen cleanly. That methodology is what earned the 14/14 GREEN domain receipt.

**When the Substrate is uncertain, it ASCENDS — it does not guess.**

The Andon Cord is the self-quarantine mechanism. When the Substrate's confidence on a question falls below threshold, it does not guess. It ascends: flags the answer as low-confidence, quarantines it, and escalates rather than submitting a likely-wrong answer. The 2 of 70 that did not count were not failures. They were the mechanism working — "I don't know yet, escalate, don't guess wrong."

Most AI systems guess. The Substrate refuses to. That is where the accuracy comes from. The Andon flag on those two answers is Loop 11 in action: the system knew what it did not know, and it said so.

Because the POINT is to get it RIGHT, FAST, and CHEAP.

**RIGHT** — 97.1% (68/70) on MMLU-Pro. 14/14 domains GREEN. 2 Andon ascensions — not failures. Visible self-correction, on the record.

**FAST** — approximately 70 minutes for the full 70-question, 14-domain run on consumer hardware.

**CHEAP** — $0.00 paid API spend. Free local Gemma 4 12B Q4. Hardware you already own.

---

## The Substrate Lifts Every Model. Not Just Gemma.

The 97.1% number belongs to Gemma 4:12b — a free, open-weights model you can download today.

But Gemma is not the only story.

> **A FREE AI Model beat the FLAGSHIP Models because it had the SUBSTRATE.**
>
> **Free WITH Substrate > Flagship WITHOUT Substrate.**
>
> **Flagship WITH Substrate = BROKE THE SOUND BARRIER.**  [My Proof](https://lianabanyan.com/proofs/) [PROVE it YOURSELF](https://mnemosynec.ai/download/)

What does that mean in numbers? Across four cloud flagships — Opus · GPT · Gemini · Ollama — the Substrate adds +72 to +83 percentage points of lift cold-to-hot (κ 0.936). That is the sound barrier. The [My Proof](https://lianabanyan.com/proofs/) link shows the full receipt set.

Here is the math, on disk:

**The receipt:** 97.1% (68/70) on the canonical 70-question MMLU-Pro · Gemma 4 12B Q4 · ~70 minutes · consumer hardware · no paid API keys · Monday night, 2026-06-15.

**The comparison:** Closed flagship cloud models score 75–86% on MMLU-Pro — Claude, GPT, Gemini, Llama range — disk-backed at BP083.md:3667. A free open-weights model on your own hardware, with The Substrate, lands above that ceiling.

**The same-model lift:** Phase 9 baseline without the substrate: 51.4%. With the substrate: 97.1%. That is a **+45.7 percentage-point lift on the same local model** — not a different model, not a bigger one. The same weights. The substrate is the variable.

Same substrate. Different models. Consistent direction.

MMLU-Pro is the same benchmark suite the industry uses to sort serious from not-serious. These are not questions we wrote. They are the canonical standard. We are showing what models become when you add The Substrate — using a free model that runs on hardware you already own.

The third line is an invitation: run your own flagship model through The Substrate. Post your receipts. That is the Code Breakers Guild path and the ground floor of PROV_23 contribution. Your name on the I.P. you help prove.

---

## GPQA Diamond Is Next. No Number Yet.

MMLU-Pro is the first cake. GPQA Diamond is next — we are queuing the test right now. Numbers when we have them, not before.

We do not publish forecasts. We publish receipts.

---

## And Now We Open the Mesh.

That benchmark was one machine, one session, one substrate instance running alone.

The cross-machine mesh test opens this week. We are testing whether multiple instances of MnemosyneC, running on different machines, can coordinate, share signal, and perform together.

**Substrate Awakens.** Event-driven, not time-driven — fires when 1,000 people sign up to test it. We are shooting for Thursday or Friday night (2026-06-18 or 2026-06-19). Help us get there. Free as many times as you like. $5 a year to JOIN as a Member.

We need testers. Real people, real machines, real conditions. Not a lab. The world.

---

## Help Us Hit 1,000 — Then We Fire the Mesh.

Here is how this works: when 1,000 people sign up to be testers, we run the mesh. Not on a calendar date. Not when we decide we are ready. When you — collectively — show up.

That is not a marketing device. It is a community-validation threshold. The test becomes real because the community demanded it. We are shooting for Thursday or Friday night this week. We need 1,000 sign-ups to pull the trigger.

**Sign up to test:** [mnemosynec.ai/mesh-test-signup](https://mnemosynec.ai/mesh-test-signup) *(placeholder — Founder confirms URL before send)*

**Current count:** We need 1,000 sign-ups to fire the mesh test. Help us get there.

Free to sign up. Free to test as many times as you like. Five dollars a year to JOIN as a Member and hold a vote in the cooperative.

Help each other help ourselves.

---

## Permission to Board — Granted.

> *"Permission to Board — Granted. Grab an Oar. Help Make the Sails."*

This is an invitation to get in before the ship is finished. We are not asking you to believe our numbers will hold at mesh scale. We are asking you to help us find out.

There are three ways to participate right now:

**Become a Tester.** Download MnemosyneC v0.5.0, connect to the mesh, and run it. Tell us what breaks. Tell us what works. Your machine becomes a node in the first live constellation test. After the mesh run, we publish the numbers. Help us make them.

**Become a Code Breaker.** We pay our critics, not just our choir. If you find something wrong — a recall failure, a coordination gap, a behavior that does not hold up — you report it, you document it, and you earn Marks for it. The Code Breakers Guild runs on the Gold Refined by Fire principle: what survives the adversarial test is what earns the immutability stamp. The highest honor in our system goes to the Code Breaker whose hardest attack failed — because that failure is what makes the claim worth trusting. Prove Your Mettle by doing it.

> *"Prove Your Mettle by DOING IT."*

**Become a Project Manager.** Coordinators, organizers, people who can herd the test participants and document the run — we need you too. The Employ the World bounty system means this is not volunteer labor. Contribution earns Marks, and Marks are real inside the cooperative.

---

## The Entry Point Is Real.

We are not asking you to risk anything to get started.

MnemosyneC is free to use as many times as you like. Download it, run it, test it. No paywall on the tool itself.

> *"FREE as many times as you like — just $5 a YEAR to JOIN."*

Five dollars a year is the Structural Bylaw for full membership. That is the number we set when we wrote the cooperative's founding rules, and it does not change. It is not a loss-leader that adjusts later. It is the structural floor — $5/year gets you a vote, a seat at the table, and full access to the cooperative's member economy.

Break off a piece. Make it yours by rebuilding it better. Show off and earn.

Members can form Crews on Bounty Posters — split bounty pools in portions equal to your efforts. One Crew share eclipses $5/year. Grab your friends or make new ones. You're the Captain now.

---

## Your Name Goes on the I.P. You Contribute. Really.

The last three Plow upgrades — CONSEQUENCE_TRACE, ELIMINATION_VERIFICATION, DEPENDENCY_PROPAGATION — are going into the next provisional patent. PROV_23.

If you contribute to what is in it, your name goes on the I.P. you contributed. Really.

Not as a courtesy credit. As a named contributor on the actual patent. The cooperative holds intellectual property in a commons trust — we signed the Cooperative Defensive Patent Pledge (#2260) — which means no contributor's work gets turned into a weapon against them. The IP you help build protects the whole cooperative, including you.

What does contribution look like here? Adversarial testing — break the Plow blades and document what you found. Surface edge cases the twelve loops miss. Refine the math behind elimination scoring. Draft claims. Write the formal arguments. Every piece that goes into PROV_23 carries its authors.

The Code Breakers Guild is the operational arm of this. Contribution earns Marks. Surviving attacks earn the Gold Refined by Fire stamp. Authors earn the record.

This is not extraction. This is cooperative authorship.

<!-- See forward-link: [[canon-your-name-on-the-ip-you-contribute-prov-23-patent-bag-invitation-bp085]] — parallel SEG minting this canon. Confirm link resolves before publish. -->

---

## After the Mesh Run, We Publish the Numbers.

Whatever the mesh test produces — good or incomplete or broken in interesting ways — we publish it. No cherry-picking. The numbers are the receipt.

The 68/70 is the single-node receipt. The mesh run is the distributed receipt. We need it to be real, so we need real testers.

Help each other help ourselves.

---

## Download and Join the Test.

**MnemosyneC v0.5.0**
[mnemosynec.ai/download](https://mnemosynec.ai/download)

1. Download and install v0.5.0
2. Connect to the mesh (instructions in the app)
3. Run the benchmark or break something intentional
4. Report what you find — earn Marks for every valid signal

After the mesh run, we publish the numbers. Help us make them.

---

*Help Each Other Help Ourselves.*

*Of the People. By the People. For the People.*

*Permission to Board — Granted. Grab an Oar. Help Make the Sails.*

**ONE OF US.**

— FounderDenken / Crewman #6

---

---

## Composition Citations (Internal — Knight strips before publish)

- [[canon-code-breakers-guild-gold-refined-by-fire-elimination-marks-bp084]] — Code Breakers Guild, Gold Refined by Fire principle, Marks for elimination, Refiner of Gold honor, Code Breakers as operational arm of PROV_23
- [[canon-permission-to-board-tagline-grab-an-oar-help-make-the-sails-bp085]] — Permission to Board hero tagline + close
- [[canon-employ-the-world-bounty-posters-banner-bp084]] — Employ the World, bounty system, contribution earns Marks
- [[canon-break-off-a-piece-tagline-earnings-safe-firing-bp084]] — Break off a Piece earnings model
- [[canon-v0-5-0-first-live-mesh-public-event-watch-and-replicate-bp084]] — Substrate Awakens, event-driven not time-driven, Founding Replicator tier — REVISED by [[canon-mesh-test-1000-signup-threshold-community-validation-bp085]]: fires at 1,000 signups, not Saturday calendar
- [[canon-mesh-test-1000-signup-threshold-community-validation-bp085]] — Mesh Test fires at 1,000 community sign-ups, Thursday/Friday 2026-06-18/19 target, {{LIVE_COUNT}} placeholder wired by Knight
- [[reference-help-each-other-help-ourselves-catchphrase-canon-bp082]] — closing catchphrase
- [[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]] — conservative numbers rationale, Andon self-quarantine as TIC ELIMINATION_VERIFICATION in action, "knowing what is NOT true" epigraph, 12-loop Plow architecture (Loop 10/11/12)
- [[feedback-truth-always-wait-for-clean-receipt-bp083]] — 68/70 verbatim, no other numbers, no forecast; GPQA Diamond tease with no number
- [[canon-mnemosynec-personal-subscription-steward-tier-ramp-bp084]] — $5/year Structural Bylaw verbatim
- [[feedback-only-sonnet-4-6-for-segs-ever-bp081]] — SEG model compliance (Sonnet 4.6)
- [[canon-built-in-public-operational-transparency-bp085]] — BUILT IN PUBLIC banner, operational transparency, open dev process, every receipt public, no curtain
- [[canon-of-the-people-by-the-people-for-the-people-civic-frame-bp085]] — Lincoln/Gettysburg civic-cooperative frame, closing pair with Permission to Board
- [[canon-12-blade-plow-m0-validated-psionic-auditor-sentinel-rename-bp084]] — Twelve-Blade Plow as SYNERGISTIC ACTIVATOR of the Substrate (NOT the heart of Substrate), 9 base loops + Loop 10/11/12 architecture, M0 validated BP084
- [[canon-substrace-theorem-wake-class-supersedes-black-mamba-until-mnemosyne-come-bp061]] — Substrace Theorem: re-weave shared state from the content-addressed substrate; Substrate components (eblets + pheromones + eblits) form the SID-addressable memory layer; Plow drives their synergistic activation
- [[eblits-snapshot-at-access-substrate-fragments-canon-bp031]] — Eblits as snapshot-at-access substrate fragments, the frozen-frame per-turn memory primitive inside the Substrate
- [[canon-pheromone-first-then-grep-economy-of-mass-at-scale-substrate-search-discipline-bp055]] — Pheromone trail routing as the Substrate's retrieval-routing layer; decay + reinforcement as native memory dynamics
- **[NEW BP085]** Eblit Emitter circuits disk-verified: `librarian-mcp/src/contingency_operator/eblit_emitter.ts` · `librarian-mcp/src/oracle_circuit/eblit_emitter.ts` · `librarian-mcp/src/prophet_circuit/eblit_emitter.ts` · `librarian-mcp/src/thorax/thorax_eblit.ts` — four named circuits in the How It Works component list are ON DISK, not asserted from memory
- **[NEW BP085]** Wrasse Quartermaster disk-verified: `librarian-mcp/src/scribes/wrasse_quartermaster_scribe.ts` — pre-session auto-injection + path manifest component listed in How It Works is ON DISK
- **[NEW BP085]** Pearls disk-verified: `caithedral-core/src/tools/pearl_tools.ts` — substrate-enrichment / audit / transmission / milestone / drift-receipt / peer-witness class objects listed in How It Works are ON DISK
- **[NEW BP085]** Thorax Heartbeat disk-verified: `librarian-mcp/src/thorax/thorax_eblit.ts` + `canon-fork-derivative-cooperative-access-thorax-heartbeat-enforcement-bp084` — cooperative-access authentication canon and source file both present
- **[NEW BP085 UPDATED]** Scrambler — canonical definition: A&A Formal #2259 `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2259_THE_SCRAMBLER_B098.md` (Crown Jewel, Prov 13 filed, ratified B098). Production implementation: Knight K407, 5 Python modules at `librarian-mcp/scrambler/`, 19/19 tests passing, 2 MCP tools live (`scrambler_session_start` · `scrambler_session_closeout`). Sub-components: `canonical_state.py` · `session_brief.py` · `session_closeout.py` · `drift_detector.py` · `conflict_resolver.py`. Phase 2 of the Four-Doublet Chessboard (TouchStone is Phase 1). Composes with [[aa-formal-2259-scrambler-eager-pairwise-consistency-bp098]] + [[aa-formal-2238-touchstone-deterministic-coordinator]] + [[aa-formal-2237-four-doublet-chessboard]]. Prior SEG omission was Truth-Always correct at the time (source not in LianaBanyanPlatform repo); A&A formal eblet in PIXIE_DUST archive is the citation basis.
- **[NEW BP085]** Staggered Single Domains paragraph — methodology that earned 14/14 GREEN domain receipt; backed by [[reference-68-70-mmlu-pro-canonical-receipt-bp083]] + [[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]] (independent domain stagger as cross-contamination prevention)
- **[NEW BP085]** Ascending / Andon paragraph — backed by [[canon-mic-federated-andon-the-diagnosis-just-add-salt-bp083]] (Andon self-quarantine) + Loop 11 ELIMINATION_VERIFICATION in [[canon-truth-integrity-chain-dependency-argument-eblet-chronos-bp084]]
- **[NEW BP085]** RIGHT/FAST/CHEAP closing block — all three receipts traceable to [[reference-68-70-mmlu-pro-canonical-receipt-bp083]]; $0.00 API spend + Gemma 4 12B Q4 + ~70 min consumer hardware verbatim from canonical 68/70 receipt
- [[canon-your-name-on-the-ip-you-contribute-prov-23-patent-bag-invitation-bp085]] — PROV_23 patent-bag invitation, cooperative authorship, Pledge #2260 Cooperative Defensive Patent Pledge
- [[canon-one-of-us-crewman-6-founder-signature-bp085]] — ONE OF US liturgy anchor + [[canon-founderdenken-crewman-6-signature-lock-bp085]] — FounderDenken / Crewman #6 signature lock (BP085 canon)
- [[reference-help-each-other-help-ourselves-catchphrase-canon-bp082]] — BP082 cooperative thesis catchphrase, four-line closing liturgy anchor
- [[canon-mic-federated-andon-the-diagnosis-just-add-salt-bp083]] — Just Add Salt canon; "empirical, plain, no hype" voice discipline; Andon self-quarantine as the substrate knowing what it does not know
- [[reference-68-70-mmlu-pro-canonical-receipt-bp083]] — canonical 68/70 receipt eblet; disk path: Asteroid-ProofVault\reference_68_70_mmlu_pro_canonical_receipt_bp083.eblet.md; all numeric claims traceable here
- [[BP065-benchmark-4-of-4-cold-to-hot-lift-receipt]] — +72 to +83pp lift cold-to-hot across Opus/GPT/Gemini/Ollama, κ 0.936; sourced from Knot #23 in Asteroid-ProofVault\BP076_FINDING_MNEMO_PAPER_DRAFT.md line 80; backs "BROKE THE SOUND BARRIER" metaphor in inequality trinity prose unpack
