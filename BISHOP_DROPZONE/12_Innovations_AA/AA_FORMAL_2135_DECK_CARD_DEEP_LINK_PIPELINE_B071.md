# A&A FORMAL — Innovation #2135: Deck Card Deep-Link Pipeline
## Acknowledgment & Attribution | Bishop Session B071 | April 3, 2026

---

## Innovation Record

| Field | Value |
|-------|-------|
| **Number** | #2135 |
| **Name** | Deck Card Deep-Link Pipeline |
| **Full Title** | Deck Card Deep-Link Pipeline: QR-to-Episode-to-Paper Onboarding Bridge |
| **Category** | Content Distribution / Physical-Digital Bridge / Onboarding Infrastructure |
| **Priority** | HIGH |
| **Crown Jewel Candidate** | YES — creates the physical-to-digital content bridge that converts Deck Cards into onboarding funnels |
| **Patent Relevance** | Yes — novel pipeline linking physical card QR codes to specific positions within digital publications, triggering persistent bookmark creation and membership onboarding |
| **Related Innovations** | Crewman #6 (#2133), Reading Beacon (#2134), Deck Cards, Cue Cards (#2104+), Battery Dispatch, Cephas Content System |
| **Origin** | Founder directive, B071: "publish as Deck Cards so that when you click it or scan the QR code it takes you to where that episode appears in its containing paper — which is an onboarding opportunity, because it shows what else is available" |

---

## Definition

**Deck Card Deep-Link Pipeline** is the system that connects a physical or digital Deck Card — carrying one "Blood, Sweat, and Tears" episode — to the exact position of that episode's content within its source paper on Cephas. The QR code on the Deck Card is not a generic link to the paper. It is a **deep link** to the specific paragraph, section, or passage that the episode was extracted from.

---

## Architecture

### The Link Chain

```
DECK CARD (physical/digital)
  └─ QR Code
       └─ Deep Link URL: cephas.lianabanyan.org/papers/starscreaming#ep-043
            └─ Paper renders with episode's source passage HIGHLIGHTED
                 └─ Surrounding content visible (full paper context)
                      └─ "Save your place?" → Reading Beacon (#2134)
                      └─ "See more papers" → Content Library browse
                      └─ "Share this" → Cue Card Interest Signal (#2136)
```

### Deck Card Format

Each BST episode gets a Deck Card with:

| Element | Content |
|---------|---------|
| **Front** | Episode text (~280 chars), episode number, chapter name |
| **Series branding** | "Blood, Sweat, and Tears" title, "Crewman #6 — A Founder's AI Journey" subtitle |
| **QR code** | Deep link to episode's position in source paper |
| **Back** | Paper title, author, episode count in chapter, "Scan to read the full story" CTA |

### Deep-Link URL Structure

```
https://cephas.lianabanyan.org/papers/{paper-slug}#bst-ep-{episode-number}
```

Examples:
- `cephas.lianabanyan.org/papers/starscreaming#bst-ep-043` — Episode 43, StarScreaming paper
- `cephas.lianabanyan.org/papers/the-blizzard#bst-ep-071` — Episode 71, Blizzard paper

The anchor (`#bst-ep-NNN`) scrolls to the exact passage and applies a highlight animation, showing the reader exactly which part of the paper their episode came from.

### The Onboarding Funnel

The deep-link is not just navigation — it's an **onboarding funnel**:

| Step | What Happens | Conversion |
|------|-------------|-----------|
| 1. Scan QR | Land on paper at episode position | Curiosity → attention |
| 2. See context | Full paper visible around highlighted passage | Attention → interest |
| 3. Browse | "See more papers" / sidebar with related content | Interest → exploration |
| 4. Save place | "Save your place?" → Reading Beacon offer | Exploration → engagement |
| 5. Create Helm | "You need a Helm to save beacons" → $5/year signup | Engagement → membership |
| 6. Share | "Share what you're reading" → Cue Card Interest Signal | Membership → network effect |

A single Deck Card in a coffee shop, a conference handout, a mailed envelope — each one is a complete onboarding pipeline from physical artifact to paid membership.

### Deck Card Production

For the 94 episodes in Chapters 1-2:

| Chapter | Episodes | Deck Cards |
|---------|----------|-----------|
| Ch. 1: The Wall | 52 | 52 cards |
| Ch. 2: The Blizzard | 42 | 42 cards |
| **Total** | **94** | **94 cards** |

At full archive scale (3,000-5,000 episodes): 3,000-5,000 unique Deck Cards. Each one a physical onboarding opportunity.

Deck Cards can be:
- **Printed**: Physical cards for events, mailings, guerrilla distribution
- **Digital**: Shareable images for social media (the Battery Dispatch already posts hourly — each post IS the digital Deck Card)
- **Collectible**: Numbered, sequential, part of a set — "Collect all 52 Chapter 1 cards"

---

## What Makes This an Innovation

1. **Deep-link to passage position** — not just "link to paper" but "link to THIS EXACT PART of the paper, highlighted, in context"
2. **Physical-to-digital onboarding bridge** — a physical card creates a digital engagement pipeline
3. **Episode-as-entry-point** — each of 3,000-5,000 episodes is a unique door into the platform
4. **Collectible distribution** — numbered, sequential cards create set-completion incentive
5. **Integrates with Reading Beacon (#2134)** — the deep link naturally leads to bookmark creation, which naturally leads to membership

---

*A&A Formal #2135 | Deck Card Deep-Link Pipeline | Bishop B071*
*FOR THE KEEP!*

---

## Claims

**Claim 1 (Independent, System).** A computer-implemented system for atomized content deep-linking from physical or digital cards, comprising: one or more processors and a memory storing instructions; a content store maintaining source articles and a plurality of extracted episodes, each extracted episode associated with a position pointer identifying its source location within a source article; a card generation module configured to produce a card bearing a machine-readable code encoding a deep link to the specific position pointer associated with the episode; and a resolution module configured to receive a scan or activation of the machine-readable code and to navigate a member to the specific position within the source article corresponding to the deep link.

**Claim 2 (Independent, Method).** A computer-implemented method for deep-linking extracted content back to source position, the method comprising: extracting an episode from a source article and recording a position pointer identifying the source position; generating a card carrying a machine-readable code encoding a deep link to the position pointer; resolving the machine-readable code, upon activation, into a navigation request; and displaying the source article to the activating user scrolled to the specific position identified by the pointer.

**Claim 3.** The system of claim 1, wherein the machine-readable code is a QR code printed on a physical card or rendered in a digital card interface.

**Claim 4.** The system of claim 1, wherein the resolution module is further configured to create a reading beacon at the resolved position associated with the activating member.

**Claim 5.** The method of claim 2, further comprising recording, for each activation event, the card identifier, activating member, and timestamp, and aggregating activation events into an engagement metric for the source article.

**Claim 6.** The method of claim 2, wherein the deep link returns the user to the exact paragraph or section from which the episode was extracted, preserving the narrative context of the episode.
