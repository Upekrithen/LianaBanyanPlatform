/**
 * LB Discipline Rule Editor — Page Controller (K513 / B126)
 *
 * Handles the discipline-rules.html UI: load, display, create, edit, delete rules.
 * Communicates with background.js (discipline_engine.js) via chrome.runtime.sendMessage.
 *
 * A&A #2294 — Personal Discipline Enforcement Layer.
 */

// ── Freshness label helper ────────────────────────────────────────────────────

function freshnessLabel(seconds) {
  if (seconds < 120)    return `${seconds}s`;
  if (seconds < 3600)   return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400)  return `${Math.round(seconds / 3600)} hours`;
  return `${Math.round(seconds / 86400)} days`;
}

// ── Message helper ────────────────────────────────────────────────────────────

function msg(type, payload) {
  return new Promise((resolve) =>
    chrome.runtime.sendMessage({ type, ...payload }, resolve)
  );
}

// ── DOM refs ──────────────────────────────────────────────────────────────────

const ruleList      = document.getElementById('rule-list');
const ruleCount     = document.getElementById('rule-count');
const startersGrid  = document.getElementById('starters-grid');
const formSection   = document.getElementById('form-section');
const formTitle     = document.getElementById('form-title');
const saveNotice    = document.getElementById('save-notice');
const errorNotice   = document.getElementById('error-notice');

const fId         = document.getElementById('rule-id');
const fName       = document.getElementById('rule-name');
const fPatterns   = document.getElementById('rule-patterns');
const fSource     = document.getElementById('rule-source');
const fDomain     = document.getElementById('rule-domain');
const fFreshness  = document.getElementById('rule-freshness');
const fFreshDisp  = document.getElementById('freshness-display');
const fAction     = document.getElementById('rule-action');
const fMessage    = document.getElementById('rule-message');
const fEnabled    = document.getElementById('rule-enabled');

// ── State ─────────────────────────────────────────────────────────────────────

let currentRules = [];

// ── Render rules list ─────────────────────────────────────────────────────────

