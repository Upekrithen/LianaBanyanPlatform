// Query background for status on popup open
chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const count = document.getElementById('eblet-count');

  if (chrome.runtime.lastError) {
    dot.className = 'status-dot disconnected';
    text.textContent = 'Extension error';
    count.textContent = '—';
    return;
  }

  if (response?.connected) {
    dot.className = 'status-dot connected';
    text.textContent = 'MnemosyneC connected';
    count.textContent = response.ebletCount ?? '0';
  } else {
    dot.className = 'status-dot disconnected';
    text.textContent = 'MnemosyneC not running';
    count.textContent = '—';
  }
});
