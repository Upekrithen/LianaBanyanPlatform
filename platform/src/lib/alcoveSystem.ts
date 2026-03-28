/**
 * THE ALCOVE SYSTEM — Progressive Disclosure Hallway
 * ====================================================
 * Landing pages are "alcoves in a hallway" — stopping points
 * where a participant can learn one concept before proceeding.
 *
 * Structure:
 *   Tier 1 (Stops 1-6):   FOUNDATION — What is LB? Currency basics. Membership.
 *   Tier 2 (Stops 7-12):  MECHANICS — Brewster Bonus. Bidding. AVA. Golden Key.
 *   Tier 3 (Stops 13-18): DEPTH — Howey Analysis. Patent Portfolio. Governance.
 *
 * Visual Behavior:
 *   - Unvisited alcove: dimmed, locked icon
 *   - Current alcove: highlighted, glowing border
 *   - Visited alcove: checkmark, changed color/opacity
 *   - Comprehended alcove: star badge (passed questions)
 *
 * Reward Integration:
 *   - Visit an alcove → 1 Mark
 *   - Answer Basic question correctly → 2 Marks
 *   - Answer Applied question correctly → 5 Marks
 *   - Answer Synthesis question correctly → 10 Marks
 *   - Complete a tier (6 alcoves) → Pattern Key (Fledgling/Flight/Murder)
 *   - Complete all 18 → Founder's Forge badge
 *
 * Innovation referenced: Golden Key treasure hunt system
 */

// ============================================================================
// TYPES
// ============================================================================

export type AlcoveTier = 1 | 2 | 3;
export type AlcoveStatus = 'locked' | 'available' | 'visited' | 'comprehended';
export type QuestionType = 'basic' | 'applied' | 'synthesis';
export type PatternKeyLevel = 'fledgling' | 'flight' | 'murder';

export interface AlcoveQuestion {
  id: string;
  type: QuestionType;
  question: string;
  /** For multiple choice */
  options?: string[];
  /** For yes/no */
  isYesNo?: boolean;
  correctAnswer: string;
  /** Marks awarded for correct answer */
  reward: number;
  explanation: string;
}

export interface Alcove {
  id: string;
  /** Position in the hallway (1-18) */
  position: number;
  /** Tier grouping */
  tier: AlcoveTier;
  /** Display title */
  title: string;
  /** One-line description */
  subtitle: string;
  /** Icon/emoji */
  icon: string;
  /** Route path for the landing page */
  route: string;
  /** Brief description shown when hovering */
  preview: string;
  /** Comprehension questions */
  questions: AlcoveQuestion[];
  /** Related innovation numbers */
  innovations: number[];
  /** Related paper/document slug */
  documentSlug?: string;
}

export interface AlcoveProgress {
  alcoveId: string;
  status: AlcoveStatus;
  visitedAt?: string;
  questionsAnswered: string[]; // question IDs answered correctly
  comprehendedAt?: string;
  marksEarned: number;
}

export interface HallwayProgress {
  userId: string;
  alcoves: Record<string, AlcoveProgress>;
  tier1Complete: boolean;
  tier2Complete: boolean;
  tier3Complete: boolean;
  patternKeys: PatternKeyLevel[];
  totalMarksEarned: number;
  foundersForgeBadge: boolean;
}

// ============================================================================
// ALCOVE DEFINITIONS
// ============================================================================

