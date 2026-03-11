/**
 * WELCOME GATE — Flattened Deck (3-Tab, No Flip Cards)
 * =====================================================
 * Full-screen overlay shown to every first-time visitor on ANY page.
 *
 * Three tabs (flat — NO nested flip-cards):
 *   "Concept"      — Tab A: 12-frame seed-to-banyan flipbook by Ausbin.
 *                    Auto-plays, then auto-advances to Tab B.
 *   "Get Started"  — Tab B: BLUF triage — 4 large flat buttons.
 *                    Clicking any button closes the gate + routes (Ghost Mode).
 *   "More Detail"  — Tab C: SEC-safe manifesto text.
 *                    Single CTA: "Tour the 16 Initiatives" → Wildfire Beacon Run.
 *
 * Miller's Law (cognitive load) and Howey Test (SEC) compliant.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { INITIATIVES_FULL_RUN } from "@/data/wildfireRuns";
import {
  shouldShowWelcomeGate,
  dismissWelcomeGate,
  incrementVisitCount,
} from "@/lib/welcomeGateContent";

// ── Types ──────────────────────────────────────────────────────────────────

type TabId = "concept" | "getStarted" | "moreDetail";

// ── Constants ──────────────────────────────────────────────────────────────

const STORYBOARD_FRAMES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const FRAME_DURATIONS: Record<1 | 2 | 3, number> = { 1: 1200, 2: 600, 3: 300 };

const SEC_SAFE_LINES = [
  "Member-Governed. Cooperative Commerce.",
  "You hold the rights to your work.",
  "Your ideas/services/products Preorder-Funded and Made by Members.",
  "The 20% margin funds 16 charitable initiatives for Everyone.",
  "The People doing the Work make the Decisions and get the Benefits.",
];

// ── Component ──────────────────────────────────────────────────────────────

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const [entering, setEntering] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { startRun } = useWildfireRun();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>("concept");

  // Flipbook state
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 3>(1);
  const autoSwitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Init ──
  useEffect(() => {
    incrementVisitCount();
    if (shouldShowWelcomeGate()) {
      setVisible(true);
    }
  }, []);

  // ── Preload storyboard images ──
  useEffect(() => {
    STORYBOARD_FRAMES.forEach((n) => {
      const img = new Image();
      img.src = `/images/storyboard/storyboard${n}.png`;
    });
  }, []);

  // ── Flipbook auto-advance ──
  useEffect(() => {
    if (!isPlaying || activeTab !== "concept") return;
    const ms = FRAME_DURATIONS[speed];
    const timer = setInterval(() => {
      setFrame((prev) => {
        if (prev >= 11) {
          setIsPlaying(false);
          return 11;
        }
        return prev + 1;
      });
    }, ms);
    return () => clearInterval(timer);
  }, [isPlaying, speed, activeTab]);

  // ── Auto-switch to Tab B when flipbook ends ──
  useEffect(() => {
    if (frame === 11 && !isPlaying && activeTab === "concept") {
      autoSwitchTimer.current = setTimeout(() => setActiveTab("getStarted"), 1500);
      return () => {
        if (autoSwitchTimer.current) clearTimeout(autoSwitchTimer.current);
      };
    }
  }, [frame, isPlaying, activeTab]);

  const cancelAutoSwitch = useCallback(() => {
    if (autoSwitchTimer.current) {
      clearTimeout(autoSwitchTimer.current);
      autoSwitchTimer.current = null;
    }
  }, []);

  // ── Gate close → dismiss + optional route ──
  const closeGate = useCallback(
    (route?: string) => {
      setEntering(true);
      setTimeout(() => {
        dismissWelcomeGate(doNotShowAgain);
        setVisible(false);
        if (route) navigate(route);
      }, 400);
    },
    [doNotShowAgain, navigate],
  );

  // ── Tour the 16 Initiatives (Wildfire Beacon Run) ──
  const handleTourInitiatives = useCallback(() => {
    startRun(INITIATIVES_FULL_RUN);
    closeGate(`/wildfire-run/${INITIATIVES_FULL_RUN.slug}`);
  }, [startRun, closeGate]);

  // ── Flipbook controls ──
  const prevFrame = useCallback(() => {
    cancelAutoSwitch();
    setIsPlaying(false);
    setFrame((f) => Math.max(0, f - 1));
  }, [cancelAutoSwitch]);

  const nextFrame = useCallback(() => {
    cancelAutoSwitch();
    setIsPlaying(false);
    setFrame((f) => Math.min(11, f + 1));
  }, [cancelAutoSwitch]);

  const skipFlipbook = useCallback(() => {
    cancelAutoSwitch();
    setIsPlaying(false);
    closeGate();
  }, [cancelAutoSwitch, closeGate]);

  const togglePlay = useCallback(() => {
    cancelAutoSwitch();
    if (frame === 11 && !isPlaying) {
      setFrame(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }, [frame, isPlaying, cancelAutoSwitch]);

  const setSpeedTo = useCallback(
    (s: 1 | 2 | 3) => {
      cancelAutoSwitch();
      setSpeed(s);
      if (!isPlaying) setIsPlaying(true);
    },
    [cancelAutoSwitch, isPlaying],
  );

  // ── Keyboard ──
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        closeGate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, closeGate]);

  // ── Early return ──
  if (!visible) return <>{children}</>;

  // ── Shared styles ──
  const overlayBg = "linear-gradient(135deg, #0a0a0a 0%, #0d1f0d 30%, #0a0a0a 70%, #0d0d1f 100%)";
  const hexPatternUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
  const ctaBtnClass = `rounded-xl font-bold tracking-wide uppercase transition-all bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 w-full ${isMobile ? "px-10 py-4 text-base" : "px-16 py-5 text-lg"}`;

  return (
    <>
      <div className="hidden">{children}</div>

      <div
        className={`fixed inset-0 z-[9999] transition-opacity duration-400 ${entering ? "opacity-0" : "opacity-100"}`}
        style={{ background: overlayBg }}
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: hexPatternUrl }} />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
          <div className={`w-full ${isMobile ? "max-w-sm" : "max-w-xl"}`}>

            <div className="space-y-8 animate-in fade-in duration-500">
              <div
                className={`relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.02] mx-auto ${isMobile ? "max-w-xs" : "max-w-md"}`}
                style={{ aspectRatio: "1" }}
              >
                <img
                  key={frame}
                  src={`/images/storyboard/storyboard${STORYBOARD_FRAMES[frame]}.png`}
                  alt={`Seed to Banyan — frame ${frame + 1} of 12`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 right-3 text-[10px] text-white/30 font-mono">
                    {frame + 1} / 12
                  </div>
                </div>

                {/* Playback controls: < 1x 2x 3x || > */}
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  <button onClick={prevFrame} className="px-2 py-1 rounded text-xs text-white/40 hover:text-white/80 hover:bg-white/10 transition-all" aria-label="Previous frame">&lsaquo;</button>
                  {([1, 2, 3] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeedTo(s)}
                      className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                        speed === s && isPlaying
                          ? "bg-green-600/30 text-green-400 border border-green-500/40"
                          : "text-white/30 hover:text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {s}&times;
                    </button>
                  ))}
                  <button onClick={togglePlay} className="px-2.5 py-1 rounded text-xs text-white/40 hover:text-white/80 hover:bg-white/10 transition-all" aria-label={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <button onClick={skipFlipbook} className="px-2.5 py-1 rounded text-xs text-white/30 hover:text-green-400 hover:bg-white/10 transition-all">
                    Skip &rarr;
                  </button>
                  <button onClick={nextFrame} className="px-2 py-1 rounded text-xs text-white/40 hover:text-white/80 hover:bg-white/10 transition-all" aria-label="Next frame">&rsaquo;</button>
                </div>

                <div className="space-y-3 text-center pt-4">
                  {SEC_SAFE_LINES.map((line, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? `font-bold text-green-400 ${isMobile ? "text-lg" : "text-xl"}`
                          : `text-white/70 ${isMobile ? "text-xs" : "text-sm"} leading-relaxed`
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>

                <div className="pt-6">
                  <button onClick={() => closeGate()} className={ctaBtnClass}>
                    Enter the Ecosystem
                  </button>
                </div>

                <p className="text-center text-[8px] text-white/15 tracking-widest uppercase mt-4">Illustrated by Ausbin</p>
              </div>

            {/* TAB B AND C REMOVED FOR ONE-DOOR POLICY */}
          </div>

          {/* Do Not Show Again + Branding — always visible */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={doNotShowAgain}
                onChange={(e) => setDoNotShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-transparent text-green-500 focus:ring-green-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors select-none">Do Not Show This Again</span>
            </label>
            <p className="text-[10px] text-white/20 tracking-widest uppercase">Member Governed &middot; Cooperative Commerce</p>
          </div>
        </div>
      </div>
    </>
  );
}
