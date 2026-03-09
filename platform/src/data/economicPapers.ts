/**
 * ECONOMIC PAPERS DATA
 * ====================
 * Central repository for all academic papers and the Nine Economic Laws.
 * Used by EconomicLaws.tsx and individual paper pages.
 */

export interface EconomicLaw {
  number: number;
  name: string;
  shortName: string;
  principle: string;
  paperId: string;
  equation?: string;
}

export interface EconomicPaper {
  id: string;
  title: string;
  subtitle?: string;
  category: 'law' | 'system' | 'application';
  lawNumber?: number;
  icon: string;
  color: string;
  summary: string;
  keyInsight: string;
  problemStatement: string;
  solution: string;
  metrics?: { label: string; value: number | string; unit?: string }[];
  academicSource?: string;
  tldrSource?: string;
  sixthGradeSource?: string;
  relatedPapers: string[];
  tags: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// THE NINE ECONOMIC LAWS
// ═══════════════════════════════════════════════════════════════════════════════

export const NINE_ECONOMIC_LAWS: EconomicLaw[] = [
  {
    number: 1,
    name: 'Forex-Differential Absorption Law',
    shortName: 'Forex Absorption',
    principle: 'External currency disparities are absorbed at acquisition, not spending',
    paperId: 'three-gear-currency',
    equation: '1 Credit = 1 Mark = 1 Joule (at all times)',
  },
  {
    number: 2,
    name: 'Ratchet Value Accumulation Law',
    shortName: 'Ratchet Accumulation',
    principle: 'Total accumulated value can only increase; completed work cannot "un-happen"',
    paperId: 'hivi',
    equation: 'V(t+1) ≥ V(t) ∀t',
  },
  {
    number: 3,
    name: 'Quality-Volume Alignment Law',
    shortName: 'Quality Alignment',
    principle: 'Locked margins force the derivative of profit with respect to quality to be positive',
    paperId: 'anti-extractive',
    equation: 'dProfit/dQuality > 0 (when margin is locked)',
  },
  {
    number: 4,
    name: 'One-Way Valve Decoupling Principle',
    shortName: 'One-Way Valve',
    principle: 'External signals captured at transaction time, then internal economy decoupled',
    paperId: 'one-way-valve',
    equation: 'Internal(t) ⊥ External(t+1)',
  },
  {
    number: 5,
    name: 'Structural Gleaning Principle',
    shortName: 'Structural Gleaning',
    principle: 'Generosity built into math, not marketing — 3.3% Gleaner\'s Corner by design',
    paperId: 'boaz-principle',
    equation: 'Gleaner\'s Corner = 3.3% × Transaction',
  },
  {
    number: 6,
    name: 'Boaz Principle (Generosity for Potential)',
    shortName: 'Generosity for Potential',
    principle: 'The value enabled by generosity exceeds the cost of the corner — Kiva proved this',
    paperId: 'boaz-generosity',
    equation: 'Potential(enabled) > Cost(corner)',
  },
  {
    number: 7,
    name: 'Inception Principle',
    shortName: 'Inception',
    principle: 'Nothing new under the sun — only new ways of seeing what was always there',
    paperId: 'inception-principle',
    equation: 'Innovation = f(Existing Laws, New Perspective)',
  },
  {
    number: 8,
    name: 'Simultaneous Pricing Paradox',
    shortName: 'Pricing Paradox',
    principle: 'Storage of potential services enables simultaneous price skimming AND market penetration',
    paperId: 'simultaneous-pricing',
    equation: 'Early(Premium) + Stored(Value) = Skim + Penetrate',
  },
  {
    number: 9,
    name: 'Jeep of Theseus Cold Start',
    shortName: 'Cold Start',
    principle: 'Pre-ordered services at 50% capacity eliminate all risk but acts of God — we literally predict the market because we already sold it',
    paperId: 'cold-start-theseus',
    equation: 'Risk = 0 when Demand(pre-sold) ≥ Capacity(scheduled) × 0.5',
  },
];

// Backward compatibility aliases
export const SEVEN_ECONOMIC_LAWS = NINE_ECONOMIC_LAWS.slice(0, 7);
export const FIVE_ECONOMIC_LAWS = NINE_ECONOMIC_LAWS.slice(0, 5);

// ═══════════════════════════════════════════════════════════════════════════════
// ALL 16 ECONOMIC PAPERS
// ═══════════════════════════════════════════════════════════════════════════════

export const ECONOMIC_PAPERS: EconomicPaper[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // CORE ECONOMIC LAWS (5)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'three-gear-currency',
    title: 'Three-Gear Currency System',
    subtitle: 'Credits, Marks, and Joules',
    category: 'law',
    lawNumber: 1,
    icon: '⚙️',
    color: '#3b82f6',
    summary: 'A differential currency system that absorbs cross-border economic disparities at acquisition time, enabling global participation without subsidizing or penalizing anyone.',
    keyInsight: 'Currency disparities are absorbed when you JOIN, not when you SPEND.',
    problemStatement: 'How do you let someone earning $300/month in Nigeria buy the same thing as someone earning $10,000/month in Switzerland?',
    solution: 'Three currencies that all spend the same but get acquired differently. Credits are the main currency, Marks compensate weak-currency members, Joules store surplus value for strong-currency members.',
    metrics: [
      { label: 'Currencies', value: 3, unit: 'gears' },
      { label: 'Exchange Rate', value: '1:1:1', unit: 'always' },
      { label: 'Global Equity', value: 'Yes', unit: '' },
    ],
    academicSource: 'KNIGHT_DROPZONE/ACADEMIC_PAPER_THREE_GEAR_CURRENCY.md',
    tldrSource: 'EMPEROR_VERIFICATION_PACKAGE_V3/Academic_Papers/three-gear-currency-tldr.md',
    sixthGradeSource: 'BISHOP_DROPZONE/PAPERS_SIMPLE/THREE_GEAR_CURRENCY_6TH_GRADE.md',
    relatedPapers: ['hivi', 'one-way-valve', 'joules-explained'],
    tags: ['currency', 'global', 'equity', 'forex'],
  },
  {
    id: 'hivi',
    title: 'Historical Influence Value Index',
    subtitle: 'HIVI — History-Based Deterministic Valuation',
    category: 'law',
    lawNumber: 2,
    icon: '📊',
    color: '#8b5cf6',
    summary: 'An economic framework that anchors platform currency valuation to historical facts rather than speculative future value. Value comes from completed transactions, known costs, and recorded exchange rates.',
    keyInsight: 'Every purchase is a vote. Forex aggregates the votes. HIVI captures the tally.',
    problemStatement: 'Traditional markets rely on speculation about future value, creating volatility and enabling manipulation.',
    solution: 'Anchor value to historical facts — completed work, known costs, recorded exchange rates. The ratchet mechanism ensures value can only increase.',
    metrics: [
      { label: 'Value Basis', value: 'Historical', unit: 'facts' },
      { label: 'Volatility', value: 'Zero', unit: '' },
      { label: 'Ratchet', value: 'V(t+1)≥V(t)', unit: '' },
    ],
    academicSource: 'EMPEROR_VERIFICATION_PACKAGE_V3/PAPER_07_HIVI.md',
    tldrSource: 'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/HIVI_COLLEGE_FRESHMAN.md',
    sixthGradeSource: 'BISHOP_DROPZONE/PAPERS_SIMPLE/HIVI_6TH_GRADE.md',
    relatedPapers: ['three-gear-currency', 'one-way-valve', 'transaction-anchored'],
    tags: ['valuation', 'history', 'deterministic', 'ratchet'],
  },
  {
    id: 'anti-extractive',
    title: 'The Anti-Extractive Derivative',
    subtitle: 'Locked Margins Force Quality',
    category: 'law',
    lawNumber: 3,
    icon: '📈',
    color: '#22c55e',
    summary: 'When you lock the margin at Cost+20%, the only way to grow profit is to grow volume, and the only way to grow volume is to increase quality. The math doesn\'t let you cheat.',
    keyInsight: 'We flipped the sign. Quality now HELPS instead of hurts.',
    problemStatement: 'Normal businesses increase profit by cutting costs, which usually means cutting quality.',
    solution: 'Lock the margin: Price = Cost × 1.20. Now dProfit/dQuality becomes positive — quality attracts volume, volume is the only lever.',
    metrics: [
      { label: 'Margin', value: 20, unit: '%' },
      { label: 'Creator Keeps', value: 83.3, unit: '%' },
      { label: 'Quality Incentive', value: 'Positive', unit: '' },
    ],
    academicSource: 'BISHOP_DROPZONE/ACADEMIC_PAPER_ANTI_EXTRACTIVE_DERIVATIVE_BISHOP.md',
    tldrSource: 'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/ANTI_EXTRACTIVE_DERIVATIVE_COLLEGE_FRESHMAN.md',
    sixthGradeSource: 'BISHOP_DROPZONE/PAPERS_SIMPLE/ANTI_EXTRACTIVE_DERIVATIVE_6TH_GRADE.md',
    relatedPapers: ['boaz-principle', 'roi-predictability', 'pay-your-rent'],
    tags: ['margin', 'quality', 'incentives', 'economics'],
  },
  {
    id: 'one-way-valve',
    title: 'One-Way Valve Decoupling',
    subtitle: 'Capture Once, Decouple Forever',
    category: 'law',
    lawNumber: 4,
    icon: '🔒',
    color: '#ef4444',
    summary: 'External valuation signals (Forex rates) are captured at transaction time and stored as historical records. No subsequent external changes affect previously recorded values.',
    keyInsight: 'External economic collapse does NOT affect internal accumulated value.',
    problemStatement: 'Traditional systems remain continuously coupled to external market volatility, exposing participants to risks they cannot control.',
    solution: 'The one-way valve captures external value signals at transaction time, then decouples. Internal economy survives external collapse.',
    metrics: [
      { label: 'Coupling', value: 'One-time', unit: '' },
      { label: 'External Risk', value: 'Isolated', unit: '' },
      { label: 'Internal Stability', value: 'Guaranteed', unit: '' },
    ],
    academicSource: 'EMPEROR_VERIFICATION_PACKAGE_V3/PAPER_07_HIVI.md',
    tldrSource: 'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/HIVI_COLLEGE_FRESHMAN.md',
    sixthGradeSource: 'BISHOP_DROPZONE/PAPERS_SIMPLE/HIVI_6TH_GRADE.md',
    relatedPapers: ['hivi', 'three-gear-currency', 'transaction-anchored'],
    tags: ['decoupling', 'stability', 'isolation', 'forex'],
  },
  {
    id: 'boaz-principle',
    title: 'The Boaz Principle',
    subtitle: 'Structural Gleaning',
    category: 'law',
    lawNumber: 5,
    icon: '🌾',
    color: '#f59e0b',
    summary: 'Build generosity into the math, not the marketing. 3.3% of every transaction goes to the Gleaner\'s Corner by design — not charity, but rights.',
    keyInsight: 'The corner was theirs by design. Not charity — rights.',
    problemStatement: 'Platforms extract maximum value from every transaction, leaving nothing for newcomers or those who can\'t pay full price.',
    solution: 'Every transaction has a Gleaner\'s Corner: 3.3% goes to new members, those below income threshold, those in recovery, and random selection (so gaming is pointless).',
    metrics: [
      { label: 'Gleaner\'s Corner', value: 3.3, unit: '%' },
      { label: 'Platform Ops', value: 13.3, unit: '%' },
      { label: 'Creator', value: 83.3, unit: '%' },
    ],
    academicSource: 'BISHOP_DROPZONE/ACADEMIC_PAPER_BOAZ_PRINCIPLE_BISHOP.md',
    tldrSource: 'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/BOAZ_PRINCIPLE_COLLEGE_FRESHMAN.md',
    sixthGradeSource: 'BISHOP_DROPZONE/PAPERS_SIMPLE/BOAZ_PRINCIPLE_6TH_GRADE.md',
    relatedPapers: ['anti-extractive', '300-framework', 'ghost-credits', 'boaz-generosity'],
    tags: ['generosity', 'gleaning', 'inclusion', 'structural'],
  },
  {
    id: 'boaz-generosity',
    title: 'Generosity for Potential',
    subtitle: 'The Kiva Proof — Why the Corner Creates More Than It Costs',
    category: 'law',
    lawNumber: 6,
    icon: '🌱',
    color: '#10b981',
    summary: 'The value enabled by generosity exceeds the cost of the corner. Kiva proved this: $2B in microloans with 96%+ repayment. When you give people a chance, they create value that wouldn\'t otherwise exist.',
    keyInsight: 'Generosity for potential creates more value than it costs. The lack of it destroys far more.',
    problemStatement: 'Traditional economics treats generosity as a cost center — something that reduces profit. This misses the value that generosity enables.',
    solution: 'Build generosity into the system as an investment in potential. The corner of the field doesn\'t just help gleaners — it enables entire economies that wouldn\'t exist without that initial chance.',
    metrics: [
      { label: 'Kiva Loans', value: '$2B+', unit: '' },
      { label: 'Repayment Rate', value: '96%+', unit: '' },
      { label: 'Value Created', value: '> Cost', unit: '' },
    ],
    academicSource: 'Cephas/cephas-hugo/content/academic/boaz-generosity-potential.md',
    tldrSource: 'Cephas/cephas-hugo/content/academic/boaz-principle-tldr.md',
    relatedPapers: ['boaz-principle', 'anti-extractive', 'inception-principle'],
    tags: ['generosity', 'potential', 'kiva', 'microfinance', 'enabling'],
  },
  {
    id: 'inception-principle',
    title: 'The Inception Principle',
    subtitle: 'Nothing New Under the Sun — Only New Ways of Seeing',
    category: 'law',
    lawNumber: 7,
    icon: '💡',
    color: '#8b5cf6',
    summary: 'Helicopters would have flown in 500 BC — the aerodynamics existed then as now. We simply lacked the knowledge and technology to see how. Innovation isn\'t creating new laws of nature; it\'s finding new ways to see existing ones.',
    keyInsight: 'The laws of physics God set in motion applied in any B.C. time as they do now. Innovation is perspective, not creation.',
    problemStatement: 'Patent law and innovation discourse often confuse "new" with "novel combination." Critics dismiss innovations as "obvious" when they\'re actually profound reframings.',
    solution: 'Recognize that all innovation is inception — seeing existing principles in new ways. Hacking in its true sense: finding new perspectives on existing systems. This is why 1,244 innovations are legitimate IP, not "obvious" combinations.',
    metrics: [
      { label: 'Innovations', value: '1,244', unit: '' },
      { label: 'Nature', value: 'Perspective', unit: '' },
      { label: 'Legitimacy', value: 'Novel Combination', unit: '' },
    ],
    academicSource: 'Cephas/cephas-hugo/content/academic/inception-principle.md',
    relatedPapers: ['boaz-generosity', 'ip-load-balancing', 'hivi'],
    tags: ['innovation', 'perspective', 'hacking', 'IP', 'philosophy'],
  },
  {
    id: 'simultaneous-pricing',
    title: 'The Simultaneous Pricing Paradox',
    subtitle: 'Price Skimming AND Market Penetration — At the Same Time',
    category: 'law',
    lawNumber: 8,
    icon: '⚡',
    color: '#f97316',
    summary: 'Traditional economics says choose: price skim (high initial price) OR market penetrate (low initial price). Storage of potential services (Forever Stamps / Joules) enables BOTH simultaneously.',
    keyInsight: 'Early backers pay full price but get 5× value. The stored value makes future entry accessible. You capture surplus AND maximize volume.',
    problemStatement: 'Classical pricing theory presents a false dichotomy: capture early adopter surplus (skimming) OR maximize market share (penetration). You supposedly cannot do both.',
    solution: 'Store value as potential services (Joules/Forever Stamps). Early backers pay premium but get multiplied future value (5× at Pre-Mint). This captures surplus while the stored value makes later entry accessible to everyone.',
    metrics: [
      { label: 'Early Multiplier', value: '5×', unit: 'at Pre-Mint' },
      { label: 'Strategy', value: 'Both', unit: 'Skim + Penetrate' },
      { label: 'Storage', value: 'Forever Stamps', unit: '' },
    ],
    academicSource: 'Cephas/cephas-hugo/content/academic/simultaneous-pricing.md',
    relatedPapers: ['ghost-credits', 'joules-explained', 'cold-start-theseus'],
    tags: ['pricing', 'economics', 'paradox', 'forever-stamp', 'strategy'],
  },
  {
    id: 'cold-start-theseus',
    title: 'Jeep of Theseus Cold Start',
    subtitle: 'Pre-Ordered Services Eliminate All Risk But Acts of God',
    category: 'law',
    lawNumber: 9,
    icon: '🚙',
    color: '#06b6d4',
    summary: 'Decentralized nodes schedule 50% capacity with exclusively pre-ordered services. Half the job is funded up front. We literally predict the market because we already sold it, already paid for it, and already know all the factors.',
    keyInsight: 'Risk = 0 when you\'ve already sold half your capacity. You\'re not predicting demand — you\'re fulfilling orders.',
    problemStatement: 'New businesses face the "cold start" problem: no customers means no revenue means no ability to serve customers. Traditional solutions require capital to absorb losses during ramp-up.',
    solution: 'Schedule nodes at 50% capacity with pre-ordered services only. The other 50% handles redundancy and surge. Since half is pre-sold, you know exactly what you need. No speculation, no risk except acts of God.',
    metrics: [
      { label: 'Pre-Sold Capacity', value: 50, unit: '%' },
      { label: 'Risk Level', value: '~0', unit: 'except acts of God' },
      { label: 'Market Prediction', value: '100%', unit: 'accuracy (already sold)' },
    ],
    academicSource: 'Cephas/cephas-hugo/content/academic/cold-start-theseus.md',
    relatedPapers: ['simultaneous-pricing', 'ghost-credits', '300-framework'],
    tags: ['cold-start', 'risk', 'prediction', 'decentralized', 'nodes', 'theseus'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SYSTEM DESIGN PAPERS (6)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'ghost-credits',
    title: 'Ghost Credits & Demand Validation',
    subtitle: 'Test Before You Build',
    category: 'system',
    icon: '👻',
    color: '#a855f7',
    summary: 'Let people pretend to buy things before they exist. Ghost Credits show demand without commitment, soft pledges add skin in the game, then launch when thresholds are met.',
    keyInsight: 'Find out if they\'re interested before you spend six months building something.',
    problemStatement: 'Most new products fail because nobody knew if anyone actually wanted them before they built them.',
    solution: 'Three phases: Ghost Shopping (fake money), Soft Pledge (real credits, refundable), Launch (pledges convert to orders). Early backers get Forever Stamps.',
    metrics: [
      { label: 'Phases', value: 3, unit: '' },
      { label: 'Risk', value: 'Minimized', unit: '' },
      { label: 'Early Backer Reward', value: 'Forever Stamps', unit: '' },
    ],
    academicSource: 'KNIGHT_DROPZONE/ACADEMIC_PAPER_GHOST_CREDITS.md',
    tldrSource: 'EMPEROR_VERIFICATION_PACKAGE_V3/Academic_Papers/ghost-credits-tldr.md',
    relatedPapers: ['boaz-principle', 'roi-predictability', 'joules-explained'],
    tags: ['demand', 'validation', 'crowdfunding', 'testing'],
  },
  {
    id: '300-framework',
    title: 'The 300 Framework',
    subtitle: 'Organizational Scaling',
    category: 'system',
    icon: '🛡️',
    color: '#64748b',
    summary: 'Cap it at 300 people. But make those 300 work like 3,000. Six Domain Circles of 50 people each, three commitment tiers, and the Ask Matrix for matching skills to needs.',
    keyInsight: 'Beyond 300, you need bureaucracy. At 300, you can still function on trust and reputation.',
    problemStatement: 'Organizations either stay small and cohesive or grow big and become a mess. There\'s no middle ground.',
    solution: 'Six Domain Circles (Patrons, Media, Academics, Initiative Leaders, Amplifiers, Infrastructure) × Three Tiers (Shields, Spears, Phalanx). Crown vs. Blessing separation.',
    metrics: [
      { label: 'Max Size', value: 300, unit: 'people' },
      { label: 'Circles', value: 6, unit: '' },
      { label: 'Tiers', value: 3, unit: '' },
    ],
    academicSource: 'KNIGHT_DROPZONE/ACADEMIC_PAPER_300_FRAMEWORK.md',
    tldrSource: 'EMPEROR_VERIFICATION_PACKAGE_V3/Academic_Papers/300-framework-tldr.md',
    relatedPapers: ['boaz-principle', 'harper-certification', 'star-chamber'],
    tags: ['organization', 'scaling', 'governance', 'dunbar'],
  },
  {
    id: 'transaction-anchored',
    title: 'Transaction-Anchored Economics',
    subtitle: 'Value from Completed Work',
    category: 'system',
    icon: '⚓',
    color: '#0ea5e9',
    summary: 'All value derives from completed transactions, not promises or projections. The anchor is what actually happened, not what might happen.',
    keyInsight: 'You can\'t speculate on history. It already happened.',
    problemStatement: 'Speculative economics creates bubbles, crashes, and manipulation because value is based on guesses about the future.',
    solution: 'Anchor all value to completed transactions. Known costs, recorded exchange rates, finished work. The past is immutable.',
    metrics: [
      { label: 'Value Basis', value: 'Completed', unit: 'transactions' },
      { label: 'Speculation', value: 'Zero', unit: '' },
      { label: 'Manipulation', value: 'Impossible', unit: '' },
    ],
    academicSource: 'LAUNCH_DOCUMENTS_MASTER/articles/PAPER_TRANSACTION_ANCHORED_ECONOMICS.md',
    relatedPapers: ['hivi', 'proof-of-transaction', 'one-way-valve'],
    tags: ['transactions', 'anchoring', 'history', 'anti-speculation'],
  },
  {
    id: 'proof-of-transaction',
    title: 'Proof of Transaction',
    subtitle: 'Blockchain Verification',
    category: 'system',
    icon: '🔗',
    color: '#14b8a6',
    summary: 'Every transaction is recorded on blockchain (testnet by design) for provenance, not trading. The record is immutable, the tokens are not tradeable.',
    keyInsight: 'Testnet is permanent by design — it prevents speculation while enabling verification.',
    problemStatement: 'Traditional records can be altered, disputed, or lost. Blockchain solves this but usually enables speculation.',
    solution: 'Use blockchain for provenance only. Testnet tokens cannot be traded, eliminating speculation while preserving immutable records.',
    metrics: [
      { label: 'Network', value: 'Testnet', unit: 'permanent' },
      { label: 'Trading', value: 'Impossible', unit: '' },
      { label: 'Records', value: 'Immutable', unit: '' },
    ],
    academicSource: 'LAUNCH_DOCUMENTS_MASTER/articles/PAPER_PROOF_OF_TRANSACTION.md',
    relatedPapers: ['transaction-anchored', 'hivi', 'star-chamber'],
    tags: ['blockchain', 'provenance', 'verification', 'testnet'],
  },
  {
    id: 'harper-certification',
    title: 'Harper Automated Trust',
    subtitle: 'Quality Assurance System',
    category: 'system',
    icon: '✅',
    color: '#10b981',
    summary: 'Automated quality certification using multi-factor assessment. Harper reviews combine AI analysis, peer feedback, and objective metrics.',
    keyInsight: 'Trust is earned through transparent, consistent, automated assessment.',
    problemStatement: 'Manual quality assurance is slow, inconsistent, and subject to bias.',
    solution: 'Harper certification combines AI analysis, peer reviews, and objective metrics into a transparent score. No human gatekeepers.',
    metrics: [
      { label: 'Assessment', value: 'Multi-factor', unit: '' },
      { label: 'Bias', value: 'Minimized', unit: '' },
      { label: 'Speed', value: 'Automated', unit: '' },
    ],
    academicSource: 'LAUNCH_DOCUMENTS_MASTER/articles/PAPER_AUTOMATED_TRUST_HARPER_CERTIFICATION.md',
    relatedPapers: ['star-chamber', '300-framework', 'boaz-principle'],
    tags: ['quality', 'certification', 'trust', 'automation'],
  },
  {
    id: 'star-chamber',
    title: 'Star Chamber Verification',
    subtitle: 'Multi-AI Consensus',
    category: 'system',
    icon: '⭐',
    color: '#fbbf24',
    summary: 'Multiple AI systems independently verify claims, then reach consensus. No single point of failure, no single source of bias.',
    keyInsight: 'When five AIs from different companies agree, the probability of coordinated error approaches zero.',
    problemStatement: 'Single AI systems can hallucinate, be biased, or be manipulated.',
    solution: 'Star Chamber convenes multiple AI systems (Claude, GPT, Gemini, etc.) to independently verify claims. Consensus required for certification.',
    metrics: [
      { label: 'AI Systems', value: '5+', unit: '' },
      { label: 'Consensus', value: 'Required', unit: '' },
      { label: 'Error Rate', value: '~0%', unit: '' },
    ],
    academicSource: 'Cephas/cephas-hugo/content/verification/star-chamber-verdict.md',
    tldrSource: 'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/STAR_CHAMBER_COLLEGE_FRESHMAN.md',
    sixthGradeSource: 'BISHOP_DROPZONE/PAPERS_SIMPLE/STAR_CHAMBER_6TH_GRADE.md',
    relatedPapers: ['harper-certification', 'proof-of-transaction', '300-framework'],
    tags: ['verification', 'consensus', 'AI', 'multi-agent'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // APPLICATION PAPERS (5)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'joules-explained',
    title: 'Joules Explained',
    subtitle: 'The Arcade Token Model',
    category: 'application',
    icon: '🎮',
    color: '#ec4899',
    summary: 'Joules are like arcade tokens — valuable here, only here. They\'re locked-value service credits that work like Forever Stamps for platform services.',
    keyInsight: 'Same service later that you would get now. Like a Forever Stamp.',
    problemStatement: 'How do you create a currency that has stable value without being a security?',
    solution: 'Joules are prepaid service access, not investments. Like arcade tokens, they\'re valuable within the system but cannot be traded externally.',
    metrics: [
      { label: 'Model', value: 'Arcade Token', unit: '' },
      { label: 'Tradeable', value: 'No', unit: '' },
      { label: 'Value', value: 'Forever Stamp', unit: '' },
    ],
    academicSource: 'LAUNCH_DOCUMENTS_MASTER/articles/ARTICLE_JOULES_EXPLAINED_ARCADE_TOKEN_MODEL.md',
    relatedPapers: ['three-gear-currency', 'hivi', 'pay-your-rent'],
    tags: ['joules', 'currency', 'arcade', 'forever-stamp'],
  },
  {
    id: 'ip-load-balancing',
    title: 'IP Load Balancing',
    subtitle: 'Patent Distribution System',
    category: 'application',
    icon: '⚖️',
    color: '#6366f1',
    summary: 'Distribute patent ownership across the community through the Sponsorship Cascade. 60% Platform Pool, 10% Patent Buckets, 20% Founder, 10% Prosecution.',
    keyInsight: 'Everyone can own a piece of the intellectual property — not just investors.',
    problemStatement: 'Traditional IP ownership concentrates in the hands of founders and investors.',
    solution: 'Patent Buckets with $5K max per person, Sponsorship Cascade for broad distribution, perpetual renewal cycles.',
    metrics: [
      { label: 'Platform Pool', value: 60, unit: '%' },
      { label: 'Patent Buckets', value: 10, unit: '%' },
      { label: 'Max Per Person', value: '$5K', unit: '' },
    ],
    academicSource: 'Cephas/cephas-hugo/content/academic/ip-load-balancing-academic.md',
    relatedPapers: ['boaz-principle', '300-framework', 'anti-extractive'],
    tags: ['patents', 'IP', 'distribution', 'ownership'],
  },
  {
    id: 'roi-predictability',
    title: 'ROI Predictability',
    subtitle: 'Structural Determinism',
    category: 'application',
    icon: '🎯',
    color: '#f97316',
    summary: 'When margin is locked at 20%, ROI becomes predictable. No surprises, no manipulation, no extraction.',
    keyInsight: 'Predictable returns beat volatile returns for long-term planning.',
    problemStatement: 'Traditional investments have unpredictable returns due to market volatility and extraction.',
    solution: 'Lock the margin. ROI = 20% of cost, always. Volume determines total return, not margin manipulation.',
    metrics: [
      { label: 'ROI', value: 20, unit: '%' },
      { label: 'Predictability', value: '100%', unit: '' },
      { label: 'Volatility', value: 'Zero', unit: '' },
    ],
    academicSource: 'BISHOP_DROPZONE/ACADEMIC_PAPER_ROI_PREDICTABILITY_V3.md',
    tldrSource: 'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/ROI_PREDICTABILITY_COLLEGE_FRESHMAN.md',
    sixthGradeSource: 'BISHOP_DROPZONE/PAPERS_SIMPLE/ROI_PREDICTABILITY_6TH_GRADE.md',
    relatedPapers: ['anti-extractive', 'hivi', 'pay-your-rent'],
    tags: ['ROI', 'predictability', 'margin', 'determinism'],
  },
  {
    id: 'pay-your-rent',
    title: 'How to Pay Your Rent with Liana Banyan',
    subtitle: 'Your Business, Your Customers, Your Income',
    category: 'application',
    icon: '🏠',
    color: '#84cc16',
    summary: 'Members earn through their own enterprises — products, services, gigs. The platform provides infrastructure, not investment returns. Your business, your customers, your income.',
    keyInsight: 'You make money WITH the platform, not FROM the platform.',
    problemStatement: 'People need real income, not just platform credits.',
    solution: 'Use platform infrastructure to build your own business. Sell products, offer services, complete gigs. Keep 83.3% of everything you earn.',
    metrics: [
      { label: 'Creator Keeps', value: 83.3, unit: '%' },
      { label: 'Income Source', value: 'Your Business', unit: '' },
      { label: 'Platform Role', value: 'Infrastructure', unit: '' },
    ],
    academicSource: 'LAUNCH_DOCUMENTS_MASTER/articles/PAPER_HOW_TO_PAY_YOUR_RENT_WITH_LIANA_BANYAN.md',
    relatedPapers: ['anti-extractive', 'joules-explained', 'roi-predictability'],
    tags: ['income', 'business', 'rent', 'practical'],
  },
  {
    id: 'band-strategy',
    title: 'The Band Strategy',
    subtitle: 'Maximum Personal Success',
    category: 'application',
    icon: '🎸',
    color: '#78716c',
    summary: 'Structure your participation like a band — find your role, collaborate with others, build something together that none could build alone.',
    keyInsight: 'The whole is greater than the sum of its parts.',
    problemStatement: 'Individual effort has limits. Collaboration multiplies impact.',
    solution: 'Find your instrument (skills), join a band (team), play your part (contribute), share the success (83.3% creator split).',
    metrics: [
      { label: 'Model', value: 'Band', unit: '' },
      { label: 'Collaboration', value: 'Required', unit: '' },
      { label: 'Success', value: 'Shared', unit: '' },
    ],
    academicSource: 'LAUNCH_DOCUMENTS_MASTER/articles/PAPER_THE_BAND_STRATEGY_MAXIMUM_PERSONAL_SUCCESS.md',
    relatedPapers: ['300-framework', 'pay-your-rent', 'boaz-principle'],
    tags: ['collaboration', 'strategy', 'success', 'teamwork'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MARCH 2026 PAPERS — CIVIC ENGAGEMENT & GOVERNANCE (4)
  // Patent Contributions: 75 total innovation claims
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'attention-as-funding',
    title: 'Attention-as-Funding',
    subtitle: 'Participation Generates Data, Data Funds Causes',
    category: 'system',
    icon: '👁️',
    color: '#6366f1',
    summary: 'Members participate in the platform. That participation generates aggregated civic engagement data. The data is sold as intelligence products. Revenue flows to member-chosen causes — never back to the member as cash.',
    keyInsight: 'Your attention funds the causes you choose. Not your wallet.',
    problemStatement: 'Advertising monetizes attention for advertisers. Subscriptions monetize attention for creators. Neither lets you direct the value of YOUR attention to YOUR priorities.',
    solution: 'Three attention models exist: advertising funds advertisers, subscriptions fund creators, and attention-as-funding lets members direct data revenue to their chosen causes. Six data product types (Petition Trends, Grassroots Intensity, Cultural Engagement, Subscriber Ecosystem, Movement Comparison, Longitudinal Trends). 80% of data revenue goes to member allocation pool; members direct their share to causes within 30 days.',
    metrics: [
      { label: 'Data Products', value: 6, unit: 'types' },
      { label: 'Member Allocation', value: 80, unit: '%' },
      { label: 'Innovation Claims', value: 18, unit: 'ATF-series' },
    ],
    academicSource: 'academic-papers/PAPER_ATTENTION_AS_FUNDING.md',
    tldrSource: 'academic-papers/PAPER_ATTENTION_AS_FUNDING_TLDR.md',
    sixthGradeSource: 'academic-papers/PAPER_ATTENTION_AS_FUNDING_6TH_GRADE.md',
    relatedPapers: ['grassroots-intelligence', 'muffled-rule', 'marks-democracy'],
    tags: ['attention', 'funding', 'data', 'civic', 'causes', 'participation'],
  },
  {
    id: 'grassroots-intelligence',
    title: 'Grassroots Intelligence Without Demographics',
    subtitle: 'Zero-Demographic Political Trend Analysis',
    category: 'system',
    icon: '🌱',
    color: '#059669',
    summary: 'Generate political and cultural trend intelligence WITHOUT collecting demographic data. Every data point represents verified human effort — impossible to fake, purchase, or automate.',
    keyInsight: 'When every data point represents verified effort, you don\'t need demographics. The effort signal IS the signal.',
    problemStatement: 'Traditional polling suffers from response bias and de-anonymization risk. Social media analytics are contaminated by bots and algorithmic amplification. Both collect demographics that can be weaponized.',
    solution: 'Effort-gated civic participation through Marks (non-purchasable effort-debt currency) and a 6-tier lifetime-permanent voting system. Zero demographics collected. Merkle tree integrity verification. Minimum 100-participant aggregation threshold prevents de-anonymization. Produces political intelligence measuring what people actually care about, weighted by how much genuine effort they invest.',
    metrics: [
      { label: 'Demographics', value: 'Zero', unit: 'collected' },
      { label: 'Voting Tiers', value: 6, unit: 'lifetime permanent' },
      { label: 'Innovation Claims', value: 15, unit: 'GI-series' },
    ],
    academicSource: 'academic-papers/PAPER_GRASSROOTS_INTELLIGENCE.md',
    tldrSource: 'academic-papers/PAPER_GRASSROOTS_INTELLIGENCE_TLDR.md',
    sixthGradeSource: 'academic-papers/PAPER_GRASSROOTS_INTELLIGENCE_6TH_GRADE.md',
    relatedPapers: ['attention-as-funding', 'marks-democracy', 'muffled-rule'],
    tags: ['intelligence', 'demographics', 'privacy', 'civic', 'petitions', 'effort'],
  },
  {
    id: 'muffled-rule',
    title: 'The Muffled Rule',
    subtitle: 'Architectural Civility in Democratic Discourse',
    category: 'system',
    icon: '🔇',
    color: '#7c3aed',
    summary: 'Your mic only works for as long as you have listened to others speak. Coverage Minutes earned through reading and listening are spent to speak and publish. When your balance hits zero, your mic turns off. Abuse becomes structurally unprofitable.',
    keyInsight: 'Trolls would have to read thousands of words of content they hate to earn enough minutes for one hateful paragraph. The economics don\'t make sense.',
    problemStatement: 'Content moderation has a fundamental timing problem: the damage happens before the moderator arrives. Removing content after it spreads is a bandage, not a cure.',
    solution: 'Coverage Minutes: earned 1:1 by listening at Round Tables, proportional to reading articles (238 WPM benchmark). Spent 1:1 for speaking, proportional for publishing. Anti-abuse architecture includes same-author diminishing returns, donation friction tax (20%), 90-day decay, and Sybil prevention. LiveKit integration with database-persisted mic queue. Shirley Temple content standard.',
    metrics: [
      { label: 'Earn Rate', value: '1:1', unit: 'listening:speaking' },
      { label: 'Decay Window', value: 90, unit: 'days' },
      { label: 'Innovation Claims', value: 22, unit: 'MR-series' },
    ],
    academicSource: 'academic-papers/PAPER_MUFFLED_RULE_CIVILITY.md',
    tldrSource: 'academic-papers/PAPER_MUFFLED_RULE_CIVILITY_TLDR.md',
    sixthGradeSource: 'academic-papers/PAPER_MUFFLED_RULE_CIVILITY_6TH_GRADE.md',
    relatedPapers: ['marks-democracy', 'grassroots-intelligence', 'attention-as-funding'],
    tags: ['civility', 'moderation', 'architecture', 'discourse', 'coverage-minutes'],
  },
  {
    id: 'marks-democracy',
    title: 'Marks-Based Democratic Participation',
    subtitle: 'Effort-Weighted Civic Expression',
    category: 'system',
    icon: '🗳️',
    color: '#dc2626',
    summary: 'Civic expression requires spending Marks — effort-debt currency that cannot be purchased, gifted, or transferred. Six-tier diminishing-returns voting creates effort-weighted democracy, not wealth-weighted democracy.',
    keyInsight: 'If civic expression costs money, you\'ve just rebuilt plutocracy with extra math. If it costs effort, you\'ve built meritocracy.',
    problemStatement: 'Wealth-weighted civic influence (money buys voice), one-person-one-vote limitations (doesn\'t capture conviction intensity), and quadratic voting\'s flaw (uses money, reintroduces wealth-weighting).',
    solution: 'Six-tier voting: Voice (1 Mark) through Cornerstone (100 Marks), 191 total for full-depth commitment. Marks are non-purchasable, non-giftable, non-transferable. Tiers NEVER reset — lifetime permanent civic commitment record. Petition creation costs 50 Marks (refunded at 500 co-signers). Bidirectional FOR/AGAINST voting. Sybil-resistant by design: 100 fake accounts = 100x real work.',
    metrics: [
      { label: 'Voting Tiers', value: 6, unit: 'permanent' },
      { label: 'Full Depth Cost', value: 191, unit: 'Marks' },
      { label: 'Innovation Claims', value: 20, unit: 'MDP-series' },
    ],
    academicSource: 'academic-papers/PAPER_MARKS_DEMOCRATIC_PARTICIPATION.md',
    tldrSource: 'academic-papers/PAPER_MARKS_DEMOCRATIC_PARTICIPATION_TLDR.md',
    sixthGradeSource: 'academic-papers/PAPER_MARKS_DEMOCRATIC_PARTICIPATION_6TH_GRADE.md',
    relatedPapers: ['muffled-rule', 'grassroots-intelligence', 'attention-as-funding'],
    tags: ['democracy', 'marks', 'voting', 'effort', 'civic', 'petitions'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function getPaperById(id: string): EconomicPaper | undefined {
  return ECONOMIC_PAPERS.find(paper => paper.id === id);
}

export function getPapersByCategory(category: 'law' | 'system' | 'application'): EconomicPaper[] {
  return ECONOMIC_PAPERS.filter(paper => paper.category === category);
}

export function getLawPapers(): EconomicPaper[] {
  return ECONOMIC_PAPERS.filter(paper => paper.category === 'law').sort((a, b) => (a.lawNumber || 0) - (b.lawNumber || 0));
}

export function getRelatedPapers(paperId: string): EconomicPaper[] {
  const paper = getPaperById(paperId);
  if (!paper) return [];
  return paper.relatedPapers.map(id => getPaperById(id)).filter((p): p is EconomicPaper => p !== undefined);
}

export function getLawByNumber(num: number): EconomicLaw | undefined {
  return NINE_ECONOMIC_LAWS.find(law => law.number === num);
}
