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

const CONSULT_STATE_KEY   = 'lb_consult_state';       // chrome.storage.local key
const RULES_KEY           = 'lb_discipline_rules';    // chrome.storage.local key
const AUDIT_KEY_PREFIX    = 'lb_audit_';              // per-rule audit log prefix
const WING_ENABLED_KEY    = 'lb_wing_enabled';        // Wing master on/off
const WING_TELEMETRY_KEY  = 'lb_wing_telemetry';      // compact fire telemetry
const DAEMON_STATE_URL    = 'http://127.0.0.1:7712/state';
const DAEMON_TIMEOUT_MS   = 2000;
const MAX_WING_TELEMETRY  = 1000;

// ── K519 NAF federation constants ──────────────────────────────────────────────
const NAF_FEDERATE_KEY    = 'lb_naf_federate';        // bool: member opt-in to NAF (default: false)
const NAF_WING_ID_KEY     = 'lb_naf_wing_id';         // member's local NAF Wing ID (auto-generated)
const NAF_IGNORED_KEY     = 'lb_naf_ignored';         // list of ignored NAF-default rule IDs
const NAF_REST_BASE       = 'http://127.0.0.1:7712';  // Helm PWA REST base

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

async function getWingEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [WING_ENABLED_KEY]: true }, (data) => resolve(data[WING_ENABLED_KEY]));
  });
}

async function setWingEnabled(enabled) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [WING_ENABLED_KEY]: enabled }, resolve);
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

async function appendWingTelemetry(record) {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [WING_TELEMETRY_KEY]: [] }, (data) => {
      const tel = data[WING_TELEMETRY_KEY];
      tel.push({ ...record, ts: new Date().toISOString() });
      const trimmed = tel.length > MAX_WING_TELEMETRY ? tel.slice(tel.length - MAX_WING_TELEMETRY) : tel;
      chrome.storage.local.set({ [WING_TELEMETRY_KEY]: trimmed }, resolve);
    });
  });
}

async function getWingTelemetry() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [WING_TELEMETRY_KEY]: [] }, (data) => resolve(data[WING_TELEMETRY_KEY]));
  });
}

async function getWingDashboard() {
  const rules = await getRules();
  const tel = await getWingTelemetry();
  const enabled = await getWingEnabled();

  const totalFires = tel.filter((t) => ['block', 'warn', 'enrich'].includes(t.action)).length;
  const perRule = {};
  for (const t of tel) {
    if (!perRule[t.rule_id]) perRule[t.rule_id] = 0;
    perRule[t.rule_id]++;
  }
  const recent = tel.slice(-50).reverse();

  return {
    wing_enabled: enabled,
    rules_count: rules.length,
    active_rules_count: rules.filter((r) => r.enabled !== false).length,
    total_fires: totalFires,
    per_rule_fires: perRule,
    recent_events: recent,
    source: 'frame_extension',
  };
}

async function exportWing() {
  const rules = await getRules();
  const telemetry = await getWingTelemetry();
  return JSON.stringify({
    lb_wing_export: true,
    version: '1.0',
    exported_at: new Date().toISOString(),
    source: 'frame_extension',
    rules,
    telemetry,
  }, null, 2);
}

async function importWing(data) {
  if (!data || !data.lb_wing_export) {
    return { ok: false, error: 'Not a valid Wing export file.' };
  }
  const incoming = data.rules || [];
  const existing = await getRules();
  const byId = {};
  for (const r of existing) byId[r.id] = r;
  let imported = 0;
  for (const r of incoming) {
    if (r.id) { byId[r.id] = r; imported++; }
  }
  await new Promise((resolve) => chrome.storage.local.set({ [RULES_KEY]: Object.values(byId) }, resolve));
  return { ok: true, imported_count: imported };
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
  // Wing master on/off (C.5 — member can disable Wing entirely)
  const wingEnabled = await getWingEnabled();
  if (!wingEnabled) {
    return { action: 'allow', trace: [], wing_disabled: true };
  }

  const rules = await getRules();
  const activeRules = rules.filter((r) => r.enabled !== false);
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

    // Audit every firing (per-rule log)
    await appendAuditEntry(rule.id, {
      query_snippet: queryText.slice(0, 100),
      triggered: true,
      consult_fresh: fresh,
      decision: effectiveAction,
    });

    // Wing telemetry (compact aggregate, C.6)
    await appendWingTelemetry({
      rule_id: rule.id,
      rule_name: rule.name,
      action: effectiveAction,
      query_snippet: queryText.slice(0, 80),
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

// ── NAF federation storage helpers (K519) ────────────────────────────────────

async function getNafFederate() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [NAF_FEDERATE_KEY]: false }, (d) => resolve(d[NAF_FEDERATE_KEY]));
  });
}

