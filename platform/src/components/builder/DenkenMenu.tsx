/**
 * DenkenMenu — Unified floating Denken avatar with hover submenu
 * ================================================================
 * Merges BuilderModeToggle (X-Ray Goggles) and CrowsNestFloat into
 * a single 56px avatar button at bottom-right. Hover fans out a
 * vertical pill menu above the button with staggered animation.
 *
 * Hidden on landing page ("/") and full Crow's Nest page ("/crows-nest").
 */

import React, { useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBuilderMode } from './BuilderModeContext';
import { useCrowsNest } from '@/contexts/CrowsNestContext';
import { Telescope, Glasses, Sprout, Building2, Compass, Zap } from 'lucide-react';

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
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        {/* Queue badge when Crow's Nest has items */}
        {queue.length > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center
                       text-[10px] font-bold text-white bg-red-500 rounded-full
                       min-w-[18px] h-[18px] px-1 leading-none shadow-md"
          >
            {queue.length}
          </span>
        )}
      </button>

      {/* Per-lens shimmer keyframes — left fires slightly before right for realism */}
      <style>{`
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
