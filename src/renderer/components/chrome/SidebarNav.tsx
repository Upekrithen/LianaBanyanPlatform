// SidebarNav.tsx — M23 §2b · Citadel Gate Architecture
// Peer mode: simplified top bar (Home | Models | Tasks)
// Power mode: left sidebar rail (~220px) with 7 items + visual divider
// Mobile < 768px: tab bar layout in both modes (44px touch targets)
// localStorage key: 'mnemosyne_sidebar_collapsed' (§2d)

import React, { useCallback, useEffect, useState } from 'react';
import type { UiCitadelMode } from './ModeToggle';

export type CitadelNavItem =
  | 'home'
  | 'models'
  | 'tasks'
  | 'appearance'
  | 'advanced'
  | 'diagnostics';

const LS_SIDEBAR_COLLAPSED = 'mnemosyne_sidebar_collapsed';

// Nav items per mode (R3/R9: substrate-neutral vocabulary in nav labels)
const PEER_ITEMS: CitadelNavItem[] = ['home', 'models', 'tasks', 'appearance'];
const POWER_ITEMS: CitadelNavItem[] = ['home', 'models', 'tasks', 'appearance', 'advanced', 'diagnostics'];

const ITEM_LABELS: Record<CitadelNavItem, string> = {
  home:        'Home',
  models:      'Models',
  tasks:       'Tasks',
  appearance:  'Appearance',
  advanced:    'Advanced',
  diagnostics: 'Diagnostics',
};

const ITEM_ICONS: Record<CitadelNavItem, string> = {
  home:        '🏠',
  models:      '🧠',
  tasks:       '⚔️',
  appearance:  '🎨',
  advanced:    '⚡',
  diagnostics: '🔬',
};

// Items below the visual divider (Power mode only)
const BELOW_DIVIDER: CitadelNavItem[] = ['advanced', 'diagnostics'];

