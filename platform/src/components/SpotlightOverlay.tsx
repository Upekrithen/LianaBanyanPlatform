/**
 * SPOTLIGHT OVERLAY — LRH-Guided Tour System (B088)
 * ==================================================
 * Replaces the center-blocking timer card with a tooltip-based
 * guided tour where the Little Red Hen mascot walks users through
 * page elements, pointing at each one with a speech bubble.
 *
 * User-paced: Back / Forward buttons, no auto-timer.
 * ESC or backdrop click exits the tour.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useBuilderMode } from '@/components/builder/BuilderModeContext';

export interface SpotlightStop {
  selector: string;
  fallbackPosition?: { x: number; y: number };
  title: string;
  description: string;
  route?: string;
  scrollTo?: boolean;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

interface SpotlightOverlayProps {
  stops: SpotlightStop[];
  tourName: string;
  onComplete: () => void;
  onExit: () => void;
  initialStopIndex?: number;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 12;
const TOOLTIP_WIDTH = 320;
const LRH_SIZE = 56;

function getTooltipPlacement(
  rect: TargetRect | null,
  preferred: SpotlightStop['tooltipPosition']
): 'top' | 'bottom' | 'left' | 'right' {
  if (!rect) return 'bottom';
  if (preferred && preferred !== 'auto') return preferred;

  const spaceBelow = window.innerHeight - (rect.top + rect.height);
  const spaceAbove = rect.top;
  const spaceRight = window.innerWidth - (rect.left + rect.width);
  const spaceLeft = rect.left;

  if (spaceBelow >= 200) return 'bottom';
  if (spaceAbove >= 200) return 'top';
  if (spaceRight >= TOOLTIP_WIDTH + 80) return 'right';
  if (spaceLeft >= TOOLTIP_WIDTH + 80) return 'left';
  return 'bottom';
}

function getTooltipStyle(
  rect: TargetRect | null,
  placement: 'top' | 'bottom' | 'left' | 'right'
): React.CSSProperties {
  if (!rect) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  switch (placement) {
    case 'bottom':
      return {
        top: rect.top + rect.height + PADDING + LRH_SIZE / 2 + 8,
        left: Math.max(16, Math.min(cx - TOOLTIP_WIDTH / 2, window.innerWidth - TOOLTIP_WIDTH - 16)),
        width: TOOLTIP_WIDTH,
      };
    case 'top':
      return {
        bottom: window.innerHeight - rect.top + PADDING + LRH_SIZE / 2 + 8,
        left: Math.max(16, Math.min(cx - TOOLTIP_WIDTH / 2, window.innerWidth - TOOLTIP_WIDTH - 16)),
        width: TOOLTIP_WIDTH,
      };
    case 'right':
      return {
        top: Math.max(16, cy - 60),
        left: rect.left + rect.width + PADDING + LRH_SIZE / 2 + 8,
        width: TOOLTIP_WIDTH,
      };
    case 'left':
      return {
        top: Math.max(16, cy - 60),
        right: window.innerWidth - rect.left + PADDING + LRH_SIZE / 2 + 8,
        width: TOOLTIP_WIDTH,
      };
  }
}

function getLRHPosition(
  rect: TargetRect | null,
  placement: 'top' | 'bottom' | 'left' | 'right'
): React.CSSProperties {
  if (!rect) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }
  const cx = rect.left + rect.width / 2;

  switch (placement) {
    case 'bottom':
      return {
        top: rect.top + rect.height + PADDING,
        left: cx - LRH_SIZE / 2,
      };
    case 'top':
      return {
        top: rect.top - PADDING - LRH_SIZE,
        left: cx - LRH_SIZE / 2,
      };
    case 'right':
      return {
        top: rect.top + rect.height / 2 - LRH_SIZE / 2,
        left: rect.left + rect.width + PADDING,
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2 - LRH_SIZE / 2,
        left: rect.left - PADDING - LRH_SIZE,
      };
  }
}

export function SpotlightOverlay({
  stops,
  tourName,
  onComplete,
  onExit,
  initialStopIndex = 0,
}: SpotlightOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(initialStopIndex);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const observerRef = useRef<MutationObserver | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  let mascotConfig: { defaultImage: string } = { defaultImage: '/mascots/mascot-lrh-default.png' };
  try {
    const bm = useBuilderMode();
    mascotConfig = bm.mascotConfig;
  } catch {
    // BuilderModeProvider may not be present
  }

  const currentStop = stops[currentIndex];

  const findAndMeasureTarget = useCallback(() => {
    if (!currentStop) return;
    const el = document.querySelector(currentStop.selector);
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      if (currentStop.scrollTo !== false) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        requestAnimationFrame(() => {
          const r2 = el.getBoundingClientRect();
          setTargetRect({ top: r2.top, left: r2.left, width: r2.width, height: r2.height });
        });
      }
      setIsTransitioning(false);
      setNavigating(false);
      return true;
    }
    if (currentStop.fallbackPosition) {
      setTargetRect({
        top: currentStop.fallbackPosition.y,
        left: currentStop.fallbackPosition.x,
        width: 100,
        height: 60,
      });
      setIsTransitioning(false);
      setNavigating(false);
      return true;
    }
    return false;
  }, [currentStop]);

  // Re-measure on scroll/resize
  useEffect(() => {
    const handleReposition = () => {
      if (currentStop) {
        const el = document.querySelector(currentStop.selector);
        if (el) {
          const r = el.getBoundingClientRect();
          setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      }
    };
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [currentStop]);

  // On stop change: navigate if needed, then find element
  useEffect(() => {
    if (!currentStop) return;
    setIsTransitioning(true);

    if (currentStop.route && location.pathname !== currentStop.route) {
      setNavigating(true);
      navigate(currentStop.route);
      return;
    }

    // Try to find element with retries (page may still be rendering)
    let attempts = 0;
    const tryFind = () => {
      if (findAndMeasureTarget()) {
        if (retryRef.current) clearTimeout(retryRef.current);
        return;
      }
      attempts++;
      if (attempts < 20) {
        retryRef.current = setTimeout(tryFind, 200);
      } else {
        // Give up — show tooltip in center
        setTargetRect(null);
        setIsTransitioning(false);
        setNavigating(false);
      }
    };
    tryFind();

    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [currentIndex, currentStop, location.pathname, navigate, findAndMeasureTarget]);

  // After navigation, wait for new page to render then find element
  useEffect(() => {
    if (!navigating || !currentStop) return;
    if (currentStop.route && location.pathname === currentStop.route) {
      let attempts = 0;
      const tryFind = () => {
        if (findAndMeasureTarget()) return;
        attempts++;
        if (attempts < 30) {
          retryRef.current = setTimeout(tryFind, 200);
        } else {
          setTargetRect(null);
          setIsTransitioning(false);
          setNavigating(false);
        }
      };
      setTimeout(tryFind, 300);
    }
  }, [navigating, location.pathname, currentStop, findAndMeasureTarget]);

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, []);

  // ESC to exit
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (e.key === 'ArrowRight') goForward();
      if (e.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, stops.length]);

  const goForward = useCallback(() => {
    if (currentIndex >= stops.length - 1) {
      onComplete();
      return;
    }
    setCurrentIndex(i => i + 1);
  }, [currentIndex, stops.length, onComplete]);

  const goBack = useCallback(() => {
    if (currentIndex <= 0) return;
    setCurrentIndex(i => i - 1);
  }, [currentIndex]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === stops.length - 1;
  const placement = getTooltipPlacement(targetRect, currentStop?.tooltipPosition);
  const tooltipStyle = getTooltipStyle(targetRect, placement);
  const lrhStyle = getLRHPosition(targetRect, placement);

  return (
    <div className="fixed inset-0 z-[10010]" role="dialog" aria-label={`${tourName} tour`}>
      {/* SVG backdrop with cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        onClick={onExit}
        style={{ cursor: 'pointer' }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - PADDING}
                y={targetRect.top - PADDING}
                width={targetRect.width + PADDING * 2}
                height={targetRect.height + PADDING * 2}
                rx="12"
                fill="black"
                style={{ transition: 'all 0.4s ease-out' }}
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#spotlight-mask)"
        />
        {/* Highlight border around target */}
        {targetRect && (
          <rect
            x={targetRect.left - PADDING}
            y={targetRect.top - PADDING}
            width={targetRect.width + PADDING * 2}
            height={targetRect.height + PADDING * 2}
            rx="12"
            fill="none"
            stroke="rgba(251,191,36,0.6)"
            strokeWidth="2"
            style={{ transition: 'all 0.4s ease-out' }}
          />
        )}
      </svg>

      {/* Stage curtain borders */}
      <div className="fixed top-0 left-0 bottom-0 w-10 pointer-events-none z-[10011]"
        style={{ background: 'linear-gradient(to right, rgba(139,0,0,0.25), transparent)' }} />
      <div className="fixed top-0 right-0 bottom-0 w-10 pointer-events-none z-[10011]"
        style={{ background: 'linear-gradient(to left, rgba(139,0,0,0.25), transparent)' }} />

      {/* LRH Avatar — moves between stops */}
      <div
        className="absolute z-[10012] rounded-full overflow-hidden border-2 border-amber-400 shadow-lg"
        style={{
          width: LRH_SIZE,
          height: LRH_SIZE,
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          opacity: isTransitioning ? 0.5 : 1,
          ...lrhStyle,
        }}
      >
        <img
          src={mascotConfig.defaultImage}
          alt="Little Red Hen — Tour Guide"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Speech Bubble Tooltip */}
      <div
        className="absolute z-[10013] bg-slate-900/97 border border-amber-500/50 rounded-xl shadow-2xl backdrop-blur-sm"
        style={{
          transition: 'all 0.4s ease-out',
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
          ...tooltipStyle,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with close */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-amber-400 text-[11px] font-semibold tracking-wide uppercase">
            {tourName}
          </span>
          <button
            onClick={onExit}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Exit tour"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-2">
          <h3 className="text-white font-semibold text-sm mb-1">
            {currentStop?.title}
          </h3>
          <p className="text-slate-300 text-[13px] leading-relaxed">
            {currentStop?.description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10">
          <span className="text-slate-500 text-[11px]">
            {currentIndex + 1} of {stops.length}
          </span>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={goBack}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                           text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={goForward}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium
                         bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors"
            >
              {isLast ? 'Finish Tour' : 'Forward'}
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 pb-2.5">
          {stops.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIndex
                  ? 'bg-amber-400'
                  : i < currentIndex
                    ? 'bg-amber-400/40'
                    : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
