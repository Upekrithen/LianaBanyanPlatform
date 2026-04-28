'use strict';

/**
 * LB Omnibox — Popup controller
 * K530 / B128
 */

document.addEventListener('DOMContentLoaded', () => {
  const injectionToggle = document.getElementById('injection-toggle');
  const curationToggle  = document.getElementById('curation-toggle');
  const entryCountEl    = document.getElementById('entry-count');
  const daemonStatusEl  = document.getElementById('daemon-status');
  const openLibraryBtn  = document.getElementById('open-library');
  const openSettingsBtn = document.getElementById('open-settings');

  // ── Load preferences ────────────────────────────────────────────────────
  chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
    if (chrome.runtime.lastError || !prefs) return;
    injectionToggle.checked = prefs.injectionEnabled !== false;
    curationToggle.checked  = prefs.curationEnabled  !== false;
  });

  // ── Load Personal-Permanent entry count ──────────────────────────────────
  chrome.runtime.sendMessage({ type: 'GET_ENTRY_COUNT' }, (resp) => {
    entryCountEl.textContent = (resp && typeof resp.count === 'number') ? resp.count : 0;
  });

  // ── Helm daemon status ───────────────────────────────────────────────────
  chrome.runtime.sendMessage({ type: 'PING' }, (resp) => {
    daemonStatusEl.textContent = (resp && resp.alive) ? '🟢' : '⚫';
  });

  // ── Toggle handlers ──────────────────────────────────────────────────────
  injectionToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({
      type: 'SET_PREF',
      key: 'injectionEnabled',
      value: injectionToggle.checked,
    });
  });

  curationToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({
      type: 'SET_PREF',
      key: 'curationEnabled',
      value: curationToggle.checked,
    });
  });

  // ── Navigation ───────────────────────────────────────────────────────────
  openLibraryBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/library.html') });
    window.close();
  });

  openSettingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    window.close();
  });
});
