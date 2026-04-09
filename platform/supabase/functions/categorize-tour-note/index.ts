/**
 * CATEGORIZE-TOUR-NOTE — MoneyPenny keyword-based note categorization
 * ===================================================================
 * Receives a submitted tour note and classifies it by category + section.
 * Uses simple keyword/pattern matching (no LLM call — cost control).
 *
 * Input: { note_id, content, item_slug, item_title }
 * Process:
 *   1. Keyword-match to category (correction/suggestion/question/praise/criticism/idea)
 *   2. Look up item_slug's section in cephas_content_registry
 *   3. Map section to librarian_section_map → section_number
 *   4. Update tour_notes_submitted with category, section_librarian, status='categorized'
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Category Keyword Patterns ──────────────────────────────────────
const CATEGORY_PATTERNS: Array<{ category: string; patterns: RegExp[] }> = [
  {
    category: 'correction',
    patterns: [
      /\b(wrong|incorrect|error|mistake|typo|fix|should be|actually|not right|inaccurate)\b/i,
    ],
  },
  {
    category: 'question',
    patterns: [
      /\b(why|how does|what is|what are|where|when|who|can you explain|could you|please clarify)\b/i,
      /\?$/,
    ],
  },
  {
    category: 'suggestion',
    patterns: [
      /\b(what about|could you add|suggest|would be nice|consider|maybe add|you should|it would help)\b/i,
    ],
  },
  {
    category: 'praise',
    patterns: [
      /\b(great|love this|well done|amazing|excellent|fantastic|perfect|beautiful|impressive|awesome|brilliant)\b/i,
    ],
  },
  {
    category: 'criticism',
    patterns: [
      /\b(don't like|confusing|bad|poor|ugly|hard to|difficult to understand|not intuitive|frustrating|annoying)\b/i,
    ],
  },
  {
    category: 'idea',
    patterns: [
      /\b(what if|imagine|could be|envision|dream|concept|brainstorm|new idea|wouldn't it)\b/i,
    ],
  },
];

function categorizeContent(content: string): string {
  for (const { category, patterns } of CATEGORY_PATTERNS) {
    if (patterns.some((p) => p.test(content))) return category;
  }
  return 'uncategorized';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { note_id, content, item_slug, item_title } = await req.json();
    if (!note_id || !content) {
      return new Response(JSON.stringify({ error: 'note_id and content required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Categorize by keywords
    const category = categorizeContent(content);

    // 2. Look up the content item's category in cephas_content_registry
    let sectionNumber: number | null = null;
    if (item_slug) {
      const { data: contentRow } = await supabase
        .from('cephas_content_registry')
        .select('category')
        .eq('slug', item_slug)
        .single();

      if (contentRow?.category) {
        // 3. Map to librarian section
        const { data: sections } = await supabase
          .from('librarian_section_map')
          .select('section_number, categories');

        if (sections) {
          for (const sec of sections) {
            if (sec.categories?.includes(contentRow.category)) {
              sectionNumber = sec.section_number;
              break;
            }
          }
        }
      }
    }

    // Default to section 6 (Content & Articles) if no match
    if (!sectionNumber) sectionNumber = 6;

    // 4. Update the submitted note
    const { error: updateError } = await supabase
      .from('tour_notes_submitted')
      .update({
        category,
        section_librarian: sectionNumber,
        status: 'categorized',
      })
      .eq('id', note_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, category, section_librarian: sectionNumber }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
