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

export interface HelmAPI {
  getDaemonStatus: () => Promise<DaemonStatus>
  restartDaemon: () => Promise<boolean>
  getSettings: () => Promise<HelmSettings>
  setSettings: (partial: Partial<HelmSettings>) => Promise<HelmSettings>
  openExternal: (url: string) => Promise<void>
  onDaemonStatusChange: (cb: (status: DaemonStatus) => void) => () => void
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
}

contextBridge.exposeInMainWorld('helm', helmAPI)
