# A&A Formal #2275 — Vendor-Neutral AI Companion as Cooperative-Member-Product Bridge

**Innovation #:** 2275
**Category:** AI Infrastructure / Distribution / Anti-Lock-In Architecture
**Crown Jewel:** **YES — FOUNDER-RATIFIED B117**
**Bishop Session:** B117 (Formal draft). Originated: Founder strategic question during B117, direct: *"what if one of the AI companies makes creating ROM artifacts, like my Cathedral of Scribes, or R9, as part of their AI? And should we go for making a version that self-installs, like an AI Companion?"*
**Date:** April 23, 2026
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Patent Relevance:** **PRIMARY** — fresh inclusion in Prov 14 thresh. Strategic defense against AI-vendor native-feature co-option.
**Related:** #2268 (Member-Owned Cathedral, hosted variant), #2270 (Cathedral architecture, substrate), #2269 (Fates routing), #2260 (Cooperative Defensive Patent Pledge, licensing frame), #2272 (Cost-Slasher — the Companion delivers this locally).
**Implementation artifact:** Package manifest TBD. Target distribution: `pip install liana-companion` (Python) + `npm install -g @liana-banyan/companion` (Node/TypeScript) as cross-runtime installers composing the same MCP-server primitives already in `librarian-mcp/src/scribes/`.

---

## TL;DR (2 lines)

A **self-installing personal retrieval substrate** — "AI Companion" — that runs locally on the user's machine, exposes the Scribes Cathedral + Three Fates + R9-style preload via MCP to *any* AI vendor (Claude Desktop, Cursor, VS Code, Zed, future OpenAI-MCP bridge), and persists member memory independently of any vendor's platform. When AI majors ship their own native-memory features, the Companion becomes the **bridge that keeps memory with the user, not with the vendor** — the logical endpoint of the anti-lock-in cooperative principle.

---

## The Problem

AI vendor platforms are racing to ship member-memory features natively: **ChatGPT Memory, Claude Projects, Gemini Gems, Perplexity Spaces.** Each is a partial Cathedral-analogue. Each creates a new lock-in vector: the member's accumulated knowledge becomes captive to whichever vendor they chose.

From the cooperative-platform perspective, this creates three problems:

1. **User harm.** A member who invests in ChatGPT Memory for 2 years then wants to switch to Claude has no export path — their Memory is vendor-proprietary. The cooperative promise of member-owned data fails at the AI layer.

2. **Platform-strategic threat.** If Anthropic / OpenAI / Google ship a Cathedral-shaped feature natively, users who could have been LB members are captured upstream before LB's offering is even visible.

3. **Structural mismatch with cooperative principles.** LB's membership model is built on compounding member-owned value (per #2268). Vendor-captured memory is the exact opposite — it compounds *the vendor's* lock-in, not the member's asset.

Existing solutions fail:

- **Export buttons in vendor products.** Claude allows Project export as JSON, but the format is vendor-specific and the embedding index doesn't travel with it. Export is nominal, not operational.
- **Open-source personal knowledge tools (Obsidian, Logseq).** These are durable and member-owned but have no integration with AI retrieval layers — they don't speak MCP, they don't route themes to specialists, they don't amplify RAG.
- **Self-hosted RAG (LlamaIndex local, ChromaDB).** Technically capable but require the user to be a developer. No distribution mechanism that converts general members into users.

The gap: a vendor-neutral personal retrieval substrate that (a) installs with one command, (b) runs locally without LB backend dependency, (c) composes with any MCP-capable AI client, (d) persists member knowledge independently of any vendor, and (e) membership on LB adds value (sync, Guild Scribes, collective corpus) without the local version losing its standalone utility.

---

## Mechanism

### Install path

```
# Python runtime
pip install liana-companion

# Node/TypeScript runtime  
npm install -g @liana-banyan/companion

# First-run bootstrap
liana-companion init
```

`liana-companion init` creates:

