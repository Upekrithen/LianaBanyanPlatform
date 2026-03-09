/**
 * LITERARY CANON — Cultural Touchstones of the Platform
 * ======================================================
 * The Founder's reading list, embedded in the platform's DNA.
 * These aren't decorative — each one maps to a principle.
 *
 * "I read that when I was 12."
 * — The Founder, on Jesse Stuart's "The Thread That Runs So True"
 *
 * Innovation #1461 — Literary Canon Integration
 */

// ============================================================================
// TYPES
// ============================================================================

export interface LiteraryReference {
  id: string;
  title: string;
  author: string;
  /** Year of original publication */
  year: number;
  /** What platform principle this maps to */
  principle: string;
  /** Short description of the connection */
  connection: string;
  /** Category of literature */
  category: LiteraryCategory;
  /** Where this is referenced in the platform */
  usedIn: string[];
  /** Optional: series this belongs to */
  series?: string;
  /** Optional: the Founder's personal note */
  founderNote?: string;
}

export type LiteraryCategory =
  | 'adventure'      // TinTin, Jason & Argonauts
  | 'fable'          // Kipling, Just So Stories
  | 'satire'         // O. Henry
  | 'childrens'      // Mr. Men
  | 'memoir'         // Jesse Stuart, James Herriot
  | 'mythology'      // Arabian Nights, Argonauts
  | 'comics'         // TinTin, Asterix
  | 'classic';       // General classics

// ============================================================================
// THE CANON
// ============================================================================

