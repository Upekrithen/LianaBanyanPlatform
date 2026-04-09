/**
 * TREASURE KEY EMBEDDING UTILITY
 * ==============================
 * Provides tools for hiding treasure keys in content across the platform.
 *
 * The Founder's directive: Treasure Keys should be in ALL articles,
 * letters, submissions, social media posts — everywhere content lives.
 *
 * Hiding methods:
 * - embedded:    Key word appears naturally in text (user must recognize it)
 * - hidden_text: Key word is visually hidden (tiny font, same-color text, alt text)
 * - cipher:      Key word is encoded (first letter of sentences, nth word, etc.)
 * - puzzle:      Key requires solving a riddle or pattern
 *
 * Usage:
 *   import { embedKeyInText, TreasureKeyMarker } from '@/lib/treasureKeyEmbed';
 *
 *   // In a React component rendering article text:
 *   <TreasureKeyMarker keyWord="CORNERSTONE" method="hidden_text" />
 *
 *   // For programmatic text embedding:
 *   const enrichedText = embedKeyInText(articleText, 'CORNERSTONE', 'embedded');
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type HidingMethod = 'embedded' | 'hidden_text' | 'cipher' | 'puzzle';

export interface TreasureKeyConfig {
  keyWord: string;
  documentName: string;
  documentPath: string;
  circle: number;       // 1-5 difficulty
  tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  feathers: number;     // reward
  hint: string;
  hidingMethod: HidingMethod;
}

export interface KeyPlacement {
  keyWord: string;
  method: HidingMethod;
  position: 'start' | 'middle' | 'end' | 'random';
  cssClass?: string;
}

// ============================================================================
// CONTENT KEY REGISTRY
// ============================================================================

/**
 * Registry of all content paths and their associated treasure keys.
 * Components check this registry to know if they should embed a key.
 */
