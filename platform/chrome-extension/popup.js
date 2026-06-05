// Mnemosyne Chrome Extension - popup.js
// Scopes: 1-10 (base), 14/15 (Copy for Copilot), 17 (version), 21 (auth token), 30 (configurable port)

const DEFAULT_PORT = 11480;

let bridgePort = DEFAULT_PORT;
let authToken = '';
let pageTitle = '';
let pageUrl = '';

function bridgeBase() {
  return `http://localhost:${bridgePort}`;
}

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

async function loadSettings() {
  try {
    const data = await chrome.storage.sync.get(['mnemo_port', 'mnemo_token']);
    bridgePort = data.mnemo_port ?? DEFAULT_PORT;
    authToken = data.mnemo_token ?? '';
  } catch { /* defaults */ }
}

// Scope 2: Health check with configurable port + auth
async function checkHealth() {
  try {
    const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    const res = await fetch(`${bridgeBase()}/health`, {
      signal: AbortSignal.timeout(2500),
      headers,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Scope 25: Query endpoint
async function queryMemory(q) {
  const res = await fetch(`${bridgeBase()}/substrate/query`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ query: q }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// Scope 24: Save note
async function saveNote(text) {
  const res = await fetch(`${bridgeBase()}/yoke/note`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ note: text, tags: ['chrome-extension'], urgency: 'low' }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// Scope 14/15: Copy context for Copilot - query memory then format as structured prompt prefix
async function copyContextForCopilot() {
  const btn = document.getElementById('copilotBtn');
  btn.disabled = true;

  const topic = pageTitle || 'the current page';
  const query = pageTitle
    ? `What do I know about "${pageTitle}"?`
    : 'Summarize what I have saved recently';

  try {
    const result = await queryMemory(query);
    let memoryBlock = '';

    if (result.hit && result.response) {
      memoryBlock = result.response;
    } else if (result.answer) {
      memoryBlock = result.answer;
    } else {
      memoryBlock = '(No relevant memory found for this page.)';
    }

    // Scope 15: Structured Copilot prompt prefix format
    const copilotContext = [
      `--- Mnemosyne Context (from local memory, ${new Date().toLocaleDateString()}) ---`,
      `Topic: ${topic}`,
      memoryBlock.trim(),
      `--- End Mnemosyne Context ---`,
      '',
      'Based on the above context from my personal notes, ',
    ].join('\n');

    await navigator.clipboard.writeText(copilotContext);

    btn.classList.add('copied');
    btn.innerHTML = `
      <span class="copilot-icon">&#10003;</span>
      <span class="copilot-text">
        Copied! Paste into Copilot
        <span class="copilot-sub">Ctrl+V in Copilot, then add your question</span>
      </span>`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.disabled = false;
      btn.innerHTML = `
        <span class="copilot-icon">&#10697;</span>
        <span class="copilot-text">
          Copy context for Copilot
          <span class="copilot-sub">Formats memory as a prompt prefix - paste into Copilot</span>
        </span>`;
    }, 3000);
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = `
      <span class="copilot-icon">&#10697;</span>
      <span class="copilot-text">
        Copy context for Copilot
        <span class="copilot-sub" style="color:#fca5a5">Error: ${err.message.slice(0, 40)}</span>
      </span>`;
  }
}

function setStatus(online, health) {
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  const offlineView = document.getElementById('offlineView');
  const onlineView = document.getElementById('onlineView');

  if (online) {
    dot.className = 'status-dot online';
    const eblets = health?.index_size ?? health?.eblet_count ?? 0;
    txt.textContent = health ? `v${health.version} - ${eblets} eblets` : 'Online';
    offlineView.style.display = 'none';
    onlineView.style.display = 'block';
  } else {
    dot.className = 'status-dot offline';
    txt.textContent = 'Offline';
    offlineView.style.display = 'block';
    onlineView.style.display = 'none';
  }
}

const QUICK_PROMPTS = [
  'What do I know about this?',
  'Summarize what I have here',
  'What did I save about this topic?',
  'What recipes use this?',
];

function buildQuickChips() {
  const chips = document.getElementById('quickChips');
  chips.innerHTML = '';
  const prompts = pageTitle
    ? [`What do I know about "${pageTitle.slice(0, 28)}${pageTitle.length > 28 ? '...' : ''}"?`, ...QUICK_PROMPTS.slice(0, 3)]
    : QUICK_PROMPTS;

  prompts.forEach((p) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = p;
    chip.addEventListener('click', () => {
      document.getElementById('queryInput').value = p;
      runQuery(p);
    });
    chips.appendChild(chip);
  });
}

async function runQuery(queryText) {
  const resultArea = document.getElementById('resultArea');
  const resultBox = document.getElementById('resultBox');
  const metaRow = document.getElementById('metaRow');
  const askBtn = document.getElementById('askBtn');

  if (!queryText.trim()) return;

  askBtn.disabled = true;
  resultArea.style.display = 'block';
  resultBox.className = 'result-box loading';
  resultBox.innerHTML = '<span class="spinner"></span>Thinking...';
  metaRow.style.display = 'none';

  try {
    const contextQuery = pageTitle ? `${queryText} (context: ${pageTitle})` : queryText;
    const result = await queryMemory(contextQuery);

    resultBox.className = 'result-box';

    if (result.hit && result.response) {
      resultBox.textContent = result.response;
    } else if (result.answer) {
      resultBox.textContent = result.answer;
    } else {
      resultBox.textContent = 'No memory found for this query. Save notes in Mnemosyne to build your knowledge base.';
    }

    if (result.routing || result.latency_ms) {
      metaRow.style.display = 'flex';
      const badge = document.getElementById('routingBadge');
      const latency = document.getElementById('latencyText');
      const routing = result.routing ?? 'miss';

      if (routing === 'substrate' || routing === 'local') {
        badge.className = 'routing-badge routing-substrate';
        badge.textContent = 'Local memory';
      } else if (routing === 'cloud' || routing === 'ollama') {
        badge.className = 'routing-badge routing-cloud';
        badge.textContent = 'AI answered';
      } else {
        badge.className = 'routing-badge routing-miss';
        badge.textContent = routing;
      }

      if (result.latency_ms) latency.textContent = `${result.latency_ms}ms`;
    }
  } catch (err) {
    resultBox.className = 'result-box error';
    resultBox.textContent = `Error: ${err.message}. Make sure Mnemosyne bridge is running.`;
  } finally {
    askBtn.disabled = false;
  }
}

// Scope 17: Show extension version
function setVersionTag() {
  try {
    const manifest = chrome.runtime.getManifest();
    document.getElementById('versionTag').textContent = `v${manifest.version}`;
  } catch { /* non-extension context */ }
}

async function init() {
  await loadSettings();
  setVersionTag();

  // Scope 3: Get current tab info (context snippet)
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      pageTitle = tab.title ?? '';
      pageUrl = tab.url ?? '';
      const ctx = document.getElementById('pageContext');
      if (pageTitle) ctx.textContent = `Page: ${pageTitle.slice(0, 60)}${pageTitle.length > 60 ? '...' : ''}`;
    }
  } catch { /* restricted page */ }

  // Scope 1/2: Check health with configurable port
  const health = await checkHealth();
  setStatus(!!health, health);

  if (health) {
    buildQuickChips();
  }

  // Scope 14: Copy for Copilot button
  document.getElementById('copilotBtn').addEventListener('click', copyContextForCopilot);

  // Scope 7: Ask button + Enter key
  document.getElementById('askBtn').addEventListener('click', () => {
    runQuery(document.getElementById('queryInput').value.trim());
  });

  document.getElementById('queryInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runQuery(document.getElementById('queryInput').value.trim());
    }
  });

  // Scope 6: Save note
  document.getElementById('saveNoteBtn').addEventListener('click', async () => {
    const noteText = document.getElementById('noteInput').value.trim();
    if (!noteText) return;
    const btn = document.getElementById('saveNoteBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
      await saveNote(noteText);
      document.getElementById('noteInput').value = '';
      btn.textContent = 'Saved!';
      setTimeout(() => { btn.textContent = 'Save to Mnemosyne'; btn.disabled = false; }, 1500);
    } catch {
      btn.textContent = 'Error - retry';
      setTimeout(() => { btn.textContent = 'Save to Mnemosyne'; btn.disabled = false; }, 2000);
    }
  });

  // Scope 10: Retry button
  document.getElementById('retryBtn').addEventListener('click', async () => {
    await loadSettings();
    const health2 = await checkHealth();
    setStatus(!!health2, health2);
    if (health2) buildQuickChips();
  });

  // Settings button and offline settings button
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('offlineOptionsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

init();
