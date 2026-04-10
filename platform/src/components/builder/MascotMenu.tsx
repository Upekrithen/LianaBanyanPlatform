/**
 * MascotMenu — Unified floating mascot avatar with hover submenu
 * ================================================================
 * Little Red Hen (LRH) mascot with 3-state visual system:
 *   1. Default (not hovered): Pink hen, goggles down — mascot-lrh-default.png
 *   2. Hover (X-ray OFF): Thermal colors bloom — mascot-lrh-hover.png
 *   3. Clicked (X-ray ON): Full thermal + goggles ON — mascot-lrh-xray-on.png
 *
 * Denken mascot images reserved in /images/reserve-denken/ for Northern Province
 * (past Snow Gate, level 60+). See K348 for Northern Province integration.
 *
 * Hidden on landing page ("/") and full Crow's Nest page ("/crows-nest").
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBuilderMode } from './BuilderModeContext';
import { useCrowsNest } from '@/contexts/CrowsNestContext';
import { useWildfireRunSafe } from '@/contexts/WildfireRunContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Telescope, Glasses, Sprout, Building2, Compass, Zap, MapPin, ChevronRight, Trash2, X, MessageSquare, Home } from 'lucide-react';
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

export const MascotMenu: React.FC = () => {
  const { isBuilderModeActive, toggleBuilderMode, mascotConfig, setProvince } = useBuilderMode();
  const { queue, openOverlay, isOverlayOpen } = useCrowsNest();
  const { user } = useAuth();
  const wildfireState = useWildfireRunSafe();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [beaconPanelOpen, setBeaconPanelOpen] = useState(false);
  const [beacons, setBeacons] = useState<StoredBeacon[]>([]);

  useEffect(() => {
    const isNorthernRoute =
      location.pathname.startsWith('/northern') ||
      location.pathname.startsWith('/cephas/northern');
    setProvince(isNorthernRoute ? 'northern' : 'southern');
  }, [location.pathname, setProvince]);

  // Province-aware mascot image: LRH (south) vs Denken (north)
  const mascotImage = isBuilderModeActive
    ? mascotConfig.xrayOnImage
    : isAvatarHovered
      ? mascotConfig.hoverImage
      : mascotConfig.defaultImage;

  const mascotAlt = isBuilderModeActive
    ? `${mascotConfig.displayName} with X-Ray Goggles ON`
    : isAvatarHovered
      ? `${mascotConfig.displayName} — hover state`
      : mascotConfig.displayName;
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

  // Hide on full Crow's Nest page, when overlay is open, or during spotlight tour
  if (
    location.pathname === '/crows-nest' ||
    isOverlayOpen ||
    wildfireState?.spotlight?.isActive
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
    // Click mascot = toggle X-Ray Goggles directly (Founder directive B052)
    toggleBuilderMode();
  }, [toggleBuilderMode]);

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
      id: 'helm',
      icon: <Home className="h-4 w-4" />,
      label: 'My Helm',
      onClick: () => { navigate('/helm'); setIsMenuOpen(false); },
    },
    {
      id: 'beacons',
      icon: <MapPin className="h-4 w-4" />,
      label: `My Beacons${beacons.length > 0 ? ` (${beacons.length})` : ''}`,
      onClick: () => { setBeaconPanelOpen(true); setIsMenuOpen(false); },
    },
    {
      id: 'portal',
      icon: <Compass className="h-4 w-4" />,
      label: 'Action Portal',
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
      id: 'grand-tour',
      icon: <Zap className="h-4 w-4" />,
      label: 'Take the Grand Tour',
      onClick: () => {
        window.dispatchEvent(new Event('lb-guided-tour-open'));
        setIsMenuOpen(false);
      },
    },
    {
      id: 'feedback',
      icon: <MessageSquare className="h-4 w-4" />,
      label: 'Give Feedback',
      onClick: () => {
        if (!isBuilderModeActive) toggleBuilderMode();
        setIsMenuOpen(false);
      },
    },
  ];

  // On /auth page, mascot slides to center-bottom (just below the auth bubble tail)
  // instead of parking in the far bottom-right corner.
  const isAuthPage = location.pathname === '/auth';

  return (
    <div
      className={`fixed group ${
        isBuilderModeActive ? 'z-[10005]' : 'z-[100]'
      } ${
        isAuthPage
          ? 'bottom-6 left-1/2 -translate-x-1/2'
          : 'bottom-6 right-6'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="complementary"
      aria-label="Mascot tools menu"
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

      {/* Main mascot avatar button — Little Red Hen */}
      <button
        onClick={handleButtonClick}
        onMouseEnter={() => setIsAvatarHovered(true)}
        onMouseLeave={() => setIsAvatarHovered(false)}
        className={`mascot-avatar rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center border-2 overflow-hidden ${
          isBuilderModeActive
            ? 'border-cyan-400 scale-110 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
            : isAvatarHovered
              ? 'border-amber-400/70 scale-108 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'border-slate-500/50 hover:border-amber-400/50 hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
        }`}
        style={{
          width: '64px',
          height: '64px',
          padding: 0,
          position: 'relative',
          background: isBuilderModeActive ? '#0a1628' : isAvatarHovered ? 'rgba(245, 230, 210, 0.6)' : 'rgba(232, 228, 220, 0.5)',
          transition: 'all 0.5s ease',
          transformOrigin: 'bottom right',
        }}
        aria-label={`${mascotConfig.displayName} — click for X-Ray Goggles`}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        {/* Monocle glyph for the mascot. Visible on mobile at rest,
            hides on hover/tap to reveal the full avatar. Desktop hides via CSS. B080. */}
        <span className="mascot-monogram" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={isBuilderModeActive ? '#67e8f9' : '#334155'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '72%', height: '72%' }}
          >
            {/* Monocle lens */}
            <circle cx="9" cy="9" r="6" />
            {/* Chain — curves down-right from the lens */}
            <path d="M14 13 Q19 16 17 22" />
          </svg>
        </span>
        {/* LRH portrait — 3 states: default (pink), hover (thermal colors), X-ray ON (thermal + goggles). B084. */}
        <img
          src={mascotImage}
          alt={mascotAlt}
          className="w-full h-full object-cover transition-all duration-500"
          style={{
            filter: isBuilderModeActive
              ? 'drop-shadow(0 0 3px rgba(34,211,238,0.9)) drop-shadow(0 0 6px rgba(34,211,238,0.6)) drop-shadow(0 0 12px rgba(34,211,238,0.3))'
              : undefined,
            opacity: isBuilderModeActive ? 1 : isAvatarHovered ? 0.95 : 0.7,
          }}
        />

        {/* Cyan glow overlay on glasses when active */}
        {isBuilderModeActive && (
          <>
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
            {/* Active-state shimmer — 4× frequency, cyan-tinted rising band */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                borderRadius: '50%',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '48.3%',
                  bottom: '-48.3%',
                  background:
                    'linear-gradient(to top, transparent 0%, rgba(34,211,238,0.18) 25%, rgba(34,211,238,0.5) 50%, rgba(34,211,238,0.18) 75%, transparent 100%)',
                  animation: 'mascotShimmerUpActive 6s ease-in-out infinite',
                  mixBlendMode: 'screen',
                }}
              />
              {/* X-Ray ON Mana reveal (cyan) */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '60%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '6.4px',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: 'rgba(180,240,255,0.95)',
                  textShadow:
                    '0 0 3px rgba(0,0,0,0.85), 0 0 6px rgba(34,211,238,0.7), 0 1px 2px rgba(0,0,0,0.7)',
                  opacity: 0,
                  animation: 'mascotManaReveal 6s ease-in-out infinite',
                  mixBlendMode: 'screen',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {mascotConfig.manaText}
              </div>
              {/* X-Ray ON Suppressed reveal (cyan) */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '72%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '6.4px',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'rgba(180,240,255,0.92)',
                  textShadow:
                    '0 0 3px rgba(0,0,0,0.85), 0 0 6px rgba(34,211,238,0.65), 0 1px 2px rgba(0,0,0,0.7)',
                  opacity: 0,
                  animation: 'mascotSuppressedReveal 6s ease-in-out infinite',
                  mixBlendMode: 'screen',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Suppressed
              </div>
              {/* X-Ray ON percentage reveal */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '89%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '7.36px',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'rgba(180,240,255,0.95)',
                  textShadow:
                    '0 0 3px rgba(0,0,0,0.85), 0 0 6px rgba(34,211,238,0.7), 0 1px 2px rgba(0,0,0,0.7)',
                  opacity: 0,
                  animation: 'mascotPercentRevealActive 6s ease-in-out infinite',
                  mixBlendMode: 'screen',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {mascotConfig.suppressedPercent}
              </div>
            </div>
          </>
        )}

        {/* Full-image bottom→top shimmer when NOT in X-Ray mode.
            Reveals "Mana" text (hard-to-read, shimmery) when passing beard zone. B080. */}
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
            {/* Rising shimmer band */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '42%',
                bottom: '-42%',
                background:
                  'linear-gradient(to top, transparent 0%, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.12) 75%, transparent 100%)',
                animation: 'mascotShimmerUp 24s ease-in-out infinite',
                mixBlendMode: 'screen',
              }}
            />
            {/* B088: Mana/Suppressed/Percent labels hidden in default mode — only visible in X-Ray */}
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

      {/* Hover explanation panel — appears on hover, describes X-Ray Goggles */}
      {!isMenuOpen && !beaconPanelOpen && (
        <div
          className="absolute bottom-full right-0 mb-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ width: 'max-content', maxWidth: '280px' }}
        >
          <div
            className="relative px-4 py-3 rounded-xl text-xs leading-relaxed"
            style={{
              background: 'rgba(15, 23, 42, 0.97)',
              border: '1.5px solid rgba(34, 211, 238, 0.45)',
              color: '#e2e8f0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Glasses className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-cyan-300 text-[13px]">
                {isBuilderModeActive ? 'X-Ray Goggles Active' : 'X-Ray Goggles'}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-snug mb-1.5">
              The Little Red Hen sees through everything. Every element outlined in{' '}
              <span className="text-cyan-400">cyan</span> has an explanation waiting.
            </p>
            <p className="text-slate-400 text-[10px] leading-snug">
              <span className="text-cyan-400">Click the hen</span> to{' '}
              {isBuilderModeActive ? 'take off' : 'put on'} her X-Ray Goggles.
            </p>
            {/* Tail */}
            <div
              className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45"
              style={{
                background: 'rgba(15, 23, 42, 0.97)',
                borderRight: '1.5px solid rgba(34, 211, 238, 0.45)',
                borderBottom: '1.5px solid rgba(34, 211, 238, 0.45)',
              }}
            />
          </div>
        </div>
      )}

      {/* Beacon Panel — slides in from right when open */}
      {beaconPanelOpen && (
        <div
          className="fixed bottom-24 right-6 w-80 max-h-[60vh] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          style={{ animation: 'mascotSlideIn 200ms ease-out' }}
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
                <MapPin className="w-10 h-10 mx-auto mb-3 text-amber-500/40" />
                <p className="text-sm font-medium text-slate-300">No beacons dropped yet</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[220px] mx-auto">
                  As you explore, look for the <span className="text-amber-400">🔖 beacon icon</span> on any section.
                  Tap it to drop a beacon — like a bookmark you can always come back to.
                </p>
                <p className="text-[10px] text-slate-500 mt-3">
                  Beacons are color-coded: 🟢 green (interesting), 🟡 gold (important), 🔴 red (urgent), 🔵 blue (revisit later)
                </p>
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

      <style>{`
        /* Mascot monocle — hidden on desktop, shown on mobile at rest */
        .mascot-monogram {
          display: none;
          position: absolute;
          inset: 0;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          z-index: 5;
          pointer-events: none;
          user-select: none;
        }
        /* Mobile: mascot parks at 25% size, expands on tap/hover/focus
           and swaps the monocle for the full avatar. */
        @media (max-width: 767px) {
          .mascot-avatar {
            width: 16px !important;
            height: 16px !important;
            border-width: 1px !important;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                        border-width 0.2s ease !important;
            animation: mascotMobilePulse 8s ease-in-out infinite;
          }
          /* Invisible 44x44 touch target per WCAG 2.5.5 */
          .mascot-avatar::before {
            content: '';
            position: absolute;
            inset: -14px;
            border-radius: 50%;
            pointer-events: auto;
          }
          .mascot-monogram {
            display: flex;
          }
          .mascot-avatar:hover,
          .mascot-avatar:focus,
          .mascot-avatar:active,
          .mascot-avatar:focus-within {
            transform: scale(4) !important;
            border-width: 2px !important;
            animation: none !important;
          }
          .group:hover .mascot-avatar,
          .group:focus-within .mascot-avatar {
            transform: scale(4) !important;
            border-width: 2px !important;
            animation: none !important;
          }
          .mascot-avatar:hover .mascot-monogram,
          .mascot-avatar:active .mascot-monogram,
          .mascot-avatar:focus-within .mascot-monogram,
          .group:hover .mascot-monogram,
          .group:focus-within .mascot-monogram {
            display: none;
          }
        }
        @keyframes mascotMobilePulse {
          0%, 92%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
          94% { box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.35), 0 4px 20px rgba(0,0,0,0.3); }
          97% { box-shadow: 0 0 0 6px rgba(34, 211, 238, 0), 0 4px 20px rgba(0,0,0,0.3); }
        }
        @keyframes mascotSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mascotShimmerUp {
          0% { bottom: -42%; opacity: 0; }
          2% { opacity: 1; }
          23% { opacity: 1; }
          25%, 100% { bottom: 100%; opacity: 0; }
        }
        @keyframes mascotShimmerUpActive {
          0% { bottom: -48.3%; opacity: 0; }
          2.5% { opacity: 1; }
          22.5% { opacity: 1; }
          25%, 100% { bottom: 100%; opacity: 0; }
        }
        @keyframes mascotPercentRevealActive {
          0%, 7.5% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          10.5% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
          14%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes mascotManaReveal {
          0%, 5.5% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          8% { opacity: 0.72; transform: translate(-50%, -50%) scale(1); }
          11.5%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes mascotSuppressedReveal {
          0%, 6.5% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          9% { opacity: 0.65; transform: translate(-50%, -50%) scale(1); }
          12.5%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes mascotPercentReveal {
          0%, 7.5% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          10% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          13.5%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

