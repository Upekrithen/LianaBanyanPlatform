/**
 * HEOHOCardFront — The Museum's hero card FRONT face.
 *
 * Rotating quotes, Yvaine SHINE sequence, HEOHO title with keyhole,
 * "Speak Friend" input, Enter/Watch buttons.
 *
 * All back-face content has been extracted to submarine door pages:
 *   /enter, /watch, /why-no-ads, /why-no-vc, /mirror, /yvaine
 * Buttons navigate to routes — URL IS the state.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useXRay } from "./XRayContext";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES: Array<{ text: string; author: string; isYvaine?: boolean }> = [
  { text: "If you aren't ashamed of version 1 of your website, you launched too late.", author: "Reid Hoffman, LinkedIn Co-Founder" },
  { text: "The time to hesitate is through.", author: "The Doors, 'Light My Fire'" },
  { text: "In the darkest moments, when all seems lost, remember what my Great-Aunt Yvaine, Queen of Stormhold, said: 'What do stars do? {SHINE}.'", author: "The Founder, Liana Banyan", isYvaine: true },
  { text: "I am guided by a force much greater than luck.", author: "Lucas, Empire Records (1995)" },
  { text: "Money won't create success, the freedom to make it will.", author: "Nelson Mandela" },
  { text: "If the river route changes, the crocodile is obliged to follow.", author: "Burkinabé proverb (West Africa)" },
  { text: "Where does all that money come from, anyway?", author: "The Founder, Liana Banyan" },
  { text: "As you grow older, you will discover that you have two hands, one for helping yourself, the other for helping others.", author: "Audrey Hepburn" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "West African proverb (Burkina Faso)" },
  { text: "Pretend this is a seed.", author: "Flick, A Bug's Life (1998)" },
  { text: "Find the Will to Act, and the Courage to Believe.", author: "The Founder to himself, Liana Banyan" },
  { text: "No man is an island.", author: "Jon Bon Jov... John Donne" },
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { text: "You're gonna rattle the stars, you are. I hope I'm there to see it.", author: "Long John Silver, Treasure Planet (2002)" },
  { text: "Where are your scars? Was nothing worth fighting for?", author: "The Grim Reaper" },
  { text: "The secret of our success is that we never, never give up.", author: "Wilma Mankiller" },
  { text: "Believe you can, and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Sometimes the best way to solve your own problems is to help someone else.", author: "Uncle Iroh, Avatar: The Last Airbender" },
  { text: "You can get everything in life you want if you will just help enough other people get what they want.", author: "Zig Ziglar" },
  { text: "Let us put our minds together and see what life we can make for our children.", author: "Sitting Bull" },
  { text: "I will not offer that which costs me nothing.", author: "King David" },
  { text: "It ain't about how hard you hit; it's about how hard you can get hit and keep moving forward.", author: "Rocky Balboa" },
];

const FRIEND_WORDS: Record<string, string> = {
  friend: "English", amigo: "Español", ami: "Français", freund: "Deutsch",
  "朋友": "中文", "友達": "日本語", tomodachi: "日本語", amico: "Italiano",
  "друг": "Русский", "친구": "한국어", chingu: "한국어", rafiki: "Kiswahili",
  vriend: "Nederlands", przyjaciel: "Polski", arkadas: "Türkçe", kawan: "Bahasa",
  kaibigan: "Filipino", mellon: "Sindarin (Elvish)", jup: "Klingon",
  raqiros: "High Valyrian", amicus: "Latin", amiko: "Esperanto",
  vän: "Svenska", ven: "Dansk/Norsk", ban: "Tiếng Việt",
  dost: "हिंदी", mitra: "हिंदी", sadiq: "العربية",
};

const hexBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
const cardBg = "#0a1628";

type ShinePhase = "idle" | "darkening" | "glowing" | "whiteout" | "starfall" | "keyhole-linger" | "done";

export function HEOHOCardFront() {
  const navigate = useNavigate();
  const { xrayOn } = useXRay();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Yvaine sequence
  const [shinePhase, setShinePhase] = useState<ShinePhase>("idle");
  const [shineGlow, setShineGlow] = useState(0);
  const [fadeToBlack, setFadeToBlack] = useState(0);
  const [whiteout, setWhiteout] = useState(0);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [keyholeVisible, setKeyholeVisible] = useState(false);
  const [keyholeHovered, setKeyholeHovered] = useState(false);
  const [keyholeActive, setKeyholeActive] = useState(false);
  const [friendInput, setFriendInput] = useState(false);
  const [friendText, setFriendText] = useState("");
  const [friendMatch, setFriendMatch] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  // Quote rotation
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [paused]);

  // Yvaine SHINE sequence
  const shineTriggeredRef = useRef(false);

  useEffect(() => {
    const quote = QUOTES[quoteIndex];
    if (!quote?.isYvaine) return;
    if (shineTriggeredRef.current) return;
    shineTriggeredRef.current = true;

    setPaused(true);
    let glowInterval: ReturnType<typeof setInterval>;

    const t0 = setTimeout(() => {
      setShinePhase("darkening");
      const dStart = Date.now();
      const dInterval = setInterval(() => {
        const e = (Date.now() - dStart) / 2000;
        setFadeToBlack(Math.min(e, 1));
        if (e >= 1) clearInterval(dInterval);
      }, 30);
      timerRef.current.push(dInterval as unknown as ReturnType<typeof setTimeout>);
    }, 4000);

    const t0b = setTimeout(() => {
      setShinePhase("glowing");
      setShineGlow(0.3);
      const start = Date.now();
      glowInterval = setInterval(() => {
        const elapsed = (Date.now() - start) / 2000;
        setShineGlow(Math.min(0.3 + elapsed * 0.7, 1));
        if (elapsed >= 1) clearInterval(glowInterval);
      }, 50);
    }, 6000);

    const t1 = setTimeout(() => {
      if (glowInterval) clearInterval(glowInterval);
      setShinePhase("whiteout");
      setShineGlow(1);
      setFadeToBlack(0);
      const wStart = Date.now();
      const wInterval = setInterval(() => {
        const e = (Date.now() - wStart) / 1200;
        setWhiteout(Math.min(e, 1));
        if (e >= 1) clearInterval(wInterval);
      }, 30);
      timerRef.current.push(wInterval as unknown as ReturnType<typeof setTimeout>);
    }, 8000);

    const t2 = setTimeout(() => {
      setShinePhase("starfall");
      setStars(Array.from({ length: 20 }, (_, i) => ({
        id: i, x: Math.random() * 100, y: Math.random() * 30 - 10, delay: Math.random() * 1.5,
      })));
      const fStart = Date.now();
      const fInterval = setInterval(() => {
        const e = 1 - (Date.now() - fStart) / 1500;
        setWhiteout(Math.max(e, 0));
        if (e <= 0) clearInterval(fInterval);
      }, 30);
      timerRef.current.push(fInterval as unknown as ReturnType<typeof setTimeout>);
    }, 9500);

    const t3 = setTimeout(() => { setShinePhase("keyhole-linger"); setKeyholeVisible(true); }, 11500);

    const t4 = setTimeout(() => {
      setShinePhase("done");
      setKeyholeActive(true);
      setStars([]);
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
      setPaused(false);
    }, 13000);

    return () => {
      if (glowInterval) clearInterval(glowInterval);
      clearTimeout(t0); clearTimeout(t0b); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      clearTimers();
    };
  }, [quoteIndex, clearTimers]);

  // Friend word check → navigate to /mirror
  useEffect(() => {
    const lower = friendText.toLowerCase().trim();
    if (lower.length > 0 && FRIEND_WORDS[lower]) {
      setFriendMatch(FRIEND_WORDS[lower]);
      const t = setTimeout(() => navigate("/mirror"), 800);
      return () => clearTimeout(t);
    } else {
      setFriendMatch(null);
    }
  }, [friendText, navigate]);

  useEffect(() => {
    if (friendInput && inputRef.current) inputRef.current.focus();
  }, [friendInput]);

  const quote = QUOTES[quoteIndex];
  const isDarkening = fadeToBlack > 0;
  const fadedOpacity = Math.max(0.75 - fadeToBlack * 0.75, 0);
  const keyPhraseOpacity = Math.max(0.75, 1 - fadeToBlack * 0.1);

  const renderQuoteText = () => {
    if (!quote?.isYvaine) return <>&ldquo;{quote.text}&rdquo;</>;
    const beforeKey = quote.text.split("'What do stars do?")[0];
    const afterShine = quote.text.split("{SHINE}")[1];
    return (
      <>
        <span style={{ opacity: isDarkening ? fadedOpacity : 0.75, transition: "opacity 0.1s ease" }}>
          &ldquo;{beforeKey}&lsquo;
        </span>
        <span style={{ opacity: keyPhraseOpacity, transition: "opacity 0.1s ease" }}>
          What do stars do?{" "}
          <span
            onClick={(e) => { e.stopPropagation(); navigate("/yvaine"); }}
            style={{
              color: `rgba(255,255,255,${0.75 + shineGlow * 0.25})`,
              textShadow: shineGlow > 0 ? `0 0 ${8 + shineGlow * 40}px rgba(255,255,255,${shineGlow}), 0 0 ${20 + shineGlow * 80}px rgba(255,255,255,${shineGlow * 0.6})` : "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >SHINE</span>
          .
        </span>
        <span style={{ opacity: isDarkening ? fadedOpacity : 0.75, transition: "opacity 0.1s ease" }}>
          &rsquo;{afterShine}&rdquo;
        </span>
      </>
    );
  };

  const keyholeShown = keyholeVisible || keyholeActive;
  const isLingerPhase = shinePhase === "keyhole-linger";
  const keyholeColor = keyholeHovered ? "#d69e2e" : isLingerPhase ? "rgba(255,255,255,0.9)" : "#0a1628";

  const resetShine = () => {
    shineTriggeredRef.current = false;
    setShinePhase("idle"); setShineGlow(0); setFadeToBlack(0); setWhiteout(0); setStars([]);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <motion.div
        className="rounded-2xl overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ background: cardBg, aspectRatio: "5/7" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: hexBg, backgroundRepeat: "repeat", opacity: 0.03 }} />

        {/* Whiteout overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl z-20" style={{ background: "#fff", opacity: whiteout * 0.85 }} />

        {/* Falling stars */}
        {stars.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl">
            {stars.map((s) => (
              <motion.div key={s.id} className="absolute"
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: "2px", height: "12px", background: "linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)", borderRadius: "1px" }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0.8, 0], y: [0, 150, 300, 500] }}
                transition={{ duration: 2, delay: s.delay, ease: "easeIn" }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-5 pb-5" style={{ aspectRatio: "5/7" }}>
          {/* Rotating quotes */}
          <div className="w-full mb-3 flex items-center justify-center gap-3" style={{ height: "90px" }}>
            <button
              onClick={(e) => { e.stopPropagation(); resetShine(); setQuoteIndex((prev) => (prev - 1 + QUOTES.length) % QUOTES.length); }}
              className="text-white/40 hover:text-white/70 transition-colors shrink-0 text-xl"
              aria-label="Previous quote"
            >‹</button>
            <div className="flex-1 min-w-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div key={quoteIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5 }}>
                  <p className="italic" style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "clamp(0.8rem, 2vw, 0.95rem)", lineHeight: 1.5, color: "rgba(255,255,255,0.75)", textWrap: "balance" as any }}>
                    {renderQuoteText()}
                  </p>
                  <p className="mt-1.5 text-xs text-white/40" style={{ opacity: isDarkening ? fadedOpacity / 0.75 : 1, transition: "opacity 0.1s ease" }}>— {quote.author}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); resetShine(); setQuoteIndex((prev) => (prev + 1) % QUOTES.length); }}
              className="text-white/40 hover:text-white/70 transition-colors shrink-0 text-xl"
              aria-label="Next quote"
            >›</button>
          </div>

          {/* Below-quote content fades during Yvaine */}
          <div className="flex-1 flex flex-col items-center" style={{ opacity: isDarkening ? Math.max(1 - fadeToBlack, 0) : 1, transition: "opacity 0.1s ease" }}>

            {/* NO ADS · COOPERATIVE COMMERCE · NO V.C. */}
            {!friendInput && (
              <>
                <div className="flex items-center justify-center gap-2 flex-wrap"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(0.55rem, 2vw, 0.7rem)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  <span
                    onClick={(e) => { e.stopPropagation(); navigate("/why-no-ads"); }}
                    style={{ color: "rgba(250, 245, 235, 0.5)", cursor: "pointer", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#faf5eb")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250, 245, 235, 0.5)")}
                  >No Ads</span>
                  <span style={{ color: "rgba(250, 245, 235, 0.25)" }}>&middot;</span>
                  <span style={{ color: "#d69e2e" }}>COOPERATIVE COMMERCE</span>
                  <span style={{ color: "rgba(250, 245, 235, 0.25)" }}>&middot;</span>
                  <span
                    onClick={(e) => { e.stopPropagation(); navigate("/why-no-vc"); }}
                    style={{ color: "rgba(250, 245, 235, 0.5)", cursor: "pointer", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#faf5eb")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250, 245, 235, 0.5)")}
                  >No V.C.</span>
                </div>
                <div className="flex-1" />
              </>
            )}

            {/* HELP EACH OTHER HELP OURSELVES */}
            <h1 style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "clamp(1.6rem, 7vw, 2.6rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.5rem", position: "relative" }}>
              <span style={{ color: "#faf5eb", display: "block" }}>Help Each Other</span>

              {/* Speak Friend input */}
              <AnimatePresence>
                {friendInput && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="my-3 mx-auto p-3 rounded-xl" style={{ background: "rgba(20, 18, 30, 0.98)", border: "1px solid rgba(139, 92, 246, 0.5)", maxWidth: "280px" }}>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(250,245,235,0.7)", letterSpacing: "0.05em", marginBottom: "0.5rem", fontStyle: "normal", fontWeight: 400 }}>
                        Speak "Friend" in Your Language
                      </p>
                      <input ref={inputRef} type="text" value={friendText} onChange={(e) => setFriendText(e.target.value)}
                        placeholder="friend, ami, 朋友, mellon..."
                        style={{ width: "100%", background: "rgba(139, 92, 246, 0.15)", border: "1px solid rgba(139, 92, 246, 0.4)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#faf5eb", fontSize: "0.85rem", fontFamily: "inherit", fontStyle: "normal", fontWeight: 400, outline: "none" }}
                      />
                      {friendMatch && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#38a169", marginTop: "0.4rem", fontStyle: "normal", fontWeight: 400 }}>
                          ✓ {friendMatch} — welcome, friend.
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Help Ourselves with keyhole */}
              <span style={{ color: "#38a169", display: "block" }}>
                Help{" "}
                <span style={{ position: "relative", display: "inline" }}>
                  <span style={{ position: "relative", display: "inline-block", cursor: keyholeShown ? "pointer" : "default" }}
                    onClick={(e) => { if (!keyholeShown) return; e.stopPropagation(); setFriendInput(true); }}
                    onMouseEnter={() => keyholeShown && setKeyholeHovered(true)}
                    onMouseLeave={() => setKeyholeHovered(false)}
                    title={keyholeShown ? "Speak Friend and Enter" : undefined}
                  >
                    <span style={{ position: "relative", display: "inline-block", isolation: "isolate", ...(keyholeShown ? { WebkitTextStroke: "2px #0a1628", paintOrder: "stroke fill" } : {}) }}>
                      O
                      {keyholeShown && (
                        <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}>
                          <ellipse cx="50" cy="50" rx="36" ry="38" fill="#0a1628" />
                          <circle cx="50.5" cy="50" r="8" fill={keyholeColor} style={{ transition: "fill 0.4s ease" }} />
                          <polygon points="46.75,55 41.5,73 59.5,73 54.25,55" fill={keyholeColor} style={{ transition: "fill 0.4s ease" }} />
                        </svg>
                      )}
                    </span>
                  </span>
                  urselves
                </span>
                {/* Star beam lingers over keyhole O */}
                {isLingerPhase && (
                  <motion.div className="absolute" style={{ left: "41%", top: "5px", width: "3px", height: "140px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), rgba(214,158,46,0.6), transparent)", transform: "translateX(-50%)", pointerEvents: "none" }}
                    initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 2.5, times: [0, 0.2, 0.7, 1] }}
                  />
                )}
              </span>
            </h1>

            {/* LIANA BANYAN */}
            <div className="text-xs tracking-[0.3em] uppercase mt-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ color: "#faf5eb" }}>Liana </span>
              <span style={{ color: "#38a169" }}>Banyan</span>
            </div>

            {/* Taglines + buttons */}
            {!friendInput && (
              <>
                <div className="flex-1" />
                <p style={{ fontSize: "clamp(0.85rem, 2.2vw, 1rem)", color: "#faf5eb", fontWeight: 600, lineHeight: 1.7 }}>
                  Own your Work. Member-Governed.
                </p>
                <p style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)", color: "rgba(250, 245, 235, 0.6)", lineHeight: 1.7, marginTop: "0.25rem" }}>
                  A working platform, not a brochure.
                </p>
                <p style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)", color: "rgba(250, 245, 235, 0.6)", lineHeight: 1.7, marginTop: "0.5rem" }}>
                  Your ideas/services/products
                </p>
                <p style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)", color: "rgba(250, 245, 235, 0.6)", lineHeight: 1.7 }}>
                  Preorder-Funded &amp; Made by Members
                </p>
                <div className="flex-1" />
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate("/enter"); }}
                    className="py-2.5 px-6 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: "#38a169", color: "#fff" }}
                  >
                    Enter
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate("/watch"); }}
                    className="py-2.5 px-6 rounded-lg text-sm font-medium transition-colors border"
                    style={{ borderColor: "rgba(250,245,235,0.3)", color: "rgba(250,245,235,0.7)" }}
                  >
                    Watch
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Corner art */}
        <CornerArt xrayOn={xrayOn} />
      </motion.div>
    </div>
  );
}

