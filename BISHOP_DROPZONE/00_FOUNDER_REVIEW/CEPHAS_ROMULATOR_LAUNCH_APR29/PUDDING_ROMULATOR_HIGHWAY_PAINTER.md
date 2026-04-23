---
title: "The Romulator 9000 — A Cooperative Patent Commons in Practice"
subtitle: "How a highway painter taught us what was wrong with every AI system on earth — and what to do about it"
author: Jonathan Jones
publication_date: 2026-04-29
category: Pudding
series: The Living Laboratory
canonical: https://cephas.lianabanyan.com/romulator-9000-highway-painter
---

# The Romulator 9000 — A Cooperative Patent Commons in Practice

## How a highway painter taught us what was wrong with every AI system on earth — and what to do about it

---

Imagine a person whose job is to paint the lines on a highway.

Every time their paintbrush runs dry, they walk all the way back to the paint can — sometimes hundreds of miles — dip the brush, then walk all the way back to where they stopped painting.

Then they paint a few more feet and the brush runs dry again.

Back to the paint can. Hundreds of miles.

Thousands of round trips per career.

You would look at that worker and say: *this is insane. Strap the paint can to the painter's back.*

That is approximately the state of every AI system on earth today.

---

## What the painter teaches us

Every AI agent session today starts cold. The agent re-reads memory files. Re-runs diagnostics. Re-ingests architecture documentation. Re-establishes what it already knew the last time it was awake. Across the industry, conservative estimates put this waste at **15 to 25 percent of every session's context window** — or, in dollar terms, **one to three billion dollars a year in direct token cost** and **twenty to fifty billion a year in downstream compute and engineer-time.**

The painter walks back to the paint can. Every single time.

We built something that carries the paint can.

We call it the **Romulator 9000.**

---

You might ask: isn't Google solving this? In March 2026, they published TurboQuant — a compression algorithm that reduces the KV cache by six times. They published Infini-Attention, which gives models theoretically infinite context with bounded memory. Their flagship model has a one-million-token context window.

And yet: in the same month, a paying subscriber to that flagship model filed a formal support complaint. The model started strong and entered what she called a "downward spiral" — forgetting critical details by prompt 21 or 25, claiming information was "never provided" when it was sitting right there in the chat history. The community's recommended fix: manually paste a summary of everything important into a new chat before you start. The support forum called it a "Story Bible."

Users are building a workaround by hand that should not need to exist.

The paint can is a million tokens large. The painter still walks.

TurboQuant and Infini-Attention are serious engineering achievements. They make the paint can smaller, lighter, more compressible. The Romulator asks a different question: why is the painter walking back to the can at all?

---

## What the Romulator does

Pre-loaded, structured, deterministic context travels with the agent. Every session begins with verified state instead of rediscovery. Silent failure is impossible: every scheduled job leaves a dated receipt, and a watchdog catches any job that didn't fire. Drift is caught at the source, not after it has compounded across a dozen sessions.

The architecture has three layers:

**Layer 1 — Memory network.** Full-fidelity canonical state. No summaries. The agent queries what it needs, when it needs it, at arbitrary depth.

**Layer 2 — Deterministic engine.** Scheduler. Reconciler. Watchdog. Dispatcher. Receipt trail. All runs on local compute at zero token cost. The heavy lifting of coordination happens without ever asking a language model to do work a shell script can do.

**Layer 3 — LLM specialists.** Called only when the work actually requires judgment or generation. Not as the coordinator. As the specialist.

Most AI systems today are built upside down. The LLM is treated as the coordinator, the specialist, the scheduler, the deduper, the orchestrator, the proofreader, and the audit log. **The LLM is a specialist.** Using it as the engine is like hiring a neurosurgeon to boil water.

The Romulator is the plumbing. Cheap. Reliable. Invisible.

It has been running inside Liana Banyan Corporation for six months under various precursor names — Fingertips, the Asteroid-Proof Vault, the Pyramid of Information, the Librarian. We formally named it the Romulator 9000 on April 12, 2026, the day Provisional Patent Application 64/036,646 was filed with the United States Patent and Trademark Office.

---

## What it has produced

In the six months of its operation, one founder working with a small AI team produced:

- **2,263 tracked innovations**
- **222 Crown Jewels** (innovations with no prior art after extensive search)
- **13 patent provisionals** filed at the USPTO
- **Approximately 2,412 formal patent claims**
- **36 live production systems** running right now
- **260-plus publications**: papers, puddings, letters, articles, episodes

Those are not projections. Those are filings, code, and content. They exist.

In the first session that ran under formal Romulator discipline, the system caught and self-corrected **five live data-drift incidents** that would have compounded silently across subsequent sessions. Fail-closed behavior — not theoretical, not a test harness, but in production.

