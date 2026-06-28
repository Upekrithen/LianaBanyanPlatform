/**
 * WatchFable — LRH Fable slideshow (submarine door #2).
 * Route: /watch, /watch/:slide
 *
 * When inline={true} (card-back use), DeckCardShell is skipped and URL sync
 * is suppressed; the fable content renders directly into the parent container.
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { DoorCard } from "@/components/museum/DoorCard";
import { motion, AnimatePresence } from "framer-motion";

interface WatchFableProps {
  /** When true, skip DeckCardShell and URL sync (for card-back inline use). */
  inline?: boolean;
}

const FABLE_SLIDES = [
  "The Little Red Hen\nfound some seeds.",
  "She asked the Dog, the Cat, and the Pig for help.\nThey refused.",
  "So she planted, tended, harvested, and baked —\nall by herself.",
  "Now everyone wanted her bread.",
  "But she had a bigger idea.",
  "\"Then I'll feed everyone —\nand we'll build something together.\"",
  "She came to a town\nwhere people were struggling.",
  "\"I'm making soup from a stone.\nWould you like to help?\"",
  "One brought salt. One brought a potato.\nOne brought herbs. Everyone gave a little.",
  "And everyone ate well.",
  "Over the meal, a small ant asked:\n\"How did you know what to do?\"",
  "\"I was daydreaming\nin my kitchen...\"",
  "\"...and I looked out my window and saw people\nlined up for food that had been locked away.\"",
  "\"So I reached into my daydream\nand pulled out something useful.\"",
  "\"To make bread,\nyou have to plant seeds.\"",
  "But outside the city, the ants were already harvesting —\nfor grasshoppers who only watched and took.",
  "The Hen called out to the ants.\nThe grasshoppers heard, too.",
  "She told the ants what they needed to do\nto make bread for themselves.",
  "And together — ants, city folk, and the Hen —\nthey planted, kneaded, baked, and shared.",
  "The grasshoppers noticed.",
  "\"It's not about food.\nIt's about keeping these ants IN LINE.\"",
  "They came to put a stop to it.",
  "But one ant looked around and realized:\nthey outnumbered the grasshoppers 10,000 to 1.",
  "Grasshoppers need ants.\nAnts don't need grasshoppers.",
  "WE ARE THE ANTS.",
  "\"You've got the makings of greatness in you.\nYou're gonna rattle the stars, you are.\"",
  "And when she looked down...\nher basket had been refilled.",
  "Speckles from the young ones' messy eating\ntook root and grew for others to harvest.",
  "Hopper sat alone.",
  "...",
];

const WatchFable = ({ inline = false }: WatchFableProps) => {
  const navigate = useNavigate();
  const { slide: slideParam } = useParams();
  const initialSlide = slideParam ? Math.min(Math.max(0, parseInt(slideParam, 10) - 1), FABLE_SLIDES.length - 1) : 0;

  const [fableSlide, setFableSlide] = useState(initialSlide);
  const [fableEnded, setFableEnded] = useState(false);

  // Auto-advance
  useEffect(() => {
    if (fableEnded) return;
    const timer = setInterval(() => {
      setFableSlide((prev) => {
        if (prev >= FABLE_SLIDES.length - 1) {
          setFableEnded(true);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [fableEnded]);

  // Sync URL with slide (suppressed in inline/card-back mode)
  useEffect(() => {
    if (inline) return;
    const path = fableSlide === 0 ? "/watch" : `/watch/${fableSlide + 1}`;
    window.history.replaceState(null, "", path);
  }, [fableSlide, inline]);

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col"
    >
      {!fableEnded ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={fableSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="rounded-lg overflow-hidden mb-3 bg-white/95" style={{ maxWidth: "200px" }}>
                <img
                  src={`/fable/${fableSlide + 1}.png`}
                  alt={`Fable scene ${fableSlide + 1}`}
                  className="w-full h-auto"
                  style={{ display: "block" }}
                />
              </div>
              <p
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: inline ? "0.95rem" : "clamp(0.85rem, 2.2vw, 1rem)",
                  color: "#faf5eb",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  maxWidth: "280px",
                  textWrap: "balance" as any,
                }}
              >
                {FABLE_SLIDES[fableSlide]}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-full max-w-[200px] h-1 rounded-full bg-slate-800 mt-4 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500/60"
              animate={{ width: `${((fableSlide + 1) / FABLE_SLIDES.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5">{fableSlide + 1} / {FABLE_SLIDES.length}</p>

          {/* Navigation */}
          <div className="flex gap-4 mt-3">
            <button
              onClick={() => setFableSlide(Math.max(0, fableSlide - 1))}
              className={`text-xs text-slate-500 hover:text-slate-300 ${fableSlide === 0 ? "invisible" : ""}`}
            >
              ← Prev
            </button>
            <button
              onClick={() => {
                if (fableSlide >= FABLE_SLIDES.length - 1) setFableEnded(true);
                else setFableSlide(fableSlide + 1);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              Next →
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="w-full">
            <div className="flex flex-col gap-2.5 mb-4">
              <DoorCard icon="🔍" title="What is this?" subtitle="See what we built" to="/explore" accentColor="#10b981" />
              <DoorCard icon="🔨" title="I want to build" subtitle="Start making money" to="/build" accentColor="#3b82f6" delay={0.06} />
              <DoorCard icon="🤝" title="I'm ready" subtitle="Join for $5/year" to="/join" accentColor="#f59e0b" delay={0.12} />
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 transition-colors">
                ← Back
              </button>
              <button onClick={() => navigate("/explore")} className="text-slate-500 hover:text-slate-300 transition-colors">
                Not sure? Just explore →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  if (inline) return content;

  return (
    <DeckCardShell>
      {content}
    </DeckCardShell>
  );
};

export default WatchFable;