1. **Local Cathedral directory** at `~/.liana/cathedral/` with `registry.yaml` (seeded 5 default Scribes: Work / Learning / Health / Family / Projects — configurable) + empty tablets.
2. **R9 preload snapshot** at `~/.liana/preload/` — the canonical `r9v2_base.md` shipped with the package, updated on `liana-companion update`.
3. **MCP server registration** at `~/.mcp.json` or the user-specified client config file — the Companion announces itself to Claude Desktop / Cursor / VS Code / Zed as an available MCP server.
4. **Tidbit ledger** at `~/.liana/tidbits.jsonl` — the SP-21 verify-action record.
5. **Local membership state** at `~/.liana/membership.json` — starts as `{"tier": "free", "lb_member": false}`, upgrades via `liana-companion login <membership-code>` after membership purchase.

### Free-tier capabilities (no LB membership required)

- Local Cathedral with 5 default Scribes
- Custom Scribe creation (add / remove / edit registry.yaml)
- `consult_scribes` retrieval via MCP to any connected AI client
- `scribe_log` append via MCP (Three Fates routing local-only)
- R9 preload fresh on install + update (public corpus)
- Tidbit logging
- Full export: entire `~/.liana/` is the user's data, already portable

### Paid-tier capabilities (LB $5/yr membership)

