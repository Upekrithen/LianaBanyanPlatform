// MoneyPenny Q&A Intelligence Service
// Routes incoming platform questions to AI for answering, with Mark rewards for novel questions.
//
// REWARD STRUCTURE (all rewards are FOUNDER MARKS — cannot fund production, essentials only):
//   5 Founder Marks  — worthwhile novel question (never asked before)
//  25 Founder Marks  — 5x bonus if asker follows up and engages with the response
//  50 Founder Marks  — 10x bonus if asker becomes a member AND sends 5 Cue Cards
//
// Founder Marks CANNOT be used for production funding (e.g., business cards).
// Only Backed Marks (Joule-collateralized) can fund production.
// See notCentsEconomy.ts for full Mark subtype rules.

import { supabase } from "@/integrations/supabase/client";

// ─── Interfaces ───────────────────────────────────────────────────────

export interface QAEntry {
  id: string;
  questionText: string;
  answerText: string;
  askerName: string;
  askerEmail?: string;
  channel: 'website' | 'social_media' | 'email' | 'in_platform' | 'discord';
  classification: 'worthwhile' | 'duplicate' | 'throwaway' | 'flamer' | 'troll' | 'bot';
  isNovel: boolean;
  marksAwarded: number;
  followUpReceived: boolean;
  followUpMarksAwarded: number;
  memberConversionBonus: number; // 50 Founder Marks if they become member + send 5 Cue Cards
  becameMember: boolean;
  cueCardsSent: number; // must reach 5 for 10x bonus
  followUpText?: string;
  aiResponder: 'rook' | 'knight' | 'bishop' | 'pawn' | 'moneypenny';
  status: 'pending_review' | 'approved' | 'rejected' | 'sent' | 'followed_up';
  similarQuestionIds: string[];
  createdAt: string;
  reviewedAt?: string;
  sentAt?: string;
  followUpAt?: string;
}

export interface QAMilestoneReport {
  milestone: number;
  reachedAt: string;
  totalQuestions: number;
  worthwhileCount: number;
  worthwhilePct: number;
  duplicateCount: number;
  throwawayCount: number;
  flamerCount: number;
  trollCount: number;
  botCount: number;
  followUpRate: number;
  totalMarksAwarded: number;
  topQuestionCategories: { category: string; count: number }[];
  avgResponseTime: string;
}

export interface QAStats {
  totalQuestions: number;
  pendingReview: number;
  worthwhile: number;
  novel: number;
  followUps: number;
  totalMarksAwarded: number;
  nextMilestone: number;
  progressToMilestone: number;
}

export interface QAFilters {
  status?: QAEntry['status'];
  classification?: QAEntry['classification'];
  channel?: QAEntry['channel'];
  aiResponder?: QAEntry['aiResponder'];
  search?: string;
}

// ─── Reward Constants (Founder Marks ONLY — cannot fund production) ──
export const QA_REWARDS = {
  NOVEL_QUESTION: 5,          // Worthwhile + never asked before
  FOLLOW_UP_BONUS: 25,        // 5x if they engage with the response
  MEMBER_CONVERSION_BONUS: 50, // 10x if they become member + send 5 Cue Cards
  CUE_CARDS_REQUIRED: 5,       // Must send this many for conversion bonus
  MARK_TYPE: 'founder' as const, // All rewards are Founder Marks
} as const;

// ─── Sample Data ──────────────────────────────────────────────────────

