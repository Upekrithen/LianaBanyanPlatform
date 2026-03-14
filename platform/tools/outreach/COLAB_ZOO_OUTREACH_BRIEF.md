# AI-CAD Partnership Outreach Brief
## Innovation #1540: CoLab / Zoo.dev / AI-CAD Integration Strategy

**Prepared by:** Bishop (Claude Desktop) + Pawn (Perplexity) — Liana Banyan Platform
**Date:** March 8, 2026
**Updated:** March 8, 2026 (with Pawn product intel)
**Purpose:** Outreach brief for AI-CAD partnership conversations with CoLab, Zoo.dev, and similar platforms
**Classification:** External-facing draft (requires Founder review before sending)

---

## 1. WHAT WE HAVE

### The Hexel System
A **12-piece modular mechanical assembly** (60mm hexagonal, 45-55mm height) that forms a distributed hydraulic/pneumatic power grid when connected. 420+ Hexels create the Tereno Water Table — a physical gaming surface where "when you stop the clock, you literally stop the ocean."

### CAD Portfolio
- **2,270+ Fusion 360 files** spanning 9 years of iterative development (27.55 GB)
- **27 canonical mechanical components** across 16 stack layers
- **6 assembly families:** threeSisters05 (v82, power train master), checkIt05 (v21, complete Hexel), lockedDown (v1, lock verification), D09DEV (v1, full engineering), WORKINGairPump (v19, pneumatic), FlyingButtress (v40, Slotted Top)
- **3 power chains:** hydraulic (wave generation), pneumatic (plant growth/bloom), trap (timing belt countdown)
- **1,336 patent claims** filed across multiple provisional applications
- **8 section analysis views** in threeSisters05 alone (Section2, 3, 4, 9, 10, 12, 14, 17) revealing internal geometry
- Full mechanical specification: gear ratios (20:3 = 6.67:1 amplification, 12x final output), operating pressure (2.17 psi), Tesla valve flow rectification, compliant mechanism grippers, variable-amplitude cam followers

