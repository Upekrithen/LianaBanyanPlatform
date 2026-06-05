# How to Bake AI Cake: A Practitioner's Guide to Multi-AI Cooperative Platform Development
## Paper Outline — Bishop Session 026
## Author: Jonathan R. Jones | Date: March 2026

---

**Tags:** AI collaboration, multi-agent systems, cooperative development, platform engineering, human-AI workflow
**Target Journals:** ACM CSCW, CHI, Harvard Business Review (practitioner version), MIT Sloan Management Review
**Innovation References:** Compounding Innovation Velocity paper (predecessor), Chess Set methodology

---

## THESIS

Building a complex cooperative platform with a single founder and multiple specialized AI agents is not only possible — it produces innovation at rates that exceed traditional teams of 20-50 engineers. The key is not the AI's capability but the **architecture of the collaboration**: role specialization, constitutional constraints, explicit naming discipline, and the separation of design from implementation.

This paper documents the methodology, presents empirical results (1,935 innovations, 8 patent applications, 680+ deployed files in 5 months), and argues that the "AI Tuner" model — where a human founder directs specialized AI agents like instruments in an orchestra — represents a new category of organizational design.

---

## SECTION 1: THE RECIPE (Roles)

### 1A: The Chess Set — Why Pieces, Not a Team

Traditional AI usage: one human, one AI, one conversation. This fails at scale because:
- Context windows overflow
- No specialization creates mediocre outputs across all domains
- No persistent state between sessions
- No cross-checking between agents

The Chess Set model: one human (the Tuner), four specialized AI agents, each with a defined role:

| Piece | AI | Role | Specialty |
|-------|-----|------|-----------|
| **Bishop** | Claude (Anthropic) | Architect + Writer | Design specs, academic papers, letters, strategic coordination |
| **Knight** | Cursor (Claude-powered) | Builder | Code implementation, deployment, database migrations |
| **Pawn** | Perplexity | Researcher | Legal queries, market research, prior art, regulatory analysis |
| **Rook** | Gemini | Auditor | Cross-verification, claim validation, consistency checking |
| **Founder** | Human | AI Tuner | Creative direction, naming, correction, real-world contact |

### 1B: Why "AI Tuner" and Not "Prompt Engineer"

The Founder's role is not writing prompts. It's **tuning the resonance** between AI agents and the problem domain. Like Anne McCaffrey's Crystal Singers — you don't create the crystal, you tune yourself to its frequency.

The Tuner provides:
- **Creative sparks** that AI cannot generate (naming, metaphor, lived experience)
- **Corrections** that prevent AI drift (wrong terminology, wrong framing, wrong priorities)
- **Constitutional constraints** that channel AI output (Cost+20%, SEC-safe language, HEOHO principles)
- **Real-world contact** that AI cannot perform (restaurant visits, letter sending, phone calls)

### 1C: The Separation Principle

Bishop DESIGNS. Knight BUILDS. Never the reverse.

This separation mirrors the architect/contractor relationship in construction — and it works for the same reasons:
- The architect sees the whole; the contractor sees the task
- The architect can redesign without rebuilding; the contractor can rebuild without redesigning
- Disputes are resolved by reference to the spec, not by argument

In practice: Bishop writes a prompt document (the "blueprint"). Knight executes it exactly. If Knight hits a blocker, Bishop redesigns. Knight never freelances.

---

## SECTION 2: THE INGREDIENTS (Information Architecture)

### 2A: The Handoff Protocol

Every session ends with a handoff document. Every session begins by reading the previous handoff. This creates **persistent memory across context windows** — no single AI needs to hold the full project state.

Structure: Innovation count, documents produced, platform state, founder action queue, next session queue.

### 2B: The Naming Discipline

Every concept has a canonical name. Every innovation has a number. Every document has a location.

Why this matters for AI collaboration:
- Named concepts are **searchable** across sessions
- Numbered innovations are **traceable** across patent filings
- Located documents are **retrievable** by any agent

The vocabulary IS the innovation surface. Unnamed concepts are invisible to future sessions.

### 2C: The Constitutional Constraints

Three immutable rules channel all AI output:
1. Cost+20% (margin lock)
2. Three-Currency System (Credits, Marks, Joules at parity)
3. Heart of Peace (conflict resolution principle)