export const SAMPLE_QA_ENTRIES: QAEntry[] = [
  {
    id: 'qa-001',
    questionText: 'How does the three-currency system work? I understand Credits but what are Marks and Joules?',
    answerText: 'Great question! Credits are purchased with fiat ($1 = 1 Credit) and used universally within the platform. Marks are effort-debt currency — you earn them through participation and they can be used for essentials like food and medical. Joules are surplus storage with a "forever stamp" mechanic that locks the exchange rate at purchase time. All three hold equal value: 1 Credit = 1 Mark = 1 Joule.',
    askerName: 'Sarah Chen',
    askerEmail: 'sarah.chen@example.com',
    channel: 'website',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: true,
    followUpMarksAwarded: 25,
    followUpText: 'That makes sense! So if I earn Marks through bounties, I can spend them on groceries through the platform?',
    aiResponder: 'bishop',
    status: 'followed_up',
    similarQuestionIds: [],
    createdAt: '2026-03-10T09:15:00Z',
    reviewedAt: '2026-03-10T09:45:00Z',
    sentAt: '2026-03-10T10:00:00Z',
    followUpAt: '2026-03-10T14:30:00Z',
  },
  {
    id: 'qa-002',
    questionText: 'What is the Cost+20 pricing model?',
    answerText: 'Cost+20 is our reciprocity-based pricing law. Sellers set their own prices with a floor of cost plus 20%. This margin is a dollar-for-dollar sacrifice that translates into purchasing power for buyers across the cooperative. It ensures fair pricing while sustaining the ecosystem.',
    askerName: 'Marcus Williams',
    channel: 'in_platform',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'rook',
    status: 'sent',
    similarQuestionIds: [],
    createdAt: '2026-03-10T11:20:00Z',
    reviewedAt: '2026-03-10T11:35:00Z',
    sentAt: '2026-03-10T11:40:00Z',
  },
  {
    id: 'qa-003',
    questionText: 'How do I make money on this platform?',
    answerText: 'There are many paths. You can complete bounties for Marks, sell products in the Marketplace, become a Steward managing campaigns, join manufacturing Crew Calls, or build your XP Score through quality contributions. The key principle is that value comes from demonstrated effort and judgment, not speculation.',
    askerName: 'Jake Torres',
    askerEmail: 'jake.t@example.com',
    channel: 'social_media',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: true,
    followUpMarksAwarded: 25,
    followUpText: 'Interesting — so the bounty system rewards actual work? How do I find bounties that match my skills?',
    aiResponder: 'moneypenny',
    status: 'followed_up',
    similarQuestionIds: [],
    createdAt: '2026-03-11T08:00:00Z',
    reviewedAt: '2026-03-11T08:20:00Z',
    sentAt: '2026-03-11T08:25:00Z',
    followUpAt: '2026-03-11T15:10:00Z',
  },
  {
    id: 'qa-004',
    questionText: 'How do I make money on this platform?',
    answerText: 'See our previous answer to this question (linked). In short: bounties, marketplace sales, steward campaigns, crew calls, and XP-based progression.',
    askerName: 'Anonymous User',
    channel: 'website',
    classification: 'duplicate',
    isNovel: false,
    marksAwarded: 0,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'pawn',
    status: 'sent',
    similarQuestionIds: ['qa-003'],
    createdAt: '2026-03-11T14:30:00Z',
    reviewedAt: '2026-03-11T14:45:00Z',
    sentAt: '2026-03-11T14:50:00Z',
  },
  {
    id: 'qa-005',
    questionText: 'this is stupid lol',
    answerText: '',
    askerName: 'throwaway123',
    channel: 'discord',
    classification: 'throwaway',
    isNovel: false,
    marksAwarded: 0,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'moneypenny',
    status: 'rejected',
    similarQuestionIds: [],
    createdAt: '2026-03-11T16:00:00Z',
  },
  {
    id: 'qa-006',
    questionText: 'What is the BandWagon system and how does backing projects work?',
    answerText: 'BandWagon lets you back projects with your Marks. When a project succeeds, you earn increased Service Allocation Authority (SAA), which gives you a larger budget to back future projects. This is NOT investment return — it is earned authority to allocate cooperative resources based on demonstrated judgment.',
    askerName: 'Diana Reeves',
    askerEmail: 'diana.r@example.com',
    channel: 'email',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: true,
    followUpMarksAwarded: 25,
    followUpText: 'So my track record of backing successful projects earns me more influence? That is a clever incentive design.',
    aiResponder: 'bishop',
    status: 'followed_up',
    similarQuestionIds: [],
    createdAt: '2026-03-12T10:00:00Z',
    reviewedAt: '2026-03-12T10:15:00Z',
    sentAt: '2026-03-12T10:20:00Z',
    followUpAt: '2026-03-12T18:00:00Z',
  },
  {
    id: 'qa-007',
    questionText: 'Is this a crypto scam? Sounds like a ponzi scheme.',
    answerText: '',
    askerName: 'CryptoSkeptic99',
    channel: 'social_media',
    classification: 'troll',
    isNovel: false,
    marksAwarded: 0,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'moneypenny',
    status: 'rejected',
    similarQuestionIds: [],
    createdAt: '2026-03-12T12:00:00Z',
  },
  {
    id: 'qa-008',
    questionText: 'What are the requirements for Tereno Certification for HexIsle pieces?',
    answerText: 'Tereno Certified is the gold standard. A piece must meet ALL six requirements: lithographic manufacturing, compliant mechanisms only (no magnets/electronics), cost under ceiling, 60mm flat-to-flat dimensions, water-safe materials, and full stack compatibility with the definitive Hexel piece grammar.',
    askerName: 'Maker Mike',
    askerEmail: 'mike@makerspace.org',
    channel: 'in_platform',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'knight',
    status: 'sent',
    similarQuestionIds: [],
    createdAt: '2026-03-12T14:00:00Z',
    reviewedAt: '2026-03-12T14:10:00Z',
    sentAt: '2026-03-12T14:15:00Z',
  },
  {
    id: 'qa-009',
    questionText: 'YOU PEOPLE ARE DESTROYING AMERICA WITH YOUR SOCIALIST GARBAGE',
    answerText: '',
    askerName: 'PatriotEagle1776',
    channel: 'email',
    classification: 'flamer',
    isNovel: false,
    marksAwarded: 0,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'moneypenny',
    status: 'rejected',
    similarQuestionIds: [],
    createdAt: '2026-03-12T16:30:00Z',
  },
  {
    id: 'qa-010',
    questionText: 'How does the XP Score system calculate reputation?',
    answerText: 'XP is multiplicative: for bounties, XP = Accomplishment Score x Bounty Points. For product creators, XP = price x preorder volume x (quality_score / 5.0). Quality acts as a fraction, so total is always less than price x volume. XP is cumulative and never decreases. Everyone starts at 100 reputation, with XP building on top.',
    askerName: 'Lena Park',
    channel: 'website',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: true,
    followUpMarksAwarded: 25,
    followUpText: 'The STAMP verification requirement is interesting — so you cannot rate your own work?',
    aiResponder: 'rook',
    status: 'followed_up',
    similarQuestionIds: [],
    createdAt: '2026-03-13T09:00:00Z',
    reviewedAt: '2026-03-13T09:20:00Z',
    sentAt: '2026-03-13T09:25:00Z',
    followUpAt: '2026-03-13T16:45:00Z',
  },
  {
    id: 'qa-011',
    questionText: 'buy cheap viagra online www dot spam dot com',
    answerText: '',
    askerName: 'bot_user_38291',
    channel: 'website',
    classification: 'bot',
    isNovel: false,
    marksAwarded: 0,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'moneypenny',
    status: 'rejected',
    similarQuestionIds: [],
    createdAt: '2026-03-13T03:22:00Z',
  },
  {
    id: 'qa-012',
    questionText: 'Can I use HexIsle pieces with 3D-printed designs from my own printer?',
    answerText: 'Yes! Third-party designs fall under the HexIsle Compatible tier (Tier 4). FDM/desktop extrusion prints typically qualify for Tier 3-4. You can submit designs for tier classification through the Piggy-Back Protocol and earn IP ledger entry plus tier-scaled deferred payment for design services rendered.',
    askerName: 'PrinterPro',
    askerEmail: 'printerpro@gmail.com',
    channel: 'discord',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'pawn',
    status: 'sent',
    similarQuestionIds: [],
    createdAt: '2026-03-13T11:15:00Z',
    reviewedAt: '2026-03-13T11:30:00Z',
    sentAt: '2026-03-13T11:35:00Z',
  },
  {
    id: 'qa-013',
    questionText: 'What is a Steward and how do I become one?',
    answerText: 'A Steward is a project/campaign manager who pledges their own Marks as skin in the game and manages the project end-to-end. You progress through tiers: Apprentice, Journeyman, Master Steward, Grand Steward. Pledged Marks are escrowed per-project — released on success with proportional surplus, absorbed on failure.',
    askerName: 'Rachel Kim',
    channel: 'in_platform',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'bishop',
    status: 'approved',
    similarQuestionIds: [],
    createdAt: '2026-03-14T08:30:00Z',
    reviewedAt: '2026-03-14T09:00:00Z',
  },
  {
    id: 'qa-014',
    questionText: 'What is a steward?',
    answerText: 'A Steward manages projects on the platform, pledging their own Marks for accountability. See our detailed answer linked below.',
    askerName: 'NewUser42',
    channel: 'website',
    classification: 'duplicate',
    isNovel: false,
    marksAwarded: 0,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'moneypenny',
    status: 'sent',
    similarQuestionIds: ['qa-013'],
    createdAt: '2026-03-14T15:00:00Z',
    reviewedAt: '2026-03-14T15:10:00Z',
    sentAt: '2026-03-14T15:15:00Z',
  },
  {
    id: 'qa-015',
    questionText: 'How does the Coverage Minutes system prevent people from dominating conversations?',
    answerText: 'The Muffled Rule gates speaking by listening. You earn coverage minutes in 3-minute chunks with a 180-minute cap and 90-day expiry. To speak, you must first listen. This ensures balanced participation and prevents any single voice from monopolizing discourse.',
    askerName: 'Community Builder',
    askerEmail: 'builder@community.org',
    channel: 'email',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: true,
    followUpMarksAwarded: 25,
    followUpText: 'So this is like a conversation economy? You spend listening time to earn speaking time?',
    aiResponder: 'rook',
    status: 'followed_up',
    similarQuestionIds: [],
    createdAt: '2026-03-14T10:00:00Z',
    reviewedAt: '2026-03-14T10:20:00Z',
    sentAt: '2026-03-14T10:25:00Z',
    followUpAt: '2026-03-14T19:00:00Z',
  },
  {
    id: 'qa-016',
    questionText: 'Is there a free trial or do I need to pay to join?',
    answerText: 'Membership is $5/year, which includes a complete Viral Cue Card Deck for sharing with others. Each card communicates specific benefits and doubles as a recruitment tool. The first onboarding cohort (First 50) gets Founding Status with permanent badges.',
    askerName: 'Budget Buyer',
    channel: 'social_media',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'pawn',
    status: 'sent',
    similarQuestionIds: [],
    createdAt: '2026-03-15T09:00:00Z',
    reviewedAt: '2026-03-15T09:15:00Z',
    sentAt: '2026-03-15T09:20:00Z',
  },
  {
    id: 'qa-017',
    questionText: 'asdf asdf asdf test test test',
    answerText: '',
    askerName: 'test_bot_7742',
    channel: 'website',
    classification: 'bot',
    isNovel: false,
    marksAwarded: 0,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'moneypenny',
    status: 'rejected',
    similarQuestionIds: [],
    createdAt: '2026-03-15T02:14:00Z',
  },
  {
    id: 'qa-018',
    questionText: 'What makes this different from every other failed cooperative?',
    answerText: 'Several structural innovations: the three-currency system prevents speculative capture, Cost+20 ensures fair pricing, the IP Load Balancing system distributes innovation value, preorder-funded manufacturing eliminates speculative production, and the XP Score replaces misleading star ratings with multiplicative accomplishment metrics. This is not a traditional cooperative — it is a new economic architecture.',
    askerName: 'Skeptical Sam',
    askerEmail: 'sam@startupworld.io',
    channel: 'email',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: true,
    followUpMarksAwarded: 25,
    followUpText: 'The preorder-funded manufacturing point is compelling. No speculative inventory risk means lower barrier to entry for makers.',
    aiResponder: 'bishop',
    status: 'followed_up',
    similarQuestionIds: [],
    createdAt: '2026-03-15T13:00:00Z',
    reviewedAt: '2026-03-15T13:30:00Z',
    sentAt: '2026-03-15T13:35:00Z',
    followUpAt: '2026-03-16T08:00:00Z',
  },
  {
    id: 'qa-019',
    questionText: 'What is Ghost World?',
    answerText: 'Ghost World is a risk-free practice realm where you can experiment with platform mechanics without real consequences. It features time dilation (1 hour = 10 hours of simulated activity). The Root Lock principle applies: "If it fits, it sits." It is the safe sandbox for learning before committing real Marks or reputation.',
    askerName: 'Curious Cat',
    channel: 'in_platform',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'knight',
    status: 'approved',
    similarQuestionIds: [],
    createdAt: '2026-03-16T10:00:00Z',
    reviewedAt: '2026-03-16T10:15:00Z',
  },
  {
    id: 'qa-020',
    questionText: 'Can I refer friends and earn rewards?',
    answerText: 'Absolutely. The six-tier referral system rewards you based on when you join: Pioneer (members 1-100) earn 10 Marks per referral, scaling down to Ambassador (50K+) at 1 Mark — but everyone always earns something, forever. The key rule: your Cue Card invitation must be sent BEFORE the person signs up (timestamp-verified attribution).',
    askerName: 'Network Nelly',
    channel: 'website',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'moneypenny',
    status: 'pending_review',
    similarQuestionIds: [],
    createdAt: '2026-03-17T08:00:00Z',
  },
  {
    id: 'qa-021',
    questionText: 'you guys are scammers and I will report you to the FTC',
    answerText: '',
    askerName: 'AngryAndy',
    channel: 'social_media',
    classification: 'flamer',
    isNovel: false,
    marksAwarded: 0,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'moneypenny',
    status: 'rejected',
    similarQuestionIds: [],
    createdAt: '2026-03-17T11:00:00Z',
  },
  {
    id: 'qa-022',
    questionText: 'How does the Harper Guild work? Are they like moderators?',
    answerText: 'The Harper Guild members are ethics checkers and truth-tellers — not moderators in the traditional sense. They ensure the integrity of discourse and verify claims within the platform. Think of them as the cooperative\'s immune system for truthfulness.',
    askerName: 'Ethics Enthusiast',
    askerEmail: 'ethics@university.edu',
    channel: 'email',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'rook',
    status: 'pending_review',
    similarQuestionIds: [],
    createdAt: '2026-03-17T14:00:00Z',
  },
  {
    id: 'qa-023',
    questionText: 'How does referral work again?',
    answerText: 'See our previous detailed answer about the six-tier referral system. In short: invite friends with Cue Cards before they sign up, and earn Mark rewards based on your membership tier.',
    askerName: 'ForgetfulFred',
    channel: 'discord',
    classification: 'duplicate',
    isNovel: false,
    marksAwarded: 0,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'pawn',
    status: 'sent',
    similarQuestionIds: ['qa-020'],
    createdAt: '2026-03-17T16:00:00Z',
    reviewedAt: '2026-03-17T16:10:00Z',
    sentAt: '2026-03-17T16:15:00Z',
  },
  {
    id: 'qa-024',
    questionText: 'What is the Senate and how does governance work?',
    answerText: 'The Senate is a hex-hub governance space with MYST-style navigation. Members participate in patent prosecution through voting and shape platform policy through Pledged Mark Voting — where you escrow your own Marks on governance decisions for commitment-weighted influence. The more skin in the game, the more your vote matters.',
    askerName: 'GovNerd',
    channel: 'in_platform',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'bishop',
    status: 'pending_review',
    similarQuestionIds: [],
    createdAt: '2026-03-18T07:30:00Z',
  },
  {
    id: 'qa-025',
    questionText: 'Can I sell food through the platform? I make homemade hot sauce.',
    answerText: 'Yes! The Let\'s Make Dinner initiative supports food entrepreneurs, and the Cottage Law integration helps you navigate local regulations. You would list your hot sauce in the Marketplace, set your price (Cost+20 floor), and production begins only after preorders hit your threshold — no speculative inventory risk.',
    askerName: 'HotSauceHank',
    askerEmail: 'hank@hotsauce.biz',
    channel: 'website',
    classification: 'worthwhile',
    isNovel: true,
    marksAwarded: 5,
    followUpReceived: false,
    followUpMarksAwarded: 0,
    aiResponder: 'moneypenny',
    status: 'pending_review',
    similarQuestionIds: [],
    createdAt: '2026-03-18T09:00:00Z',
  },
];