### Digital Infrastructure (Already Built)
- **Hexel Piece Grammar** (Innovation #1537): Machine-readable TypeScript schema of ALL 27 canonical pieces with layer assignments, dimensional specs, power chain connections, manufacturing methods, and CAD cross-references
- **Hexel Component Map** (Innovation #1536): CAD-to-code registry mapping 47+ Fusion 360 component names to system roles across 6 assembly families
- **Fusion 360 Geometry Extractor** (Innovation #1538): Python script that walks the F360 component tree, extracts interface geometry (bounding boxes, cylindrical faces, planar interfaces, joints), and outputs validation-ready JSON
- **Grammar Validator** (Innovation #1539): TypeScript validation engine comparing extracted CAD geometry against the Piece Grammar — coverage, dimensions, connections, layer order, power chain integrity

### What We Need Help With
1. **AI-assisted geometry-to-grammar matching** — Given 2,270 Fusion 360 files, automatically identify which files contain which canonical pieces, extract their latest versions, and flag dimensional drift across versions
2. **Topology validation** — Verify that connection interfaces between adjacent pieces (e.g., Golden Lotus mounts INTO Clamshell, Rotor press-fits ONTO Ouralis) are geometrically compatible
3. **Manufacturing readiness analysis** — For each piece, assess printability (SLA/FDM), identify overhangs, recommend support placement, estimate print time and material cost
4. **Assembly sequence optimization** — Given the stack order (ChannelLock through Slotted Top), validate that each step is physically possible without collision

---

## 2. TARGET PARTNERS

### A. CoLab Software — AutoReview
**What they are:** CoLab is an **independent company** (NOT Autodesk) that builds AI-powered design review tools for engineering teams. Their flagship product **AutoReview** is an AI peer-checker that reviews 2D drawings and 3D CAD models against design standards, DFM rules, and company-specific historical feedback.

**How AutoReview works:**
- Converts native CAD files into a structured representation (geometry + metadata + relationships)
- AI evaluates every feature and fit against trained rules
- Generates markups and comments directly on the model/drawing
- Can be trained on YOUR internal standards (PDFs, checklists, tribal knowledge)
- Integrated into their PLM-connected review environment

**Why they fit us:**
- AutoReview already converts 3D CAD into AI-parseable structure
- Our Piece Grammar IS the "company standard" they'd train against
- Their model: "AI catches design issues before they slip through" = exactly what we need for canonical piece conformance
- Can flag non-canonical deviations, redundant parts, and interface violations

**What we'd ask:**
- Pilot AutoReview as a **modular-system checker** where rules are not just DFM but also "is this part compatible with the Hexel ecosystem?"
- Train on our 27-piece grammar + dimensional specs as the design standard
- Batch review historical parts to flag non-canonical variants
- Integrate their markup output with our Grammar Validator

**Value we offer:**
- Dense, labeled dataset: "this is what a correct modular interface looks like" vs. "this is an error or non-canonical deviation"
- 9 years of historical "mistakes" and non-canonical variants that we'd like the AI to detect
- Real-world benchmark for their AI reviewer beyond standard DFM checks
- Public case study: mechanical gaming system with hydraulic power chains

### B. Zoo (formerly KittyCAD) — Design Studio + KittyCAD API
**What they are:** Zoo builds a **programmable, GPU-accelerated CAD platform** backed by their own geometry kernel (not Parasolid/ACIS). Their KittyCAD Design API and ML-ephant ML API allow driving CAD geometry through code (REST/JSON). They also offer **Text-to-CAD** ML-powered features.

**Key capabilities:**
- **Own geometry kernel** — can parse STEP/STL/OBJ files programmatically without licensing legacy kernels
- **REST/JSON API** — every geometry operation is an API call
- **ML-ephant** — ML models for geometry understanding and generation
- **Text-to-CAD** — describe a part in words, get B-rep geometry
- GPU-native = fast batch processing

**Why they fit us:**
- Their API-first approach maps perfectly to our Grammar Validator pipeline
- ML-ephant could learn interface types and roles directly from geometry
- Text-to-CAD could generate compatible variants from grammar descriptions
- Programmable CAD = grammar-aware CAD (exactly our thesis)

**What we'd ask:**
- Batch process our 2,270 Fusion 360 exports (STEP format) through their geometry engine
- Use ML-ephant to **infer interface types and roles from geometry** (classify parts by which canonical piece they represent)
- Propose canonical parts and generate compatible variants via Text-to-CAD
- Extract interface surfaces, fit tolerances, and assembly compatibility
- Joint exploration of "grammar-aware CAD": a small, composable part set governed by explicit mechanical rules

**Value we offer:**
- Richest possible real-world test: 27 interconnected mechanical components with 3 power chains
- 9 years of version evolution (perfect for drift detection and canonicalization)
- Existing validation infrastructure (JSON schema + TypeScript validator) they can plug into
- Excellent benchmark/training ground for AI that understands modular, rule-driven mechanical ecosystems — not just one-off parts

### C. Onshape (PTC)
**Why they fit:**
- Cloud-native CAD with REST API
- Version control built into the platform (Git-like branching)
- FeatureScript for custom feature automation

**What we'd ask:**
- Migration pathway from Fusion 360 to Onshape for version-controlled design
- API access for automated geometry extraction
- FeatureScript templates for Hexel-specific design rules

### D. Anthropic (Already in use)
**Status:** Active — Claude (Bishop) is our architecture agent
- Computer vision analysis of Fusion 360 screenshots proven effective (Session 7E)
- MCP (Model Context Protocol) for tool integration
- Natural language reasoning about mechanical systems from patent text

---

## 3. OUTREACH TEMPLATES

### Template A: For CoLab (AutoReview focus)

**Subject:** Using a 27-piece modular CAD ecosystem as a benchmark for AutoReview

> I'm the founder of a cooperative marketplace platform called Liana Banyan. Over the last nine years I've built a tightly-related CAD ecosystem in Autodesk Fusion 360: more than 2,270 files that reduce to 27 canonical mechanical building blocks.
>
> Each canonical piece has well-defined interfaces (holes, bosses, sockets, keys) with strict compatibility rules, participates in stackable assemblies with a formal grammar of interfaces and roles, and is documented in detail: what it does, how it mates, which configurations are valid.
>
> I've built a machine-readable Piece Grammar, a geometry extraction script, and a validation engine — but I need an AI design reviewer that can be trained on my 27-piece standard and automatically flag non-conforming or redundant parts across 2,270 historical files.
>
> AutoReview's ability to train on company-specific standards is exactly what I need. My grammar and historical parts provide a dense, labeled dataset of "correct modular interface" vs. "non-canonical deviation."
>
> Would love to discuss a pilot where we use AutoReview as a modular-system checker. I can share a technical brief and representative models as a starting point.
>
> Portfolio: lianabanyan.com | hexisle.com

### Template B: For Zoo (KittyCAD API focus)

**Subject:** Grammar-aware CAD: 2,270 Fusion files + a formal piece grammar for your ML pipeline

> I'm the founder of Liana Banyan. Over nine years I've built a modular mechanical ecosystem in Fusion 360: 2,270+ files, 27 canonical pieces, three power chains (hydraulic, pneumatic, trap), all governed by a formal grammar of interfaces and stack rules.
>
> I've already built the software side: a TypeScript Piece Grammar, a Fusion 360 geometry extraction script (outputs JSON), and a validation engine that checks coverage, dimensions, connections, and power chain integrity. What I need is an AI-native geometry engine to batch-process the STEP exports and classify every part against the grammar.
>
> Zoo's API-first approach and ML-ephant are exactly what this system needs. My 27-piece grammar is an ideal training target for ML models that understand modular, rule-driven mechanical ecosystems — not just one-off parts. Text-to-CAD could even generate compatible variants from grammar descriptions.
>
> Interested in a joint exploration? I can provide a curated subset of models, the full grammar specification, and historical "mistakes" for AI training.
>
> Portfolio: lianabanyan.com | hexisle.com

---

## 4. TECHNICAL ARTIFACTS TO SHARE

When engaging with any partner, we can provide:

| Artifact | Format | Size | Description |
|----------|--------|------|-------------|
| Piece Grammar | TypeScript/JSON | ~750 lines | All 27 pieces with full specs |
| Component Map | TypeScript/JSON | ~800 lines | 47+ CAD names mapped to grammar IDs |
| Extraction Script | Python | ~400 lines | Fusion 360 API geometry extractor |
| Validation Engine | TypeScript | ~600 lines | 6-check comparison system |
| Section Analysis Views | PNG screenshots | 10+ images | threeSisters05 v82 internal geometry |
| Sample Exports | STEP/STL | varies | Key assemblies (threeSisters05, checkIt05, lockedDown) |
| Patent Bag 5 | PDF/MD | 57.3 KB | 24 innovations, 70 claims, full dimensional specs |
| Technical Handover | MD | ~30 KB | Complete architecture document |

---

## 5. DEAL STRUCTURE GUIDELINES

Per SEC-safe language requirements:
- We **sponsor** partnerships, not "invest" in them
- Partners receive **service allocations**, not "equity"
- We discuss **platform benefits**, not "returns" or "ROI"
- Agreements are for **membership participation**, not "ownership"

Preferred structure:
- **API access** in exchange for case study rights
- **Technical collaboration** with mutual NDA
- **Pilot program** using a subset of our CAD files (e.g., threeSisters05 assembly only)
- **Open-source contribution** if the partner's tools are open-source (our extraction script could become a community template)

---

## 6. PITCH FRAMING

**The core pitch (same for both):**

"Use my system as a benchmark/training ground for AI that understands modular, rule-driven mechanical ecosystems — not just one-off parts."

**Why this is compelling to them:**
- Most AI-CAD demos use simple one-off parts. We have a 27-piece **interconnected system** with power chains.
- We provide both the CAD files AND the formal grammar — labeled training data.
- 9 years of version history = drift detection, canonicalization, and regression testing.
- Real product with real patents = not a toy benchmark.

---

## 7. FOUNDER APPROVAL REQUIRED

This brief is a DRAFT. Before any outreach:

- [ ] Founder reviews and approves the outreach templates
- [ ] Founder confirms priority: CoLab first? Zoo first? Both simultaneously?
- [ ] Founder decides what CAD files to share (and which remain confidential under NDA)
- [ ] Founder reviews deal structure preferences
- [ ] Legal review of NDA requirements (patent protection for 928+ claims)
- [ ] Creative Director (James Ausbin) reviews any public-facing materials

---

*"The digital world IS the real world. We just haven't connected them yet."*
