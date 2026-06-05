/**
 * Medium Article Drafts — Opening Gambit Salvo Stream 4
 * K372 / B091 | April 2026
 *
 * Title, subtitle, body outline, and tags for 4 Medium articles.
 * Full drafts live in BISHOP_DROPZONE/09_Articles/.
 */

export interface MediumArticleDraft {
  slug: string;
  title: string;
  subtitle: string;
  bodyOutline: string[];
  tags: string[];
  salvoDay: number;
  draftFile: string;
  status: 'draft' | 'review' | 'published';
}

export const MEDIUM_ARTICLE_DRAFTS: MediumArticleDraft[] = [
  {
    slug: '12-patents-zero-investors',
    title: '12 Patents, Zero Investors — How Four AI Agents Built a Cooperative Platform',
    subtitle: 'One founder, four AI agents, 2,224 innovations, 12 provisional patents, zero investors.',
    bodyOutline: [
      'The Team: Bishop (writes), Knight (builds), Rook (extracts/protects), Pawn (reviews)',
      'The Numbers: 2,270 innovations, 21 provisionals, ~2,473 claims, 228 Crown Jewels',
      'Why No VC: extraction math doesn\'t work with Cost + 20%',
      'How AI Changed the Game: 7 months of output from a 4-agent team',
      'The IP Fortress: 80% contributed to cooperative, 20% Founder protection block',
    ],
    tags: ['AI', 'Cooperative Economics', 'Patents', 'Platform Cooperativism', 'Startups'],
    salvoDay: 1,
    draftFile: 'BISHOP_DROPZONE/09_Articles/ARTICLE_MEDIUM_12_PATENTS_NO_VC.md',
    status: 'draft',
  },
  {
    slug: '83-percent-platform',
    title: 'The 83.3% Platform: Why Cost+20% Changes Everything',
    subtitle: 'On every platform, creators lose 30-50% to fees. We take Cost+20% — creators keep 83.3%.',
    bodyOutline: [
      'Sarah\'s cutting boards: $325 on Amazon vs $416.67 on Liana Banyan',
      'The Enshittification Cycle: Attract → Lock in → Extract → Repeat',
      'The Margin Lock: constitutional, not policy',
      'Why the math works: no VC returns, one-way valve, member-funded infrastructure',
      'Sponsorship Marks: ONE level only, never MLM, hard boundary',
      '"As You Wish" — intentional transaction confirmation',
    ],
    tags: ['Platform Economics', 'Creator Economy', 'Cooperative Commerce', 'Marketplace Design'],
    salvoDay: 4,
    draftFile: 'BISHOP_DROPZONE/09_Articles/ARTICLE_MEDIUM_83_PERCENT_PLATFORM.md',
    status: 'draft',
  },
  {
    slug: 'political-expedition',
    title: 'Political Expedition: What If Your Political Voice Had Economic Weight?',
    subtitle: 'Not voting. Not donating. Economic expression — where spending patterns create real civic data.',
    bodyOutline: [
      'The measurement problem: votes, donations, and polls are low-resolution',
      'Economic expression: voluntary, anonymized civic tagging of purchases',
      'Three functions: congressional vote tracking, signal aggregation, economic weight',
      'Hard boundaries: not voting, not donating, not lobbying, not surveillance, not partisan',
      'Four-Crown Council: bipartisan by design (two Door-Openers, two Builders)',
      'Interdependence: aggregate choices create signal no individual choice can',
    ],
    tags: ['Civic Technology', 'Democracy', 'Platform Economics', 'Political Innovation'],
    salvoDay: 7,
    draftFile: 'BISHOP_DROPZONE/09_Articles/ARTICLE_MEDIUM_POLITICAL_EXPEDITION.md',
    status: 'draft',
  },
  {
    slug: 'ambassador-of-the-quan',
    title: 'The Ambassador of the Quan',
    subtitle: 'The money + the love + the respect + the community. Jerry Maguire was right.',
    bodyOutline: [
      'Existing article — reference BISHOP_DROPZONE/ARTICLE_RUPRECHT_MEETS_THE_QUAN_DRAFT.md',
      'Or the Buffett Open Letter variant',
    ],
    tags: ['Cooperative Economics', 'Creator Economy', 'Platform Design'],
    salvoDay: 10,
    draftFile: 'BISHOP_DROPZONE/ARTICLE_RUPRECHT_MEETS_THE_QUAN_DRAFT.md',
    status: 'draft',
  },
];
