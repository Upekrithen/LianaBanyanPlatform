/**
 * GUILD RECRUITING CUE CARDS
 * ===========================
 * Cue cards and deck cards for recruiting Founding Partners and Reference
 * Experts into the 7 founding guilds (NOIDs).
 *
 * Two sets:
 *   1. CUE CARDS — for CueCardLanding pages and Hofund dispatches
 *   2. DECK CARDS — for the Deck Card collection (flip cards)
 *
 * Each guild gets:
 *   - 1 Founding Partner recruiting cue card
 *   - 1 Reference Expert recruiting cue card (shared across guilds)
 *   - 1 Deck Card with The Handshake on the back
 *
 * All SEC-safe language. No speculative-finance or ownership-claim terms.
 */

import { DeckCardData } from '@/components/DeckCard';
import { GUILDS, type GuildId } from '@/lib/guildSystem';

// ─── Cue Card Data (for CueCardLanding / Hofund) ───────────────────────────

export interface GuildCueCard {
  id: string;
  guildId: GuildId;
  title: string;
  subtitle: string;
  front: string;
  back: string;
  category: 'guild-recruiting';
  tags: string[];
  endpoint: string;
}

export const GUILD_RECRUITING_CUE_CARDS: GuildCueCard[] = [
  {
    id: 'guild-forge-partner',
    guildId: 'the-forge',
    title: 'The Forge — Seeking Lead CAD Architect',
    subtitle: 'Shape the geometry. Build the future.',
    front: `🔧 THE FORGE
Guild of Engineering & Design

Seeking: Lead CAD Architect

30 days. 8 conversations. Mutual exploration.
No interviews. No questionnaires.
Just two people figuring out if they
build well together.

You bring the engineering. We bring the stage.
Same terms as the Founder. Period.

lianabanyan.com/guilds/hub`,
    back: `The Handshake — 30-Day Mutual Exploration

WHAT YOU GET:
• 100 Marks for completing the 30 days
• 2 conversations per week, max 3 hours each
• Full transparency — terms set before we speak
• Three outcomes: Founding Partner, Reference
  Expert, or No Fit (no hard feelings)

THE FORGE FOCUS:
CAD/CAM, 3D printing, mechanical design,
HexIsle terrain systems, manufacturing
innovation.

YOUR PARTNER ROLE:
Shape the Hexel geometry pipeline from
Fusion 360 to production.

Walk in. Look around. Sit where you want.
Help Each Other Help Ourselves.`,
    category: 'guild-recruiting',
    tags: ['guild', 'forge', 'cad', 'engineering', 'partner', 'handshake'],
    endpoint: '/guilds/hub',
  },
  {
    id: 'guild-scale-partner',
    guildId: 'scale',
    title: 'The Scale — Seeking Lead Legal Architect',
    subtitle: 'Build the framework. Protect the many.',
    front: `⚖️ THE SCALE
Guild of Law & Governance

Seeking: Lead Legal Architect

30 days. 8 conversations. Mutual exploration.
No billable hours games. No partner-track
politics. Just honest legal architecture
for a cooperative that means it.

Defense Klaus needs its first lawyer.
The Keep needs its constitution.

lianabanyan.com/guilds/hub`,
    back: `The Handshake — 30-Day Mutual Exploration

WHAT YOU GET:
• 100 Marks for completing the 30 days
• 2 conversations per week, max 3 hours each
• Full transparency — terms set before we speak
• Three outcomes: Founding Partner, Reference
  Expert, or No Fit (no hard feelings)

THE SCALE FOCUS:
Legal architecture, cooperative law,
Defense Klaus fund, IP protection,
Harper Guild ethics oversight.

YOUR PARTNER ROLE:
Design the legal framework that protects
members, not exploits them.

Walk in. Look around. Sit where you want.
Help Each Other Help Ourselves.`,
    category: 'guild-recruiting',
    tags: ['guild', 'scale', 'legal', 'law', 'defense-klaus', 'partner', 'handshake'],
    endpoint: '/guilds/hub',
  },
  {
    id: 'guild-engine-room-partner',
    guildId: 'engine_room',
    title: 'The Engine Room — Seeking Lead Manufacturing Partner',
    subtitle: 'From prototype to production. Decentralized.',
    front: `🏭 THE ENGINE ROOM
Guild of Manufacturing & Production

Seeking: Lead Manufacturing Partner

30 days. 8 conversations. Mutual exploration.
No corporate supply chain politics.
Decentralized production. Local Nodes.
Cost+20% manufacturing that works.

The factory floor needs its foreman.

lianabanyan.com/guilds/hub`,
    back: `The Handshake — 30-Day Mutual Exploration

WHAT YOU GET:
• 100 Marks for completing the 30 days
• 2 conversations per week, max 3 hours each
• Full transparency — terms set before we speak
• Three outcomes: Founding Partner, Reference
  Expert, or No Fit (no hard feelings)

THE ENGINE ROOM FOCUS:
3D printing, injection molding, CNC,
decentralized Node manufacturing,
quality control, supply chain.

YOUR PARTNER ROLE:
Build the manufacturing network
from garage to factory floor.

Walk in. Look around. Sit where you want.
Help Each Other Help Ourselves.`,
    category: 'guild-recruiting',
    tags: ['guild', 'engine-room', 'manufacturing', 'production', '3d-printing', 'partner', 'handshake'],
    endpoint: '/guilds/hub',
  },
  {
    id: 'guild-war-table-partner',
    guildId: 'war_table',
    title: 'The War Table — Seeking Lead Game Architect',
    subtitle: 'Roll the dice. Shape the world.',
    front: `🎲 THE WAR TABLE
Guild of Gaming & Strategy

Seeking: Lead Game Architect

30 days. 8 conversations. Mutual exploration.
Not a AAA studio interview. Not a
recruiter pipeline. Just honest talk
about hex terrain, game mechanics,
and building something people play.

The table needs its Game Master.

lianabanyan.com/guilds/hub`,
    back: `The Handshake — 30-Day Mutual Exploration

WHAT YOU GET:
• 100 Marks for completing the 30 days
• 2 conversations per week, max 3 hours each
• Full transparency — terms set before we speak
• Three outcomes: Founding Partner, Reference
  Expert, or No Fit (no hard feelings)

THE WAR TABLE FOCUS:
Tabletop gaming, hex terrain systems,
BattleTech/wargaming compatibility,
game design, community tournaments.

YOUR PARTNER ROLE:
Design game systems that make HexIsle
the universal hex platform.

Walk in. Look around. Sit where you want.
Help Each Other Help Ourselves.`,
    category: 'guild-recruiting',
    tags: ['guild', 'war-table', 'gaming', 'tabletop', 'battletech', 'partner', 'handshake'],
    endpoint: '/guilds/hub',
  },
  {
    id: 'guild-ledger-partner',
    guildId: 'ledger',
    title: 'The Ledger — Seeking Lead Financial Architect',
    subtitle: 'Three currencies. Zero exploitation.',
    front: `📊 THE LEDGER
Guild of Finance & Economics

Seeking: Lead Financial Architect

30 days. 8 conversations. Mutual exploration.
No Wall Street games. No extraction.
Credits, Marks, and Joules — a three-
currency system where 83.3% goes to
the people who did the work.

The books need their keeper.

lianabanyan.com/guilds/hub`,
    back: `The Handshake — 30-Day Mutual Exploration

WHAT YOU GET:
• 100 Marks for completing the 30 days
• 2 conversations per week, max 3 hours each
• Full transparency — terms set before we speak
• Three outcomes: Founding Partner, Reference
  Expert, or No Fit (no hard feelings)

THE LEDGER FOCUS:
Three-currency economics, Cost+20%
pricing, transparent ledger, cooperative
finance, MSA management, VSL operations.

YOUR PARTNER ROLE:
Architect the financial systems that
keep the cooperative honest.

Walk in. Look around. Sit where you want.
Help Each Other Help Ourselves.`,
    category: 'guild-recruiting',
    tags: ['guild', 'ledger', 'finance', 'economics', 'credits', 'marks', 'joules', 'partner', 'handshake'],
    endpoint: '/guilds/hub',
  },
  {
    id: 'guild-crows-nest-partner',
    guildId: 'crows_nest',
    title: "The Crow's Nest — Seeking Lead R&D Partner",
    subtitle: 'See further. Build the impossible.',
    front: `🔭 THE CROW'S NEST
Guild of Research & Development

Seeking: Lead R&D Partner

30 days. 8 conversations. Mutual exploration.
Not a corporate R&D budget pitch.
Not a grant application. Just honest
exploration of what's possible when
research serves people, not margins.

The lookout needs its first mate.

lianabanyan.com/guilds/hub`,
    back: `The Handshake — 30-Day Mutual Exploration

WHAT YOU GET:
• 100 Marks for completing the 30 days
• 2 conversations per week, max 3 hours each
• Full transparency — terms set before we speak
• Three outcomes: Founding Partner, Reference
  Expert, or No Fit (no hard feelings)

THE CROW'S NEST FOCUS:
Innovation pipeline, 2,473 patent claims,
academic paper publication, IP protection,
Alchemist's Lab prototyping.

YOUR PARTNER ROLE:
Lead the innovation pipeline from
concept to provisional patent filing.

Walk in. Look around. Sit where you want.
Help Each Other Help Ourselves.`,
    category: 'guild-recruiting',
    tags: ['guild', 'crows-nest', 'research', 'development', 'patents', 'innovation', 'partner', 'handshake'],
    endpoint: '/guilds/hub',
  },
  {
    id: 'guild-quarterdeck-partner',
    guildId: 'quarterdeck',
    title: 'The Quarterdeck — Seeking Chief of Staff',
    subtitle: 'Lead the crew. Run the ship.',
    front: `🚢 THE QUARTERDECK
Guild of Leadership & Operations

Seeking: Chief of Staff

30 days. 8 conversations. Mutual exploration.
Not a LinkedIn recruiter message.
Not a corporate ladder. A real
conversation about running a cooperative
that serves 1,540+ innovations.

The bridge needs its first officer.

lianabanyan.com/guilds/hub`,
    back: `The Handshake — 30-Day Mutual Exploration

WHAT YOU GET:
• 100 Marks for completing the 30 days
• 2 conversations per week, max 3 hours each
• Full transparency — terms set before we speak
• Three outcomes: Founding Partner, Reference
  Expert, or No Fit (no hard feelings)

THE QUARTERDECK FOCUS:
Operations, HR, corporate governance,
C-suite management, Node coordination,
Steward Council oversight.

YOUR PARTNER ROLE:
Run the daily operations so the Founder
can focus on building.

Walk in. Look around. Sit where you want.
Help Each Other Help Ourselves.`,
    category: 'guild-recruiting',
    tags: ['guild', 'quarterdeck', 'leadership', 'operations', 'c-suite', 'partner', 'handshake'],
    endpoint: '/guilds/hub',
  },
];

