/**
 * XRayPanel — Draggable annotation panel that appears when X-Ray Goggles are ON.
 * Each panel has: character slot, title, explanation, connecting SVG line to target.
 * Draggable by title bar. Collapsible. Cyan border in X-Ray mode.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useXRay } from "./XRayContext";
import { LRHCharacter } from "./LRHCharacter";
import { GripHorizontal, ChevronDown, ChevronUp } from "lucide-react";

export interface XRayAnnotation {
  id: string;
  title: string;
  explanation: string;
  character: "lrh" | "profcat" | "bankerpig" | "goat" | "dog";
  /** CSS selector or ref-id to find the target element */
  targetSelector?: string;
  /** Fixed position fallback if selector isn't found */
  targetPosition?: { x: number; y: number };
  /** Initial panel offset from target */
  initialOffset?: { x: number; y: number };
}

interface XRayPanelProps {
  annotation: XRayAnnotation;
  index: number;
}

const PANEL_WIDTH = 280;

export function XRayPanel({ annotation, index }: XRayPanelProps) {
  const { xrayOn, activePanel, setActivePanel } = useXRay();
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; panelX: number; panelY: number } | null>(null);

  const isActive = activePanel === annotation.id;

  // Find target element and compute positions
  const updateTargetPoint = useCallback(() => {
    if (annotation.targetSelector) {
      const el = document.querySelector(annotation.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetPoint({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        if (!initialized) {
          const offset = annotation.initialOffset || { x: 60, y: -80 };
          setPosition({
            x: Math.min(Math.max(rect.left + offset.x, 8), window.innerWidth - PANEL_WIDTH - 8),
            y: Math.min(Math.max(rect.top + offset.y, 8), window.innerHeight - 120),
          });
          setInitialized(true);
        }
        return;
      }
    }
    if (annotation.targetPosition) {
      setTargetPoint(annotation.targetPosition);
      if (!initialized) {
        const offset = annotation.initialOffset || { x: 60, y: -80 };
        setPosition({
          x: Math.min(Math.max(annotation.targetPosition.x + offset.x, 8), window.innerWidth - PANEL_WIDTH - 8),
          y: Math.min(Math.max(annotation.targetPosition.y + offset.y, 8), window.innerHeight - 120),
        });
        setInitialized(true);
      }
    }
  }, [annotation, initialized]);

  useEffect(() => {
    if (!xrayOn) return;
    updateTargetPoint();
    const interval = setInterval(updateTargetPoint, 500);
    return () => clearInterval(interval);
  }, [xrayOn, updateTargetPoint]);

  // Stagger default positions if no target found
  useEffect(() => {
    if (!xrayOn || initialized) return;
    setPosition({
      x: 16 + (index % 2) * (PANEL_WIDTH + 16),
      y: 80 + index * 100,
    });
    setInitialized(true);
  }, [xrayOn, initialized, index]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panelX: position.x,
      panelY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    e.preventDefault();
    setPosition({
      x: Math.min(Math.max(dragRef.current.panelX + (e.clientX - dragRef.current.startX), 0), window.innerWidth - PANEL_WIDTH),
      y: Math.min(Math.max(dragRef.current.panelY + (e.clientY - dragRef.current.startY), 0), window.innerHeight - 60),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Connector line from panel to target
  const getConnectorLine = () => {
    if (!targetPoint) return null;
    const panelCenterX = position.x + PANEL_WIDTH / 2;
    const panelBottomY = position.y + (collapsed ? 36 : 120);

    const tx = targetPoint.x;
    const ty = targetPoint.y;

    // Elbow: go down from panel, then horizontal to target
    const midY = (panelBottomY + ty) / 2;

    return (
      <svg className="fixed inset-0 pointer-events-none z-[41]" style={{ width: "100vw", height: "100vh" }}>
        <path
          d={`M ${panelCenterX} ${panelBottomY} L ${panelCenterX} ${midY} L ${tx} ${midY} L ${tx} ${ty}`}
          fill="none"
          stroke="rgba(34, 211, 238, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        <circle cx={tx} cy={ty} r="4" fill="rgba(34, 211, 238, 0.6)" stroke="rgba(34, 211, 238, 0.8)" strokeWidth="1" />
      </svg>
    );
  };

  if (!xrayOn) return null;

  return (
    <>
      {getConnectorLine()}
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25, delay: index * 0.1 }}
        className="fixed z-[42]"
        style={{
          left: position.x,
          top: position.y,
          width: PANEL_WIDTH,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActivePanel(annotation.id);
        }}
      >
        <div
          className="rounded-lg overflow-hidden shadow-xl"
          style={{
            background: "#0a1628",
            border: `1px solid ${isActive ? "rgba(34, 211, 238, 0.6)" : "rgba(34, 211, 238, 0.25)"}`,
            boxShadow: isActive
              ? "0 0 20px rgba(34, 211, 238, 0.15), 0 4px 20px rgba(0,0,0,0.5)"
              : "0 4px 20px rgba(0,0,0,0.5)",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          {/* Draggable title bar */}
          <div
            className="flex items-center gap-2 px-3 py-2 select-none"
            style={{
              background: isActive ? "rgba(34, 211, 238, 0.08)" : "rgba(34, 211, 238, 0.04)",
              cursor: "grab",
              borderBottom: "1px solid rgba(34, 211, 238, 0.15)",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <GripHorizontal className="w-3.5 h-3.5 text-cyan-400/50 shrink-0" />

            {/* Character slot — LRH teleports here when active */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <LRHCharacter size={24} clickable={false} />
                </motion.div>
              )}
            </AnimatePresence>

            <span
              className="flex-1 text-xs font-medium truncate"
              style={{ color: "#22d3ee", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.03em" }}
            >
              {annotation.title}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
              className="text-cyan-400/60 hover:text-cyan-300 transition-colors"
            >
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Body */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 py-2.5">
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(250, 245, 235, 0.75)", lineHeight: 1.6 }}
                  >
                    {annotation.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

export default XRayPanel;