// ─── Sample Milestone Report ──────────────────────────────────────────

export const SAMPLE_MILESTONE_REPORTS: QAMilestoneReport[] = [
  {
    milestone: 100,
    reachedAt: '2026-03-16T23:59:00Z',
    totalQuestions: 100,
    worthwhileCount: 58,
    worthwhilePct: 58,
    duplicateCount: 14,
    throwawayCount: 10,
    flamerCount: 7,
    trollCount: 5,
    botCount: 6,
    followUpRate: 34.5,
    totalMarksAwarded: 490,
    topQuestionCategories: [
      { category: 'Currency System', count: 18 },
      { category: 'HexIsle / Tereno', count: 14 },
      { category: 'Membership & Onboarding', count: 12 },
      { category: 'Governance', count: 10 },
      { category: 'Manufacturing', count: 9 },
      { category: 'BandWagon / Stewards', count: 8 },
      { category: 'Referrals', count: 7 },
    ],
    avgResponseTime: '18 minutes',
  },
];

// ─── Classification helpers ───────────────────────────────────────────

export const CLASSIFICATION_CONFIG: Record<QAEntry['classification'], { label: string; color: string; bgColor: string }> = {
  worthwhile: { label: 'Worthwhile', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/30' },
  duplicate:  { label: 'Duplicate',  color: 'text-yellow-400',  bgColor: 'bg-yellow-500/20 border-yellow-500/30' },
  throwaway:  { label: 'Throwaway',  color: 'text-slate-400',   bgColor: 'bg-slate-500/20 border-slate-500/30' },
  flamer:     { label: 'Flamer',     color: 'text-orange-400',  bgColor: 'bg-orange-500/20 border-orange-500/30' },
  troll:      { label: 'Troll',      color: 'text-red-400',     bgColor: 'bg-red-500/20 border-red-500/30' },
  bot:        { label: 'Bot',        color: 'text-purple-400',  bgColor: 'bg-purple-500/20 border-purple-500/30' },
};

export const CHANNEL_CONFIG: Record<QAEntry['channel'], { label: string; color: string }> = {
  website:      { label: 'Website',       color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  social_media: { label: 'Social Media',  color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  email:        { label: 'Email',         color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  in_platform:  { label: 'In-Platform',   color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  discord:      { label: 'Discord',       color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
};

export const AI_RESPONDER_CONFIG: Record<QAEntry['aiResponder'], { label: string; color: string }> = {
  rook:       { label: 'Rook (Gemini)',   color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  knight:     { label: 'Knight (Cursor)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  bishop:     { label: 'Bishop (Claude)', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  pawn:       { label: 'Pawn (Perplexity)', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  moneypenny: { label: 'MoneyPenny',      color: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' },
};

export const STATUS_CONFIG: Record<QAEntry['status'], { label: string; color: string }> = {
  pending_review: { label: 'Pending Review', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  approved:       { label: 'Approved',       color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  rejected:       { label: 'Rejected',       color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  sent:           { label: 'Sent',           color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  followed_up:    { label: 'Followed Up',    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

export const MILESTONES = [100, 500, 1000, 3000, 5000, 10000];

// ─── DB → Frontend mapper ─────────────────────────────────────────────

function mapDbEntry(row: Record<string, any>): QAEntry {
  return {
    id: row.id,
    questionText: row.question_text ?? '',
    answerText: row.answer_text ?? '',
    askerName: row.asker_name ?? '',
    askerEmail: row.asker_email ?? undefined,
    channel: row.channel ?? 'website',
    classification: row.classification ?? 'worthwhile',
    isNovel: row.is_novel ?? false,
    marksAwarded: Number(row.marks_awarded ?? 0),
    followUpReceived: row.follow_up_received ?? false,
    followUpMarksAwarded: Number(row.follow_up_marks_awarded ?? 0),
    memberConversionBonus: 0,
    becameMember: false,
    cueCardsSent: 0,
    followUpText: row.follow_up_text ?? undefined,
    aiResponder: row.ai_responder?.toLowerCase() ?? 'moneypenny',
    status: row.status ?? 'pending_review',
    similarQuestionIds: row.similar_question_ids ?? [],
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
    sentAt: row.sent_at ?? undefined,
    followUpAt: row.follow_up_at ?? undefined,
  };
}

// ─── Async Functions ──────────────────────────────────────────────────

export async function fetchQAEntries(filters?: QAFilters): Promise<QAEntry[]> {
  try {
    let query = supabase.from('qa_entries' as any).select('*').order('created_at', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.classification) query = query.eq('classification', filters.classification);
    if (filters?.channel) query = query.eq('channel', filters.channel);
    if (filters?.aiResponder) query = query.ilike('ai_responder', filters.aiResponder);
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      let entries = (data as any[]).map(mapDbEntry);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        entries = entries.filter(e =>
          e.questionText.toLowerCase().includes(q) ||
          e.answerText.toLowerCase().includes(q) ||
          e.askerName.toLowerCase().includes(q)
        );
      }
      return entries;
    }
  } catch (err) {
    console.warn('[MoneyPennyQA] DB fetch failed, using sample data', err);
  }

  let entries = [...SAMPLE_QA_ENTRIES];
  if (filters?.status) entries = entries.filter(e => e.status === filters.status);
  if (filters?.classification) entries = entries.filter(e => e.classification === filters.classification);
  if (filters?.channel) entries = entries.filter(e => e.channel === filters.channel);
  if (filters?.aiResponder) entries = entries.filter(e => e.aiResponder === filters.aiResponder);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    entries = entries.filter(e =>
      e.questionText.toLowerCase().includes(q) ||
      e.answerText.toLowerCase().includes(q) ||
      e.askerName.toLowerCase().includes(q)
    );
  }
  return entries;
}

export async function fetchQAStats(): Promise<QAStats> {
  try {
    const { data, error } = await supabase.from('qa_entries' as any).select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      const entries = data as any[];
      const total = entries.length;
      const worthwhile = entries.filter((e: any) => e.classification === 'worthwhile').length;
      const novel = entries.filter((e: any) => e.is_novel).length;
      const followUps = entries.filter((e: any) => e.follow_up_received).length;
      const totalMarks = entries.reduce((sum: number, e: any) => sum + Number(e.marks_awarded ?? 0) + Number(e.follow_up_marks_awarded ?? 0), 0);
      const nextMilestone = MILESTONES.find(m => m > total) || 10000;
      return {
        totalQuestions: total,
        pendingReview: entries.filter((e: any) => e.status === 'pending_review').length,
        worthwhile,
        novel,
        followUps,
        totalMarksAwarded: totalMarks,
        nextMilestone,
        progressToMilestone: Math.round((total / nextMilestone) * 100),
      };
    }
  } catch (err) {
    console.warn('[MoneyPennyQA] Stats fetch failed, using sample data', err);
  }

  const entries = SAMPLE_QA_ENTRIES;
  const worthwhile = entries.filter(e => e.classification === 'worthwhile').length;
  const novel = entries.filter(e => e.isNovel).length;
  const followUps = entries.filter(e => e.followUpReceived).length;
  const totalMarks = entries.reduce((sum, e) => sum + e.marksAwarded + e.followUpMarksAwarded, 0);
  const total = entries.length;
  const nextMilestone = MILESTONES.find(m => m > total) || 10000;
  return {
    totalQuestions: total,
    pendingReview: entries.filter(e => e.status === 'pending_review').length,
    worthwhile, novel, followUps,
    totalMarksAwarded: totalMarks,
    nextMilestone,
    progressToMilestone: Math.round((total / nextMilestone) * 100),
  };
}

export async function classifyQuestion(questionText: string): Promise<{ classification: QAEntry['classification']; isNovel: boolean; similarIds: string[] }> {
  const lower = questionText.toLowerCase();
  const existing = SAMPLE_QA_ENTRIES.find(e =>
    e.classification === 'worthwhile' && e.questionText.toLowerCase().includes(lower.slice(0, 20))
  );
  return {
    classification: existing ? 'duplicate' : 'worthwhile',
    isNovel: !existing,
    similarIds: existing ? [existing.id] : [],
  };
}

export async function approveResponse(qaId: string): Promise<QAEntry | null> {
  try {
    const { data, error } = await supabase
      .from('qa_entries' as any)
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', qaId)
      .select()
      .single();
    if (error) throw error;
    if (data) return mapDbEntry(data as any);
  } catch (err) {
    console.warn('[MoneyPennyQA] Approve failed, updating locally', err);
  }
  const entry = SAMPLE_QA_ENTRIES.find(e => e.id === qaId);
  if (entry) { entry.status = 'approved'; entry.reviewedAt = new Date().toISOString(); }
  return entry || null;
}

export async function rejectResponse(qaId: string): Promise<QAEntry | null> {
  try {
    const { data, error } = await supabase
      .from('qa_entries' as any)
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', qaId)
      .select()
      .single();
    if (error) throw error;
    if (data) return mapDbEntry(data as any);
  } catch (err) {
    console.warn('[MoneyPennyQA] Reject failed, updating locally', err);
  }
  const entry = SAMPLE_QA_ENTRIES.find(e => e.id === qaId);
  if (entry) { entry.status = 'rejected'; entry.reviewedAt = new Date().toISOString(); }
  return entry || null;
}

function mapDbMilestone(row: Record<string, any>): QAMilestoneReport {
  const cats = (row.top_categories ?? []) as { category: string; count: number }[];
  return {
    milestone: row.milestone,
    reachedAt: row.reached_at,
    totalQuestions: row.total_questions,
    worthwhileCount: row.worthwhile_count ?? 0,
    worthwhilePct: row.total_questions > 0 ? Math.round(((row.worthwhile_count ?? 0) / row.total_questions) * 100) : 0,
    duplicateCount: row.duplicate_count ?? 0,
    throwawayCount: row.throwaway_count ?? 0,
    flamerCount: row.flamer_count ?? 0,
    trollCount: row.troll_count ?? 0,
    botCount: row.bot_count ?? 0,
    followUpRate: Number(row.follow_up_rate ?? 0),
    totalMarksAwarded: Number(row.total_marks_awarded ?? 0),
    topQuestionCategories: cats,
    avgResponseTime: row.avg_response_time_seconds ? `${Math.round(row.avg_response_time_seconds / 60)} minutes` : 'N/A',
  };
}

export async function fetchMilestoneReports(): Promise<QAMilestoneReport[]> {
  try {
    const { data, error } = await supabase
      .from('qa_milestone_reports' as any)
      .select('*')
      .order('milestone', { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) return (data as any[]).map(mapDbMilestone);
  } catch (err) {
    console.warn('[MoneyPennyQA] Milestone fetch failed, using sample', err);
  }
  return SAMPLE_MILESTONE_REPORTS;
}

export async function awardFollowUpBonus(qaId: string): Promise<QAEntry | null> {
  try {
    const { data, error } = await supabase
      .from('qa_entries' as any)
      .update({
        follow_up_marks_awarded: QA_REWARDS.FOLLOW_UP_BONUS,
        status: 'followed_up',
        follow_up_at: new Date().toISOString(),
      })
      .eq('id', qaId)
      .select()
      .single();
    if (error) throw error;
    if (data) return mapDbEntry(data as any);
  } catch (err) {
    console.warn('[MoneyPennyQA] Award bonus failed, updating locally', err);
  }
  const entry = SAMPLE_QA_ENTRIES.find(e => e.id === qaId);
  if (entry && entry.followUpReceived && entry.followUpMarksAwarded === 0) {
    entry.followUpMarksAwarded = 25;
    entry.status = 'followed_up';
    entry.followUpAt = new Date().toISOString();
  }
  return entry || null;
}
