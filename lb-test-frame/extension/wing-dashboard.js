/**
 * LB Frame — Wing Dashboard controller (K518 / B126)
 *
 * Loads Wing telemetry from background.js and renders:
 *   - Master Wing enable/disable toggle
 *   - Stats (active augurs, total fires, blocks, warns)
 *   - Per-Augur fire counts table
 *   - Recent events list
 *   - Export / import controls
 *
 * A&A #2295 Tier 3 — personal Wing observability.
 * All data personal-scope: never leaves chrome.storage.local without consent.
 * K518 / B126
 */

function msg(type, payload) {
  return new Promise((resolve) =>
    chrome.runtime.sendMessage({ type, ...payload }, resolve)
  );
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  await loadDashboard();
  initMasterToggle();
}

// ── Load dashboard data ───────────────────────────────────────────────────────

async function loadDashboard() {
  const [dashboard, rules] = await Promise.all([
    msg('WING_GET_DASHBOARD'),
    msg('DISCIPLINE_GET_RULES'),
  ]);

  if (!dashboard) return;

  // Stats
  document.getElementById('stat-augurs').textContent = dashboard.active_rules_count ?? 0;
  document.getElementById('stat-fires').textContent  = dashboard.total_fires ?? 0;

  const events = dashboard.recent_events ?? [];
  const blocks  = events.filter((e) => e.action === 'block').length;
  const warns   = events.filter((e) => e.action === 'warn').length;
  document.getElementById('stat-blocks').textContent = blocks;
  document.getElementById('stat-warns').textContent  = warns;

  // Wing master toggle state
  const masterToggle = document.getElementById('wing-master-toggle');
  masterToggle.checked = dashboard.wing_enabled !== false;
  updateWingStateLbl(masterToggle.checked);

  // Per-Augur fire table
  renderAugurTable(rules?.rules ?? [], dashboard.per_rule_fires ?? {});

  // Recent events
  renderRecentEvents(events);
}

// ── Wing master toggle ─────────────────────────────────────────────────────────

function initMasterToggle() {
  const toggle = document.getElementById('wing-master-toggle');
  toggle.addEventListener('change', async () => {
    await msg('WING_ENABLED_SET', { enabled: toggle.checked });
    updateWingStateLbl(toggle.checked);
  });
}

function updateWingStateLbl(enabled) {
  const lbl = document.getElementById('wing-state-lbl');
  if (lbl) {
    lbl.textContent = enabled ? 'Wing: active' : 'Wing: disabled';
    lbl.style.color = enabled ? '#22c55e' : '#f87171';
  }
}

// ── Per-Augur fire table ───────────────────────────────────────────────────────

function renderAugurTable(rules, perRuleFires) {
  const tbody = document.getElementById('augur-table-body');

  if (!rules || rules.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">No Wing rules installed yet. Use the onboarding wizard or Rule Editor to add your first Augur.</td></tr>';
    return;
  }

  const maxFires = Math.max(1, ...Object.values(perRuleFires));

  tbody.innerHTML = rules.map((rule) => {
    const fires = perRuleFires[rule.id] ?? 0;
    const barWidth = Math.round((fires / maxFires) * 120);
    const action = rule.failure_action ?? 'warn';
    const actionColor = { block: '#f87171', warn: '#fbbf24', enrich: '#4ade80' }[action] ?? '#60a5fa';
    const enabledDot = rule.enabled !== false ? '●' : '○';
    const enabledColor = rule.enabled !== false ? '#22c55e' : '#475569';

    return `
      <tr>
        <td>
          <span style="color:${enabledColor};margin-right:6px;">${enabledDot}</span>
          ${escHtml(rule.name || rule.id)}
        </td>
        <td><span style="font-size:11px;font-weight:600;color:${actionColor};">${action}</span></td>
        <td class="fire-count">${fires}</td>
        <td>
          <div class="fire-bar-wrap">
            <div class="fire-bar" style="width:${barWidth}px;background:${actionColor};"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Recent events ─────────────────────────────────────────────────────────────

function renderRecentEvents(events) {
  const list = document.getElementById('event-list');
  const countEl = document.getElementById('recent-count');

  if (!events || events.length === 0) {
    list.innerHTML = '<div class="empty">No Wing events yet. Events appear here when your Augurs fire.</div>';
    if (countEl) countEl.textContent = '';
    return;
  }

  if (countEl) countEl.textContent = `(${events.length} shown)`;

  list.innerHTML = events.slice(0, 50).map((e) => {
    const ts = e.ts ? new Date(e.ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    const action = e.action ?? 'allow';
    return `
      <div class="event-item">
        <span class="event-action ${action}">${action}</span>
        <span class="event-rule">${escHtml(e.rule_name ?? e.rule_id ?? '—')}</span>
        <span class="event-snippet">"${escHtml((e.query_snippet ?? '').trim())}"</span>
        <span class="event-ts">${ts}</span>
      </div>
    `;
  }).join('');
}

// ── Export ────────────────────────────────────────────────────────────────────

async function exportWing() {
  const resp = await msg('WING_EXPORT');
  if (!resp?.data) return;

  const blob = new Blob([resp.data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lb-wing-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import ────────────────────────────────────────────────────────────────────

function triggerImport() {
  document.getElementById('import-file').click();
}

async function handleImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const result = await msg('WING_IMPORT', { data });

    if (result?.ok) {
      showNotice('import-notice');
      await loadDashboard();
    } else {
      showNotice('error-notice', result?.error);
    }
  } catch {
    showNotice('error-notice', 'Could not parse the file. Make sure it is a valid Wing export.');
  }

  event.target.value = '';
}

// ── Clear telemetry ───────────────────────────────────────────────────────────

async function confirmClearTelemetry() {
  if (!confirm('Clear all Wing telemetry? This cannot be undone. Your rules are not affected.')) return;
  await new Promise((resolve) => chrome.storage.local.set({ lb_wing_telemetry: [] }, resolve));
  await loadDashboard();
}

// ── Rule editor ───────────────────────────────────────────────────────────────

function openRuleEditor() {
  chrome.runtime.sendMessage({ type: 'OPEN_DISCIPLINE_RULES' });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function showNotice(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  if (text) el.textContent = text;
  el.style.display = '';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

init();
