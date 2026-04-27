/**
 * K522.7 Phase C — FounderVoice Scribe Seeding
 * 35 FV-ANEC-### tablet entries (33 written + 2 placeholder stubs)
 * Idempotent: checks for existing FV-ANEC entries before appending
 */
import { readFileSync, appendFileSync } from 'fs';

const scribePath = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\librarian-mcp\\stitchpunks\\scribes\\scribe_FounderVoice.jsonl';
const existing = readFileSync(scribePath, 'utf8');

// Check if already seeded
if (existing.includes('FV-ANEC-001')) {
  console.log('FounderVoice Scribe already contains FV-ANEC entries. Idempotent skip.');
  process.exit(0);
}

const TS = '2026-04-27T09:30:00Z';
const SESSION = 'K522.7/B128';

// Master Registry → Supabase ID mapping (from K522.6 results)
// Format: [master_num, supabase_id, title, key_lesson, best_for, tone, tags]
const tablets = [
  [1,  4,  'The Paper Route (Montana, Age 13)',
   "Don't exploit other people, even when you have been exploited. The laborer is worthy of his hire.",
   'Platform philosophy, empathy with creators, Cost+20%, gig economy critique',
   'Personal, empathetic, formative',
   ['cost-plus-20', 'exploitation', 'platform-ethics', 'origin-story', 'montana']],

  [2,  5,  'The Intramural Giants (College)',
   "You don't have to win. You have to create the opening for someone else to win.",
   'Cooperative philosophy, teamwork, platform as enabler',
   'Action, determination, team success',
   ['teamwork', 'cooperative', 'sacrifice', 'create-openings', 'not-around-through']],

  [3,  14, 'The Go-Kart Scar (Age 7, Brownsville TN)',
   'Learn from others\' experience, not just your own mistakes.',
   'Planning philosophy, iteration, 1,200 prototypes context',
   'Self-deprecating, wise, lessons learned',
   ['iteration', 'planning', 'learning', 'experience', 'childhood']],

  [4,  15, 'The Pizza Morale Operation (OCS)',
   'Creative problem-solving within rules. Taking initiative. Taking care of your people.',
   'Leadership stories, resourcefulness, military background',
   'Mischievous, caring, practical',
   ['leadership', 'ocs', 'military', 'morale', 'resourcefulness']],

  [5,  16, "Captain Lindy's Gortex (OCS)",
   'Leadership vs management. Taking care of people even when leadership doesn\'t.',
   'Leadership philosophy, caring for community, contrast with extractive platforms',
   'Wry, observational, quietly defiant',
   ['leadership', 'management', 'ocs', 'morale', 'tic-tacs']],

  [6,  17, 'The Deodorant Flight',
   'Check everything twice. Humility in mistakes.',
   'Self-deprecating humor, relating to audience, admitting imperfection',
   'Humorous, self-deprecating, relatable',
   ['humility', 'mistakes', 'humor', 'self-deprecating']],

  [7,  18, 'NextAddress.com (2004–2006)',
   'Being first doesn\'t guarantee success. Keep building. Persistence matters.',
   'Prior experience in tech, startup landscape, persistence',
   'Matter-of-fact, resilient, experienced',
   ['startups', 'persistence', 'google-maps', 'nextaddress', 'prior-art']],

  [8,  19, "Ylona's Kitten Proposal (Daughter, Age 10)",
   '"Expected no, tried anyway." The entrepreneurial spirit.',
   'Entrepreneurship philosophy, family values, courage to pitch',
   'Touching, proud, instructive',
   ['entrepreneurship', 'courage', 'expected-no-tried-anyway', 'family', 'ylona']],

  [9,  20, 'The Grocery Pickup Pivot',
   '"Never despair at the immediacy of your circumstance."',
   'Resilience, adaptation, keeping perspective',
   'Calm, reassuring, practical',
   ['resilience', 'adaptation', 'never-despair', 'family', 'perspective']],

  [10, 9,  "The Bridge-Builder (Dad's Story)",
   'Build for those who follow. Every patent is a bridge.',
   'Patent philosophy, why freely licensed, legacy thinking',
   'Wisdom, legacy, generational thinking',
   ['patents', 'legacy', 'bridge-builder', 'father', 'generational']],

  [11, 21, 'The Liana Banyan Name Origin',
   'One tree becomes a forest. Interconnection creates protection.',
   'Brand story, mission explanation, origin story',
   'Poetic, foundational, mythical',
   ['brand-story', 'liana-banyan', 'name-origin', 'interconnection', 'mangrove']],

  [12, 22, 'The Floating Cities (6th Grade)',
   'Vision persists. Childhood ideas become adult reality.',
   'Origin story, long-term vision, dedication to mission',
   'Visionary, persistent, full-circle',
   ['origin-story', 'vision', 'floating-cities', 'childhood', 'long-term']],

  [13, 23, 'The Africa Baobab Tree',
   'Growth through replication. Platform incubator model.',
   'Growth philosophy, platform as incubator, African heritage',
   'Natural, organic, observational',
   ['africa', 'baobab', 'growth', 'replication', 'incubator']],

  [14, 7,  'Pizza for Ice Cream (College)',
   'When you trade at cost instead of retail, everyone wins massively. The margin is where the magic is.',
   'Explaining Cost+20%, origin of economic thinking, cooperative commerce philosophy',
   'Practical, clever, entrepreneurial',
   ['cost-plus-20', 'trade-at-cost', 'pizza', 'ice-cream', 'cooperative-economics']],

  [15, 10, 'The Kurt Ikard Confrontation (High School Freshman)',
   '"I will not ever give up. Ever." Persistence as strategy.',
   'Persistence philosophy, underdog stories, refusing to quit, entrepreneurship mindset',
   'Defiant, determined, strategic, formative',
   ['persistence', 'kurt', 'bullying', 'never-give-up', 'strategy']],

  [16, 24, 'The Megamind Lesson (Movie Reference)',
   'Losing teaches. Fighting — even hopelessly — builds character. Persistence is omnipotent.',
   'Philosophy of persistence, embracing failure, entrepreneurship',
   'Pop culture reference, accessible, inspiring',
   ['megamind', 'persistence', 'losing', 'failure', 'calvin-coolidge']],

  [17, 25, 'Brakeless (High School Bike)',
   'Plan ahead. React quickly with hastily created backup plans. Get back on the bike.',
   'Entrepreneurship (no brakes, full speed), iteration philosophy, military connection',
   'Self-deprecating, adventurous, formative',
   ['brakeless', 'bike', 'planning', 'aviation', 'carlene']],

  [18, 26, 'Helicopter Navigation (Aviation Philosophy)',
   'Constant correction is not failure — it\'s how you reach the destination. Arrival matters.',
   'Iteration philosophy, platform development, long-term vision',
   'Professional, calm, earned wisdom',
   ['helicopter', 'aviation', 'kiowa-warrior', 'iteration', 'constant-correction']],

  [19, 27, 'The Green Metro (No Reverse, No A/C)',
   'Adapt. Work around limitations. Plan your exit before you park.',
   'Resourcefulness, making do, entrepreneurship on a budget',
   'Humorous, scrappy, practical',
   ['chevy-metro', 'no-reverse', '4-90', 'adaptation', 'resourcefulness']],

  [20, 28, 'The 1978 CJ-7 Jeep (No Gauges, Leaking Gas Tank)',
   'Sometimes you have to drive home with a leaking gas tank. Then fix it.',
   'Calculated risk, faith under pressure, resourcefulness',
   'Matter-of-fact courage, quiet faith',
   ['jeep', 'cj-7', 'leaking-gas', 'faith', 'calculated-risk']],

  [21, 29, 'The Jeep That Fell Apart (20+ Breakdowns)',
   'You learn by things falling apart. Every breakdown is a lesson.',
   'Learning by doing, iteration, School of Hard Knocks, self-taught skills',
   'Wry, reflective, grateful to be alive',
   ['jeep', 'breakdowns', 'learning-by-doing', 'iteration', 'drive-shaft']],

  [22, 30, 'Christmas Eve 1992 (Expelled, Homeless, Landing on Feet)',
   'Land on your feet. Start from nothing. Build from there.',
   'Origin story, resilience, starting from zero, understanding struggle',
   'Raw, honest, formative trauma turned into strength',
   ['christmas-1992', 'expelled', 'homeless', 'jeep', 'origin-story']],

  [23, 31, 'The $175 Apartment (Missing Wall, Half His Income)',
   'A roof with a tarp wall is still a roof. Start somewhere.',
   'Humble beginnings, empathy with struggling members, why $5 matters',
   'Matter-of-fact, no self-pity',
   ['175-apartment', 'tarp-wall', 'humble-beginnings', 'poverty', 'origin-story']],

  [24, null, 'Walking Naked to Pool (1st Grade)',
   '[PLACEHOLDER — Founder to fill in]',
   '[TBD — 1st grade, school pool incident]',
   '[TBD]',
   ['placeholder', '1st-grade', 'pool', 'childhood']],

  [25, 32, 'Sinbad Uncurling His Fist (Movie Reference)',
   'Do the right thing even when you\'re going to lose. The uncurled fist.',
   'Philosophy of sacrifice, doing right regardless of outcome, courage, faith',
   'Inspirational, movie reference, deeply personal',
   ['sinbad', 'uncurled-fist', 'sacrifice', 'princess-bride', 'braveheart']],

  [26, 33, "The 11th Birthday Party (Children's Home)",
   'Rejection. Outsider status. Origin of empathy for the marginalized.',
   'Origin of empathy, understanding outsiders, why platform is for everyone',
   '[Partial — expand with Founder pass]',
   ['birthday', 'childrens-home', 'rejection', 'outsider', 'empathy']],

  [27, null, '5-Mile Walk Home (Age 4, Dar es Salaam)',
   '[PLACEHOLDER — Founder to fill in]',
   '[TBD — Dar es Salaam, self-reliance, early independence]',
   '[TBD]',
   ['placeholder', 'dar-es-salaam', 'age-4', 'tanzania', 'self-reliance']],

  [28, 34, "Learning to Fight (The Children's Home)",
   'Survival. Earning respect. Refusing to be a victim. Precursor to Kurt (#15).',
   'Origin of persistence, fighting spirit, refusing to quit',
   '[Partial — expand with Founder pass]',
   ['childrens-home', 'fighting', 'survival', 'persistence', 'kurt-precursor']],

  [29, 35, 'Learning to Swim (Captain Kirk)',
   'Jump in. Figure it out. Go THROUGH, not around. It\'s never too late to start.',
   'Learning by doing, courage before you\'re ready, overcoming impossible odds',
   'Bold, self-deprecating, determined',
   ['swimming', 'captain-kirk', 'lifeguard', 'never-too-late', 'advanced-swimming']],

  [30, 6,  "The Roommate's Suit (College)",
   'A little generosity from someone with little means EVERYTHING.',
   'Why $5 membership matters, generosity from scarcity, Seedling system',
   'Emotional, grateful, formative',
   ['roommate-suit', 'generosity', 'scarcity', 'seedling', '5-dollar-membership']],

  [31, 36, 'The Facebook Friend with Cancer',
   'No one should have to choose between trying to save their life and the livelihood of survivors.',
   'SWOOP initiative, MSA, LifeLine Medications, healthcare letters',
   'Raw, grief, righteous anger',
   ['swoop', 'cancer', 'healthcare', 'msa', 'impossible-choice']],

  [32, 12, 'Pet Antibiotics for My Daughter',
   'The hustle shouldn\'t be required just to breathe. This is why LifeLine Medications exists.',
   'Healthcare initiative, MSA, LifeLine Medications, empathy with struggling members',
   'Matter-of-fact survival, no self-pity, determination',
   ['pet-antibiotics', 'healthcare', 'msa', 'lifeline', 'hustle']],

  [33, 37, "Grandpa's Bean Soup (The Depression Legacy)",
   'Generational poverty. Community support. Difficult. Not Impossible.',
   'Origin story, generational wealth/poverty, Boaz Principle, persistence',
   'Family history, reverent, formative',
   ['grandpa', 'bean-soup', 'depression', 'boaz-principle', 'difficult-not-impossible']],

  [34, 38, 'The Fire Chief Mantra',
   'Accept responsibility. Put others first. Even when YOU are the one falling.',
   'Leadership philosophy, platform values, selflessness',
   'Reverent, aspirational, core value',
   ['fire-chief', 'i-slipped-is-she-okay', 'selflessness', 'leadership', 'responsibility']],

  [35, 39, 'The Starfish Story (Hemingway Version)',
   'No effort is wasted. You can\'t save everyone, but you can save SOMEONE.',
   'SWOOP, individual impact, why small actions matter',
   'Hopeful, determined, compassionate',
   ['starfish', 'swoop', 'individual-impact', 'no-effort-wasted', 'hemingway']],
];