// ─── The Handshake Overview Cue Card ────────────────────────────────────────

export const HANDSHAKE_CUE_CARD: GuildCueCard = {
  id: 'the-handshake',
  guildId: 'the-forge', // generic, not guild-specific
  title: 'The Handshake',
  subtitle: '30 days. Mutual exploration. No games.',
  front: `🤝 THE HANDSHAKE
30-Day Mutual Exploration

This is not a job interview.
This is how we find out if we're
good for each other.

• 30 days
• 8 conversations (2/week)
• Max 3 hours each
• 100 Marks earned
• Terms set BEFORE we speak

Three outcomes:
✅ Founding Partner
🔵 Reference Expert
⬜ No Fit (keep your Marks)

lianabanyan.com/guilds/hub`,
  back: `Why The Handshake?

I despise being forced to choose
before I even know I want to sit down.

So I won't do that to you.

Walk in. Look around. Sit where you want.
We'll talk. If it works, we keep going.
If not, no hard feelings.

YOUR MARKS ARE EARNED:
100 Marks for completing all 8 sessions.
These are contribution records — evidence
of time given and value exchanged.

THE FOUNDER'S COMMITMENT:
"I will give you my full attention for
every conversation. Your time is sacred.
If I can't respect that, I have no
business asking for it."

— Jonathan Jones, Founder`,
  category: 'guild-recruiting',
  tags: ['handshake', 'recruiting', 'guilds', 'mutual-exploration', '30-day'],
  endpoint: '/guilds/hub',
};

