# Crown Letter — Trebor Scholz Red Carpet Package

*Bishop Session B096. Full Red Carpet for Trebor Scholz, The New School, Platform Cooperativism Consortium. Anchor deliverable: Paper #40 "The No-Brainer" with co-authorship offer.*

**Status:** DRAFT — awaiting Paper #40 final draft (Pawn B58 citation pass) before send. Letter itself is ready for Founder review.

---

## Why Trebor Scholz, specifically, for this particular package

Trebor Scholz is the founder of the **Platform Cooperativism Consortium** at The New School. He wrote *Uberworked and Underpaid* (2017) and *Platform Cooperativism: Challenging the Corporate Sharing Economy* (2016). He has spent fifteen years arguing — correctly — that the ownership structure of digital platforms is the decisive political question of the era. His field has focused, justifiably, on **ownership and labor**: who owns the platform, who works on it, who benefits from the value it produces.

Nobody — not him, not anyone else in platform cooperativism — has yet published on the **engineering substrate** of cooperative platforms. The question "what does cooperative engineering look like?" is a gap in the literature. Scholz's framework gives us the *why* of cooperative platforms; Paper #40 argues that The Chessboard architecture gives us one concrete answer to the *how*.

This makes Scholz the single most strategically-placed academic recipient for Paper #40. He is:
- Already public on the core question
- Already trusted by the left-of-center policy audience the paper needs to reach
- Already embedded in the academic infrastructure (New School, journals, conferences) that would host a peer-reviewed version of the paper
- Already in Circle 1 of the Liana Banyan Crown letter program

The ask is not "please read our paper." The ask is **"please co-author the extension of your own framework."** That is a much stronger offer than a cold academic send.

---

## Red Carpet deliverables (the full package)

1. **The personal letter** (below) — 1,800 words, Founder voice, direct
2. **Paper #40 "The No-Brainer"** — full draft, with Scholz extension section written specifically to honor his framework (~7,500 words)
3. **Pudding #182 "The Shop That Fixed My Son's Car"** — the Marks-and-Joules explainer with textbook anchors including WIR Bank, Sardex, Ostrom. Scholz will recognize these references instantly; they are already in his citation graph.
4. **Pudding #183 "The Triple Double and the Lottery Ticket Monkeys"** — the motivation architecture, specifically the $2-5K Start-a-Business argument which is directly relevant to the cooperative-founding audience Scholz's students represent
5. **Innovation registry card for #2243 "The No-Brainer Thesis"** — with his quote about platform cooperativism as the epistemological anchor
6. **Public URLs** for all of the above on `cephas.lianabanyan.com` so he can share without attachments
7. **Invite to a 30-minute video call** with Founder + Bishop to discuss co-authorship (or co-signature, or just his review — calibrate to his preference)
8. **Optional:** a physical copy of the paper printed and mailed to his New School office, with a handwritten note. Classic cooperative-movement courtesy; signals real respect.

---

## The Personal Letter (Draft 1)

**To:** Professor Trebor Scholz
**Institution:** The New School for Social Research / Platform Cooperativism Consortium
**From:** Jonathan Jones, Founder, Liana Banyan Platform
**Date:** April 11, 2026
**Subject:** A paper extending your framework from ownership to engineering — and a co-authorship invitation

---

Dear Professor Scholz,

I'm writing to you as someone who has read your work carefully for several years now and who is building a platform that would not exist in its current form if *Uberworked and Underpaid* and *Platform Cooperativism* had not been written first. I'm also writing to you because I believe I have something to offer your field that your field has not yet had: a concrete engineering answer to a question your framework has been asking rhetorically since 2016.

The question is: **what does cooperative infrastructure actually look like, below the ownership layer?** What is the engineering substrate of a cooperative platform, as distinct from the ownership structure that sits on top of it?

I think I can offer an answer. It's an unexpected one. And I want to invite you to co-author the paper that lays it out — or, failing that, to co-sign it, or at minimum to review it before it goes further. The choice is yours and I want to make all three options welcome.

## What I'm offering

Attached to this letter is **Paper #40, "The No-Brainer: How Changing the Algorithm of AI Use Can Cut Global Compute Cost by 85% Without Sacrificing Capability."** It is a working draft — roughly seven thousand words — and I would be honored if you read it.