export const ALCOVES: Alcove[] = [
  // ─── TIER 1: FOUNDATION (Stops 1-6) ───
  {
    id: 'what-is-lb',
    position: 1,
    tier: 1,
    title: 'What Is Liana Banyan?',
    subtitle: 'A cooperative platform where everyone benefits',
    icon: '🌳',
    route: '/learn/what-is-lb',
    preview: 'The world\'s first cooperative platform designed so that the more people participate, the more everyone benefits.',
    innovations: [],
    questions: [
      {
        id: 'q1-1',
        type: 'basic',
        question: 'Is Liana Banyan a traditional corporation?',
        isYesNo: true,
        correctAnswer: 'no',
        reward: 2,
        explanation: 'Liana Banyan is a cooperative — owned and governed by its members, not outside parties.',
      },
    ],
  },
  {
    id: 'cost-plus-20',
    position: 2,
    tier: 1,
    title: 'Cost+20%',
    subtitle: 'The constitutional pricing floor',
    icon: '💰',
    route: '/learn/cost-plus-20',
    preview: 'Every creator keeps 83.3% of every sale. The platform takes 16.7%. Forever. Constitutionally locked.',
    innovations: [],
    questions: [
      {
        id: 'q2-1',
        type: 'basic',
        question: 'What percentage does the creator keep under Cost+20%?',
        options: ['50%', '70%', '83.3%', '95%'],
        correctAnswer: '83.3%',
        reward: 2,
        explanation: 'Cost+20% means the platform markup is 20% of cost, giving the creator 83.3% (= 100/120) of the sale price.',
      },
    ],
  },
  {
    id: 'three-currencies',
    position: 3,
    tier: 1,
    title: 'Credits, Marks & Joules',
    subtitle: 'Three currencies, three purposes, one value',
    icon: '⚙️',
    route: '/learn/currencies',
    preview: 'Credits spend. Marks back your work. Joules lock in value forever. All worth the same — earned differently.',
    innovations: [945],
    questions: [
      {
        id: 'q3-1',
        type: 'basic',
        question: 'Can you cash out Credits for US dollars?',
        isYesNo: true,
        correctAnswer: 'no',
        reward: 2,
        explanation: 'Credits are closed-loop platform currency — they buy goods and services inside the system but cannot be converted to cash.',
      },
      {
        id: 'q3-2',
        type: 'applied',
        question: 'What backs Marks?',
        options: ['US dollars', 'Joules locked 1:1', 'Credit card charges', 'Nothing'],
        correctAnswer: 'Joules locked 1:1',
        reward: 5,
        explanation: 'Every Mark is backed by a Joule in your Stake Account. You can\'t offer Marks you haven\'t backed.',
      },
    ],
  },
  {
    id: 'membership',
    position: 4,
    tier: 1,
    title: 'The Five-Dollar Door',
    subtitle: 'Membership costs $5. Period.',
    icon: '🚪',
    route: '/learn/membership',
    preview: '$5 gets you in. Everything else is earned, built, or backed by your own effort.',
    innovations: [],
    questions: [
      {
        id: 'q4-1',
        type: 'basic',
        question: 'How much does Liana Banyan membership cost?',
        options: ['$0 (free)', '$5', '$50', '$500'],
        correctAnswer: '$5',
        reward: 2,
        explanation: 'The barrier to entry is intentionally minimal — $5 — so that anyone can participate.',
      },
    ],
  },
  {
    id: 'sweet-sixteen',
    position: 5,
    tier: 1,
    title: 'The Sweet Sixteen',
    subtitle: 'Sixteen initiatives, one platform',
    icon: '🎯',
    route: '/learn/initiatives',
    preview: 'HexIsle. Let\'s Make Dinner. Rally Group. The Observatory. Sixteen initiatives that work together.',
    innovations: [],
    questions: [
      {
        id: 'q5-1',
        type: 'applied',
        question: 'What connects all sixteen initiatives?',
        options: ['Separate companies', 'Same platform & currency', 'Different websites', 'Independent apps'],
        correctAnswer: 'Same platform & currency',
        reward: 5,
        explanation: 'All sixteen initiatives share the same three-currency system, membership, and cooperative governance.',
      },
    ],
  },
  {
    id: 'as-you-wish',
    position: 6,
    tier: 1,
    title: '"As You Wish"',
    subtitle: 'The universal confirmation phrase',
    icon: '✨',
    route: '/learn/as-you-wish',
    preview: 'Every transaction, every decision, every deployment requires your explicit "As You Wish" to proceed.',
    innovations: [],
    questions: [
      {
        id: 'q6-1',
        type: 'basic',
        question: 'What phrase confirms all transactions on the platform?',
        options: ['I agree', 'Confirm', 'As You Wish', 'Submit'],
        correctAnswer: 'As You Wish',
        reward: 2,
        explanation: '"As You Wish" is the universal confirmation phrase — nothing happens without your explicit consent.',
      },
    ],
  },

  // ─── TIER 2: MECHANICS (Stops 7-12) ───
  {
    id: 'brewster-bonus',
    position: 7,
    tier: 2,
    title: 'The Brewster Bonus',
    subtitle: 'Clear your Marks, get rewarded',
    icon: '🔥',
    route: '/learn/brewster-bonus',
    preview: 'Deploy all your Marks productively, clear your pouch, and receive a tiered loyalty bonus in Credits.',
    innovations: [1424, 1425],
    documentSlug: 'PAPER_BREWSTER_BONUS_MECHANIC',
    questions: [
      {
        id: 'q7-1',
        type: 'basic',
        question: 'Is the Brewster Bonus an investment return?',
        isYesNo: true,
        correctAnswer: 'no',
        reward: 2,
        explanation: 'It\'s a loyalty-driven volume discount passed back as platform currency — not an investment return.',
      },
      {
        id: 'q7-2',
        type: 'applied',
        question: 'What funds the Brewster Bonus?',
        options: ['New member fees', 'Platform reserves', 'Volume discount savings from projects', 'Government grants'],
        correctAnswer: 'Volume discount savings from projects',
        reward: 5,
        explanation: 'The bonus comes from real volume savings — when projects buy in bulk, the savings fund participant rewards.',
      },
      {
        id: 'q7-3',
        type: 'synthesis',
        question: 'Why do bonus rates DECAY at higher tiers instead of increasing?',
        options: [
          'To save money',
          'To prevent wealth concentration and reward participation over accumulation',
          'Because large participants don\'t deserve rewards',
          'Random design choice',
        ],
        correctAnswer: 'To prevent wealth concentration and reward participation over accumulation',
        reward: 10,
        explanation: 'Decaying returns are the structural opposite of speculative dynamics. They ensure the system rewards breadth of participation, not concentration of capital.',
      },
    ],
  },
  {
    id: 'attention-bidding',
    position: 8,
    tier: 2,
    title: 'The Radio Contest',
    subtitle: 'Attention beats capital',
    icon: '📻',
    route: '/learn/bidding',
    preview: '2/3 open bidding + 1/3 reserved for small participants. Show up early, pay attention, win.',
    innovations: [2, 1423],
    questions: [
      {
        id: 'q8-1',
        type: 'applied',
        question: 'What fraction of auction capacity is reserved for small participants?',
        options: ['1/4', '1/3', '1/2', '2/3'],
        correctAnswer: '1/3',
        reward: 5,
        explanation: '1/3 of all capacity is reserved for participants below the capital threshold — guaranteed access regardless of wealth.',
      },
      {
        id: 'q8-2',
        type: 'synthesis',
        question: 'Can small participants ever capture MORE than 1/3 of an auction?',
        isYesNo: true,
        correctAnswer: 'yes',
        reward: 10,
        explanation: 'The 1/3 is a floor, not a ceiling. Small participants can also bid in the open 2/3 tier. If enough show up early, they could theoretically capture 100%.',
      },
    ],
  },
  {
    id: 'anonymous-volume',
    position: 9,
    tier: 2,
    title: 'Anonymous Volume',
    subtitle: 'Dignity in every transaction',
    icon: '👁️',
    route: '/learn/ava',
    preview: 'Charity recipients and paying customers are indistinguishable. Same $10 buys 3x more at volume.',
    innovations: [],
    questions: [
      {
        id: 'q9-1',
        type: 'applied',
        question: 'Why can\'t sellers identify which customers are charity recipients?',
        options: ['Data encryption', 'All orders look the same at volume', 'Legal requirement', 'Customers use fake names'],
        correctAnswer: 'All orders look the same at volume',
        reward: 5,
        explanation: 'When 200 orders arrive as one bulk purchase, individual orders are indistinguishable — preserving dignity.',
      },
    ],
  },
  {
    id: 'golden-key',
    position: 10,
    tier: 2,
    title: 'The Golden Key',
    subtitle: 'Learn, prove, earn',
    icon: '🔑',
    route: '/learn/golden-key',
    preview: 'A treasure hunt through platform knowledge. Answer questions, collect pattern keys, earn Marks and badges.',
    innovations: [],
    questions: [
      {
        id: 'q10-1',
        type: 'basic',
        question: 'What are the three levels of pattern keys?',
        options: ['Bronze/Silver/Gold', 'Fledgling/Flight/Murder', 'Basic/Standard/Advanced', 'Rookie/Pro/Legend'],
        correctAnswer: 'Fledgling/Flight/Murder',
        reward: 2,
        explanation: 'Pattern keys follow the collective nouns for crows: a fledgling (single), a flight (group), a murder (many).',
      },
    ],
  },
  {
    id: 'the-battery',
    position: 11,
    tier: 2,
    title: 'The Battery',
    subtitle: 'Coordinated content dispatch',
    icon: '🎯',
    route: '/learn/battery',
    preview: 'Load posts across all platforms. Arm them. Nothing fires until the Founder says "As You Wish."',
    innovations: [],
    questions: [
      {
        id: 'q11-1',
        type: 'basic',
        question: 'Can The Battery fire posts without the Founder\'s explicit approval?',
        isYesNo: true,
        correctAnswer: 'no',
        reward: 2,
        explanation: 'Nothing fires without explicit "As You Wish" confirmation. The Battery is loaded, armed, then fired only on command.',
      },
    ],
  },
  {
    id: 'matchtrade',
    position: 12,
    tier: 2,
    title: 'MatchTrade',
    subtitle: 'I\'ll babysit if you fix my AC',
    icon: '🤝',
    route: '/learn/matchtrade',
    preview: 'Marks-for-Marks service exchange. Post what you need, post what you offer. Platform matches locally.',
    innovations: [945],
    questions: [
      {
        id: 'q12-1',
        type: 'applied',
        question: 'What guarantees a MatchTrade provider will deliver?',
        options: ['Trust system', 'Joules collateral in Stake Account', 'Legal contract', 'Nothing'],
        correctAnswer: 'Joules collateral in Stake Account',
        reward: 5,
        explanation: 'Every MatchTrade offer is backed by Joules in the provider\'s Stake Account. If they don\'t deliver, the Joules cover the penalty.',
      },
    ],
  },

  // ─── TIER 3: DEPTH (Stops 13-18) ───
  {
    id: 'howey-defense',
    position: 13,
    tier: 3,
    title: 'The Howey Defense',
    subtitle: 'Why this is NOT a security',
    icon: '⚖️',
    route: '/learn/howey',
    preview: 'Four-prong analysis proving Credits, Marks, and Joules fail every test for securities classification.',
    innovations: [1424],
    documentSlug: 'PAPER_BREWSTER_BONUS_MECHANIC',
    questions: [
      {
        id: 'q13-1',
        type: 'synthesis',
        question: 'How many of the four Howey Test prongs does the Brewster Bonus meet?',
        options: ['All four', 'Three', 'One', 'Zero'],
        correctAnswer: 'Zero',
        reward: 10,
        explanation: 'The Brewster Bonus fails ALL FOUR Howey prongs: no investment of money, no common enterprise, no expectation of profits, no reliance on others\' efforts.',
      },
    ],
  },
  {
    id: 'patent-portfolio',
    position: 14,
    tier: 3,
    title: 'The Patent Portfolio',
    subtitle: '1,511 claims, $65 each',
    icon: '📜',
    route: '/learn/patents',
    preview: 'Micro-entity filing at $65 per provisional. 1,511 claims across 10 provisional applications. IP as cooperative asset.',
    innovations: [],
    questions: [
      {
        id: 'q14-1',
        type: 'basic',
        question: 'How much does it cost Liana Banyan to file a provisional patent?',
        options: ['$65', '$650', '$6,500', '$65,000'],
        correctAnswer: '$65',
        reward: 2,
        explanation: 'As a micro-entity, Liana Banyan pays $65 per provisional patent filing — enabling massive IP protection on a bootstrap budget.',
      },
    ],
  },
  {
    id: 'the-300',
    position: 15,
    tier: 3,
    title: 'The 300',
    subtitle: 'Founding member governance',
    icon: '🛡️',
    route: '/learn/the-300',
    preview: 'The first 300 members shape the cooperative\'s constitution. Every voice matters. Democracy at founding.',
    innovations: [],
    questions: [
      {
        id: 'q15-1',
        type: 'applied',
        question: 'Why 300 founding members specifically?',
        options: ['Random number', 'Legal requirement', 'Manageable democratic body for constitutional founding', 'Marketing strategy'],
        correctAnswer: 'Manageable democratic body for constitutional founding',
        reward: 5,
        explanation: '300 is large enough for diverse representation but small enough for meaningful democratic participation in constitutional decisions.',
      },
    ],
  },
  {
    id: 'peace-economics',
    position: 16,
    tier: 3,
    title: 'Peace Economics',
    subtitle: 'Remove causes, remove conflict',
    icon: '🕊️',
    route: '/learn/peace',
    preview: 'When poverty, ignorance, and lack of opportunity are solved structurally, conflict becomes irrational.',
    innovations: [],
    documentSlug: 'PAPER_BOOK_OF_PEACE_MECHANICS',
    questions: [
      {
        id: 'q16-1',
        type: 'synthesis',
        question: 'How does Liana Banyan address poverty differently from traditional charity?',
        options: [
          'Gives more money',
          'Provides infrastructure for self-sustaining resource generation',
          'Partners with governments',
          'Relies on volunteers',
        ],
        correctAnswer: 'Provides infrastructure for self-sustaining resource generation',
        reward: 10,
        explanation: 'Traditional charity provides resources. Liana Banyan provides infrastructure for SELF-SUSTAINING resource generation — independence, not dependency.',
      },
    ],
  },
  {
    id: 'forge-methodology',
    position: 17,
    tier: 3,
    title: 'The Forge',
    subtitle: 'AI-human collaborative innovation',
    icon: '⚒️',
    route: '/learn/forge',
    preview: 'Anvil, fire, bellows, hammer, quenching trough — each is a tool, together they\'re a system.',
    innovations: [1424, 1425, 1423],
    questions: [
      {
        id: 'q17-1',
        type: 'synthesis',
        question: 'In the Forge methodology, what role does the human Founder play vs. the AI?',
        options: [
          'Founder codes, AI reviews',
          'Founder provides intuition/correction/synthesis, AI provides analysis/framework/formalization',
          'AI does everything',
          'They work independently',
        ],
        correctAnswer: 'Founder provides intuition/correction/synthesis, AI provides analysis/framework/formalization',
        reward: 10,
        explanation: 'The Forge methodology pairs human intuition with AI formalization through iterative correction loops — neither could produce the results alone.',
      },
    ],
  },
  {
    id: 'forward-not-left-right',
    position: 18,
    tier: 3,
    title: 'Not Left or Right. Forward.',
    subtitle: 'Beyond political tribalism',
    icon: '➡️',
    route: '/learn/forward',
    preview: 'The platform serves everyone. No political litmus tests. Results over rhetoric. Forward.',
    innovations: [],
    questions: [
      {
        id: 'q18-1',
        type: 'synthesis',
        question: 'Why does Liana Banyan refuse political alignment?',
        options: [
          'Afraid of controversy',
          'Political systems divide; economic systems that serve everyone unite',
          'Legal requirement',
          'No opinion on politics',
        ],
        correctAnswer: 'Political systems divide; economic systems that serve everyone unite',
        reward: 10,
        explanation: 'When a system genuinely benefits ALL participants, political alignment becomes unnecessary. The results speak for themselves.',
      },
    ],
  },
];

