'use strict';

/**
 * LB Omnibox — Options page controller
 * K530 / B128 — Privacy-by-default settings (B.8)
 */

const ALL_SENSITIVE_CATS = ['medical', 'financial', 'legal', 'political'];

document.addEventListener('DOMContentLoaded', () => {
  const injectionEl    = document.getElementById('injection-enabled');
  const curationEl     = document.getElementById('curation-enabled');
  const vendorEl       = document.getElementById('vendor-preference');
  const purgeAllBtn    = document.getElementById('purge-all');
  const savedBanner    = document.getElementById('saved-banner');

  function showSaved() {
    savedBanner.classList.add('show');
    setTimeout(() => savedBanner.classList.remove('show'), 2000);
  }

  // ── Load prefs ────────────────────────────────────────────────────────────
  chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
    if (!prefs) return;

    injectionEl.checked = prefs.injectionEnabled !== false;
    curationEl.checked  = prefs.curationEnabled  !== false;

    if (prefs.vendorPreference && vendorEl.querySelector(`option[value="${prefs.vendorPreference}"]`)) {
      vendorEl.value = prefs.vendorPreference;
    }

    const enabledCats = Array.isArray(prefs.sensitiveCategories) ? prefs.sensitiveCategories : [];
    ALL_SENSITIVE_CATS.forEach((cat) => {
      const el = document.getElementById(`cat-${cat}`);
      if (el) el.checked = enabledCats.includes(cat);
    });
  });

  // ── Save handler (shared) ─────────────────────────────────────────────────
  function savePref(key, value) {
    chrome.runtime.sendMessage({ type: 'SET_PREF', key, value }, showSaved);
  }

  // ── Core toggles ──────────────────────────────────────────────────────────
  injectionEl.addEventListener('change', () => savePref('injectionEnabled', injectionEl.checked));
  curationEl.addEventListener('change',  () => savePref('curationEnabled',  curationEl.checked));
  vendorEl.addEventListener('change',    () => savePref('vendorPreference',  vendorEl.value));

  // ── Sensitive-category toggles ────────────────────────────────────────────
  ALL_SENSITIVE_CATS.forEach((cat) => {
    const el = document.getElementById(`cat-${cat}`);
    if (!el) return;
    el.addEventListener('change', () => {
      // Read current list, add/remove this cat, save
      chrome.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
        let cats = Array.isArray(prefs?.sensitiveCategories) ? [...prefs.sensitiveCategories] : [];
        if (el.checked && !cats.includes(cat)) {
          cats.push(cat);
        } else if (!el.checked) {
          cats = cats.filter((c) => c !== cat);
        }
        savePref('sensitiveCategories', cats);
      });
    });
  });

  // ── Purge all (Forget Everything) ────────────────────────────────────────
  purgeAllBtn.addEventListener('click', () => {
    if (!confirm('Permanently delete ALL library entries? This cannot be undone. (An audit-trail entry of this purge action is retained per #2315 Claim 7.)')) return;
    chrome.runtime.sendMessage({ type: 'PURGE_ALL' }, (resp) => {
      if (resp && resp.ok) {
        alert(`Done. ${resp.purged ?? 0} entries purged. An audit-trail record of this deletion has been kept (no content, just the purge event).`);
      }
    });
  });
});
