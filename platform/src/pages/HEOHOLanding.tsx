/**
 * HEOHOLanding — museum.lianabanyan.com HEOHO variant.
 * BM30 Scope 5: HEOHO landing for the museum Firebase hosting target.
 *
 * Components (render order):
 *   - Canon stats bar: "THE PRIVATE AI COOPERATIVE" + 2,270 MEMBERS / 83.3% CAITHEDRAL EFFECT / COST+20%
 *   - Quotes above the card: <RotatingQuotes /> page-level component above HEOHOCardFront
 *   - Big deck card: HEOHOCardFront — HEOHO hero card, 5:7 aspect ratio
 *   - X-ray goggles: inline CSS goggles element with "Suppressing Mana 85%" ripple on hover
 *   - NO red Mission One box
 *
 * BP075 5-signature canonical favorite:
 *   Sig1: RotatingQuotes above card (23 quotes incl. Flik+Dot pair)
 *   Sig2: Yvaine SHINE → navigate("/yvaine") (YouTube embed)
 *   Sig3: Full-page glow if SHINE not clicked within 10s of Yvaine quote appearing
 *   Sig4: Golden keyhole persists after SHINE sequence (keyholeActive=true)
 *   Sig5: Speak Friend, and Enter — input placeholder (mellon/friend/etc. still valid)
 *
 * F6 (card size): APPLIED -- 560px max-width (+46%, Founder ratify Option 2 BP075).
 *
 * Hostname routing: museum.lianabanyan.com -> portalDetector 'museum' -> MuseumApp -> /
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { HEOHOFlipCard } from "@/components/museum/HEOHOFlipCard";
import { QUOTES } from "@/components/museum/RotatingQuotes";
import { TourBanner } from "@/components/wildfire/TourBanner";
import { useXRay } from "@/components/museum/XRayContext";

/** Inline X-ray goggles element: CSS-only ripple + "Suppressing Mana 85%" on hover. */
function XRayGogglesElement() {
  const { xrayOn, toggleXray } = useXRay();
  const [hovered, setHovered] = useState(false);

  const activeColor = "#22d3ee";
  const restColor = "rgba(250,245,235,0.25)";
  const lensColor = xrayOn
    ? "rgba(34,211,238,0.15)"
    : "rgba(250,245,235,0.04)";
  const strokeColor = xrayOn ? activeColor : hovered ? "rgba(250,245,235,0.5)" : restColor;

  return (
    <motion.div
      className="flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <button
        onClick={toggleXray}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={xrayOn ? "X-Ray Goggles ON — click to disable" : "Activate X-Ray Goggles"}
        style={{
          position: "relative",
          background: xrayOn
            ? "rgba(34, 211, 238, 0.06)"
            : hovered
            ? "rgba(250,245,235,0.04)"
            : "transparent",
          border: `1px solid ${xrayOn ? "rgba(34,211,238,0.25)" : "transparent"}`,
          cursor: "pointer",
          padding: "0.45rem 1.1rem",
          borderRadius: "999px",
          transition: "background 0.3s ease, border-color 0.3s ease",
          outline: "none",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {/* Mana suppression ripple on hover */}
        {hovered && !xrayOn && (
          <motion.div
            key="ripple"
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "999px",
              border: "1px solid rgba(34, 211, 238, 0.4)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Goggles SVG (CSS-only — no image assets) */}
        <svg
          width="32"
          height="16"
          viewBox="0 0 32 16"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <rect
            x="1" y="1" width="12" height="12" rx="3.5"
            fill={lensColor} stroke={strokeColor} strokeWidth="1.5"
            style={{ transition: "fill 0.3s ease, stroke 0.3s ease" }}
          />
          <rect
            x="19" y="1" width="12" height="12" rx="3.5"
            fill={lensColor} stroke={strokeColor} strokeWidth="1.5"
            style={{ transition: "fill 0.3s ease, stroke 0.3s ease" }}
          />
          <line
            x1="13" y1="7" x2="19" y2="7"
            stroke={strokeColor} strokeWidth="1.5"
            style={{ transition: "stroke 0.3s ease" }}
          />
          {xrayOn && (
            <>
              <circle cx="7" cy="7" r="3" fill="rgba(34,211,238,0.75)" />
              <circle cx="25" cy="7" r="3" fill="rgba(34,211,238,0.75)" />
              <circle cx="8.5" cy="5.5" r="0.8" fill="rgba(255,255,255,0.6)" />
              <circle cx="26.5" cy="5.5" r="0.8" fill="rgba(255,255,255,0.6)" />
            </>
          )}
        </svg>

        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: xrayOn
              ? activeColor
              : hovered
              ? "rgba(250,245,235,0.6)"
              : "rgba(250,245,235,0.25)",
            transition: "color 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          {xrayOn
            ? "X-RAY ON"
            : hovered
            ? "Suppressing Mana 85%"
            : "X-Ray Goggles"}
        </span>
      </button>
    </motion.div>
  );
}


const HEOHOLanding = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Silent quote rotation state — drives F3 Yvaine glow cycle
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // F3: Full-page glow if SHINE not clicked within 10s of Yvaine quote appearing
  const [shineClicked, setShineClicked] = useState(false);
  const [fullPageGlowFiring, setFullPageGlowFiring] = useState(false);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Evaluate prefers-reduced-motion once at mount
  const prefersReducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  ).current;

  // Derived: is the Yvaine quote currently active?
  const yvaineActive = QUOTES[quoteIndex]?.isYvaine ?? false;

  // 8s auto-rotate timer — paused during SHINE sequence
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [paused]);

  // Reset shineClicked when Yvaine quote deactivates (so re-visiting triggers fresh timer)
  useEffect(() => {
    if (!yvaineActive) {
      setShineClicked(false);
    }
  }, [yvaineActive]);

  // F3: 10s glow timer — scoped to "/" only; inert on every other route
  useEffect(() => {
    if (pathname !== "/" || !yvaineActive || shineClicked || prefersReducedMotion) {
      if (glowTimerRef.current) {
        clearTimeout(glowTimerRef.current);
        glowTimerRef.current = null;
      }
      if (pathname !== "/") setFullPageGlowFiring(false);
      return;
    }
    glowTimerRef.current = setTimeout(() => {
      setFullPageGlowFiring(true);
    }, 10000);
    return () => {
      if (glowTimerRef.current) {
        clearTimeout(glowTimerRef.current);
        glowTimerRef.current = null;
      }
    };
  }, [pathname, yvaineActive, shineClicked, prefersReducedMotion]);

  // HEOHOCardFront callbacks: pause/resume rotation during SHINE sequence
  const handleYvaineSequence = useCallback((p: boolean) => {
    setPaused(p);
  }, []);

  // HEOHOCardFront t4 callback: advance quote after sequence (also used as onNext for RotatingQuotes)
  const handleAdvanceQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  }, []);

  // RotatingQuotes onPrev: step back one quote
  const handlePrev = useCallback(() => {
    setQuoteIndex((prev) => (prev - 1 + QUOTES.length) % QUOTES.length);
  }, []);

  return (
    <MuseumShell hideLRHGuide>
      {/* F3: Full-page whiteout glow overlay — "/" only; never mounts on other routes */}
      {pathname === "/" && fullPageGlowFiring && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 5, times: [0, 0.4, 0.4, 1], ease: "easeInOut" }}
          onAnimationComplete={() => setFullPageGlowFiring(false)}
          style={{ background: "white" }}
        />
      )}

      <div
        className="flex flex-col items-center justify-center px-4"
        style={{ maxWidth: "min(92vw, 560px)", height: "100svh", margin: "0 auto" }}
      >
        {/* Deck card — constrained to fit viewport without scrolling */}
        <div
          style={{
            flex: "1 1 0",
            minHeight: 0,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "5/7",
              maxHeight: "calc(100svh - 110px)",
            }}
          >
            <HEOHOFlipCard
              isYvaine={yvaineActive}
              onYvaineSequence={handleYvaineSequence}
              onAdvanceQuote={handleAdvanceQuote}
              quoteIndex={quoteIndex}
              onPrev={handlePrev}
              onShineClick={() => setShineClicked(true)}
            />
          </div>
        </div>

        {/* Watch + Enter CTAs */}
        <div
          className="flex items-center justify-center gap-4"
          style={{ marginTop: "0.5rem", marginBottom: "0.25rem", position: "relative", zIndex: 10 }}
        >
          <button
            onClick={() => navigate("/watch")}
            style={{
              background: "none",
              border: "1px solid rgba(250,245,235,0.15)",
              borderRadius: "999px",
              cursor: "pointer",
              padding: "0.3rem 1rem",
              color: "rgba(250,245,235,0.4)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            Watch
          </button>
          <button
            onClick={() => navigate("/enter")}
            style={{
              background: "none",
              border: "1px solid rgba(250,245,235,0.15)",
              borderRadius: "999px",
              cursor: "pointer",
              padding: "0.3rem 1rem",
              color: "rgba(250,245,235,0.4)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            Enter
          </button>
          <button
            onClick={() => navigate("/auth")}
            style={{
              background: "none",
              border: "1px solid rgba(250,245,235,0.15)",
              borderRadius: "999px",
              cursor: "pointer",
              padding: "0.3rem 1rem",
              color: "rgba(250,245,235,0.4)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            Join -- $5/yr
          </button>
        </div>

        {/* X-ray goggles */}
        <div
          className="flex items-center justify-center gap-2"
          style={{ marginBottom: "0.5rem" }}
        >
          <XRayGogglesElement />
        </div>
      </div>
      <TourBanner />
    </MuseumShell>
  );
};

export default HEOHOLanding;