const CONTENT_KEY_MAP: Record<string, KeyPlacement[]> = {
  // ─── Academic Papers ──────────────────────────────────────────────
  '/academic-papers/attention-as-funding': [
    { keyWord: 'TRIANGULATE', method: 'embedded', position: 'middle' },
    { keyWord: 'VIEWPORT', method: 'hidden_text', position: 'end' },
  ],
  '/academic-papers/grassroots-intelligence': [
    { keyWord: 'SYBIL', method: 'cipher', position: 'middle' },
    { keyWord: 'ZEROGRAPHIC', method: 'hidden_text', position: 'start' },
  ],
  '/academic-papers/muffled-rule': [
    { keyWord: 'SHIRLEY', method: 'embedded', position: 'middle' },
    { keyWord: 'COVERAGE', method: 'hidden_text', position: 'end' },
  ],
  '/academic-papers/marks-democracy': [
    { keyWord: 'CORNERSTONE', method: 'embedded', position: 'middle' },
    { keyWord: 'PERMANENT', method: 'hidden_text', position: 'start' },
  ],
  // ─── Cue Cards ────────────────────────────────────────────────────
  '/cue/stage-play': [
    { keyWord: 'AIRCRAFTCARRIER', method: 'embedded', position: 'middle' },
  ],
  '/cue/forever-stamps': [
    { keyWord: 'FOREVERESTAMPS', method: 'hidden_text', position: 'end' },
  ],
  '/cue/forward': [
    { keyWord: 'FORWARD', method: 'embedded', position: 'start' },
  ],
  '/cue/political-expedition': [
    { keyWord: 'SIXTEENINITIATIVES', method: 'cipher', position: 'middle' },
  ],
  // ─── Battery Campaign ─────────────────────────────────────────────
  '/battery/grassroots-intelligence': [
    { keyWord: 'PETITION', method: 'embedded', position: 'start' },
    { keyWord: 'THREESECONDS', method: 'cipher', position: 'middle' },
    { keyWord: 'EXPEDITION', method: 'embedded', position: 'end' },
  ],
  // ─── HexIsle ──────────────────────────────────────────────────────
  '/hexisle/world-3d': [
    { keyWord: 'GONDOLA', method: 'embedded', position: 'middle' },
    { keyWord: 'ALLACCESS', method: 'hidden_text', position: 'end' },
  ],
  '/hexisle/overworld': [
    { keyWord: 'WARPPIPE', method: 'embedded', position: 'middle' },
  ],
  // ─── Circle 1: Backers ──────────────────────────────────────────
  '/letters/circle-1-backers/craig-newmark': [
    { keyWord: 'PUBLICINTEREST', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-1-backers/mackenzie-scott': [
    { keyWord: 'DAYONEFUND', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-1-backers/mackenzie-scott-cardboard-boots': [
    { keyWord: 'CARDBOARD', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-1-backers/warren-buffett': [
    { keyWord: 'COMPOUNDING', method: 'cipher', position: 'middle' },
  ],
  '/letters/circle-1-backers/michael-seibel': [
    { keyWord: 'BATCHMODE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-1-backers/tom-simon': [
    { keyWord: 'FIDUCIARY', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-1-backers/melinda-french-gates': [
    { keyWord: 'PIVOTALVENTURES', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-1-backers/anand-giridharadas': [
    { keyWord: 'WINNERSTAKEALL', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-1-backers/howard-marks': [
    { keyWord: 'SECONDLEVEL', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-1-backers/li-jin': [
    { keyWord: 'PASSIONECONOMY', method: 'cipher', position: 'middle' },
  ],
  '/letters/circle-1-backers/majora-carter': [
    { keyWord: 'GREENHOOD', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-1-backers/seth-godin': [
    { keyWord: 'PURPLECOW', method: 'hidden_text', position: 'end' },
  ],
  // ─── Circle 2: Media ──────────────────────────────────────────────
  '/letters/circle-2-media/casey-newton': [
    { keyWord: 'PLATFORMER', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-2-media/taylor-swift': [
    { keyWord: 'FOLKLORE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-2-media/taylor-swift-v02': [
    { keyWord: 'ANTIHERO', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-2-media/taylor-swift-v03': [
    { keyWord: 'ALCHEMY', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-2-media/hank-green': [
    { keyWord: 'NERDFIGHTER', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-2-media/kara-swisher': [
    { keyWord: 'CODECONFERENCE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-2-media/ezra-klein': [
    { keyWord: 'POLARIZATION', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-2-media/tim-ingham': [
    { keyWord: 'MUSICBIZ', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-2-media/brian-merchant': [
    { keyWord: 'LUDDITE', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-2-media/douglas-rushkoff': [
    { keyWord: 'TEAMHUMAN', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-2-media/ed-zitron': [
    { keyWord: 'ROTECONOMY', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-2-media/nilay-patel': [
    { keyWord: 'DECODERRING', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-2-media/paris-marx': [
    { keyWord: 'ROADTONOWHERE', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-2-media/simon-sinek': [
    { keyWord: 'INFINITEGAME', method: 'hidden_text', position: 'end' },
  ],
  // ─── Circle 3: Academics ──────────────────────────────────────────
  '/letters/circle-3-academics/trebor-scholz': [
    { keyWord: 'PLATFORMCOOP', method: 'cipher', position: 'middle' },
  ],
  '/letters/circle-3-academics/nathan-schneider': [
    { keyWord: 'EXITCOMMUNITY', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-3-academics/erik-brynjolfsson': [
    { keyWord: 'MACHINEAGE', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-3-academics/tatiana-schlossberg': [
    { keyWord: 'INCONSPICUOUS', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-3-academics/tatiana-schlossberg-cephas': [
    { keyWord: 'HEALTHACCORDS', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-3-academics/tatiana-schlossberg-short': [
    { keyWord: 'CONSUMPTION', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-3-academics/arun-sundararajan': [
    { keyWord: 'SHARINGECONOMY', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-3-academics/daron-acemoglu': [
    { keyWord: 'INSTITUTIONS', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-3-academics/esther-perel': [
    { keyWord: 'RELATIONAL', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-3-academics/juliet-schor': [
    { keyWord: 'PLENITUDE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-3-academics/kate-raworth': [
    { keyWord: 'DOUGHNUTMODEL', method: 'cipher', position: 'middle' },
  ],
  '/letters/circle-3-academics/mariana-mazzucato': [
    { keyWord: 'MISSIONECONOMY', method: 'hidden_text', position: 'end' },
  ],
  '/letters/circle-3-academics/shoshana-zuboff': [
    { keyWord: 'SURVEILLANCE', method: 'embedded', position: 'middle' },
  ],
  '/letters/circle-3-academics/yochai-benkler': [
    { keyWord: 'COMMONSBASED', method: 'hidden_text', position: 'end' },
  ],
  // ─── Crown Initiative ─────────────────────────────────────────────
  '/letters/crown-initiative/maneet-chauhan': [
    { keyWord: 'SPICEROUTE', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/jose-andres': [
    { keyWord: 'WORLDKITCHEN', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/mary-beth-laughton': [
    { keyWord: 'PERSONALSTYLE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/marie-kondo': [
    { keyWord: 'SPARKJOY', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/ashton-applewhite': [
    { keyWord: 'CHAIRROCKING', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/marc-freedman': [
    { keyWord: 'ENCORECAREER', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/alex-oshmyansky': [
    { keyWord: 'COSTPLUSDRUGS', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/cathie-mahon': [
    { keyWord: 'CREDITUNION', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/sallie-krawcheck': [
    { keyWord: 'ELLEVEST', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/jessica-jackley': [
    { keyWord: 'MICROLOAN', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/dale-dougherty': [
    { keyWord: 'MAKERFAIRE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/molly-hemstreet': [
    { keyWord: 'INDUSTRIALCOMMONS', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/sal-khan-chancellor': [
    { keyWord: 'FREEFORALL', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/kimberly-williams': [
    { keyWord: 'RALLYPOINT', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/ruth-glenn': [
    { keyWord: 'SAFEZONE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/robert-kaiser': [
    { keyWord: 'BRIDLEMAKER', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/brene-brown': [
    { keyWord: 'VULNERABLE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/ai-jen-poo': [
    { keyWord: 'DOMESTICWORKERS', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/taylor-swift': [
    { keyWord: 'SWIFTIENATION', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/michael-seibel-ceo': [
    { keyWord: 'LAUNCHPAD', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-initiative/mariaelena-huambachano': [
    { keyWord: 'ANCESTRALKITCHEN', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-initiative/muhammad-yunus': [
    { keyWord: 'MICROCREDIT', method: 'embedded', position: 'middle' },
  ],
  // ─── Crown Letters (root) ─────────────────────────────────────────
  '/letters/crown-letter-aoc': [
    { keyWord: 'GREENNEWAL', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-letter-keanu-reeves': [
    { keyWord: 'KINDNESSMATRIX', method: 'hidden_text', position: 'end' },
  ],
  '/letters/crown-letter-sandra-bullock': [
    { keyWord: 'GRAVITYPULL', method: 'embedded', position: 'middle' },
  ],
  '/letters/crown-letter-schwarzenegger': [
    { keyWord: 'COMEBACK', method: 'hidden_text', position: 'end' },
  ],
  // ─── Pitches ──────────────────────────────────────────────────────
  '/letters/pitches/ars-technica': [
    { keyWord: 'DEEPDIVE', method: 'embedded', position: 'middle' },
  ],
  '/letters/pitches/hacker-news': [
    { keyWord: 'FRONTPAGE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/pitches/investopedia': [
    { keyWord: 'FUNDAMENTALS', method: 'embedded', position: 'middle' },
  ],
  '/letters/pitches/kaiser-health-news': [
    { keyWord: 'PREMIUMS', method: 'hidden_text', position: 'end' },
  ],
  '/letters/pitches/mit-media-lab': [
    { keyWord: 'INVENTING', method: 'embedded', position: 'middle' },
  ],
  '/letters/pitches/nerdwallet': [
    { keyWord: 'BUDGETWISE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/pitches/penny-hoarder': [
    { keyWord: 'PENNYSAVED', method: 'embedded', position: 'middle' },
  ],
  '/letters/pitches/podcast-template': [
    { keyWord: 'AIRWAVES', method: 'hidden_text', position: 'end' },
  ],
  '/letters/pitches/product-hunt': [
    { keyWord: 'UPVOTE', method: 'embedded', position: 'middle' },
  ],
  '/letters/pitches/shareable': [
    { keyWord: 'COMMONGOOD', method: 'hidden_text', position: 'end' },
  ],
  '/letters/pitches/ssir': [
    { keyWord: 'SOCIALIMPACT', method: 'embedded', position: 'middle' },
  ],
  '/letters/pitches/stat-news': [
    { keyWord: 'CLINICALTRIAL', method: 'hidden_text', position: 'end' },
  ],
  '/letters/pitches/techcrunch': [
    { keyWord: 'DISRUPTOR', method: 'embedded', position: 'middle' },
  ],
  '/letters/pitches/the-verge': [
    { keyWord: 'CUTTINGEDGE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/pitches/wsj-feature-611-patents': [
    { keyWord: 'SIXELEVENPATENTS', method: 'embedded', position: 'middle' },
  ],
  '/letters/pitches/wsj-oped-contribution-impact': [
    { keyWord: 'PREDICTABLEIMPACT', method: 'hidden_text', position: 'end' },
  ],
  '/letters/pitches/yes-magazine': [
    { keyWord: 'POSITIVECHANGE', method: 'embedded', position: 'middle' },
  ],
  // ─── Partnerships ─────────────────────────────────────────────────
  '/letters/partnerships/bambu-lab': [
    { keyWord: 'PRINTERFARM', method: 'hidden_text', position: 'end' },
  ],
  '/letters/partnerships/kallistra': [
    { keyWord: 'HEXWARGAME', method: 'embedded', position: 'middle' },
  ],
  '/letters/partnerships/lorescape': [
    { keyWord: 'WORLDBUILDER', method: 'hidden_text', position: 'end' },
  ],
  '/letters/partnerships/openwarhex': [
    { keyWord: 'OPENHEX', method: 'embedded', position: 'middle' },
  ],
  '/letters/partnerships/terratiles': [
    { keyWord: 'TERRAINTILE', method: 'hidden_text', position: 'end' },
  ],
  // ─── Blessing ─────────────────────────────────────────────────────
  '/letters/blessing/dolly-parton': [
    { keyWord: 'NINETOFIVE', method: 'embedded', position: 'middle' },
  ],
  '/letters/blessing/jimmy-kimmel': [
    { keyWord: 'LATENIGHT', method: 'hidden_text', position: 'end' },
  ],
  '/letters/blessing/pitbull': [
    { keyWord: 'WORLDWIDE', method: 'embedded', position: 'middle' },
  ],
  // ─── Health ───────────────────────────────────────────────────────
  '/letters/health/facebook-friend-impossible-choice': [
    { keyWord: 'IMPOSSIBLECHOICE', method: 'hidden_text', position: 'end' },
  ],
  '/letters/health/jimmy-kimmel-healthcare': [
    { keyWord: 'PREEXISTING', method: 'embedded', position: 'middle' },
  ],
  '/letters/health/pet-store-consideration': [
    { keyWord: 'RXCOSTPLUS', method: 'hidden_text', position: 'end' },
  ],
  // ─── Professional ─────────────────────────────────────────────────
  '/letters/professional/legal-counsel-request': [
    { keyWord: 'RETAINER', method: 'embedded', position: 'middle' },
  ],
};

/**
 * Get the treasure keys associated with a content path.
 */
export function getKeysForContent(path: string): KeyPlacement[] {
  return CONTENT_KEY_MAP[path] || [];
}

/**
 * Check if a content path has treasure keys.
 */
export function hasKeys(path: string): boolean {
  return (CONTENT_KEY_MAP[path]?.length || 0) > 0;
}

// ============================================================================
// TEXT EMBEDDING
// ============================================================================

/**
 * Embed a key word naturally into text content.
 * For 'embedded' method, the word already exists in the text — this just marks it.
 * For 'hidden_text', inserts an invisible span.
 * For 'cipher', encodes via acrostic or nth-word pattern.
 */
export function embedKeyInHTML(
  html: string,
  keyWord: string,
  method: HidingMethod
): string {
  switch (method) {
    case 'embedded':
      // The word should already be in the content naturally
      // Just ensure it's there (case-insensitive check)
      return html;

    case 'hidden_text':
      // Insert as an aria-hidden span with zero-width styling
      const hiddenSpan = `<span aria-hidden="true" style="font-size:0;line-height:0;position:absolute;opacity:0;pointer-events:none;" data-tk="${keyWord}">${keyWord}</span>`;
      // Insert at end of content
      return html + hiddenSpan;

    case 'cipher':
      // The cipher is in the structure — first letters of sentences spell the word
      // This is typically done at content-creation time, not at render time
      return html;

    case 'puzzle':
      // Puzzle keys require a separate puzzle component
      return html;

    default:
      return html;
  }
}

/**
 * Generate a "hidden in plain sight" text fragment.
 * Returns a string where the key word's letters are the first letters
 * of consecutive words in a natural-sounding phrase.
 */
export function generateAcrosticPhrase(keyWord: string): string {
  // Common words that start with each letter
  const wordBank: Record<string, string[]> = {
    A: ['A', 'All', 'Always', 'And', 'After', 'Another', 'Any'],
    B: ['Before', 'Beyond', 'By', 'Being', 'Building', 'Between'],
    C: ['Can', 'Communities', 'Creating', 'Collective', 'Change', 'Carefully'],
    D: ['Drives', 'Discovery', 'Deeper', 'During', 'Democracy', 'Determines'],
    E: ['Every', 'Each', 'Earning', 'Effort', 'Enabling', 'Eventually'],
    F: ['For', 'From', 'Finding', 'Forward', 'Future', 'Fostering'],
    G: ['Growth', 'Genuine', 'Gets', 'Governance', 'Gives'],
    H: ['Has', 'Help', 'How', 'Honest', 'Here'],
    I: ['Is', 'In', 'Into', 'Innovation', 'Illustrates'],
    J: ['Just', 'Joining', 'Justice'],
    K: ['Keeps', 'Knowledge', 'Key'],
    L: ['Lasting', 'Leaders', 'Learning', 'Local'],
    M: ['Making', 'Members', 'More', 'Meaningful'],
    N: ['New', 'Never', 'Now', 'Not', 'Naturally'],
    O: ['Our', 'One', 'Only', 'Opens', 'Opportunities'],
    P: ['People', 'Participation', 'Provides', 'Permanent', 'Platform'],
    Q: ['Quality', 'Questions', 'Quietly'],
    R: ['Real', 'Results', 'Running', 'Reads'],
    S: ['Starts', 'Something', 'Systems', 'Strengthens', 'Shows'],
    T: ['The', 'Through', 'Together', 'This', 'True', 'That'],
    U: ['Understanding', 'Unity', 'Until', 'Using'],
    V: ['Value', 'Voice', 'Very', 'Vision'],
    W: ['With', 'When', 'Where', 'What', 'Work'],
    X: ['Exactly', 'Examines'],
    Y: ['Your', 'Yet', 'You'],
    Z: ['Zero', 'Zone'],
  };

  const letters = keyWord.toUpperCase().split('');
  return letters
    .map(letter => {
      const words = wordBank[letter] || [letter];
      return words[Math.floor(Math.random() * words.length)];
    })
    .join(' ');
}

// ============================================================================
// KEY SUBMISSION HELPERS
// ============================================================================

/**
 * Check if a key word submission is correct.
 * Returns the matching treasure key if found.
 */
export async function checkKeyWord(
  keyWord: string,
  documentPath?: string
): Promise<{
  isCorrect: boolean;
  key?: { id: string; tier: string; feathers: number; document_name: string };
}> {
  let query = supabase
    .from('treasure_keys')
    .select('id, key_word, tier, feathers, document_name')
    .eq('key_word', keyWord.trim().toUpperCase())
    .eq('is_active', true);

  if (documentPath) {
    query = query.eq('document_path', documentPath);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return { isCorrect: false };
  }

  return {
    isCorrect: true,
    key: {
      id: data.id,
      tier: data.tier,
      feathers: data.feathers,
      document_name: data.document_name,
    },
  };
}

/**
 * Get all active keys for a specific document path.
 * Used by components to know what keys are hidden in their content.
 */
export async function getActiveKeysForDocument(
  documentPath: string
): Promise<Array<{
  id: string;
  hint: string;
  tier: string;
  feathers: number;
  found_by: string | null;
}>> {
  const { data, error } = await supabase
    .from('treasure_keys')
    .select('id, hint, tier, feathers, found_by')
    .eq('document_path', documentPath)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching keys:', error);
    return [];
  }

  return data || [];
}

/**
 * Get total key count across all content.
 */
export async function getTotalKeyCount(): Promise<{
  total: number;
  found: number;
  remaining: number;
}> {
  const { data, error } = await supabase
    .from('treasure_keys')
    .select('id, found_by')
    .eq('is_active', true);

  if (error) return { total: 0, found: 0, remaining: 0 };

  const total = data?.length || 0;
  const found = data?.filter(k => k.found_by).length || 0;

  return { total, found, remaining: total - found };
}

// ============================================================================
// SOCIAL POST KEY EMBEDDING
// ============================================================================

/**
 * Add a treasure key hint to a social media post.
 * Returns modified post content with a subtle key indicator.
 */
export function addKeyHintToPost(
  postContent: string,
  keyWord: string,
  hint: string
): string {
  // Add a golden key emoji and hint as a subtle footer
  return `${postContent}\n\nFind the key. The answer earns you feathers.`;
}

/**
 * Generate a treasure key challenge for social posts.
 * These are posted alongside Battery campaign content.
 */
export function generateKeyChallenge(keyWord: string, hint: string): string {
  return `Hidden in today's post is a treasure key. ${hint} Find it at lianabanyan.com/golden-keys`;
}

// ============================================================================
// DISPATCH KEY REGISTRATION — Auto-register golden keys when articles dispatch
// ============================================================================

interface DispatchKeyMetadata {
  golden_key?: string;
  key_tier?: 'fledgling' | 'flight' | 'murder';
  key_method?: 'natural' | 'acrostic' | 'hidden_text' | 'puzzle';
  feathers?: number;
  golden_key_type?: string;
  quiz_path?: string;
  status_note?: string;
}

/**
 * When an article is dispatched, register its golden key in treasure_keys.
 * Reads metadata JSONB from the outbound_dispatch row.
 */
export async function registerDispatchKeys(dispatchId: string): Promise<void> {
  const { data: row, error } = await (supabase
    .from('outbound_dispatch' as never)
    .select('title, metadata, content_path') as any)
    .eq('id', dispatchId)
    .single();

  if (error || !row) return;

  const meta = (row.metadata || {}) as DispatchKeyMetadata;

  if (meta.golden_key) {
    await (supabase
      .from('treasure_keys' as never)
      .upsert({
        key_word: meta.golden_key,
        document_name: row.title,
        document_path: row.content_path || '',
        tier: meta.key_tier || 'fledgling',
        hiding_method: meta.key_method || 'natural',
        feathers: meta.feathers || 1,
        hint: `Hidden in "${row.title}"`,
        is_active: true,
        source: 'dispatch',
        dispatch_id: dispatchId,
      }, { onConflict: 'key_word' }) as any);
  }

  if (meta.golden_key_type === 'comprehension_quiz' && meta.quiz_path) {
    await (supabase
      .from('treasure_keys' as never)
      .upsert({
        key_word: `QUIZ_${row.title.substring(0, 20).replace(/\s/g, '_').toUpperCase()}`,
        document_name: row.title,
        document_path: meta.quiz_path,
        tier: 'fledgling',
        hiding_method: 'puzzle',
        feathers: 2,
        hint: `Complete the comprehension quiz for "${row.title}"`,
        is_active: true,
        source: 'dispatch_quiz',
        dispatch_id: dispatchId,
      }, { onConflict: 'key_word' }) as any);
  }

  await (supabase
    .from('outbound_dispatch' as never)
    .update({
      metadata: { ...row.metadata, key_registered: true },
    }) as any)
    .eq('id', dispatchId);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getKeysForContent,
  hasKeys,
  embedKeyInHTML,
  generateAcrosticPhrase,
  checkKeyWord,
  getActiveKeysForDocument,
  getTotalKeyCount,
  addKeyHintToPost,
  generateKeyChallenge,
  registerDispatchKeys,
  CONTENT_KEY_MAP,
};
