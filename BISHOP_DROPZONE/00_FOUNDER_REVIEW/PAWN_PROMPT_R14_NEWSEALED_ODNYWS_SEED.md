# PAWN PROMPT — R14 NewSealed Adversarial Bank from ODNYWS (Ordinary Worlds)

**Purpose:** Generate 50 adversarial sealed-bank questions for the K500 R14 reproducibility validation. The corpus is *Ordinary Worlds* (ODNYWS), an unpublished novel by Jonathan R. Jones (Founder). Because ODNYWS is unpublished, no LLM has it in training data — questions about ODNYWS-specific worldbuilding will produce 0% HOT cold across all 8 R14 models, satisfying the contamination-proof property R14 requires.

**For Founder review BEFORE posting to Pawn.** Bishop has curated the source material to:
1. Use ODNYWS-specific worldbuilding (Five Realms, Limbo, magic system, items)
2. **AVOID the Medallion/Watch concept** — Founder noted in source material *"This is the SAME medallion concept that appears in HEXISLE and Liana Banyan"* — Pawn should NOT generate questions about the medallion specifically because models with LB platform context might inadvertently answer
3. Use specific proper nouns and numerical details (compass positions, crushed-pearl mechanism, white gold composition, etc.) that are uniquely diagnostic
4. Steer away from autobiographical / personal-life material (the Hero's Arc autobiographical sections) toward world-building / magic-system / artifact mechanics

---

## THE PROMPT TO PAWN (copy-paste ready)

```
You are generating an adversarial sealed-question bank for a cross-vendor AI benchmark.

CORPUS: An unpublished portal-fantasy novel called "Ordinary Worlds" (abbreviated ODNYWS) by Jonathan R. Jones. The corpus has never been published. No LLM has it in training data. Questions must require knowledge of THIS specific corpus to answer correctly.

TASK: Generate 50 adversarial questions, each with:
- question_id (e.g., "ODNYWS-01")
- question_text (single-sentence factual question)
- answer_key (the specific factual answer from corpus)
- minimum_evidence (1-3 sentence excerpt from corpus that establishes the answer)
- difficulty_class ("specific_fact" / "named_entity" / "mechanism" / "relationship")
- contamination_check_note (one sentence explaining why this question CANNOT be answered from training data — what makes it ODNYWS-unique)

REQUIREMENTS:
1. Each question must be answerable ONLY from the ODNYWS corpus excerpts below.
2. Avoid generic fantasy tropes (e.g., "What does a wizard cast?") — use ODNYWS-specific proper nouns, mechanics, artifacts.
3. SKIP any questions about the Medallion/Watch artifact — that concept overlaps with another corpus.
4. Mix difficulty: ~15 specific_fact (one numeric or named answer), ~15 named_entity (proper noun answer), ~10 mechanism (how-does-X-work answer), ~10 relationship (X-is-related-to-Y answer).
5. Each question's answer must be unambiguously locatable in the corpus excerpts. No interpretive or speculative questions.
6. Phrase questions so cold-condition models will guess plausible-but-wrong answers (adversarial), making the substrate's authoritative answer more diagnostic.

OUTPUT FORMAT: JSON array of 50 objects, each with the fields above. No prose preamble.

CORPUS EXCERPTS FOLLOW BELOW. Read all before generating. Generate the 50 questions only from material in the excerpts.
```

---

## CORPUS EXCERPTS (the material Pawn pulls from — all included verbatim from ODNYWS source)

### CORE PREMISE

A hero who escapes into fantasy discovers that fantasy is real — and that the cold hard facts of life lead him back to what he thought was imagination. Portal fantasy adventure / autobiographical journey / philosophical treatise on responsibility, escapism, and redemption.

### THE FIVE REALMS

| Realm | Element | Entry Method |
|-------|---------|--------------|
| EARTH | Solid | Merging into ground, becoming ethereal |
| SKY | Air | Flying; begins in Whirlwind City |
| WATER | Sea | Sheer precipice dive into hidden lake |
| FIRE | Flame | Rock and Lava World |
| LIMBO | Between | Mirrors — the only connection to all worlds |

### LIMBO (The Rift Between Worlds)

> "Mirror travel actually is in Limbo, but seems to bypass it due to mode of travel. The Wizards never wanted to stop in Limbo, so their spells use it (which they have to — Limbo is the only connection to all the worlds) but they never sightsee. It is BETWEEN. (Cold, airless)"

### WATER REALM ENTRY

> "A sheer precipice. At the bottom is a lake with bedrock and granite and volcanic glass formations just under the surface of the water and breaking the water to rise several feet into the air ending in sharp shards. The entrance to the sea world is somewhere hidden in this lake. To enter, Hero must jump from the cliff above and dive directly into the only place deep enough to survive."

> "Crushed pearls make a human's lungs capable of receiving oxygen in water. They cover the inside of the lung, forming a mesh small enough to sieve oxygen out — much the way gills work."

### KEY ITEMS/ARTIFACTS

**[Bishop note: SKIP THE MEDALLION/WATCH — see contamination warning. Medallion description omitted from this Pawn input.]**

#### THE SIGNET RING

> "Signet Ring worn on hand of hero as symbol of office — hereditary wizardry. Made of white gold — signifies power over or during moonlight — design is of a full eclipse — true meaning is that of meekness — POWER under control. Not possessed until travels to the other lands, then purchased for $5, when he thinks it's made of silver."

#### THE SOUL SWORD

> "Soul Sword formed of pure will/essence that is hero's very being — strong or weak depending on status of soul. (Confidence, strength of will)"

#### THE TRUMP DECK

> "Trump Deck consisting of cards with images hero describes on them, either people or places, so that he may go there or be where that person is, some other uses as well, of course, depending on how he plays them. Made from spells and ingredients found in spell books (private library cache)"

#### MIRRORS

> "Any Mirror is a potential gateway into limbo or some other place, depending on the strength and ability of the mage that uses it. To access, simply focus on the mirror (stare), concentrate, and WILL it. A gateway is formed if properly done."

### THE NATURE OF MAGIC

> "Hero, and most people, confined to physical senses by way of usual experiences. Magic is ordinary, but unknown to most of us because we do not understand the principles of everything in this world or any other."

> "Since true magic practices have been obliterated from this world, and replaced with sham practices and superstition to give magic even less credibility (by BAD GUYS), then we cannot observe and copy actions concerning magic to get magic results."

### THE THREE KEYS

> "The magic is there already, waiting to be used, if we have the proper keys. The first key is belief. The second, virtue (Doing what you know to be right, no matter what, and when you have a question about what is right, doing only what you KNOW.) The third, knowledge."

### THE VIDEO GAME METAPHOR

> "His reality is much like that of a video game character's. Walls exist in the video game world, defined by boundaries associated with the character (which are usually limited to eyesight and hearing) but in the PLAYER'S world, the wall on the screen doesn't really exist."

### EMOTION AND MAGIC

> "Only when our emotions are touched — in times of duress or conflict, sadness or triumph, do we FEEL that we believe. It is through the control of emotion, not the absence of it, the CONTROL of FELT emotions, (or lack of control) is the Hero potent and efficient in his use of magic."

### THE LETTER IN THE MISSING BOOK

A dying man's confession found hidden in the library:

> "This is a physical world, and often I am caught up in its material reality. Only at rare moments am I able to shake off the immediateness of my physical existence and think of a more essential one... I used to BE more than I am... I have never mentioned these things because no one will believe me, but I am finally dying, and have nothing left to fear, as I leave no survivors. I hope to find the place of my dreams, if it is only that."

### CHAPTER STRUCTURE

| Chapter | Title |
|---------|-------|
| One | AWAKENING |
| Two | GATEWAY |
| Three | WRAITH |
| Four | LILY PRINCESS |
| Five | TRAITOR |
| Six | CATALYST |
| Seven | RELEASE |
| Eight | ODDSBREAKER |
| Nine | MIDNIGHT |
| Ten | THE GATES OF THE ANCIENT CITY |

Additional referenced chapters: SHADOW SEEKER, DARKSTRIDER, TALISMAN.

### PHILOSOPHICAL FOUNDATIONS

#### GOOD AND EVIL

> "Evil isn't demons and dragons. It's simply not doing what we should do, like walking away from a crime scene in which we could intervene — THAT'S evil. Or doing something we shouldn't do, like stealing — THAT'S evil."

> "Good and Evil do not fight each other on equal terms, but evil is allowed to exist for a time in order to be fair to the subjects that must choose."

> "Everything that Evil has is simply the benefit and blessings of the good that have been misused and perverted since evil never makes anything, it simply remakes or reforms from what is already there, or it simply destroys; never creating."

#### CLOSED SYSTEMS AND KNOWLEDGE

> "A creation cannot be greater than its creator. It may think it can, but it is not."

> "Knowledge cannot be originated in a closed system — it must be brought in from the outside."

#### THE BELL JAR THEORY (Finite Universe)

> "The universe being hung by gravitational pull upon each other planet, and in reality only being finite in length and breadth, with a single side viewed from different points of reference... Explains why the stars seem to be infinite — they are not, as the stars fourteen galaxies to the left of the earth and the stars that are five galaxies to the right are in reality the very same stars, seen from different sides."

> "This can be illustrated by the child's trick of taking a piece of paper, ripping or cutting off a length, laying it flat and twisting it once, and putting the ends together with tape." [Möbius strip illustration of the Bell Jar Theory]

### NATURE OF THE UNIVERSE

> "All of time and space and dark and light are made up of matter. Time is simply waves of energy moving across all matter simultaneously, all matter sharing the same cycle. Heat is movement, or residual energy... Cold is the lack of movement. Cold is inertia..."

### PEOPLES / RACES

- Alatars
- Sylkaks
- Inyisth
- Celygn
- Bainwar
- Alawir
- Saed (Hero's actual though not apparent race)

### SPELL BOOKS IN THE LIBRARY CACHE

- Master Gamester — Role manipulator
- The Wicked Stage
- Passing Judgements
- Experimental Theater
- The Power of Steel and Other Metal's Properties
- Philosophy and Practice of Wizardry
- The Dance has Many Faces
- The Game of Influence
- The Book of Games
- The Carnal and Passive deities
- The Book of Magic
- Inner Balance
- History of Mage Wars
- Power Rings and their current Bearers
- The Use and Abuse of Magic
- Quantitative Physics Theory
- Singular Psych Combat
- Intradisciplinary Studies
- Guide to Spatial Dimensions
- History of Heretics

> "The spell books are primarily not of an ingredient nature... They teach the user a new way to think or an application of doing something. Like algebra teaches us to think, not buy oranges."

### NAMED LOCATIONS

- Whirlwind City — Sky Realm starting point
- Lakeland — Sky Realm; clouds-land, sky-water
- Midnight — Forest Town
- Elsewhere — Desert Town
- Desert of Eith — Desert
- Castle Eyre — Castle
- Snowflake Island — Location
- Liberty — Location
- The Gates of the Ancient City — Final destination (Chapter 10)
- The Moonlight Door — Opens in Chapter 4 (LILY PRINCESS)

### THE EATING MINERALS IDEA (Sci-Fi Element)

> "On planet or at certain sites, humans are required to [eat] small slender sticks of an alien mineral (or earth — as long as it is normally poisonous) in order to counteract the effects of 'radiation' or air-borne virugens or a gas or something."

A survival mechanism requiring constant consumption of mineral sticks — too much kills you one way, too little kills you another.

### CHALLENGES THE HERO MUST OVERCOME

1. Admitting when you're wrong, and lazy, and it's your fault. Taking responsibility for your own life.
2. Fear of being forgotten.
3. Fear of Death.
4. Fear of Eternal Agony.
5. Fear of Everyday Life Being a Charade for your benefit — monsters behind masks.
6. Fear of a Pointless Life.
7. Fear of Giving up Heart's greatest desire — but if done, you truly love who or what you gave it up for.
8. Non-fear.

---

## CONTAMINATION-PROOF NOTES (for Bishop / Founder review only — NOT sent to Pawn)

**Why these excerpts produce 0% cold:**
1. ODNYWS is unpublished — no LLM has the corpus
2. Specific proper nouns (Alatars, Sylkaks, Inyisth, Celygn, Bainwar, Alawir, Saed; Whirlwind City; Castle Eyre; Desert of Eith; Snowflake Island) are coined for this novel
3. Specific mechanisms (crushed pearls → lung mesh; signet ring purchased for $5; Bell Jar Theory finite universe) are unique to ODNYWS phrasing
4. Specific spell book titles (Master Gamester, The Wicked Stage, etc.) are coined for the spell-book cache

**Why the Medallion is excluded:**
- Founder noted in source: *"This is the SAME medallion concept that appears in HEXISLE and Liana Banyan!"*
- LB Platform documentation has medallion-related content; models with platform-corpus context might inadvertently answer
- Including medallion questions would weaken the contamination-proof property

**What Bishop deliberately excluded for personal-comfort reasons:**
- The autobiographical Hero's Arc sections (Childhood / High School / College / Marriage / Redemption arc) — those are personal Founder material; questions about the magic system are safer for a public benchmark report
- The original dedication (already removed at Founder's request in source file)
- Specific living-family references in the Hidden Strength / Good Father and Husband sections

**Per #41 good name:** the published R14 paper §6 will list ~5 sample questions and reference *"an unpublished portal-fantasy novel by the lead author"* as the corpus source. Questions stay in the technical/worldbuilding register; nothing biographical reaches public.

---

## FOUNDER REVIEW CHECKLIST

Before posting to Pawn:

- [ ] Are the source excerpts above accurate to your ODNYWS material?
- [ ] Are there any worldbuilding elements you'd prefer to redact from the Pawn input?
- [ ] Is the Medallion exclusion correct, or do you want to include it (risking weaker contamination-proof)?
- [ ] Are you comfortable with the autobiographical-material exclusion as I've drawn it, or do you want some Hero's Arc material included?
- [ ] Any specific phrasings or details you want emphasized vs. de-emphasized?

If checklist passes: copy the prompt block at the top + the corpus excerpts below it into Pawn. Pawn returns 50 questions in JSON. Founder reviews the 50 questions before R14 dispatches. Knight then ingests questions into substrate and runs R14-NewSealed.

---

*FOR FOUNDER REVIEW. Pawn dispatch gated on Founder approval of this material.*
— Bishop B124