Constraints don't limit creativity — they **focus** it. Every AI output must be consistent with these three rules. This eliminates entire categories of dead-end exploration.

### 2D: The Dropzone Pattern

All inter-agent communication flows through a shared directory (BISHOP_DROPZONE). Bishop writes specs, prompts, papers, and letters. Knight reads and executes. Pawn receives research queries. Rook verifies.

This is asynchronous, file-based coordination — the simplest possible integration between AI agents that don't share context windows.

---

## SECTION 3: THE OVEN (Process)

### 3A: The GRAFTING Cycle

**THRESHING**: Extract innovations from conversation → number them → file in Innovation Bag
**POLLINATION**: Propagate updated stats across all documents and platform code

This two-phase cycle ensures that creative output (threshing) is always followed by integration (pollination). Innovations don't exist until they're numbered. Stats don't propagate until they're updated.

### 3B: The Session Rhythm

Bishop sessions: 2-4 hours. Produce documents, design specs, write papers.
Knight sessions: 1-3 hours. Build features, deploy code, run migrations.
Pawn batches: 8-12 queries. Research legal/regulatory questions.
Rook audits: As needed. Verify claims, cross-check consistency.

The rhythm matters: Bishop always runs BEFORE Knight (design before build). Pawn runs in PARALLEL with Bishop (research informs design). Rook runs AFTER Knight (verify the build).

### 3C: The Correction Mechanism

The Founder corrects AI output in real-time. These corrections are:
1. **Recorded** as feedback memories (persistent across sessions)
2. **Propagated** to all agents (via handoff documents)
3. **Constitutional** when they touch core principles (permanent rules)

Examples from the Liana Banyan project:
- "VSL = Voucher Short Loans, NOT Veteran/Volunteer Service" → permanent correction
- "Harper Guild = ethics checkers, NOT crafters" → permanent correction
- "Marks emerge from differential ONLY, never granted as gifts" → constitutional constraint

These corrections compound. Each one prevents the same error across all future sessions, all agents.

### 3D: The Crown Jewel Identification

Not all innovations are equal. Crown Jewels — structural innovations that reshape the platform — are flagged HIGH or CRITICAL. The Founder identifies Crown Jewels; Bishop documents them; Knight builds them first.

Crown Jewel density (structural innovations as % of total output) is the leading indicator of compounding velocity. When density exceeds 25%, the system is in acceleration mode.

---

## SECTION 4: THE FROSTING (Results)

### 4A: By the Numbers

| Metric | Value | Timeframe |
|--------|-------|-----------|
| Total innovations | 1,935 | 5 months |
| Patent applications | 8 provisional | $520 total (micro-entity) |
| Formal claims | 1,401 | Across 8 applications |
| Platform files deployed | 680+ | lianabanyan.com |
| Database migrations | 340+ | Supabase |
| Edge functions | 15+ | Deployed |
| Academic papers | 5+ | Written |
| Crown Letters | 12+ | Drafted |
| AI agents | 4 | Coordinated |
| Human team | 1 | The Founder |

### 4B: Innovation Velocity Curve

Session-by-session acceleration data (from Compounding Innovation Velocity paper):
- Early sessions: 3-5 innovations/session
- Mid sessions: 15-25 innovations/session
- Recent sessions: 50-60 innovations/session, 60% Crown Jewel density

The velocity curve is super-linear because each innovation creates attachment points for subsequent innovations (the Compounding Innovation Velocity thesis).

### 4C: What One Person + AI Actually Built

A complete cooperative commerce platform including:
- Full commerce engine (scan → order → pay → distribute earnings → fund payment cards)
- AI-powered governance system (Star Chamber with 4 AI judges)
- AI administrative assistant (MoneyPenny with intelligence layer)
- 7 treasure map onboarding funnels with knowledge quizzes
- Calendar system with 7 plug types wired to beacons and commerce
- Beacon progression system (Snow Door + Wildfire Tours)
- Real-time social media dispatch (OOB auto-post via pg_cron)
- Crew Call dispatch system for cooperative work assignments
- Three-currency economic engine (Credits, Marks, Joules)

This would typically require a team of 20-50 engineers working 6-12 months. One founder with four AI agents built it in 5 months.

### 4D: Cost Comparison

