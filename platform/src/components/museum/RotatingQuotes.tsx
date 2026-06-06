/**
 * RotatingQuotes — Page-level rotating quote component for HEOHO Landing.
 * Renders ABOVE HEOHOCardFront per BP075 5-signature canonical favorite.
 *
 * QUOTES array (23 entries — BP075 corrections applied):
 *   - "Flick" spelling fixed to "Flik" (Pixar character)
 *   - Dot entry added at index(Flik)+2 = 11, isPair: "flik-dot"
 *   - Year 1998 used for both (US theatrical release Nov 20, 1998)
 *
 * Fully controlled by parent (HEOHOLanding manages quoteIndex + timer).
 * Internal: audio play/pause state for Yvaine quote ▶/⏸ button.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const QUOTES: Array<{
  text: string;
  author: string;
  isYvaine?: boolean;
  isPair?: string;
}> = [
  {
    text: "If you aren't ashamed of version 1 of your website, you launched too late.",
    author: "Reid Hoffman, LinkedIn Co-Founder",
  },
  { text: "The time to hesitate is through.", author: "The Doors, 'Light My Fire'" },
  {
    text: "In the darkest moments, when all seems lost, remember what my Great-Aunt Yvaine, Queen of Stormhold, said: 'What do stars do? {SHINE}.'",
    author: "The Founder, Liana Banyan",
    isYvaine: true,
  },
  { text: "I am guided by a force much greater than luck.", author: "Lucas, Empire Records (1995)" },
  {
    text: "Money won't create success, the freedom to make it will.",
    author: "Nelson Mandela",
  },
  {
    text: "If the river route changes, the crocodile is obliged to follow.",
    author: "Burkinabé proverb (West Africa)",
  },
  { text: "Where does all that money come from, anyway?", author: "The Founder, Liana Banyan" },
  {
    text: "As you grow older, you will discover that you have two hands, one for helping yourself, the other for helping others.",
    author: "Audrey Hepburn",
  },
  {
    text: "If you want to go fast, go alone. If you want to go far, go together.",
    author: "West African proverb (Burkina Faso)",
  },
  // Index 9 — Flik (isPair: flik-dot) — BP075: spelling "Flik" (was "Flick")
  { text: "Pretend this is a Seed.", author: "Flik, A Bug's Life (1998)", isPair: "flik-dot" },
  // Index 10 — one quote between Flik and Dot
  {
    text: "Find the Will to Act, and the Courage to Believe.",
    author: "The Founder to himself, Liana Banyan",
  },
  // Index 11 — Dot at Flik+2 (isPair: flik-dot) — BP075: Founder-direct "making the point"
  {
    text: "Pretend this is a Seed.",
    author: "Dot, A Bug's Life (Pixar, 1998)",
    isPair: "flik-dot",
  },
  { text: "No man is an island.", author: "Jon Bon Jov... John Donne" },
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  {
    text: "You're gonna rattle the stars, you are. I hope I'm there to see it.",
    author: "Long John Silver, Treasure Planet (2002)",
  },
  {
    text: "Where are your scars? Was nothing worth fighting for?",
    author: "The Grim Reaper",
  },
  {
    text: "The secret of our success is that we never, never give up.",
    author: "Wilma Mankiller",
  },
  { text: "Believe you can, and you're halfway there.", author: "Theodore Roosevelt" },
  {
    text: "Sometimes the best way to solve your own problems is to help someone else.",
    author: "Uncle Iroh, Avatar: The Last Airbender",
  },
  {
    text: "You can get everything in life you want if you will just help enough other people get what they want.",
    author: "Zig Ziglar",
  },
  {
    text: "Let us put our minds together and see what life we can make for our children.",
    author: "Sitting Bull",
  },
  { text: "I will not offer that which costs me nothing.", author: "King David" },
  {
    text: "It ain't about how hard you hit; it's about how hard you can get hit and keep moving forward.",
    author: "Rocky Balboa",
  },
];

interface RotatingQuotesProps {
  /** Current quote index — fully controlled by parent (HEOHOLanding) */
  quoteIndex: number;
  /** Called when user clicks previous chevron */
  onPrev: () => void;
  /** Called when user clicks next chevron */
  onNext: () => void;
  /** Called when SHINE link is clicked (for F3 glow cancellation) */
  onShineClick?: () => void;
  /** Whether audio is globally muted */
  muted?: boolean;
}

export function RotatingQuotes({
  quoteIndex,
  onPrev,
  onNext,
  onShineClick,
  muted = false,
}: RotatingQuotesProps) {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pause and reset audio when rotating away from Yvaine
  useEffect(() => {
    if (!QUOTES[quoteIndex]?.isYvaine && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [quoteIndex]);

  const quote = QUOTES[quoteIndex];

  const renderQuoteText = () => {
    if (!quote?.isYvaine) return <>&ldquo;{quote.text}&rdquo;</>;

    const beforeKey = quote.text.split("'What do stars do?")[0];
    const afterShine = quote.text.split("{SHINE}")[1] ?? "";

    return (
      <>
        <span style={{ opacity: 0.75 }}>&ldquo;{beforeKey}&lsquo;What do stars do?{" "}</span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onShineClick?.();
            navigate("/yvaine");
          }}
          style={{
            color: "rgba(255,255,255,0.95)",
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "underline",
            textDecorationStyle: "dotted" as React.CSSProperties["textDecorationStyle"],
            textUnderlineOffset: "2px",
          }}
        >
          SHINE
        </span>
        <span style={{ opacity: 0.75 }}>
          &rsquo;{afterShine}&rdquo;
        </span>
        {" "}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!audioRef.current || muted) return;
            if (isPlaying) {
              audioRef.current.pause();
              setIsPlaying(false);
            } else {
              audioRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }}
          aria-label={isPlaying ? "Pause Yvaine audio" : "Play Yvaine audio"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.65rem",
            padding: "0 0.15rem",
            verticalAlign: "middle",
            lineHeight: 1,
            display: "inline",
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
      </>
    );
  };

  return (
    <>
      <div className="w-full" style={{ maxWidth: "28rem", margin: "0 auto 1rem" }}>
        <div
          className="flex items-center justify-center gap-3"
          style={{ minHeight: "90px" }}
        >
          <button
            onClick={onPrev}
            className="text-white/40 hover:text-white/70 transition-colors shrink-0 text-xl"
            aria-label="Previous quote"
          >
            ‹
          </button>

          <div className="flex-1 min-w-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: "center" }}
              >
                <p
                  className="italic"
                  style={{
                    fontFamily: "'Crimson Pro', Georgia, serif",
                    fontSize: "clamp(0.8rem, 2vw, 0.95rem)",
                    lineHeight: 1.5,
                    color: "rgba(250,245,235,0.75)",
                    textWrap: "balance" as React.CSSProperties["textWrap"],
                  }}
                >
                  {renderQuoteText()}
                </p>
                <p
                  style={{
                    marginTop: "0.375rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.7rem",
                    color: "rgba(250,245,235,0.4)",
                  }}
                >
                  — {quote.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={onNext}
            className="text-white/40 hover:text-white/70 transition-colors shrink-0 text-xl"
            aria-label="Next quote"
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}

export default RotatingQuotes;