// ─── Deck Cards (Flip Cards) for Guild Recruiting ───────────────────────────

function buildGuildDeckCard(
  guildId: GuildId,
  cardCode: string,
  frontIcon: string,
  borderColor: string,
): DeckCardData {
  const guild = GUILDS.find(g => g.id === guildId);
  if (!guild) throw new Error(`Guild not found: ${guildId}`);

  const partnerPos = guild.openPositions.find(p => p.type === 'founding_partner');

  return {
    id: `guild-recruit-${guildId}`,
    cardCode,
    name: `${guild.name} — Guild Recruit`,
    rarity: 'rare',
    frontTitle: guild.name,
    frontSubtitle: guild.motto,
    frontIcon,
    frontImageUrl: undefined,
    backTitle: `Seeking: ${guild.partnerRole}`,
    backInstructions: `${guild.partnerDescription}

The Handshake — 30-Day Mutual Exploration:
• 8 conversations (2 per week, max 3 hours)
• 100 Marks for completion
• Terms locked before first conversation
• Three outcomes: Partner, Expert, or No Fit

Compensation: ${partnerPos?.marksCompensation || 'See guild details'}

${guild.focus}`,
    backDestination: '/guilds/hub',
    backAction: 'Start The Handshake',
    borderColor,
    isConsumable: false,
  };
}

