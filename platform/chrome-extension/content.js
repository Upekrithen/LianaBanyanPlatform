// Mnemosyne Chrome Extension - content.js
// Injected into all pages to show toast notifications and handle clipboard writes.
// Scopes: 4 (save toast), 5 (query toast), 16 (clipboard write for Copilot copy)

const TOAST_STYLE = `
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2147483647;
  background: #0a0f1a;
  color: #6ee7b7;
  border: 1px solid rgba(110,231,183,0.35);
  border-radius: 10px;
  padding: 10px 16px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 600;
  max-width: 340px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  transition: opacity 0.3s;
  pointer-events: none;
`;

const COPILOT_TOAST_STYLE = `
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2147483647;
  background: #0a0f1a;
  color: #c084fc;
  border: 1px solid rgba(168,85,247,0.35);
  border-radius: 10px;
  padding: 10px 16px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 600;
  max-width: 360px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  transition: opacity 0.3s;
  pointer-events: none;
`;

function showToast(msg, durationMs = 3000, style = TOAST_STYLE) {
  const el = document.createElement('div');
  el.style.cssText = style;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 350);
  }, durationMs);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'MNEMO_SAVED_TOAST') {
    showToast(`Saved to Mnemosyne: "${msg.preview}"`);
  }

  if (msg.type === 'MNEMO_QUERY_TOAST') {
    showToast(`Asking Mnemosyne: "${msg.query.slice(0, 50)}..."`, 1500);
  }

  // Scope 16: Write text to clipboard (used by background.js for Copilot copy)
  if (msg.type === 'MNEMO_COPY_TO_CLIPBOARD') {
    navigator.clipboard.writeText(msg.text).then(() => {
      const toastMsg = msg.toast ?? 'Context copied for Copilot';
      showToast(toastMsg, 3500, COPILOT_TOAST_STYLE);
    }).catch(() => {
      showToast('Copy failed - try the extension popup instead', 2500);
    });
  }
});
