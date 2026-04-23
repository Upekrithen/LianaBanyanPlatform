# A&A FORMAL — Innovation #2134: Reading Beacon
## Acknowledgment & Attribution | Bishop Session B071 | April 3, 2026

---

## Innovation Record

| Field | Value |
|-------|-------|
| **Number** | #2134 |
| **Name** | Reading Beacon |
| **Full Title** | Reading Beacon: Auto-Referenced Persistent Reading Position with Beacon Wallet Storage |
| **Category** | Content Navigation / User Engagement / Onboarding Infrastructure |
| **Priority** | HIGH |
| **Crown Jewel Candidate** | YES — creates a new beacon subtype, auto-reference naming convention, and the Beacon Wallet concept; structural for all future content navigation |
| **Patent Relevance** | Yes — novel auto-generated reference code system for persistent reading positions tied to a portable wallet |
| **Related Innovations** | Beacons (#existing), Crewman #6 (#2133), Deck Cards, Cue Cards (#2104+), Guided Tour (K194), Fingertips System (#2132) |
| **Origin** | Founder directive, B071: "save their place with a Reading Beacon, which number with Reference and Iteration, so that it autogenerates as the Paper being read BeaconNum-REF-PageNum so in this case it would be Read001MnL002" |

---

## Definition

**Reading Beacon** is a specialized beacon subtype that saves a member's reading position within a Liana Banyan publication (paper, Pudding article, journal, Cephas page). Each Reading Beacon carries an auto-generated reference code and is stored in the member's **Beacon Wallet** — a persistent collection of all their saved reading positions across all content.

---

## Architecture

### Auto-Reference Code Format

```
Read[BeaconNum][PaperRef][PageNum]
```

| Component | Description | Example |
|-----------|-------------|---------|
| `Read` | Prefix — identifies this as a Reading Beacon | `Read` |
| `BeaconNum` | Sequential number for this user's Reading Beacons (zero-padded to 3 digits) | `001` |
| `PaperRef` | Abbreviated reference to the source document (auto-generated from title) | `MnL` (Mnemonic Load) |
| `PageNum` | Page/section number within the document | `002` |

**Full example**: `Read001MnL002` = This user's 1st Reading Beacon, placed at page 2 of the Mnemonic Load paper.

### Paper Reference Abbreviations (Auto-Generated)

| Paper/Document | Auto-Ref |
|----------------|----------|
| The Mnemonic Load | `MnL` |
| The Fingertips System | `FnT` |
| StarScreaming | `StS` |
| The Blizzard | `Blz` |
| AI Cake V2 | `AiC` |
| The $5 Career | `5DC` |
| Self-Funding Economics | `SFE` |
| Pudding #NNN | `P###` |
| Journal #NN | `J##` |

Abbreviation rules: 3 characters, derived from title keywords, unique within the system. Collision resolution: append a digit (e.g., `StS` vs `StS2`).

### Database Implementation

The existing `beacons` table already supports this via `orange_subtype` and `orange_payload`:

```sql
-- Reading Beacon creation
INSERT INTO beacons (
  user_id, beacon_color, beacon_number, path, page_title,
  note, orange_subtype, orange_payload
) VALUES (
  $user_id,
  'orange',            -- Reading Beacons are orange (learning/navigation color)
  $next_beacon_number, -- Auto-incremented per user
  '/papers/mnemonic-load#section-2',  -- Deep link path
  'The Mnemonic Load',
  'Read001MnL002',     -- Auto-generated reference code
  'reading',           -- Orange subtype: reading beacon
  jsonb_build_object(
    'ref_code', 'Read001MnL002',
    'paper_ref', 'MnL',
    'paper_id', $paper_uuid,
    'page_num', 2,
    'section_anchor', 'section-2',
    'episode_source', 'BST-EP-047',  -- Which Crewman #6 episode led here (if applicable)
    'created_via', 'qr_scan',        -- How the beacon was created (qr_scan, manual, guided_tour)
    'progress_pct', 15.5             -- Reading progress percentage in document
  )
);
```

### Beacon Wallet

The **Beacon Wallet** is the member's collection view of all their Reading Beacons. It lives in the Helm (the member's personal space).

