# PAWN PROMPT — R14 LB Cultural-References Adversarial Bank

**Purpose:** Generate 50 adversarial sealed-bank questions for the K500 R14 reproducibility validation. The corpus is the Liana Banyan internal cultural-reference fabric — Founder-coined phrases, named LB systems, Stitchpunk class taxonomy, philosophical concepts, and Founder-voice keystones. This is the *companion* sealed bank to the ODNYWS bank: where ODNYWS tests a closed-system fictional universe, this bank tests Liana Banyan's internal vocabulary.

**Why this works as a sealed bank:**
- LB-specific phrasings (e.g., the *Founder's inversion* of Luke 12:48 — *"if much is required of me, then I have been given MUCH"*) are unpublished outside internal LB documentation
- Stitchpunk class names (Miners / Sculptors / Seer / Augur / Chronos / Chroniclers / Dragonriders) are LB-coined and not in training data
- Specific systems (Slow Blade, XP × Rep, Trust Match probation tiers, Six Sparks, Conductor's Baton mode names) are LB-specific architecture
- Founder-voice keystones in their *exact LB-canon phrasing* (the inversions and rephrasings that make them keystones, not the source quotations they're rephrased from)

**Bishop curation rules** (applied below):
1. **AVOID externally-published references.** Where an LB term has been published in Cephas posts, the librarian-mcp public preload, Substack, or external Crown letters → exclude or scope to internal-only details.
2. **PREFER Founder-inversion phrasings** over their original-Scripture / original-quotation forms. The inversion is LB; the source is general knowledge.
3. **AVOID mainline doctrinal Scripture answers.** A question whose answer is "Matthew 7:12" is general religious knowledge; a question whose answer is *"Always Offer What You Would Want"* (Founder's specific plain-English form) is LB-specific.
4. **PREFER named-system mechanism details.** *"What is the rate-limit mechanism named after a Dune reference?"* → Slow Blade. Specific mechanism names are LB-coined.

---

## THE PROMPT TO PAWN (copy-paste ready)

```
You are generating an adversarial sealed-question bank for a cross-vendor AI benchmark.

CORPUS: The Liana Banyan Corporation internal cultural-reference fabric. Liana Banyan is a pre-launch cooperative-economics platform in development; most of its internal vocabulary, Stitchpunk class taxonomy, Founder-voice keystones, and named architectural systems have NOT been published externally. Questions must require knowledge of THIS specific corpus to answer correctly — general knowledge of cooperatives, AI, or named-source quotations is insufficient.

TASK: Generate 50 adversarial questions, each with:
- question_id (e.g., "LBCULT-01")
- question_text (single-sentence factual question)
- answer_key (the specific LB-canonical answer)
- minimum_evidence (1-3 sentence excerpt from corpus that establishes the answer)
- difficulty_class ("specific_fact" / "named_entity" / "mechanism" / "relationship" / "founder_phrasing")
- contamination_check_note (one sentence explaining why this question CANNOT be answered from training data — what makes it LB-unique vs. general knowledge)

REQUIREMENTS:
1. Each question must be answerable ONLY from the LB corpus excerpts below.
2. AVOID questions where the answer is general religious / philosophical / cultural knowledge. The Bible quote is general; the Founder's specific inversion of it is LB-specific. Test the LB version, not the general source.
3. AVOID questions about LB systems whose names are externally published (Cooperative Defensive Patent Pledge alone is too general; specific *mechanisms within* the Pledge structure are LB-specific).
4. Mix difficulty across five classes:
   - ~12 specific_fact (one numeric or named LB-canonical answer)
   - ~12 named_entity (LB-coined proper noun: Stitchpunk class, system name, character/mascot name)
   - ~10 mechanism (how-does-LB-X-work answer; specific to LB architecture)
   - ~8 relationship (LB-X-is-related-to-LB-Y answer)
   - ~8 founder_phrasing (the specific Founder-canonical phrasing of a Founder-voice keystone, NOT the source quotation it's rephrased from)
5. Each question's answer must be unambiguously locatable in the corpus excerpts.
6. Phrase questions so cold-condition models will guess plausible-but-general answers (e.g., "what's the Golden Rule?" → "Do unto others"), making the substrate's LB-specific answer (*"Always Offer What You Would Want"*) more diagnostic.

OUTPUT FORMAT: JSON array of 50 objects, each with the fields above. No prose preamble.

CORPUS EXCERPTS FOLLOW BELOW. Read all before generating. Generate the 50 questions only from material in the excerpts.
```

---

## CORPUS EXCERPTS (the material Pawn pulls from — internal LB fabric)

### LB STRUCTURAL CANON (basic facts an LB member would know)

- Liana Banyan Corporation — Wyoming C-Corporation filed November 21, 2025 (NOT an LLC)
- Membership: $5/year
- Creator keeps: 83.3% on every transaction (never 83%, never 84% — exactly 83.3%)
- Platform margin: Cost+20% (no more, no less)
- Attribution: ONE LEVEL ONLY (not MLM)
- Three currencies: Credits ($1=1, one-way valve, never cash out to fiat) / Marks (effort-differential, all backed by real work) / Joules (surplus / "forever stamp")
- IP allocation: 60% patent buckets / 20% Founder-creator / 10% global sponsor pool / 10% individual Pedestals
- Six Cold Start Pathways: Food, Manufacturing, Service, Local Business, Guild, Tribe
- AI Team chess-piece designation: Rook (Gemini, Brainstormer) / Knight (Cursor, Builder) / Bishop (Claude, Strategist) / Pawn (Perplexity, Verifier) / Founder (AI Tuner)

### STITCHPUNK CLASS PANTHEON (LB-coined; not in training data)

The Stitchpunk Corps consists of named functional classes:

| Class | Function | Reference |
|---|---|---|
| **Three Fates** (Clotho / Lachesis / Atropos) | Input-side query routing — receives queries, scores Scribes, dispatches to right substrate | Greek Fates triad |
| **Hounds** (5-pack: Baskerville / Herald / Guard / Nurse / Bloodhound) | Multi-capability transport + corpus reconnaissance | Hound-pack archetypes |
| **Loom** | Domain-Scribe weaving — composes multiple Scribes into unified retrieval | Weaving metaphor |
| **Tribunal** | Live multi-agent verification — contemporaneous truth-checking | Three-judge tribunal |
| **Cerberus** | Retrospective multi-head verification — three perspectives on past output | Cerberus three heads |
| **Miners** | Living Pyramid of Roots — corpus-prospecting agents with mitosis | Mining metaphor |
| **Sculptors** | IP-as-filter — curate, sculpt, anticipate at output boundary | Sculpting metaphor |
| **Seer** | Eblet-indexed authoritative answering with provenance walk | Oracle/seer |
| **Augur** | Multi-Seer cross-Pyramid synthesis — detects conflicts between Seers | Roman augury |
| **Chronos** | Time-state aggregator — invoked via HourGlass interface | Piers Anthony Incarnations of Immortality |
| **Chroniclers** | Per-component iterative-state-Scribes (*"like bacteria in the gut"*) | Chronicler-monks archetype |
| **Dragonriders** | Phase-Shift agents that go BETWEEN times AND locations | Anne McCaffrey Pern |
| **Angel of Death** (NON-Pantheon) | Sanction-constrained cleanup; two modes: Sever + Bury | Baron Munchausen / Rick & Morty C-137 |

### NAMED LB SYSTEMS (architectural; LB-specific names)

- **The Furnace** — verification engine + immutable public ledger; stamps badges, listings, letters, Marks, votes; verifiable via hash lookup
- **Slow Blade** — rate-limit on Furnace stamps per account per unit time; named after Dune ("the slow blade penetrates the shield")
- **XP × Reputation weighting** — every action multiplied by account's XP × Rep; Sybil accounts at 0×0 = 0 aggregate leverage
- **Trust Match** — mutual Mark-staking between strangers; bond strengthens over time; bad behavior forfeits stake to counterparty
- **Six Sparks** — accelerator paths for new-member visibility; six effortful paths, any TWO required (3 shareable, 3 non-shareable)
- **Seasoning** — time-lock on trust accumulation; even with acceleration, credit applies once per day
- **Good Standing Roll** — inverted allowlist; LB tracks only in-good-standing members, not bad actors
- **Furnace-every-click** — every badge/stamp click re-verifies through Furnace + Battery-dispatch register
- **The Conductor's Baton** (#2277) — Vendor-Neutral Adaptive Model Router; "Automatic Transmission for AI"; three modes: auto-route / manual / vendor-lock; orchestra metaphor (Conductor + instruments + sheet music) AND automatic-transmission metaphor (member = driver)
- **The Cathedral** — domain-indexed working memory with triply-redundant witness; Scribes Cathedral architecture
- **The Cooperative Defensive Patent Pledge (#2260)** — IP-licensing framework that redistributes patent value cooperatively rather than concentrating in PAE/NPE assertion strategies

### FOUNDER-VOICE KEYSTONES (LB-canonical phrasings — the inversions and rephrasings unique to LB)

The following are the Founder's specific LB-canonical phrasings. Each is distinct from any source quotation it may rephrase. Cold models may know the source quote but NOT the Founder's specific LB phrasing.

#### Standalone Founder-coined phrases (no source quotation)

- **"Every AI company is currently paying a tax they don't know they're paying."** — root-cause-diagnosis opener
- **"Especially from friendly fire."** — moral-weight anchor
- **"I pray for potatoes at the end of a hoe handle."** — humility-of-ask anchor
- **"And I have two suits."** — un-fancy credibility anchor
- **"I know enough to know I don't know enough."** — epistemic-humility anchor
- **"Nothing about us without us."** — governance-principle anchor
- **"What we need is people and leadership; the money will follow."** — institutional design precedes funding
- **"No Plan Survives First Contact."** (canonical all-caps in Founder usage) — biographical/governance anchor
- **"The medallions are minted. The platform is built. The first ten members are ready. What I lack is the wisdom and experienced leadership to ensure we serve millions, not hundreds."** — catalytic-closure rhetorical anchor
- **"Help each other help ourselves."** — mutual-aid inversion of charity framing
- **"I read a lot, and I am good at chess."** — biographical understated-credibility anchor
- **"The way I learned things affected WHETHER I learned them."** — Anachronism Principle axiomatic form
- **"A rising tide lifts all boats. And I think I've built a system of wells."** — economic-sovereignty inversion (the LB inversion; "rising tide" alone is general)
- **"53 years of surviving the trenches of poordom, and I'm really good at it."** — biographical-competence + self-mockery
- **"A tool that measures its own value and shows only you, unless you agree to share it anonymously, or publicly."** — three-tier user-agency anchor (anti-enshittification)
- **"When all the Scribes sing together, The Harmony is Glorious."** — Cathedral Effect emotional anchor
- **"The Choral Wave Reverberates the More Voices We Have."** — Cathedral Effect subtitle
- **"Each Scribe a Voice. All as One."** — Cathedral Effect epigraph
- **"Build the Bridge Behind You."** — primary inheritance keystone (Founder's father's invocation of the Dromgoole 1900 parable)
- **"Be Who You Needed."** — empathy-engine framing
- **"I don't build escape tunnels. I build more arrows."** — Cortez-at-Veracruz stance
- **"We hand them the reins of our very fast horse."** — user-sovereignty anchor (fast horse, not slow)
- **"Basically TCP/IP."** — three-word anchor for the Cathedral Federation Protocol
- **"They do what IP does — pass it on, as a filter."** — defines property-ness of information
- **"This is Your World. Shape it, or Someone Else WILL."** — active-shaping imperative
- **"It's better to cut off a puppy dog's tail all at once than an inch at a time."** — brick-wall posture (lived-experience register)
- **"Every bomb-defusing rule is written in blood."** — engineering-safety register
- **"I don't give compliments I don't mean."** — directness/credibility-of-yes principle
- **"When I say you're beautiful, you KNOW it is TRUE. Because I wouldn't say it otherwise."** — lived-experience illustration of credibility-of-yes
- **"Always Offer What You Would Want."** — Founder's plain-English form of Matthew 22:39 (Jesus's "second greatest commandment"; NOT what Jesus called the Golden Rule — that's later cultural shorthand)
- **"We are each more, together."** — six-word cooperative reciprocity anchor

#### Founder-coined inversions (the LB form is unique; the source quote is general)

- **Luke 12:48 inversion**: source = *"To whom much is given, much shall be required."* Founder LB inversion = ***"If much is required of me, then I have been given MUCH."*** (The inversion is the keystone; the source is general.)
- **Anne Rice / vampires-can't-evolve framing**: Founder LB form = ***"The old vampires that can't evolve are the ones whose language was never spoken in the new age."*** (LB-specific; not in any Anne Rice text directly.)

### LB FOUNDATIONAL CONCEPTS (LB-specific terminology)

- **HEOHO** — Liana Banyan's term for *Interdependence* (NOT collectivism, NOT individualism — interdependence as a third way; cf. 1 Corinthians 12:21 "the eye cannot say to the hand, I have no need of thee")
- **The Cloyd Pattern** — Pre-extended trust repaid through demonstrated labor; named for Mr. Cloyd, a Founder-life mentor; unifies Mr. Cloyd + Courtesy SSL + SSSS + Destination Housing
- **The Anachronism Principle** — Design method; ancient disciplined practice teaches modern structured thinking; eight biographical instances (shape-note singing, aviation, saxophone, typing, 1997 internet call, seminary laptop, Cloyd layaway, Pre-BASIC/Cory)
- **Inuka the Husky** — Founder's husky; trained to "speak on command" rather than not to bark; behavioral-philosophy anchor for *"direct, don't stifle"*
- **The Inuka Coefficient** — measurement metric for substrate keystone-anchor coverage; 43% bootstrap (K485) → 62.7% at-scale (K490); part of the Wheelbarrow Empirical / Mush Index family
- **The Mush Index (MI)** — canonical scale-name for the Cathedral-Effect measurement; sleddog metaphor (*Inuka IS a Husky*); composite: Cold Start Score + Mushed Score + Mush Index (lift) + Inuka Coefficient + Iditarod Distance
- **Pine Books / Tiffany Brost** — Pike Place Market Seattle bookstore; the Librarian-metaphor anchor (small-bookstore-owner who walks to the right shelf from two words of the book's title — that's what the Librarian does)
- **The 6th-Caretaker Pattern** — Pine Books has had six caretakers in ~Apr 17 2026; the LB-Librarian-metaphor anchor reference

### LB CHARACTER NAMES (mascots / guides; LB-coined)

- **LRH** — per-page greeter character (replaced an earlier 31-step guided tour); appears across LB platform UI as a member-onboarding host
- (Per `feedback_no_human_characters.md`: all LB characters are animals, insects, or chess pieces. Mascot taxonomy is canonically non-human.)

### NAMED EMPIRICAL FINDINGS (LB-specific; from internal R-runs)

- **The Cathedral Effect** — the empirical finding that substrate-grounded retrieval lifts cheaper-tier models to flagship-tier accuracy at order-of-magnitude cost reduction; named B120
- **The Russian Two-Step** — research-iteration pattern: one step backward, two steps forward (hypothesis → empirical test → partial-confirmation-or-gap → refinement → next test); Founder-named B123-late
- **The Wheelbarrow Empirical** — The empirical study quantifying the Cathedral Effect; named for the AI-as-wheelbarrow policy (AI amplifies human capacity, doesn't replace it)
- **The Conductor's Baton** (#2277) — see above; vendor-neutral routing
- **R10 / R12 / R13 / R14** — sequential cross-vendor benchmark runs; R10 prior-gen (B111), R12 sealed Cranewell+Covenant (B122), R13 current-frontier-tier (B124, +86.2pp mean lift across 8 models), R14 reproducibility (forthcoming)

### LB PHILOSOPHICAL POSITIONS (canonical to LB; not general philosophy)

- **"Prove it first. Product it second."** — methodology principle (math before adjectives, Cost-Slasher; empirical gate before feature ship; "we don't predict demand, we measure it, because we MAKE it")
- **The Three-Door Engagement** — Mimic Card design + X-Ray Overlay + Substrate-Fork (three depths of member engagement)
- **The Bandaid Cluster** (B124 keystone family): *puppy-tail / rip-the-bandaid / bomb-defusing-rules-in-blood / gold-refined-by-fire / fail-fast-fail-often* — five rhetorical registers for the same brick-wall engineering posture
- **The Credibility-of-Yes Cluster** (B124 keystone family): *don't-give-compliments-I-don't-mean / when-I-say-you're-beautiful-you-know-it's-true / let-your-yea-be-yea* — three registers for the Authoritative-Answer-AI honest-unknown property
- **Economy of Mass** — military-doctrine anchor (combines two Principles of War: Mass + Economy of Force); Founder lived-experience framing for the Conductor's Baton routing principle

### LB FOUNDER BIOGRAPHICAL FACTS (relevant to specific Founder-voice context)

- U.S. Army National Guard veteran (enlisted at 16, Infantry 11B → OCS → Aviation 15A IFR-rated)
- Father of eight
- Wife is photographer by trade
- Wyoming C-Corp filed November 21, 2025
- Founder titles: "AI Tuner" (preferred, per Crystal Singer / Anne McCaffrey metaphor — NOT "CGO/CAIO/Chief AI Officer")

---

## CONTAMINATION-PROOF NOTES (for Bishop / Founder review only — NOT sent to Pawn)

**Why these excerpts produce 0% cold for most questions:**
1. Founder inversions (e.g., Luke 12:48 inversion) are LB-canonical and unpublished
2. Stitchpunk class names (Miners / Sculptors / Seer / Augur / Chronos / Chroniclers / Dragonriders) are LB-coined and not in training data
3. Specific LB system names (Slow Blade / Six Sparks / Trust Match probation tiers / Furnace-every-click) are LB-architecture-specific
4. The Inuka Coefficient / Mush Index / Wheelbarrow Empirical are LB-coined empirical metrics
5. The Cloyd Pattern, Anachronism Principle, HEOHO are LB-coined terminology
6. The Conductor's Baton, Cathedral Effect, Russian Two-Step, Cooperative Defensive Patent Pledge are LB-coined or LB-named

**Possible cold-leak concerns** (Bishop should flag for Founder review post-Pawn-output):
- Some Founder-voice keystones rephrase Bible / Shakespeare / public-domain quotations; if Pawn generates a question whose answer is just the source quote, that's general knowledge. The CHECK is: the LB-canonical answer must be the *Founder-specific phrasing*, not the source.
- If Pawn generates a question whose answer is just "Wyoming C-Corp," that's externally documented (the LB filing is public record). Such questions should be excluded from the bank.
- If Pawn generates a question about HEOHO whose answer is literally "Interdependence," cold models may guess from the Greek roots. Better: the question tests *what HEOHO is NOT* (not collectivism, not individualism — the LB-specific framing).

**What Bishop deliberately excluded for personal-comfort reasons:**
- Specific living-family names — Founder explicitly redacted Diana's name and the Vigil family name from this Pawn-input bio block B124. Pawn must NOT generate questions referencing first names or family surnames of Founder's family. Wife described only as "photographer by trade." No child names. No specific family identifiers beyond Founder himself.
- The Founder's specific medical / financial / legal personal history beyond what's already in published Crown letters
- Anything that could be considered politically-coded outside Founder's chosen framing

---

## FOUNDER REVIEW CHECKLIST

Before posting to Pawn:

- [ ] Are the corpus excerpts above accurate to LB canon?
- [ ] Are there any keystones / system names / Stitchpunk classes you'd prefer to redact?
- [ ] Are you comfortable with the biographical-fact scope I've drawn?
- [ ] Any specific cultural references you want emphasized vs. de-emphasized?
- [ ] Are there cultural references I've missed that you'd want included? (Specifically: *"No Atomo. Superman!"* doesn't appear above as a discrete excerpt — should I add the No Atomo paper context? Currently in corpus implicitly via "AI Team chess-piece designation" but you may want explicit.)

If checklist passes: copy the prompt block at the top + the corpus excerpts below it into Pawn. Pawn returns 50 questions in JSON. Founder reviews the 50 questions before R14 dispatches. Knight then ingests questions into substrate and runs R14-LBCultural alongside R14-NewSealed (ODNYWS) for a two-bank comparison.

---

*FOR FOUNDER REVIEW. Pawn dispatch gated on Founder approval. Long haul. By their fruits.*

— Bishop B124
