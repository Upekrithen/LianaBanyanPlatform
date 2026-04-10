/**
 * Cephas Basement — Always-accessible library.
 * Three depth choices (Skipping Stones / Wading In / Deep Dive).
 * Search, Guided Tour, Browse by Topic.
 *
 * Landing page renders as a DECK CARD styled as a wooden iron-bound door.
 * Sturdy and welcoming — dark wood grain, iron brackets, rivets, ring handle.
 * Wrapped in DeckCardShell for card format + ornate corners + X-Ray support.
 * Depth-selected pages stay in MuseumShell for full-bleed layout.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { useXRay } from "@/components/museum/XRayContext";
import { motion } from "framer-motion";
import { BookOpen, Search, Compass, Grid3X3, ArrowLeft, Globe, ExternalLink, Loader2 } from "lucide-react";
import { FRIEND_WORDS } from "@/data/friendWords";
import { useCephasMuseum, useCephasDepthCount } from "@/hooks/useCephasMuseum";

type Depth = "stones" | "wading" | "deep";

const depths: Array<{
  id: Depth;
  icon: string;
  label: string;
  sublabel: string;
  description: string;
  color: string;
}> = [
  {
    id: "stones",
    icon: "☕",
    label: "Skipping Stones",
    sublabel: "2-min reads",
    description: "Quick takes on big ideas. Skim the surface.",
    color: "#10b981",
  },
  {
    id: "wading",
    icon: "🏊",
    label: "Wading In",
    sublabel: "10-min articles",
    description: "Full articles that explain the system piece by piece.",
    color: "#3b82f6",
  },
  {
    id: "deep",
    icon: "🤿",
    label: "Deep Dive",
    sublabel: "Full papers",
    description: "Academic research papers with citations and data.",
    color: "#8b5cf6",
  },
];

const depthMap: Record<string, Depth> = { stones: "stones", wading: "wading", deep: "deep" };

/** Warm wood-grain SVG pattern (dark browns, subtle) */
const woodGrainBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='6'%3E%3Crect fill='%23231610' width='200' height='6'/%3E%3Crect fill='%23281a12' x='0' y='0' width='200' height='1' opacity='0.3'/%3E%3Crect fill='%231e0e08' x='0' y='2' width='200' height='1' opacity='0.2'/%3E%3Crect fill='%23301e14' x='0' y='4' width='200' height='1' opacity='0.15'/%3E%3C/svg%3E")`;

