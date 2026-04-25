/**
 * Helm App — root component.
 *
 * Layout:
 *   ┌──────────────────────────────────────────┐
 *   │  Sidebar (status + nav)                  │
 *   │──────────────────────────────────────────│
 *   │  Main content area                       │
 *   └──────────────────────────────────────────┘
 *
 * Three views: home (Librarian status), settings, modules.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { StatusBar } from './components/StatusBar'
import { HomeView } from './components/HomeView'
import { SettingsPanel } from './components/SettingsPanel'
import { ModulesView } from './components/ModulesView'
import { getAllModules } from './modules/registry'

export type View = 'home' | 'settings' | 'modules'

declare global {
  interface Window {
    helm?: {
      getDaemonStatus: () => Promise<DaemonStatus>
      restartDaemon: () => Promise<boolean>
      getSettings: () => Promise<HelmSettings>
      setSettings: (partial: Partial<HelmSettings>) => Promise<HelmSettings>
      openExternal: (url: string) => Promise<void>
      onDaemonStatusChange: (cb: (status: DaemonStatus) => void) => () => void
    }
  }
}

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

const isElectron = typeof window.helm !== 'undefined'

const S = {
  root: {
    display: 'flex',
    height: '100vh',
    background: '#0f1117',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: '14px',
  },
  sidebar: {
    width: '200px',
    background: '#0a0d13',
    borderRight: '1px solid #1e2333',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '20px 0',
    flexShrink: 0,
  },
  logo: {
    padding: '0 20px 20px',
    borderBottom: '1px solid #1e2333',
    marginBottom: '12px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: '#fff',
  },
  logoSub: {
    fontSize: '11px',
    color: '#475569',
    marginTop: '2px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  navItem: (active: boolean) => ({
    padding: '8px 20px',
    cursor: 'pointer',
    color: active ? '#60a5fa' : '#94a3b8',
    background: active ? '#1a2035' : 'transparent',
    borderLeft: active ? '2px solid #60a5fa' : '2px solid transparent',
    fontSize: '13px',
    userSelect: 'none' as const,
    transition: 'all 0.1s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  main: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  browserBanner: {
    background: '#1a2035',
    borderBottom: '1px solid #1e2333',
    padding: '8px 20px',
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}

export default function App(): React.ReactElement {
  const [view, setView] = useState<View>('home')
  const [daemonStatus, setDaemonStatus] = useState<DaemonStatus>({
    alive: false, pid: null, port: 7711, lastError: null, restartCount: 0,
  })
  const [settings, setSettingsState] = useState<HelmSettings>({
    cathedralDir: '', port: 7711, pythonPath: '', startAtLogin: false, modules: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isElectron) {
      setLoading(false)
      return
    }
    Promise.all([
      window.helm!.getDaemonStatus(),
      window.helm!.getSettings(),
    ]).then(([status, s]) => {
      setDaemonStatus(status)
      setSettingsState(s)
      setLoading(false)
    })

    const cleanup = window.helm!.onDaemonStatusChange((status) => {
      setDaemonStatus(status)
    })
    return cleanup
  }, [])

  const handleSaveSettings = useCallback(async (partial: Partial<HelmSettings>) => {
    if (!isElectron) return
    const updated = await window.helm!.setSettings(partial)
    setSettingsState(updated)
  }, [])

  const handleRestartDaemon = useCallback(async () => {
    if (!isElectron) return
    await window.helm!.restartDaemon()
  }, [])

  const handleOpenExternal = useCallback((url: string) => {
    if (isElectron) {
      window.helm!.openExternal(url)
    } else {
      window.open(url, '_blank')
    }
  }, [])

  const allModules = getAllModules()
  const enabledModules = allModules.filter((m) => settings.modules[m.id] ?? m.enabledByDefault)

  return (
    <div style={S.root}>
      {/* Sidebar */}
      <nav style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoText}>Helm</div>
          <div style={S.logoSub}>Liana Banyan</div>
        </div>

        <div onClick={() => setView('home')} style={S.navItem(view === 'home')}>
          <span>⚓</span> Home
        </div>

        {/* Enabled module nav items */}
        {enabledModules.map((m) => (
          <div key={m.id} onClick={() => setView(m.id as View)} style={S.navItem(view === m.id)}>
            <span>🏛️</span> {m.name}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <div onClick={() => setView('modules')} style={S.navItem(view === 'modules')}>
          <span>🧩</span> Modules
        </div>
        <div onClick={() => setView('settings')} style={S.navItem(view === 'settings')}>
          <span>⚙️</span> Settings
        </div>
      </nav>

      {/* Main */}
      <div style={S.main}>
        <StatusBar
          daemonStatus={daemonStatus}
          onRestart={handleRestartDaemon}
          isElectron={isElectron}
        />

        {!isElectron && (
          <div style={S.browserBanner}>
            <span>🌐</span>
            <span>Running in browser mode — daemon supervision requires the Electron desktop shell.</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px', color: '#475569' }}>Initializing...</div>
        ) : view === 'settings' ? (
          <SettingsPanel
            settings={settings}
            onSave={handleSaveSettings}
            isElectron={isElectron}
          />
        ) : view === 'modules' ? (
          <ModulesView
            allModules={allModules}
            moduleEnabled={(id) => settings.modules[id] ?? false}
            onToggle={(id, enabled) => {
              handleSaveSettings({ modules: { ...settings.modules, [id]: enabled } })
            }}
          />
        ) : (
          /* Check if view is an enabled module id */
          (() => {
            const mod = allModules.find((m) => m.id === view && (settings.modules[m.id] ?? false))
            if (mod) {
              return <mod.component />
            }
            return (
              <HomeView
                daemonStatus={daemonStatus}
                settings={settings}
                onOpenExternal={handleOpenExternal}
                isElectron={isElectron}
              />
            )
          })()
        )}
      </div>
    </div>
  )
}