| Feature | Description |
|---------|-------------|
| **Wallet view** | Grid/list of all Reading Beacons with ref codes, paper titles, progress bars |
| **Resume reading** | Tap any beacon to return to exact saved position |
| **Progress tracking** | Each beacon shows % read of its containing document |
| **Sort/filter** | By date added, by paper, by progress, by source (QR vs manual vs tour) |
| **Beacon count** | Total Reading Beacons saved — gamification element ("You've bookmarked 12 papers") |

### Creation Triggers

A Reading Beacon can be created by:

1. **QR scan from Deck Card** — scan a BST episode's Deck Card QR code → lands on episode position in paper → "Save your place?" prompt → Reading Beacon created
2. **Manual bookmark** — member clicks "Save Place" while reading any paper on Cephas
3. **Guided Tour** — the onboarding Guided Tour (K194) drops Reading Beacons at key documents
4. **Auto-save** — when a member navigates away from a partially-read paper, offer to save position

---

## The Onboarding Pipeline

This is the critical architectural contribution. The Reading Beacon converts casual content consumption into platform engagement:

```
Deck Card QR → Episode in Paper → "What else is here?" → Browse other papers
                                → "Save your place?" → Reading Beacon created
                                → "You need a Helm to save beacons" → Account creation
                                → "Share what you're reading?" → Cue Card Interest Signal (#2136)
```

A physical Deck Card in someone's hand becomes an account creation trigger. The Reading Beacon is the mechanism — saving your place requires a Helm, and a Helm requires membership. The $5/year membership is positioned as "keep your bookmarks forever" rather than "pay to access content." The content is free. The persistence is the value.

---

## What Makes This an Innovation

1. **Auto-generated reference codes** — no prior system generates human-readable, structured bookmark references from content metadata
2. **Wallet model for reading positions** — treating bookmarks as collectible, portable, shareable assets rather than browser-level utilities
3. **Physical-to-digital bridge** — QR on a Deck Card creates a digital Reading Beacon, converting physical distribution into digital engagement
4. **Onboarding trigger** — the bookmark itself is the membership conversion mechanism
5. **Cross-references Crewman #6** — every episode's Deck Card QR creates a potential Reading Beacon, making the 3,000-5,000 episode archive a 3,000-5,000 onboarding opportunity pool

---

*A&A Formal #2134 | Reading Beacon | Bishop B071*
*FOR THE KEEP!*

---

## Claims

**Claim 1 (Independent, System).** A computer-implemented system for persistent reading-position storage, comprising: one or more processors and a memory storing instructions; a beacon store configured to maintain, for each of a plurality of members, a beacon wallet containing one or more reading beacons, each reading beacon including a content identifier, a position pointer within the identified content, an auto-generated reference code, and a timestamp; a beacon creation module configured to generate a reading beacon responsive to a save-position action by a member while consuming content; and a resumption module configured to return a member to a saved position within an identified content responsive to selection of a corresponding reading beacon.

**Claim 2 (Independent, Method).** A computer-implemented method for cross-publication reading-position persistence, the method comprising: receiving a save-position request from a member consuming a publication on a content platform; generating a reading beacon including a content identifier, a position pointer, and an auto-generated reference code; storing the reading beacon in a beacon wallet associated with the member; and responsive to a later resumption request, retrieving the reading beacon and returning the member to the saved position.

**Claim 3.** The system of claim 1, wherein the beacon wallet contains reading beacons across a plurality of distinct publication types including papers, serialized articles, journals, and content-platform pages.

**Claim 4.** The system of claim 1, wherein each reading beacon is shareable via its reference code such that another member can follow the reference code to the same saved position within the identified content.

**Claim 5.** The method of claim 2, further comprising updating an aggregate engagement metric for the content in response to the reading-beacon creation event.

**Claim 6.** The method of claim 2, wherein the position pointer identifies a specific paragraph, section anchor, or byte offset within the content such that the saved position is preserved even after content reflow or pagination changes.
