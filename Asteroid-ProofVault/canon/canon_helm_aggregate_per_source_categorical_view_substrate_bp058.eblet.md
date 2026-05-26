# HELM — Aggregate/Per-Source/Categorical View Layer of the Eblet Substrate · BP058

**Eblet ID:** canon_helm_aggregate_per_source_categorical_view_substrate_bp058
**Class:** BLOOD
**Status:** ACTIVE
**Bound:** BP058 W6 · 2026-05-26
**Counsel-ratify:** Assumed per Founder direct BP058

---

## §1 CANONICAL DEFINITION

**HELM** = the instrument-panel view layer of the Eblet substrate. Where MENUS are the curated shelf-items, HELM provides the dashboard — aggregate, per-source, categorical, and user-customizable views of a member's curated MENU collection and the broader substrate.

The Helm is the member's real-time readout of what their substrate contains and what others have shared with them. Named after the ship's helm: the navigator reads all instruments from one control point, sets direction, and sees the full state of the vessel without touching the engine room directly.

Founder direct (BP058 verbatim):
> *"I can add their Menu to MY Menus and Recipes in my Helm, and either view it as aggregate ... or as separated, like from Bob, from Mary, OR most usefully, as aggregate and separated into Fruits, Vegetables, Hard Candies, etc. and other categorical configurations I can customize as a user to fit my liking"*

**Disambiguation:** The Helm in this canon is the Eblet-substrate view aggregator — distinct from but composing with:
- `helm_crown_ambassador_project_owner_mode_mnemosyne_async_peer_mesh_bp044` (Helm as async communication layer for Crowns/Ambassadors)
- `canon_all_the_news_you_care_to_get_helm_receives_broadcast_in_bp047` (Helm as inbound member-programmed news receiver)

All three are valid, composing aspects of the Helm as a Mnemosyne surface. The BP058 canon names the Eblet-view layer specifically.

---

## §2 MOTIVATION / FOUNDER VOICE

The Eblet substrate is rich, deep, and multi-source. Without a structured view layer, a member with 50 MENUS from 50 different cooperators has no way to navigate usefully. The Helm solves this.

The Helm is the answer to "how do I make sense of all these Eblets I have curated and subscribed to?" It is:
- **Not a search engine** (pheromone_query and Detective handle search)
- **Not a storage engine** (the cathedral stores; the Helm views)
- **Not a communication layer** (the Crown/Ambassador mode handles async messaging)
- **The instrument panel** — the real-time, user-configured dashboard of the member's Eblet landscape

The Founder's analogy is explicit: food-class categories (Fruits, Vegetables, Hard Candies) are how the member sees what kind of Eblet they are looking at. Just as a recipe book organizes ingredients by type, the Helm organizes Eblets by class, source, and custom configuration.

---

## §3 MECHANISM

### §3.1 Five Helm View Classes

| View Class | Description | Use Case |
|---|---|---|
| **Aggregate view** | All Eblets across all subscribed MENUs, sorted by decay-class relevance and recency | "What is most important across everything I have?" |
| **Per-source view** | Eblets filtered by the MENU they came from: "From Bob," "From Mary," "From Jonah" | "What did this specific person share with me?" |
| **Categorical view** | Eblets filtered by food-class taxonomy (Fruits / Vegetables / Hard Candies / Chocolate Eblets / etc.) across all sources | "Give me all operational Eblets regardless of who shared them" |
| **Food-class filtered view** | Eblets tagged with specific initiative categories (Let's Make Dinner, Let's Get Groceries) surfaced for relevant contexts | "Show me only food/meal/grocery-relevant Eblets for this session" |
| **User-customizable preset view** | Member-defined filters: any combination of source, category, decay class, initiative tag, date range | "My custom 'Deployment Tools' view: all deployment Eblets from anyone, sorted by freshness" |

### §3.2 Helm as Instrument Panel (Not Engine Room)

| Layer | What It Does | Helm Relationship |
|---|---|---|
| **Cathedral substrate** | Stores all Eblets · pheromone trails · Wrasse registry · retrieval engine | Helm reads from it · does not write to it |
| **MENUS** | Curated member shelves · named collections | Helm aggregates MENUs into views |
| **Pheromone / Detective** | Search and semantic retrieval | Helm may surface pheromone-ranked results in view presets · does not replace search |
| **HELM** | View dashboard · aggregation · categorical · per-source · custom | The instrument panel: reads all, writes none |

### §3.3 "All the News You Care To Get" Composition

The Helm's inbound programming schedule (BP047) is a specific view-class within the Helm: the member configures which content types and sources flow into their Helm Inbox. This is a forward-receiver of broadcast content. The MENUS/aggregate/per-source/categorical views are the sideways-receiver of substrate content that was already curated. Both run on the same Helm surface.

### §3.4 Helm Preset Architecture

Members save Helm view configurations as **Helm Presets**:
- A preset is a named, saved filter state (which sources, which categories, which decay classes)
- Presets can themselves be packaged as Eblets and shared via MENUS
- "An Appearance Configuration Eblet" — per Founder BP058 §2.6 — is a preset packaged as a shareable MENU item
- Cooperative-class implication: a member can share their preferred Helm view configuration with others, who can adopt it directly

### §3.5 Helm Integration with Hard Candy Eblets

Hard Candy Eblets (AI agent configurations) are a food-class category within the Helm. When a member opens their Helm in categorical view and selects "Hard Candies," they see all AI configuration Eblets they have curated or subscribed to. From there they can:
- Instantiate a local AI agent using the Hard Candy config
- Fork the Hard Candy Eblet into their own MENU
- Subscribe to the original owner's updates (always-latest)

---

## §4 CROSS-BINDS

