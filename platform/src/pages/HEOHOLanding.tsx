/**
 * HEOHOLanding — museum.lianabanyan.com HEOHO variant.
 * BM30 Scope 5: HEOHO landing for the museum Firebase hosting target.
 *
 * Components (per spec):
 *   - Quotes above the card: rotating founder + community quotes (inside HEOHOCardFront)
 *   - Big deck card: HEOHOCardFront — HEOHO hero card, 5:7 aspect ratio
 *   - Durin's Door: "Speak Friend" input (inside HEOHOCardFront, activated via keyhole O)
 *   - X-ray goggles: inline CSS goggles element with "Suppressing Mana 85%" ripple on hover
 *     (no Denken image assets found; CSS-only fallback per spec)
 *   - Canon stats bar: 2,270 members / 83.3% Caithedral Effect
 *   - NO red Mission One box
 *
 * Hostname routing: museum.lianabanyan.com -> portalDetector 'museum' -> MuseumApp -> /
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { HEOHOCardFront } from "@/components/museum/HEOHOCardFront";
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
      style={{ marginTop: "1.25rem" }}
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
          {/* Left lens */}
          <rect
            x="1"
            y="1"
            width="12"
            height="12"
            rx="3.5"
            fill={lensColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            style={{ transition: "fill 0.3s ease, stroke 0.3s ease" }}
          />
          {/* Right lens */}
          <rect
            x="19"
            y="1"
            width="12"
            height="12"
            rx="3.5"
            fill={lensColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            style={{ transition: "fill 0.3s ease, stroke 0.3s ease" }}
          />
          {/* Bridge */}
          <line
            x1="13"
            y1="7"
            x2="19"
            y2="7"
            stroke={strokeColor}
            strokeWidth="1.5"
            style={{ transition: "stroke 0.3s ease" }}
          />
          {/* Blue glowing irises when X-ray ON */}
          {xrayOn && (
            <>
              <circle cx="7" cy="7" r="3" fill="rgba(34,211,238,0.75)" />
              <circle cx="25" cy="7" r="3" fill="rgba(34,211,238,0.75)" />
              {/* Highlight specks */}
              <circle cx="8.5" cy="5.5" r="0.8" fill="rgba(255,255,255,0.6)" />
              <circle cx="26.5" cy="5.5" r="0.8" fill="rgba(255,255,255,0.6)" />
            </>
          )}
        </svg>

        {/* Label */}
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
  return (
    <MuseumShell>
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-6 pb-24"
        style={{ maxWidth: "28rem", margin: "0 auto" }}
      >
        {/* Canon stats */}
        <CanonStatsBar />

        {/* Big deck card: quotes (inside) + HEOHO title + Durin's Door (Speak Friend) */}
        <HEOHOCardFront />

        {/* X-ray goggles element: CSS-only (no Denken image assets; "Suppressing Mana 85%" ripple) */}
        <XRayGogglesElement />
      </div>
      <TourBanner />
    </MuseumShell>
  );
};

export default HEOHOLanding;