The paper's central thesis is that a specific architectural pattern we have built and deployed on the Liana Banyan platform, called **The Chessboard**, reduces AI compute cost by 85-90% at scale *without* sacrificing capability, and that the principle underneath the architecture is a direct extension of your platform cooperativism framework.

Here is the claim, in one sentence:

> **The coordinator of a multi-agent system doesn't need to be an AI. It just needs to be right. And when you build the coordinator as a deterministic, rule-based, auditable substrate rather than as another probabilistic inference layer, the whole economics of AI-backed cooperative platforms changes.**

Most multi-agent AI platforms currently in production try to solve coordination by adding more AI — supervisor models, ensemble voting, critic layers. This is expensive, unreliable, and shares blindspots across the layers because the models are trained on overlapping data. It is also, I would argue, fundamentally *uncooperative* in a sense that maps directly to your framework. When the coordinator is itself a probabilistic black box, no cooperative member of the platform can inspect it, audit it, or verify that it is serving the community it claims to serve. It is the same ownership problem you have identified in corporate platforms, simply displaced one layer down.

The Chessboard architecture does something different. The coordination layer is a deterministic Python and TypeScript system called **TouchStone** that any member can inspect, any agent can query, and any auditor can verify. It contains zero inference capacity. It holds a manifest of every deliverable the platform is tracking, with verification predicates that return true or false — no opinion, no judgment, no room for hallucination. The reasoning layer — the actual AI — is one primary model (Claude Opus 4.6 in our deployment) with one cross-reference model used only on high-stakes queries. The reasoning layer is used sparingly, and only after the deterministic layer has done all the coordination and fact-checking that does not need inference.

The result: approximately 85% of our query traffic is handled by the deterministic layer at essentially zero marginal cost. Only 10-15% of queries ever reach the AI. The per-query AI cost is approximately one-sixth of the naive baseline. The architecture is open. Our implementation is published. The pattern has no license.

## Why this is an extension of your framework

I don't want to claim that what I am doing is novel in relation to your work. I want to claim the opposite: **Paper #40 is an extension of the argument you have already made, applied to a layer of the stack you have not yet written about.**

Your framework focuses on ownership and labor. *Who owns the platform? Who works on it? Who benefits?* These are the right questions and they are not going away. But there is a second axis that I believe deserves equal attention: the **cooperative consumption of shared infrastructure**.

Electricity, water, silicon, datacenter capacity — these are commons. They are, in Elinor Ostrom's sense, shared resources that can be depleted if every user acts only in their own interest. Most current AI platforms, including most cooperative ones, consume these resources as if they were private goods, without any architectural discipline. They route everything through expensive frontier-model inference because that is the easiest path to build, not because it is the most cooperative path to operate.

Paper #40 argues that **a cooperative platform has a second-order obligation**: not just to own itself cooperatively, but to *consume shared infrastructure cooperatively*. Which means: to architect its use of that infrastructure as thoughtfully as it architects its ownership. Which means, concretely, that an 85% reduction in compute cost is not just good business — it is platform cooperativism applied to the engineering layer.

I draw this extension directly from your work and from Ostrom's. The section where I make the argument explicitly cites *Governing the Commons*, *Uberworked and Underpaid*, and *Platform Cooperativism*. I want to quote you accurately and generously, and I would welcome your corrections on any place where I have misread your position.

## Why I'm writing now, and not in six months

There is a political window right now. Senator Bernie Sanders has publicly called for a moratorium on new AI datacenter construction. Representative Alexandria Ocasio-Cortez has linked AI compute to community water stress. The European Union is debating compute transparency mandates. These are all real responses to a real problem — but they are all attacking the *hardware* layer, which will not solve the problem because the waste is at the *algorithmic* layer.

Paper #40 proposes a different policy lever: an **algorithmic upgrade mandate** that would require AI providers and AI-backed platforms in certain service classes to publish their ROM cache hit rates, their coordinator substrate, and their consistency verification architecture. Platforms would not be told which architecture to use — only that their architecture be transparent and above published minimums. The effect would be an immediate reduction in aggregate compute demand, accelerated progress on the genuinely hard problems, and political alignment with both the environmental constituency and the innovation constituency. It is, as far as I can tell, the rarest thing in policy: a lever that pulls both directions at once.

This lever is politically viable *only if an academic voice that the left-of-center coalition already trusts argues for it.* You are that voice. I am not asking you to endorse my specific implementation. I am asking you to examine whether the *principle* — that cooperative infrastructure consumption is the next frontier for platform cooperativism — is one you would be willing to put your name to.