const CephasBasement = () => {
  const { depth: urlDepth } = useParams<{ depth?: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const langCode = params.get("lang");
  const langInfo = langCode ? FRIEND_WORDS.find((fw) => fw.langCode === langCode) : null;
  const showLangBanner = langCode && langCode !== "en" && langInfo;
  const [selectedDepth, setSelectedDepth] = useState<Depth | null>(
    urlDepth ? depthMap[urlDepth] || null : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: articles, isLoading, isError } = useCephasMuseum(
    selectedDepth ?? undefined,
    debouncedSearch
  );

  const { data: stonesCount } = useCephasDepthCount("stones");
  const { data: wadingCount } = useCephasDepthCount("wading");
  const { data: deepCount } = useCephasDepthCount("deep");
  const depthCounts: Record<string, number> = {
    stones: stonesCount ?? 0,
    wading: wadingCount ?? 0,
    deep: deepCount ?? 0,
  };

  const handleSelectDepth = (d: Depth) => {
    setSelectedDepth(d);
    window.history.replaceState(null, "", `/library/${d}`);
  };

  const handleBack = () => {
    setSelectedDepth(null);
    window.history.replaceState(null, "", "/library");
  };

  /* ── Depth-selected sub-page (stays MuseumShell for full bleed) ── */
  if (selectedDepth) {
    const depthInfo = depths.find((d) => d.id === selectedDepth)!;
    return (
      <MuseumShell>
        <div className="min-h-screen flex flex-col px-4 py-6 pb-24 max-w-md mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Cephas Library
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{depthInfo.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-white">{depthInfo.label}</h1>
              <p className="text-slate-400 text-sm">{depthInfo.description}</p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${depthInfo.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          {langCode && langCode !== "en" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/20 border border-blue-800/30 mb-4">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-300 text-xs">
                Content is currently English-only. Translation contributions earn Marks.
              </span>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              <span className="ml-2 text-slate-400 text-sm">Loading content...</span>
            </div>
          )}

          {isError && (
            <div className="text-center py-12">
              <p className="text-red-400 text-sm">Could not load content. Please try again.</p>
            </div>
          )}

          {!isLoading && !isError && articles?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No content found at this depth. Try a different search or depth level.</p>
            </div>
          )}

          {!isLoading && !isError && articles && articles.length > 0 && (
            <div className="space-y-3">
              {articles.map((item: any, i: number) => (
                <motion.div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-700/40 bg-[#0a1628] hover:border-slate-600 transition-all cursor-pointer group"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[0.6rem] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full"
                      style={{
                        color: depthInfo.color,
                        background: `${depthInfo.color}15`,
                        border: `1px solid ${depthInfo.color}30`,
                      }}
                    >
                      {(item.category || item.style || "article").replace(/_/g, " ")}
                    </span>
                    {item.paper_number && (
                      <span className="text-[0.6rem] text-slate-500 font-mono">#{item.paper_number}</span>
                    )}
                  </div>

                  <h3 className="text-white text-sm font-semibold leading-snug mb-1 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>

                  {(item.technical_summary || item.abstract) && (
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {item.technical_summary || item.abstract}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-slate-500 text-[0.6rem] font-mono">
                      {item.updated_at ? new Date(item.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </span>
                    <span className="text-xs font-medium" style={{ color: depthInfo.color }}>
                      Read →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </MuseumShell>
    );
  }

  /* ── Landing page — Deck Card styled as wooden iron-bound door ── */
  return (
    <DeckCardShell>
      <DoorContent
        showLangBanner={showLangBanner}
        langInfo={langInfo}
        langCode={langCode}
        onSelectDepth={handleSelectDepth}
        onNavigate={navigate}
        depthCounts={depthCounts}
      />
    </DeckCardShell>
  );
};

/** Door interior content — all the wooden door elements */
function DoorContent({
  showLangBanner,
  langInfo,
  langCode,
  onSelectDepth,
  onNavigate,
  depthCounts,
}: {
  showLangBanner: any;
  langInfo: any;
  langCode: string | null;
  onSelectDepth: (d: Depth) => void;
  onNavigate: (path: string) => void;
  depthCounts: Record<string, number>;
}) {
  const { xrayOn } = useXRay();
  const accentColor = xrayOn ? "#22d3ee" : "#c9a96e";
  const ironColor = xrayOn ? "rgba(34,211,238,0.3)" : "rgba(139,119,90,0.4)";
  const ironHighlight = xrayOn ? "rgba(34,211,238,0.15)" : "rgba(201,169,110,0.08)";
  const textColor = xrayOn ? "rgba(34,211,238,0.9)" : "#c9a96e";
  const textFaint = xrayOn ? "rgba(34,211,238,0.5)" : "rgba(201,169,110,0.5)";
  const rivetColor = xrayOn ? "rgba(34,211,238,0.25)" : "rgba(139,119,90,0.35)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col items-center justify-between text-center relative"
      style={{ overflow: "hidden" }}
    >
      {/* Wood grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: woodGrainBg,
          backgroundRepeat: "repeat",
          opacity: xrayOn ? 0.04 : 0.15,
          mixBlendMode: "overlay",
          transition: "opacity 0.5s ease",
        }}
      />

      {/* Iron band — top horizontal */}
      <div
        className="absolute top-12 left-4 right-4 pointer-events-none"
        style={{
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${ironColor}, ${ironColor}, transparent)`,
          transition: "background 0.5s ease",
        }}
      />

      {/* Iron band — bottom horizontal */}
      <div
        className="absolute bottom-12 left-4 right-4 pointer-events-none"
        style={{
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${ironColor}, ${ironColor}, transparent)`,
          transition: "background 0.5s ease",
        }}
      />

      {/* Iron rivets — top band */}
      <IronRivet style={{ position: "absolute", top: "44px", left: "20px" }} color={rivetColor} />
      <IronRivet style={{ position: "absolute", top: "44px", right: "20px" }} color={rivetColor} />

      {/* Iron rivets — bottom band */}
      <IronRivet style={{ position: "absolute", bottom: "44px", left: "20px" }} color={rivetColor} />
      <IronRivet style={{ position: "absolute", bottom: "44px", right: "20px" }} color={rivetColor} />

      {/* ── Top: Iteration badge + language banner ── */}
      <div className="w-full relative z-10 pt-1">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: textFaint,
              transition: "color 0.5s ease",
            }}
          >
            Deck Card &middot; Iteration {showLangBanner ? langInfo.langCode.toUpperCase() : "EN"}
          </span>
        </div>

        {showLangBanner && (
          <motion.div
            className="flex items-center justify-center gap-1.5 mb-2 px-3 py-1 rounded-full mx-auto w-fit"
            style={{
              background: ironHighlight,
              border: `1px solid ${ironColor}`,
              transition: "all 0.5s ease",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Globe className="w-3 h-3" style={{ color: accentColor, transition: "color 0.5s ease" }} />
            <span
              style={{
                color: accentColor,
                fontSize: "0.65rem",
                fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                transition: "color 0.5s ease",
              }}
            >
              {langInfo.nativeName}
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Center: Door ring handle + Library header ── */}
      <div className="flex flex-col items-center relative z-10">
        {/* Iron ring handle */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: `2.5px solid ${ironColor}`,
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.05)`,
            transition: "border-color 0.5s ease",
          }}
        >
          <BookOpen className="w-4 h-4" style={{ color: accentColor, transition: "color 0.5s ease" }} />
        </div>

        <h1
          style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "clamp(1.3rem, 5vw, 1.7rem)",
            fontWeight: 700,
            color: textColor,
            marginBottom: "0.25rem",
            lineHeight: 1.2,
            transition: "color 0.5s ease",
          }}
        >
          Cephas Library
        </h1>
        <p
          style={{
            color: "#faf5eb",
            fontSize: "0.8rem",
            fontWeight: 600,
            opacity: 0.9,
            marginBottom: "0.15rem",
          }}
        >
          {(depthCounts.stones + depthCounts.wading + depthCounts.deep) > 0
            ? `${depthCounts.stones + depthCounts.wading + depthCounts.deep}+ publications`
            : "455+ publications"}
        </p>
        <p
          style={{
            color: "rgba(250, 245, 235, 0.4)",
            fontSize: "0.7rem",
            fontStyle: "italic",
            letterSpacing: "0.02em",
          }}
        >
          How deep do you want to go?
        </p>
      </div>

      {/* ── Three depth rows — iron-banded planks ── */}
      <div className="w-full flex flex-col gap-2 relative z-10">
        {depths.map((d, i) => (
          <motion.button
            key={d.id}
            onClick={() => onSelectDepth(d.id)}
            className="w-full text-left rounded-lg active:scale-[0.98]"
            style={{
              padding: "0.65rem 0.85rem",
              background: ironHighlight,
              border: `1px solid ${ironColor}`,
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
            whileHover={{
              borderColor: d.color,
            }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            {/* Subtle wood grain on each plank */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: woodGrainBg,
                backgroundRepeat: "repeat",
                opacity: xrayOn ? 0.02 : 0.08,
                transition: "opacity 0.5s ease",
              }}
            />
            <div className="flex items-center gap-3 relative">
              <span className="text-xl">{d.icon}</span>
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    color: "#faf5eb",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    fontFamily: "'Crimson Pro', Georgia, serif",
                  }}
                >
                  {d.label}
                </div>
                <div style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.65rem" }}>
                  {d.sublabel}
                  {depthCounts[d.id] > 0 && (
                    <span style={{ marginLeft: "6px", color: d.color, fontWeight: 600, opacity: 0.7 }}>
                      ({depthCounts[d.id]})
                    </span>
                  )}
                </div>
              </div>
              <span style={{ color: d.color, fontSize: "0.9rem", opacity: 0.6 }}>→</span>
            </div>

            {/* Iron rivet on each plank row */}
            <IronRivet
              style={{ position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)" }}
              color={rivetColor}
              size={4}
            />
          </motion.button>
        ))}
      </div>

      {/* ── Utility links ── */}
      <div className="w-full flex flex-col gap-0.5 relative z-10">
        <CardUtilityLink icon={Search} label="Search" accentColor={textFaint} onClick={() => onSelectDepth("stones")} />
        <CardUtilityLink icon={Compass} label="Guided Tour" subtitle="252-item curated path" accentColor={textFaint} onClick={() => {}} />
        <CardUtilityLink icon={Grid3X3} label="Browse by topic" accentColor={textFaint} onClick={() => {}} />
      </div>

      {/* ── WildFire Tour CTA ── */}
      <button
        onClick={() => onNavigate("/tour")}
        className="flex items-center gap-1.5 text-xs font-medium transition-all relative z-10"
        style={{ color: "#f97316" }}
        onMouseOver={(e) => (e.currentTarget.style.textShadow = "0 0 8px rgba(249,115,22,0.4)")}
        onMouseOut={(e) => (e.currentTarget.style.textShadow = "none")}
      >
        <span>🔥</span> Take the WildFire Tour
      </button>

      {/* ── Back to Museum ── */}
      <button
        onClick={() => onNavigate("/")}
        style={{
          color: "rgba(250,245,235,0.25)",
          fontSize: "0.7rem",
          letterSpacing: "0.04em",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "color 0.2s",
          fontFamily: "'JetBrains Mono', monospace",
          position: "relative",
          zIndex: 10,
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.6)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.25)")}
      >
        ← Back to the Museum
      </button>
    </motion.div>
  );
}

/** Iron rivet — small decorative circle */
function IronRivet({
  style,
  color,
  size = 6,
}: {
  style?: React.CSSProperties;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), ${color}, rgba(0,0,0,0.2))`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 0.5px 1px rgba(255,255,255,0.1)",
        transition: "background 0.5s ease",
        ...style,
      }}
    />
  );
}

/** Compact utility link styled for inside the door card */
function CardUtilityLink({
  icon: Icon,
  label,
  subtitle,
  accentColor,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subtitle?: string;
  accentColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-md text-left"
      style={{
        padding: "0.4rem 0.6rem",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: accentColor, transition: "color 0.5s ease" }} />
      <div className="flex items-baseline gap-1.5">
        <span style={{ color: "rgba(250,245,235,0.6)", fontSize: "0.75rem" }}>{label}</span>
        {subtitle && (
          <span style={{ color: "rgba(250,245,235,0.25)", fontSize: "0.6rem" }}>{subtitle}</span>
        )}
      </div>
    </button>
  );
}

export default CephasBasement;
