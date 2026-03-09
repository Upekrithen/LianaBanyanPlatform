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
  // Academic Papers — Attention as Funding
  '/academic-papers/attention-as-funding': [
    { keyWord: 'TRIANGULATE', method: 'embedded', position: 'middle' },
    { keyWord: 'VIEWPORT', method: 'hidden_text', position: 'end' },
  ],
  // Academic Papers — Grassroots Intelligence
  '/academic-papers/grassroots-intelligence': [
    { keyWord: 'SYBIL', method: 'cipher', position: 'middle' },
    { keyWord: 'ZEROGRAPHIC', method: 'hidden_text', position: 'start' },
  ],
  // Academic Papers — Muffled Rule
  '/academic-papers/muffled-rule': [
    { keyWord: 'SHIRLEY', method: 'embedded', position: 'middle' },
    { keyWord: 'COVERAGE', method: 'hidden_text', position: 'end' },
  ],
  // Academic Papers — Marks Democracy
  '/academic-papers/marks-democracy': [
    { keyWord: 'CORNERSTONE', method: 'embedded', position: 'middle' },
    { keyWord: 'PERMANENT', method: 'hidden_text', position: 'start' },
  ],
  // Cue Cards
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
  // Battery Campaign
  '/battery/grassroots-intelligence': [
    { keyWord: 'PETITION', method: 'embedded', position: 'start' },
    { keyWord: 'THREESECONDS', method: 'cipher', position: 'middle' },
    { keyWord: 'EXPEDITION', method: 'embedded', position: 'end' },
  ],
  // HexIsle
  '/hexisle/world-3d': [
    { keyWord: 'GONDOLA', method: 'embedded', position: 'middle' },
    { keyWord: 'ALLACCESS', method: 'hidden_text', position: 'end' },
  ],
  '/hexisle/overworld': [
    { keyWord: 'WARPPIPE', method: 'embedded', position: 'middle' },
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
  CONTENT_KEY_MAP,
};