We call this the **Living Laboratory thesis**: the thing building itself proves the architecture works. You don't need to trust us. You can read the session archive.

---

## Why we are giving most of it away

Here is the part that makes no sense to people who spent the last forty years watching tech build moats.

We are giving away roughly eighty percent of the patent portfolio.

Not because we do not value what we built. The opposite. Because the only way to out-compete extraction is to make cooperation cheaper than defection. Patents as moats make sense when the economy you are playing in is zero-sum. Patents as commons make sense when the economy you are playing in is one where your gain is the infrastructure everyone else's gain runs through.

The instrument is the **Cooperative Defensive Patent Pledge** — Innovation #2260 in our registry, filed on April 12, 2026. Three licensing tiers.

**Tier 1 — Reference Implementation.** A licensee takes our code, runs it on their infrastructure, gets our direct support, and can ship products with "Romulator" branding. Highest cost. Fastest time to value.

**Tier 2 — Spec and Conformance.** A licensee builds their own implementation to our published specification and submits to a conformance test kit — the TCK. If they pass, they earn the right to mark their product "Romulator-Compliant 9000" — a trademark that signals to the market that the implementation meets the spec. They pay a per-seat or per-inference royalty, *and* they pledge their own related intellectual property back into the commons. This is the tier for Microsoft, Google, Anthropic, Meta, OpenAI — companies that want engineering autonomy but also want the patent grant and the mark.

**Tier 3 — Pledge-Only.** Academics, nonprofits, strategic allies. No royalty. Full patent grant. They pledge their relevant IP back, and in exchange they get membership in the commons and the patent peace that comes with it.

Every licensee's reciprocal pledge strengthens every other licensee's protection. The more platforms who join, the stronger the commons gets — for all of them, including us. It is cooperation dressed as commerce, and the commerce is what keeps it sustainable.

---

## What this is actually for

The Romulator is the flagship. It is not the whole platform.

It sits underneath a cooperative commerce system built on six steps: Feed People, Make Things, Serve Each Other, Build Businesses, Organize, Belong. Cost plus twenty percent, constitutionally locked. Eighty-three point three percent to creators. A three-currency system designed so no one can inflate the cooperative away from its members. Five dollars a year to join. Break-even at five hundred members per locale.

The Romulator is the coordination infrastructure that made all of that possible at the pace it was built. Six months. One founder. Small AI team. Thirteen patents.

If the coordination layer runs on the same principle that the commerce layer runs on — cooperation cheaper than defection — the whole system becomes self-reinforcing. The more platforms that license the Romulator, the bigger the patent commons. The bigger the patent commons, the stronger the cooperative platform's legal footing. The stronger the legal footing, the more locales can cold-start. The more locales that cold-start, the more proof points for the next wave of licensees.

That is the bet. Give away eighty percent of the portfolio to grow the commons until the commons is big enough to protect both what we gave away and what we kept.

---

## What comes next

The reference implementation is open-source. Anyone can clone it. The specification is public. Anyone can build to it.

The research-access portal is open to academics, journalists, and independent researchers who want to study, cite, or reproduce the architecture. Six months of session archives. All thirteen patent filings. The innovation pipeline. The Living Laboratory documentation.

The first Tier-2 licensing conversations open in early May. The first cold-start node activates in San Antonio, anchored by La Capital del Sabor, with the platform's first Crown at the Captain level being a grandmother whose grocery bill for her diabetes medication was one of the original use cases that shaped the LifeLine Medications initiative three years ago.

We are not reinventing AI. We are changing whose pocket the savings go into.

---

## The philosophical short version

A highway painter walks back to the paint can every time the brush runs dry.

Imagine, one day, someone thinks to strap the can to the painter's back.

That is how every durable change in infrastructure begins — not with a better painter, but with someone looking at the whole apparatus and saying *this is insane; what if we just did it the obvious way?*

The Romulator is the obvious way.

The cooperative commons is the obvious way.

The giving-away of eighty percent of the IP is the obvious way.

There are a lot of things that look radical only because nobody did them yet.

---

*Help each other help ourselves.*

**For the Keep.**

---

*Jonathan Jones is the founder and general manager of Liana Banyan Corporation, a Wyoming C-Corporation filed November 21, 2025. He is a U.S. Army National Guard veteran of no particular note, and a father of eight. Liana Banyan's reference implementation of the Romulator 9000 is available at [the public repository]. The three-week synopsis is [here](./CEPHAS_SYNOPSIS_THREE_WEEKS.md). Research access is [here](./CEPHAS_RESEARCH_ACCESS_KIT.md).*

---

*This Pudding is the canonical public announcement of the Romulator 9000. Citations welcome. Reproductions welcome. Commercial re-use governed by the Cooperative Defensive Patent Pledge.*