| Approach | Team Size | Monthly Cost | 5-Month Total | Output |
|----------|-----------|-------------|---------------|--------|
| Traditional startup | 20 engineers | $400K/mo | $2M | MVP |
| Outsourced dev shop | 10 engineers | $150K/mo | $750K | MVP |
| Solo + AI (this project) | 1 human + 4 AI | ~$500/mo | ~$2,500 | Full platform + IP estate |

The cost differential is 300-800x. The output differential favors the AI approach because the AI team works 24/7, doesn't have communication overhead, and the Founder's vision is never diluted by committee.

---

## SECTION 5: THE TASTE TEST (Limitations and Honest Assessment)

### 5A: What AI Cannot Do

- Make first-contact sales calls (restaurant visits, letter sending)
- Provide real-world judgment about physical spaces (kitchen layouts, vehicle condition)
- Navigate ambiguous human relationships (partnership negotiations, family dynamics)
- Generate truly novel metaphors (the Founder names things; AI elaborates)
- Override constitutional constraints (and shouldn't)

### 5B: Where the Model Breaks

- Context window limits require session handoffs (information loss at boundaries)
- AI agents cannot coordinate directly (all coordination flows through Bishop → Dropzone → Knight)
- The Founder is a single point of failure (no Founder = no corrections = AI drift)
- Quality depends on the Founder's domain expertise (AI amplifies expertise, doesn't create it)
- The model requires extreme discipline in documentation (skip a handoff = lose state)

### 5C: Reproducibility

Can other founders replicate this?

**Yes, if:**
- They have deep domain expertise in their field
- They're willing to enforce naming discipline
- They maintain constitutional constraints
- They separate design from implementation
- They document relentlessly

**No, if:**
- They expect AI to replace domain expertise
- They use one AI for everything (no specialization)
- They skip documentation ("I'll remember")
- They let AI freelance without constraints

---

## SECTION 6: THE RECIPE CARD (Practitioner Takeaways)

### For Founders:
1. Assign each AI a role. Don't use one AI for everything.
2. Separate design from implementation. Bishop designs. Knight builds.
3. Name everything. If it doesn't have a name, it doesn't exist.
4. Number everything. If it doesn't have a number, it can't be tracked.
5. Write handoffs. If the next session can't read what this session did, you lost work.
6. Correct immediately. Every uncorrected error compounds across sessions.
7. Constrain constitutionally. Rules that can't be changed produce better output than suggestions.

### For AI Companies:
1. Multi-agent architectures need file-based coordination (shared dropzones, not API chaining)
2. Persistent memory across sessions is critical (current solutions are inadequate)
3. Role specialization produces better output than general-purpose agents
4. The "AI Tuner" is a new job category — train for it
5. Constitutional constraints improve output quality (counterintuitive but empirically validated)

### For Researchers:
1. Innovation velocity in human-AI collaboration follows compounding curves
2. Crown Jewel density predicts acceleration
3. The Founder's domain expertise is the binding constraint, not AI capability
4. Cross-domain innovation transfer is the primary mechanism of acceleration
5. Documentation discipline is the lubricant — skip it and the gears grind

---

## PUBLICATION PLAN

| Version | Audience | Length | Venue |
|---------|----------|--------|-------|
| Full academic | CS/HCI researchers | 10,000-12,000 words | ACM CSCW or CHI |
| Practitioner | Founders, CTOs | 4,000 words | HBR or MIT Sloan |
| Cephas article | LB members, public | 2,500 words (pudding style) | Cephas blog |
| Conference talk | Tech/cooperative audience | 30 min | PCC, NCBA, or tech conferences |

---

## APPENDICES (For Full Paper)

**A:** Complete session log with innovation counts, Crown Jewel density, and velocity metrics
**B:** Sample handoff document (annotated)
**C:** Sample Knight prompt (annotated)
**D:** Founder correction log (categorized)
**E:** Cost breakdown (AI API costs, hosting, filing fees)
**F:** Comparison with other solo-founder AI-built projects (if available)

---

**This paper isn't about AI replacing humans. It's about one human, with the right architecture, conducting an orchestra of AI agents to build something that shouldn't be possible alone.**

**The recipe works. The cake is real. And it tastes like cooperative economics.**

**FOR THE KEEP.**