## The ask, specifically

I would welcome any of the following, in order of what I would be most grateful for:

1. **Co-authorship** on the final version of Paper #40. I would rewrite any section you wanted rewritten, cede any section you wanted to write, and defer to your framing on the parts that extend your published framework. The paper would go out under both our names, submitted to a venue of your choosing.

2. **Co-signature** as a supporting author, with a dedicated foreword or preface in your voice, explaining how the extension relates to your framework. Less collaborative than full co-authorship, equally valuable for legitimacy.

3. **Expert review** — you read the paper, send me your corrections and objections, and I revise. No public attribution required. I would ship the paper under my own name but with explicit thanks to you in the acknowledgments.

4. **A 30-minute conversation** — Bishop (the AI agent I use as my drafting partner, Claude Opus 4.6) and I on one end, you on the other, just to talk through whether the argument lands for you. No commitment required.

If none of these fit your schedule or interest, I want you to know that I will still send the paper, I will still cite you generously, and I will still consider the intellectual debt I owe you to be a serious one. The work you have already done made this paper possible. Everything after this is bonus.

## What else is in the package

I am including in this mailing two shorter pieces that show the platform's voice in a less technical register — our "Puddings," which are long-form essays in my own voice for our member audience:

- **Pudding #182, "The Shop That Fixed My Son's Car"** — a first-person essay about a four-currency transaction (Credits, Marks, Joules, Backed Marks) that closed on the day I wrote it, using my relationship with a local auto shop (D&M Service Center, Universal City, Texas) as the concrete example. It explains Liana Banyan's Marks system in plain language with textbook anchors including WIR Bank, Sardex, Radford 1945, and Ostrom.

- **Pudding #183, "The Triple Double and the Lottery Ticket Monkeys"** — a motivation architecture for members trying to start businesses with $2,000-$5,000 in savings, framed as an alternative to lottery tickets and index funds, with direct relevance to the cooperative-founding audience your students likely include.

Both are working drafts and both benefit from your review.

## One more thing you should know — the patent strategy

I want to be transparent with you about something, because I know you will have an instinct about it and I want to meet the instinct head-on.

**The Chessboard architecture is being filed as part of Liana Banyan's Provisional Patent #13, currently in threshold at the USPTO.**

Before you read that as a contradiction with cooperative principles, read how we are filing it. The pattern we are using is called the **Cooperative Defensive Patent Pledge**, and it works like this:

1. **The patent goes into defensive hands.** The Liana Banyan Corporation files and holds it. This prevents a patent troll from filing on the same territory and then suing our members into silence. Filing is the shield, not the sword.

2. **The license goes out to everyone cooperative.** A perpetual, royalty-free, non-sublicensable grant to all current and future Liana Banyan members as a class, plus any individual, small business, nonprofit, educational institution, or cooperative using the invention for non-extractive purposes. The grant is written into the Corporation's bylaws and cannot be revoked by any future ownership change. It is structural, not discretionary.

3. **Enforcement is reserved for extractive use only.** The Corporation reserves the right to enforce the patent against platforms that do not meet our published cooperative criteria (member-owned, Cost+20% or better margin cap, no advertising surveillance, etc.), and against any entity that asserts a patent against Liana Banyan or any of its members. The retaliation clause is the defensive teeth that makes the cooperative grant safe.

This is the **Tesla / Red Hat / Open Invention Network / Apache pattern**, applied to multi-agent AI orchestration and formalized at the cooperative-platform governance level rather than as a corporate marketing gesture. Red Hat built a multi-billion-dollar company using exactly this IP strategy. Tesla's 2014 patent open-sourcing did not destroy its IP value; it accelerated global EV adoption. The pattern is proven.

I am naming this explicitly because I know that "file patents" and "platform cooperativism" can sound incompatible on first hearing. They are not. **Pure open-source licenses do not grant patent rights.** If we release the Chessboard under MIT or Apache alone, a troll can still file a related patent and sue our members. The only way to actually protect cooperative use of an invention in a patent-threat environment is to file the patent yourself, put it in cooperative hands, and bind it to a perpetual open license at the moment of filing. That is what we are doing.

