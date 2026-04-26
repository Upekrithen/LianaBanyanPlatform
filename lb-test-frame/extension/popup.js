/**
 * LB Test Frame — Popup controller
 * K502 / B124 — K518: Wing section added
 */

const AI_NAMES = {
  claude: 'Claude (Anthropic)',
  chatgpt: 'ChatGPT (OpenAI)',
  gemini: 'Gemini (Google)',
  perplexity: 'Perplexity',
  copilot: 'Copilot (Microsoft)',
};

async function init() {
  // Daemon status
  chrome.runtime.sendMessage({ type: 'PING_DAEMON' }, (resp) => {
    const el = document.getElementById('daemon-status');
    if (resp?.alive) {
      el.textContent = 'Connected';
      el.className = 'status-badge status-alive';
    } else {
      el.textContent = 'Offline';
      el.className = 'status-badge status-dead';
    }
  });

  // Prefs
  chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
    // Injection toggle
    const toggle = document.getElementById('injection-toggle');
    toggle.checked = prefs?.injectionEnabled ?? true;
    toggle.addEventListener('change', () => {
      chrome.runtime.sendMessage({ type: 'SET_PREF', key: 'injectionEnabled', value: toggle.checked });
    });

    // Persona chip
    const persona = prefs?.persona ?? 'casual';
    const chip = document.getElementById('persona-chip');
    chip.textContent = persona;
    chip.className = `persona-chip ${persona}`;

    // Selected AI
    const aiEl = document.getElementById('selected-ai');
    aiEl.textContent = AI_NAMES[prefs?.selectedAI] ?? 'Not selected';

    // Last intent (if available)
    if (prefs?.lastIntent) {
      document.getElementById('intent-row').style.display = '';
      document.getElementById('last-intent').textContent = prefs.lastIntent;
    }
  });

  // Wing section (K518)
  chrome.runtime.sendMessage({ type: 'WING_ENABLED_GET' }, (resp) => {
    const toggle = document.getElementById('wing-toggle');
    if (toggle && resp != null) {
      toggle.checked = resp.enabled !== false;
      toggle.addEventListener('change', () => {
        chrome.runtime.sendMessage({ type: 'WING_ENABLED_SET', enabled: toggle.checked });
      });
    }
  });

  chrome.runtime.sendMessage({ type: 'WING_GET_DASHBOARD' }, (resp) => {
    if (!resp) return;
    const rulesEl = document.getElementById('wing-rules-count');
    const firesEl = document.getElementById('wing-fires-count');
    if (rulesEl) rulesEl.textContent = resp.active_rules_count ?? '0';
    if (firesEl) firesEl.textContent = resp.total_fires ?? '0';
  });
}

function openVerify() {
  chrome.runtime.sendMessage({ type: 'OPEN_VERIFY_TAB' });
  window.close();
}

function openOnboarding() {
  chrome.tabs.create({ url: chrome.runtime.getURL('pages/onboarding.html') });
  window.close();
}

function openOptions() {
  chrome.runtime.openOptionsPage();
  window.close();
}

function openDisciplineRules() {
  chrome.runtime.sendMessage({ type: 'OPEN_DISCIPLINE_RULES' });
  window.close();
}

function openWingDashboard() {
  chrome.runtime.sendMessage({ type: 'OPEN_WING_DASHBOARD' });
  window.close();
}

init();
