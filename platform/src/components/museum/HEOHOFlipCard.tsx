/**
 * HEOHOFlipCard — Cue Deck Card flip container.
 *
 * Front face: HEOHOCardFront (quotes, HEOHO title, Enter / Watch buttons, Yvaine sequence)
 * Back face: WatchFable (canonical LRH Fable -- Founder pick, BP075)
 *
 * Flip behavior:
 *   - Clicking the card body (anywhere without a stopPropagation handler) flips front -> back.
 *   - Clicking the Watch button on the front: flips to back (WatchFable auto-advances).
 *   - Clicking "Flip Back" on the back header: returns to front.
 *   - Clicks inside the back face do NOT bubble to the flip container (navigation within
 *     WatchFable is preserved).
 *
 * BP075: WatchFable replaces FableFlipbook as the canonical card-back fable (Founder directive).
 */
import { useState, useCallback } from "react";
import { HEOHOCardFront } from "./HEOHOCardFront";
import WatchFable from "@/pages/museum/WatchFable";

interface HEOHOFlipCardProps {
  /** Passed through to HEOHOCardFront — true when the Yvaine quote is active */
  isYvaine?: boolean;
  /** Passed through — pause/resume RotatingQuotes timer during SHINE sequence */
  onYvaineSequence?: (paused: boolean) => void;
  /** Passed through — advance RotatingQuotes at t4 */
  onAdvanceQuote?: () => void;
  /** Passed through — controlled quote index from parent */
  quoteIndex?: number;
  /** Passed through — prev chevron handler */
  onPrev?: () => void;
  /** Passed through — SHINE link click handler */
  onShineClick?: () => void;
  /** Passed through — global mute state */
  muted?: boolean;
}

export function HEOHOFlipCard({
  isYvaine,
  onYvaineSequence,
  onAdvanceQuote,
  quoteIndex,
  onPrev,
  onShineClick,
  muted,
}: HEOHOFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Watch button on front: flip to back (WatchFable auto-advances on its own)
  const handleWatch = useCallback(() => {
    setIsFlipped(true);
  }, []);

  // "Flip Back" button on back header: return to front
  const handleFlipBack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
  }, []);

  // Clicking the card body (front face only) flips to back — no auto-play
  const handleCardClick = useCallback(() => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  }, [isFlipped]);

  return (
    <div
      style={{ perspective: "1200px", width: "100%", height: "100%" }}
      onClick={handleCardClick}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ─── FRONT FACE ─── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <HEOHOCardFront
            isYvaine={isYvaine}
            onYvaineSequence={onYvaineSequence}
            onAdvanceQuote={onAdvanceQuote}
            quoteIndex={quoteIndex}
            onPrev={onPrev}
            onShineClick={onShineClick}
            muted={muted}
            onWatch={handleWatch}
          />
        </div>

        {/* ─── BACK FACE ─── */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            inset: 0,
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#0a1628",
            borderRadius: "1rem",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Back header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.6rem 0.75rem 0.4rem",
              borderBottom: "1px solid rgba(250,245,235,0.08)",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleFlipBack}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(250,245,235,0.45)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.2rem 0.4rem",
                borderRadius: "4px",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.8)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.45)")}
            >
              ← Flip Back
            </button>
            <span
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "0.78rem",
                color: "rgba(250,245,235,0.45)",
                fontStyle: "italic",
                letterSpacing: "0.03em",
              }}
            >
              The LRH Fable
            </span>
            {/* Spacer to balance the back button */}
            <div style={{ width: "4.5rem" }} />
          </div>

          {/* Fable content */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0.5rem 0.25rem 0.25rem" }}>
            <WatchFable inline />
          </div>

          {/* Spacer for bottom breathing room */}
          <div style={{ height: "0.25rem", flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}

export default HEOHOFlipCard;
