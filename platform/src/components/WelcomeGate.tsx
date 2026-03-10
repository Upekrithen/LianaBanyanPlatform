/**
 * WELCOME GATE — First-Visit Overlay with Container-Flip
 * ========================================================
 * Full-screen overlay shown to every first-time visitor on ANY page.
 *
 * Supports TWO layouts:
 *   "standard" — Headline + highlight cards + single CTA button.
 *                Clicking any highlight card OR the title flips the
 *                entire content area to show details about that topic.
 *   "bluf"     — BLUF (Bottom Line Up Front) triage fork with 2-3 branching
 *                buttons that route directly to what the user needs TODAY.
 *
 * Behavior:
 * - Shows once per session by default
 * - "Do Not Show This Again" checkbox → permanent dismissal
 * - If checkbox NOT checked → shows again next visit
 * - Content is switchable via Durin's Door passwords
 * - Mobile-responsive: single column on mobile, two columns on desktop
 * - PWA prompt is suppressed while this is visible
 * - Click anywhere on back face (not buttons) flips back to front
 * - Escape key flips back to front when flipped
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  getActiveVariant,
  shouldShowWelcomeGate,
  dismissWelcomeGate,
  incrementVisitCount,
  type WelcomeVariant,
  type WelcomeBranch,
} from "@/lib/welcomeGateContent";

// ── Extended content for card flip backs ──

interface FlipBackContent {
  quickFacts: string;
  deeper: string;
}

/** Back-face content for each highlight, keyed by title */
const HIGHLIGHT_FLIP_CONTENT: Record<string, FlipBackContent> = {
  "Mutual Aid, Not Charity": {
    quickFacts:
      "Every initiative creates mutual benefit. When you buy, sell, or contribute, the whole network strengthens. 83.3% of every transaction goes directly to the creator — constitutionally locked. The remaining 20% runs the platform. No investor extraction. No venture capital skimming.",
    deeper:
      "The Cost+20% model means creators set their own prices. The platform margin is transparent and immutable. Three currencies work together: Credits (purchased with dollars), Marks (earned through effort), and Joules (stored surplus with forever-stamp exchange rates). All three have equal value but different acquisition rules — this prevents speculation while rewarding real participation.",
  },
  "Transparent Pricing": {
    quickFacts:
      "Cost + 20%. That is the entire pricing model. No hidden fees, no dynamic pricing, no surge charges. Every transaction is logged on the Immutable Ledger so anyone can verify the math. The 20% is split into platform operations, creator allocation, and external capital pools.",
    deeper:
      "The 60/20/20 split: 60% funds platform operations, 20% goes to creator allocations, 20% feeds the external capital pool for new projects. Patent sponsorship stakes are capped at $10M with automatic splitting for accessibility. This is service sponsorship — sponsors receive platform benefits, not equity. Sellers set prices. Markets discover fair value. Nobody manipulates the spread.",
  },
  "Access Over Exclusion": {
    quickFacts:
      "Ghost mode lets anyone explore the entire platform for free — no signup, no credit card. 20% of cold start slots in every initiative are donated to people who cannot afford the $5/year membership. The ladder, not the gate. We build entry points, not barriers.",
    deeper:
      "Ghost World uses a Half-Life decay system: non-members can accumulate up to 30 days of persistence (session time, pages visited, golden keys found). After 30 days of inactivity, progress decays. This creates a natural conversion funnel without hard walls. Members get permanent persistence, but Ghosts always have access to explore.",
  },
  "Earned Over Given": {
    quickFacts:
      "Marks emerge from the differential between your contribution and the platform's value — they are never granted as gifts. Commitment unlocks trust. Reputation is locked as collateral for high-value roles. There are no shortcuts to platform standing.",
    deeper:
      "Marks are restricted to essential spending: food, medical, and platform services. They clear through continued participation, not cash. NOID roles (Network Operators In Distributed Systems) require locking reputation collateral for time-based bonuses — faster completion earns more Marks. This ensures quality: you stake your standing on your work.",
  },
};