async function setNafFederate(enabled) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [NAF_FEDERATE_KEY]: enabled }, resolve);
  });
}

async function getNafWingId() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [NAF_WING_ID_KEY]: null }, (d) => {
      if (d[NAF_WING_ID_KEY]) { resolve(d[NAF_WING_ID_KEY]); return; }
      const id = 'wing-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
      chrome.storage.local.set({ [NAF_WING_ID_KEY]: id }, () => resolve(id));
    });
  });
}

/**
 * Build aggregate signals from Wing telemetry (C.1-C.3):
 *   - per-rule fire counts ONLY
 *   - no query content, no member-identifiable data
 */
async function buildNafAggregate() {
  const [rules, tel] = await Promise.all([getRules(), getWingTelemetry()]);

  const perRuleFires = {};
  let blockCount = 0, warnCount = 0, enrichCount = 0, totalFires = 0;

  for (const t of tel) {
    if (['block', 'warn', 'enrich'].includes(t.action)) {
      perRuleFires[t.rule_id] = (perRuleFires[t.rule_id] || 0) + 1;
      totalFires++;
      if (t.action === 'block')  blockCount++;
      if (t.action === 'warn')   warnCount++;
      if (t.action === 'enrich') enrichCount++;
    }
  }

  return {
    per_rule_fires:    perRuleFires,
    total_fires:       totalFires,
    block_count:       blockCount,
    warn_count:        warnCount,
    enrich_count:      enrichCount,
    active_rule_count: rules.filter((r) => r.enabled !== false).length,
  };
}

/** Emit aggregate signals to NAF (C.1 — only if federation opt-in is ON). */
async function emitNafAggregate() {
  const federate = await getNafFederate();
  if (!federate) return { skipped: true, reason: 'federation_disabled' };

  const wingId  = await getNafWingId();
  const signals = await buildNafAggregate();
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(`${NAF_REST_BASE}/naf/aggregate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ wing_id: wingId, signals }),
      signal:  ctrl.signal,
    });
    return await resp.json();
  } catch {
    return { ok: false, error: 'daemon_offline' };
  }
}

/** Register this Wing with NAF (called on federation opt-in). */
async function registerWingWithNaf() {
  const wingId = await getNafWingId();
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(`${NAF_REST_BASE}/naf/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ wing_id: wingId }),
      signal:  ctrl.signal,
    });
    return await resp.json();
  } catch {
    return { ok: false, error: 'daemon_offline' };
  }
}

/** Submit a rule as a NAF promotion candidate (C.5). */
async function submitNafCandidate(ruleId) {
  const rules = await getRules();
  const rule  = rules.find((r) => r.id === ruleId);
  if (!rule) return { ok: false, error: 'Rule not found' };

  const wingId = await getNafWingId();
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(`${NAF_REST_BASE}/naf/candidates`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ wing_id: wingId, rule_def: rule }),
      signal:  ctrl.signal,
    });
    return await resp.json();
  } catch {
    return { ok: false, error: 'daemon_offline' };
  }
}

/** Fetch NAF-default rules available for opt-in install (C.7, C.8). */
async function getNafDefaults() {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(`${NAF_REST_BASE}/naf/defaults`, { signal: ctrl.signal });
    const data = await resp.json();
    return data.defaults || [];
  } catch {
    return [];
  }
}

