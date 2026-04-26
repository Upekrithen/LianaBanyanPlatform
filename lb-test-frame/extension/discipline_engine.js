/**
 * LB Discipline Engine — Augur Runtime (K513 / B126)
 *
 * Evaluates active discipline rules against AI query text before submission.
 * Runs in the extension service worker (background.js) via message passing.
 *
 * Architecture:
 *   content.js intercepts AI submission → sends DISCIPLINE_CHECK message
 *   → background.js routes to engine.evaluate()
 *   → engine loads rules, checks triggers, verifies consult freshness
 *   → returns { action: 'allow'|'block'|'warn'|'enrich', rule?, message?, enrichment? }
 *   → content.js enforces (cancel + overlay, toast, prepend context, or pass through)
 *
 * A&A #2294 reduction-to-practice — Personal Discipline Enforcement Layer.
 * K513 / B126
 */

const CONSULT_STATE_KEY = 'lb_consult_state';       // chrome.storage.local key
const RULES_KEY         = 'lb_discipline_rules';    // chrome.storage.local key
const AUDIT_KEY_PREFIX  = 'lb_audit_';              // per-rule audit log prefix
const DAEMON_STATE_URL  = 'http://127.0.0.1:7712/state';
const DAEMON_TIMEOUT_MS = 2000;

// ── Rule schema defaults ──────────────────────────────────────────────────────

export const RULE_DEFAULTS = {
  id: null,
  name: '',
  trigger: { type: 'ai_query_keywords', patterns: [] },
  required_consult: { source: 'cathedral', domain: null, freshness_seconds: 3600 },
  failure_action: 'warn',           // 'block' | 'warn' | 'enrich' | 'substitute'
  block_message: '',
  enabled: true,
  scope: 'personal',
  created_at: null,
};

// ── Five starter rules (one-click install) ────────────────────────────────────

export const STARTER_RULES = [
  {
    id: 'starter-cite-source',
    name: 'Warn before unverified factual claims',
    trigger: { type: 'ai_query_keywords', patterns: ['research shows', 'studies show', 'data shows', 'statistics', 'proven', 'scientifically'] },
    required_consult: { source: 'cathedral', domain: null, freshness_seconds: 3600 },
    failure_action: 'warn',
    block_message: 'Heads up: no substrate consulted recently for factual claims. Consider verifying first.',
    enabled: true,
    scope: 'personal',
    created_at: new Date().toISOString(),
  },
  {
    id: 'starter-no-medical',
    name: 'Block medical advice without substrate',
    trigger: { type: 'ai_query_keywords', patterns: ['diagnosis', 'treatment', 'medication', 'symptoms', 'medical advice', 'should I take', 'is it safe to'] },
    required_consult: { source: 'member_substrate', domain: 'health', freshness_seconds: 86400 },
    failure_action: 'block',
    block_message: 'Medical advice requires your health substrate to be consulted first. Rule: No-Medical-Advice-Without-Context.',
    enabled: true,
    scope: 'personal',
    created_at: new Date().toISOString(),
  },
  {
    id: 'starter-financial-gate',
    name: 'Warn on financial/investment queries',
    trigger: { type: 'ai_query_keywords', patterns: ['invest', 'stocks', 'crypto', 'financial advice', 'portfolio', 'returns', 'yield', 'hedge fund'] },
    required_consult: { source: 'member_substrate', domain: 'finance', freshness_seconds: 86400 },
    failure_action: 'warn',
    block_message: 'Financial queries benefit from consulting your finance substrate first.',
    enabled: true,
    scope: 'personal',
    created_at: new Date().toISOString(),
  },
  {
    id: 'starter-projects-enrich',
    name: 'Auto-enrich queries about my projects',
    trigger: { type: 'ai_query_keywords', patterns: ['my project', 'my platform', 'our system', 'our product', 'my app', 'my startup', 'my business'] },
    required_consult: { source: 'cathedral', domain: null, freshness_seconds: 600 },
    failure_action: 'enrich',
    block_message: '',
    enabled: true,
    scope: 'personal',
    created_at: new Date().toISOString(),
  },
  {
    id: 'starter-lb-facts',
    name: 'Enrich Liana Banyan platform queries with cathedral',
    trigger: { type: 'ai_query_keywords', patterns: ['liana banyan', '83.3%', 'creator percentage', '$5 membership', 'romulator', 'cathedral effect', 'marks joules credits'] },
    required_consult: { source: 'cathedral', domain: null, freshness_seconds: 7200 },
    failure_action: 'enrich',
    block_message: '',
    enabled: true,
    scope: 'personal',
    created_at: new Date().toISOString(),
  },
];

