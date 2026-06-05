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
 * F6 (card size): PENDING Founder ratify — follow-up wave.
 *
 * Hostname routing: museum.lianabanyan.com -> portalDetector 'museum' -> MuseumApp -> /
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { HEOHOCardFront } from "@/components/museum/HEOHOCardFront";
import { RotatingQuotes, QUOTES } from "@/components/museum/RotatingQuotes";
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

/** Stats bar: canon numbers above the deck card */
function CanonStatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      style={{
        textAlign: "center",
        marginBottom: "1.25rem",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.58rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        lineHeight: 2,
      }}
    >
      <span style={{ color: "rgba(250,245,235,0.3)" }}>The private AI cooperative</span>
      <br />
      <span style={{ color: "#d69e2e" }}>2,270 members</span>
      <span style={{ color: "rgba(250,245,235,0.2)", margin: "0 0.5rem" }}>&middot;</span>
      <span style={{ color: "#38a169" }}>83.3% Caithedral Effect</span>
      <span style={{ color: "rgba(250,245,235,0.2)", margin: "0 0.5rem" }}>&middot;</span>
      <span style={{ color: "rgba(250,245,235,0.3)" }}>Cost+20%</span>
    </motion.div>
  );
}

const HEOHOLanding = () => {
  // Quote rotation state — fully controls RotatingQuotes (lifted to page level)
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // F3: Full-page glow if SHINE not clicked within 10s of Yvaine quote appearing
  const [shineClicked, setShineClicked] = useState(false);
  const [fullPageGlowFiring, setFullPageGlowFiring] = useState(false);
  const [muted, setMuted] = useState(false);

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

  // F3: 10s glow timer — fires if Yvaine active and SHINE not clicked
  useEffect(() => {
    if (!yvaineActive || shineClicked || prefersReducedMotion) {
      if (glowTimerRef.current) {
        clearTimeout(glowTimerRef.current);
        glowTimerRef.current = null;
      }
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
  }, [yvaineActive, shineClicked, prefersReducedMotion]);

  // F3: Play founder voice audio when glow fires (canonical path: founder_voice_shine.m4a)
  useEffect(() => {
    if (!fullPageGlowFiring || muted || prefersReducedMotion) return;
    const audio = new Audio("/audio/founder_voice_shine.m4a");
    audio.play().catch(() => {
      // Autoplay blocked — play on next user interaction
      const playOnce = () => {
        audio.play().catch(() => {});
        document.removeEventListener("pointerdown", playOnce);
      };
      document.addEventListener("pointerdown", playOnce, { once: true });
    });
    return () => {
      audio.pause();
    };
  }, [fullPageGlowFiring, muted, prefersReducedMotion]);

  // Prev/next handlers — reset shineClicked so fresh timer starts if returning to Yvaine
  const handlePrev = useCallback(() => {
    setQuoteIndex((prev) => (prev - 1 + QUOTES.length) % QUOTES.length);
  }, []);

  const handleNext = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  }, []);

  // Called when SHINE link clicked — cancels the 10s glow timer
  const handleShineClick = useCallback(() => {
    setShineClicked(true);
    if (glowTimerRef.current) {
      clearTimeout(glowTimerRef.current);
      glowTimerRef.current = null;
    }
  }, []);

  // HEOHOCardFront callbacks: pause/resume rotation during SHINE sequence
  const handleYvaineSequence = useCallback((p: boolean) => {
    setPaused(p);
  }, []);

  // HEOHOCardFront t4 callback: advance quote after sequence
  const handleAdvanceQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  }, []);

  return (
    <MuseumShell>
      {/* F3: Full-page whiteout glow overlay — fires if SHINE not clicked within 10s */}
      {fullPageGlowFiring && (
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
        className="min-h-screen flex flex-col items-center justify-center px-4 py-6 pb-24"
        style={{ maxWidth: "28rem", margin: "0 auto" }}
      >
        {/* Canon stats */}
        <CanonStatsBar />

        {/* Sig1: Rotating quotes — page-level, ABOVE the card */}
        <RotatingQuotes
          quoteIndex={quoteIndex}
          onPrev={handlePrev}
          onNext={handleNext}
          onShineClick={handleShineClick}
          muted={muted}
        />

        {/* Sig2/4/5: Big deck card — HEOHO hero, 5:7 aspect ratio */}
        <HEOHOCardFront
          isYvaine={yvaineActive}
          onYvaineSequence={handleYvaineSequence}
          onAdvanceQuote={handleAdvanceQuote}
        />

        {/* X-ray goggles + mute toggle */}
        <div
          className="flex items-center justify-center gap-2"
          style={{ marginTop: "1.25rem" }}
        >
          <XRayGogglesElement />
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
            title={muted ? "Unmute" : "Mute"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted ? "rgba(250,245,235,0.2)" : "rgba(250,245,235,0.35)",
              padding: "0.4rem",
              transition: "color 0.2s",
              display: "flex",
              alignItems: "center",
            }}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>
      <TourBanner />
    </MuseumShell>
  );
};

export default HEOHOLanding;
