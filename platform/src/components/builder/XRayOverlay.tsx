/**
 * XRayOverlay — X-Ray Goggles visual system
 * ==========================================
 * When builder mode is active:
 * 1. Scans DOM for data-xray-id elements → cyan dashed outlines + label badges
 * 2. Clicking a badge opens a DRAGGABLE side panel connected by a line (SQL Server style)
 * 3. Each panel has: what it is, how it connects, why it exists
 * 4. Clear feedback tool: quick suggestion input + full Lark submission
 * 5. Panels can be repositioned by dragging their title bar
 *
 * Just add data-xray-id="my-component" to any element — no wrapping needed.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBuilderMode } from './BuilderModeContext';
import { Hammer, MessageSquare, X, Glasses, ExternalLink, Link2, Send, FileQuestion, Download, Wrench, Hash, GripHorizontal, Lightbulb, Paintbrush, Palette, AlertTriangle, FileText, Eye, Coins, Flame, Target } from 'lucide-react';
import { getXRayExplanation } from '@/data/xrayGlossary';
import { ElbowGreaseBadge } from '@/components/effort/ElbowGreaseBadge';
import { FeedbackCategoryDropdown } from './FeedbackCategoryDropdown';
import { XRayBountyFlip } from './XRayBountyFlip';
import { OverlayTrigger } from '@/components/xray/OverlayTrigger';
import { OverlayEditor } from '@/components/xray/OverlayEditor';
import { useElementOverlays } from '@/hooks/useDesignDemocracy';
import { useErrorReports, useDailyTracker } from '@/hooks/useXRayBountyArena';
import { triggerCoinFlip } from '@/components/xray/CoinFlipAnimation';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface XRayTarget {
  id: string;
  rect: DOMRect;
  element: HTMLElement;
}

interface OverlayTarget {
  ref: string;
  rect: DOMRect;
  element: HTMLElement;
}

interface PanelPosition {
  x: number;
  y: number;
}

/**
 * Thin wrapper: only mounts the heavy XRayOverlayInner when builder mode is active.
 * This prevents 1100+ lines of hooks from running (and potentially looping) when X-Ray is off.
 */
export const XRayOverlay: React.FC = () => {
  const { isBuilderModeActive } = useBuilderMode();
  if (!isBuilderModeActive) return null;
  return <XRayOverlayInner />;
};

