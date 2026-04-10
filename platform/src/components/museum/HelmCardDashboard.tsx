/**
 * HelmCardDashboard — Desktop Frame Grid + Mobile Shuffleable Deck
 * =================================================================
 * Innovation #2236 (Crown Jewel #209). B093.
 *
 * Three display modes:
 *   1. TV Screens (Desktop default): Grid of card frames surrounding the central HEOHO card.
 *      Each frame is a slot that can hold a Deck Card. Frames start as chalk outlines and
 *      unlock progressively through Keep tier engagement.
 *   2. Movie Theater: One card fills the full display. Click any card to zoom in.
 *   3. Shuffleable Deck (Mobile default): Single card at a time, swipe left/right.
 *
 * Frame count by Keep tier:
 *   Bronze=4, Silver=6, Gold=8, Platinum=10, Diamond=12
 *
 * Category dropdown per frame: Navigation, Commerce, Governance, Social, Gaming, Tools
 */
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Reorder, type PanInfo } from "framer-motion";
import { Tv, Film, Layers, ChevronLeft, ChevronRight, X, Maximize2, GripVertical, Pin } from "lucide-react";
import "../../components/ProgressiveDiscovery.css";

/* ═══════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

export type DisplayMode = "grid" | "theater" | "deck";

export interface HelmCard {
  id: string;
  title: string;
  emoji: string;
  category: CardCategory;
  route: string;
  description: string;
  tier?: number;
  pinned?: boolean;
}

export type CardCategory =
  | "navigation"
  | "commerce"
  | "governance"
  | "social"
  | "gaming"
  | "tools";

const CATEGORY_LABELS: Record<CardCategory, string> = {
  navigation: "Navigation",
  commerce: "Commerce",
  governance: "Governance",
  social: "Social",
  gaming: "Gaming",
  tools: "Tools",
};

const CATEGORY_COLORS: Record<CardCategory, string> = {
  navigation: "#3b82f6",
  commerce: "#22c55e",
  governance: "#a855f7",
  social: "#f59e0b",
  gaming: "#ef4444",
  tools: "#6b7280",
};

/** Starter cards available to all members. More unlock with progression. */
const STARTER_CARDS: HelmCard[] = [
  { id: "archipelago", title: "Archipelago", emoji: "🏝️", category: "navigation", route: "/hexisle", description: "Explore the seven islands" },
  { id: "library", title: "Cephas Library", emoji: "📚", category: "tools", route: "/library", description: "Knowledge base & articles" },
  { id: "tour", title: "WildFire Tour", emoji: "🔥", category: "navigation", route: "/tour", description: "Guided exploration" },
  { id: "pathways", title: "Build a Path", emoji: "🛤️", category: "commerce", route: "/build", description: "Six starting pathways" },
  { id: "forge", title: "Campaign Forge", emoji: "⚒️", category: "gaming", route: "/hexisle/forge", description: "Create & join campaigns" },
  { id: "wardrobe", title: "Wardrobe", emoji: "👘", category: "gaming", route: "/hexisle/wardrobe", description: "Costumes & equipment" },
  { id: "submissions", title: "Submissions", emoji: "🏛️", category: "governance", route: "/hexisle/submissions", description: "Build & vote on worlds" },
  { id: "stewards", title: "Stewards", emoji: "🛡️", category: "governance", route: "/stewards", description: "Deck Card stewards" },
  { id: "studio", title: "Card Studio", emoji: "🎨", category: "tools", route: "/studio", description: "Design, stamp, and mint cards" },
  { id: "print", title: "Print Studio", emoji: "🖨️", category: "tools", route: "/print-studio", description: "Physical card printing" },
  { id: "producer", title: "Producer Board", emoji: "🏭", category: "commerce", route: "/producer-board", description: "Claim & fulfill print orders" },
  { id: "scroll", title: "Treasure Scroll", emoji: "📜", category: "navigation", route: "/hexisle/scroll", description: "Treasure Map overview" },
  { id: "mirror", title: "Mirror Mirror", emoji: "🪞", category: "social", route: "/mirror", description: "110+ languages" },
  { id: "enter", title: "Three Doors", emoji: "🚪", category: "navigation", route: "/enter", description: "What is this? Build. Join." },
  { id: "fable", title: "Watch the Fable", emoji: "🎬", category: "social", route: "/watch", description: "The Little Red Hen story" },
];

