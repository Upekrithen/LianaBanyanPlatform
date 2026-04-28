'use strict';

/**
 * LB Omnibox — Library page controller
 * K530 / B128 — Personal-Permanent substrate library (B.7)
 *
 * Reads entries from background.js (which holds the extension-scoped IndexedDB).
 * Supports:
 *  - Topic filter chips
 *  - Full-text search across query field
 *  - Per-entry delete (right-to-be-forgotten, B.4)
 *  - Purge all ("Forget Everything", B.4)
 */

let _allEntries   = [];
let _activeFilter = 'all';
let _searchQuery  = '';
// _pendingAction is declared near the modal helpers below

// ── Elements ──────────────────────────────────────────────────────────────────
const searchInput  = document.getElementById('search-input');
const filterBar    = document.getElementById('filter-bar');
const entryList    = document.getElementById('entry-list');
const countBadge   = document.getElementById('count-badge');
const purgeAllBtn  = document.getElementById('purge-all-btn');
const modalBackdrop= document.getElementById('modal-backdrop');
const modalTitle   = document.getElementById('modal-title');
const modalBody    = document.getElementById('modal-body');
const modalCancel  = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

// ── Load entries from background ──────────────────────────────────────────────
function loadEntries() {
  chrome.runtime.sendMessage({ type: 'GET_ALL_ENTRIES' }, (resp) => {
    _allEntries = (resp && Array.isArray(resp.entries)) ? resp.entries : [];
    _allEntries.sort((a, b) => b.created_at.localeCompare(a.created_at)); // newest first
    buildFilterChips();
    renderEntries();
  });
}

// ── Build topic filter chips ──────────────────────────────────────────────────
function buildFilterChips() {
  const topics = [...new Set(_allEntries.map((e) => e.topic || 'General').filter(Boolean))].sort();

  // Clear except "All"
  filterBar.innerHTML = '<button class="chip active" data-topic="all">All</button>';

  topics.forEach((topic) => {
    const btn = document.createElement('button');
    btn.className   = 'chip';
    btn.dataset.topic = topic;
    btn.textContent = topic;
    filterBar.appendChild(btn);
  });

  filterBar.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-topic]');
    if (!chip) return;
    _activeFilter = chip.dataset.topic;
    filterBar.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    renderEntries();
  });
}

// ── Render filtered + searched entries ───────────────────────────────────────
function renderEntries() {
  const q = _searchQuery.toLowerCase();
  const filtered = _allEntries.filter((e) => {
    const topicMatch = _activeFilter === 'all' || (e.topic || 'General') === _activeFilter;
    const textMatch  = !q || (e.query || '').toLowerCase().includes(q);
    return topicMatch && textMatch;
  });

  countBadge.textContent = `${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`;

  if (filtered.length === 0) {
    entryList.innerHTML = `
      <div class="empty-state">
        <div class="icon">${_allEntries.length === 0 ? '📭' : '🔍'}</div>
        <h2>${_allEntries.length === 0 ? 'Library is empty' : 'No results'}</h2>
        <p>${_allEntries.length === 0
          ? 'Run a search and click "Save to my library" in the curation prompt.'
          : 'Try a different search term or topic filter.'
        }</p>
      </div>
    `;
    return;
  }

  entryList.innerHTML = filtered.map((entry) => `
    <div class="entry-card" data-id="${escapeAttr(entry.id)}">
      <div class="entry-header">
        <div class="entry-query">${escapeHtml(entry.query)}</div>
        <div class="entry-actions">
          <button class="btn-icon delete-btn" data-id="${escapeAttr(entry.id)}" title="Delete entry">🗑</button>
        </div>
      </div>
      <div class="entry-meta">
        ${entry.topic  ? `<span class="meta-chip topic">${escapeHtml(entry.topic)}</span>`  : ''}
        ${entry.vendor ? `<span class="meta-chip vendor">${escapeHtml(entry.vendor)}</span>` : ''}
        <span class="meta-chip">${formatDate(entry.created_at)}</span>
        <span class="meta-chip">personal-private</span>
      </div>
      ${entry.url ? `<div class="entry-url"><a href="${escapeAttr(entry.url)}" target="_blank" rel="noopener">${escapeHtml(truncate(entry.url, 80))}</a></div>` : ''}
    </div>
  `).join('');

  // Attach delete handlers
  entryList.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id    = btn.dataset.id;
      const entry = _allEntries.find((e) => e.id === id);
      if (!entry) return;
      openDeleteModal(id, entry.query);
    });
  });
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
// _pendingDelete: { type: 'delete'|'purge', id?: string, query?: string }
let _pendingAction = null;

function openDeleteModal(id, query) {
  _pendingAction = { type: 'delete', id, query };
  modalTitle.textContent   = 'Delete this entry?';
  modalBody.textContent    = `"${truncate(query, 120)}" — will be removed from your Personal-Permanent library. An audit-trail record of the deletion is kept (no content).`;
  modalConfirm.textContent = 'Delete';
  modalBackdrop.classList.add('open');
}

function closeModal() {
  _pendingAction = null;
  modalBackdrop.classList.remove('open');
}

modalCancel.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });

// Single confirm handler — dispatches based on pending action type
modalConfirm.addEventListener('click', () => {
  if (!_pendingAction) return;

  if (_pendingAction.type === 'delete') {
    const { id } = _pendingAction;
    chrome.runtime.sendMessage({ type: 'DELETE_ENTRY', id }, () => {
      closeModal();
      loadEntries();
    });
    return;
  }

  if (_pendingAction.type === 'purge') {
    chrome.runtime.sendMessage({ type: 'PURGE_ALL' }, () => {
      modalConfirm.textContent = 'Delete'; // reset label for next use
      closeModal();
      loadEntries();
    });
  }
});

// ── Purge all ────────────────────────────────────────────────────────────────
purgeAllBtn.addEventListener('click', () => {
  if (_allEntries.length === 0) {
    alert('Library is already empty.');
    return;
  }
  _pendingAction          = { type: 'purge' };
  modalTitle.textContent  = 'Forget Everything?';
  modalBody.textContent   = `Permanently delete all ${_allEntries.length} library entr${_allEntries.length === 1 ? 'y' : 'ies'}? An audit-trail record of this purge action (no content) is retained per #2315 Claim 7.`;
  modalConfirm.textContent = 'Forget Everything';
  modalBackdrop.classList.add('open');
});

// ── Search ────────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  _searchQuery = searchInput.value.trim();
  renderEntries();
});

// ── Utilities ─────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return (str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escapeAttr(str) {
  return (str ?? '').replace(/"/g, '&quot;').replace(/</g,'&lt;');
}

function truncate(str, max) {
  return (str && str.length > max) ? str.slice(0, max - 1) + '…' : (str || '');
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso || ''; }
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadEntries();
