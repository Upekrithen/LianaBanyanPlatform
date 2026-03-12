/**
 * WELCOME GATE V2 — Progressive Reveal Landing (normal page, not overlay)
 * ========================================================================
 * Renders as a normal page in document flow so browser back button works.
 * ENTER navigates to /portal (pushes history). Back returns here.
 * ESC dismisses the gate for the session.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { RotatingQuotes } from "@/components/RotatingQuotes";
import {
  shouldShowWelcomeGate,
  dismissWelcomeGate,
  incrementVisitCount,
} from "@/lib/welcomeGateContent";

// ── Constants ──────────────────────────────────────────────────────────────

const FABLE_FRAME_COUNT = 30;
const FABLE_MS_PER_FRAME = 3000;

const FABLE_SUBTITLES: Record<number, string> = {
  1: "The Little Red Hen found some seeds.",
  2: "She asked the Dog, the Cat, and the Pig for help. They refused.",
  3: "So she planted, tended, harvested, and baked — all by herself.",
  4: "Now everyone wanted her bread.",
  5: "But she had a bigger idea.",
  6: '"Then I\'ll feed everyone — and we\'ll build something together."',
  7: "She came to a town where people were struggling.",
  8: '"I\'m making soup from a stone. Would you like to help?"',
  9: "One brought salt. One brought a potato. One brought herbs. Everyone gave a little.",
  10: "And everyone ate well.",
  11: 'Over the meal, a small ant asked: "How did you know what to do?"',
  12: '"I was daydreaming in my kitchen..."',
  13: '"...and I looked out my window and saw people lined up for food that had been locked away."',
  14: '"So I reached into my daydream and pulled out something useful."',
  15: '"To make bread, you have to plant seeds."',
  16: "But outside the city, the ants were already harvesting — for grasshoppers who only watched and took.",
  17: "The Hen called out to the ants. The grasshoppers heard, too.",
  18: "She told the ants what they needed to do to make bread for themselves.",
  19: "And together — ants, city folk, and the Hen — they planted, kneaded, baked, and shared.",
  20: "The grasshoppers noticed.",
  21: '"It\'s not about food. It\'s about keeping these ants IN LINE."',
  22: "They came to put a stop to it.",
  23: "But one ant looked around and realized: they outnumbered the grasshoppers 10,000 to 1.",
  24: "Grasshoppers need ants. Ants don't need grasshoppers.",
  25: "WE ARE THE ANTS.",
  26: '"You\'ve got the makings of greatness in you. You\'re gonna rattle the stars, you are."',
  27: "And when she looked down... her basket had been refilled.",
  28: "Speckles from the young ones' messy eating took root and grew for others to harvest.",
  29: "Hopper sat alone.",
  30: "...",
};

const FRIEND_TRANSLATIONS: Record<string, string> = {
  friend: "English",
  amigo: "Español",
  ami: "Français",
  freund: "Deutsch",
  "\u670B\u53CB": "\u4E2D\u6587",
  "\u53CB\u9054": "\u65E5\u672C\u8A9E",
  tomodachi: "\u65E5\u672C\u8A9E",
  amico: "Italiano",
  "\u0434\u0440\u0443\u0433": "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  "\uCE5C\uAD6C": "\uD55C\uAD6D\uC5B4",
  chingu: "\uD55C\uAD6D\uC5B4",
  rafiki: "Kiswahili",
  vinur: "\xCDslenska",
  vriend: "Nederlands",
  przyjaciel: "Polski",
  arkadas: "T\u00FCrk\u00E7e",
  mellon: "Sindarin (Elvish)",
  amiko: "Esperanto",
  amicus: "Latin",
  dost: "\u0939\u093F\u0902\u0926\u0940",
  ban: "Ti\u1EBFng Vi\u1EC7t",
  kawan: "Bahasa",
  kaibigan: "Filipino",
  chaver: "\u05E2\u05D1\u05E8\u05D9\u05EA",
  doost: "\u0641\u0627\u0631\u0633\u06CC",
  jup: "Klingon",
  vod: "Mando'a",
  raqiros: "High Valyrian",
};

const DURIN_HINTS = [
  "The Elvish word is 'mellon'...",
  "In French, a friend is an 'ami'...",
  "Rafiki means friend in Kiswahili...",
  "Try the Japanese word: 'tomodachi'...",
  "Klingon friends say 'jup'...",
  "In Latin, try 'amicus'...",
  "The Spanish word is 'amigo'...",
  "In Esperanto, it's 'amiko'...",
  "High Valyrian speakers say 'raqiros'...",
  "The simplest answer: 'friend'...",
];

// ── Component ──────────────────────────────────────────────────────────────

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(() => shouldShowWelcomeGate());
  const [entering, setEntering] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [heroBack, setHeroBack] = useState<
    "front" | "fable" | "hint" | "mirror"
  >("front");
  const isFlipped = heroBack !== "front";

  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [keyholeHovered, setKeyholeHovered] = useState(false);
  const [showDurinPopup, setShowDurinPopup] = useState(false);
  const [friendInput, setFriendInput] = useState("");
  const [friendMessage, setFriendMessage] = useState("");
  const [failCount, setFailCount] = useState(0);
  const [currentHint, setCurrentHint] = useState("");
  const [mirrorRevealed, setMirrorRevealed] = useState(false);
  const [mirrorLanguage, setMirrorLanguage] = useState("");
  const [mirrorWord, setMirrorWord] = useState("");
  const friendInputRef = useRef<HTMLInputElement>(null);

  const heroChalkVisible = keyholeHovered || showDurinPopup || isFlipped;
  const mainCardVisible = heroBack === "fable";

  useEffect(() => {
    incrementVisitCount();
  }, []);

  useEffect(() => {
    for (let i = 1; i <= FABLE_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/images/fable/${i}.png`;
    }
  }, []);

  useEffect(() => {
    if (showDurinPopup) {
      setTimeout(() => friendInputRef.current?.focus(), 100);
    }
  }, [showDurinPopup]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setFrame((prev) => {
        if (prev >= FABLE_FRAME_COUNT - 1) {
          setIsPlaying(false);
          return FABLE_FRAME_COUNT - 1;
        }
        return prev + 1;
      });
    }, FABLE_MS_PER_FRAME);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Navigate to portal (pushes history so back button returns here)
  const handleEnter = useCallback(() => {
    setEntering(true);
    setTimeout(() => navigate("/portal"), 400);
  }, [navigate]);

  // Dismiss gate for the session (ESC key)
  const dismissGate = useCallback(() => {
    setEntering(true);
    setTimeout(() => {
      dismissWelcomeGate(false);
      setVisible(false);
    }, 400);
  }, []);

  const handleWatch = useCallback(() => {
    setHeroBack("fable");
    setFrame(0);
    setIsPlaying(true);
  }, []);

  const handleFlipToFront = useCallback(() => {
    if (heroBack === "mirror") setMirrorRevealed(true);
    setHeroBack("front");
    setIsPlaying(false);
  }, [heroBack]);

  const prevFrame = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setFrame((f) => Math.max(0, f - 1));
  }, []);

  const nextFrame = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setFrame((f) => Math.min(FABLE_FRAME_COUNT - 1, f + 1));
  }, []);

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (frame >= FABLE_FRAME_COUNT - 1 && !isPlaying) {
        setFrame(0);
        setIsPlaying(true);
      } else {
        setIsPlaying((p) => !p);
      }
    },
    [frame, isPlaying],
  );

  const handleFriendSubmit = useCallback(() => {
    const normalized = friendInput.toLowerCase().trim();
    if (!normalized) return;
    const language = FRIEND_TRANSLATIONS[normalized];
    if (language) {
      setFriendMessage(`Welcome, Friend! (${language})`);
      setMirrorLanguage(language);
      setMirrorWord(normalized);
      setFailCount(0);
      setTimeout(() => {
        setShowDurinPopup(false);
        setKeyholeHovered(false);
        setFriendInput("");
        setFriendMessage("");
        setHeroBack("mirror");
      }, 1200);
    } else {
      const newFails = failCount + 1;
      setFailCount(newFails);
      if (newFails >= 3) {
        const hint =
          DURIN_HINTS[Math.floor(Math.random() * DURIN_HINTS.length)];
        setCurrentHint(hint);
        setShowDurinPopup(false);
        setKeyholeHovered(false);
        setFriendInput("");
        setFriendMessage("");
        setHeroBack("hint");
      } else {
        setFriendMessage('Speak "friend" and enter...');
      }
    }
  }, [friendInput, failCount]);

  const closeDurinPopup = useCallback(() => {
    setShowDurinPopup(false);
    setKeyholeHovered(false);
    setFriendInput("");
    setFriendMessage("");
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showDurinPopup) {
          closeDurinPopup();
        } else if (isFlipped) {
          handleFlipToFront();
        } else {
          dismissGate();
        }
      }
      if (e.key === "Enter" && !isFlipped && !showDurinPopup) {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    visible,
    isFlipped,
    showDurinPopup,
    handleEnter,
    dismissGate,
    handleFlipToFront,
    closeDurinPopup,
  ]);

  if (!visible) return <>{children}</>;

  const overlayBg =
    "linear-gradient(135deg, #0a0a0a 0%, #0d1f0d 30%, #0a0a0a 70%, #0d0d1f 100%)";
  const hexPatternUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const subtitle =
    FABLE_SUBTITLES[(frame + 1) as keyof typeof FABLE_SUBTITLES] || "";

  const showKeyholeInside = keyholeHovered || mirrorRevealed;

  return (
    <div
      className={`min-h-screen relative transition-opacity duration-400 ${
        entering ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: overlayBg }}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: hexPatternUrl }}
      />

      {/* Liana Banyan wordmark — top left */}
      <div className="absolute top-5 left-6 z-20">
        <span className="text-lg font-bold tracking-wide">
          <span className="text-white">Liana</span>{" "}
          <span className="text-green-400">Banyan</span>
        </span>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 overflow-y-auto">
        {/* ════════ MAIN CARD ════════ */}
        <div
          className={`w-full ${isMobile ? "max-w-sm" : "max-w-2xl"} rounded-2xl transition-all duration-700 ${isMobile ? "p-4" : "p-8"}`}
          style={{
            background: mainCardVisible
              ? "rgba(10, 22, 40, 0.95)"
              : "transparent",
            border: mainCardVisible
              ? "2px dashed rgba(250, 245, 235, 0.35)"
              : "2px dashed transparent",
            boxShadow: mainCardVisible
              ? "0 0 30px rgba(250, 245, 235, 0.06)"
              : "none",
          }}
        >
          {/* ──── Hero Card (CSS 3D flip) ──── */}
          <div
            className="rounded-xl transition-all duration-500"
            style={{
              border: heroChalkVisible
                ? "2px dashed rgba(250, 245, 235, 0.3)"
                : "2px dashed transparent",
              boxShadow: heroChalkVisible
                ? "0 0 20px rgba(250, 245, 235, 0.04)"
                : "none",
              padding: isMobile ? "12px" : "20px",
            }}
          >
            <div style={{ perspective: "1200px" }}>
              <div
                className="relative transition-transform duration-700"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped
                    ? "rotateY(180deg)"
                    : "rotateY(0deg)",
                }}
              >
                {/* ═══ FRONT FACE (sets natural height) ═══ */}
                <div
                  className="flex flex-col items-center text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {/* RotatingQuotes — fixed height to prevent layout shift */}
                  <div
                    className="w-full mb-3 overflow-hidden"
                    style={{ height: isMobile ? "80px" : "90px" }}
                  >
                    <RotatingQuotes
                      intervalMs={8000}
                      className="opacity-70"
                    />
                  </div>

                  <p className="text-xs tracking-[0.3em] text-green-400/70 uppercase font-semibold mb-5">
                    Cooperative Commerce
                  </p>

                  <h1
                    className={`font-bold text-white leading-tight ${
                      isMobile ? "text-4xl" : "text-6xl"
                    }`}
                  >
                    Help Each Other
                    <br />
                    <span className="text-green-400">
                      Help{" "}
                      <span
                        className="relative inline-block cursor-pointer group/key"
                        onMouseEnter={() => setKeyholeHovered(true)}
                        onMouseLeave={() => {
                          if (!showDurinPopup) setKeyholeHovered(false);
                        }}
                        onClick={() => {
                          setShowDurinPopup(true);
                          setKeyholeHovered(true);
                        }}
                        role="button"
                        tabIndex={0}
                        title="Speak friend and enter..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            setShowDurinPopup(true);
                            setKeyholeHovered(true);
                          }
                        }}
                      >
                        O
                        {/* Keyhole silhouette inside the O — on hover or after mirror */}
                        <span
                          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                            showKeyholeInside ? "opacity-100" : "opacity-0"
                          }`}
                          style={{ paddingTop: "0.1em" }}
                        >
                          <svg
                            viewBox="0 0 24 36"
                            fill="#facc15"
                            style={{ height: "0.38em" }}
                          >
                            <circle cx="12" cy="9" r="7" />
                            <polygon points="8,14 6,33 18,33 16,14" />
                          </svg>
                        </span>
                      </span>
                      urselves
                    </span>
                  </h1>

                  {mirrorRevealed && !showDurinPopup && (
                    <p className="text-yellow-300/80 text-sm italic mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      The Mirror sees you, Friend ({mirrorLanguage})
                    </p>
                  )}

                  {showDurinPopup && (
                    <div className="mt-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="inline-block bg-black/80 border border-yellow-500/30 rounded-xl px-6 py-4 backdrop-blur-sm max-w-xs mx-auto">
                        <p className="text-yellow-300/70 text-xs uppercase tracking-widest mb-3">
                          Enter Code
                        </p>
                        <div className="flex gap-2">
                          <input
                            ref={friendInputRef}
                            type="text"
                            value={friendInput}
                            onChange={(e) => {
                              setFriendInput(e.target.value);
                              setFriendMessage("");
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === "Enter") handleFriendSubmit();
                              if (e.key === "Escape") closeDurinPopup();
                            }}
                            placeholder="friend, ami, mellon..."
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 outline-none focus:border-yellow-500/50 text-center"
                          />
                          <button
                            onClick={handleFriendSubmit}
                            className="px-3 py-2 bg-yellow-600/30 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm hover:bg-yellow-600/50 transition-colors"
                          >
                            ✦
                          </button>
                        </div>
                        <p className="text-xs mt-2 text-yellow-300/60 animate-in fade-in duration-300">
                          {friendMessage || 'Speak "friend" and enter...'}
                        </p>
                        <button
                          onClick={closeDurinPopup}
                          className="text-[10px] text-white/20 hover:text-white/40 mt-1 transition-colors"
                        >
                          close
                        </button>
                      </div>
                    </div>
                  )}

                  {!showDurinPopup && (
                    <div className="space-y-2 mt-5">
                      <p
                        className={`text-white font-semibold ${isMobile ? "text-lg" : "text-xl"}`}
                      >
                        Own your Work. Member-Governed.
                      </p>
                      <p
                        className={`text-white/70 ${isMobile ? "text-sm" : "text-base"} leading-relaxed`}
                      >
                        Your ideas/services/products
                        <br />
                        Preorder-Funded &amp; Made by Members
                      </p>
                      <p
                        className={`text-green-400 font-medium ${isMobile ? "text-sm" : "text-base"}`}
                      >
                        The 20% margin funds 16 charitable initiatives for
                        Everyone.
                      </p>
                    </div>
                  )}
                </div>

                {/* ═══ BACK FACE ═══ */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {heroBack === "fable" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div
                        className="relative rounded-xl overflow-hidden border border-white/10 bg-white w-full group cursor-pointer"
                        style={{
                          aspectRatio: "1",
                          maxHeight: isMobile ? "300px" : "380px",
                        }}
                        onClick={handleFlipToFront}
                      >
                        <img
                          key={frame}
                          src={`/images/fable/${frame + 1}.png`}
                          alt={`Liana Banyan Fable — frame ${frame + 1} of ${FABLE_FRAME_COUNT}`}
                          className="w-full h-full object-contain animate-in fade-in duration-500"
                        />

                        {/* Left chevron — white gradient */}
                        <button
                          onClick={prevFrame}
                          className="absolute left-0 top-0 bottom-0 w-14 z-20 flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-white/70 to-transparent"
                          aria-label="Previous frame"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#334155"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>

                        {/* Right chevron — white gradient */}
                        <button
                          onClick={nextFrame}
                          className="absolute right-0 top-0 bottom-0 w-14 z-20 flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-l from-white/70 to-transparent"
                          aria-label="Next frame"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#334155"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>

                        {/* Center play/pause */}
                        <button
                          onClick={togglePlay}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          aria-label={isPlaying ? "Pause" : "Play"}
                        >
                          <div className="w-14 h-14 rounded-full bg-white/60 backdrop-blur-sm border border-slate-300 flex items-center justify-center">
                            {isPlaying ? (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="#334155"
                              >
                                <rect
                                  x="6"
                                  y="4"
                                  width="4"
                                  height="16"
                                />
                                <rect
                                  x="14"
                                  y="4"
                                  width="4"
                                  height="16"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="#334155"
                              >
                                <polygon points="8,4 20,12 8,20" />
                              </svg>
                            )}
                          </div>
                        </button>

                        {/* Frame counter */}
                        <div className="absolute top-2 right-3 text-[10px] text-slate-400 font-mono pointer-events-none">
                          {frame + 1} / {FABLE_FRAME_COUNT}
                        </div>
                      </div>

                      {/* Subtitle — fixed 2-line height so wrapping doesn't shift layout */}
                      <p
                        className={`text-white/90 text-center italic leading-snug mt-3 ${isMobile ? "text-xs" : "text-sm"}`}
                        style={{
                          minHeight: isMobile ? "2.4em" : "2.6em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {subtitle || "\u00A0"}
                      </p>
                    </div>
                  ) : heroBack === "hint" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
                      <div className="text-yellow-400 text-5xl mb-4">
                        &#128273;
                      </div>
                      <h2
                        className={`text-white font-bold mb-3 ${isMobile ? "text-xl" : "text-2xl"}`}
                      >
                        A Clue for You
                      </h2>
                      <p
                        className={`text-yellow-300/90 italic mb-6 ${isMobile ? "text-sm" : "text-lg"}`}
                      >
                        {currentHint}
                      </p>
                      <button
                        onClick={() => {
                          setHeroBack("front");
                          setShowDurinPopup(true);
                          setKeyholeHovered(true);
                          setFriendMessage("");
                        }}
                        className="px-6 py-3 bg-yellow-600/30 border border-yellow-500/40 rounded-xl text-yellow-300 font-semibold hover:bg-yellow-600/50 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : heroBack === "mirror" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
                      <div className="text-yellow-400 text-5xl mb-5">✦</div>
                      <h2
                        className={`text-white font-bold mb-2 ${isMobile ? "text-2xl" : "text-3xl"}`}
                      >
                        The Mirror Sees You
                      </h2>
                      <p
                        className={`text-yellow-300 italic mb-1 ${isMobile ? "text-lg" : "text-xl"}`}
                      >
                        Welcome, Friend
                      </p>
                      <p className="text-white/50 text-sm mb-6">
                        &ldquo;{mirrorWord}&rdquo; &mdash; {mirrorLanguage}
                      </p>
                      <button
                        onClick={handleEnter}
                        className={`rounded-xl font-bold tracking-wide uppercase transition-all bg-gradient-to-r from-yellow-600 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 active:scale-95 ${
                          isMobile
                            ? "px-10 py-4 text-base"
                            : "px-14 py-4 text-lg"
                        }`}
                      >
                        Enter the Platform
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* ──── ENTER + WATCH Buttons ──── */}
          <div
            className={`flex gap-4 justify-center mt-6 ${isMobile ? "flex-col" : ""}`}
          >
            <button
              onClick={handleEnter}
              className={`rounded-xl font-bold tracking-wide uppercase transition-all bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 ${
                isMobile
                  ? "px-10 py-4 text-base w-full"
                  : "px-14 py-4 text-lg"
              }`}
            >
              Enter
            </button>
            <button
              onClick={isFlipped ? handleFlipToFront : handleWatch}
              className={`rounded-xl font-bold tracking-wide uppercase transition-all border border-white/20 text-white/80 hover:border-green-400/50 hover:text-white hover:bg-white/5 active:scale-95 ${
                isMobile
                  ? "px-10 py-4 text-base w-full"
                  : "px-14 py-4 text-lg"
              }`}
            >
              {isFlipped ? "Back" : "Watch"}
            </button>
          </div>
        </div>
        {/* ════════ END MAIN CARD ════════ */}

        <p className="text-[11px] text-white/20 mt-6 select-none">
          &copy; 2026 Liana Banyan Corporation
        </p>
      </div>
    </div>
  );
}