// ============================================================================
// REWARD CALCULATIONS
// ============================================================================

export const ALCOVE_REWARDS = {
  visit: 1,           // 1 Mark for visiting an alcove
  basic: 2,           // 2 Marks for correct basic question
  applied: 5,         // 5 Marks for correct applied question
  synthesis: 10,      // 10 Marks for correct synthesis question
  tierComplete: 25,   // 25 Marks for completing a tier (6 alcoves)
  allComplete: 100,   // 100 Marks for completing all 18 alcoves
} as const;

export const PATTERN_KEYS: Record<AlcoveTier, PatternKeyLevel> = {
  1: 'fledgling',
  2: 'flight',
  3: 'murder',
};

/**
 * Calculate total rewards earned for alcove progress.
 */
export function calculateAlcoveRewards(progress: HallwayProgress): number {
  let total = 0;

  for (const alcoveProgress of Object.values(progress.alcoves)) {
    if (alcoveProgress.status === 'visited' || alcoveProgress.status === 'comprehended') {
      total += ALCOVE_REWARDS.visit;
    }
    total += alcoveProgress.marksEarned;
  }

  if (progress.tier1Complete) total += ALCOVE_REWARDS.tierComplete;
  if (progress.tier2Complete) total += ALCOVE_REWARDS.tierComplete;
  if (progress.tier3Complete) total += ALCOVE_REWARDS.tierComplete;
  if (progress.foundersForgeBadge) total += ALCOVE_REWARDS.allComplete;

  return total;
}

/**
 * Get alcoves by tier.
 */
export function getAlcovesByTier(tier: AlcoveTier): Alcove[] {
  return ALCOVES.filter(a => a.tier === tier);
}

/**
 * Check if a tier is complete.
 */
export function isTierComplete(
  tier: AlcoveTier,
  progress: Record<string, AlcoveProgress>,
): boolean {
  const tierAlcoves = getAlcovesByTier(tier);
  return tierAlcoves.every(a => {
    const p = progress[a.id];
    return p && (p.status === 'visited' || p.status === 'comprehended');
  });
}

/**
 * Get the total possible Marks from all alcove questions.
 */
export function getTotalPossibleRewards(): number {
  let total = 0;
  // Visit rewards
  total += ALCOVES.length * ALCOVE_REWARDS.visit;
  // Question rewards
  for (const alcove of ALCOVES) {
    for (const q of alcove.questions) {
      total += q.reward;
    }
  }
  // Tier completion bonuses
  total += 3 * ALCOVE_REWARDS.tierComplete;
  // All complete bonus
  total += ALCOVE_REWARDS.allComplete;
  return total;
}
