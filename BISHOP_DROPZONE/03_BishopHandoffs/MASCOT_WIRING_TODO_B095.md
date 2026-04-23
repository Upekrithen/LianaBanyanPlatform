# Mascot Wiring TODO — B095 handoff

**Status as of B095 end:** The 16-character mascot ensemble system is built and live. LRH + Denken are co-hosts (province-aware). 12 domain specialists + 3 specials exist in the registry. The `SummonMascot` API is wired and verified end-to-end on four pages:

| Page | Route | Summons wired |
|---|---|---|
| Mirror Mirror | `/mirror?lang=X&word=Y` | 3 — Owl (WHY), Banker Pig (MATH), Maker Fox (CRAFT) |
| Door 2 Pathways | `/build` + `/build/:pathway` | 2 — Otter Tutor (pathways grid), Engineer Rabbit (production bars) |
| Door 3 Join | `/join` + `/welcome` | 3 — Banker Pig (83.3%), Judge Cat (voting), Banker Pig returning (currency triangle) |
| Door 1 Ghost World | `/browse` | 1 — Ghost Cat (Ghost World special) |
| Cast gallery | `/cast` | N/A — all 17 characters displayed |

**9 SummonMascot calls are live.** All use `startClosed` → muted LRH pill → click to open.

---

## Remaining high-value wiring for next session

These are the obvious, high-visibility spots across the platform where a
`<SummonMascot>` call would be a clear win. Each row names the file, the
topic, the suggested character (by domain), and a starter message that
next-session Bishop can refine. Start-closed pills are the default — keeps
pages uncluttered.

### Tier 1 — Ship next session

| File | Location | Character | Topic | Message stub |
|---|---|---|---|---|
| `pages/museum/Door1Tour.tsx` | Opening tour frame about fairness | **owl** (WHY) | "Why we built Liana Banyan this way" | "The short version is: every existing platform eventually extracts from the people who built it. We wrote the rules so that can't happen here. Not 'won't' — can't. The DNA lock is in the contract." |
| `pages/museum/Door1Tour.tsx` | When the tour hits the Cost+20% frame | **pig** (MATH) | "Cost+20% on a $500 sale" | "Your real cost rides through at actual. Platform adds 20%. On $500 that's $416.67 to you, $83.33 to the platform. The lock means that split cannot widen even if the platform becomes worth a billion dollars." |
| `pages/museum/StewardsPage.tsx` | Stewards intro | **cat** (governance) | "What Stewards do and don't do" | "Stewards hold turn-keys for specific decisions — they don't run the platform, they run the specific moment that needs a turnkey. Every Steward-held key has a matching Frame Lock that prevents unilateral moves." |
| `pages/museum/Archipelago.tsx` | Archipelago map landing | **mouse** (discovery) | "How the 7 islands connect" | "Each island is a distinct part of the platform — HexIsle is the decentralized factory, Marketplace is the commerce layer, etc. The pathways between them are real — stuff made on one island can ship through another." |
| `pages/museum/HelmPage.tsx` | Helm dashboard first visit | **otter** (learning) | "What your Helm is for" | "The Helm is your personal command center — all your projects, all your currencies, all your campaigns, everything you're working on at a glance. Think of it like a ship's helm: you steer from here." |
| `pages/museum/HelmPage.tsx` | Notifications panel | **dog** (trust) | "What earns a notification vs what stays quiet" | "You'll hear from me when money moves, a vote closes, or someone joins a project you own. You won't hear from me about feed-algorithm engagement tricks — we don't run those." |
| `pages/museum/CephasBasement.tsx` | Library entry | **turtle** (story) | "What Cephas is and why it exists" | "Cephas is the platform's library — academic papers, Puddings, Spoonfuls, letters, everything the platform has published. Three depths: skim the stones (Spoonfuls), wade through Puddings, or dive into full papers. You'll earn Marks reading at any depth." |
| `pages/museum/CephasBasement.tsx` | Museum archive banner | **bird** (historian special) | "Why we keep everything" | "The Archive Crow keeps every version of every thing. Deprecated systems, old letters, the three drafts before a paper landed. Nothing vanishes. If you need to see how Liana Banyan looked last March, it's in here." |

### Tier 2 — Nice-to-have

