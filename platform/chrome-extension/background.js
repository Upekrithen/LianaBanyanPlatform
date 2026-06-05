// Mnemosyne Chrome Extension - background.js (Manifest V3 service worker)
// Scopes: 4 (save-selection), 5 (query-selection), 11 (keyboard shortcut), 16 (Copy for Copilot context menu), 21 (auth token)

const DEFAULT_PORT = 11480;

async function getBridgeSettings() {
  try {
    const data = await chrome.storage.sync.get(['mnemo_port', 'mnemo_token']);
    return {
      port: data.mnemo_port ?? DEFAULT_PORT,
      token: data.mnemo_token ?? '',
    };
  } catch {
    return { port: DEFAULT_PORT, token: '' };
  }
}

function bridgeBase(port) {
  return `http://localhost:${port}`;
}

function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

chrome.runtime.onInstalled.addListener(() => {
  // Scope 4: Save selection via right-click
  chrome.contextMenus.create({
    id: 'mnemo-save-selection',
    title: 'Save "%s" to Mnemosyne',
    contexts: ['selection'],
  });

  // Scope 5: Query selection via right-click
  chrome.contextMenus.create({
    id: 'mnemo-query-selection',
    title: 'Ask Mnemosyne about "%s"',
    contexts: ['selection'],
  });

  // Scope 16: Copy for Copilot via right-click
  chrome.contextMenus.create({
    id: 'mnemo-copilot-selection',
    title: 'Copy Mnemosyne context for Copilot ("%s")',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText?.trim();
  if (!text) return;

  const { port, token } = await getBridgeSettings();
  const base = bridgeBase(port);
  const headers = authHeaders(token);

  if (info.menuItemId === 'mnemo-query-selection') {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'MNEMO_QUERY_TOAST',
        query: text,
      });
    } catch {
      chrome.action.openPopup?.();
    }
  }

  if (info.menuItemId === 'mnemo-save-selection') {
    try {
      const res = await fetch(`${base}/yoke/note`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          note: text,
          tags: ['chrome-selection', 'context-menu'],
          urgency: 'low',
        }),
      });
      if (res.ok) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'MNEMO_SAVED_TOAST',
          preview: text.slice(0, 60),
        }).catch(() => {});
      }
    } catch {
      // bridge not running - silently fail
    }
  }

  // Scope 16: Copy Mnemosyne context for Copilot from context menu
  if (info.menuItemId === 'mnemo-copilot-selection') {
    try {
      const queryRes = await fetch(`${base}/substrate/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: `What do I know about "${text}"?` }),
        signal: AbortSignal.timeout(10000),
      });

      let memoryBlock = '(No relevant memory found.)';
      if (queryRes.ok) {
        const data = await queryRes.json();
        if (data.hit && data.response) memoryBlock = data.response;
        else if (data.answer) memoryBlock = data.answer;
      }

      const copilotContext = [
        `--- Mnemosyne Context (${new Date().toLocaleDateString()}) ---`,
        `Topic: "${text}"`,
        memoryBlock.trim(),
        `--- End Mnemosyne Context ---`,
        '',
        'Based on the above context from my personal notes, ',
      ].join('\n');

      // Inject clipboard write via content script
      chrome.tabs.sendMessage(tab.id, {
        type: 'MNEMO_COPY_TO_CLIPBOARD',
        text: copilotContext,
        toast: 'Mnemosyne context copied for Copilot - paste into Copilot chat',
      }).catch(() => {});
    } catch {
      chrome.tabs.sendMessage(tab.id, {
        type: 'MNEMO_SAVED_TOAST',
        preview: 'Bridge not running - start Mnemosyne first',
      }).catch(() => {});
    }
  }
});

// Scope 11: Keyboard shortcut handler (Ctrl+Shift+C for copy-for-copilot)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'copy-for-copilot') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const { port, token } = await getBridgeSettings();
    const base = bridgeBase(port);
    const headers = authHeaders(token);

    try {
      const queryRes = await fetch(`${base}/substrate/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: `What do I know about "${tab.title}"?` }),
        signal: AbortSignal.timeout(10000),
      });

      let memoryBlock = '(No relevant memory found for this page.)';
      if (queryRes.ok) {
        const data = await queryRes.json();
        if (data.hit && data.response) memoryBlock = data.response;
        else if (data.answer) memoryBlock = data.answer;
      }

      const copilotContext = [
        `--- Mnemosyne Context (${new Date().toLocaleDateString()}) ---`,
        `Page: ${tab.title ?? tab.url}`,
        memoryBlock.trim(),
        `--- End Mnemosyne Context ---`,
        '',
        'Based on the above context from my personal notes, ',
      ].join('\n');

      chrome.tabs.sendMessage(tab.id, {
        type: 'MNEMO_COPY_TO_CLIPBOARD',
        text: copilotContext,
        toast: 'Mnemosyne context copied for Copilot (Ctrl+Shift+C)',
      }).catch(() => {});
    } catch {
      chrome.tabs.sendMessage(tab.id, {
        type: 'MNEMO_SAVED_TOAST',
        preview: 'Copilot copy failed - is bridge running?',
      }).catch(() => {});
    }
  }
});

// Message handler for popup and content script
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'MNEMO_HEALTH_CHECK') {
    getBridgeSettings().then(({ port, token }) => {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      fetch(`${bridgeBase(port)}/health`, {
        signal: AbortSignal.timeout(2500),
        headers,
      })
        .then((r) => r.json())
        .then((data) => sendResponse({ ok: true, data }))
        .catch(() => sendResponse({ ok: false }));
    });
    return true;
  }

  if (msg.type === 'MNEMO_QUERY') {
    getBridgeSettings().then(({ port, token }) => {
      fetch(`${bridgeBase(port)}/substrate/query`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ query: msg.query }),
        signal: AbortSignal.timeout(15000),
      })
        .then((r) => r.json())
        .then((data) => sendResponse({ ok: true, data }))
        .catch((err) => sendResponse({ ok: false, error: err.message }));
    });
    return true;
  }
});
