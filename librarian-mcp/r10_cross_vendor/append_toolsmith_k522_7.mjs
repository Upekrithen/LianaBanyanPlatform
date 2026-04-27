import { appendFileSync } from 'fs';
const path = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\librarian-mcp\\stitchpunks\\scribes\\scribe_Toolsmith.jsonl';

const entries = [
  {
    id: 'TS-082',
    created_at: '2026-04-27T09:45:00Z',
    title: 'founder_prose_worksheet_not_draft_pattern',
    summary: 'When a canonical content item requires Founder-voice prose that Knight cannot generate (anecdotes, personal narratives, ratification-required text), the correct artifact is a WORKSHEET (scaffold + pre-loaded existing prose + [FOUNDER FILL] markers), NOT a draft with placeholder text. Anti-pattern: Knight generates plausible-sounding Founder-voice prose that Founder must then remove - 60-80% rewrite expected, wastes Founder time, risks canonicalization of non-Founder prose. Pattern: (1) Pre-load whatever prose exists from secondary surfaces (Supabase, Hugo, prior migrations). (2) Mark missing fields explicitly with [FOUNDER FILL]. (3) Include expansion prompts for partial entries. (4) Section 4 of worksheet = 2026 fresh-capture pass. K522.7 empirical anchor: 6-entry worksheet (#36-#41) + 2 placeholder templates + 2 partial templates. Founder 30-min pass = complete. Alternative would have been 6 hallucinated anecdotes that Founder must overwrite.',
    tags: ['founder_prose', 'worksheet_pattern', 'scaffold', 'anti_draft', 'canonical_anecdotes', 'k522.7'],
    session: 'K522.7',
    cross_ref: ['TS-079', 'FV-ANEC-001', 'project_founder_voice_discipline', 'feedback_drafts_as_scaffolding'],
  },
  {
    id: 'TS-083',
    created_at: '2026-04-27T09:46:00Z',
    title: 'detective_scribe_second_application_embedded_anecdote_audit',
    summary: 'K522.7 Phase D: second empirical application of Detective Scribe inter-Scribe-polling pattern (A&A #2316). Scope: Cephas content surfaces for embedded Founder anecdotes not tracked in Master Registry. Method: keyword-regex pattern scan across Puddings (28), Crown Letters (5), Founder category (2), tidbits.jsonl (163). Result: 0 untracked candidates. Key finding: false-positive rate = 100% (7 hits, 0 true positives) -- family-keyword filter too broad. Recommended improvement: biographical-setting pre-filter (Montana|Tennessee|Tanzania|OCS|college|Army) before family-keyword scan. 15-min sweep time at 28-Pudding scale. BST Episodes + Spoonfuls empty at K522.7 -- K522.8 re-run needed. The Drink Cookbook Pudding is K522.8 candidate.',
    tags: ['detective_scribe', 'embedded_anecdote', 'cephas_audit', 'second_application', 'a2316', 'false_positive', 'pattern_refinement', 'k522.7'],
    session: 'K522.7',
    cross_ref: ['TS-081', '#2316', 'AA_FORMAL_2316_DETECTIVE_SCRIBE', 'project_detective_scribe_b128', 'K522.8_candidate'],
  },
];

for (const e of entries) {
  appendFileSync(path, '\n' + JSON.stringify(e));
  console.log(`Appended ${e.id}: ${e.title}`);
}
