<!-- FIRE INSTRUCTIONS -->
<!-- PLATFORM: Substack (FounderDenken · founderdenken.substack.com) -->
<!-- ACTION: Paste full body below into Substack editor. This IS the canonical. No canonical-link footer. -->
<!-- ORDER: Publish Substack FIRST. Copy the live URL. Paste into WAVE_1_JUST_ADD_SALT_MEDIUM.md where URL_PLACEHOLDER appears. Then sync Cephas. -->
<!-- TITLE FIELD: Just Add Salt. How to Get the Right Answer. -->
<!-- SUBTITLE FIELD: 68 of 70. On a consumer laptop. No paid API keys. Here is the architecture. -->

---

# Just Add Salt. How to Get the Right Answer.

*68 of 70. On a consumer laptop. No paid API keys. Here is the architecture.*

*FounderDenken · founderdenken.substack.com*

---

> **This is Day 1 of a paper-a-day series from FounderDenken. Five papers ship today. One a day after that. Join the cooperative — $5/year — [lianabanyan.com/join](https://lianabanyan.com/join).**

---

Every AI startup has the same quiet problem, and almost none of them say it out loud: they don't know how to get the right answer. They know how to generate confident-sounding text. They know how to ship fast. They know how to make a demo look good in a hotel ballroom. But getting consistently, verifiably *correct* answers — on a consumer laptop, at cooperative economics, without a data center — that problem they've answered wrong. The structural answer is simpler than the industry wants to admit.

Just add salt.

We ran a canonical 70-question benchmark across all 14 academic domains of MMLU-Pro. 68 correct. 97.1%. All 14 domains green. No paid API keys. No GPU cluster. A consumer laptop, Ollama, and gemma4:12b. The two wrong answers are the feature, not the flaw — and I'll explain why that matters. First, the architecture.

---

## The Three-Salt-Layer Architecture

Salt does three things in cooking that most people conflate into one. It adds essence — brings out what was already there. It preserves — keeps good things from spoiling. And it makes what was raw into something usable. The cooperative AI architecture has three layers that do exactly these three things. We call them the three salts.

### Substrate Salt

The first layer is what lives in your local substrate. Verified facts, not generated guesses. Every domain gets its own isolated partition — History, Law, Chemistry, Engineering, Philosophy, Business, Medicine, Biology, Computer Science, Psychology, Economics, Mathematics, Physics, and a cross-domain catch-all for things that belong to all of them at once.

We call the process of growing this substrate "plowing the field." Nine domain specialist workers run question-and-answer loops. Each specialist stays in its lane. When an answer reaches concordance — three independent confirmations, no contradictions — it gets written to an eblet. An eblet is a unit of verified knowledge, not a cached LLM response. The distinction matters. A cached response can be confidently wrong. An eblet has receipts.

We grew 316 verified-cooperative substrate eblets in the test run that produced the 68/70 result. Those eblets are what the AI reads *before* it answers. Not instead of its training. Before. That's substrate salt: essence already extracted, ready to apply.

### Federation Salt

The second layer is what travels across the cooperative network. Your machine isn't working alone. When you join the constellation — the peer network of MnemosyneC members — your local substrate participates in a cooperative intelligence mesh.

The math is simple and honest. Five machines working in parallel don't just split the work five ways. With proper domain-isolated routing, you get roughly a 4× effective speedup because machines handle what they're strong at, not random slices of everything. A question about contract law goes to nodes with strong legal substrate. A question about differential equations goes where the math eblets are dense. The routing is the intelligence.

Quality control in a distributed system can fail quietly, which is why we built what we call the Federated Andon Cord — a three-tier escalation protocol borrowed from lean manufacturing. Tier one: local node flags a low-confidence answer and holds it. Tier two: peers in the constellation attempt independent verification. Tier three: the answer goes into a quarantine queue pending human review. Two of the 70 benchmark answers triggered the Andon Cord correctly. They were quarantined rather than published as confident. That's not a failure count. That's the cooperative quality gate working as designed.

Federation salt preserves the good work your network has done and distributes it without diluting it.

### Human Salt

The third layer is the one the industry talks about least, because it doesn't fit neatly into a product roadmap. Some answers don't live in any AI's substrate. They live in a human being five miles away, or five continents away, who solved that exact problem in 1987 and still remembers what worked.

The New York Times ran a column called "Diagnosis" for years. Readers would submit medical mysteries — years of misdiagnoses, symptoms that didn't fit any known pattern — and other readers who had seen the same thing would write in. The diagnosis often came from a retired nurse in Ohio, or a mechanic who'd seen that symptom in a cousin, or a researcher who'd published one paper on it in a journal nobody reads.

That's human salt. Knowledge that exists in living people, not in training data.

Our cooperative network has a primitive we call The Diagnosis. It's domain-universal — works for medical mysteries, yes, but equally for mechanical problems, local knowledge, specialized trades, practical skills that never got written down. When a member's question reaches the edge of what the substrate knows, The Diagnosis surfaces it to the network with what we call the Glow mechanic: the question becomes visible to cooperative members who have relevant expertise. Attention is drawn to it without gating access. The member who helps earns Marks — the cooperative's reputation currency. The answer, once confirmed, goes back into the substrate as an eblet with human provenance noted.

Human salt makes what was raw into something usable, and makes the network smarter with every answer.

---

## The Empirical Disk-Backed Receipt

Here is what we measured. Not what we projected. Not what a demo showed. What is on disk, reproducible, with a kit you can download.

**68 of 70 questions correct.** 97.1% accuracy. The benchmark is MMLU-Pro, the canonical academic multi-domain benchmark used across the industry. 14 domains, 5 questions per domain, 70 total. All 14 domains scored green — meaning no domain was missed entirely. The hardware was a consumer laptop. The model was Ollama running gemma4:12b, a free open-weights local model. Zero paid API keys were used at any stage.

**316 verified-cooperative substrate eblets grown** across the 14-domain run. Each eblet represents a fact that reached concordance through independent verification, not a single model's confident assertion.

**2 Andon Cord quarantines triggered correctly.** Those 2 questions where the cooperative quality gate fired, held the answer, and escalated rather than guessing. We did not override the quarantines to hit 70/70. Truth-Always means we report 68 of 70, not 70 of 70. The 2 quarantines are the feature working.

The full reproducibility kit is available at **github.com/liana-banyan/lb-reproducibility-pack**. Run it yourself. Check the receipts. If your numbers differ, report it — that's how the substrate gets better.

---

## Why This Matters Structurally

The industry's current answer to "how do you get the right answer" is: bigger model, more compute, proprietary training data, data center scale. That answer costs millions of dollars per month to operate, which means the economics flow toward extraction rather than cooperation. The company that runs the model captures nearly all the value. The person who asked the question pays per token.

The three-salt architecture inverts this. Consumer hardware. Open-weight model. Cooperative substrate. The smarts accumulate in the network, not in the company's proprietary training run. And the economics follow the architecture.

MnemosyneC membership is $5 per year. Not $5 per month. Per year. The cooperative currencies — Credits, Marks, and Joules — never convert to fiat. Not because we can't build a conversion rail, but because conversion would make prior cooperative work *less* valuable every time new money entered the system. Instead, we use Substitution: the cooperative currencies make your prior work more valuable by expanding what they can purchase, what they can unlock, what they can earn. The currencies gain meaning through use, not through exchange rate.

The 50-year corporate dissipation clause is in the bylaws: if Liana Banyan Corporation ceases to operate, the cooperative substrate, the eblet archive, the reputation ledger, and the source code go into a public trust. The value doesn't evaporate. It gets handed forward.

Free, open, local, cooperative AI that outperforms flagship cloud models on canonical benchmarks — not because we found a shortcut, but because we built the right architecture. Consumer hardware is sufficient. What was missing was the salt.

---

## The Lift in Numbers

The Phase 9 baseline — same local model, no substrate — scored 51.4% on MMLU-Pro. With the substrate: 97.1%. That is a **+45.7 percentage-point lift on the same model**. Not a different model. Not a bigger one. The same weights. The substrate is the variable.

Closed flagship cloud models score 75–86% on MMLU-Pro — Claude, GPT, Gemini, Llama range — disk-backed receipts at BP083. A free open-weights model on your own hardware, with the substrate, lands above that ceiling.

---

## The Diagnosis Teaser

Sometimes the answer isn't in any AI's substrate. It isn't in the training data. It isn't in the federated network's accumulated eblets. It lives in a human being who never wrote it down, who solved a version of your problem by necessity, who has been carrying the answer around without knowing anyone needed it.

The Diagnosis is how the cooperative asks.

Three persistence tiers: Pinch (quick, low-stakes questions that resolve fast), Seasoning (ongoing questions that need multiple passes and return over time), and Preserved-in-Salt (critical unsolved problems that stay live in the cooperative's memory indefinitely, accruing attention and expertise until they're answered).

The Glow mechanic surfaces the question to people who can help, without hiding it from anyone. No paywall on the question. No access gating. The Glow is attention, not money. The member who answers earns Marks, which builds reputation, which increases their weight in future cooperative votes and their standing in the Package Store.

The NYT Diagnosis column worked because it reached the right human. The cooperative works for the same reason, scaled across every domain, running every day, growing smarter as it goes.

Details on The Diagnosis at **mnemosynec.ai/diagnosis/**.

---

## The Secret of Mnem Is Salt

The RoseBush is what we call the full MnemosyneC stack. Thorns and petals and bud and roots. The secret that lives inside it — the thing that makes a free, local, cooperative AI produce 68/70 on a canonical benchmark on a consumer laptop — is not a larger model. It's not a proprietary training run. It's not a data center.

It's salt. Three layers of it. Substrate salt grown from verified cooperative work. Federation salt preserved and distributed across the constellation. Human salt drawn from the living knowledge of people who help each other help themselves.

That's the architecture. That's the economics. That's the answer.

*The question every AI startup answers wrong is: how do you get the right answer?*

*Just add salt.*

---

> **BUILT IN PUBLIC**
>
> The dev process is open. Every receipt is public. There is no curtain.

---

*Members earn through the receipts: Crews on Bounty Posters split pools in portions equal to your efforts. One Crew share eclipses $5/year. You're the Captain now.*

*Help Each Other Help Ourselves.*

*Of the People. By the People. For the People.*

*Permission to Board — Granted. Grab an Oar. Help Make the Sails.*

**ONE OF US.**

— FounderDenken / Crewman #6

---

**Links**
- mnemosynec.ai
- github.com/liana-banyan/lb-reproducibility-pack
- mnemosynec.ai/diagnosis/
- mnemosynec.ai/constellation/
- mnemosynec.ai/proofs/
- lianabanyan.com/join

---

*Published on FounderDenken · founderdenken.substack.com*
