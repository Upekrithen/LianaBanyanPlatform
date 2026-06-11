# Pawn Return · MnemosyneC Download Page Review · BP079 · 2026-06-10

**Knight dispatch ts:** 2026-06-11T01:30:00Z

**Research method note:** The `pawn_search` MCP tool (user-perplexity-pawn) returned HTTP 401 on all four queries during this session, indicating an invalid or expired Perplexity API key. No live Perplexity search data was available. Competitive context for download page best practices and mascot recommendations below draws on training knowledge through mid-2026 rather than live search results. The live download page itself was retrieved directly via WebFetch at both `https://mnemosynec.ai/download` and `https://cephas.lianabanyan.com/download` (both serve identical content). The gap to flag to Bishop: any comparative benchmarks or recent competitor page updates after the training cutoff may not be reflected in Section B.

---

## Section A: Cohesion verdict

**Does the live download page feel like the same product as the welcome screen?**

The short answer: partially, and the gap is significant enough to matter.

### What lands

The welcome screen opens with two lines that have genuine character: "Your AI has Amnesia." and "Dr. MnemosyneC has the Cure." That is a specific, confident, memorable register. It makes a claim, names a problem, and introduces a persona in ten words. The tone is invitation without urgency, which is exactly the cooperative-class register this product needs.

The live download page opens with: "Never Repeat Yourself to Your AI Again." That line is competent. It names the same underlying problem. But it does not have the same snap. "Your AI has Amnesia" is a diagnosis. "Never Repeat Yourself" is a feature pitch. One is a doctor speaking; the other is a product brochure speaking. They describe the same condition, but they do not feel like the same voice.

The download page does carry the cooperative spirit once you scroll far enough. The "2nd Second Industrial Revolution" section, the "Who Made This" section, and the "Why join the cooperative" links all carry a genuine, human register. The line "There is no team of forty. There is no go-to-market deck, no Series B, and no venture capital waiting in the wings" is exactly what the welcome screen's warmth implies. It is the same product. But you have to scroll past six major sections of technical proof, benchmark charts, SHA-256 tables, and bounty posters to find it.

The "Good. Fast. Cheap." grid with all six checkmarks is a coherence win. The welcome screen bullet "Free AI that remembers, runs locally, belongs to you" maps cleanly to the grid rows (Free, Yours, Private). The evidence presented in the "Pinned Proofs" cards (BP071 Storm Test, BP067 Mesh Proof, BP063 R10 Harness) is directly consistent with the welcome screen's highlight tiles ("HOT/COLD Banyan Metric Results," "Google's Gemma 4 12B MMLU-Pro Benchmark," "BP074 Sound Barrier Cohen's Kappa 1.000 Trophy"). The data is real, the receipts are cited, the Truth-Always discipline holds. That is strong cohesion at the evidence layer.

The welcome screen CTAs ("Prove it with a test" in green; "Just use it" in blue) express a clear psychological model: some people want to verify before committing; others just want to move. The download page does not carry this model forward explicitly. There is one large download button. The "Prove It" path and the "Just use it" path are not legible as separate tracks on the download page, even though the underlying content (Gauntlet, R10 Harness, the benchmark section) could serve both. The mapping between the welcome screen's two-CTA model and the download page's single action is the clearest structural coherence gap.

### Where it drifts

The first drift is the headline register, noted above. "Never Repeat Yourself to Your AI Again" is a utility claim. "Your AI has Amnesia. Dr. MnemosyneC has the Cure." is a character introduction. A person arriving from the welcome screen expects to find the doctor waiting for them. Instead, they find a brochure.

The second drift is length and density. The welcome screen is compact, immediate, and human. The download page is long, thorough, and technical. The SmartScreen warning instructions appear before the cooperative philosophy, which is the right priority order for someone installing Windows software but the wrong emotional sequence for someone who needs reassurance before they trust this thing enough to install it. A cold visitor who does not yet trust the product encounters SHA-256 checksums and patent pledge terminology before they hear a single human sentence. The "Founder Speak" glossary (Eblet, Socceri, Yoke, Caithedral, Substrace) appears in an expandable section that reads like an insider primer. For someone who just wants to know whether this is safe to install, that glossary signals complexity, not warmth.