export const GUILD_DECK_CARDS: DeckCardData[] = [
  buildGuildDeckCard('the-forge', 'NOID-001', '🔧', 'amber'),
  buildGuildDeckCard('the-scale', 'NOID-002', '⚖️', 'indigo'),
  buildGuildDeckCard('the-engine-room', 'NOID-003', '🏭', 'red'),
  buildGuildDeckCard('the-war-table', 'NOID-004', '🎲', 'purple'),
  buildGuildDeckCard('the-ledger', 'NOID-005', '📊', 'emerald'),
  buildGuildDeckCard('the-crows-nest', 'NOID-006', '🔭', 'sky'),
  buildGuildDeckCard('the-quarterdeck', 'NOID-007', '🚢', 'red'),
];

// The Handshake as a Deck Card
export const HANDSHAKE_DECK_CARD: DeckCardData = {
  id: 'the-handshake-protocol',
  cardCode: 'HSHK-001',
  name: 'The Handshake Protocol',
  rarity: 'legendary',
  frontTitle: 'The Handshake',
  frontSubtitle: '30-Day Mutual Exploration',
  frontIcon: '🤝',
  frontImageUrl: undefined,
  backTitle: 'Walk In. Look Around. Sit Where You Want.',
  backInstructions: `This is not a job interview. This is how we find out if we're good for each other.

• 30 days, 8 conversations
• 2 per week, max 3 hours each
• 100 Marks earned for completion
• Terms set in stone BEFORE we speak

Three Possible Outcomes:
✅ Founding Partner — Core team. Deep collaboration.
🔵 Reference Expert — Guild standing. Growing role.
⬜ No Fit — No hard feelings. Keep your Marks.

"Your time is sacred. If I can't respect that, I have no business asking for it." — The Founder`,
  backDestination: '/guilds/hub',
  backAction: 'View All Guilds',
  borderColor: 'amber',
  isConsumable: false,
};