export const LITERARY_CANON: LiteraryReference[] = [
  // === TRIBE PRINCIPLES ===
  {
    id: 'jesse-stuart',
    title: 'The Thread That Runs So True',
    author: 'Jesse Stuart',
    year: 1949,
    principle: 'Tribe Minimum Viability',
    connection: 'A tiny mountain school competed against and beat college-prep kids at state level. Size doesn\'t determine capability — attention and effort do. All you need is 2 people to make a Tribe.',
    category: 'memoir',
    usedIn: ['sharedPoolAccounts.ts', 'guildChapterSystem.ts', 'Cephas: guild-chapter-system.md'],
    founderNote: 'Read this at 12. The cover had his name bigger than the title — I genuinely thought the book was called "Jesse Stuart" for years. Hilarious.',
  },
  {
    id: 'herriot-quartet',
    title: 'All Creatures Great and Small',
    author: 'James Herriot',
    year: 1972,
    principle: 'Universal Inclusion',
    connection: 'Four books, four lines from one hymn: "All Things Bright and Beautiful," "All Creatures Great and Small," "All Things Wise and Wonderful," "The Lord God Made Them All." All tribes, all sizes, all types — all one platform.',
    category: 'memoir',
    series: 'James Herriot Quartet',
    usedIn: ['sharedPoolAccounts.ts'],
    founderNote: 'The British veterinarian who used four lines from a hymn as titles for four books. Perfect metaphor for our tribe system.',
  },

  // === ADVENTURE & COMICS ===
  {
    id: 'tintin',
    title: 'The Adventures of Tintin',
    author: 'Hergé (Georges Remi)',
    year: 1929,
    principle: 'Curious Investigation',
    connection: 'A young reporter who goes everywhere, investigates everything, and brings his friends along. The platform rewards curiosity — Golden Keys, Alcoves, the Hallway.',
    category: 'comics',
    series: 'Tintin',
    usedIn: ['literaryCanon.ts'],
  },
  {
    id: 'asterix',
    title: 'Asterix the Gaul',
    author: 'René Goscinny & Albert Uderzo',
    year: 1959,
    principle: 'Small Village vs. Empire',
    connection: 'A tiny Gaulish village holds out against the entire Roman Empire through cleverness, community, and a magic potion. The Jesse Stuart Principle in comic form — the short and tall Vikings (Asterix and Obelix) beating impossible odds together.',
    category: 'comics',
    series: 'Asterix',
    usedIn: ['literaryCanon.ts'],
    founderNote: 'The French one about the short and tall vikings! Asterix (short, clever) and Obelix (tall, strong). A village of maybe 50 people holding off Rome.',
  },
  {
    id: 'mr-men',
    title: 'Mr. Men',
    author: 'Roger Hargreaves',
    year: 1971,
    principle: 'Character Differentiation',
    connection: 'Every character is defined by a single dominant trait — Mr. Happy, Mr. Strong, Mr. Clever. In the platform, every member has strengths. Roster positions in guild chapters mirror this: Forge Master, Anvil Striker, Water Bearer. Everyone contributes what they\'re best at.',
    category: 'childrens',
    series: 'Mr. Men / Little Miss',
    usedIn: ['literaryCanon.ts'],
  },

  // === KIPLING ===
  {
    id: 'rikki-tikki-tavi',
    title: 'Rikki-Tikki-Tavi',
    author: 'Rudyard Kipling',
    year: 1894,
    principle: 'Vigilant Defense',
    connection: 'A mongoose who protects a family from cobras — small, brave, relentless. Harbor Defense, the Sentinel System, Defense Klaus. The platform protects its members the way Rikki-Tikki protects his family.',
    category: 'fable',
    series: 'The Jungle Book',
    usedIn: ['literaryCanon.ts'],
  },
  {
    id: 'jungle-book',
    title: 'The Jungle Book',
    author: 'Rudyard Kipling',
    year: 1894,
    principle: 'Law of the Pack',
    connection: 'Not the Disney movie — the REAL book. Mowgli learns the Law of the Jungle from wolves, bears, and panthers. "The strength of the pack is the wolf, and the strength of the wolf is the pack." Guild chapters. Tribe loyalty. The 300.',
    category: 'fable',
    usedIn: ['literaryCanon.ts'],
    founderNote: 'Not the movie, but the real book.',
  },
  {
    id: 'just-so-stories',
    title: 'Just So Stories',
    author: 'Rudyard Kipling',
    year: 1902,
    principle: 'Origin Stories',
    connection: 'How the Leopard Got His Spots. How the Camel Got His Hump. Every innovation has an origin story — the Coaster Medallion started as a Fusion 360 gear, became a QR card, became a prototype that was too big, fit on a tea mug... The Forge documents these "Just So" moments.',
    category: 'fable',
    usedIn: ['literaryCanon.ts'],
  },

  // === MYTHOLOGY & CLASSICS ===
  {
    id: 'arabian-nights',
    title: 'One Thousand and One Nights',
    author: 'Traditional (compiled c. 8th-13th century)',
    year: 800,
    principle: 'Progressive Disclosure',
    connection: 'The REAL Arabian Nights — stories within stories within stories, each one unlocking the next. Scheherazade survived by making the listener want to hear what comes next. The Alcove System is exactly this: 18 stops, each one revealing more, each one making you curious about the next.',
    category: 'mythology',
    usedIn: ['literaryCanon.ts'],
    founderNote: 'The real Arabian Nights, not the Disney version.',
  },
  {
    id: 'jason-argonauts',
    title: 'Jason and the Argonauts',
    author: 'Apollonius of Rhodes (Argonautica)',
    year: -250,
    principle: 'Assembled Team on a Quest',
    connection: 'Jason assembles the greatest heroes of Greece — each with a unique skill — aboard the Argo to retrieve the Golden Fleece. A guild chapter roster IS the Argo. Forge Master, Anvil Striker, Flame Tender, Bellows Caller, Hammer Smith, Water Bearer, Apprentice — each one essential, each one different.',
    category: 'mythology',
    usedIn: ['literaryCanon.ts'],
  },

  // === O. HENRY ===
  {
    id: 'o-henry',
    title: 'The Gift of the Magi',
    author: 'O. Henry (William Sydney Porter)',
    year: 1905,
    principle: 'Reciprocal Sacrifice',
    connection: 'She sells her hair to buy him a watch chain. He sells his watch to buy her hair combs. The twist: their sacrifices cancel out — but the love doesn\'t. Marks work the same way. You back them as confidence in your ability. You deploy them for others. The value is in the act of participating, not in what you accumulate.',
    category: 'satire',
    usedIn: ['literaryCanon.ts'],
  },
];

// ============================================================================
// HELPERS
// ============================================================================

export function getLiteraryReferencesByPrinciple(principle: string): LiteraryReference[] {
  return LITERARY_CANON.filter(ref =>
    ref.principle.toLowerCase().includes(principle.toLowerCase())
  );
}

export function getLiteraryReferencesByCategory(category: LiteraryCategory): LiteraryReference[] {
  return LITERARY_CANON.filter(ref => ref.category === category);
}

export function getFounderNotes(): LiteraryReference[] {
  return LITERARY_CANON.filter(ref => ref.founderNote);
}

/**
 * Get a random literary quote for display in the platform.
 * Used in Alcove comprehension questions and Cue Card backs.
 */
export function getRandomLiteraryConnection(): LiteraryReference {
  return LITERARY_CANON[Math.floor(Math.random() * LITERARY_CANON.length)];
}
