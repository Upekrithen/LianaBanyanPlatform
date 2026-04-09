# K199 ADDENDUM — Oar Slots: The Cooperative Multiplier Visualization
## Bishop B052
## Append to PROMPT_KNIGHT_SESSION_199_MARKS_MILESTONE_PRIZE_PANEL.md

---

## TASK 6: Oar Slots Visualization (Add to Prize Panel)

When a member selects ANY option from the Prize Panel tabs, they see an **Oar Slots** visualization below their choice. This shows:

1. **Their oar** (filled, glowing green) — "You're paddling your canoe"
2. **Empty oar slots** — "These slots need people to launch the SHIP"
3. **The math** — solo earnings vs. full-crew earnings
4. **Who fills each slot** — real role names, real work

### Visual Design

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  You chose: 📸 Photograph Businesses                     │
│                                                          │
│  Right now, you're paddling your own canoe.              │
│  But look what happens with a full crew:                 │
│                                                          │
│  ┌──────────────────────────────────────────┐            │
│  │  🚣 YOUR CANOE          🚢 THE SHIP      │            │
│  │                                          │            │
│  │  Solo: ~$100/month      Crew: ~$600/month│            │
│  │  (just you)             (each person)    │            │
│  └──────────────────────────────────────────┘            │
│                                                          │
│  OAR SLOTS for Let's Make Dinner:                        │
│                                                          │
│  🟢 You — Photographer          ✓ FILLED                │
│  ⬜ Restaurant Partner           OPEN — needs a cook     │
│  ⬜ Delivery Driver              OPEN — needs wheels     │
│  ⬜ Pearl Diver                  OPEN — needs a scout    │
│  ⬜ Subscriber/Funder            OPEN — needs a backer   │
│  ⬜ Captain/Coordinator          OPEN — needs a leader   │
│                                                          │
│  When all 6 oars are filled, the ship launches           │
│  and everyone earns 4-8× what they'd earn solo.         │
│                                                          │
│  [ INVITE SOMEONE TO FILL A SLOT → ]                     │
│  [ FILL ANOTHER SLOT YOURSELF → ]                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### How It Works Per Path

Each Prize Panel card maps to a **Ship Template** — a predefined crew configuration:

#### Let's Make Dinner (6 oars)
| Oar | Role | Solo $/month | Full Crew $/month | Why More |
|-----|------|-------------|-------------------|----------|
| 1 | Restaurant Partner | $200 (own sales) | $800 (100+ cooperative meals at Cost+20%, keeps 83.3%) | Guaranteed demand from network |
| 2 | Delivery Driver | $150 (gig apps) | $600 (steady route, 100+ deliveries, no app fees) | Consistent route, zero platform cut beyond 20% |
| 3 | Photographer | $100 (freelance) | $500 (all partner restaurants need photos, pipeline never dries up) | Every new restaurant = more work |
| 4 | Pearl Diver | $75 (casual logging) | $400 (restaurant specials → subscriber orders → your intel drives revenue) | Your deal intel becomes the ordering engine |
| 5 | Subscriber/Funder | $0 (spending) | Gets 28 meals/month funded by Mission ONE + earns Joules for backing | Early backer multiplier on charitable subscriptions |
| 6 | Captain/Coordinator | $0 (nothing to manage) | $500 (coordination Marks on every transaction in the node) | You're the hub — every meal that moves earns you Marks |

**Solo photographer: ~$100/month. Same photographer in a 6-oar LMD crew: ~$500/month. Same camera. Same hours. More oars.**

#### Bounty Photography (3 oars — simpler ship)
| Oar | Role | Solo | Full Crew |
|-----|------|------|-----------|
| 1 | Photographer | $100/month | $300/month |
| 2 | Captain (assigns bounties) | — | $200/month |
| 3 | Pearl Diver (finds businesses that need photos) | — | $200/month |

#### Cooperative Classroom (4 oars)
| Oar | Role | Solo | Full Crew |
|-----|------|------|-----------|
| 1 | Teacher | $150/month | $500/month |
| 2 | Second Teacher (different subject) | — | $500/month |
| 3 | Scheduler/Coordinator | — | $200/month |
| 4 | Marketing/Pearl Diver (finds students) | — | $300/month |

#### Freezer Node (5 oars)
| Oar | Role | Solo | Full Crew |
|-----|------|------|-----------|
| 1 | Cook/Prep | $200/month | $700/month |
| 2 | Second Cook | — | $700/month |
| 3 | Storage/Packaging | — | $300/month |
| 4 | Delivery Driver | — | $400/month |
| 5 | Captain/Orders | — | $400/month |