// All guild + handshake deck cards for easy import
export const ALL_GUILD_DECK_CARDS: DeckCardData[] = [
  ...GUILD_DECK_CARDS,
  HANDSHAKE_DECK_CARD,
];

// ─── CueCardLanding Integration ─────────────────────────────────────────────
// These are in the format matching CueCardLanding.tsx's CueCardData interface
// for use in the /cue/:cardId route system

export const GUILD_LANDING_CARDS: Record<string, {
  id: string;
  title: string;
  tagline: string;
  content: string;
  destination: string;
  destinationLabel: string;
  color: string;
  iconEmoji: string; // emoji since we can't import React components in a data file cleanly
  benefits: string[];
}> = {
  'guild-forge': {
    id: 'guild-forge',
    title: 'The Forge — Engineering & Design',
    tagline: 'Shape the geometry. Build the future.',
    content: 'The Forge guild seeks engineers, designers, and makers who want to shape the HexIsle platform from CAD to production. Seeking a Lead CAD Architect through The Handshake — 30 days of mutual exploration.',
    destination: '/guilds/hub',
    destinationLabel: 'Meet The Guilds',
    color: 'from-amber-500/30 to-orange-500/20',
    iconEmoji: '🔧',
    benefits: [
      '100 Marks for completing The Handshake',
      'Shape the Hexel geometry pipeline',
      'Same terms as the Founder',
      'Founding Partner or Reference Expert path',
    ],
  },
  'guild-scale': {
    id: 'guild-scale',
    title: 'The Scale — Law & Governance',
    tagline: 'Build the framework. Protect the many.',
    content: 'The Scale guild needs legal architects who believe protection should be a right, not a luxury. Seeking a Lead Legal Architect through The Handshake — 30 days of mutual exploration.',
    destination: '/guilds/hub',
    destinationLabel: 'Meet The Guilds',
    color: 'from-indigo-500/30 to-blue-500/20',
    iconEmoji: '⚖️',
    benefits: [
      '100 Marks for completing The Handshake',
      'Architect Defense Klaus legal framework',
      'Harper Guild ethics oversight',
      'Founding Partner or Reference Expert path',
    ],
  },
  'guild-engine-room': {
    id: 'guild-engine-room',
    title: 'The Engine Room — Manufacturing',
    tagline: 'From prototype to production. Decentralized.',
    content: 'The Engine Room guild is building a decentralized manufacturing network — local Nodes, Cost+20% pricing, quality at scale. Seeking a Lead Manufacturing Partner through The Handshake.',
    destination: '/guilds/hub',
    destinationLabel: 'Meet The Guilds',
    color: 'from-red-500/30 to-rose-500/20',
    iconEmoji: '🏭',
    benefits: [
      '100 Marks for completing The Handshake',
      'Build the decentralized Node network',
      '3D printing to injection molding pipeline',
      'Founding Partner or Reference Expert path',
    ],
  },
  'guild-war-table': {
    id: 'guild-war-table',
    title: 'The War Table — Gaming & Strategy',
    tagline: 'Roll the dice. Shape the world.',
    content: 'The War Table guild designs game systems for HexIsle — the universal hex platform compatible with BattleTech, wargaming, and tabletop communities. Seeking a Lead Game Architect.',
    destination: '/guilds/hub',
    destinationLabel: 'Meet The Guilds',
    color: 'from-purple-500/30 to-violet-500/20',
    iconEmoji: '🎲',
    benefits: [
      '100 Marks for completing The Handshake',
      'Design game systems for universal hex platform',
      'Community tournaments and events',
      'Founding Partner or Reference Expert path',
    ],
  },
  'guild-ledger': {
    id: 'guild-ledger',
    title: 'The Ledger — Finance & Economics',
    tagline: 'Three currencies. Zero exploitation.',
    content: 'The Ledger guild architects the three-currency system — Credits, Marks, and Joules — where 83.3% goes to creators. Seeking a Lead Financial Architect through The Handshake.',
    destination: '/guilds/hub',
    destinationLabel: 'Meet The Guilds',
    color: 'from-emerald-500/30 to-green-500/20',
    iconEmoji: '📊',
    benefits: [
      '100 Marks for completing The Handshake',
      'Design the three-currency economics',
      'Cost+20% transparent pricing system',
      'Founding Partner or Reference Expert path',
    ],
  },
  'guild-crows-nest': {
    id: 'guild-crows-nest',
    title: "The Crow's Nest — Research & Development",
    tagline: 'See further. Build the impossible.',
    content: "The Crow's Nest guild runs the innovation pipeline — 2,473 patent claims, academic publications, and the Alchemist's Lab. Seeking a Lead R&D Partner through The Handshake.",
    destination: '/guilds/hub',
    destinationLabel: 'Meet The Guilds',
    color: 'from-sky-500/30 to-cyan-500/20',
    iconEmoji: '🔭',
    benefits: [
      '100 Marks for completing The Handshake',
      'Lead the 2,473 patent claim pipeline',
      'Academic paper publication channel',
      'Founding Partner or Reference Expert path',
    ],
  },
  'guild-quarterdeck': {
    id: 'guild-quarterdeck',
    title: 'The Quarterdeck — Leadership & Operations',
    tagline: 'Lead the crew. Run the ship.',
    content: 'The Quarterdeck guild runs the cooperative — operations, HR, C-suite management, Node coordination. Seeking a Chief of Staff through The Handshake — 30 days of mutual exploration.',
    destination: '/guilds/hub',
    destinationLabel: 'Meet The Guilds',
    color: 'from-red-500/30 to-orange-500/20',
    iconEmoji: '🚢',
    benefits: [
      '100 Marks for completing The Handshake',
      'Run daily operations for 16 initiatives',
      'Steward Council & Node coordination',
      'Founding Partner or Reference Expert path',
    ],
  },
  'the-handshake': {
    id: 'the-handshake',
    title: 'The Handshake — 30-Day Mutual Exploration',
    tagline: 'Not a job interview. How we find out if we\'re good for each other.',
    content: 'Walk in. Look around. Sit where you want. 30 days, 8 conversations, 100 Marks. Terms set in stone before we speak. Three outcomes: Founding Partner, Reference Expert, or No Fit — no hard feelings.',
    destination: '/guilds/hub',
    destinationLabel: 'Meet The Guilds',
    color: 'from-amber-500/30 to-yellow-500/20',
    iconEmoji: '🤝',
    benefits: [
      '30 days, 8 conversations (2/week)',
      'Max 3 hours per session, max 24 total',
      '100 Marks earned for completion',
      'Terms locked before first conversation',
    ],
  },
};

// ─── Helper Functions ───────────────────────────────────────────────────────

/** Get a guild recruiting cue card by guild ID */
export function getGuildCueCard(guildId: GuildId): GuildCueCard | undefined {
  return GUILD_RECRUITING_CUE_CARDS.find(c => c.guildId === guildId);
}

/** Get a guild deck card by guild ID */
export function getGuildDeckCard(guildId: GuildId): DeckCardData | undefined {
  return GUILD_DECK_CARDS.find(c => c.id === `guild-recruit-${guildId}`);
}

/** Get all guild IDs that have recruiting cards */
export function getRecruitingGuildIds(): GuildId[] {
  return GUILD_RECRUITING_CUE_CARDS.map(c => c.guildId);
}