const XRayOverlayInner: React.FC = () => {
  const { isBuilderModeActive, openLarkPanel } = useBuilderMode();
  const [targets, setTargets] = useState<XRayTarget[]>([]);
  const [overlayTargets, setOverlayTargets] = useState<OverlayTarget[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showExplainer, setShowExplainer] = useState(true);
  const [quickNote, setQuickNote] = useState('');
  const [panelPositions, setPanelPositions] = useState<Record<string, PanelPosition>>({});
  const [feedbackCategory, setFeedbackCategory] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [designModeActive, setDesignModeActive] = useState(false);
  const [activeOverlayEditor, setActiveOverlayEditor] = useState<string | null>(null);
  const scanRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const location = useLocation();
  const { data: existingOverlays = [] } = useElementOverlays(location.pathname);

  const overlayRefSet = new Set(existingOverlays.map((o) => o.element_ref));

  const { user } = useAuth();
  const { reportError } = useErrorReports(location.pathname);
  const { dailyStats, incrementStat } = useDailyTracker();
  const stats = dailyStats.data;
  const [trackerExpanded, setTrackerExpanded] = useState(false);
  const [reportingElement, setReportingElement] = useState<string | null>(null);

  // Reset state when toggled on + apply dark mode inversion
  useEffect(() => {
    if (isBuilderModeActive) {
      setShowExplainer(true);
      setExpandedIds(new Set());
      setQuickNote('');
      setFeedbackCategory(null);
      setPanelPositions({});
      setDesignModeActive(false);
      setActiveOverlayEditor(null);
      // X-ray dark mode: invert the page to chalk-on-blackboard
      document.documentElement.classList.add('xray-dark-mode');
    } else {
      document.documentElement.classList.remove('xray-dark-mode');
    }
    return () => {
      document.documentElement.classList.remove('xray-dark-mode');
    };
  }, [isBuilderModeActive]);

  const scanDOM = useCallback(() => {
    if (!isBuilderModeActive) {
      setTargets([]);
      setOverlayTargets([]);
      return;
    }

    const elements = document.querySelectorAll<HTMLElement>('[data-xray-id]');
    const visible: XRayTarget[] = [];

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth
      ) {
        visible.push({
          id: el.getAttribute('data-xray-id') || 'unknown',
          rect,
          element: el,
        });
      }
    });

    setTargets(visible);

    if (designModeActive) {
      const overlayEls = document.querySelectorAll<HTMLElement>('[data-overlay-id]');
      const visibleOverlays: OverlayTarget[] = [];
      overlayEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight) {
          visibleOverlays.push({
            ref: el.getAttribute('data-overlay-id') || 'unknown',
            rect,
            element: el,
          });
        }
      });
      setOverlayTargets(visibleOverlays);
    } else {
      setOverlayTargets([]);
    }
  }, [isBuilderModeActive, designModeActive]);

  useEffect(() => {
    if (!isBuilderModeActive) {
      setTargets([]);
      return;
    }

    scanDOM();

    const handleChange = () => {
      if (scanRef.current) cancelAnimationFrame(scanRef.current);
      scanRef.current = requestAnimationFrame(scanDOM);
    };

    window.addEventListener('scroll', handleChange, true);
    window.addEventListener('resize', handleChange);
    const interval = setInterval(scanDOM, 2000);

    return () => {
      window.removeEventListener('scroll', handleChange, true);
      window.removeEventListener('resize', handleChange);
      clearInterval(interval);
      if (scanRef.current) cancelAnimationFrame(scanRef.current);
    };
  }, [isBuilderModeActive, scanDOM]);

  // Drag handlers
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPanelPositions((prev) => ({
        ...prev,
        [dragging.id]: {
          x: e.clientX - dragging.offsetX,
          y: e.clientY - dragging.offsetY,
        },
      }));
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  if (!isBuilderModeActive) return null;

  const formatLabel = (id: string) =>
    id.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const handleToggleExpand = (id: string, targetRect: DOMRect) => {
    if (expandedIds.has(id)) {
      setExpandedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      setQuickNote('');
    } else {
      setExpandedIds(prev => new Set(prev).add(id));
      setQuickNote('');
      // Position panel to the RIGHT of the element, or LEFT if too close to right edge
      if (!panelPositions[id]) {
        const panelWidth = 340;
        const margin = 24;
        let x: number;
        let y: number;

        if (targetRect.right + panelWidth + margin < window.innerWidth) {
          // Place to the right
          x = targetRect.right + margin;
        } else if (targetRect.left - panelWidth - margin > 0) {
          // Place to the left
          x = targetRect.left - panelWidth - margin;
        } else {
          // Fallback: center-ish
          x = Math.max(8, (window.innerWidth - panelWidth) / 2);
        }

        y = Math.max(8, Math.min(targetRect.top, window.innerHeight - 400));

        setPanelPositions((prev) => ({ ...prev, [id]: { x, y } }));
      }
    }
  };

  const handleStartDrag = (id: string, e: React.MouseEvent) => {
    const pos = panelPositions[id];
    if (!pos) return;
    e.preventDefault();
    setDragging({
      id,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    });
  };

  const handleQuickSubmit = (id: string) => {
    if (quickNote.trim()) {
      openLarkPanel(id);
      setQuickNote('');
      setExpandedIds(new Set());
    }
  };

  // Get connector line endpoints for the expanded panel
  const getConnectorPoints = (target: XRayTarget) => {
    const pos = panelPositions[target.id];
    if (!pos) return null;

    // Badge is at top-right of the element
    const badgeX = Math.min(window.innerWidth - 200, target.rect.right - 180);
    const badgeY = Math.max(4, target.rect.top - 14);

    // Panel center-left or center-right edge
    const panelWidth = 340;
    const panelX = pos.x;
    const panelY = pos.y + 20; // top of panel + some offset

    // Connect from the badge to the nearest panel edge
    let startX = badgeX + 90; // center of badge
    let startY = badgeY + 10;
    let endX: number;
    let endY: number;

    if (panelX > startX) {
      // Panel is to the right
      endX = panelX;
      endY = panelY + 16;
    } else {
      // Panel is to the left
      endX = panelX + panelWidth;
      endY = panelY + 16;
    }

    return { startX, startY, endX, endY };
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ isolation: 'isolate' }}
    >
      {/* ── SVG layer for connector lines ── */}
      <svg
        ref={svgRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <defs>
          <marker
            id="xray-arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="rgba(34, 211, 238, 0.6)" />
          </marker>
        </defs>
        {expandedIds.size > 0 && targets.map((target) => {
          if (!expandedIds.has(target.id)) return null;
          const pts = getConnectorPoints(target);
          if (!pts) return null;

          // Bezier curve for smooth connector
          const midX = (pts.startX + pts.endX) / 2;
          return (
            <path
              key={`connector-${target.id}`}
              d={`M ${pts.startX} ${pts.startY} C ${midX} ${pts.startY}, ${midX} ${pts.endY}, ${pts.endX} ${pts.endY}`}
              stroke="rgba(34, 211, 238, 0.5)"
              strokeWidth="2"
              strokeDasharray="6 3"
              fill="none"
              markerEnd="url(#xray-arrowhead)"
            />
          );
        })}
      </svg>

      {/* ── Explainer card ── */}
      {showExplainer && (
        <div
          className="pointer-events-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10002]"
          style={{ maxWidth: '420px', width: '90vw' }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.97)',
              border: '1px solid rgba(34, 211, 238, 0.5)',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              boxShadow: '0 0 30px rgba(34, 211, 238, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Flip card: front = LRH intro, back = explanation */}
            {(() => {
              const [flipped, setFlipped] = React.useState(false);
              return (
                <div style={{ perspective: '800px' }}>
                  <div style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s ease',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
                  }}>
                    {/* FRONT — LRH intro */}
                    <div style={{ backfaceVisibility: 'hidden' }}>
                      <div className="flex justify-center mb-3">
                        <img
                          src="/images/mascot-lrh-xray-on.png"
                          alt="The Little Red Hen"
                          className="w-16 h-16 rounded-full border-2 border-cyan-400/50"
                          style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.4))' }}
                        />
                      </div>
                      <h3 className="text-cyan-300 font-bold text-sm mb-1 text-center">The Little Red Hen sees everything with her X-Ray Goggles.</h3>
                      <p className="text-slate-300 text-xs leading-relaxed mb-2 text-center">
                        Every element outlined in <span className="text-cyan-400">chalk</span> has an explanation.
                        Click any badge and she'll tell you what it does.
                      </p>
                      <p className="text-slate-500 text-[10px] text-center mb-3">
                        {targets.length} element{targets.length !== 1 ? 's' : ''} on this page
                      </p>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setShowExplainer(false);
                            // Auto-open the first element's panel
                            if (targets.length > 0) {
                              const first = targets[0];
                              setExpandedIds(new Set([first.id]));
                              if (!panelPositions[first.id]) {
                                const panelWidth = 340;
                                const margin = 24;
                                const x = first.rect.right + margin + panelWidth < window.innerWidth
                                  ? first.rect.right + margin
                                  : Math.max(8, first.rect.left - panelWidth - margin);
                                const y = Math.max(8, Math.min(first.rect.top, window.innerHeight - 400));
                                setPanelPositions(prev => ({ ...prev, [first.id]: { x, y } }));
                              }
                            }
                          }}
                          className="px-5 py-2 rounded-lg font-semibold text-xs uppercase tracking-wide transition-all hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(34,211,238,0.15))',
                            border: '1px solid rgba(34,211,238,0.5)',
                            color: '#67e8f9',
                            cursor: 'pointer',
                          }}
                        >
                          Ok, show me
                        </button>
                        <button
                          onClick={() => setFlipped(true)}
                          className="px-4 py-2 rounded-lg font-semibold text-xs transition-all hover:scale-105"
                          style={{
                            background: 'rgba(34,211,238,0.08)',
                            border: '1px solid rgba(34,211,238,0.25)',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          Find out more
                        </button>
                      </div>
                    </div>
                    {/* BACK — explanation (click anywhere to flip back) */}
                    <div
                      onClick={() => setFlipped(false)}
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        position: 'absolute',
                        inset: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '0.5rem',
                      }}
                    >
                      <h3 className="text-cyan-300 font-bold text-sm mb-2 text-center">How X-Ray Goggles Work</h3>
                      <p className="text-slate-300 text-xs leading-relaxed mb-2">
                        Every page on the platform is annotated. The Little Red Hen reads each element and explains
                        what it does, why it exists, and how it connects to the rest of the system.
                      </p>
                      <p className="text-slate-300 text-xs leading-relaxed mb-2">
                        This is how we <span className="text-cyan-400">get feedback</span>,{' '}
                        <span className="text-amber-400">improve the platform</span>, and{' '}
                        <span className="text-emerald-400">explain everything</span> — all at the same time.
                        You can report errors, propose fixes, and earn Marks for helping.
                      </p>
                      <p className="text-slate-500 text-[10px] text-center mt-2">
                        Tap anywhere on this card to flip back and try it out.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Element outlines + badge pills ── */}
      {targets.map((target) => {
        const isHovered = hoveredId === target.id;
        const isExpanded = expandedIds.has(target.id);

        return (
          <React.Fragment key={target.id}>
            {/* Outline */}
            <div
              style={{
                position: 'fixed',
                top: target.rect.top - 2,
                left: target.rect.left - 2,
                width: target.rect.width + 4,
                height: target.rect.height + 4,
                border: isHovered || isExpanded
                  ? '2px solid rgba(34, 211, 238, 0.8)'
                  : '2px dashed rgba(34, 211, 238, 0.35)',
                background: isHovered || isExpanded
                  ? 'rgba(34, 211, 238, 0.08)'
                  : 'transparent',
                borderRadius: '0.375rem',
                transition: 'all 0.2s ease',
                pointerEvents: 'none',
              }}
            />

            {/* Label badge — top-right of element */}
            <div
              className="pointer-events-auto"
              style={{
                position: 'fixed',
                top: Math.max(4, target.rect.top - 14),
                left: Math.min(
                  window.innerWidth - 200,
                  target.rect.right - 180
                ),
                zIndex: isExpanded ? 10002 : isHovered ? 10001 : 10000,
              }}
              onMouseEnter={() => setHoveredId(target.id)}
              onMouseLeave={() => { if (!isExpanded) setHoveredId(null); }}
            >
              {/* Badge pill — click to toggle side panel */}
              <div
                className="flex items-center gap-1.5 transition-all duration-200"
                style={{
                  background: isHovered || isExpanded
                    ? 'rgba(15, 23, 42, 0.98)'
                    : 'rgba(15, 23, 42, 0.85)',
                  border: isHovered || isExpanded
                    ? '1px solid rgba(34, 211, 238, 0.8)'
                    : '1px solid rgba(34, 211, 238, 0.4)',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.625rem',
                  boxShadow: isHovered || isExpanded
                    ? '0 0 20px rgba(34, 211, 238, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => handleToggleExpand(target.id, target.rect)}
              >
                {getXRayExplanation(target.id) ? (
                  <Glasses className="w-3 h-3 text-cyan-400 flex-shrink-0" strokeWidth={2} />
                ) : (
                  <Hammer className="w-3 h-3 text-cyan-400 flex-shrink-0" strokeWidth={2} />
                )}
                <span
                  className="text-cyan-300 font-medium"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.02em' }}
                >
                  {formatLabel(target.id)}
                </span>
                <MessageSquare
                  className="w-3 h-3 text-cyan-500/60 flex-shrink-0"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* ── Draggable side panels (rendered separately, not inside badge) ── */}
      {expandedIds.size > 0 && targets.map((target) => {
        if (!expandedIds.has(target.id)) return null;
        const glossary = getXRayExplanation(target.id);
        const pos = panelPositions[target.id];
        if (!pos) return null;

        return (
          <div
            key={`panel-${target.id}`}
            className="pointer-events-auto"
            style={{
              position: 'fixed',
              top: pos.y,
              left: pos.x,
              width: '340px',
              zIndex: 10003,
              userSelect: dragging ? 'none' : 'auto',
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.98)',
                border: '1px solid rgba(34, 211, 238, 0.6)',
                borderRadius: '0.75rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 211, 238, 0.15)',
                overflow: 'hidden',
              }}
            >
              {/* ── Draggable title bar ── */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(34, 211, 238, 0.1)',
                  borderBottom: '1px solid rgba(34, 211, 238, 0.2)',
                  cursor: 'grab',
                }}
                onMouseDown={(e) => handleStartDrag(target.id, e)}
              >
                <GripHorizontal className="w-4 h-4 text-cyan-500/50 flex-shrink-0" />
                <img
                  src="/images/mascot-lrh-xray-on.png"
                  alt="LRH"
                  style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid rgba(34,211,238,0.4)', flexShrink: 0 }}
                />
                <span
                  className="text-cyan-300 font-semibold flex-1"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.02em' }}
                >
                  {formatLabel(target.id)}
                </span>
                <button
                  onClick={() => { setExpandedIds(prev => { const next = new Set(prev); next.delete(target.id); return next; }); setQuickNote(''); }}
                  className="text-slate-500 hover:text-cyan-400 transition-colors flex-shrink-0"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Panel body ── */}
              <div style={{ padding: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
                {glossary ? (
                  <div className="space-y-2.5">
                    {/* What it is */}
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {glossary.explanation}
                    </p>

                    {/* How it connects */}
                    {glossary.connectedTo && (
                      <div
                        style={{
                          background: 'rgba(34, 211, 238, 0.06)',
                          border: '1px solid rgba(34, 211, 238, 0.15)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Link2 className="w-3 h-3 text-cyan-400" strokeWidth={2} />
                          <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                            Connects to
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {glossary.connectedTo}
                        </p>
                      </div>
                    )}

                    {/* Why it exists */}
                    {glossary.why && (
                      <div
                        style={{
                          background: 'rgba(168, 85, 247, 0.06)',
                          border: '1px solid rgba(168, 85, 247, 0.15)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                            Why?
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed italic">
                          {glossary.why}
                        </p>
                      </div>
                    )}

                    {/* Learn more link */}
                    {glossary.learnMoreUrl && (
                      <a
                        href={glossary.learnMoreUrl}
                        className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                        style={{ fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none' }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        {glossary.learnMoreLabel || 'Learn more'}
                      </a>
                    )}

                    {/* Extended links: FAQ, Download, Piggyback, Innovation */}
                    {(glossary.faqAnchorId || glossary.downloadUrl || glossary.piggybackUrl || glossary.innovationNumber) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {glossary.faqAnchorId && (
                          <a
                            href={`/faq#${glossary.faqAnchorId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
                            style={{ fontSize: '0.65rem', fontWeight: 500, textDecoration: 'none' }}
                          >
                            <FileQuestion className="w-3 h-3" />
                            FAQ
                          </a>
                        )}
                        {glossary.downloadUrl && (
                          <a
                            href={glossary.downloadUrl}
                            className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                            style={{ fontSize: '0.65rem', fontWeight: 500, textDecoration: 'none' }}
                          >
                            <Download className="w-3 h-3" />
                            STL
                          </a>
                        )}
                        {glossary.piggybackUrl && (
                          <a
                            href={glossary.piggybackUrl}
                            className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
                            style={{ fontSize: '0.65rem', fontWeight: 500, textDecoration: 'none' }}
                          >
                            <Wrench className="w-3 h-3" />
                            Improve
                          </a>
                        )}
                        {glossary.innovationNumber && (
                          <span
                            className="flex items-center gap-1 text-purple-400"
                            style={{ fontSize: '0.65rem', fontWeight: 500 }}
                          >
                            <Hash className="w-3 h-3" />
                            {glossary.innovationNumber}
                          </span>
                        )}
                      </div>
                    )}

                    {/* ── Elbow Grease effort badge ── */}
                    {glossary.elbowGreaseLevel && (
                      <div
                        style={{
                          background: 'rgba(251, 191, 36, 0.06)',
                          border: '1px solid rgba(251, 191, 36, 0.15)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                            Effort Level
                          </span>
                        </div>
                        <ElbowGreaseBadge level={glossary.elbowGreaseLevel} size="md" showLabel />
                      </div>
                    )}

                    {/* ── Bounty Arena Actions ── */}
                    {user && (
                      <div
                        style={{
                          borderTop: '1px solid rgba(245, 158, 11, 0.3)',
                          marginTop: '0.5rem',
                          paddingTop: '0.5rem',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Target className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                          <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                            Bounty Arena
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={(e) => {
                              reportError.mutate(
                                { pageUrl: location.pathname, elementSelector: target.id, errorType: 'visual' },
                                {
                                  onSuccess: () => {
                                    incrementStat.mutate('errors_found');
                                    triggerCoinFlip(e.clientX, e.clientY, 1);
                                  },
                                },
                              );
                            }}
                            disabled={reportError.isPending}
                            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                            style={{
                              fontSize: '0.6rem', fontWeight: 600,
                              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '0.375rem', padding: '0.3rem 0.5rem', cursor: 'pointer',
                            }}
                          >
                            <AlertTriangle className="w-3 h-3" /> Report Error
                          </button>
                          <button
                            onClick={() => setReportingElement(target.id)}
                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                            style={{
                              fontSize: '0.6rem', fontWeight: 600,
                              background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)',
                              borderRadius: '0.375rem', padding: '0.3rem 0.5rem', cursor: 'pointer',
                            }}
                          >
                            <FileText className="w-3 h-3" /> Document This
                          </button>
                          <button
                            onClick={() => openLarkPanel(target.id)}
                            className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                            style={{
                              fontSize: '0.6rem', fontWeight: 600,
                              background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)',
                              borderRadius: '0.375rem', padding: '0.3rem 0.5rem', cursor: 'pointer',
                            }}
                          >
                            <Wrench className="w-3 h-3" /> Propose Fix
                          </button>
                          <a
                            href={`/dashboard/bounty-arena?element=${encodeURIComponent(target.id)}`}
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                            style={{
                              fontSize: '0.6rem', fontWeight: 600,
                              background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.25)',
                              borderRadius: '0.375rem', padding: '0.3rem 0.5rem', cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            <Eye className="w-3 h-3" /> View Reports
                          </a>
                        </div>
                      </div>
                    )}

                    {/* ── Feedback section — clearly labeled ── */}
                    <div
                      style={{
                        borderTop: '1px solid rgba(34, 211, 238, 0.2)',
                        marginTop: '0.5rem',
                        paddingTop: '0.5rem',
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                          Share Feedback
                        </span>
                        <span className="text-slate-600 text-[9px]">
                          — earn Credits + Marks for accepted ideas
                        </span>
                      </div>

                      {/* Category dropdown — select before typing */}
                      <FeedbackCategoryDropdown
                        selectedCategory={feedbackCategory}
                        onSelect={setFeedbackCategory}
                      />

                      {/* Quick suggestion input — only shows after category selected */}
                      {feedbackCategory && (
                        <div className="flex gap-1.5 mb-1.5">
                          <input
                            type="text"
                            value={quickNote}
                            onChange={(e) => setQuickNote(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleQuickSubmit(target.id); }}
                            placeholder={`Describe the ${feedbackCategory.replace(/_/g, ' ')}...`}
                            className="flex-1 text-xs text-slate-200 placeholder-slate-600"
                            style={{
                              background: 'rgba(30, 41, 59, 0.8)',
                              border: '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '0.375rem',
                              padding: '0.375rem 0.5rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => handleQuickSubmit(target.id)}
                            disabled={!quickNote.trim()}
                            className="flex-shrink-0"
                            title="Send quick suggestion"
                            style={{
                              background: quickNote.trim() ? 'rgba(34, 211, 238, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                              border: `1px solid ${quickNote.trim() ? 'rgba(34, 211, 238, 0.5)' : 'rgba(100, 116, 139, 0.2)'}`,
                              borderRadius: '0.375rem',
                              padding: '0.375rem',
                              cursor: quickNote.trim() ? 'pointer' : 'default',
                            }}
                          >
                            <Send className={`w-3 h-3 ${quickNote.trim() ? 'text-cyan-400' : 'text-slate-600'}`} />
                          </button>
                        </div>
                      )}

                      {/* "You can do better!" bounty flip */}
                      <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        <XRayBountyFlip xrayId={target.id} onOpenLark={openLarkPanel} />
                      </div>

                      {/* Full Lark submission link */}
                      <button
                        onClick={() => openLarkPanel(target.id)}
                        className="flex items-center gap-1.5 text-cyan-500 hover:text-cyan-300 transition-colors w-full"
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          background: 'rgba(34, 211, 238, 0.05)',
                          border: '1px solid rgba(34, 211, 238, 0.15)',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'left',
                        }}
                      >
                        <Hammer className="w-3 h-3" />
                        Submit detailed Lark with files & screenshots
                      </button>
                    </div>
                  </div>
                ) : (
                  /* No glossary entry — show basic card + suggestion */
                  <div className="space-y-2.5">
                    <p className="text-slate-400 text-xs italic">
                      No explanation yet for this component. Want to help write one?
                    </p>

                    {/* ── Bounty Arena Actions (no-glossary) ── */}
                    {user && (
                      <div
                        style={{
                          borderTop: '1px solid rgba(245, 158, 11, 0.3)',
                          paddingTop: '0.5rem',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Target className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                          <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                            Bounty Arena
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={(e) => {
                              reportError.mutate(
                                { pageUrl: location.pathname, elementSelector: target.id, errorType: 'visual' },
                                {
                                  onSuccess: () => {
                                    incrementStat.mutate('errors_found');
                                    triggerCoinFlip(e.clientX, e.clientY, 1);
                                  },
                                },
                              );
                            }}
                            disabled={reportError.isPending}
                            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                            style={{
                              fontSize: '0.6rem', fontWeight: 600,
                              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '0.375rem', padding: '0.3rem 0.5rem', cursor: 'pointer',
                            }}
                          >
                            <AlertTriangle className="w-3 h-3" /> Report Error
                          </button>
                          <button
                            onClick={() => openLarkPanel(target.id)}
                            className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                            style={{
                              fontSize: '0.6rem', fontWeight: 600,
                              background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)',
                              borderRadius: '0.375rem', padding: '0.3rem 0.5rem', cursor: 'pointer',
                            }}
                          >
                            <Wrench className="w-3 h-3" /> Propose Fix
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Feedback section ── */}
                    <div
                      style={{
                        borderTop: '1px solid rgba(34, 211, 238, 0.2)',
                        paddingTop: '0.5rem',
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                          Share Feedback
                        </span>
                      </div>

                      {/* Category dropdown */}
                      <FeedbackCategoryDropdown
                        selectedCategory={feedbackCategory}
                        onSelect={setFeedbackCategory}
                      />

                      {feedbackCategory && (
                        <div className="flex gap-1.5 mb-1.5">
                          <input
                            type="text"
                            value={quickNote}
                            onChange={(e) => setQuickNote(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleQuickSubmit(target.id); }}
                            placeholder="Suggest an explanation..."
                            className="flex-1 text-xs text-slate-200 placeholder-slate-600"
                            style={{
                              background: 'rgba(30, 41, 59, 0.8)',
                              border: '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '0.375rem',
                              padding: '0.375rem 0.5rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => handleQuickSubmit(target.id)}
                            disabled={!quickNote.trim()}
                            className="flex-shrink-0"
                            title="Send quick suggestion"
                            style={{
                              background: quickNote.trim() ? 'rgba(34, 211, 238, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                              border: `1px solid ${quickNote.trim() ? 'rgba(34, 211, 238, 0.5)' : 'rgba(100, 116, 139, 0.2)'}`,
                              borderRadius: '0.375rem',
                              padding: '0.375rem',
                              cursor: quickNote.trim() ? 'pointer' : 'default',
                            }}
                          >
                            <Send className={`w-3 h-3 ${quickNote.trim() ? 'text-cyan-400' : 'text-slate-600'}`} />
                          </button>
                        </div>
                      )}

                      {/* "You can do better!" bounty flip */}
                      <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        <XRayBountyFlip xrayId={target.id} onOpenLark={openLarkPanel} />
                      </div>

                      <button
                        onClick={() => openLarkPanel(target.id)}
                        className="flex items-center gap-1.5 text-cyan-500 hover:text-cyan-300 transition-colors w-full"
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          background: 'rgba(34, 211, 238, 0.05)',
                          border: '1px solid rgba(34, 211, 238, 0.15)',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          padding: '0.375rem 0.5rem',
                          textAlign: 'left',
                        }}
                      >
                        <Hammer className="w-3 h-3" />
                        Submit detailed Lark with files & screenshots
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Design Mode sub-toggle (bottom-left) ── */}
      {isBuilderModeActive && (
        <div
          className="pointer-events-auto fixed"
          style={{ bottom: 20, left: 20, zIndex: 10004, display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <button
            onClick={() => setDesignModeActive(!designModeActive)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              background: designModeActive
                ? 'rgba(245, 158, 11, 0.25)'
                : 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${designModeActive ? 'rgba(245, 158, 11, 0.6)' : 'rgba(34, 211, 238, 0.3)'}`,
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Paintbrush
              style={{ width: 14, height: 14, color: designModeActive ? '#fbbf24' : '#67e8f9' }}
            />
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: designModeActive ? '#fbbf24' : '#67e8f9',
              }}
            >
              Design Mode {designModeActive ? 'ON' : 'OFF'}
            </span>
          </button>

          {designModeActive && (
            <a
              href="/design/themes"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.35rem 0.6rem',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '9999px',
                color: '#c4b5fd',
                fontSize: '0.6rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Palette style={{ width: 12, height: 12 }} />
              Theme Gallery
            </a>
          )}
        </div>
      )}

      {/* ── Design Mode: OverlayTrigger badges on data-overlay-id elements ── */}
      {designModeActive && overlayTargets.map((ot) => (
        <OverlayTrigger
          key={`overlay-trigger-${ot.ref}`}
          elementRef={ot.ref}
          rect={ot.rect}
          hasOverlays={overlayRefSet.has(ot.ref)}
          onActivate={(ref) => setActiveOverlayEditor(ref)}
        />
      ))}

      {/* ── Design Mode: OverlayEditor for active element ── */}
      {designModeActive && activeOverlayEditor && (() => {
        const ot = overlayTargets.find((t) => t.ref === activeOverlayEditor);
        if (!ot) return null;
        return (
          <OverlayEditor
            elementRef={ot.ref}
            rect={ot.rect}
            onClose={() => setActiveOverlayEditor(null)}
          />
        );
      })()}

      {/* ── Design Mode: amber dashed outlines on overlay-id elements ── */}
      {designModeActive && overlayTargets.map((ot) => (
        <div
          key={`overlay-outline-${ot.ref}`}
          style={{
            position: 'fixed',
            top: ot.rect.top - 2,
            left: ot.rect.left - 2,
            width: ot.rect.width + 4,
            height: ot.rect.height + 4,
            border: '2px dashed rgba(245, 158, 11, 0.35)',
            borderRadius: '0.375rem',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Floating Daily Tracker (left of mascot) ── */}
      {user && (
        <div
          className="pointer-events-auto fixed"
          style={{ bottom: 24, right: 90, zIndex: 10004 }}
        >
          {trackerExpanded ? (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.97)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                minWidth: 200,
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24' }}>Daily Stats</span>
                <button
                  onClick={() => setTrackerExpanded(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Found</div>
                <div style={{ fontSize: '0.6rem', color: '#60a5fa', fontWeight: 700, textAlign: 'right' }}>{stats?.errors_found ?? 0}</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Documented</div>
                <div style={{ fontSize: '0.6rem', color: '#c084fc', fontWeight: 700, textAlign: 'right' }}>{stats?.errors_documented ?? 0}</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Fixes</div>
                <div style={{ fontSize: '0.6rem', color: '#4ade80', fontWeight: 700, textAlign: 'right' }}>{stats?.fixes_proposed ?? 0}</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Bounties</div>
                <div style={{ fontSize: '0.6rem', color: '#22d3ee', fontWeight: 700, textAlign: 'right' }}>{(stats?.bounties_created ?? 0) + (stats?.bounties_fulfilled ?? 0)}</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setTrackerExpanded(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Coins style={{ width: 14, height: 14, color: '#fbbf24' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fbbf24' }}>
                {stats?.marks_earned ?? 0}M today
              </span>
              <span style={{ fontSize: '0.65rem', color: '#fb923c', fontWeight: 600 }}>
                | <Flame style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} /> {stats?.streak_days ?? 0} days
              </span>
            </button>
          )}
        </div>
      )}

      {/* Click-away backdrop when a card is expanded */}
      {/* No click-away backdrop — multiple panels can be open simultaneously */}
    </div>,
    document.body
  );
};