### Ship Templates Data

```typescript
// platform/src/data/shipTemplates.ts

export interface OarSlot {
  role: string;
  icon: string;
  description: string;
  soloEarning: string;     // e.g., "~$100/month"
  crewEarning: string;     // e.g., "~$500/month"
  whyMore: string;         // explanation of multiplier
}

export interface ShipTemplate {
  id: string;
  name: string;            // "Let's Make Dinner"
  initiative: string;      // maps to initiative slug
  totalOars: number;
  oars: OarSlot[];
  soloLabel: string;       // "Your Canoe"
  crewLabel: string;       // "The Ship"
}

export const SHIP_TEMPLATES: ShipTemplate[] = [
  {
    id: 'lmd',
    name: "Let's Make Dinner",
    initiative: 'lets_make_dinner',
    totalOars: 6,
    oars: [
      { role: 'Restaurant Partner', icon: '🍽️', description: 'Makes the food',
        soloEarning: '~$200/mo', crewEarning: '~$800/mo',
        whyMore: 'Guaranteed demand from the cooperative network' },
      { role: 'Delivery Driver', icon: '🚗', description: 'Delivers meals',
        soloEarning: '~$150/mo', crewEarning: '~$600/mo',
        whyMore: 'Steady route, no gig-app fees, just Cost+20%' },
      { role: 'Photographer', icon: '📸', description: 'Documents restaurants',
        soloEarning: '~$100/mo', crewEarning: '~$500/mo',
        whyMore: 'Every partner restaurant needs photos — pipeline never dries up' },
      { role: 'Pearl Diver', icon: '🐚', description: 'Scouts deals & specials',
        soloEarning: '~$75/mo', crewEarning: '~$400/mo',
        whyMore: 'Your deal intel drives subscriber orders — you become the engine' },
      { role: 'Subscriber/Funder', icon: '💛', description: 'Funds meals via Mission ONE',
        soloEarning: '$0', crewEarning: 'Gets 28 meals/month + earns Joules',
        whyMore: 'Early backer multiplier on charitable subscriptions' },
      { role: 'Captain', icon: '⚓', description: 'Coordinates the crew',
        soloEarning: '$0', crewEarning: '~$500/mo',
        whyMore: 'Coordination Marks on every transaction in the node' },
    ],
    soloLabel: '🚣 Your Canoe',
    crewLabel: '🚢 The Ship',
  },
  // ... similar for bounty_photography (3 oars), cooperative_classroom (4), freezer_node (5)
];
```

### Component

**New component:** `platform/src/components/marks/OarSlots.tsx`

Props:
- `templateId: string` — which ship template to show
- `memberRole: string` — which oar the member fills (from their Prize Panel choice)
- `filledOars: number` — how many slots are currently filled (from real data or demo mode)

Renders:
- Canoe vs Ship comparison (side by side, with dollar amounts)
- Vertical list of oar slots (filled = green, open = gray outline)
- Each slot shows: role name, description, solo vs crew earning
- "Why more?" tooltip on hover for each slot
- CTAs: "Invite Someone to Fill a Slot" / "Fill Another Slot Yourself"

### Integration with Prize Panel

When a member clicks any card in the Prize Panel tabs:
1. Card expands or navigates to detail view
2. Below the card detail, the **Oar Slots** visualization appears
3. The member's chosen role is pre-filled as the first oar (glowing green)
4. Remaining oar slots show as open
5. The canoe-to-ship comparison makes the cooperative advantage viscerally clear

### CTA Actions

- **"Invite Someone"** → Opens Cue Card generator pre-filled for that role
  - e.g., "Diana, we need a Delivery Driver for Let's Make Dinner in San Antonio"
  - Uses the existing Cue Card system (K169)
- **"Fill Another Slot Yourself"** → Shows which other roles the member could fill
  - e.g., photographer could ALSO be the Pearl Diver (log deals on the same walk)

---

## INNOVATION NOTE

This is a VISUAL PROOF of the cooperative advantage. Every other platform says "work together = earn more" but nobody SHOWS THE MATH side by side with empty slots the member can help fill. The oar metaphor makes it physical — you can SEE the empty seats in the boat. You can SEE what happens when they're filled. And you can INVITE people to fill them.

This ties directly to the tagline: "Don't Wait for Your Ship to Come In — Launch Your Ship Yourself TODAY."

Solo = canoe. Together = ship. Same water. More oars.

---

*K199 Addendum — Oar Slots — Bishop B052*
*Solo: $100. Together: $800. Same effort. More oars.*
*FOR THE KEEP!*
