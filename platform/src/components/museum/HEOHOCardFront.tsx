/**
 * HEOHOCardFront — The Museum's hero card FRONT face.
 *
 * Yvaine SHINE visual sequence, HEOHO title with Durin's Door keyhole,
 * "Speak Friend" input, Enter/Watch buttons.
 * Ornate corner art with Frame Lock keyholes.
 * X-Ray thermal scan effects on card body.
 *
 * BP075: Quotes lifted to RotatingQuotes component above the card.
 * Props carry Yvaine sequence signals in/out to HEOHOLanding:
 *   - isYvaine: triggers the SHINE visual sequence
 *   - onYvaineSequence: pause/resume the RotatingQuotes timer
 *   - onAdvanceQuote: advance to next quote at t4
 *
 * BP075 fixes:
 *   F4 — keyholeColor persists GOLD when keyholeActive (not only on hover)
 *   F5 — input placeholder changed to "Speak Friend, and Enter"
 *
 * All back-face content has been extracted to submarine door pages:
 *   /enter, /watch, /why-no-ads, /why-no-vc, /mirror, /yvaine
 * Buttons navigate to routes — URL IS the state.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useXRay } from "./XRayContext";
import { motion, AnimatePresence } from "framer-motion";

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

interface HEOHOCardFrontProps {
  /** Whether the Yvaine quote is currently active in RotatingQuotes */
  isYvaine?: boolean;
  /** Called to pause/resume the RotatingQuotes timer during SHINE sequence */
  onYvaineSequence?: (paused: boolean) => void;
  /** Called at t4 to advance RotatingQuotes to the next quote */
  onAdvanceQuote?: () => void;
}