function renderRules(rules) {
  currentRules = rules;
  ruleCount.textContent = rules.length;

  if (rules.length === 0) {
    ruleList.innerHTML = '<div class="empty-state">No rules yet. Install a starter rule below or create your own.</div>';
    return;
  }

  ruleList.innerHTML = rules.map((rule) => {
    const actionBadge = {
      block:      '<span class="badge badge-block">BLOCK</span>',
      warn:       '<span class="badge badge-warn">WARN</span>',
      enrich:     '<span class="badge badge-enrich">ENRICH</span>',
      substitute: '<span class="badge badge-enrich">SUBSTITUTE</span>',
    }[rule.failure_action] ?? '';

    const starterBadge = rule.id?.startsWith('starter-')
      ? '<span class="badge badge-starter">STARTER</span>' : '';

    const patterns = (rule.trigger?.patterns ?? []).join(', ') || '(none)';
    const freshLabel = freshnessLabel(rule.required_consult?.freshness_seconds ?? 3600);
    const source = rule.required_consult?.source ?? 'cathedral';
    const domain = rule.required_consult?.domain ? ` › ${rule.required_consult.domain}` : '';

    return `
      <div class="rule-card ${rule.enabled ? '' : 'disabled'}" data-id="${rule.id}">
        <div class="rule-header">
          <label class="switch" title="Enable/disable rule">
            <input type="checkbox" class="rule-toggle" data-id="${rule.id}" ${rule.enabled ? 'checked' : ''} />
            <span class="slider"></span>
          </label>
          <span class="rule-name">${escHtml(rule.name)}</span>
          ${actionBadge} ${starterBadge}
        </div>
        <div class="rule-meta">
          <span>Keywords:</span> ${escHtml(patterns)} &nbsp;·&nbsp;
          <span>Consult:</span> ${source}${domain} / ${freshLabel} freshness
          ${rule.block_message ? `<br><span>Message:</span> ${escHtml(rule.block_message.slice(0, 80))}${rule.block_message.length > 80 ? '…' : ''}` : ''}
        </div>
        <div class="rule-actions">
          <button class="btn-secondary btn-sm btn-edit" data-id="${rule.id}">Edit</button>
          <button class="btn-secondary btn-sm btn-audit" data-id="${rule.id}">Show audit</button>
          <button class="btn-danger btn-sm btn-delete" data-id="${rule.id}">Delete</button>
        </div>
        <div class="audit-section" id="audit-${rule.id}">
          <div class="section-title" style="margin-bottom:6px;">Audit log (last 10 events)</div>
          <div class="audit-entries" id="audit-entries-${rule.id}">Loading…</div>
        </div>
      </div>`;
  }).join('');

  // Bind toggles
  document.querySelectorAll('.rule-toggle').forEach((el) => {
    el.addEventListener('change', async (e) => {
      const ruleId = e.target.dataset.id;
      const rule = currentRules.find((r) => r.id === ruleId);
      if (!rule) return;
      await msg('DISCIPLINE_SAVE_RULE', { rule: { ...rule, enabled: e.target.checked } });
      await loadRules();
    });
  });

  document.querySelectorAll('.btn-edit').forEach((el) => {
    el.addEventListener('click', (e) => openForm(e.target.dataset.id));
  });

  document.querySelectorAll('.btn-audit').forEach((el) => {
    el.addEventListener('click', async (e) => {
      const ruleId = e.target.dataset.id;
      const section = document.getElementById(`audit-${ruleId}`);
      const entriesEl = document.getElementById(`audit-entries-${ruleId}`);
      section.style.display = section.style.display === 'block' ? 'none' : 'block';
      if (section.style.display === 'block') {
        const resp = await msg('DISCIPLINE_GET_AUDIT', { ruleId });
        const entries = (resp?.audit ?? []).slice(-10).reverse();
        if (entries.length === 0) {
          entriesEl.innerHTML = '<div class="audit-entry">No events recorded yet.</div>';
        } else {
          entriesEl.innerHTML = entries.map((e) => `
            <div class="audit-entry">
              <span class="ts">${new Date(e.ts).toLocaleString()}</span> —
              ${e.decision.toUpperCase()} |
              consult_fresh: ${e.consult_fresh} |
              "${escHtml((e.query_snippet ?? '').slice(0, 60))}…"
            </div>`).join('');
        }
      }
    });
  });

  document.querySelectorAll('.btn-delete').forEach((el) => {
    el.addEventListener('click', async (e) => {
      if (!confirm('Delete this rule?')) return;
      await msg('DISCIPLINE_DELETE_RULE', { ruleId: e.target.dataset.id });
      await loadRules();
      showNotice('Rule deleted.');
    });
  });
}

// ── Render starter rules ──────────────────────────────────────────────────────

function renderStarters(installedIds) {
  const STARTERS = [
    { id: 'starter-cite-source',   name: 'Warn before unverified factual claims',       desc: 'Triggers on: "research shows", "statistics", "proven". Action: Warn.', action: 'warn' },
    { id: 'starter-no-medical',    name: 'Block medical advice without substrate',       desc: 'Triggers on: diagnosis, treatment, medication. Action: Block.',        action: 'block' },
    { id: 'starter-financial-gate',name: 'Warn on financial/investment queries',         desc: 'Triggers on: invest, stocks, crypto, portfolio. Action: Warn.',        action: 'warn' },
    { id: 'starter-projects-enrich',name: 'Auto-enrich queries about my projects',      desc: 'Triggers on: "my project", "my platform". Action: Enrich.',            action: 'enrich' },
    { id: 'starter-lb-facts',      name: 'Enrich Liana Banyan queries with cathedral',  desc: 'Triggers on: "83.3%", "liana banyan", "cathedral effect". Action: Enrich.', action: 'enrich' },
  ];

  startersGrid.innerHTML = STARTERS.map((s) => {
    const installed = installedIds.includes(s.id);
    const actionClass = `badge-${s.action}`;
    return `
      <div class="starter-card ${installed ? 'installed' : ''}" data-starter="${s.id}">
        <div class="starter-name">${escHtml(s.name)}</div>
        <div class="starter-desc">${escHtml(s.desc)}</div>
        <div class="starter-tag">
          <span class="badge ${actionClass}" style="font-size:10px;">${s.action.toUpperCase()}</span>
          ${installed ? ' · <span style="color:#4ade80;">✓ Installed</span>' : ''}
        </div>
      </div>`;
  }).join('');

  document.querySelectorAll('.starter-card:not(.installed)').forEach((el) => {
    el.addEventListener('click', async (e) => {
      const starterId = el.dataset.starter;
      await msg('DISCIPLINE_INSTALL_STARTER', { starterId });
      await loadRules();
      showNotice('Starter rule installed.');
    });
  });
}

