// AMPLIFY Computer — Electron Main Process
// B37 Phase 1 — BP025 / Bushel 37
// Transparent fullscreen overlay window + Tray + IPC substrate bridge

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

// ─── Constants ──────────────────────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === 'development' || !app.isPackaged;
const RENDERER_URL = IS_DEV
  ? 'http://localhost:5173'
  : `file://${join(__dirname, '../renderer/index.html')}`;

// ─── State ──────────────────────────────────────────────────────────────────

let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let ollamaManager: OllamaManager | null = null;
let substrateServer: SubstrateAPIServer | null = null;

// ─── Overlay Window ─────────────────────────────────────────────────────────

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

  // Make the window click-through — clicks pass to desktop/apps below
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  // Load renderer
  overlayWindow.loadURL(RENDERER_URL);

  if (IS_DEV) {
    overlayWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Re-position on display changes
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

function rebuildTrayMenu(mode: FrameMode = 'normal'): void {
  if (!tray) return;

  const modeLabel: Record<FrameMode, string> = {
    ai_burst: '🔥 AI Burst',
    normal: '🌿 Normal',
    fallback: '🌑 Fallback',
  };

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `AMPLIFY Computer — ${modeLabel[mode]}`,
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
      label: 'AMPLIFY Dashboard',
      click: () => openDashboard(),
    },
    {
      label: 'Settings',
      click: () => openSettings(),
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

// ─── Frame Mode ──────────────────────────────────────────────────────────────

type FrameMode = 'ai_burst' | 'normal' | 'fallback';
let currentMode: FrameMode = 'normal';

function setMode(mode: FrameMode): void {
  currentMode = mode;
  rebuildTrayMenu(mode);
  overlayWindow?.webContents.send('frame-mode-changed', { mode });
}

function detectMode(context: {
  aiAvailable: boolean;
  substrateIndexAvailable: boolean;
  peerNodesAvailable: number;
  userBudgetRemaining?: number;
}): FrameMode {
  if (!context.aiAvailable || context.userBudgetRemaining === 0) {
    if (context.substrateIndexAvailable) return 'normal';
    return 'fallback';
  }
  return 'ai_burst';
}

// ─── IPC Handlers ────────────────────────────────────────────────────────────

function registerIPCHandlers(): void {
  // Renderer can request current mode
  ipcMain.handle('get-frame-mode', () => ({ mode: currentMode }));

  // Renderer can request mode change
  ipcMain.on('set-frame-mode', (_event, { mode }: { mode: FrameMode }) => {
    setMode(mode);
  });

  // Enable/disable click-through on overlay
  ipcMain.on('set-clickthrough', (_event, { enabled }: { enabled: boolean }) => {
    overlayWindow?.setIgnoreMouseEvents(enabled, { forward: true });
  });

  // Health check for Ollama
  ipcMain.handle('get-ollama-status', async () => {
    return ollamaManager?.getStatus() ?? { running: false, model: null };
  });

  // AMPLIFY telemetry snapshot
  ipcMain.handle('get-amplify-snapshot', async () => {
    return substrateServer?.getAMPLIFYSnapshot() ?? {
      total_queries: 0,
      substrate_hits: 0,
      local_ollama_served: 0,
      cloud_escalations: 0,
      total_cloud_cost_avoided_usd: 0,
    };
  });

  // Open dashboard (focusable settings window)
  ipcMain.on('open-dashboard', () => openDashboard());
}

// ─── Utility Windows ─────────────────────────────────────────────────────────

let dashboardWindow: BrowserWindow | null = null;

function openDashboard(): void {
  if (dashboardWindow) {
    dashboardWindow.focus();
    return;
  }

  dashboardWindow = new BrowserWindow({
    width: 480,
    height: 600,
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

function openSettings(): void {
  openDashboard();
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  // Initialize substrate API server
  substrateServer = new SubstrateAPIServer();
  await substrateServer.start();

  // Initialize Ollama manager (Phase 2 — hooks in but doesn't block Phase 1)
  ollamaManager = new OllamaManager();
  await ollamaManager.init();

  // Create overlay + tray
  createOverlayWindow();
  createTray();
  registerIPCHandlers();

  // Auto-detect mode based on availability
  const aiAvailable = await ollamaManager.isReachable();
  const mode = detectMode({
    aiAvailable,
    substrateIndexAvailable: true,
    peerNodesAvailable: 0,
  });
  setMode(mode);

  app.on('activate', () => {
    if (!overlayWindow) createOverlayWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep running on macOS; elsewhere quit
  if (process.platform !== 'darwin') {
    // Don't quit — AMPLIFY runs in tray
  }
});

app.on('before-quit', async () => {
  await ollamaManager?.shutdown();
  await substrateServer?.stop();
});