export function HEOHOCardFront({
  isYvaine = false,
  onYvaineSequence,
  onAdvanceQuote,
}: HEOHOCardFrontProps) {
  const navigate = useNavigate();
  const { xrayOn } = useXRay();

  // Yvaine SHINE visual sequence state
  const [shinePhase, setShinePhase] = useState<ShinePhase>("idle");
  const [shineGlow, setShineGlow] = useState(0);
  const [fadeToBlack, setFadeToBlack] = useState(0);
  const [whiteout, setWhiteout] = useState(0);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [keyholeVisible, setKeyholeVisible] = useState(false);
  const [keyholeHovered, setKeyholeHovered] = useState(false);
  const [keyholeActive, setKeyholeActive] = useState(false);

  // Durin's Door state
  const [friendInput, setFriendInput] = useState(false);
  const [friendText, setFriendText] = useState("");
  const [friendMatch, setFriendMatch] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const shineTriggeredRef = useRef(false);

  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  const resetShine = useCallback(() => {
    shineTriggeredRef.current = false;
    setShinePhase("idle");
    setShineGlow(0);
    setFadeToBlack(0);
    setWhiteout(0);
    setStars([]);
  }, []);

  // X-Ray aware colors
  const accentColor = xrayOn ? "#22d3ee" : "#38a169";
  const accentColorFaded = xrayOn ? "rgba(34,211,238,0.5)" : "rgba(250, 245, 235, 0.5)";

  // Reset SHINE visual state when rotating away from Yvaine quote
  useEffect(() => {
    if (!isYvaine) {
      resetShine();
      clearTimers();
    }
  }, [isYvaine, resetShine, clearTimers]);

  // Yvaine SHINE sequence — triggered when isYvaine prop becomes true
  useEffect(() => {
    if (!isYvaine) return;
    if (shineTriggeredRef.current) return;
    shineTriggeredRef.current = true;

    onYvaineSequence?.(true); // pause RotatingQuotes timer

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
      setStars(
        Array.from({ length: 20 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 30 - 10,
          delay: Math.random() * 1.5,
        }))
      );
      const fStart = Date.now();
      const fInterval = setInterval(() => {
        const e = 1 - (Date.now() - fStart) / 1500;
        setWhiteout(Math.max(e, 0));
        if (e <= 0) clearInterval(fInterval);
      }, 30);
      timerRef.current.push(fInterval as unknown as ReturnType<typeof setTimeout>);
    }, 9500);

    const t3 = setTimeout(() => {
      setShinePhase("keyhole-linger");
      setKeyholeVisible(true);
    }, 11500);

    const t4 = setTimeout(() => {
      setShinePhase("done");
      setKeyholeActive(true);
      setStars([]);
      onAdvanceQuote?.();          // advance RotatingQuotes to next quote
      onYvaineSequence?.(false);   // resume RotatingQuotes timer
    }, 13000);

    return () => {
      if (glowInterval) clearInterval(glowInterval);
      clearTimeout(t0);
      clearTimeout(t0b);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimers();
    };
  }, [isYvaine, onYvaineSequence, onAdvanceQuote, clearTimers]);

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

  const isDarkening = fadeToBlack > 0;
  const keyholeShown = keyholeVisible || keyholeActive;
  const isLingerPhase = shinePhase === "keyhole-linger";

  // F4: keyhole persists GOLD after keyholeActive=true (not only on hover)
  const keyholeColor =
    keyholeHovered || keyholeActive
      ? "#d69e2e"
      : isLingerPhase
      ? "rgba(255,255,255,0.9)"
      : "#0a1628";

  // shineGlow retained for future inline use if needed
  void shineGlow;

  return (
    <div className="w-full mx-auto" data-heoho-card>
      <motion.div
        className="rounded-2xl overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: cardBg,
          aspectRatio: "5/7",
          border: xrayOn
            ? "1px solid rgba(34, 211, 238, 0.25)"
            : "1px solid transparent",
          boxShadow: xrayOn
            ? "0 0 24px rgba(34, 211, 238, 0.08), inset 0 0 40px rgba(34, 211, 238, 0.03)"
            : "none",
          transition: "border-color 0.5s ease, box-shadow 0.5s ease",
        }}
      >
        {/* Hex pattern — brightens in X-Ray */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: hexBg,
            backgroundRepeat: "repeat",
            opacity: xrayOn ? 0.10 : 0.03,
            transition: "opacity 0.5s ease",
          }}
        />

        {/* X-Ray scan-line overlay */}
        {xrayOn && (
          <div
            className="absolute inset-0 pointer-events-none z-[15]"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34,211,238,0.015) 3px, rgba(34,211,238,0.015) 4px)",
            }}
          />
        )}

        {/* Whiteout overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl z-20"
          style={{ background: "#fff", opacity: whiteout * 0.85 }}
        />

        {/* Falling stars */}
        {stars.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl">
            {stars.map((s) => (
              <motion.div
                key={s.id}
                className="absolute"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: "2px",
                  height: "12px",
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)",
                  borderRadius: "1px",
                }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0.8, 0], y: [0, 150, 300, 500] }}
                transition={{ duration: 2, delay: s.delay, ease: "easeIn" }}
              />
            ))}
          </div>
        )}

        <div
          className="relative z-10 flex flex-col items-center text-center px-6 pt-5 pb-5"
          style={{ aspectRatio: "5/7" }}
        >
          {/* Card body fades during Yvaine darkening */}
          <div
            className="flex-1 flex flex-col items-center"
            style={{
              opacity: isDarkening ? Math.max(1 - fadeToBlack, 0) : 1,
              transition: "opacity 0.1s ease",
            }}
          >
            {/* NO ADS · COOPERATIVE COMMERCE · NO V.C. */}
            {!friendInput && (
              <>
                <div
                  className="flex items-center justify-center gap-2 flex-wrap"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "clamp(0.55rem, 2vw, 0.7rem)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    onClick={(e) => { e.stopPropagation(); navigate("/why-no-ads"); }}
                    style={{ color: accentColorFaded, cursor: "pointer", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#faf5eb")}
                    onMouseOut={(e) => (e.currentTarget.style.color = accentColorFaded)}
                  >
                    No Ads
                  </span>
                  <span style={{ color: "rgba(250, 245, 235, 0.25)" }}>&middot;</span>
                  <span style={{ color: "#d69e2e", transition: "color 0.5s ease" }}>
                    COOPERATIVE COMMERCE
                  </span>
                  <span style={{ color: "rgba(250, 245, 235, 0.25)" }}>&middot;</span>
                  <span
                    onClick={(e) => { e.stopPropagation(); navigate("/why-no-vc"); }}
                    style={{ color: accentColorFaded, cursor: "pointer", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#faf5eb")}
                    onMouseOut={(e) => (e.currentTarget.style.color = accentColorFaded)}
                  >
                    No V.C.
                  </span>
                </div>
                <div className="flex-1" />
              </>
            )}

            {/* HELP EACH OTHER / HELP OURSELVES */}
            <h1
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "clamp(1.6rem, 7vw, 2.6rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: "0.5rem",
                position: "relative",
              }}
            >
              <span style={{ color: "#faf5eb", display: "block" }}>Help Each Other</span>

              {/* Speak Friend input — F5: placeholder "Speak Friend, and Enter" */}
              <AnimatePresence>
                {friendInput && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="my-3 mx-auto p-3 rounded-xl"
                      style={{
                        background: "rgba(20, 18, 30, 0.98)",
                        border: "1px solid rgba(139, 92, 246, 0.5)",
                        maxWidth: "280px",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.7rem",
                          color: "rgba(250,245,235,0.7)",
                          letterSpacing: "0.05em",
                          marginBottom: "0.5rem",
                          fontStyle: "normal",
                          fontWeight: 400,
                        }}
                      >
                        Speak "Friend" in Your Language
                      </p>
                      <input
                        ref={inputRef}
                        type="text"
                        value={friendText}
                        onChange={(e) => setFriendText(e.target.value)}
                        placeholder="Speak Friend, and Enter"
                        style={{
                          width: "100%",
                          background: "rgba(139, 92, 246, 0.15)",
                          border: "1px solid rgba(139, 92, 246, 0.4)",
                          borderRadius: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          color: "#faf5eb",
                          fontSize: "0.85rem",
                          fontFamily: "inherit",
                          fontStyle: "normal",
                          fontWeight: 400,
                          outline: "none",
                        }}
                      />
                      {friendMatch && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.65rem",
                            color: accentColor,
                            marginTop: "0.4rem",
                            fontStyle: "normal",
                            fontWeight: 400,
                            transition: "color 0.5s ease",
                          }}
                        >
                          ✓ {friendMatch} — welcome, friend.
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Help Ourselves with Durin's Door keyhole in the O */}
              <span style={{ color: accentColor, display: "block", transition: "color 0.5s ease" }}>
                Help{" "}
                <span style={{ position: "relative", display: "inline" }}>
                  <span
                    style={{
                      position: "relative",
                      display: "inline-block",
                      cursor: keyholeShown ? "pointer" : "default",
                    }}
                    onClick={(e) => {
                      if (!keyholeShown) return;
                      e.stopPropagation();
                      setFriendInput(true);
                    }}
                    onMouseEnter={() => keyholeShown && setKeyholeHovered(true)}
                    onMouseLeave={() => setKeyholeHovered(false)}
                    title={keyholeShown ? "Speak Friend and Enter" : undefined}
                  >
                    <span
                      style={{
                        position: "relative",
                        display: "inline-block",
                        isolation: "isolate",
                        ...(keyholeShown
                          ? { WebkitTextStroke: "2px #0a1628", paintOrder: "stroke fill" }
                          : {}),
                      }}
                    >
                      O
                      {keyholeShown && (
                        <svg
                          viewBox="0 0 100 100"
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                            zIndex: -1,
                          }}
                        >
                          <ellipse cx="50" cy="50" rx="36" ry="38" fill="#0a1628" />
                          <circle
                            cx="50.5"
                            cy="50"
                            r="8"
                            fill={keyholeColor}
                            style={{ transition: "fill 0.4s ease" }}
                          />
                          <polygon
                            points="46.75,55 41.5,73 59.5,73 54.25,55"
                            fill={keyholeColor}
                            style={{ transition: "fill 0.4s ease" }}
                          />
                        </svg>
                      )}
                    </span>
                  </span>
                  urselves
                </span>
                {/* Star beam lingers over keyhole O during keyhole-linger phase */}
                {isLingerPhase && (
                  <motion.div
                    className="absolute"
                    style={{
                      left: "41%",
                      top: "5px",
                      width: "3px",
                      height: "140px",
                      background:
                        "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), rgba(214,158,46,0.6), transparent)",
                      transform: "translateX(-50%)",
                      pointerEvents: "none",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2.5, times: [0, 0.2, 0.7, 1] }}
                  />
                )}
              </span>
            </h1>

            {/* LIANA BANYAN */}
            <div
              className="text-xs tracking-[0.3em] uppercase mt-3"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span style={{ color: "#faf5eb" }}>Liana </span>
              <span style={{ color: accentColor, transition: "color 0.5s ease" }}>Banyan</span>
            </div>

            {/* Taglines + buttons */}
            {!friendInput && (
              <>
                <div className="flex-1" />
                <p
                  style={{
                    fontSize: "clamp(0.85rem, 2.2vw, 1rem)",
                    color: "#faf5eb",
                    fontWeight: 600,
                    lineHeight: 1.7,
                  }}
                >
                  Own your Work. Member-Governed.
                </p>
                <p
                  style={{
                    fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
                    color: "rgba(250, 245, 235, 0.6)",
                    lineHeight: 1.7,
                    marginTop: "0.25rem",
                  }}
                >
                  A working platform, not a brochure.
                </p>
                <p
                  style={{
                    fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
                    color: "rgba(250, 245, 235, 0.6)",
                    lineHeight: 1.7,
                    marginTop: "0.5rem",
                  }}
                >
                  Your ideas/services/products
                </p>
                <p
                  style={{
                    fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
                    color: "rgba(250, 245, 235, 0.6)",
                    lineHeight: 1.7,
                  }}
                >
                  Preorder-Funded &amp; Made by Members
                </p>
                <div className="flex-1" />
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate("/enter"); }}
                    className="py-2.5 px-6 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: accentColor, color: "#fff", transition: "background 0.5s ease" }}
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
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/tour"); }}
                  className="mt-2.5 text-xs font-medium transition-all flex items-center gap-1.5"
                  style={{ color: "#f97316", letterSpacing: "0.03em" }}
                  onMouseOver={(e) => (e.currentTarget.style.textShadow = "0 0 8px rgba(249,115,22,0.4)")}
                  onMouseOut={(e) => (e.currentTarget.style.textShadow = "none")}
                >
                  <span>🔥</span> Take the WildFire Tour
                </button>
              </>
            )}
          </div>
        </div>

        {/* Ornate corner art — z-20 renders ABOVE content */}
        <OrnateCornerArt xrayOn={xrayOn} />
      </motion.div>
    </div>
  );
}