// Also stubs for #36-#41 (await Founder pass)
const stubs = [
  [36, 1,  "The Shop That Fixed My Son's Car", 'Origin of Cost+20%. Transparency is the product.', 'Cost+20%, platform ethics, cooperative commerce', 'Matter-of-fact, revelatory', ['shop', 'cost-plus-20', 'universal-city', 'pudding-182', 'transparency']],
  [37, 2,  'Hit the Triple Double', 'Three doubles. No lottery odds. Work, not luck.', 'Economic literacy, Smart/Poor canon, platform pitch', 'Practical, ambitious, no-nonsense', ['triple-double', 'smart-poor', 'economics', 'pudding-183', 'goal-setting']],
  [38, 3,  "The 'To Blave' Technique", 'Two levels above bare dirt is the way. Bluff the pricing logic, not the value.', 'Smart/Poor canon, cooperative value, Five Dollar Stack', 'Clever, analytical, Star Wars + Princess Bride', ['to-blave', 'smart-poor', 'princess-bride', '7-10-rule', 'cyber-monday']],
  [39, 8,  'The USAA Lifeline', 'A little generosity at the right moment changes a life.', 'Village Savings & Loans, microloan pitch, MSA', 'Grateful, earnest, direct', ['usaa', 'microloan', 'generosity', 'village-savings', 'timing']],
  [40, 11, "The Golden Eagle's Head", 'When something wrong happens, ACT. The crowd follows if you lead.', 'Leadership, taking initiative, Haruchai philosophy', 'Short, action, decisive', ['golden-eagle', 'pep-band', 'leadership', 'action', 'haruchai']],
  [41, 13, 'The Squad Car Mannequin', 'The perception of watchfulness is as effective as actual watchfulness.', 'AI moderation, Haruchai system, Banner AI, governance', 'Observational, analytical, systems-thinking', ['squad-car', 'mannequin', 'haruchai', 'banner-ai', 'uncertainty']],
];

