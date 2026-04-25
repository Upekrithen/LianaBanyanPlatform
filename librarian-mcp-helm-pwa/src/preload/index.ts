/**
 * Helm Preload — contextBridge API exposed to the renderer.
 *
 * All main-process capabilities are gated through this bridge.
 * Renderer code uses `window.helm.*` — no direct Node access.
 */

import { contextBridge, ipcRenderer } from 'electron'

export interface DaemonStatus {
  alive: boolean
  pid: number | null
  port: number
  lastError: string | null
  restartCount: number
}

export interface HelmSettings {
  cathedralDir: string
  port: number
  pythonPath: string
  startAtLogin: boolean
  modules: Record<string, boolean>
}

// ─── Module task types ────────────────────────────────────────────────────────

export interface ModuleTaskStatus {
  taskId: string
  running: boolean
  exitCode: number | null
  pid: number | null
  startedAt: string | null
  stoppedAt: string | null
  lastError: string | null
}

export interface HelmAPI {
  // Daemon
  getDaemonStatus: () => Promise<DaemonStatus>
  restartDaemon: () => Promise<boolean>
  // Settings
  getSettings: () => Promise<HelmSettings>
  setSettings: (partial: Partial<HelmSettings>) => Promise<HelmSettings>
  // Shell
  openExternal: (url: string) => Promise<void>
  // Events
  onDaemonStatusChange: (cb: (status: DaemonStatus) => void) => () => void
  // Module background tasks (K486)
  runModuleTask: (taskId: string, python: string, script: string, args: string[], cwd: string) => Promise<{ ok: boolean; error?: string }>
  stopModuleTask: (taskId: string) => Promise<boolean>
  getModuleTaskStatus: (taskId: string) => Promise<ModuleTaskStatus>
  onModuleOutput: (taskId: string, cb: (line: string, stream: 'stdout' | 'stderr') => void) => () => void
}

const helmAPI: HelmAPI = {
  getDaemonStatus: () => ipcRenderer.invoke('daemon:status'),
  restartDaemon: () => ipcRenderer.invoke('daemon:restart'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (partial) => ipcRenderer.invoke('settings:set', partial),
  openExternal: (url) => ipcRenderer.invoke('open:external', url),
  onDaemonStatusChange: (cb) => {
    const listener = (_event: Electron.IpcRendererEvent, status: DaemonStatus) => cb(status)
    ipcRenderer.on('daemon:status-change', listener)
    return () => ipcRenderer.removeListener('daemon:status-change', listener)
  },
  // Module tasks
  runModuleTask: (taskId, python, script, args, cwd) =>
    ipcRenderer.invoke('module:run', taskId, python, script, args, cwd),
  stopModuleTask: (taskId) => ipcRenderer.invoke('module:stop', taskId),
  getModuleTaskStatus: (taskId) => ipcRenderer.invoke('module:status', taskId),
  onModuleOutput: (taskId, cb) => {
    const channel = `module:output:${taskId}`
    const listener = (_event: Electron.IpcRendererEvent, line: string, stream: 'stdout' | 'stderr') => cb(line, stream)
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  },
}

contextBridge.exposeInMainWorld('helm', helmAPI)