/** OrnateCornerArt — Iron-bound filigree with LB monogram + Frame Lock keyholes */
function OrnateCornerArt({ xrayOn }: { xrayOn: boolean }) {
  const corners: Array<{
    pos: string;
    rotate: number;
    level: number;
    shape: "circle" | "square" | "triangle";
  }> = [
    { pos: "top-1 left-1", rotate: 0, level: 1, shape: "circle" },
    { pos: "top-1 right-1", rotate: 90, level: 2, shape: "square" },
    { pos: "bottom-1 left-1", rotate: 270, level: 3, shape: "triangle" },
    { pos: "bottom-1 right-1", rotate: 180, level: 4, shape: "circle" },
  ];

  const strokeColor = xrayOn ? "#22d3ee" : "#38a169";
  const strokeColorFaint = xrayOn ? "rgba(34,211,238,0.4)" : "rgba(56,161,105,0.35)";
  const keyholeStroke = xrayOn ? "#d69e2e" : "#0a1628";
  const keyholeFill = xrayOn ? "rgba(214,158,46,0.3)" : "none";
  const monoColor = xrayOn ? "rgba(34,211,238,0.6)" : "rgba(56,161,105,0.45)";
  const dotColor = xrayOn ? "rgba(34,211,238,0.35)" : "rgba(56,161,105,0.2)";

  return (
    <>
      {corners.map((c) => (
        <div
          key={c.pos}
          className={`absolute ${c.pos} z-20 pointer-events-auto`}
          style={{
            width: "52px",
            height: "52px",
            cursor: `url('/cursors/key-${c.level}.png') 4 0, pointer`,
          }}
          title={`Frame Lock — Level ${c.level}`}
        >
          <svg
            viewBox="0 0 80 80"
            style={{
              width: "100%",
              height: "100%",
              transform: `rotate(${c.rotate}deg)`,
              opacity: xrayOn ? 0.85 : 0.4,
              transition: "opacity 0.5s ease",
            }}
          >
            <path d="M4 4 L4 32 Q4 36, 8 38 L16 40" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.5s ease" }} />
            <path d="M4 4 L32 4 Q36 4, 38 8 L40 16" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.5s ease" }} />
            <path d="M8 8 C8 8, 8 20, 14 26 C18 30, 24 32, 34 34" fill="none" stroke={strokeColorFaint} strokeWidth="1.2" strokeLinecap="round" style={{ transition: "stroke 0.5s ease" }} />
            <path d="M8 8 C8 8, 20 8, 26 14 C30 18, 32 24, 34 34" fill="none" stroke={strokeColorFaint} strokeWidth="1.2" strokeLinecap="round" style={{ transition: "stroke 0.5s ease" }} />
            <path d="M6 18 Q10 22, 16 20 Q20 18, 18 14" fill="none" stroke={strokeColorFaint} strokeWidth="0.8" strokeLinecap="round" style={{ transition: "stroke 0.5s ease" }} />
            <path d="M18 6 Q22 10, 20 16 Q18 20, 14 18" fill="none" stroke={strokeColorFaint} strokeWidth="0.8" strokeLinecap="round" style={{ transition: "stroke 0.5s ease" }} />
            <circle cx="4" cy="4" r="2" fill={dotColor} style={{ transition: "fill 0.5s ease" }} />
            <circle cx="4" cy="18" r="1.2" fill={dotColor} style={{ transition: "fill 0.5s ease" }} />
            <circle cx="18" cy="4" r="1.2" fill={dotColor} style={{ transition: "fill 0.5s ease" }} />
            <circle cx="12" cy="12" r="1" fill={dotColor} style={{ transition: "fill 0.5s ease" }} />
            <text x="14" y="24" fill={monoColor} fontSize="10" fontFamily="'Crimson Pro', Georgia, serif" fontWeight="700" style={{ transition: "fill 0.5s ease" }}>LB</text>
            {c.shape === "circle" && (
              <circle cx="34" cy="34" r="4" fill={keyholeFill} stroke={keyholeStroke} strokeWidth="1.2" style={{ transition: "all 0.5s ease" }} />
            )}
            {c.shape === "square" && (
              <rect x="30" y="30" width="8" height="8" rx="1" fill={keyholeFill} stroke={keyholeStroke} strokeWidth="1.2" style={{ transition: "all 0.5s ease" }} />
            )}
            {c.shape === "triangle" && (
              <polygon points="34,28 28,38 40,38" fill={keyholeFill} stroke={keyholeStroke} strokeWidth="1.2" style={{ transition: "all 0.5s ease" }} />
            )}
          </svg>
        </div>
      ))}
    </>
  );
}

export default HEOHOCardFront;