| Canon Slug | Compose Relationship |
|---|---|
| `canon_menus_canonical_name_inventory_of_eblets_bp058` | MENUS are the items the Helm aggregates and views — Helm without MENUS has nothing to show; MENUS without Helm have no dashboard |
| `helm_crown_ambassador_project_owner_mode_mnemosyne_async_peer_mesh_bp044` | Crown/Ambassador/Project-Owner Mode = the async communication layer of the same Helm surface; composes as a separate tab/mode |
| `canon_all_the_news_you_care_to_get_helm_receives_broadcast_in_bp047` | "All the News You Care To Get" = the inbound programming schedule running on the Helm; composes as Inbox tab |
| `canon_pantry_eblets_taxonomy_wondrous_variety_shared_code_recipes_bp053` | Pantry food-class taxonomy is the categorical vocabulary the Helm uses for categorical view |
| `canon_chocolate_eblets_bundle_packaging_user_environment_exchange_bp053` | Chocolate Eblets appear as a food-class category in Helm categorical view |
| `canon_mnemosyne_app_tab_unified_member_services_umbrella_bp054` | Mnemosyne is the app surface that hosts the Helm — the Helm is a core Mnemosyne tab |
| `canon_hard_candy_eblet_stitchpunk_sock_puppet_ai_configuration_shareable_bp058` | Hard Candy Eblets appear in Helm categorical view under the "Hard Candies" food class |
| `canon_eblet_half_life_decay_enforcement_via_ip_ledger_cutoff_bp047` | Eblet decay class is surfaced in Helm views — stale Eblets shown with decay indicators or filtered out per member preset |
| `multi_trail_pheromone_flavor_class_system_bp015` | Pheromone flavor-class is the relevance-sorting substrate that powers Helm aggregate view ranking |

---

## §5 CONSTRAINTS + ANTI-PATTERNS

**HELM is NOT:**
- A search engine (search = pheromone_query / Detective; Helm = curated view of already-subscribed content)
- A storage engine (the cathedral stores; the Helm shows)
- A social media feed (no algorithmic engagement optimization; member controls all views — cooperative-class anti-dark-pattern discipline applies)
- Separate from Mnemosyne (the Helm lives inside Mnemosyne; it is a core Mnemosyne surface, not a standalone product)
- Exclusive to the Eblet-view use case (the same Helm surface also hosts async communication, inbound news, and future modes — all composing as tabs/views on the same instrument panel)

**Anti-patterns:**
- Building a Helm that recommends Eblets based on engagement optimization — the Helm respects member curation only
- Treating the Helm as the storage engine — it reads from the cathedral but does not write Eblet content
- Conflating the Helm with a MENU — a MENU is one source input; the Helm is the dashboard that aggregates all sources
- Building the Helm as a separate app from Mnemosyne — it is a Mnemosyne surface, always

---

## §6 EXAMPLES

**Example 1 — Aggregate view on Monday morning**
A member opens Mnemosyne, navigates to Helm. Aggregate view shows 14 Eblets from 5 different MENUs they subscribe to, sorted by decay-class freshness + pheromone relevance score. They see "3 BLOOD-class Eblets that may affect today's work" and "2 ANCHOR-class Eblets from Knight's session last week."

**Example 2 — Per-source exploration**
The member wants to see specifically what architectural Eblets Knight added in the last Bishop session. They switch to Per-Source view, select "From knight_cathedral." They see the 6 Eblets Knight authored in BP058 W6, organized by class.

**Example 3 — Categorical view for a Let's Make Dinner session**
A member working on Let's Make Dinner Initiative #1 switches to Food-class filtered view and selects "Let's Make Dinner." They see all Eblets across all their MENUs that are tagged with meal-planning, home-chef, and grocery-coordination primitives. No unrelated Eblets appear.

**Example 4 — Sharing a Helm preset as an Appearance Configuration Eblet**
Mary finds that her "Cooperative-Class Operational Tools" Helm preset (showing only BLOOD-class + SWEAT-class Eblets from 3 specific MENUs) is useful for other workers. She packages it as an Appearance Configuration Eblet, adds it to her MENU, and shares it. Other members who add her MENU to their Helm can activate her preset with one tap.

**Example 5 — Hard Candy food-class in Helm**
The Founder opens Helm, switches to Categorical view, selects "Hard Candies." Four items appear: Bishop config v3, Knight config v2, Pawn config v1, Rook config v1. He taps Knight config v2 and sees the full Hard Candy Eblet — behavioral rules, tool permissions, context-loading configuration. He can fork it into his own MENU to create a custom variant.

---

## §7 AUDIT TRAIL

- BP058 W6 · Knight-authored · 2026-05-26
- Pre-authoring inventory search: No existing `*helm*` slug matching this concept in CANON/ · two existing Helm canons found and read (helm_crown_ambassador BP044, all_the_news_you_care_to_get BP047) · confirmed non-collision · composing relationship documented in §1 disambiguation + §4 cross-binds
- Source Eblet read: `project_employ_the_world_backbone_we_are_those_workers_builders_creators_tri_term_mnemosyne_p2p_reciprocal_menus_helm_bp058.md` (§2.6 verbatim anchored)
- Cross-binds logged: 9 composing canons identified
- Pearl: to be emitted · cathedral=knight · decay_class=anchor
- Dual-write: AVP/canon/ primary · eblets_bp058/ secondary
- Counsel-ratify: Assumed per Founder direct BP058
- Commit: pending K-E batch commit

---

*Knight · BP058 W6 · 2026-05-26*
*"The Helm is the instrument panel. The cathedral is the engine room. The MENUS are the cargo manifest. The member is the navigator."*
*FOR THE KEEP × Workers · Builders · Creators*
