# A&A FORMAL #2315 -- Member-Curated Three-Class Substrate Sovereignty
## (Ephemeral / Personal-Permanent / Shared-Permanent)

**Filed**: B127, 2026-04-27 by Bishop on Founder ratification.
**Class**: Crown Jewel candidate. Member-data sovereignty / privacy / curation primitive.
**Predecessors**: #2293 Tiered Vendor Adoption / Member-Portability Covenant, #2308 Year of Jubilee Ledger, #2310 First-Consult Edict, #2313 Five Dollar Stack, #2314 Dual-Entity Dual-License.
**Empirical anchor**: Founder example B127 -- *"the Valentines Day Family Table thing I made with the Loteria Cards and singing to my Daughters and Wife for their presents -- I would not share that with anyone OUTSIDE of my Family Table, and even then, only the immediate of my wife and kids. But I WOULD share other things -- like the proof of my FAA Pilots License, with anyone. Same principle, but with data collected."*
**K530 SHIPPED**: 2026-04-27. Working build at `lb-omnibox-extension/` — Chrome MV3 extension implementing full Three-Class curation pipeline at the omnibox layer. Internal-only build, `OMNIBOX_EXTENSION_PUBLISHED=false`. Constitutes #2315 Reduction-to-Practice evidence for Prov 14 per B130 Path B ratification. Extension files: manifest.json (MV3 + world:MAIN) · injected.js (MAIN-world fetch override + URL detection + Three-Class overlay) · content.js (isolated bridge) · background.js (IndexedDB + Helm daemon + vendor routing) · popup.html/js/css · options.html/js · pages/library.html/js · pages/firstrun.html/js. Tag: v-chrome-omnibox-substrate-injection-K530.

---

## Claim 1 -- The three substrate classes

Member-controlled corpus curation defines three distinct data classes, each with different durability and visibility properties:

| Class | Durability | Default visibility | Examples |
|---|---|---|---|
| **Ephemeral** | Not stored. Query answered, no record kept. | None | Default for omnibox queries; "is this rash dangerous" 2 AM searches; transient curiosity |
| **Personal-Permanent** | Stored in member Helm; right-to-be-forgotten honored | Member-private (default) | "Make a book of this search" -- Loteria Card Family Table designs, recipe collections, project research, personal library |
| **Shared-Permanent** | Stored in cooperative Cathedral or member-shared scope | Member-chosen scope: Family Table / Guild / Tribe / Public | FAA Pilot License proof; published creator works; Crown Jewels; Cathedral canonical entries |

Class assignment is **member-curated**, not platform-determined. The member chooses, per query / per artifact, which class applies.

## Claim 2 -- Per-class behavior contract

Each class has a contract the platform MUST honor:

