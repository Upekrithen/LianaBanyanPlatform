import React, { useState, useEffect } from 'react'
import { HelmSettings } from '../App'

interface Props {
  settings: HelmSettings
  onSave: (partial: Partial<HelmSettings>) => Promise<void>
  isElectron: boolean
}

const S = {
  container: { padding: '32px', maxWidth: '560px' },
  heading: { fontSize: '20px', fontWeight: 600, color: '#f1f5f9', marginBottom: '24px' },
  section: { marginBottom: '28px' },
  sectionTitle: {
    fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '0.8px',
    textTransform: 'uppercase' as const, marginBottom: '12px',
  },
  row: {
    display: 'flex', flexDirection: 'column' as const, gap: '6px', marginBottom: '16px',
  },
  label: { fontSize: '13px', color: '#94a3b8', fontWeight: 500 },
  hint: { fontSize: '11px', color: '#475569', lineHeight: 1.5 },
  input: {
    background: '#141824', border: '1px solid #1e2333', borderRadius: '6px',
    padding: '8px 12px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'inherit',
    outline: 'none', width: '100%',
  },
  toggle: {
    display: 'flex', alignItems: 'center', gap: '10px',
    cursor: 'pointer', userSelect: 'none' as const,
  },
  toggleBox: (on: boolean) => ({
    width: '36px', height: '20px', borderRadius: '10px',
    background: on ? '#3b82f6' : '#1e2333',
    position: 'relative' as const, flexShrink: 0,
    transition: 'background 0.15s',
  }),
  toggleKnob: (on: boolean) => ({
    position: 'absolute' as const,
    top: '2px', left: on ? '18px' : '2px',
    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
    transition: 'left 0.15s',
  }),
  saveBtn: {
    padding: '8px 20px', background: '#3b82f6', border: 'none', borderRadius: '6px',
    color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    marginTop: '4px',
  },
  savedMsg: { fontSize: '12px', color: '#22c55e', marginTop: '8px' },
}

export function SettingsPanel({ settings, onSave, isElectron }: Props): React.ReactElement {
  const [local, setLocal] = useState(settings)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setLocal(settings) }, [settings])

  const handleSave = async () => {
    await onSave(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!isElectron) {
    return (
      <div style={S.container}>
        <h2 style={S.heading}>Settings</h2>
        <p style={{ color: '#475569', fontSize: '14px' }}>
          Settings are managed by the Electron shell. Open the Helm desktop app to configure.
        </p>
      </div>
    )
  }

  return (
    <div style={S.container}>
      <h2 style={S.heading}>Settings</h2>

      <div style={S.section}>
        <div style={S.sectionTitle}>Cathedral</div>

        <div style={S.row}>
          <label style={S.label}>Cathedral directory</label>
          <input
            style={S.input}
            value={local.cathedralDir}
            onChange={(e) => setLocal({ ...local, cathedralDir: e.target.value })}
            placeholder="~/.librarian/"
          />
          <span style={S.hint}>
            Path where your Scribes, bedrock tablets, and auto_keywords live.
            Run <code style={{ color: '#60a5fa' }}>librarian init</code> to bootstrap.
          </span>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Librarian daemon</div>

        <div style={S.row}>
          <label style={S.label}>Port</label>
          <input
            style={{ ...S.input, width: '120px' }}
            type="number"
            value={local.port}
            onChange={(e) => setLocal({ ...local, port: Number(e.target.value) })}
          />
          <span style={S.hint}>
            Port the Librarian SSE server listens on. Default: 7711.
            Restart the daemon after changing.
          </span>
        </div>

        <div style={S.row}>
          <label style={S.label}>Python executable</label>
          <input
            style={S.input}
            value={local.pythonPath}
            onChange={(e) => setLocal({ ...local, pythonPath: e.target.value })}
            placeholder="Auto-detect (librarian-mcp-public venv)"
          />
          <span style={S.hint}>
            Leave empty to auto-detect the librarian-mcp-public virtual environment.
            Override if you have a different Python installation.
          </span>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>System</div>

        <div style={S.row}>
          <div
            style={S.toggle}
            onClick={() => setLocal({ ...local, startAtLogin: !local.startAtLogin })}
          >
            <div style={S.toggleBox(local.startAtLogin)}>
              <div style={S.toggleKnob(local.startAtLogin)} />
            </div>
            <span style={S.label}>Launch Helm at system login</span>
          </div>
          <span style={S.hint}>
            Registers Helm in the Windows startup folder so Librarian is always available.
          </span>
        </div>
      </div>

      <button style={S.saveBtn} onClick={handleSave}>
        Save settings
      </button>
      {saved && <div style={S.savedMsg}>Saved.</div>}
    </div>
  )
}
