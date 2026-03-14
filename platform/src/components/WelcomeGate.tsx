/**
 * DO NOT TOUCH — WelcomeGate "Flattened Deck" (Session 11)
 * Three-tab system: Concept (flipbook) | Get Started (BLUF triage) | More Detail (HEOHO)
 * Approved by Founder + Rook. Any changes require explicit Founder approval.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { RotatingQuotes } from "@/components/RotatingQuotes";
import {
  shouldShowWelcomeGate,
  dismissWelcomeGate,
  incrementVisitCount,
} from "@/lib/welcomeGateContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ── Constants ──────────────────────────────────────────────────────────────

const FABLE_FRAME_COUNT = 30;
const FABLE_MS_BASE = 1500; // ~1.5s per frame at 1×

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

// ── Component ──────────────────────────────────────────────────────────────

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(() => shouldShowWelcomeGate());
  const [entering, setEntering] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 3>(1);
  const [conceptComplete, setConceptComplete] = useState(false);

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
    if (!isPlaying) return;
    const ms = FABLE_MS_BASE / speed;
    const timer = setInterval(() => {
      setFrame((prev) => {
        if (prev >= FABLE_FRAME_COUNT - 1) {
          setIsPlaying(false);
          setConceptComplete(true);
          return FABLE_FRAME_COUNT - 1;
        }
        return prev + 1;
      });
    }, ms);
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const handleEnter = useCallback(() => {
    setEntering(true);
    setTimeout(() => navigate("/portal"), 400);
  }, [navigate]);

  const dismissGate = useCallback(() => {
    setEntering(true);
    setTimeout(() => {
      dismissWelcomeGate(false);
      setVisible(false);
    }, 400);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissGate();
      if (e.key === "Enter") handleEnter();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, handleEnter, dismissGate]);

  const prevFrame = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setFrame((f) => Math.max(0, f - 1));
  }, []);

  const nextFrame = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFrame((f) => Math.min(FABLE_FRAME_COUNT - 1, f + 1));
  }, []);

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (frame >= FABLE_FRAME_COUNT - 1 && !isPlaying) {
        setFrame(0);
        setConceptComplete(false);
        setIsPlaying(true);
      } else {
        setIsPlaying((p) => !p);
      }
    },
    [frame, isPlaying],
  );

  const skipToEnd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setFrame(FABLE_FRAME_COUNT - 1);
    setConceptComplete(true);
  }, []);

  if (!visible) return <>{children}</>;

  const overlayBg =
    "linear-gradient(135deg, #0a0a0a 0%, #0d1f0d 30%, #0a0a0a 70%, #0d0d1f 100%)";
  const hexPatternUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const subtitle =
    FABLE_SUBTITLES[(frame + 1) as keyof typeof FABLE_SUBTITLES] || "";

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

      <div className="absolute top-5 left-6 z-20">
        <span className="text-lg font-bold tracking-wide">
          <span className="text-white">Liana</span>{" "}
          <span className="text-green-400">Banyan</span>
        </span>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 overflow-y-auto">
        <div
          className={`w-full ${isMobile ? "max-w-sm" : "max-w-2xl"} rounded-2xl transition-all duration-700 ${isMobile ? "p-4" : "p-8"}`}
          style={{
            background: "rgba(10, 22, 40, 0.95)",
            border: "2px dashed rgba(250, 245, 235, 0.35)",
            boxShadow: "0 0 30px rgba(250, 245, 235, 0.06)",
          }}
          data-xray-id="welcomegate-tabs"
        >
          <Tabs defaultValue="concept" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/10 mb-4">
              <TabsTrigger value="concept" className="data-[state=active]:bg-green-600/30 data-[state=active]:text-white">
                Concept
              </TabsTrigger>
              <TabsTrigger value="get-started" className="data-[state=active]:bg-green-600/30 data-[state=active]:text-white">
                Get Started
              </TabsTrigger>
              <TabsTrigger value="more-detail" className="data-[state=active]:bg-green-600/30 data-[state=active]:text-white">
                More Detail
              </TabsTrigger>
            </TabsList>

            {/* Tab A — Concept: flipbook + controls + RotatingQuotes */}
            <TabsContent value="concept" className="mt-0" data-xray-id="welcomegate-concept">
              {conceptComplete ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <h2 className="text-white font-semibold text-lg mb-2">Concept</h2>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Liana Banyan is a cooperative where neighbors help each other eat, earn, and build.
                      One small commitment—back one neighbor's offer—leads to your first customer and a shared story.
                    </p>
                  </div>
                  <div className="h-16 overflow-hidden">
                    <RotatingQuotes intervalMs={8000} className="opacity-70 text-white/80 text-sm" />
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="relative rounded-xl overflow-hidden border border-white/10 bg-white w-full group"
                    style={{
                      aspectRatio: "1",
                      maxHeight: isMobile ? "280px" : "360px",
                    }}
                  >
                    <img
                      key={frame}
                      src={`/images/fable/${frame + 1}.png`}
                      alt={`Liana Banyan Fable — frame ${frame + 1} of ${FABLE_FRAME_COUNT}`}
                      className="w-full h-full object-contain animate-in fade-in duration-300"
                    />
                    <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono bg-white/80 px-1.5 py-0.5 rounded">
                      {frame + 1} / {FABLE_FRAME_COUNT}
                    </div>
                  </div>
                  {/* Controls: ◀ | 1× 2× 3× | ⏸ | Skip ▶ */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={prevFrame}
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                      aria-label="Previous frame"
                    >
                      ◀
                    </button>
                    <div className="flex gap-1">
                      {([1, 2, 3] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpeed(s);
                          }}
                          className={`min-w-[2rem] py-1.5 rounded text-xs font-medium transition-colors ${
                            speed === s ? "bg-green-600/50 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          {s}×
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      ⏸
                    </button>
                    <button
                      type="button"
                      onClick={skipToEnd}
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1 text-sm"
                    >
                      Skip ▶
                    </button>
                  </div>
                  <p
                    className="text-white/90 text-center italic leading-snug mt-3 text-xs min-h-[2.4em] flex items-center justify-center"
                  >
                    {subtitle || "\u00A0"}
                  </p>
                  <div className="h-12 overflow-hidden mt-2">
                    <RotatingQuotes intervalMs={8000} className="opacity-70 text-white/70 text-xs" />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Tab B — Get Started: 4 buttons */}
            <TabsContent value="get-started" className="mt-0" data-xray-id="welcomegate-get-started">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/treasure-map")}
                  className="w-full py-4 px-4 rounded-xl font-semibold text-left flex items-center gap-3 bg-green-600/30 border border-green-500/40 text-white hover:bg-green-600/50 transition-colors"
                >
                  <span className="text-2xl">🟢</span>
                  Earn
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/crew/new")}
                  className="w-full py-4 px-4 rounded-xl font-semibold text-left flex items-center gap-3 bg-blue-600/30 border border-blue-500/40 text-white hover:bg-blue-600/50 transition-colors"
                >
                  <span className="text-2xl">🔵</span>
                  Build
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/academy")}
                  className="w-full py-4 px-4 rounded-xl font-semibold text-left flex items-center gap-3 bg-amber-500/30 border border-amber-400/40 text-white hover:bg-amber-500/50 transition-colors"
                >
                  <span className="text-2xl">🟡</span>
                  Learn
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/portal")}
                  className="w-full py-4 px-4 rounded-xl font-semibold text-left flex items-center gap-3 bg-violet-600/30 border border-violet-500/40 text-white hover:bg-violet-600/50 transition-colors"
                >
                  <span className="text-2xl">🟣</span>
                  Explore
                </button>
              </div>
              <p className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/treasure-map")}
                  className="text-green-400 hover:text-green-300 text-sm underline"
                >
                  Not sure? Take the 5-minute Treasure Map quiz →
                </button>
              </p>
            </TabsContent>

            {/* Tab C — More Detail: accordions + CTA + SEC */}
            <TabsContent value="more-detail" className="mt-0" data-xray-id="welcomegate-more-detail">
              <h2 className="text-white font-bold text-lg mb-4 text-center">
                Member-Owned. Member-Governed. You are a Member-Owner.
              </h2>
              <Accordion type="single" collapsible className="w-full text-left">
                <AccordionItem value="mutual-aid" className="border-white/10">
                  <AccordionTrigger className="text-white/90 hover:text-white hover:no-underline">
                    Mutual Aid
                  </AccordionTrigger>
                  <AccordionContent className="text-white/75 text-sm">
                    Every transaction generates reciprocal value. When you back a neighbor's offer, they back yours. The platform takes only Cost+20%; the rest stays in the community.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="pricing" className="border-white/10">
                  <AccordionTrigger className="text-white/90 hover:text-white hover:no-underline">
                    Transparent Pricing
                  </AccordionTrigger>
                  <AccordionContent className="text-white/75 text-sm">
                    Cost+20% floor. Sellers set prices. No hidden fees.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="access" className="border-white/10">
                  <AccordionTrigger className="text-white/90 hover:text-white hover:no-underline">
                    Universal Access
                  </AccordionTrigger>
                  <AccordionContent className="text-white/75 text-sm">
                    Credits, Marks, Joules — three currencies, one value. Everyone can earn, spend, and participate.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="participation" className="border-white/10">
                  <AccordionTrigger className="text-white/90 hover:text-white hover:no-underline">
                    Earned Participation
                  </AccordionTrigger>
                  <AccordionContent className="text-white/75 text-sm">
                    The people doing the work make the decisions. Governance is tied to participation, not capital.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="mt-6 flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={handleEnter}
                  className="rounded-xl font-bold tracking-wide uppercase px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 transition-all"
                >
                  Tour the 16 Initiatives
                </button>
                <p className="text-white/50 text-xs text-center max-w-sm">
                  This is not an investment. You're backing real products and services from real people.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* ENTER button — always visible */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleEnter}
              className="rounded-xl font-bold tracking-wide uppercase bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 px-10 py-3 transition-all"
            >
              Enter
            </button>
          </div>
        </div>

        <p className="text-[11px] text-white/20 mt-6 select-none">
          &copy; 2026 Liana Banyan Corporation
        </p>
      </div>
    </div>
  );
}
