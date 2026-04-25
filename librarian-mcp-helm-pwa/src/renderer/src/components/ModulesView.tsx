import React from 'react'
import { HelmModule } from '../modules/registry'

interface Props {
  allModules: HelmModule[]
  moduleEnabled: (id: string) => boolean
  onToggle: (id: string, enabled: boolean) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  cathedral: 'Cathedral',
  tools: 'Tools',
  community: 'Community',
  labs: 'Labs',
}

const S = {
  container: { padding: '32px', maxWidth: '640px' },
  heading: { fontSize: '20px', fontWeight: 600, color: '#f1f5f9', marginBottom: '6px' },
  sub: { fontSize: '13px', color: '#64748b', marginBottom: '28px', lineHeight: 1.5 },
  category: { marginBottom: '24px' },
  categoryTitle: {
    fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '0.8px',
    textTransform: 'uppercase' as const, marginBottom: '10px',
  },
  card: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: '#141824', border: '1px solid #1e2333', borderRadius: '8px',
    padding: '14px 18px', marginBottom: '8px',
  },
  info: { flex: 1 },
  modName: { fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '3px' },
  modDesc: { fontSize: '12px', color: '#64748b', lineHeight: 1.5 },
  modMeta: { fontSize: '11px', color: '#334155', marginTop: '4px' },
  toggle: {
    cursor: 'pointer', userSelect: 'none' as const, flexShrink: 0,
  },
  toggleBox: (on: boolean) => ({
    width: '36px', height: '20px', borderRadius: '10px',
    background: on ? '#3b82f6' : '#1e2333',
    position: 'relative' as const, transition: 'background 0.15s',
  }),
  toggleKnob: (on: boolean) => ({
    position: 'absolute' as const,
    top: '2px', left: on ? '18px' : '2px',
    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
    transition: 'left 0.15s',
  }),
}

export function ModulesView({ allModules, moduleEnabled, onToggle }: Props): React.ReactElement {
  const categories = [...new Set(allModules.map((m) => m.category))]

  return (
    <div style={S.container}>
      <h2 style={S.heading}>Modules</h2>
      <p style={S.sub}>
        Helm ships with Librarian only. Enable optional modules to expand your local shell.
        Each module is opt-in; disabled modules use no resources.
      </p>

      {categories.map((cat) => {
        const mods = allModules.filter((m) => m.category === cat)
        return (
          <div key={cat} style={S.category}>
            <div style={S.categoryTitle}>{CATEGORY_LABELS[cat] ?? cat}</div>
            {mods.map((mod) => {
              const enabled = moduleEnabled(mod.id)
              return (
                <div key={mod.id} style={S.card}>
                  <div style={S.info}>
                    <div style={S.modName}>{mod.name}</div>
                    <div style={S.modDesc}>{mod.description}</div>
                    <div style={S.modMeta}>v{mod.version} · {mod.id}</div>
                  </div>
                  <div
                    style={S.toggle}
                    onClick={() => onToggle(mod.id, !enabled)}
                    title={enabled ? 'Disable module' : 'Enable module'}
                  >
                    <div style={S.toggleBox(enabled)}>
                      <div style={S.toggleKnob(enabled)} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
