import React from 'react'
import { DaemonStatus, HelmSettings } from '../App'

interface Props {
  daemonStatus: DaemonStatus
  settings: HelmSettings
  onOpenExternal: (url: string) => void
  isElectron: boolean
}

const S = {
  container: {
    padding: '40px',
    maxWidth: '640px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.5px',
    marginBottom: '8px',
  },
  sub: {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '36px',
    lineHeight: 1.6,
  },
  card: {
    background: '#141824',
    border: '1px solid #1e2333',
    borderRadius: '10px',
    padding: '20px 24px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#94a3b8',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
  },
  endpoint: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#0f1117',
    borderRadius: '6px',
    padding: '10px 14px',
    marginBottom: '8px',
  },
  endpointLabel: {
    fontSize: '11px',
    color: '#475569',
    width: '80px',
    flexShrink: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  endpointUrl: (alive: boolean) => ({
    fontFamily: 'monospace',
    fontSize: '13px',
    color: alive ? '#60a5fa' : '#334155',
    cursor: alive ? 'pointer' : 'default',
    textDecoration: alive ? 'underline' : 'none',
  }),
  sseNote: {
    fontSize: '12px',
    color: '#475569',
    marginTop: '12px',
    lineHeight: 1.5,
  },
  cliBlock: {
    background: '#0f1117',
    borderRadius: '6px',
    padding: '12px 16px',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  prompt: {
    color: '#60a5fa',
  },
}

export function HomeView({ daemonStatus, settings, onOpenExternal, isElectron }: Props): React.ReactElement {
  const { alive, port } = daemonStatus
  const sseUrl = `http://localhost:${port}/sse`
  const mcpUrl = `http://localhost:${port}/mcp`

  return (
    <div style={S.container}>
      <h1 style={S.heading}>Helm</h1>
      <p style={S.sub}>
        Your local shell for the Liana Banyan platform. Librarian runs in the background
        — point your AI tool at the MCP endpoint or use the CLI.
      </p>

      {/* Librarian endpoints */}
      <div style={S.card}>
        <div style={S.cardTitle}>Librarian endpoints</div>

        <div style={S.endpoint}>
          <span style={S.endpointLabel}>SSE</span>
          <span
            style={S.endpointUrl(alive)}
            onClick={() => alive && onOpenExternal(sseUrl)}
            title={alive ? 'Open in browser' : 'Daemon not running'}
          >
            {sseUrl}
          </span>
        </div>

        <div style={S.endpoint}>
          <span style={S.endpointLabel}>Streamable</span>
          <span
            style={S.endpointUrl(alive)}
            onClick={() => alive && onOpenExternal(mcpUrl)}
            title={alive ? 'Open in browser' : 'Daemon not running'}
          >
            {mcpUrl}
          </span>
        </div>

        <p style={S.sseNote}>
          Point your AI tool (Claude Desktop, Cursor, Cline, etc.) at the SSE endpoint
          to use Librarian as an MCP server. Comet/ChatGPT bridge available in K485+.
        </p>
      </div>

      {/* CLI quick-reference */}
      <div style={S.card}>
        <div style={S.cardTitle}>CLI quick-reference</div>
        <div style={S.cliBlock}>
          <div><span style={S.prompt}>$</span> librarian init</div>
          <div><span style={S.prompt}>$</span> librarian ingest notes.md --scribe-name MyNotes</div>
          <div><span style={S.prompt}>$</span> librarian query "my question" --format comet</div>
        </div>
      </div>

      {/* Cathedral path */}
      <div style={S.card}>
        <div style={S.cardTitle}>Cathedral</div>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#64748b',
          padding: '8px 0',
          wordBreak: 'break-all' as const,
        }}>
          {settings.cathedralDir || '~/.librarian/'}
        </div>
      </div>

      {!isElectron && (
        <div style={{
          ...S.card,
          borderColor: '#1e3a5f',
          background: '#0d1929',
        }}>
          <div style={S.cardTitle}>Browser mode</div>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
            Daemon supervision is not available in browser mode. Install the Helm desktop app
            to run Librarian as a background service.
          </p>
        </div>
      )}
    </div>
  )
}