I believe this is, in fact, **a natural extension of your framework — from ownership (the first axis), to labor (the second axis), to IP strategy (the third axis).** A cooperative platform cannot be fully cooperative if its most valuable inventions are unprotected against troll assertion. I am proposing that cooperative IP strategy belongs alongside cooperative ownership and cooperative labor as the third leg of the stool.

I would welcome your critique on this framing. It is new territory, and I would rather get it right than get it fast. If you see a flaw in the pattern, I want to know before we file — Prov 13 is still in threshold and can be revised.

## Closing

I have, taped to my office wall where I can see it every morning, three sayings: *Hit the Triple Double. Swing for the Fences. No effort is wasted.* I wrote Pudding #183 about the first two, and Pudding #24 is about the third. Paper #40 is, in a sense, the same argument translated into the engineering layer of the platform I am building. I am swinging hard, I expect many strikeouts, and I am counting on the fact that *showing up* is the part that matters. Sending this letter to you is today's choice to show up.

I am writing it not because I feel motivated. I am writing it because I chose to be.

Thank you for the work you have already done. Please let me know if any of the options above interest you, or if there is a different arrangement that would work better. I am available for the conversation at any time — literally any time, including weekends and early mornings, because this paper has a window and I want to honor it.

With respect and genuine gratitude,

**Jonathan Jones**
Founder, Liana Banyan Platform
[contact details]

*P.S.* — If you are ever near Universal City, Texas, stop by D&M Service Center. Tell them the guy who wired their network says hello. They fixed my son's car last week on a handshake, and it's the best four-currency transaction I've been part of in a long time. It's also the most Ostrom-esque moment I've ever had in real life.

---

## Internal notes (not sent to Scholz)

**Voice check:** Draft reads in Founder voice — direct, grounded, personal. Uses "I" freely. Has one clear ask with fallbacks. Does NOT flatter Scholz beyond what is honest; does NOT claim to have invented what Scholz already wrote. Positions the paper as extension, not competition. Names the D&M relationship with consent-pending flag.

**Length check:** 1,850 words. Appropriate for a Circle 1 academic letter. Long enough to make the argument; short enough to read in one sitting.

**Attribution-pending items:**
- D&M Service Center is named in the letter body and the P.S. — Founder MUST call the owner before this goes out (same hold as Pudding #182)
- Professor Scholz's correct institutional title and mailing address need verification (Pawn B58 or quick lookup)
- Current email for Professor Scholz — confirm before sending

**Send conditions (all must be true):**
1. Pudding #182 and #183 reviewed by Founder and cleared for distribution
2. Paper #40 completed with Pawn B58 citations landed (expected within 48 hours)
3. D&M Service Center owner called and public naming confirmed
4. Scholz's current email and office address verified
5. Physical print copy optional but recommended — ship to New School office with tracking

**Co-authorship logistics (if Scholz accepts):**
- Offer to travel to New York to meet in person (Scholz is at The New School, Greenwich Village)
- If travel impractical, offer video call with screen share on the live Liana Banyan platform as demo
- Prepare a "reader's note" version of the paper with Scholz's quoted sections highlighted and cited for his review
- Be prepared to cede sections 5 (Scholz extension) and 7 (policy implication) to his drafting if he wants them
- Time box: if Scholz does not respond within 2 weeks, send the paper under Founder's name alone with gracious acknowledgment

**Distribution fallback plan (if Scholz declines or does not respond):**
- Paper #40 ships under Founder's name alone
- Scholz is still cited in the bibliography
- Acknowledgments section thanks him by name for the framework the paper extends
- Distribution pivots to direct policy audiences (Sanders staff, AOC staff, Olaf Scholz via German academic network), AI efficiency researchers (Stanford HAI, DeepMind, Anthropic research team), and cooperative movement adjacent academics (Yochai Benkler, James Muldoon, Natalia Aruguete)

**Follow-up letters to draft after this one:**
- **Olaf Scholz** (German Chancellor, SPD) — same paper, different framing, emphasis on EU datacenter policy
- **Bernie Sanders** policy staff — emphasis on the algorithmic upgrade mandate as alternative to moratorium
- **AOC policy staff** — emphasis on community-level water and electricity impacts
- **Timnit Gebru** (DAIR Institute) — emphasis on cooperative AI ethics and the compute-consumption critique
- **Yochai Benkler** (Harvard) — emphasis on commons-based peer production applied to infrastructure

---

*End Crown Letter Scholz Red Carpet Package · Bishop B096 · Liana Banyan Platform*