const STORAGE_KEY = "helm_card_layout";
const MODE_KEY = "helm_display_mode";

const CARDS_WITH_UPDATES = new Set(["forge", "submissions"]);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

interface HelmCardDashboardProps {
  /** The central hero content (HEOHO card) rendered in the middle of the grid. */
  heroContent: React.ReactNode;
  /** Keep tier (1-5). Determines max frame count. Default 1 (Bronze). */
  keepTier?: number;
}

export function HelmCardDashboard({
  heroContent,
  keepTier = 1,
}: HelmCardDashboardProps) {
  const navigate = useNavigate();
  const maxFrames = [4, 6, 8, 10, 12][Math.min(keepTier - 1, 4)];

  // Display mode
  const [mode, setMode] = useState<DisplayMode>(() => {
    const saved = localStorage.getItem(MODE_KEY);
    if (saved === "grid" || saved === "theater" || saved === "deck") return saved;
    return window.innerWidth >= 768 ? "grid" : "deck";
  });

  // Card layout (which cards are in which frame positions)
  const [cards, setCards] = useState<HelmCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* fall through */ }
    }
    return STARTER_CARDS;
  });

  // Theater mode: which card is zoomed
  const [theaterCard, setTheaterCard] = useState<HelmCard | null>(null);

  // Deck mode: current index
  const [deckIndex, setDeckIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(0);

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<CardCategory | "all">("all");

  // Persist mode
  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  // Persist layout
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  // Responsive mode switch
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && mode === "grid") {
        setMode("deck");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mode]);

  const filteredCards = categoryFilter === "all"
    ? cards.slice(0, maxFrames)
    : cards.filter((c) => c.category === categoryFilter || c.pinned).slice(0, maxFrames);

  const togglePin = useCallback((cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, pinned: !c.pinned } : c))
    );
  }, []);

  const openTheater = useCallback((card: HelmCard) => {
    setTheaterCard(card);
    setMode("theater");
  }, []);

  const closeTheater = useCallback(() => {
    setTheaterCard(null);
    setMode(window.innerWidth >= 768 ? "grid" : "deck");
  }, []);

  // Keyboard: Escape closes theater
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode === "theater") closeTheater();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, closeTheater]);

  // Deck swipe handler
  const handleDeckSwipe = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (Math.abs(info.offset.x) > 60) {
        if (info.offset.x > 0) {
          setSwipeDirection(-1);
          setDeckIndex((i) => Math.max(0, i - 1));
        } else {
          setSwipeDirection(1);
          setDeckIndex((i) => Math.min(filteredCards.length - 1, i + 1));
        }
      }
    },
    [filteredCards.length],
  );

  /* ═══════════════════════════════════════════════════════════
     MODE TOGGLE BAR
     ═══════════════════════════════════════════════════════════ */
  const ModeToggle = () => (
    <div className="flex items-center justify-center gap-1 mb-4">
      {/* TV Screens — desktop only */}
      <button
        onClick={() => setMode("grid")}
        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
          mode === "grid"
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
            : "text-slate-400 hover:text-slate-200 border border-transparent"
        }`}
        title="TV Screens — grid view"
      >
        <Tv className="w-3.5 h-3.5" />
        <span>TV Screens</span>
      </button>

      {/* Movie Theater */}
      <button
        onClick={() => setMode("theater")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
          mode === "theater"
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
            : "text-slate-400 hover:text-slate-200 border border-transparent"
        }`}
        title="Movie Theater — full display"
      >
        <Film className="w-3.5 h-3.5" />
        <span>Theater</span>
      </button>

      {/* Shuffleable Deck */}
      <button
        onClick={() => setMode("deck")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
          mode === "deck"
            ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
            : "text-slate-400 hover:text-slate-200 border border-transparent"
        }`}
        title="Shuffleable Deck — one at a time"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Deck</span>
      </button>

      {/* Category filter */}
      <select
        value={categoryFilter}
        onChange={(e) => {
          setCategoryFilter(e.target.value as CardCategory | "all");
          setDeckIndex(0);
        }}
        className="ml-2 bg-slate-800/60 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
      >
        <option value="all">All Categories</option>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     CARD FRAME — Single frame in grid or deck
     ═══════════════════════════════════════════════════════════ */
  const CardFrame = ({ card, index }: { card: HelmCard; index: number }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl cursor-pointer group relative overflow-hidden"
      style={{
        background: "#0a1628",
        border: `1px solid ${CATEGORY_COLORS[card.category]}33`,
        aspectRatio: "5/7",
      }}
      onClick={() => navigate(card.route)}
    >
      {/* Category badge */}
      <div
        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider z-10"
        style={{
          background: `${CATEGORY_COLORS[card.category]}20`,
          color: CATEGORY_COLORS[card.category],
          border: `1px solid ${CATEGORY_COLORS[card.category]}40`,
        }}
      >
        {CATEGORY_LABELS[card.category]}
      </div>

      {/* Drag handle — grid mode hover only */}
      {mode === "grid" && (
        <div
          className="absolute top-2 left-[calc(50%-8px)] opacity-0 group-hover:opacity-60 transition-opacity z-10 cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
      )}

      {/* Notification badge */}
      {CARDS_WITH_UPDATES.has(card.id) && (
        <span className="absolute top-2 right-8 w-2 h-2 rounded-full bg-rose-500 animate-pulse z-10" />
      )}

      {/* Expand button */}
      <button
        className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={(e) => { e.stopPropagation(); openTheater(card); }}
        title="Theater mode"
      >
        <Maximize2 className="w-3 h-3 text-slate-300" />
      </button>

      {/* Pin button */}
      <button
        className={`absolute bottom-2 right-2 p-1 rounded-lg transition-opacity z-10 ${
          card.pinned
            ? "opacity-100 text-amber-400"
            : "opacity-0 group-hover:opacity-60 text-slate-400"
        }`}
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={(e) => { e.stopPropagation(); togglePin(card.id); }}
        title={card.pinned ? "Unpin" : "Pin"}
      >
        <Pin className={`w-3 h-3 ${card.pinned ? "fill-current" : ""}`} />
      </button>

      {/* Card content */}
      <div className="flex flex-col items-center justify-center h-full px-3 py-4 text-center">
        <span className="text-3xl mb-2">{card.emoji}</span>
        <h3
          className="text-sm font-bold mb-1"
          style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
        >
          {card.title}
        </h3>
        <p className="text-[10px] text-slate-400 leading-relaxed">{card.description}</p>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"
        style={{
          boxShadow: `inset 0 0 30px ${CATEGORY_COLORS[card.category]}15, 0 0 20px ${CATEGORY_COLORS[card.category]}08`,
        }}
      />
    </motion.div>
  );

  /* ═══════════════════════════════════════════════════════════
     EMPTY FRAME — Chalk outline slot (locked)
     ═══════════════════════════════════════════════════════════ */
  const unusedCards = useMemo(
    () => STARTER_CARDS.filter((sc) => !filteredCards.some((fc) => fc.id === sc.id)),
    [filteredCards],
  );

  const EmptyFrame = ({ index, suggestion }: { index: number; suggestion?: HelmCard }) => (
    <div
      className="chalk-outline-slot chalk-outline-slot--locked rounded-xl"
      style={{ aspectRatio: "5/7" }}
    >
      <div className="chalk-outline-slot__dashed-border rounded-xl flex flex-col items-center justify-center">
        <span className="text-2xl mb-2 opacity-30">🔒</span>
        <p className="text-[10px] text-slate-500 text-center px-2">
          Frame {index + 1}
        </p>
        {suggestion ? (
          <p className="text-[9px] text-slate-500 mt-1 text-center px-2">
            Try: {suggestion.emoji} {suggestion.title}
          </p>
        ) : (
          <p className="text-[9px] text-slate-600 mt-1">
            Unlock with Keep progression
          </p>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     RENDER — GRID MODE (TV Screens)
     ═══════════════════════════════════════════════════════════ */
  if (mode === "grid") {
    // Desktop grid: hero card in center, card frames around it
    const totalSlots = maxFrames;
    const topRow = Math.ceil(totalSlots / 3);
    const leftCol = Math.floor((totalSlots - topRow) / 2);
    const rightCol = totalSlots - topRow - leftCol;

    return (
      <div className="min-h-screen px-4 py-6 pb-24">
        <ModeToggle />

        {/* Grid layout: cards flanking the hero */}
        <div className="max-w-6xl mx-auto">
          {/* Top row of cards — draggable via Reorder */}
          <Reorder.Group
            axis="x"
            values={filteredCards.slice(0, Math.min(topRow, 4))}
            onReorder={(reordered) => {
              setCards((prev) => {
                const rest = prev.filter((c) => !reordered.some((r) => r.id === c.id));
                return [...reordered, ...rest];
              });
            }}
            className="grid gap-3 mb-3"
            style={{ gridTemplateColumns: `repeat(${Math.min(topRow, 4)}, 1fr)` }}
          >
            {Array.from({ length: Math.min(topRow, 4) }).map((_, i) => (
              filteredCards[i] ? (
                <Reorder.Item key={filteredCards[i].id} value={filteredCards[i]}>
                  <CardFrame card={filteredCards[i]} index={i} />
                </Reorder.Item>
              ) : (
                <div key={`top-empty-${i}`}>
                  <EmptyFrame index={i} suggestion={unusedCards[i % Math.max(unusedCards.length, 1)]} />
                </div>
              )
            ))}
          </Reorder.Group>

          {/* Middle row: left cards + hero + right cards */}
          <div className="flex gap-3 items-stretch">
            {/* Left column */}
            <div className="hidden lg:flex flex-col gap-3" style={{ width: "180px", flexShrink: 0 }}>
              {Array.from({ length: leftCol }).map((_, i) => {
                const cardIdx = topRow + i;
                return (
                  <div key={`left-${i}`}>
                    {filteredCards[cardIdx] ? (
                      <CardFrame card={filteredCards[cardIdx]} index={cardIdx} />
                    ) : (
                      <EmptyFrame index={cardIdx} suggestion={unusedCards[cardIdx % Math.max(unusedCards.length, 1)]} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hero card — center */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm">{heroContent}</div>
            </div>

            {/* Right column */}
            <div className="hidden lg:flex flex-col gap-3" style={{ width: "180px", flexShrink: 0 }}>
              {Array.from({ length: rightCol }).map((_, i) => {
                const cardIdx = topRow + leftCol + i;
                return (
                  <div key={`right-${i}`}>
                    {filteredCards[cardIdx] ? (
                      <CardFrame card={filteredCards[cardIdx]} index={cardIdx} />
                    ) : (
                      <EmptyFrame index={cardIdx} suggestion={unusedCards[cardIdx % Math.max(unusedCards.length, 1)]} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom row — shows remaining cards on medium screens */}
          <div className="grid gap-3 mt-3 lg:hidden" style={{ gridTemplateColumns: `repeat(${Math.min(filteredCards.length - topRow, 4)}, 1fr)` }}>
            {filteredCards.slice(topRow).map((card, i) => (
              <CardFrame key={card.id} card={card} index={topRow + i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER — THEATER MODE (Movie Theater)
     ═══════════════════════════════════════════════════════════ */
  if (mode === "theater") {
    const activeCard = theaterCard || filteredCards[0];
    return (
      <div className="min-h-screen px-4 py-6 pb-24">
        <ModeToggle />

        <div className="max-w-lg mx-auto">
          {/* Close / back to grid */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={closeTheater}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Theater</span>
            </button>
            {activeCard && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: `${CATEGORY_COLORS[activeCard.category]}20`,
                  color: CATEGORY_COLORS[activeCard.category],
                }}
              >
                {CATEGORY_LABELS[activeCard.category]}
              </span>
            )}
          </div>

          {/* Full-size card or hero */}
          {activeCard ? (
            <motion.div
              key={activeCard.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden cursor-pointer"
              style={{
                background: "#0a1628",
                border: `1px solid ${CATEGORY_COLORS[activeCard.category]}40`,
                aspectRatio: "5/7",
                boxShadow: `0 0 60px ${CATEGORY_COLORS[activeCard.category]}10`,
              }}
              onClick={() => navigate(activeCard.route)}
            >
              <div className="flex flex-col items-center justify-center h-full px-8 py-10 text-center">
                <span className="text-6xl mb-4">{activeCard.emoji}</span>
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
                >
                  {activeCard.title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  {activeCard.description}
                </p>
                <button
                  className="mt-6 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: CATEGORY_COLORS[activeCard.category],
                    color: "#fff",
                  }}
                >
                  Open →
                </button>
              </div>
            </motion.div>
          ) : (
            heroContent
          )}

          {/* Card strip below with category-colored borders and active glow */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 px-1">
            <button
              onClick={() => { setTheaterCard(null); }}
              className={`flex-shrink-0 w-14 h-20 rounded-lg flex flex-col items-center justify-center text-center transition-all ${
                !theaterCard ? "ring-1 ring-white/30 scale-105" : "opacity-60 hover:opacity-90"
              }`}
              style={{
                background: "#0a1628",
                borderBottom: "3px solid #22c55e",
                boxShadow: !theaterCard ? "0 0 15px rgba(34,197,94,0.2)" : "none",
              }}
              title="Home"
            >
              <span className="text-lg">🏠</span>
              <span className="text-[8px] text-slate-400 mt-0.5 leading-tight">Home</span>
            </button>
            {filteredCards.map((card) => (
              <button
                key={card.id}
                onClick={() => setTheaterCard(card)}
                className={`flex-shrink-0 w-14 h-20 rounded-lg flex flex-col items-center justify-center text-center transition-all ${
                  activeCard?.id === card.id ? "ring-1 ring-white/30 scale-105" : "opacity-60 hover:opacity-90"
                }`}
                style={{
                  background: "#0a1628",
                  borderBottom: `3px solid ${CATEGORY_COLORS[card.category]}`,
                  boxShadow: activeCard?.id === card.id
                    ? `0 0 15px ${CATEGORY_COLORS[card.category]}30`
                    : "none",
                }}
                title={card.title}
              >
                <span className="text-lg">{card.emoji}</span>
                <span className="text-[8px] text-slate-400 mt-0.5 leading-tight line-clamp-1 px-1">
                  {card.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER — DECK MODE (Shuffleable Deck / Mobile default)
     ═══════════════════════════════════════════════════════════ */
  const allDeckItems: Array<HelmCard | "hero"> = ["hero", ...filteredCards];
  const currentItem = allDeckItems[deckIndex] ?? "hero";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 pb-24">
      <ModeToggle />

      {/* Deck counter */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => { setSwipeDirection(-1); setDeckIndex((i) => Math.max(0, i - 1)); }}
          disabled={deckIndex === 0}
          className="p-1.5 rounded-full bg-slate-800/60 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs text-slate-500 tabular-nums">
          {deckIndex + 1} / {allDeckItems.length}
        </span>

        <button
          onClick={() => { setSwipeDirection(1); setDeckIndex((i) => Math.min(allDeckItems.length - 1, i + 1)); }}
          disabled={deckIndex === allDeckItems.length - 1}
          className="p-1.5 rounded-full bg-slate-800/60 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Swipeable card area */}
      <div className="w-full max-w-sm relative" style={{ minHeight: "420px" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={deckIndex}
            initial={{ x: swipeDirection * 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -swipeDirection * 200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDeckSwipe}
          >
            {currentItem === "hero" ? (
              heroContent
            ) : (
              <div
                className="rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: "#0a1628",
                  border: `1px solid ${CATEGORY_COLORS[currentItem.category]}40`,
                  aspectRatio: "5/7",
                }}
                onClick={() => navigate(currentItem.route)}
              >
                {/* Category badge */}
                <div
                  className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background: `${CATEGORY_COLORS[currentItem.category]}20`,
                    color: CATEGORY_COLORS[currentItem.category],
                    border: `1px solid ${CATEGORY_COLORS[currentItem.category]}40`,
                  }}
                >
                  {CATEGORY_LABELS[currentItem.category]}
                </div>

                <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center">
                  <span className="text-5xl mb-3">{currentItem.emoji}</span>
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
                  >
                    {currentItem.title}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{currentItem.description}</p>
                  <button
                    className="mt-5 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: CATEGORY_COLORS[currentItem.category],
                      color: "#fff",
                    }}
                  >
                    Open →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex gap-1.5 mt-4">
        {allDeckItems.map((item, i) => (
          <button
            key={i}
            onClick={() => { setSwipeDirection(i > deckIndex ? 1 : -1); setDeckIndex(i); }}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background:
                i === deckIndex
                  ? item === "hero"
                    ? "#38a169"
                    : CATEGORY_COLORS[(item as HelmCard).category]
                  : "rgba(255,255,255,0.15)",
              transform: i === deckIndex ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default HelmCardDashboard;