| File | Location | Character | Topic |
|---|---|---|---|
| `pages/museum/TreasureMapScroll.tsx` | Treasure map view | **mouse** | "How the treasure map actually works" |
| `pages/museum/CueCardStudio.tsx` (if exists, else Cue Card creation flow) | Creation form | **fox** (craft) | "What makes a good Cue Card" |
| `pages/museum/CueCardStudio.tsx` | Print button | **rabbit** (mechanics) | "How printing actually happens" |
| `pages/museum/CueCardStudio.tsx` | Distribution stage | **pig** (math) | "What you earn per card" |
| `pages/museum/ProducerBoardPage.tsx` | Producer board intro | **fox** + **rabbit** | "What producers do" / "How the producer queue works" |
| `pages/museum/MissionBriefingsPage.tsx` | Mission briefing page | **deer** (future) | "Where this mission fits the roadmap" |
| `pages/museum/CatapultDashboard.tsx` | Catapult metrics | **rabbit** (mechanics) | "How the Catapult fires" |
| `pages/museum/PrintStudioPage.tsx` | Print studio | **fox** + **rabbit** | "The craft of the print" / "The machine of the print" |
| `pages/museum/PrintApprovalPage.tsx` | Print approval | **cat** (governance) | "What the approval gate checks for" |
| `pages/museum/PioneerProposalsPage.tsx` | Pioneer proposals | **deer** (future) | "What being a Pioneer actually means" |
| `pages/museum/AffiliationBadgesPage.tsx` | Affiliation badges | **bear** (community) | "What affiliations signal" |
| `pages/museum/WardrobeDepartment.tsx` | Wardrobe | **fox** (craft) | "How theming works" |
| `pages/museum/CampaignForge.tsx` | Campaign forge | **rabbit** + **deer** | "How campaigns get built" / "What campaigns are for" |
| `pages/museum/CampaignMapEditor.tsx` | Map editor | **fox** (craft) | "The craft of campaign mapping" |
| `pages/museum/SubmissionsPedestal.tsx` | Submissions | **bear** + **cat** | "Who submits" / "How submissions get judged" |

### Tier 3 — Defer

These are deeper / lower-visibility spots. Wire only if a user specifically gets confused there:
- All the individual Island/District cards inside Archipelago
- The X-Ray panel annotations (specialist per annotation type)
- Individual content pages in Cephas (characters can appear per-paper)
- The Catapult Dashboard sub-panels
- The Rolodex / reciprocal promotion layer
- The RADAR ping system

---

## Pattern to follow when wiring a new summon

```tsx
// 1. Add import at top of the file
import { SummonMascot } from "@/components/museum/SummonMascot";

// 2. Place inline where the explanation topic appears
<SummonMascot
  mascotId="owl"                 // or use domain="why"
  topic="Why Cost+20% is locked forever"
  startClosed                     // always — renders as a muted LRH pill
  message={
    <>
      The body text. Can include <strong>bold</strong>, <em>italic</em>,
      and <code>inline code</code>. Keep it to 2-4 sentences max.
    </>
  }
  helperMessage={
    <>Optional second layer — fine print, caveats, related points.</>
  }
/>
```

**Rules of thumb:**
1. **Match the domain, not the feature.** Numbers → Banker Pig. Logic → Owl. Making → Maker Fox. Safety → Sheepdog. Etc.
2. **Same character can return in the same pipeline.** If Cue Cards has a money moment and a craft moment, you use Pig AND Fox. That's correct — not redundant.
3. **One topic per summon.** If you're tempted to pack two topics in, split into two summons.
4. **Keep `startClosed` on.** Users click to open. Default-open makes pages loud.
5. **Helper message is for second-layer info.** The main message should stand alone; the helper adds depth for users who want more.
6. **Don't explain the mascot.** Users either know them from `/cast` or will learn by encounter. Don't write "The Great Owl, our logic specialist, says..." — just let Owl speak.

---

## Architecture reminders

- **Hosts (2):** LRH (Southern Province), Denken (Northern Province). The `useHost()` hook resolves based on `BuilderModeContext.province`.
- **Domain specialists (12):** owl, pig, rabbit, turtle, cat, fox, bear, dog, otter, mouse, fennec, deer
- **Specials (3):** catsp (Ghost Cat), bird (Archive Crow), hogtemp (The Skeptic)
- **Total: 17 in the registry.**
- **Placeholder art:** All 13 non-host-non-LRH-non-Owl-non-Pig characters use gray sketch tiles until son delivers final art. When art lands, overwrite files in `public/images/mascots/{slug}/{default,hover,xray}.png` and flip `artStatus` from `"placeholder"` to `"final"` in `src/data/mascots.ts`.
- **LRHCharacter** is now a thin wrapper over `Mascot` — existing usages keep working unchanged but are province-aware through `useHost()`.
- **`/cast` route** exists — send users there if they want to meet the whole ensemble.

---

B095 out.