interface SidebarNavProps {
  mode: UiCitadelMode;
  activeItem: CitadelNavItem;
  onNavigate: (item: CitadelNavItem) => void;
  appVersion?: string | null;
  /** For Power mode footer: connection status indicator */
  connectionStatus?: 'connected' | 'connecting' | 'offline';
  onClose?: () => void;
  onQuit?: () => void;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export function SidebarNav({
  mode,
  activeItem,
  onNavigate,
  appVersion,
  connectionStatus = 'offline',
  onClose,
  onQuit,
}: SidebarNavProps): React.ReactElement {
  const isMobile = useIsMobile();

  // §2d: sidebar collapse state persistence
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(LS_SIDEBAR_COLLAPSED) === 'true';
  });

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(LS_SIDEBAR_COLLAPSED, next ? 'true' : 'false');
      return next;
    });
  }, []);

  const handleKeyNav = useCallback((e: React.KeyboardEvent<HTMLElement>, items: CitadelNavItem[], idx: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = items[(idx + 1) % items.length];
      onNavigate(next);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      onNavigate(prev);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(items[idx]);
    }
  }, [onNavigate]);

  const connectionColor = connectionStatus === 'connected' ? '#4ade80'
    : connectionStatus === 'connecting' ? '#fbbf24'
    : '#475569';

  // ── Mobile or Peer mode: top tab bar ─────────────────────────────────────────
  if (isMobile || mode === 'peer') {
    const items = mode === 'peer' ? PEER_ITEMS : PEER_ITEMS; // mobile always shows peer items
    return (
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          display: 'flex',
          flexDirection: 'row' as const,
          alignItems: 'center',
          borderBottom: '1px solid rgba(100,116,139,0.2)',
          background: '#0a0f1a',
          padding: '0 8px',
          flexShrink: 0,
          gap: 2,
          overflowX: 'auto' as const,
        }}
      >
        {items.map((item, idx) => {
          const active = item === activeItem;
          return (
            <button
              key={item}
              role="tab"
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
              tabIndex={active ? 0 : -1}
              onClick={() => onNavigate(item)}
              onKeyDown={(e) => handleKeyNav(e, items, idx)}
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                minWidth: 60,
                padding: '6px 14px',
                background: active ? 'rgba(110,231,183,0.08)' : 'transparent',
                color: active ? '#6ee7b7' : '#64748b',
                border: 'none',
                borderBottom: active ? '2px solid #6ee7b7' : '2px solid transparent',
                borderRadius: '0',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                userSelect: 'none' as const,
                whiteSpace: 'nowrap' as const,
                flexShrink: 0,
                gap: 2,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 16 }} aria-hidden>{ITEM_ICONS[item]}</span>
              <span>{ITEM_LABELS[item]}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // ── Power mode: left sidebar rail ─────────────────────────────────────────────
  const sidebarWidth = collapsed ? 52 : 220;
  const aboveDivider = POWER_ITEMS.filter((i) => !BELOW_DIVIDER.includes(i));

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        width: sidebarWidth,
        minWidth: sidebarWidth,
        background: '#070d1a',
        borderRight: '1px solid rgba(100,116,139,0.15)',
        flexShrink: 0,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={toggleCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          background: 'none',
          border: 'none',
          color: '#475569',
          cursor: 'pointer',
          padding: '10px 14px',
          textAlign: 'right' as const,
          fontSize: 12,
          flexShrink: 0,
          alignSelf: 'flex-end' as const,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {collapsed ? '›' : '‹'}
      </button>

      {/* Nav items above divider */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 2, padding: '0 6px' }}>
        {aboveDivider.map((item, idx) => {
          const active = item === activeItem;
          return (
            <button
              key={item}
              role="menuitem"
              aria-current={active ? 'page' : undefined}
              tabIndex={0}
              onClick={() => onNavigate(item)}
              onKeyDown={(e) => handleKeyNav(e, POWER_ITEMS, POWER_ITEMS.indexOf(item))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' as const : 'flex-start' as const,
                borderRadius: 8,
                border: 'none',
                background: active ? 'rgba(110,231,183,0.1)' : 'transparent',
                color: active ? '#6ee7b7' : '#64748b',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                userSelect: 'none' as const,
                whiteSpace: 'nowrap' as const,
                minHeight: 40,
                width: '100%',
                transition: 'all 0.15s ease',
                borderLeft: active ? '2px solid #6ee7b7' : '2px solid transparent',
              }}
              title={collapsed ? ITEM_LABELS[item] : undefined}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }} aria-hidden>{ITEM_ICONS[item]}</span>
              {!collapsed && <span>{ITEM_LABELS[item]}</span>}
            </button>
          );
        })}

        {/* Visual divider before Advanced/Diagnostics */}
        <div style={{
          margin: '8px 4px',
          borderTop: '1px solid rgba(100,116,139,0.15)',
          flexShrink: 0,
        }} role="separator" />

        {BELOW_DIVIDER.map((item) => {
          const active = item === activeItem;
          return (
            <button
              key={item}
              role="menuitem"
              aria-current={active ? 'page' : undefined}
              tabIndex={0}
              onClick={() => onNavigate(item)}
              onKeyDown={(e) => handleKeyNav(e, POWER_ITEMS, POWER_ITEMS.indexOf(item))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' as const : 'flex-start' as const,
                borderRadius: 8,
                border: 'none',
                background: active ? 'rgba(110,231,183,0.1)' : 'transparent',
                color: active ? '#6ee7b7' : '#475569',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                userSelect: 'none' as const,
                whiteSpace: 'nowrap' as const,
                minHeight: 40,
                width: '100%',
                transition: 'all 0.15s ease',
                borderLeft: active ? '2px solid #6ee7b7' : '2px solid transparent',
              }}
              title={collapsed ? ITEM_LABELS[item] : undefined}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }} aria-hidden>{ITEM_ICONS[item]}</span>
              {!collapsed && <span>{ITEM_LABELS[item]}</span>}
            </button>
          );
        })}
      </div>

      {/* Sidebar footer: version + connection + CLOSE + QUIT */}
      <div style={{
        padding: collapsed ? '8px 4px' : '10px 12px',
        borderTop: '1px solid rgba(100,116,139,0.1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 6,
      }}>
        {/* Connection indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          justifyContent: collapsed ? 'center' as const : 'flex-start' as const,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: connectionColor, flexShrink: 0, display: 'block',
          }} aria-hidden />
          {!collapsed && (
            <span style={{ fontSize: 10, color: '#475569' }}>
              {connectionStatus === 'connected' ? 'connected' : connectionStatus === 'connecting' ? 'connecting…' : 'offline'}
            </span>
          )}
        </div>

        {/* Version */}
        {!collapsed && appVersion && (
          <div style={{ fontSize: 9, color: '#334155' }}>v{appVersion}</div>
        )}

        {/* CLOSE and QUIT buttons (R3 RESOLVED: two-button semantic) */}
        {!collapsed && (
          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
            {onClose && (
              <button
                onClick={onClose}
                title="Close window — app stays running, mesh participation continues"
                aria-label="Close window"
                style={{
                  flex: 1, padding: '4px 0', fontSize: 10, cursor: 'pointer',
                  background: 'rgba(100,116,139,0.08)',
                  border: '1px solid rgba(100,116,139,0.2)',
                  borderRadius: 5, color: '#64748b', fontWeight: 500,
                }}
              >
                Close
              </button>
            )}
            {onQuit && (
              <button
                onClick={onQuit}
                title="Quit — exits the application. Mesh participation ends."
                aria-label="Quit application"
                style={{
                  flex: 1, padding: '4px 0', fontSize: 10, cursor: 'pointer',
                  background: 'rgba(100,116,139,0.05)',
                  border: '1px solid rgba(100,116,139,0.15)',
                  borderRadius: 5, color: '#475569', fontWeight: 500,
                }}
              >
                Quit
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