**Ephemeral contract**:
- No record written anywhere
- No telemetry beyond aggregate cost-of-query (#2309 Token Pricing Gauge)
- No training data exposure to vendors beyond the immediate query-response
- No substrate-injection learning -- this query does not update any Cathedral

**Personal-Permanent contract**:
- Stored locally in member Helm; remote replication only with member consent
- Member can purge any entry, any time, any reason -- right-to-be-forgotten honored at file level
- NOT append-only at member level (member is sovereign over deletions)
- Enriches member's own Cathedral Effect substrate locally (improves their own AI accuracy on related future queries)
- Visible only to member by default; member can promote to shared-permanent at any time

**Shared-Permanent contract**:
- Member-chosen scope (Family Table / Guild / Tribe / Public per existing #2293 portability framework)
- Within scope: append-only / stone-tablet / Year-of-Jubilee class (#2308) -- members in scope can witness but not delete others' contributions
- Member retains right to demote-and-delete THEIR OWN contributions (with audit trail of the demotion event)
- Public-scope contributions enter the cooperative Cathedral and follow Cooperative Defensive Patent Pledge attestation if IP-bearing
- Crown Jewel scope: Year-of-Jubilee reconciliation cycle applies (#2308)

## Claim 3 -- Member-curated UX (the "make a book?" prompt)

After any query / artifact creation that COULD become durable, the member receives an opt-in curation prompt:

> *"Do you want to make a book of this search to make it more effective? You can delete at any time."*

Or for artifact creation:

> *"Save this to your library? You can keep it private, share with [Family Table] / [Guild X] / [Tribe Y], or publish."*

Defaults to ephemeral. Member's curation choice persists (per-topic / per-category) until member changes it. The Helm becomes the personal library where Personal-Permanent artifacts live, organized by topic / category. Library accessible via normal browser usage AND via the LB Frame extension (#2293 Frame).

**Critical**: the prompt is opt-IN. Default behavior is ephemeral. Members curate UP into durability when they choose; they don't have to opt-OUT of harvesting.

## Claim 4 -- Inversion of extraction model

Standard AI / search / social platforms operate by **harvesting**: data is captured by default, durable in vendor's vault, used for training and ad-targeting, deletion is friction-laden or impossible.

LB's Three-Class model **inverts** this: data is ephemeral by default, durable only when member chooses, deletable at any time, training-data exposure tied to scope (ephemeral never trains anyone; personal-permanent trains the member's own Cathedral; shared-permanent trains the cooperative Cathedral only with member consent and within member-chosen scope).

This is not a privacy "feature" added to an extraction model. It is the structural inversion: **what we allow you to control vs. what others harvest from you.** (Keystone #47 candidate, Founder B127.)

## Claim 5 -- Educational on-ramp via Chrome omnibox integration

The Chrome omnibox (default search bar) is the lowest-barrier surface for member onboarding. Inserting the Three-Class curation prompt at the omnibox layer accomplishes three goals simultaneously:

1. **Lowest behavior change** -- members already use the omnibox; the substrate injection happens transparently (Cathedral Effect lift via #2278); the curation prompt is the only new UX element
2. **Trains members on the Helm** -- the "save to library?" prompt teaches members that the Helm is their personal portfolio of curated works + stored personal data, organized by topic
3. **Demonstrates the control inversion** -- members SEE that they choose what becomes durable, vs. the harvest-by-default model they're accustomed to from other platforms

Pairs with K508 MAIN-world fetch-override pattern (proven on Chromium for Perplexity); generalizes the same architectural pattern to Chrome omnibox queries. K-future K530-class Knight prompt implements the integration.

## Claim 6 -- Visibility scopes per existing #2293 framework

Sharing scopes are member-defined per the existing Helm/Bridge/Guild/Tribe framework:

| Scope | Composition | Examples |
|---|---|---|
| Member-private | Just the member | Default for Personal-Permanent |
| Family Table | Member-chosen immediate-family list (per Founder example: "wife and kids") | Loteria Card Valentines Day designs |
| Guild | Professional cooperative the member belongs to | Project research relevant to the Guild's work |
| Tribe | Personal cooperative the member belongs to | Family-extended hobby groups |
| Public | The cooperative Cathedral / commons | FAA Pilot License proof; Crown Jewel contributions |

Multi-scope is allowed (a member can share an artifact with Family Table AND publish a redacted version publicly). Scope changes are member-actioned and audit-trailed.

## Claim 7 -- Right-to-be-forgotten precedence

Right-to-be-forgotten precedes append-only at the personal-substrate level. A member can:
- Delete any Personal-Permanent entry at any time, no reason required
- Demote-and-delete any Shared-Permanent contribution they themselves authored, with audit-trail entry recording the demotion (per Year-of-Jubilee #2308 reconciliation framework)
- Purge their entire Personal-Permanent substrate (full account-level forgetting) on request

What the member CANNOT delete:
- Other members' contributions in shared scopes (those members' sovereignty applies)
- Cooperative Cathedral entries that have been Crown-Jewel-promoted (those follow #2308 Year of Jubilee reconciliation cycles, not unilateral deletion)
- Audit-trail entries of their own deletions (the deletion event is recorded; the deleted CONTENT is gone, but the fact of deletion is retained for cooperative integrity)

This balance gives members maximum personal sovereignty while preserving cooperative-substrate integrity at scope boundaries.

## Claim 8 -- Chrome history tap-into-as-corpus, with the right boundaries

Founder ratified B127: Chrome browsing/search history is potentially a rich personal-substrate corpus, BUT requires explicit member consent + curation. Tapping history as corpus is gated by:

1. **Explicit opt-in** per topic / per timeframe / per session
2. **Curation step** before any history entry becomes Personal-Permanent (member sees what's about to be enshrined; can edit / decline / partial-include)
3. **Forgetting preserved** -- including history doesn't make entries append-only; member can still purge any entry
4. **Family Table / Guild / Public visibility never default for history** -- history-derived corpus stays member-private unless member explicitly promotes specific entries

Per Founder framing: *"NOT make into stone tablets things people don't want there."* The 2 AM search history stays ephemeral or member-private; never gets promoted to Cathedral or shared without explicit member curation choice.

## Claim 9 -- Cooperative-economic value emerges from curation, not harvest

Standard ad-tech / AI-training extraction models monetize harvested data by selling access to it (ad targeting) or by training models on it (closed-source improvement that benefits the vendor only).

LB's Three-Class model creates value differently:
- **Personal-Permanent corpus** -> improves the MEMBER'S own Cathedral Effect on their own queries (member benefits directly; LB takes no cut beyond standard #2313 Five Dollar Stack membership)
- **Shared-Permanent contributions to public Cathedral** -> 60/20/10/10 distribution per #2314 Dual-Entity model (member contributing to Cathedral receives Pedestal allocation share; the cooperative benefits collectively; LB Corp + Upekrithen LLC structure handles the distribution mechanics)
- **Token Pricing Gauge** (#2309) feeds on aggregate cross-vendor cost data with member consent -- public good, member contributors recognized

The member earns by curating UP, not by being harvested from. The cooperative grows by aggregating consensual contributions, not by surveilling.

## Claim 10 -- Implementation architecture

| Layer | Implementation | Existing canon |
|---|---|---|
| Omnibox query intercept | MAIN-world fetch-override pattern (K508 generalization) | #2275 Vendor-Neutral Bridge |
| Substrate injection | Cathedral Effect mechanism (R10/R13/K511/K521 validated) | #2278 Cathedral Effect, #2310 First-Consult Edict |
| Three-class storage | Member Helm (Personal-Permanent) + cooperative Cathedral (Shared-Permanent) + ephemeral (no storage) | #2293 Member-Portability Covenant, #2308 Year of Jubilee |
| Curation prompt UI | Frame extension overlay; lightweight, non-blocking | LB Frame K518 onboarding wizard pattern |
| Vendor routing | Conductor's Baton (#2277) selects vendor per member key in #2313 Five Dollar Stack | #2277, #2313 |
| Distribution accounting | 60/20/10/10 per #2314 Dual-Entity model | #2314 |
| Audit trail | Year-of-Jubilee reconciliation log for Shared-Permanent demotions | #2308 |

K-future K530-class Knight prompt implements the omnibox integration; K531-class implements the Helm library UI.

## Public framing (for any future LB external-facing artifact)

> *"Three classes. You choose. Ephemeral by default -- the query happens, gets answered, no record kept. Make a book of it if you want -- saved in your library, organized by topic, deletable at any time. Share it if you want -- with your family table, your guild, your tribe, or the world. The default is forgetting. The exceptions are yours to make. What we allow you to control vs. what others harvest from you."*

## Cross-references

- #2293 Tiered Vendor Adoption / Member-Portability Covenant
- #2278 Cathedral Effect
- #2308 Year of Jubilee Cathedral Reconciliation Ledger (Shared-Permanent durability mechanism)
- #2309 Token Pricing Gauge (consent-gated aggregate telemetry)
- #2310 First-Consult Edict (substrate-first discipline)
- #2313 Five Dollar Stack (member-buy-in pricing)
- #2314 Dual-Entity Dual-License (revenue distribution)
- Keystone #47 candidate (Founder B127): *"What we allow you to control vs. what others harvest from you"*
- K508 Comet Bridge MAIN-world fetch-override (proven Chromium pattern; generalizes to omnibox)
- K-future K530-class Knight prompt (omnibox extension implementation)
- K-future K531-class Knight prompt (Helm library UI)
- `project_chrome_omnibox_two_substrate.md` (memory)
- `project_curated_substrate_sovereignty.md` (memory)
- `feedback_helm_bridge_naming.md` (Helm = personal portfolio)
- `feedback_guild_tribe_membership.md` (multi-Guild / multi-Tribe per member)

## Filing target

Prov 14 amendment, priority date 2026-04-27. Bundle with B127 #2308-#2314.

*Filed B127 by Bishop. Long Haul AND Fix Along the Way. The default is forgetting. The exceptions are yours to make. By their fruits.*