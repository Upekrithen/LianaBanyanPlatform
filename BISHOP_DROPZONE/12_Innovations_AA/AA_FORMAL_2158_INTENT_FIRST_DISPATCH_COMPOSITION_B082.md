# A&A FORMAL — Innovation #2158
## Intent-First Dispatch Composition
## Bishop B082 | April 5, 2026

---

## STATUS: Crown Jewel Candidate

## SOURCE: K310 V2 Dispatch Compose (B080)

---

## DESCRIPTION

A message composition architecture that requires the author to declare intent ("What change are you trying to make?") before any drafting can begin. The intent field is mandatory and gates access to the canonical composer. Once intent is locked, the author writes a single canonical message. Platform variations for 11 distribution channels are generated as edge modifications (word-count clipping, tag adjustment, CTA swaps) around the canonical core — never full rewrites. Dispatch confirmation uses a solemn stamp pattern ("As You Wish") rather than a checkbox, creating deliberate friction for consequential multi-channel broadcasts.

## MECHANICS

1. **IntentField** component renders ABOVE the composer as a required text input: "What change are you trying to make?" with placeholder guidance ("Moving members from X to Y")
2. Intent must be non-empty before CanonicalComposer renders — enforced at component level, not validation-after-the-fact
3. **CanonicalComposer** produces a single master message — the one source of truth
4. **ChannelVariationsPanel** displays 11 channel tiles showing ONLY the delta from canonical (e.g., "Twitter: truncated to 280 chars, CTA swapped to link"). Core text stays canonical.
5. **WorkflowBar** tracks story lifecycle (Draft, Review, Scheduled, Dispatched, Archived) — labeled by story phase, never by object ID
6. **MoneyPenny recall**: AI suggests "You said something similar on [date]. Want to reference it?" — context-aware, never auto-applied
7. **AsYouWishConfirmation**: full-screen solemn stamp before dispatch. Not a checkbox. Not a modal with "OK/Cancel." A deliberate, irreversible-feeling confirmation pattern for multi-channel broadcast.

## PRIOR ART DISTINCTION

- **Hootsuite / Buffer / Sprout Social**: Multi-channel posting tools that let you compose per-channel or copy across. None require intent declaration before drafting. None use a canonical-with-edges model — they either duplicate or customize per channel.
- **Mailchimp / Substack**: Single-channel composers. No multi-channel edge-variation system.
- **Notion / Coda**: Document editors with publishing, but no intent-first gating or multi-channel dispatch.
- **No prior art found** for: (a) mandatory intent field gating composer access, (b) canonical-message-with-edge-variations as a multi-channel broadcast model, (c) solemn stamp confirmation pattern ("As You Wish") for consequential dispatch.

## CLAIMS

1. A method for multi-channel message composition comprising: a mandatory intent declaration field that gates access to a message composer; a single canonical message surface; and an automated channel-variation system that generates per-channel modifications as edge deltas around the canonical text rather than independent per-channel compositions.

2. A solemn confirmation interface pattern for consequential multi-channel broadcasts comprising: a full-screen or modal confirmation surface displaying the canonical message, target channels, and intent declaration; requiring a deliberate stamp action (not a checkbox or toggle) before irrevocable dispatch.

3. A context-aware message recall system within a multi-channel composer that surfaces prior messages matching the current intent declaration, offering reference without auto-application, preserving author agency over repeated narrative themes.

---

*Bishop B082 — Innovation #2158 threshed from K310 V2 Dispatch Compose*