// ── Load rules ────────────────────────────────────────────────────────────────

async function loadRules() {
  const resp = await msg('DISCIPLINE_GET_RULES', {});
  const rules = resp?.rules ?? [];
  renderRules(rules);
  const installedIds = rules.map((r) => r.id);
  renderStarters(installedIds);
}

// ── Form open / close ─────────────────────────────────────────────────────────

function openForm(ruleId) {
  const rule = ruleId ? currentRules.find((r) => r.id === ruleId) : null;
  formTitle.textContent = rule ? 'Edit Rule' : 'Create Rule';
  fId.value        = rule?.id ?? '';
  fName.value      = rule?.name ?? '';
  fPatterns.value  = (rule?.trigger?.patterns ?? []).join(', ');
  fSource.value    = rule?.required_consult?.source ?? 'cathedral';
  fDomain.value    = rule?.required_consult?.domain ?? '';
  fFreshness.value = rule?.required_consult?.freshness_seconds ?? 600;
  fFreshDisp.textContent = freshnessLabel(fFreshness.value);
  fAction.value    = rule?.failure_action ?? 'warn';
  fMessage.value   = rule?.block_message ?? '';
  fEnabled.checked = rule?.enabled ?? true;
  formSection.classList.add('visible');
  fName.focus();
}

function closeForm() {
  formSection.classList.remove('visible');
  fId.value = '';
}

// ── Save rule ─────────────────────────────────────────────────────────────────

async function saveRule() {
  const name = fName.value.trim();
  const patternsRaw = fPatterns.value.trim();
  if (!name) { showError('Rule name is required.'); return; }
  if (!patternsRaw) { showError('At least one trigger keyword is required.'); return; }

  const patterns = patternsRaw.split(',').map((p) => p.trim()).filter(Boolean);
  const id = fId.value || `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const rule = {
    id,
    name,
    trigger: { type: 'ai_query_keywords', patterns },
    required_consult: {
      source: fSource.value,
      domain: fDomain.value.trim() || null,
      freshness_seconds: parseInt(fFreshness.value, 10),
    },
    failure_action: fAction.value,
    block_message: fMessage.value.trim(),
    enabled: fEnabled.checked,
    scope: 'personal',
    created_at: fId.value
      ? (currentRules.find((r) => r.id === fId.value)?.created_at ?? new Date().toISOString())
      : new Date().toISOString(),
  };

  await msg('DISCIPLINE_SAVE_RULE', { rule });
  closeForm();
  await loadRules();
  showNotice('Rule saved.');
}

// ── Notices ───────────────────────────────────────────────────────────────────

function showNotice(text) {
  saveNotice.textContent = text;
  saveNotice.style.display = 'inline';
  errorNotice.style.display = 'none';
  setTimeout(() => { saveNotice.style.display = 'none'; }, 3000);
}

function showError(text) {
  errorNotice.textContent = text;
  errorNotice.style.display = 'inline';
  setTimeout(() => { errorNotice.style.display = 'none'; }, 4000);
}

// ── HTML escape ───────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event wiring ──────────────────────────────────────────────────────────────

document.getElementById('btn-create').addEventListener('click', () => openForm(null));
document.getElementById('btn-save-rule').addEventListener('click', saveRule);
document.getElementById('btn-cancel-rule').addEventListener('click', closeForm);

fFreshness.addEventListener('input', () => {
  fFreshDisp.textContent = freshnessLabel(parseInt(fFreshness.value, 10));
});

// ── Init ──────────────────────────────────────────────────────────────────────

loadRules();
