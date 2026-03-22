/**
 * DenkenMenu — Unified floating Denken avatar with hover submenu
 * ================================================================
 * Merges BuilderModeToggle (X-Ray Goggles) and CrowsNestFloat into
 * a single 56px avatar button at bottom-right. Hover fans out a
 * vertical pill menu above the button with staggered animation.
 *
 * Hidden on landing page ("/") and full Crow's Nest page ("/crows-nest").
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBuilderMode } from './BuilderModeContext';
import { useCrowsNest } from '@/contexts/CrowsNestContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Telescope, Glasses, Sprout, Building2, Compass, Zap, MapPin, ChevronRight, Trash2, X } from 'lucide-react';
import { BEACON_COLORS } from '@/components/BeaconDropButton';

interface StoredBeacon {
  id: string;
  name: string;
  beacon_color: string;
  location_path: string;
  page_title: string | null;
  notes: string | null;
  created_at: string;
}

const COLOR_ORDER = ['green', 'blue', 'yellow', 'red', 'purple', 'orange'] as const;
const COLOR_EMOJI: Record<string, string> = { green: '🟢', blue: '🔵', yellow: '🟡', red: '🔴', purple: '🟣', orange: '🟠' };
const COLOR_LABELS: Record<string, string> = { green: 'Return', blue: 'Important', yellow: 'Decision', red: 'Blocked', purple: 'Complete', orange: 'Custom' };

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

export const DenkenMenu: React.FC = () => {
  const { isBuilderModeActive, toggleBuilderMode } = useBuilderMode();
  const { queue, openOverlay, isOverlayOpen } = useCrowsNest();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [beaconPanelOpen, setBeaconPanelOpen] = useState(false);
  const [beacons, setBeacons] = useState<StoredBeacon[]>([]);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('beacons')
      .select('id, name, beacon_color, location_path, page_title, notes, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setBeacons((data as StoredBeacon[] | null) || []));
  }, [user, beaconPanelOpen]);

  const grouped = useMemo(() => {
    const map = new Map<string, StoredBeacon[]>();
    for (const b of beacons) {
      const list = map.get(b.beacon_color) || [];
      list.push(b);
      map.set(b.beacon_color, list);
    }
    return map;
  }, [beacons]);

  const handleRemoveBeacon = async (id: string) => {
    await supabase.from('beacons').delete().eq('id', id);
    setBeacons(prev => prev.filter(b => b.id !== id));
  };

  // Hide on full Crow's Nest page or when overlay is open
  if (
    location.pathname === '/crows-nest' ||
    isOverlayOpen
  ) {
    return null;
  }

  const handleMouseEnter = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setIsMenuOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeout.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 150);
  }, []);

  const handleButtonClick = useCallback(() => {
    // Touch-device fallback: toggle menu on click
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleXRayClick = useCallback(() => {
    toggleBuilderMode();
    setIsMenuOpen(false);
  }, [toggleBuilderMode]);

  const handleCrowsNestClick = useCallback(() => {
    openOverlay('browse');
    setIsMenuOpen(false);
  }, [openOverlay]);

  const menuItems: MenuItem[] = [
    {
      id: 'beacons',
      icon: <MapPin className="h-4 w-4" />,
      label: `My Beacons${beacons.length > 0 ? ` (${beacons.length})` : ''}`,
      onClick: () => { setBeaconPanelOpen(true); setIsMenuOpen(false); },
    },
    {
      id: 'portal',
      icon: <Compass className="h-4 w-4" />,
      label: 'Portal',
      onClick: () => { navigate('/portal'); setIsMenuOpen(false); },
    },
    {
      id: 'plant-seeds',
      icon: <Sprout className="h-4 w-4" />,
      label: 'Plant Seeds',
      onClick: () => { navigate('/plant-seeds'); setIsMenuOpen(false); },
    },
    {
      id: 'build-business',
      icon: <Building2 className="h-4 w-4" />,
      label: 'Build a Business',
      onClick: () => { navigate('/build-a-business'); setIsMenuOpen(false); },
    },
    {
      id: 'crows-nest',
      icon: <Telescope className="h-4 w-4" />,
      label: `Crow's Nest${queue.length > 0 ? ` (${queue.length})` : ''}`,
      onClick: handleCrowsNestClick,
    },
    {
      id: 'xray',
      icon: <Glasses className="h-4 w-4" />,
      label: 'X-Ray Goggles',
      onClick: handleXRayClick,
      isActive: isBuilderModeActive,
    },
    {
      id: 'tldr-tour',
      icon: <Zap className="h-4 w-4" />,
      label: 'TL;DR Tour',
      onClick: () => { navigate('/wildfire/tldr-tour'); setIsMenuOpen(false); },
    },
  ];

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="complementary"
      aria-label="Denken tools menu"
    >
      {/* Submenu — fans out above the avatar */}
      <div
        className="absolute bottom-full right-0 mb-2 flex flex-col items-end gap-1.5"
        style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
      >
        {menuItems.map((item, index) => {
          // Items animate from bottom to top; lowest index = highest position
          // Stagger: item closer to button animates first
          const reverseIndex = menuItems.length - 1 - index;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium
                         bg-slate-900/95 text-slate-200 border border-slate-700
                         hover:bg-slate-800 hover:border-cyan-500/50 hover:text-white
                         backdrop-blur-sm shadow-lg
                         transition-all duration-200 ease-out whitespace-nowrap"
              style={{
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen
                  ? 'translateY(0) scale(1)'
                  : 'translateY(12px) scale(0.9)',
                transitionDelay: isMenuOpen
                  ? `${reverseIndex * 60}ms`
                  : `${index * 30}ms`,
                transitionProperty: 'opacity, transform',
              }}
              aria-label={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
              {/* Active indicator dot for X-Ray */}
              {item.isActive && (
                <span
                  className="inline-block w-2 h-2 rounded-full bg-cyan-400 ml-0.5"
                  style={{
                    boxShadow: '0 0 6px rgba(34,211,238,0.6)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Denken avatar button */}
      <button
        onClick={handleButtonClick}
        className={`rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center border-2 overflow-hidden ${
          isBuilderModeActive
            ? 'border-cyan-400 scale-110 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
            : 'border-slate-500 hover:border-cyan-500/50 hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
        }`}
        style={{
          width: '64px',
          height: '64px',
          padding: 0,
          position: 'relative',
          background: isBuilderModeActive ? '#0a1628' : '#e8e4dc',
          transition: 'all 0.5s ease',
        }}
        aria-label="Denken tools"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <img
          src="/images/founderDenken.png"
          alt="Denken"
          className="w-full h-full object-cover transition-all duration-500"
          style={{
            filter: isBuilderModeActive
              ? 'drop-shadow(0 0 3px rgba(34,211,238,0.9)) drop-shadow(0 0 6px rgba(34,211,238,0.6)) drop-shadow(0 0 12px rgba(34,211,238,0.3))'
              : 'contrast(1.15) saturate(1.3) sepia(0.15) hue-rotate(-10deg)',
          }}
        />

        {/* Cyan glow overlay on glasses when active */}
        {isBuilderModeActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 70% 25% at 50% 45%, rgba(34,211,238,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
          />
        )}

        {/* Per-lens shimmer when NOT in X-Ray mode */}
        {!isBuilderModeActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
              borderRadius: '50%',
            }}
          >
            {/* Left lens shimmer */}
            <div
              style={{
                position: 'absolute',
                top: '32%',
                left: '12%',
                width: '28%',
                height: '22%',
                overflow: 'hidden',
                borderRadius: '50%',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-150%',
                  width: '100%',
                  height: '100%',
                  background:
                    'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.4) 60%, transparent 100%)',
                  animation: 'denkenLensShimmerL 8s ease-in-out infinite',
                }}
              />
            </div>
            {/* Right lens shimmer */}
            <div
              style={{
                position: 'absolute',
                top: '32%',
                left: '58%',
                width: '28%',
                height: '22%',
                overflow: 'hidden',
                borderRadius: '50%',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-150%',
                  width: '100%',
                  height: '100%',
                  background:
                    'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.4) 60%, transparent 100%)',
                  animation: 'denkenLensShimmerR 8s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        )}

        {/* Badge: beacon count + Crow's Nest queue */}
        {(queue.length + beacons.length) > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center
                       text-[10px] font-bold text-white bg-red-500 rounded-full
                       min-w-[18px] h-[18px] px-1 leading-none shadow-md"
          >
            {queue.length + beacons.length}
          </span>
        )}
      </button>

      {/* Beacon Panel — slides in from right when open */}
      {beaconPanelOpen && (
        <div
          className="fixed bottom-24 right-6 w-80 max-h-[60vh] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          style={{ animation: 'denkenSlideIn 200ms ease-out' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-sm">My Beacons</span>
              <span className="text-[10px] text-muted-foreground">({beacons.length})</span>
            </div>
            <button onClick={() => setBeaconPanelOpen(false)} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {beacons.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No beacons yet</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Drop beacons on pages to find your way back.</p>
              </div>
            )}
            {COLOR_ORDER.map(color => {
              const items = grouped.get(color);
              if (!items || items.length === 0) return null;
              const colorDef = BEACON_COLORS[color];
              return (
                <div key={color}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    {COLOR_EMOJI[color]} {COLOR_LABELS[color]} ({items.length})
                  </p>
                  <div className="space-y-0.5">
                    {items.map(b => (
                      <div
                        key={b.id}
                        className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors"
                        onClick={() => { setBeaconPanelOpen(false); navigate(b.location_path); }}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorDef?.color || '#888' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{b.name || b.page_title || b.location_path}</p>
                          {b.notes && <p className="text-[10px] text-muted-foreground truncate">{b.notes}</p>}
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-foreground shrink-0" />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveBeacon(b.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {beacons.length > 0 && (
            <div className="px-3 py-2 border-t border-border">
              <button
                onClick={() => { setBeaconPanelOpen(false); navigate('/helm'); }}
                className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
              >
                Manage All in Helm →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Per-lens shimmer keyframes — left fires slightly before right for realism */}
      <style>{`
        @keyframes denkenSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes denkenLensShimmerL {
          0%, 80% { left: -150%; opacity: 0; }
          85% { opacity: 1; }
          92% { left: 250%; opacity: 0; }
          100% { left: 250%; opacity: 0; }
        }
        @keyframes denkenLensShimmerR {
          0%, 83% { left: -150%; opacity: 0; }
          88% { opacity: 1; }
          95% { left: 250%; opacity: 0; }
          100% { left: 250%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