- **Cross-machine sync.** Companion installations on laptop + desktop + phone sync Cathedral tablets through LB's member backend.
- **Guild / Tribe Scribes.** Access to consent-gated collective Scribes shared across members of a declared Guild or Tribe (per #2260 + #2267).
- **LB canonical corpus updates.** Member-only preload extensions (e.g., member-generated guide corpus #2267 additions).
- **Cathedral marketplace contribution.** Contribute anonymized Scribe entries to the Member-Generated Guide Corpus (#2267) for participation credit (#2266).
- **Priority support + commercial-license access.** The $5/yr tier includes the Pledged Commons grant that makes embedded commercial use of the Companion frictionless.

### Vendor-neutral composition

Companion speaks MCP. Any MCP-capable client can consume it:

- **Claude Desktop / Cursor / Zed / VS Code (native MCP):** add Companion to `mcp.json`, restart, ready.
- **Claude Projects / ChatGPT Memory (no native MCP today):** Companion ships a bridging proxy (`liana-companion bridge --target chatgpt`) that translates Companion queries into Projects/Memory API calls where APIs exist, or produces prompt-injected retrieval context where APIs don't. The bridge treats each vendor's memory product as one more backend; the user's Cathedral is always the source-of-truth.
- **OpenAI future MCP (when/if):** drop-in — Companion already speaks MCP.
- **Gemini Gems:** bridge via Gemini API + custom-gem injection path.
- **Perplexity Spaces:** bridge via Perplexity's Space attachment API.

**The Companion is the bridge; vendors are backends.** This inverts the conventional pattern where the user picks a vendor and the vendor owns memory. In the Companion pattern, the user picks the Companion and the vendors compete to be its preferred backend for a given task.

### Anti-lock-in architectural commitments

1. **Export on demand, not on close.** `liana-companion export` at any time produces a standalone archive matching the #2268 Claim 1(d) spec — JSONL tablets + registry + standalone reader + schema docs.
2. **No proprietary formats.** Every file under `~/.liana/` is plain text (YAML or JSONL) openable by any text editor.
3. **No telemetry by default.** Free-tier Companion phones home ONLY for version-update checks and ONLY with opted-in diagnostics. Paid-tier adds sync traffic, declared in the membership ToS.
4. **AGPL-3.0 + Pledged Commons grant** (per #2260) — the Companion's source code is open; any vendor who wants to embed it commercially must either open-source their product OR purchase a Pledged Commons commercial license from LB Corporation.
5. **Guarantee of standalone operation.** If LB Corporation ceases operations tomorrow, every free-tier Companion continues working. Paid-tier sync degrades to local-only; no Cathedral is lost.

### Distribution-strategic posture

The Companion is **not a consumer product.** It is **infrastructure** — the pipe by which members stay vendor-neutral. Marketing framing:

- **Not:** *"A better ChatGPT Memory."*
- **Actually:** *"Keep your AI memory with you, not with whichever AI company you use today."*

The claim ladder (per #2272) extends:

- **Conservative:** *"Your Cathedral works with any AI. No lock-in."*
- **Middle:** *"Switch from Claude to GPT to Gemini without losing your accumulated knowledge."*
- **Aggressive:** *"The AI market will consolidate around memory. LB makes memory yours, not theirs."*

---

## Novelty Analysis

### Prior art and gaps

| Prior art | What it does | What it misses |
|---|---|---|
| ChatGPT Memory / Claude Projects / Gemini Gems / Perplexity Spaces | Vendor-native memory features | Each is vendor-locked; no cross-vendor bridge; no cooperative-economic framing |
| LlamaIndex / LangChain local RAG | Self-hosted retrieval | No MCP-first design; no distribution mechanism for non-developers; no cooperative membership overlay |
| Obsidian / Logseq / Notion offline | Local personal knowledge management | No AI retrieval integration; no MCP; no cooperative platform |
| Pinecone local / ChromaDB | Local vector DBs | Developer-only; no UX for non-developers; no membership bridge |
| `npm install`-style one-command installers | Distribution mechanism | Not applied to cooperative-platform member products with this specific value structure |

### Novel combination

1. **Vendor-neutral MCP-first architecture** — the Companion composes with any MCP-capable AI client and bridges to non-MCP clients via declared adapters. The specific architectural commitment "Companion is the bridge; vendors are backends" is the novel framing.
2. **Free-tier-standalone + paid-tier-sync bifurcation** — local Companion works fully standalone; LB membership adds cross-machine sync + Guild Scribes + corpus updates WITHOUT the local version losing utility.
3. **Anti-lock-in architectural commitments as claimable features** — export-on-demand, no-proprietary-formats, no-telemetry-default, AGPL+Pledged-Commons, standalone-operation-guarantee. These are design commitments that become patent claims.
4. **Cooperative-platform membership as a pure upgrade path** — membership is not a gate on basic function; it's a network-scaling feature. The free Companion doesn't feel crippled; paid feels valuable.
5. **One-command install across two runtimes** (pip + npm) composing the same primitives — cross-runtime distribution is the path to mass adoption outside developer-only audiences.

### What we are NOT claiming

- MCP servers are not novel.
- Package managers are not novel.
- Local RAG is not novel.
- Subscription freemium is not novel.
- **What is novel is the specific combination: (vendor-neutral MCP-first architecture composing with any AI client) + (free-tier-standalone + paid-tier-sync bifurcation where neither tier degrades the other) + (anti-lock-in architectural commitments as declared design features) + (cross-runtime one-command install) + (cooperative-platform membership as network-scaling upgrade path) — applied to AI-retrieval member memory as a counter-pattern to vendor-native memory features.**

---

## Claims (proposed for Prov 14)

### Independent claims

**Claim 1 (Method).** A computer-implemented method for providing vendor-neutral personal AI memory, comprising:

(a) distributing a self-contained retrieval server package via one or more package-manager distribution systems (including at least `pip` for Python and `npm` for Node.js), the package comprising: a Model Context Protocol server implementation, a local storage module for append-only knowledge artifacts, a registry module declaring specialist-domain structure, and an installation bootstrap that provisions a default configuration on first run;

(b) on installation, registering the installed server as an available Model Context Protocol server in the user's chosen AI client configuration, such that an AI client consumable by any vendor-provided MCP-capable AI product may consume the installed server;

(c) serving retrieval queries from the installed server using storage persisted locally on the user's machine under a declared directory structure such that the user retains full filesystem-level access to all stored content at all times;

(d) providing a bifurcated capability set: a first tier operating entirely locally with no network dependency on any cooperative-platform backend, and a second tier providing cross-machine synchronization, access to collective-specialist stores, and cooperative-platform canonical corpus updates, wherein the second tier is gated on membership in a declared cooperative platform and wherein the first tier's utility is preserved unmodified whether the user enrolls in the second tier or not.

**Claim 2 (Apparatus).** A system comprising: a package distributed per Claim 1(a); an MCP server module implementing Claim 1(b); a local storage module implementing Claim 1(c); a membership-tier module gating the second-tier features of Claim 1(d); and a bridging adapter module configured to translate MCP queries into vendor-specific memory-product API calls or prompt-injection formats for AI clients that do not natively support MCP.

### Dependent claims

- **Claim 3.** The method of Claim 1 wherein the declared directory structure of Claim 1(c) uses plain-text formats including YAML for configuration files and JSONL for append-only knowledge artifacts, such that filesystem-level inspection by any text editor yields full user-understandable content.
- **Claim 4.** The method of Claim 1 further comprising an `export` command that packages the user's entire local storage into a standalone archive including a reader program sufficient for the user to operate retrieval on the exported data without the original Companion installation.
- **Claim 5.** The method of Claim 2 wherein the bridging adapter module includes at least: an adapter for AI products whose memory feature accepts API-level content uploads, and an adapter for AI products whose memory feature accepts only prompt-injection.
- **Claim 6.** The method of Claim 1 wherein the first-tier capability set includes: local Cathedral with declared default specialists, custom specialist configuration, retrieval via MCP, append via MCP, canonical corpus preload, and verify-action logging — with no network calls required for any of these capabilities.
- **Claim 7.** The method of Claim 1 wherein the second-tier capability set includes at least: cross-machine synchronization of local knowledge artifacts, access to consent-gated collective-specialist stores shared across declared member groups, and cooperative-platform canonical corpus extension updates.
- **Claim 8.** The method of Claim 1 wherein the installation bootstrap seeds a declared set of default specialists configured to cover common domains (work, learning, health, family, projects), enabling immediate user utility without per-user specialist configuration.
- **Claim 9.** The method of Claim 2 wherein the package source code is distributed under an open-source license comprising copyleft provisions, and wherein a commercial license is available through the cooperative platform enabling embedded commercial use subject to declared cooperative defensive patent pledge terms.

---

## Strategic context — Why file now

Per B117 Founder strategic concern: AI majors (Anthropic, OpenAI, Google) are trending toward native memory features (ChatGPT Memory, Claude Projects, Gemini Gems, Perplexity Spaces). Each iteration narrows the window in which LB can file priority on the vendor-neutral bridge architecture.

**Filing priority timing:** Before Prov 14 filing (**target date: within 7 days of this A&A**). Every week of delay increases the chance a major ships a vendor-neutral-bridge-shaped feature and files their own priority first.

**Defensive posture post-filing:** Pledged Commons grant (#2260) means any AI major who wants to embed Companion-like features into their product either (a) open-sources their product (the AGPL trigger), (b) purchases a Pledged Commons commercial license, or (c) designs around the specific claims. All three outcomes favor LB.

---

## Cross-References

1. **#2268 Member-Owned Scribes Cathedral** — hosted variant; Companion is the self-installed variant
2. **#2270 Scribes Cathedral architecture** — the storage substrate both variants share
3. **#2269 Three Fates Routing Pipeline** — runs inside the Companion the same as it runs in the hosted Cathedral
4. **#2260 Cooperative Defensive Patent Pledge** — the licensing frame Claim 9 invokes
5. **#2272 Cost-Slasher Claim Ladder** — the Companion delivers cost savings locally without LB backend
6. **#2264 Commons Licensing Dividend** — commercial-license revenue from Companion embeddings feeds the Dividend pool
7. **#2267 Member-Generated Guide Corpus** — consent-gated Scribe contributions from Companion users populate the collective corpus

---

## Pollination Checklist

- [x] Save as A&A formal in `12_Innovations_AA/` (this file)
- [ ] Add new entry to `PROV_14_DRAFT.md` Section 2 for #2275 (B117 follow-on — currently draft stops at #2274)
- [ ] Counsel review before Prov 14 filing — specifically ask whether Claim 1(d)'s "bifurcated capability set" language is patent-claimable as a method step or whether it needs recharacterization as an apparatus configuration
- [ ] Package scaffolding as a K-session candidate (estimate: K445+ post-Prov-14-filing). Key engineering decisions: Python vs Node as primary runtime; MCP server composition between the two; bridging adapter architecture per vendor
- [ ] Landing-page section for Companion: not until Prov 14 files
- [ ] Optional: R11 Cross-Vendor Memory Product Benchmark — see separate B117 spec — becomes the empirical marketing evidence for Companion positioning

---

**Innovation count:** +1 (new canonical innovation ratified B117). **Total: 2,268 innovations.**
**Crown Jewels:** +1 (**#2275 RATIFIED B117 BY FOUNDER**). **Total: 226 Crown Jewels.**
**Claims:** +9 claims (2 independent, 7 dependent) proposed for Prov 14.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Eighth and final A&A Formal of the Prov 14 thresh. The strategic defense against AI-major native-memory-feature co-option — and the logical endpoint of the anti-lock-in cooperative principle applied to AI retrieval.*

**FOR THE KEEP.**
