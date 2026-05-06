// AMPLIFY Computer — Electron Main Process
// B37 Phase 1-3 — BP025 / Bushel 37
// Phase 3 additions: connectivity polling, auto-mode transitions, substrate/federation IPC

import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  screen,
  shell,
} from 'electron';
import { join } from 'path';
import { existsSync } from 'fs';
import { OllamaManager } from './ollama_manager';
import { SubstrateAPIServer } from './substrate_api';
import { FederationClient } from './federation_client';

// ─── Constants ──────────────────────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === 'development' || !app.isPackaged;
const RENDERER_URL = IS_DEV
  ? 'http://localhost:5173'
  : `file://${join(__dirname, '../renderer/index.html')}`;

// Connectivity polling interval (30s)
const CONNECTIVITY_POLL_MS = 30_000;

// ─── State ──────────────────────────────────────────────────────────────────

let overlayWindow: BrowserWindow | null = null;
let dashboardWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let ollamaManager: OllamaManager | null = null;
let substrateServer: SubstrateAPIServer | null = null;
let federationClient: FederationClient | null = null;
let connectivityTimer: ReturnType<typeof setInterval> | null = null;

// ─── Frame Mode ──────────────────────────────────────────────────────────────

type FrameMode = 'ai_burst' | 'normal' | 'fallback';
let currentMode: FrameMode = 'normal';

function setMode(mode: FrameMode, broadcast = true): void {
  currentMode = mode;
  substrateServer?.setMode(mode);
  rebuildTrayMenu(mode);
  if (broadcast) {
    overlayWindow?.webContents.send('frame-mode-changed', { mode });
    dashboardWindow?.webContents.send('frame-mode-changed', { mode });
  }
}

function detectMode(context: {
  aiAvailable: boolean;
  substrateIndexAvailable: boolean;
  peerNodesAvailable: number;
  userBudgetRemaining?: number;
  forcedMode?: FrameMode | null;
}): FrameMode {
  // Forced mode always wins unless cleared
  if (context.forcedMode != null) return context.forcedMode;

  if (!context.aiAvailable || context.userBudgetRemaining === 0) {
    if (context.substrateIndexAvailable || context.peerNodesAvailable > 0) {
      return context.peerNodesAvailable > 0 ? 'fallback' : 'normal';
    }
    return 'fallback';
  }
  return 'ai_burst';
}

// ─── Connectivity Polling ─────────────────────────────────────────────────────

async function runConnectivityPoll(): Promise<void> {
  const aiAvailable = (await ollamaManager?.isReachable()) ?? false;
  const online = (await federationClient?.checkAndUpdateConnectivity()) ?? false;
  const peerCount = federationClient?.getStatus().peerCount ?? 0;

  const forcedMode = substrateServer?.getForcedMode() ?? null;

  // Only auto-transition if no forced mode is set
  if (forcedMode === null) {
    const detected = detectMode({
      aiAvailable,
      substrateIndexAvailable: true,
      peerNodesAvailable: peerCount,
      forcedMode: null,
    });

    if (detected !== currentMode) {
      console.log(`[Mode] Auto-transition: ${currentMode} → ${detected} (ai=${aiAvailable} online=${online} peers=${peerCount})`);
      setMode(detected);
    }
  }
}

// ─── Overlay Window ──────────────────────────────────────────────────────────

function createOverlayWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.loadURL(RENDERER_URL);

  if (IS_DEV) {
    overlayWindow.webContents.openDevTools({ mode: 'detach' });
  }

  screen.on('display-metrics-changed', () => {
    if (!overlayWindow) return;
    const { width: w, height: h } = screen.getPrimaryDisplay().workAreaSize;
    overlayWindow.setBounds({ x: 0, y: 0, width: w, height: h });
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

// ─── System Tray ─────────────────────────────────────────────────────────────

function createTray(): void {
  const iconPath = join(__dirname, '../../assets/tray-icon.png');
  const icon = existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip('AMPLIFY Computer — CAI Hearth active');
  rebuildTrayMenu();
}

function rebuildTrayMenu(mode: FrameMode = currentMode): void {
  if (!tray) return;

  const modeLabel: Record<FrameMode, string> = {
    ai_burst: '🔥 AI Burst',
    normal: '🌿 Normal',
    fallback: '🌑 Fallback',
  };

  const forcedMode = substrateServer?.getForcedMode();
  const forcedLabel = forcedMode ? ` (forced)` : '';

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `AMPLIFY Computer — ${modeLabel[mode]}${forcedLabel}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '🔥 AI Burst Mode',
      type: 'radio',
      checked: mode === 'ai_burst',
      click: () => setMode('ai_burst'),
    },
    {
      label: '🌿 Normal Mode',
      type: 'radio',
      checked: mode === 'normal',
      click: () => setMode('normal'),
    },
    {
      label: '🌑 Fallback Mode',
      type: 'radio',
      checked: mode === 'fallback',
      click: () => setMode('fallback'),
    },
    { type: 'separator' },
    {
      label: forcedMode ? 'Clear Mode Override' : 'Auto-Detect Mode',
      click: () => {
        substrateServer?.setForcedMode(null);
        runConnectivityPoll();
      },
    },
    { type: 'separator' },
    {
      label: 'AMPLIFY Dashboard',
      click: () => openDashboard(),
    },
    {
      label: 'Settings',
      click: () => openDashboard(),
    },
    { type: 'separator' },
    {
      label: 'Open lianabanyan.com',
      click: () => shell.openExternal('https://lianabanyan.com'),
    },
    { type: 'separator' },
    {
      label: 'Hide Overlay',
      click: () => overlayWindow?.hide(),
    },
    {
      label: 'Show Overlay',
      click: () => {
        if (!overlayWindow) createOverlayWindow();
        overlayWindow?.show();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit AMPLIFY',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
}

// ─── Dashboard Window ─────────────────────────────────────────────────────────

function openDashboard(): void {
  if (dashboardWindow) {
    dashboardWindow.focus();
    return;
  }

  dashboardWindow = new BrowserWindow({
    width: 520,
    height: 680,
    title: 'AMPLIFY Dashboard',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  dashboardWindow.loadURL(
    IS_DEV
      ? 'http://localhost:5173/#/dashboard'
      : `file://${join(__dirname, '../renderer/index.html')}#/dashboard`,
  );

  dashboardWindow.on('closed', () => {
    dashboardWindow = null;
  });
}

// ─── IPC Handlers ────────────────────────────────────────────────────────────

function registerIPCHandlers(): void {
  // ── Mode ──────────────────────────────────────────────────────────────────
  ipcMain.handle('get-frame-mode', () => ({
    mode: currentMode,
    forced_mode: substrateServer?.getForcedMode() ?? null,
  }));

  ipcMain.on('set-frame-mode', (_event, { mode }: { mode: FrameMode }) => {
    setMode(mode);
  });

  // Force or clear mode override (persists through auto-detect cycles)
  ipcMain.handle('force-frame-mode', (_event, { mode }: { mode: FrameMode | null }) => {
    substrateServer?.setForcedMode(mode);
    if (mode !== null) setMode(mode);
    else runConnectivityPoll();
    rebuildTrayMenu();
    return { ok: true, forced_mode: substrateServer?.getForcedMode() ?? null };
  });

  // ── Overlay ───────────────────────────────────────────────────────────────
  ipcMain.on('set-clickthrough', (_event, { enabled }: { enabled: boolean }) => {
    overlayWindow?.setIgnoreMouseEvents(enabled, { forward: true });
  });

  // ── Ollama ────────────────────────────────────────────────────────────────
  ipcMain.handle('get-ollama-status', async () => {
    return ollamaManager?.getStatus() ?? { running: false, model: null, source: 'none' };
  });

  ipcMain.handle('pull-default-model', async () => {
    if (!ollamaManager) return { success: false, error: 'Ollama manager not initialized' };
    const reachable = await ollamaManager.isReachable();
    if (!reachable) return { success: false, error: 'Ollama not running' };
    const hasModel = await ollamaManager.hasModel();
    if (hasModel) return { success: true, alreadyInstalled: true };
    try {
      await ollamaManager.pullModel(undefined, (progress) => {
        overlayWindow?.webContents.send('ollama-pull-progress', progress);
        dashboardWindow?.webContents.send('ollama-pull-progress', progress);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle('list-ollama-models', async () => {
    return ollamaManager?.listModels() ?? [];
  });

  ipcMain.handle('check-disk-space', async () => {
    const ok = (await ollamaManager?.checkDiskSpace(6)) ?? true;
    return { ok, requiredGB: 6 };
  });

  // ── Substrate ─────────────────────────────────────────────────────────────

  // Route a query through the three-mode substrate router
  ipcMain.handle(
    'substrate-query',
    async (_event, { query, model }: { query: string; model?: string }) => {
      if (!substrateServer) return { hit: false, routing: 'miss', latency_ms: 0 };
      // Forward to the HTTP API internally (reuses all routing + telemetry logic)
      try {
        const res = await fetch(`http://127.0.0.1:11480/substrate/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, model }),
        });
        return await res.json();
      } catch {
        return { hit: false, routing: 'miss', latency_ms: 0 };
      }
    },
  );

  // Write a record to the local substrate index + queue federation sync
  ipcMain.handle(
    'substrate-write',
    async (_event, { text, source, keywords }: { text: string; source?: string; keywords?: string[] }) => {
      try {
        const res = await fetch(`http://127.0.0.1:11480/substrate/write`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, source, keywords }),
        });
        return await res.json();
      } catch {
        return { ok: false };
      }
    },
  );

  // ── Federation ────────────────────────────────────────────────────────────
  ipcMain.handle('get-federation-status', () => {
    return federationClient?.getStatus() ?? {
      online: false,
      peerCount: 0,
      lastSyncTs: null,
      lastSyncRecordsExchanged: 0,
      pendingWriteCount: 0,
      peers: [],
    };
  });

  ipcMain.handle('set-member-token', (_event, { token }: { token: string | null }) => {
    federationClient?.setMemberToken(token);
    return { ok: true };
  });

  // ── AMPLIFY Telemetry ─────────────────────────────────────────────────────
  ipcMain.handle('get-amplify-snapshot', async () => {
    return substrateServer?.getAMPLIFYSnapshot() ?? {
      total_queries: 0,
      substrate_hits: 0,
      local_ollama_served: 0,
      cloud_escalations: 0,
      total_cloud_cost_avoided_usd: 0,
    };
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  ipcMain.on('open-dashboard', () => openDashboard());
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  // Initialize substrate API server (Phase 3: full implementation)
  substrateServer = new SubstrateAPIServer();
  await substrateServer.start();

  // Initialize federation client (uses the substrate index from the API server)
  federationClient = new FederationClient(substrateServer.getIndex());
  substrateServer.setFederationClient(federationClient);
  await federationClient.start();

  // Initialize Ollama manager
  ollamaManager = new OllamaManager();
  await ollamaManager.init();

  // Create overlay + tray
  createOverlayWindow();
  createTray();
  registerIPCHandlers();

  // Initial mode detection
  const aiAvailable = await ollamaManager.isReachable();
  const fedStatus = federationClient.getStatus();
  const forcedMode = substrateServer.getForcedMode();
  const mode = detectMode({
    aiAvailable,
    substrateIndexAvailable: true,
    peerNodesAvailable: fedStatus.peerCount,
    forcedMode,
  });
  setMode(mode, false);

  // Start periodic connectivity polling → auto mode transitions
  connectivityTimer = setInterval(runConnectivityPoll, CONNECTIVITY_POLL_MS);

  app.on('activate', () => {
    if (!overlayWindow) createOverlayWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep running in tray on all platforms for AMPLIFY
});

app.on('before-quit', async () => {
  if (connectivityTimer) clearInterval(connectivityTimer);
  await ollamaManager?.shutdown();
  await federationClient?.stop();
  await substrateServer?.stop();
});