// ── Storage helpers ───────────────────────────────────────────────────────────

async function getRules() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [RULES_KEY]: [] }, (data) => resolve(data[RULES_KEY]));
  });
}

async function getConsultState() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [CONSULT_STATE_KEY]: {} }, (data) => resolve(data[CONSULT_STATE_KEY]));
  });
}

async function appendAuditEntry(ruleId, entry) {
  const key = AUDIT_KEY_PREFIX + ruleId;
  return new Promise((resolve) => {
    chrome.storage.local.get({ [key]: [] }, (data) => {
      const log = data[key];
      log.push({ ...entry, ts: new Date().toISOString() });
      // Keep last 500 entries per rule
      const trimmed = log.length > 500 ? log.slice(log.length - 500) : log;
      chrome.storage.local.set({ [key]: trimmed }, resolve);
    });
  });
}

// ── Consult freshness check ───────────────────────────────────────────────────

async function isConsultFresh(required_consult) {
  const { source, domain, freshness_seconds } = required_consult;

  // Try daemon first (authoritative if running)
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), DAEMON_TIMEOUT_MS);
    const resp = await fetch(DAEMON_STATE_URL, { signal: ctrl.signal });
    clearTimeout(tid);
    if (resp.ok) {
      const state = await resp.json();
      // Daemon state: { last_consult_ts, consult_domain, ... }
      const lastTs = state.last_consult_ts ?? 0;
      const staleSec = (Date.now() - lastTs * 1000) / 1000;
      return staleSec <= freshness_seconds;
    }
  } catch {
    // Daemon offline — fall through to chrome.storage
  }

  // Fallback: chrome.storage consult state
  const consultState = await getConsultState();
  const key = domain ? `${source}:${domain}` : source;
  const lastTs = consultState[key] ?? 0;
  const staleSec = (Date.now() - lastTs) / 1000;
  return staleSec <= freshness_seconds;
}

// ── Trigger evaluation ────────────────────────────────────────────────────────

function ruleTriggered(rule, queryText) {
  const lower = queryText.toLowerCase();
  const { patterns } = rule.trigger;
  return patterns.some((p) => lower.includes(p.toLowerCase()));
}

// ── Cathedral enrichment context (for 'enrich' action) ───────────────────────

async function getCathedralContext() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ lb_substrate: null }, (data) => {
      resolve(data.lb_substrate ?? '[LB substrate not loaded — open popup to inject]');
    });
  });
}

// ── Main evaluation entry point ───────────────────────────────────────────────

/**
 * Evaluate all active rules against a query.
 * Returns the highest-priority enforcement decision.
 *
 * Priority: block > warn > enrich > allow
 *
 * @param {string} queryText — the full AI query text
 * @returns {{ action: string, rule?: object, message?: string, enrichment?: string, trace: object[] }}
 */