/** CornerArt — LB filigree with Frame Lock keyholes */
function CornerArt({ xrayOn }: { xrayOn: boolean }) {
  const corners: Array<{
    pos: string;
    rotate: string;
    level: number;
    shape: "circle" | "square" | "triangle";
  }> = [
    { pos: "top-2 left-2", rotate: "0", level: 1, shape: "circle" },
    { pos: "top-2 right-2", rotate: "90", level: 2, shape: "square" },
    { pos: "bottom-2 left-2", rotate: "270", level: 3, shape: "triangle" },
    { pos: "bottom-2 right-2", rotate: "180", level: 4, shape: "circle" },
  ];

  return (
    <>
      {corners.map((c) => (
        <div
          key={c.pos}
          className={`absolute ${c.pos} pointer-events-auto`}
          style={{ width: "36px", height: "36px", cursor: `url('/cursors/key-${c.level}.png') 4 0, pointer` }}
          title={`Frame Lock — Level ${c.level}`}
        >
          <svg viewBox="0 0 60 60" style={{ width: "100%", height: "100%", transform: `rotate(${c.rotate}deg)`, opacity: xrayOn ? 0.7 : 0.25, transition: "opacity 0.5s ease" }}>
            <path d="M2 2 C2 2, 2 20, 8 28 C12 33, 18 35, 28 35 M2 2 C2 2, 20 2, 28 8 C33 12, 35 18, 35 28" fill="none" stroke="#38a169" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M6 6 C6 6, 6 14, 10 18 C13 21, 16 22, 22 22 M6 6 C6 6, 14 6, 18 10 C21 13, 22 16, 22 22" fill="none" stroke="#38a169" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <text x="10" y="16" fill="#38a169" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="700" opacity="0.5">LB</text>
            {c.shape === "circle" && <circle cx="22" cy="22" r="3" fill={xrayOn ? "rgba(214,158,46,0.3)" : "none"} stroke={xrayOn ? "#d69e2e" : "#0a1628"} strokeWidth="1" opacity="0.8" style={{ transition: "all 0.5s ease" }} />}
            {c.shape === "square" && <rect x="19" y="19" width="6" height="6" fill={xrayOn ? "rgba(214,158,46,0.3)" : "none"} stroke={xrayOn ? "#d69e2e" : "#0a1628"} strokeWidth="1" opacity="0.8" style={{ transition: "all 0.5s ease" }} />}
            {c.shape === "triangle" && <polygon points="22,18 18.5,25 25.5,25" fill={xrayOn ? "rgba(214,158,46,0.3)" : "none"} stroke={xrayOn ? "#d69e2e" : "#0a1628"} strokeWidth="1" opacity="0.8" style={{ transition: "all 0.5s ease" }} />}
          </svg>
        </div>
      ))}
    </>
  );
}

export default HEOHOCardFront;
