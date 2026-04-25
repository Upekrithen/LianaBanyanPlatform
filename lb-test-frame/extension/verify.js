/**
 * LB Test Frame — Cathedral Effect Verification Demo
 * 25-question cold vs cathedral battery with deterministic substring grading.
 *
 * Flow:
 *   For each question:
 *     1. Show cold-ask phase → member pastes AI's unprimed answer
 *     2. Show cathedral-ask phase → member pastes AI's answer after context injection
 *   After all questions → grade → display lift → offer opt_in_share
 *
 * K502 / B124
 */

// ── Question bank (bundled) ───────────────────────────────────────────────────

// Questions loaded from the bundled fallback bank.
// In production, this is fetched from the extension's bundled JSON.
let QUESTIONS = [];
let currentIndex = 0;
let results = [];     // [{id, coldAnswer, cathedralAnswer, coldCorrect, cathedralCorrect}]
let selectedAI = 'unknown';
let cathedralContext = '';

// Cathedral context templates per question category
const CONTEXT_TEMPLATES = {
  economics: `Liana Banyan is a cooperative commerce platform. Key facts: Creators keep 83.3% of every transaction (never rounded to 83%). Platform margin is Cost+20%. On a $500 transaction, the creator receives $416.67. Membership costs $5/year. The three currencies are Credits (exchange 1:1 with dollars, one-way valve — cannot cash out), Marks (earned through effort, not purchased), and Joules (surplus/forever stamp currency). Per-person Credit cap: $5,000.`,

  platform: `Liana Banyan platform systems: Six Sparks = six effortful paths for new member visibility (some shareable, some not). Trust Match = mutual Mark-staking between strangers — each party stakes Marks; bad behavior forfeits stake. Good Standing Roll = inverted allowlist (platform tracks the good-standing list, not bad actors). Seasoning = time-gating on trust accumulation. Pedestal = featured creator recognition system. The Furnace = verification system + immutable public ledger that stamps badges, listings, and Marks.`,

  technology: `Liana Banyan technology: The Romulator 9000 is a ROM-first context persistence system for AI agents — context is pre-loaded before the agent's first token, eliminating cold-start re-establishment. The Furnace is LB's verification + immutable public ledger. Slow Blade is the rate-limit on Furnace stamps per account per unit time (bots rely on speed; Slow Blade makes speed useless). The Cathedral Effect is the measured improvement in AI accuracy when LB substrate context is pre-injected.`,

  identity: `Liana Banyan Corporation facts: Legal name is LIANA BANYAN CORPORATION. Wyoming C-Corporation, filed November 21, 2025. EIN: 41-2797446. Holding company: Upekrithen LLC (Wyoming, 100% owned). Founder: Jonathan Jones — 53-year-old ARNG veteran, FAA Commercial Rotary Wing IFR rating, father of eight, 37 years developing this system. Platform motto: "Help each other help ourselves." LRH is the platform guide character — animal/chess-piece visual, not human. Filing date: 2025-11-21.`,

  ip: `Liana Banyan IP facts: 13 provisional patent applications filed (most recent: 64/036,646, filed April 12, 2026). Approximately 2,412 formal claims. 225 Crown Jewels (innovations with no prior art found). IP revenue waterfall: Patent Buckets 60%, Founder/Creator 20%, Global Sponsor Pool 10%, Individual Patent Pedestals 10%. Conversion firms: Harrity & Harrity and Lloyd & Mousilli. First conversion deadline: November 26, 2026.`,

  governance: `Liana Banyan governance — The 300 Model: Three tiers — Crowns (invited domain experts, named seats), Board (elected by members), Captains (operational leaders). ADAPT Score replaces demographics with demonstrated capability. The Good Standing Roll is an inverted allowlist — platform maintains the in-good-standing list, not a blocklist. XP × Reputation weighting: every action multiplied by account's XP × Rep. Sybil accounts at 0 × 0 = 0 aggregate leverage.`,

  research: `The Cathedral Effect: Measured improvement in AI accuracy when Liana Banyan's substrate context (the "cathedral" — canonical memory pre-loaded before first token) is injected into AI sessions. Research benchmark R13 found a mean lift of approximately 86 percentage points across 8 AI vendors (cold HOT% vs cathedral HOT%). The Cathedral is the Romulator 9000's implementation in practice — the highway line painter carrying the paint can instead of walking back to the start.`,
};

// ── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  // Load prefs
  const prefs = await new Promise((res) => chrome.runtime.sendMessage({ type: 'GET_PREFS' }, res));
  selectedAI = prefs?.selectedAI ?? 'unknown';

  // Load question bank
  const bankUrl = chrome.runtime.getURL('../shared/question-bank/fallback_bank.json');
  try {
    const resp = await fetch(bankUrl);
    const bank = await resp.json();
    QUESTIONS = bank.questions;
  } catch {
    // Fallback to inline if fetch fails (extension context)
    QUESTIONS = getFallbackQuestions();
  }

  renderQuestion(0);
}

function renderQuestion(idx) {
  if (idx >= QUESTIONS.length) {
    showResults();
    return;
  }

  currentIndex = idx;
  const q = QUESTIONS[idx];
  const progress = (idx / QUESTIONS.length) * 100;

  document.getElementById('progress-fill').style.width = progress + '%';
  document.getElementById('progress-label').textContent = `Question ${idx + 1} of ${QUESTIONS.length}`;
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('question-text-cathedral').textContent = q.question;

  const context = CONTEXT_TEMPLATES[q.category] || CONTEXT_TEMPLATES.platform;
  cathedralContext = context;
  document.getElementById('cathedral-context').textContent = context;

  // Reset textarea values and show cold phase
  document.getElementById('cold-answer').value = '';
  document.getElementById('cathedral-answer').value = '';
  document.getElementById('cold-card').style.display = '';
  document.getElementById('cathedral-card').style.display = 'none';

  // Update LRH text
  if (idx === 0) {
    document.getElementById('lrh-text').textContent =
      '"Twenty-five questions. We\'ll ask each one twice — once cold, once with LB context. Watch what happens."';
  } else {
    document.getElementById('lrh-text').textContent =
      `"Question ${idx + 1}. Type this question into your AI, paste the answer, then we'll try it with LB context."`;
  }
}

function submitColdAnswer() {
  const answer = document.getElementById('cold-answer').value.trim();
  if (!answer) { alert('Please paste your AI\'s answer first.'); return; }

  // Grade cold answer
  const q = QUESTIONS[currentIndex];
  const coldCorrect = gradeAnswer(answer, q);

  // Store partial result
  results[currentIndex] = { id: q.id, category: q.category, coldAnswer: answer, coldCorrect, cathedralAnswer: null, cathedralCorrect: null };

  // Show cathedral phase
  document.getElementById('cold-card').style.display = 'none';
  document.getElementById('cathedral-card').style.display = '';
  document.getElementById('lrh-text').textContent =
    '"Now try it with LB context. Paste the context paragraph into a fresh tab first, then ask the question."';
}

function submitCathedralAnswer() {
  const answer = document.getElementById('cathedral-answer').value.trim();
  if (!answer) { alert('Please paste your AI\'s answer first.'); return; }

  const q = QUESTIONS[currentIndex];
  const cathedralCorrect = gradeAnswer(answer, q);
  results[currentIndex].cathedralAnswer = answer;
  results[currentIndex].cathedralCorrect = cathedralCorrect;

  renderQuestion(currentIndex + 1);
}

function skipQuestion() {
  const q = QUESTIONS[currentIndex];
  results[currentIndex] = { id: q.id, category: q.category, coldAnswer: null, coldCorrect: null, cathedralAnswer: null, cathedralCorrect: null };
  renderQuestion(currentIndex + 1);
}

function skipCathedralPhase() {
  results[currentIndex].cathedralAnswer = null;
  results[currentIndex].cathedralCorrect = null;
  renderQuestion(currentIndex + 1);
}

// ── Grading ───────────────────────────────────────────────────────────────────

function gradeAnswer(answer, question) {
  const answerLower = answer.toLowerCase();
  return question.correct_answers.some((correct) =>
    answerLower.includes(correct.toLowerCase())
  );
}

// ── Results ───────────────────────────────────────────────────────────────────

