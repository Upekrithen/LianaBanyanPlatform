/**
 * Member Cathedral Preview module — K484/B123 placeholder.
 *
 * Purpose: prove the module enable/disable flow works; prove the module
 * surface renders in the Helm shell. Nothing functional shipped in V0.
 *
 * K486+ will replace this with the live Sculptor-filtered cathedral feed.
 */

import React from 'react'

const S = {
  container: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
    opacity: 0.9,
  },
  icon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#e2e8f0',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#94a3b8',
    textAlign: 'center' as const,
    maxWidth: '480px',
    lineHeight: 1.6,
  },
  badge: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '12px',
    color: '#64748b',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  roadmapList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginTop: '8px',
    width: '100%',
    maxWidth: '420px',
  },
  roadmapItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#1a1f2e',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#94a3b8',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#3b4f78',
    flexShrink: 0,
  },
}

export function MemberCathedralPreview(): React.ReactElement {
  return (
    <div style={S.container}>
      <div style={S.icon}>🏛️</div>
      <span style={S.badge}>Coming soon · K486+</span>
      <h2 style={S.title}>Member Cathedral</h2>
      <p style={S.subtitle}>
        Your personal Cathedral — Miner-extracted bedrock tablets, Scribe-organized knowledge,
        and Sculptor-filtered feeds delivered to your cathedral profile. Each Sculptor passes
        content on as a filter; what arrives here is your property.
      </p>

      <ul style={S.roadmapList}>
        {[
          'Bedrock tablet browser (K486)',
          'Sculptor filter configuration (K487)',
          'Cathedral-profile scope control (K487)',
          'Comet bridge injection (K485)',
          'Cross-cathedral consultation (K488)',
        ].map((item) => (
          <li key={item} style={S.roadmapItem}>
            <div style={S.dot} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