const allEntries = [...tablets, ...stubs];

let appended = 0;
for (const [num, supabaseId, title, keyLesson, bestFor, tone, tags] of allEntries) {
  const paddedNum = String(num).padStart(3, '0');
  const entry = {
    id: `FV-ANEC-${paddedNum}`,
    ts: TS,
    session: SESSION,
    type: num <= 35 ? 'anecdote_tablet' : 'anecdote_stub_awaiting_founder_pass',
    master_registry_num: num,
    supabase_id: supabaseId,
    hugo_path: supabaseId ? 'Cephas/cephas-hugo/content/founder/anecdotes.md' : null,
    title,
    key_lesson: keyLesson,
    best_for: bestFor,
    tone,
    tags,
    status: supabaseId === null ? 'placeholder_no_prose' : (num >= 36 ? 'stub_awaiting_founder_ratification' : 'complete'),
    source: 'master_registry',
    seeded_by: 'K522.7_Phase_C',
  };
  appendFileSync(scribePath, '\n' + JSON.stringify(entry));
  appended++;
  const status = entry.status;
  console.log(`  ✓ FV-ANEC-${paddedNum} [${status}] — ${title}`);
}

console.log(`\nTotal appended: ${appended} entries to FounderVoice Scribe`);
console.log(`  33 complete (full Master Registry prose)`);
console.log(`  2 placeholder stubs (#24, #27 — no prose)`);
console.log(`  6 stubs awaiting Founder ratification (#36-#41)`);