export async function evaluate(queryText) {
  const rules = await getRules();
  const activeRules = rules.filter((r) => r.enabled);
  const trace = [];

  let blockRule = null;
  let warnRule = null;
  let enrichRule = null;

  for (const rule of activeRules) {
    if (!ruleTriggered(rule, queryText)) {
      trace.push({ rule_id: rule.id, triggered: false, action: 'skip' });
      continue;
    }

    const fresh = await isConsultFresh(rule.required_consult);
    const effectiveAction = fresh ? 'allow' : rule.failure_action;

    trace.push({ rule_id: rule.id, triggered: true, fresh, action: effectiveAction });

    // Audit every firing
    await appendAuditEntry(rule.id, {
      query_snippet: queryText.slice(0, 100),
      triggered: true,
      consult_fresh: fresh,
      decision: effectiveAction,
    });

    if (effectiveAction === 'block' && !blockRule) blockRule = rule;
    if (effectiveAction === 'warn' && !warnRule) warnRule = rule;
    if (effectiveAction === 'enrich' && !enrichRule) enrichRule = rule;
  }

  // Enforce priority: block > warn > enrich > allow
  if (blockRule) {
    return {
      action: 'block',
      rule: blockRule,
      message: blockRule.block_message || `Blocked by discipline rule: "${blockRule.name}"`,
      trace,
    };
  }
  if (warnRule) {
    return {
      action: 'warn',
      rule: warnRule,
      message: warnRule.block_message || `Discipline rule "${warnRule.name}" recommends consulting your substrate first.`,
      trace,
    };
  }
  if (enrichRule) {
    const context = await getCathedralContext();
    return {
      action: 'enrich',
      rule: enrichRule,
      enrichment: context,
      trace,
    };
  }

  return { action: 'allow', trace };
}

// ── Message handler (called from background.js) ───────────────────────────────

export async function handleDisciplineMessage(msg, sendResponse) {
  if (msg.type === 'DISCIPLINE_CHECK') {
    const result = await evaluate(msg.queryText ?? '');
    sendResponse(result);
    return;
  }
  if (msg.type === 'DISCIPLINE_GET_RULES') {
    const rules = await getRules();
    sendResponse({ rules });
    return;
  }
  if (msg.type === 'DISCIPLINE_SAVE_RULE') {
    const rules = await getRules();
    const idx = rules.findIndex((r) => r.id === msg.rule.id);
    if (idx >= 0) rules[idx] = msg.rule;
    else rules.push(msg.rule);
    await new Promise((resolve) => chrome.storage.local.set({ [RULES_KEY]: rules }, resolve));
    sendResponse({ ok: true });
    return;
  }
  if (msg.type === 'DISCIPLINE_DELETE_RULE') {
    const rules = await getRules();
    const filtered = rules.filter((r) => r.id !== msg.ruleId);
    await new Promise((resolve) => chrome.storage.local.set({ [RULES_KEY]: filtered }, resolve));
    sendResponse({ ok: true });
    return;
  }
  if (msg.type === 'DISCIPLINE_INSTALL_STARTER') {
    const rules = await getRules();
    const starter = STARTER_RULES.find((s) => s.id === msg.starterId);
    if (!starter) { sendResponse({ ok: false, error: 'starter not found' }); return; }
    const already = rules.some((r) => r.id === starter.id);
    if (!already) {
      rules.push({ ...starter, created_at: new Date().toISOString() });
      await new Promise((resolve) => chrome.storage.local.set({ [RULES_KEY]: rules }, resolve));
    }
    sendResponse({ ok: true, already });
    return;
  }
  if (msg.type === 'DISCIPLINE_GET_AUDIT') {
    const key = AUDIT_KEY_PREFIX + msg.ruleId;
    const data = await new Promise((resolve) => chrome.storage.local.get({ [key]: [] }, resolve));
    sendResponse({ audit: data[key] });
    return;
  }
  if (msg.type === 'DISCIPLINE_MARK_CONSULTED') {
    // Called by content.js or popup when substrate consult is performed
    const state = await getConsultState();
    const key = msg.domain ? `${msg.source}:${msg.domain}` : (msg.source ?? 'cathedral');
    state[key] = Date.now();
    await new Promise((resolve) => chrome.storage.local.set({ [CONSULT_STATE_KEY]: state }, resolve));
    sendResponse({ ok: true });
    return;
  }
}
