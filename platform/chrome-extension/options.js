// Mnemosyne Chrome Extension - options.js
// Scope 12: Extension options page (configure bridge port + auth token)
// Scope 13: Options port/token persistence via chrome.storage.sync
// Scope 30: Port persistence via chrome.storage.sync

const DEFAULT_PORT = 11480;

async function loadSettings() {
  const data = await chrome.storage.sync.get(['mnemo_port', 'mnemo_token']);
  const port = data.mnemo_port ?? DEFAULT_PORT;
  const token = data.mnemo_token ?? '';
  document.getElementById('portInput').value = port;
  document.getElementById('tokenInput').value = token;
}

async function saveSettings() {
  const portRaw = parseInt(document.getElementById('portInput').value, 10);
  const token = document.getElementById('tokenInput').value.trim();

  const port = isNaN(portRaw) || portRaw < 1024 || portRaw > 65535 ? DEFAULT_PORT : portRaw;

  await chrome.storage.sync.set({ mnemo_port: port, mnemo_token: token });

  const toast = document.getElementById('toast');
  toast.className = 'toast success';
  toast.textContent = 'Settings saved.';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

async function testConnection() {
  const portRaw = parseInt(document.getElementById('portInput').value, 10);
  const port = isNaN(portRaw) || portRaw < 1024 ? DEFAULT_PORT : portRaw;
  const token = document.getElementById('tokenInput').value.trim();
  const dot = document.getElementById('connDot');
  const label = document.getElementById('connLabel');

  dot.className = 'status-dot checking';
  label.textContent = 'Testing...';

  try {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(3000),
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      dot.className = 'status-dot online';
      label.textContent = `Connected - v${data.version ?? '?'}, ${data.index_size ?? 0} eblets`;
    } else {
      dot.className = 'status-dot offline';
      label.textContent = `HTTP ${res.status} - check bridge settings`;
    }
  } catch (err) {
    dot.className = 'status-dot offline';
    const isAuth = err.message?.includes('401') || err.message?.includes('403');
    label.textContent = isAuth ? 'Auth failed - check token' : `Cannot reach port ${port} - is bridge running?`;
  }
}

function setVersionFooter() {
  try {
    const manifest = chrome.runtime.getManifest();
    document.getElementById('versionFooter').textContent =
      `Mnemosyne Extension v${manifest.version}`;
  } catch { /* non-extension context */ }
}

document.getElementById('saveBtn').addEventListener('click', saveSettings);
document.getElementById('testBtn').addEventListener('click', testConnection);

loadSettings();
setVersionFooter();