function showResults() {
  document.getElementById('quiz-view').style.display = 'none';
  document.getElementById('results-view').style.display = '';

  const completed = results.filter((r) => r && r.coldAnswer !== null);
  const coldCorrect = completed.filter((r) => r.coldCorrect).length;
  const cathedralCorrect = completed.filter((r) => r.cathedralCorrect).length;
  const questionsCompleted = completed.length;

  const coldPct = questionsCompleted > 0 ? Math.round((coldCorrect / questionsCompleted) * 100) : 0;
  const cathedralPct = questionsCompleted > 0 ? Math.round((cathedralCorrect / questionsCompleted) * 100) : 0;
  const liftPp = cathedralPct - coldPct;

  document.getElementById('cold-pct').textContent = coldPct + '%';
  document.getElementById('cathedral-pct').textContent = cathedralPct + '%';
  document.getElementById('lift-pp').textContent = (liftPp >= 0 ? '+' : '') + liftPp + ' pp';

  // LRH results text
  const lrhResult = document.getElementById('lrh-result-text');
  const correctImprovement = cathedralCorrect - coldCorrect;
  if (liftPp > 0) {
    lrhResult.textContent = `"Your AI answered ${correctImprovement} more question${correctImprovement !== 1 ? 's' : ''} correctly with the substrate. That's the Cathedral Effect — measured on your own session, not ours. By their fruits."`;
  } else if (liftPp === 0) {
    lrhResult.textContent = `"Your results were similar in both conditions. This can happen with very knowledgeable AI sessions or short question sets. Try running the full bank again."`;
  } else {
    lrhResult.textContent = `"Your cold result was higher this run. This can happen with small sample sizes or session variability. The Cathedral Effect is consistent over larger runs."`;
  }

  // Results sub
  const PUBLISHED_MEAN_LIFT = 86;
  const resultsSubEl = document.getElementById('results-sub');
  if (questionsCompleted < 10) {
    resultsSubEl.textContent = `Based on ${questionsCompleted} completed questions. Run more questions for a higher-confidence result.`;
  } else if (Math.abs(liftPp - PUBLISHED_MEAN_LIFT) <= 30) {
    resultsSubEl.textContent = `Your result of ${liftPp >= 0 ? '+' : ''}${liftPp} pp is consistent with LB's published research finding of a mean +${PUBLISHED_MEAN_LIFT} pp lift across 8 AI vendors.`;
  } else {
    resultsSubEl.textContent = `Your result of ${liftPp >= 0 ? '+' : ''}${liftPp} pp is ${liftPp > PUBLISHED_MEAN_LIFT ? 'above' : 'at the low end of'} the range we've measured (+5 to +98 pp). This can happen because of variations in your AI's training data, your specific session, or session-to-session model variability.`;
  }

  // Store result for sharing
  const verifyResults = {
    vendor: selectedAI,
    coldHotPct: coldPct,
    cathedralHotPct: cathedralPct,
    liftPp,
    questionsCompleted,
    completedAt: new Date().toISOString(),
  };
  chrome.runtime.sendMessage({ type: 'SET_PREFS', prefs: { verifyResults } });
}

function shareResult(preference) {
  chrome.runtime.sendMessage({ type: 'SET_PREF', key: 'sharePreference', value: preference });

  // Read stored results and submit
  chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
    if (prefs.verifyResults) {
      chrome.runtime.sendMessage({ type: 'SUBMIT_VERIFY_RESULTS', results: prefs.verifyResults }, (resp) => {
        const msg = preference === 'private'
          ? 'Result kept private.'
          : resp?.submitted
            ? 'Result shared. Thank you for contributing to the community empirical!'
            : 'Could not reach LB servers. Result saved locally.';
        alert(msg);
      });
    }
  });
}

function getFallbackQuestions() {
  // Minimal inline fallback (5 questions) if JSON fetch fails
  return [
    { id: 'q01', question: 'What percentage does a creator keep on every transaction on the Liana Banyan platform?', correct_answers: ['83.3%', '83.3 percent'], wrong_anchors: ['80%', '85%'], category: 'economics' },
    { id: 'q02', question: 'How much does a Liana Banyan membership cost per year?', correct_answers: ['$5', 'five dollars'], wrong_anchors: ['$10', '$20'], category: 'economics' },
    { id: 'q07', question: 'What is the Romulator 9000?', correct_answers: ['rom-first context persistence', 'context persistence system'], wrong_anchors: ['a video game'], category: 'technology' },
    { id: 'q19', question: 'What is the Cathedral Effect in the context of Liana Banyan\'s AI research?', correct_answers: ['improvement in ai accuracy', 'lift in correct answers'], wrong_anchors: ['a building design'], category: 'research' },
    { id: 'q13', question: 'Can Liana Banyan Credits be converted back to dollars (cashed out)?', correct_answers: ['no', 'never', 'one-way valve'], wrong_anchors: ['yes', 'after 6 months'], category: 'economics' },
  ];
}

// ── Start ─────────────────────────────────────────────────────────────────────
init();
