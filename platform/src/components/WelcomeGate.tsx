/**
 * WELCOME GATE — First-Visit Overlay
 * ====================================
 * Full-screen overlay shown to every first-time visitor on ANY page.
 *
 * Behavior:
 * - Shows once per session by default
 * - "Do Not Show This Again" checkbox → permanent dismissal
 * - If checkbox NOT checked → shows again next visit
 * - Content is switchable via Durin's Door passwords
 * - Mobile-responsive: single column on mobile, two columns on desktop
 * - PWA prompt is suppressed while this is visible
 *
 * The Founder updates content by entering Durin's Door passwords:
 *   "HELP EACH OTHER" → Default philosophy page
 *   "HEXISLE LAUNCH"  → HexIsle promotional content
 *   "SHIELD WALL"     → Defense Klaus campaign
 */

import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  getActiveVariant,
  shouldShowWelcomeGate,
  dismissWelcomeGate,
  incrementVisitCount,
  type WelcomeVariant,
} from "@/lib/welcomeGateContent";

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const [variant, setVariant] = useState<WelcomeVariant | null>(null);
  const [entering, setEntering] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Increment visit count on mount
    incrementVisitCount();

    if (shouldShowWelcomeGate()) {
      setVariant(getActiveVariant());
      setVisible(true);
    }
  }, []);

  const handleEnter = useCallback(() => {
    setEntering(true);
    // Animate out, then hide
    setTimeout(() => {
      dismissWelcomeGate(doNotShowAgain);
      setVisible(false);
    }, 400);
  }, [doNotShowAgain]);

  // Handle keyboard — Enter to proceed, Escape to proceed
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, handleEnter]);

  // Always render children — overlay sits on top
  if (!visible || !variant) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Children render behind for lazy-loading during overlay */}
      <div className="hidden">{children}</div>

      {/* Full-screen overlay */}
      <div
        className={`fixed inset-0 z-[9999] transition-opacity duration-400 ${
          entering ? "opacity-0" : "opacity-100"
        }`}
        style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0d1f0d 30%, #0a0a0a 70%, #0d0d1f 100%)" }}
      >
        {/* Subtle hex pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content container */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
          {/* Main content card */}
          <div className={`w-full ${isMobile ? "max-w-sm" : "max-w-3xl"} space-y-8`}>

            {/* Headline */}
            <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className={`font-bold leading-tight ${isMobile ? "text-3xl" : "text-5xl"}`}>
                <span className="text-white">{variant.headline.top}</span>
                <br />
                <span className="text-green-400">{variant.headline.bottom}</span>
              </h1>
              <p className={`text-white/60 max-w-xl mx-auto ${isMobile ? "text-sm" : "text-lg"}`}>
                {variant.subtitle}
              </p>
            </div>

            {/* Highlight cards */}
            <div
              className={`grid gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 ${
                isMobile ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {variant.highlights.map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm hover:border-green-500/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{h.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{h.title}</h3>
                      <p className="text-white/50 text-xs mt-1 leading-relaxed">{h.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enter button + Do Not Show Again */}
            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <button
                onClick={handleEnter}
                className={`
                  rounded-xl font-bold tracking-wide uppercase transition-all
                  bg-gradient-to-r from-green-600 to-green-500 text-white
                  hover:from-green-500 hover:to-green-400 hover:shadow-lg hover:shadow-green-500/20
                  active:scale-95
                  ${isMobile ? "px-10 py-3 text-base" : "px-16 py-4 text-lg"}
                `}
              >
                {variant.ctaText}
              </button>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={doNotShowAgain}
                  onChange={(e) => setDoNotShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-transparent text-green-500 focus:ring-green-500/50 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors select-none">
                  Do Not Show This Again
                </span>
              </label>
            </div>

            {/* Tagline */}
            <div className="text-center animate-in fade-in duration-700 delay-700">
              <p className="text-sm text-green-400/60 italic">
                {variant.tagline}
              </p>
            </div>
          </div>

          {/* Liana Banyan branding — bottom */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-white/20 tracking-widest uppercase">
              Liana Banyan Corporation
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
