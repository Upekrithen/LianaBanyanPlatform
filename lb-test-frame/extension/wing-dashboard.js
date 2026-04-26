/**
 * LB Frame — Wing Dashboard controller (K518-K519 / B126)
 *
 * Loads Wing telemetry from background.js and renders:
 *   - Master Wing enable/disable toggle
 *   - Stats (active augurs, total fires, blocks, warns)
 *   - Per-Augur fire counts table (with "Propose to NAF" column when federated)
 *   - Recent events list
 *   - Export / import controls
 *   - NAF Federation toggle (K519 / B.4)
 *   - NAF Defaults section — available promoted rules (K519 / B.5)
 *
 * A&A #2295 Tier 3-4 — personal Wing observability + voluntary NAF federation.
 * All data personal-scope: never leaves chrome.storage.local without consent.
 * K518-K519 / B126
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
  await loadFederation();
  await loadNafDefaults();
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

let _nafFederateActive = false; // updated by loadFederation()

function renderAugurTable(rules, perRuleFires) {
  const tbody       = document.getElementById('augur-table-body');
  const proposeHdr  = document.getElementById('propose-col-hdr');
  const colSpan     = _nafFederateActive ? 5 : 4;

  if (proposeHdr) proposeHdr.style.display = _nafFederateActive ? '' : 'none';

  if (!rules || rules.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${colSpan}" class="empty">No Wing rules installed yet. Use the onboarding wizard or Rule Editor to add your first Augur.</td></tr>`;
    return;
  }

  const maxFires = Math.max(1, ...Object.values(perRuleFires));

  tbody.innerHTML = rules.map((rule) => {
    const fires       = perRuleFires[rule.id] ?? 0;
    const barWidth    = Math.round((fires / maxFires) * 120);
    const action      = rule.failure_action ?? 'warn';
    const actionColor = { block: '#f87171', warn: '#fbbf24', enrich: '#4ade80' }[action] ?? '#60a5fa';
    const enabledDot  = rule.enabled !== false ? '●' : '○';
    const enabledColor= rule.enabled !== false ? '#22c55e' : '#475569';
    const proposeCell = _nafFederateActive
      ? `<td><button class="btn btn-naf-propose" style="font-size:11px;padding:4px 10px;" onclick="proposeToNaf('${escHtml(rule.id)}')">Propose</button></td>`
      : '';

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
        ${proposeCell}
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

// ── NAF Federation (K519 / B.4) ───────────────────────────────────────────────

async function loadFederation() {
  const resp = await msg('NAF_FEDERATE_GET');
  if (!resp) return;

  _nafFederateActive = !!resp.federate;
  const toggle = document.getElementById('naf-federate-toggle');
  if (toggle) toggle.checked = _nafFederateActive;
  updateNafFederateLbl(_nafFederateActive);

  const wingIdRow = document.getElementById('naf-wing-id-row');
  const nafWingId = document.getElementById('naf-wing-id');
  const actionRow = document.getElementById('naf-action-row');

  if (_nafFederateActive && resp.wing_id) {
    if (wingIdRow) wingIdRow.style.display = '';
    if (nafWingId) nafWingId.textContent = resp.wing_id;
    if (actionRow) actionRow.style.display = '';
  } else {
    if (wingIdRow) wingIdRow.style.display = 'none';
    if (actionRow) actionRow.style.display = 'none';
  }

  const toggle2 = document.getElementById('naf-federate-toggle');
  if (toggle2) {
    toggle2.addEventListener('change', async () => {
      _nafFederateActive = toggle2.checked;
      await msg('NAF_FEDERATE_SET', { enabled: _nafFederateActive });
      updateNafFederateLbl(_nafFederateActive);

      if (_nafFederateActive) {
        const newResp = await msg('NAF_FEDERATE_GET');
        if (wingIdRow) wingIdRow.style.display = '';
        if (nafWingId && newResp) nafWingId.textContent = newResp.wing_id || '';
        if (actionRow) actionRow.style.display = '';
        await loadNafDefaults();
      } else {
        if (wingIdRow) wingIdRow.style.display = 'none';
        if (actionRow) actionRow.style.display = 'none';
      }

      // Re-render augur table to show/hide Propose column
      const dashboard = await msg('WING_GET_DASHBOARD');
      const rules = (await msg('DISCIPLINE_GET_RULES'))?.rules ?? [];
      if (dashboard) renderAugurTable(rules, dashboard.per_rule_fires ?? {});
    });
  }
}

function updateNafFederateLbl(enabled) {
  const lbl = document.getElementById('naf-federate-lbl');
  if (!lbl) return;
  lbl.textContent = enabled ? 'Signals: federated (ON)' : 'Signals: private (OFF)';
  lbl.style.color = enabled ? '#818cf8' : '#94a3b8';
}

async function emitNafAggregate() {
  const result = await msg('NAF_EMIT_AGGREGATE');
  if (result?.ok) {
    showNotice('propose-notice');
    document.getElementById('propose-notice').textContent = 'Aggregate signals emitted to NAF.';
  } else if (result?.skipped) {
    showNotice('error-notice', 'Federation is OFF. Enable the NAF toggle first.');
  } else {
    showNotice('error-notice', result?.error || 'Could not reach Helm PWA.');
  }
}

async function proposeToNaf(ruleId) {
  const result = await msg('NAF_SUBMIT_CANDIDATE', { rule_id: ruleId });
  const notice = document.getElementById('propose-notice');
  if (result?.ok) {
    if (notice) { notice.textContent = result.duplicate ? 'Already submitted as a candidate.' : 'Rule submitted to NAF as a promotion candidate.'; notice.style.display = ''; setTimeout(() => { notice.style.display = 'none'; }, 4000); }
  } else {
    showNotice('error-notice', result?.error || 'Submit failed — is Helm PWA running?');
  }
}

function openNafAdmin() {
  chrome.runtime.sendMessage({ type: 'OPEN_NAF_ADMIN' });
}

// ── NAF Defaults (K519 / B.5) ─────────────────────────────────────────────────

async function loadNafDefaults() {
  const section = document.getElementById('naf-defaults-section');
  const list    = document.getElementById('naf-defaults-list');
  if (!section || !list) return;

  const resp = await msg('NAF_GET_DEFAULTS');
  const defaults = resp?.defaults ?? [];
  const ignored  = new Set(resp?.ignored ?? []);

  const visible = defaults.filter((d) => {
    const ruleId = d.rule_def?.id;
    return ruleId && !ignored.has(ruleId);
  });

  if (visible.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  list.innerHTML = visible.map((d) => {
    const rule   = d.rule_def || {};
    const ruleId = rule.id || '';
    const name   = rule.name || ruleId;
    const action = rule.failure_action || 'warn';
    return `
      <div class="naf-default-item">
        <div class="naf-rule-name">
          ${escHtml(name)}
          <div style="font-size:11px;color:#475569;margin-top:2px;">from Wing ${escHtml(d.source_wing_id || '—')}</div>
        </div>
        <span class="naf-rule-action ${action}">${action}</span>
        <button class="btn btn-naf-install" onclick="installNafDefault('${escHtml(ruleId)}')">Install</button>
        <button class="btn btn-naf-ignore"  onclick="ignoreNafDefault('${escHtml(ruleId)}')">Ignore</button>
      </div>
    `;
  }).join('');
}

async function installNafDefault(ruleId) {
  const defaultsResp = await msg('NAF_GET_DEFAULTS');
  const defaults     = defaultsResp?.defaults ?? [];
  const entry        = defaults.find((d) => d.rule_def?.id === ruleId);
  if (!entry) { showNotice('error-notice', 'Rule not found in NAF defaults.'); return; }

  const result = await msg('NAF_INSTALL_DEFAULT', { rule_entry: entry });
  if (result?.ok) {
    showNotice('import-notice');
    document.getElementById('import-notice').textContent = result.already
      ? 'Rule already in your Wing.'
      : 'NAF rule installed into your Wing.';
    await loadNafDefaults();
    await loadDashboard();
  } else {
    showNotice('error-notice', result?.error || 'Install failed.');
  }
}

async function ignoreNafDefault(ruleId) {
  await msg('NAF_IGNORE_DEFAULT', { rule_id: ruleId });
  await loadNafDefaults();
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
