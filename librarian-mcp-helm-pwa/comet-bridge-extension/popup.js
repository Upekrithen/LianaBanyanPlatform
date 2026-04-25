/**
 * Comet Bridge — Popup Script
 * K485A / B123
 */

const daemonBadge = document.getElementById('daemon-status');
const toggle = document.getElementById('injection-toggle');
const intentInfo = document.getElementById('intent-info');
const lastIntentEl = document.getElementById('last-intent');

// ── Daemon status ─────────────────────────────────────────────────────────────

function updateDaemonBadge(alive) {
  daemonBadge.className = 'status-badge';
  if (alive) {
    daemonBadge.textContent = 'live ●';
    daemonBadge.classList.add('status-alive');
  } else {
    daemonBadge.textContent = 'offline ○';
    daemonBadge.classList.add('status-dead');
  }
}

chrome.runtime.sendMessage({ type: 'PING_DAEMON' }, (resp) => {
  updateDaemonBadge(resp?.alive ?? false);
});

// ── Toggle ────────────────────────────────────────────────────────────────────

chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
  toggle.checked = prefs?.injectionEnabled ?? true;
});

toggle.addEventListener('change', () => {
  chrome.runtime.sendMessage({
    type: 'SET_PREF',
    key: 'injectionEnabled',
    value: toggle.checked,
  });
});

// ── Last intent (from storage) ────────────────────────────────────────────────

chrome.storage.local.get({ lastIntent: null }, (data) => {
  if (data.lastIntent) {
    lastIntentEl.textContent = data.lastIntent;
    intentInfo.style.display = 'flex';
  }
});