/** Install a NAF-default rule into the member's personal Wing (C.8). */
async function installNafDefault(ruleEntry) {
  const rule = ruleEntry.rule_def || ruleEntry;
  if (!rule || !rule.id) return { ok: false, error: 'Invalid rule definition' };

  const rules    = await getRules();
  const existing = rules.find((r) => r.id === rule.id);
  if (!existing) {
    rules.push({
      ...rule,
      scope:        'personal',
      created_at:   new Date().toISOString(),
      naf_promoted: true,
    });
    await new Promise((resolve) => chrome.storage.local.set({ [RULES_KEY]: rules }, resolve));
  }
  return { ok: true, already: !!existing };
}

/** Mark a NAF-default rule as ignored (C.9 — member declines install). */
async function ignoreNafDefault(ruleId) {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [NAF_IGNORED_KEY]: [] }, (data) => {
      const ignored = data[NAF_IGNORED_KEY];
      if (!ignored.includes(ruleId)) ignored.push(ruleId);
      chrome.storage.local.set({ [NAF_IGNORED_KEY]: ignored }, () => resolve({ ok: true }));
    });
  });
}

/** Get the set of ignored NAF-default rule IDs. */
async function getNafIgnored() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [NAF_IGNORED_KEY]: [] }, (d) => resolve(d[NAF_IGNORED_KEY]));
  });
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

  // ── Wing control messages (K518) ─────────────────────────────────────────────

  if (msg.type === 'WING_ENABLED_GET') {
    const enabled = await getWingEnabled();
    sendResponse({ enabled });
    return;
  }
  if (msg.type === 'WING_ENABLED_SET') {
    await setWingEnabled(!!msg.enabled);
    sendResponse({ ok: true });
    return;
  }
  if (msg.type === 'WING_GET_DASHBOARD') {
    const dashboard = await getWingDashboard();
    sendResponse(dashboard);
    return;
  }
  if (msg.type === 'WING_EXPORT') {
    const data = await exportWing();
    sendResponse({ data });
    return;
  }
  if (msg.type === 'WING_IMPORT') {
    const result = await importWing(msg.data);
    sendResponse(result);
    return;
  }
  if (msg.type === 'WING_INSTALL_STARTERS') {
    const rules = await getRules();
    const existingIds = new Set(rules.map((r) => r.id));
    const toInstall = msg.starter_ids
      ? STARTER_RULES.filter((s) => msg.starter_ids.includes(s.id))
      : STARTER_RULES;
    let added = 0;
    for (const s of toInstall) {
      if (!existingIds.has(s.id)) {
        rules.push({ ...s, created_at: new Date().toISOString() });
        added++;
      }
    }
    await new Promise((resolve) => chrome.storage.local.set({ [RULES_KEY]: rules }, resolve));
    sendResponse({ ok: true, added });
    return;
  }

  // ── NAF federation messages (K519) ───────────────────────────────────────────

  if (msg.type === 'NAF_FEDERATE_GET') {
    const [federate, wing_id] = await Promise.all([getNafFederate(), getNafWingId()]);
    sendResponse({ federate, wing_id });
    return;
  }
  if (msg.type === 'NAF_FEDERATE_SET') {
    await setNafFederate(!!msg.enabled);
    if (msg.enabled) await registerWingWithNaf();
    sendResponse({ ok: true });
    return;
  }
  if (msg.type === 'NAF_EMIT_AGGREGATE') {
    const result = await emitNafAggregate();
    sendResponse(result);
    return;
  }
  if (msg.type === 'NAF_SUBMIT_CANDIDATE') {
    const result = await submitNafCandidate(msg.rule_id);
    sendResponse(result);
    return;
  }
  if (msg.type === 'NAF_GET_DEFAULTS') {
    const [defaults, ignored] = await Promise.all([getNafDefaults(), getNafIgnored()]);
    sendResponse({ defaults, ignored });
    return;
  }
  if (msg.type === 'NAF_INSTALL_DEFAULT') {
    const result = await installNafDefault(msg.rule_entry);
    sendResponse(result);
    return;
  }
  if (msg.type === 'NAF_IGNORE_DEFAULT') {
    const result = await ignoreNafDefault(msg.rule_id);
    sendResponse(result);
    return;
  }
}