/** Back-face content when the TITLE is clicked */
const TITLE_FLIP_CONTENT = {
  heading: "What You Get Here",
  categories: [
    { label: "Build & Sell", items: ["Launch products at Cost+20%", "Keep 83.3% of every sale", "Access the distributed factory network"] },
    { label: "Earn & Grow", items: ["Real work, fair pay via bounties", "Earn Marks through contributions", "Build reputation with collateral-backed roles"] },
    { label: "Back & Support", items: ["Sponsor projects you believe in", "Earn medallions and Joules", "Pre-order products from real creators"] },
    { label: "Learn & Explore", items: ["Ghost mode — free exploration", "16 initiatives to discover", "Academic papers and research"] },
  ],
};

// ── Component ──

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const [variant, setVariant] = useState<WelcomeVariant | null>(null);
  const [entering, setEntering] = useState(false);
  /** null = front face, "title" = title benefits, number = highlight index */
  const [flippedTo, setFlippedTo] = useState<"title" | number | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const isFlipped = flippedTo !== null;

  useEffect(() => {
    incrementVisitCount();
    if (shouldShowWelcomeGate()) {
      setVariant(getActiveVariant());
      setVisible(true);
    }
  }, []);

  const handleEnter = useCallback(() => {
    setEntering(true);
    setTimeout(() => {
      dismissWelcomeGate(doNotShowAgain);
      setVisible(false);
    }, 400);
  }, [doNotShowAgain]);

  const handleBranch = useCallback((branch: WelcomeBranch) => {
    setEntering(true);
    setTimeout(() => {
      dismissWelcomeGate(doNotShowAgain);
      setVisible(false);
      if (branch.route) navigate(branch.route);
    }, 400);
  }, [doNotShowAgain, navigate]);

  const flipTo = useCallback((target: "title" | number) => {
    setFlippedTo(target);
  }, []);

  const flipBack = useCallback(() => {
    setFlippedTo(null);
  }, []);

  // Keyboard: Escape flips back (when flipped) or enters (when not flipped)
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFlipped) {
          e.preventDefault();
          flipBack();
        } else {
          handleEnter();
        }
      } else if (e.key === "Enter" && !isFlipped) {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, isFlipped, flipBack, handleEnter]);

  if (!visible || !variant) {
    return <>{children}</>;
  }

  const isBluf = variant.layout === "bluf";

  // Get the active highlight's flip content
  const activeHighlight = typeof flippedTo === "number" ? variant.highlights[flippedTo] : null;
  const activeFlipContent = activeHighlight ? HIGHLIGHT_FLIP_CONTENT[activeHighlight.title] : null;

  return (
    <>
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

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
          <div className={`w-full ${isMobile ? "max-w-sm" : "max-w-3xl"}`}>

            {/* ═══ 3D FLIP CONTAINER (standard layout only) ═══ */}
            {!isBluf ? (
              <div style={{ perspective: "1200px" }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* ─── FRONT FACE ─── */}
                  <div
                    style={{ backfaceVisibility: "hidden", position: "relative", width: "100%" }}
                    className="space-y-8"
                  >
                    {/* Headline — clickable to flip */}
                    <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <h1
                        className={`font-bold leading-tight cursor-pointer group ${isMobile ? "text-3xl" : "text-5xl"}`}
                        onClick={() => flipTo("title")}
                        role="button"
                        tabIndex={0}
                        aria-label="Click to see categorized benefits"
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipTo("title"); } }}
                      >
                        <span className="text-white group-hover:text-white/80 transition-colors">{variant.headline.top}</span>
                        <br />
                        <span className="text-green-400 group-hover:text-green-300 transition-colors">{variant.headline.bottom}</span>
                      </h1>
                      <p className={`text-white/60 max-w-xl mx-auto ${isMobile ? "text-sm" : "text-lg"}`}>
                        {variant.subtitle}
                      </p>
                    </div>

                    {/* Highlight cards — each clickable to flip */}
                    <div
                      className={`grid gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 ${
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      }`}
                    >
                      {variant.highlights.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => flipTo(i)}
                          className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm
                            hover:border-green-500/30 hover:bg-white/[0.06] transition-all cursor-pointer text-left group"
                          aria-label={`Learn more about ${h.title} — click to flip`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">{h.icon}</span>
                            <div>
                              <h3 className="font-semibold text-white text-sm group-hover:text-green-300 transition-colors">{h.title}</h3>
                              <p className="text-white/50 text-xs mt-1 leading-relaxed">{h.description}</p>
                              <span className="text-[10px] text-green-500/60 mt-2 block font-medium">Click to learn more →</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Enter button */}
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
                    </div>

                    {/* Do Not Show Again */}
                    <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
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
                      <p className="text-sm text-green-400/60 italic">{variant.tagline}</p>
                    </div>
                  </div>

                  {/* ─── BACK FACE ─── */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      overflow: "auto",
                      cursor: "pointer",
                    }}
                    onClick={flipBack}
                    role="region"
                    aria-label={
                      flippedTo === "title"
                        ? "Benefits overview — click anywhere to go back"
                        : activeHighlight
                        ? `${activeHighlight.title} details — click anywhere to go back`
                        : "Card back"
                    }
                  >
                    <div className="space-y-6 py-2">
                      {/* Go Back button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); flipBack(); }}
                        className="text-xs text-white/40 hover:text-white/80 transition-colors flex items-center gap-1.5"
                        aria-label="Go back to front"
                      >
                        ← Go Back
                      </button>

                      {/* ── Title flip: categorized benefits list ── */}
                      {flippedTo === "title" && (
                        <div className="space-y-6">
                          <h2 className={`font-bold text-white text-center ${isMobile ? "text-2xl" : "text-3xl"}`}>
                            {TITLE_FLIP_CONTENT.heading}
                          </h2>
                          <div className={`grid gap-5 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
                            {TITLE_FLIP_CONTENT.categories.map((cat) => (
                              <div key={cat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                <h3 className="font-semibold text-green-400 text-sm mb-2">{cat.label}</h3>
                                <ul className="space-y-1.5">
                                  {cat.items.map((item, j) => (
                                    <li key={j} className="text-white/60 text-xs flex items-start gap-2">
                                      <span className="text-green-500 mt-0.5">✓</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Highlight flip: topic details ── */}
                      {typeof flippedTo === "number" && activeHighlight && (
                        <div className="space-y-5">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{activeHighlight.icon}</span>
                            <h2 className={`font-bold text-white ${isMobile ? "text-xl" : "text-2xl"}`}>
                              {activeHighlight.title}
                            </h2>
                          </div>

                          {/* Quick Facts */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-green-500/60 mb-2">
                              Quick Facts
                            </p>
                            <p className="text-white/70 text-sm leading-relaxed">
                              {activeFlipContent?.quickFacts || activeHighlight.description}
                            </p>
                          </div>

                          {/* Deeper Look */}
                          {activeFlipContent?.deeper && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-green-500/60 mb-2">
                                Deeper Look
                              </p>
                              <p className="text-white/50 text-sm leading-relaxed">
                                {activeFlipContent.deeper}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Enter button on back too */}
                      <div className="flex flex-col items-center gap-4 pt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEnter(); }}
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
                      </div>

                      <p className="text-center text-[10px] text-white/20">
                        Click anywhere to flip back
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ═══ BLUF Layout (unchanged) ═══ */
              <div className="space-y-8">
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

                {/* Branches */}
                {variant.branches && (
                  <div className="grid gap-4 grid-cols-1 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                    {variant.branches.map((branch, i) => (
                      <button
                        key={branch.id}
                        onClick={() => handleBranch(branch)}
                        className={`
                          w-full rounded-2xl border p-6 text-left transition-all duration-300
                          bg-gradient-to-r ${branch.color}
                          hover:scale-[1.02] active:scale-[0.98]
                          group cursor-pointer
                          animate-in fade-in slide-in-from-bottom-4
                        `}
                        style={{ animationDelay: `${200 + i * 150}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`flex-shrink-0 ${isMobile ? "text-3xl" : "text-4xl"}`}>{branch.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h2 className={`font-bold text-white group-hover:text-green-300 transition-colors ${
                              isMobile ? "text-lg" : "text-xl"
                            }`}>
                              {branch.title}
                            </h2>
                            <p className={`text-white/50 mt-1 ${isMobile ? "text-xs" : "text-sm"}`}>
                              {branch.subtitle}
                            </p>
                          </div>
                          <span className="text-white/30 group-hover:text-green-400 transition-colors text-2xl flex-shrink-0">
                            →
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Do Not Show Again */}
                <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
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
                  <p className="text-sm text-green-400/60 italic">{variant.tagline}</p>
                </div>
              </div>
            )}
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