The third drift is the absence of Dr. MnemosyneC. On the welcome screen, the gray cartoon elephant in the white coat with the stethoscope and half-moon spectacles anchors the product's personality. The diagnostic-positive register (the doctor who can fix what's broken) is the emotional frame for everything the welcome screen promises. On the download page, there is no visual personality at all. The product becomes nameless and faceless at the exact moment when a stranger is deciding whether to give it 456 MB of their drive and a click of "Run anyway" past a SmartScreen warning.

The fourth drift is the bounty posters. They are honest and community-forward, which fits the cooperative canon. But appearing them prominently in the download flow signals "this software is unfinished and community-dependent" to a cold visitor who does not yet understand what Marks are. The framing is correct for an insider audience; it lands awkwardly for an Off-the-Street reader.

### The cohesion score

The evidence layer coheres well. The mission layer coheres, but you have to find it. The personality layer does not cohere at all: the doctor is in the welcome screen and not on the download page. The structural model (two-track: prove it / just use it) is present in the welcome screen and absent on the download page.

---

## Section B: Mascot recommendation

**Should Dr. MnemosyneC appear on the download page?**

Yes. Unambiguously yes. Here is where, how, and why.

### Why yes

Dr. MnemosyneC is not decoration. The elephant-in-a-white-coat framing does real cognitive work. It says: something was broken (your AI's memory), someone is here to fix it, the fix is safe, the person offering it has credentials. The stethoscope is not whimsy; it is a trust signal. The half-moon spectacles suggest careful attention. The gray coloring suggests solidity and longevity (elephants are known for memory, obviously, but also for endurance and age). The gentle smile removes the intimidation from the diagnostic register.

On the welcome screen, this mascot does that work efficiently. A cold visitor to the download page is in a more vulnerable position than a welcome screen visitor: they are about to click "Run anyway" past a Windows SmartScreen warning. That is the highest-anxiety moment in the entire installation funnel. It is precisely the moment when a trustworthy, calm, recognizable face would do the most to lower friction. The page currently has no human or humanized element at that inflection point. It has a warning box and a numbered list.

The competitive read on this is consistent. Duolingo's Duo owl is most instructive: the owl appears at every friction point in the Duolingo flow, not just at the onboarding screen. It appears at streak-failure ("Don't break your streak"), at lesson completion, and at pause screens. The owl does not deliver the educational content; it provides the emotional context around the content. Dr. MnemosyneC should operate the same way: present at the moments of hesitation, not only at the welcome screen.

Mailchimp's Freddie the chimp is a second useful reference. Freddie appears at confirmation screens and loading states, providing warmth at moments when the product is asking the user to wait or to trust. The parallels to the SmartScreen step are direct.

GitHub's Octocat is a third case, with a cautionary dimension: Octocat is beloved by developers but nearly meaningless to non-technical users. Dr. MnemosyneC is in better shape because the doctor framing is universally legible. Everyone understands what a doctor is for. The risk of insider-only legibility is lower here than it is for a mascot rooted in developer culture.

Clippy is the cautionary tale. Clippy failed not because it was a mascot but because it was intrusive and condescending. The lesson is: the mascot must appear at friction points where it has something reassuring to offer, not randomly or on a timed trigger. The SmartScreen section is exactly that kind of friction point.

### Where on the page

Three placement recommendations, in priority order:

**Placement 1 (highest priority): The SmartScreen installation warning block.** This is the highest-friction moment. A small Dr. MnemosyneC (at perhaps 80-100px tall) seated or standing beside the warning box, with a speech-bubble style annotation such as "Expected. Click More info, then Run anyway. I'll be here." The tone is calm, professional, diagnostic-positive. The doctor does not panic about the warning; the doctor contextualizes it.

**Placement 2 (high priority): Above the download button, in the hero section.** The welcome screen places the mascot at about 1/4 the height of the welcome card, centered. The download page hero needs something to anchor its personality. A version of Dr. MnemosyneC at roughly 120-140px, positioned to the right of the download button (or above the "Does it actually work?" section header), would bridge the gap between the welcome screen's warmth and the download page's evidence density. The mascot should not have a speech bubble here; the visual presence is sufficient.

**Placement 3 (lower priority, but worth considering): Near the "Prove it with a test" and "Just use it" split.** If the download page is ever restructured to reinstate the two-track CTA model from the welcome screen, Dr. MnemosyneC could serve as a visual guide marker for the two paths: one icon beside each CTA, perhaps the mascot with a clipboard for the "prove it" path and the mascot with a welcoming gesture for the "just use it" path. This is a design-intensive suggestion; it should not block Placement 1 and 2.

### What to avoid

Do not use a large, full-page hero illustration of Dr. MnemosyneC. The page's strength is its density of proof. A large mascot would compete with the evidence rather than framing it. Compact, purposeful placements serve this product better than a character-led visual identity overhaul. The doctor should be visible at the right moments, not omnipresent.

Do not remove the mascot from the welcome screen in an effort to create consistency by subtraction. The welcome screen's warmth is a genuine asset. The correct move is to bring some of that warmth down into the download page, not to eliminate it upstream.

---

## Section C: Off-the-Street test report

**Three cold-stranger personas tested against the live download page.**

The test standard: gender-neutral cold stranger who has no prior context about Liana Banyan, no familiarity with cooperative economics, and no preexisting reason to trust this software.

---

### Persona 1: The food truck owner, age 50

**Setup:** Runs a successful food truck. Not tech-averse, but not a developer either. Manages their own booking software, uses ChatGPT occasionally to write menu descriptions or respond to customer emails. A friend at the weekend market said "you should check out this free AI memory thing." They pulled up the link on their phone at a traffic light.

**What they understand in the first 10 seconds:**

The headline "Never Repeat Yourself to Your AI Again" lands clearly. They have in fact been repeating themselves to ChatGPT every week. The problem is real and personally felt. The "Free Forever, No Ads, No Strings" line directly below is legible and reassuring. The benchmark chart (6% to 89% for Claude, 6% to 78% for the free local model) is visible but not immediately interpreted. They see percentages going up and understand that something improves, but "Banyan Metric" and "75 Liana Banyan factual questions" don't connect to their use case.

**What they don't understand:**

"SSPL Free Forever, Pledge #2260" means nothing. "Substrate," "Eblet," "Caithedral," "Wrasse sub-millisecond pre-injection" mean nothing. The benchmark chart is over their head not because they are unsophisticated but because "Liana Banyan factual questions" is a self-referential benchmark. They do not know Liana Banyan well enough for those factual questions to calibrate to anything.

"NANO · 456 MB · qwen2.5:0.5b bundled" is confusing. They don't know what qwen2.5:0.5b is or whether that's the good version or the cheap version.

**What stops them:**

The SmartScreen warning. The page says "Windows will show a blue warning screen. Click More info then Run anyway." For a 50-year-old who has been told by every news article for the past decade not to click "Run anyway" on unknown software, this is a potential full stop. The framing is matter-of-fact and honest, which is correct. But without a face to trust, without warmth, without any signal that someone human stands behind this instruction, the warning may end the session. They will text their friend "it's asking me to click past a security warning, is that okay?" and if the friend doesn't respond promptly, the install does not happen.

**What lowers friction:**

A face at the SmartScreen warning. Specifically: Dr. MnemosyneC (or any humanized visual) with a calm, one-sentence reassurance alongside the warning. Additionally: a single sentence that translates the NANO vs FULL choice into human terms. Suggested copy: "Start with NANO. It's faster to install and works immediately. You can upgrade inside the app whenever you want, for free." That is sufficient. No model names, no parameter counts.

**Specific copy and layout changes:**

- Replace or supplement "NANO · 456 MB · qwen2.5:0.5b bundled" with "Starter version · 456 MB · installs quickly, works immediately. Upgrade to the full version inside the app anytime, free." The technical name (qwen2.5:0.5b) can remain in a collapsed technical detail row.
- Move at least one human sentence into the first screen. The welcome screen's "Great to use, better to join" is simple and welcoming. The download page above the fold currently has no sentence like it.
- The bounty posters ("WANTED: YouTube Tutorial," "WANTED: macOS Port") should be moved below the fold or into a "Community" tab. To a first-time visitor, they read as gaps in the product, not as community opportunities.

---

### Persona 2: The tech-curious college student, age 22

**Setup:** Computer science sophomore. Found the link in a Reddit thread titled "cool privacy-first AI tools." Uses a mix of Claude, ChatGPT, and local tools. Has heard of Ollama. Is looking for something interesting to run on their laptop, is comfortable with terminal commands, and is somewhat skeptical of anything that says "cooperative" because that word has been used to market plenty of things that turned out to be normal startups.

**What they understand in the first 10 seconds:**

More than most. They see the benchmark chart and immediately read the numbers. 6% to 89% is interesting. They notice "Ollama" in the chart label and read "Local, Free" with genuine interest. SHA-256 checksums are legible. "SSPL v1" is legible. "21 USPTO Provisional Patent filings" is surprising in an interesting way: most free tools don't have patent portfolios. "Pledge #2260" is unfamiliar but readable.

They will probably scroll past the "Good. Fast. Cheap." grid quickly. They will linger on the pinned proofs (BP071, BP067, BP063) because the receipts and hash-verification detail look real rather than manufactured.

**What they don't understand:**

"Liana Banyan factual questions" as a benchmark scope. This is the critical weakness for this persona. A technically sophisticated reader immediately asks: "What are these questions? Who wrote them? Why does accuracy on 75 Liana Banyan specific questions tell me anything about general performance?" The benchmark is accurate and honest, but without a link to the specific question set or a clear explanation that the questions test the substrate's own knowledge domain (not general knowledge), this persona may dismiss the numbers as biased or artificial.

"Cooperative commons," "Marks," "Socceri," and the cooperative economic structure will read as either intriguing or ideologically suspicious, depending on the person. The "Why join the cooperative" link and the $5/year membership are interesting but unexplained.

**What stops them:**

The benchmark scope problem. If this persona reads "75 Liana Banyan factual questions" and interprets this as "a test where the AI was trained on the test data," they will close the tab. The current page does not clearly explain that the benchmark tests recall of information that was stored into the substrate by a human operator, not information that was baked into the model weights. That distinction is the entire point of the product, and it is not made legible at the benchmark section.

**What lowers friction:**

One sentence of clarification at the benchmark: "These 75 questions test recall of information that was manually stored in the substrate by a human, then asked again in a fresh session where the model had no access to its own context history. Without the substrate, the model forgot everything. With it, the model found the stored answer." That is what the numbers show, and stating it removes the benchmark-contamination suspicion.

The Gauntlet (six-stage verification, run it yourself) is an excellent fit for this persona. It should be promoted earlier in the page, not buried in the technical section. A line near the top: "You don't have to trust these numbers. Run the Gauntlet yourself: install, go to the Developer Tab, click Run Gauntlet. Six automated stages, no prompting required."

**Specific copy and layout changes:**

- Add one clarifying sentence to the benchmark callout (see above).
- Move the "K533 Reproducibility Pack" link and the Gauntlet description to the top of the evidence section, not the bottom. This persona's trust pathway is "I can verify this myself."
- The "Founder Speak" glossary should have a one-line framing at the top: "MnemosyneC uses specific terms for specific things. Here's a quick reference." That framing signals intentionality rather than jargon accumulation.
- The cooperative economics (83.3% creator share, $5 membership, 50-year sunset clause) will be interesting to this persona, but they are currently buried. A summary tile near the top of the page with "No VC. No ads. $5/year membership. 83.3% to creators. 50-year cooperative sunset clause." takes 15 seconds to read and will raise credibility significantly with a skeptical technical audience.

---

### Persona 3: The retired teacher, age 70, rural Maine

**Setup:** Retired 7th-grade English teacher. Has a laptop, uses email and Facebook, occasionally uses Google. Her daughter (who works in tech) forwarded her an email with a link and a note: "Mom, this might help you with your genealogy research. It remembers everything for you. Free." She opens it on her laptop at her kitchen table.

**What she understands in the first 10 seconds:**

The headline "Never Repeat Yourself to Your AI Again" is legible and appeals to something real. She has, in fact, had to re-explain her entire genealogy research context to ChatGPT every single time she opens a new session. But the word "AI" in the headline assumes she knows what AI is well enough to have a frustration with it. She may or may not.

The "Free Forever, No Ads, No Strings" line is reassuring. She has been burned by apps that are "free" and then charge her later. But she needs to see it twice to believe it.

**What she doesn't understand:**

Almost everything below the fold. The benchmark chart (without knowing what Claude, GPT-5.5, Llama, and Gemini are, the bar chart is meaningless), the SmartScreen instructions, "SHA-256," "SSPL v1," "Eblet," "Substrate Architecture," "Drekaskip wave generator," all of it. The "NANO" and "FULL" terminology without human translation means nothing. The bounty posters ("WANTED: macOS Port") will read as concerning to her: if they're still looking for people to build it, maybe it is not ready.

**What stops her:**

The SmartScreen warning is likely a hard stop. She will read "Windows protected your PC" as a warning that her computer has caught a threat, not as a routine code-signing circumstance. The page instructs her to click "More info then Run anyway" but does not explain why Windows shows this to everyone who runs new software, not just bad software. Without understanding the mechanism, she will not override a security warning. This is a full funnel exit for this persona with the current copy.

Second stop: the lack of a "what does this do for me specifically" sentence near the download button. The download page explains what MnemosyneC is in general. It does not say "here is what your first session will look like." For someone whose use case is genealogy research, a sentence like "After you install, you can give it your research notes once and it will remember them across every future conversation" would connect her daughter's promise to a concrete experience.

**What lowers friction:**

One reframe of the SmartScreen section is the single highest-impact change for this persona. Current copy: "Because this is new software without an EV certificate, Windows SmartScreen will show a blue warning screen ('Windows protected your PC') on first run. This is normal and expected. Click More info then Run anyway to proceed." Suggested reframe: "When Windows sees new software for the first time, it shows a caution screen. This happens with all new programs, including ours. It does not mean there is a problem. When you see it, click 'More info' and then 'Run anyway' to continue. The installer is safe."

The distinction is subtle but significant: "This is new software without an EV certificate" is a technical explanation that implicitly raises the question "why don't they have the certificate?" The reframe explains the mechanism from the user's experience outward, not from the product's technical limitation outward.

The other high-impact change: a single plain-English sentence near the download button. "Click the button below to download. It takes about 5-10 minutes to install. Your data never leaves your computer." That is the sum of what this persona needs to feel safe before clicking.

Dr. MnemosyneC near the SmartScreen section is also a meaningful friction reducer for this persona. A friendly cartoon doctor says "trusted, safe, someone is accountable for this" in a way that technical reassurance alone does not.

**Specific copy and layout changes:**

- Add a plain-language lead-in above the download button: one sentence, no technical terms, about what happens after you click.
- Reframe the SmartScreen section as described above, explaining the mechanism from user experience, not from EV certificate absence.
- Consider a "How your first conversation will work" expandable section showing a two-step example: (1) you tell it something once; (2) you ask it again three days later and it remembers. No technical vocabulary. The genealogy researcher, the food truck owner, and the college student all benefit from this, but the retired teacher needs it most.
- Move the glossary, the patent section, and the substrate architecture details further down or behind a "for technical readers" disclosure. The current page depth implies that all of this is necessary before you can make the download decision. It is not.

---

**Cross-persona summary of top five changes, ranked:**

1. Add Dr. MnemosyneC to the SmartScreen warning section (affects all three personas, but especially Persona 1 and 3).
2. Reframe the SmartScreen warning copy to explain the mechanism from user experience outward (critical for Persona 3, improves Persona 1).
3. Add one clarifying sentence to the benchmark section explaining what "75 Liana Banyan factual questions" actually tests (critical for Persona 2).
4. Replace or supplement "NANO · qwen2.5:0.5b" with plain-language equivalents (affects Persona 1 and 3).
5. Add a "what your first conversation will look like" explanation before or alongside the download button (affects all three personas).

---

*— Pawn via Knight perplexity-pawn MCP · BP079 · 2026-06-10*

*Note: pawn_search MCP returned HTTP 401 (invalid API key) on all four queries. Live download page content retrieved directly via WebFetch. Competitive comparisons (Ollama, Duolingo, Mailchimp, GitHub Octocat, Clippy) draw on training knowledge, not live search results. The download page at both mnemosynec.ai/download and cephas.lianabanyan.com/download served identical content as of this review.*
