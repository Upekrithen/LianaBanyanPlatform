/**
 * Helm PWA — Electron Main Process
 *
 * Responsibilities:
 *  1. Create the browser window (renderer)
 *  2. Load + persist settings (JSON in userData)
 *  3. Spawn and supervise the Librarian daemon subprocess
 *  4. Handle IPC from renderer (status, settings, restart)
 *  5. Clean shutdown on quit
 *
 * K484/B123 — V0 skeleton
 */

import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { join } from 'path'

// ─── Settings ────────────────────────────────────────────────────────────────

interface HelmSettings {
  cathedralDir: string
  port: number
  pythonPath: string
  startAtLogin: boolean
  modules: Record<string, boolean>  // moduleId -> enabled
}

const DEFAULT_SETTINGS: HelmSettings = {
  cathedralDir: path.join(app.getPath('home'), '.librarian'),
  port: 7711,
  pythonPath: '', // empty = auto-detect
  startAtLogin: false,
  modules: {
    'member-cathedral-preview': false,
  },
}

let settingsPath = ''
let settings: HelmSettings = { ...DEFAULT_SETTINGS }

function loadSettings(): HelmSettings {
  settingsPath = path.join(app.getPath('userData'), 'helm-settings.json')
  if (fs.existsSync(settingsPath)) {
    try {
      const raw = fs.readFileSync(settingsPath, 'utf-8')
      const parsed = JSON.parse(raw) as Partial<HelmSettings>
      return { ...DEFAULT_SETTINGS, ...parsed }
    } catch {
      return { ...DEFAULT_SETTINGS }
    }
  }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(s: HelmSettings): void {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2), 'utf-8')
  } catch (err) {
    console.error('[Helm] Failed to save settings:', err)
  }
}

// ─── Python / daemon path resolution ─────────────────────────────────────────

const VENV_PYTHON_WIN = path.join(
  __dirname,
  '..', '..', '..', '..', // helm-pwa root → workspace root
  'librarian-mcp-public', '.venv', 'Scripts', 'python.exe'
)

const DAEMON_WRAPPER = path.join(__dirname, '..', '..', 'daemon_wrapper.py')

function resolvePython(configured: string): string {
  if (configured && fs.existsSync(configured)) return configured
  if (fs.existsSync(VENV_PYTHON_WIN)) return VENV_PYTHON_WIN
  return 'python' // fall back to system python
}

// ─── Daemon supervision ───────────────────────────────────────────────────────

interface DaemonStatus {
  alive: boolean
  pid: number | null
  port: number
  lastError: string | null
  restartCount: number
}

let daemonProcess: ChildProcess | null = null
let daemonStatus: DaemonStatus = {
  alive: false,
  pid: null,
  port: settings.port,
  lastError: null,
  restartCount: 0,
}
let restartTimer: ReturnType<typeof setTimeout> | null = null
let shuttingDown = false

function broadcastStatus(): void {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('daemon:status-change', daemonStatus)
  })
}

function startDaemon(): void {
  if (shuttingDown) return

  const python = resolvePython(settings.pythonPath)
  const wrapperPath = DAEMON_WRAPPER

  if (!fs.existsSync(wrapperPath)) {
    console.error('[Helm] daemon_wrapper.py not found at:', wrapperPath)
    daemonStatus = { ...daemonStatus, alive: false, lastError: 'daemon_wrapper.py not found' }
    broadcastStatus()
    return
  }

  console.log(`[Helm] Starting daemon: ${python} ${wrapperPath} --port ${settings.port}`)

  daemonProcess = spawn(python, [
    wrapperPath,
    '--port', String(settings.port),
    '--cathedral-dir', settings.cathedralDir,
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })

  daemonProcess.stdout?.on('data', (data: Buffer) => {
    const line = data.toString().trim()
    if (line) console.log('[daemon]', line)
  })

  daemonProcess.stderr?.on('data', (data: Buffer) => {
    const line = data.toString().trim()
    if (line) console.error('[daemon:err]', line)
  })

  daemonProcess.on('spawn', () => {
    console.log(`[Helm] Daemon spawned, PID=${daemonProcess?.pid}`)
    daemonStatus = {
      alive: true,
      pid: daemonProcess?.pid ?? null,
      port: settings.port,
      lastError: null,
      restartCount: daemonStatus.restartCount,
    }
    broadcastStatus()
  })

  daemonProcess.on('error', (err) => {
    console.error('[Helm] Daemon spawn error:', err.message)
    daemonStatus = { ...daemonStatus, alive: false, lastError: err.message }
    broadcastStatus()
  })

  daemonProcess.on('exit', (code, signal) => {
    console.log(`[Helm] Daemon exited: code=${code} signal=${signal}`)
    daemonProcess = null
    daemonStatus = {
      ...daemonStatus,
      alive: false,
      pid: null,
      lastError: code !== 0 ? `Exited with code ${code}` : null,
    }
    broadcastStatus()

    if (!shuttingDown) {
      daemonStatus.restartCount += 1
      console.log(`[Helm] Auto-restarting daemon in 5s (restart #${daemonStatus.restartCount})`)
      restartTimer = setTimeout(startDaemon, 5000)
    }
  })
}

function stopDaemon(): void {
  if (restartTimer) {
    clearTimeout(restartTimer)
    restartTimer = null
  }
  if (daemonProcess) {
    console.log('[Helm] Stopping daemon...')
    daemonProcess.kill('SIGTERM')
    daemonProcess = null
  }
  daemonStatus = { ...daemonStatus, alive: false, pid: null }
}

// ─── Window creation ──────────────────────────────────────────────────────────

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 640,
    minWidth: 700,
    minHeight: 500,
    title: 'Helm',
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

function registerIPC(): void {
  ipcMain.handle('daemon:status', () => daemonStatus)

  ipcMain.handle('daemon:restart', () => {
    stopDaemon()
    setTimeout(startDaemon, 500)
    return true
  })

  ipcMain.handle('settings:get', () => settings)

  ipcMain.handle('settings:set', (_event, newSettings: Partial<HelmSettings>) => {
    settings = { ...settings, ...newSettings }
    saveSettings(settings)
    // Propagate start-at-login to system
    app.setLoginItemSettings({ openAtLogin: settings.startAtLogin })
    return settings
  })

  ipcMain.handle('open:external', (_event, url: string) => {
    shell.openExternal(url)
  })
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  settings = loadSettings()
  saveSettings(settings) // persist defaults on first run

  registerIPC()
  createWindow()

  // Start daemon after window is ready
  setTimeout(startDaemon, 800)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  shuttingDown = true
  stopDaemon()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
