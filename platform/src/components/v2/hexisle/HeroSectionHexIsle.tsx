import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/v2";
import { Badge } from "@/components/ui/badge";

type HeroSectionHexIsleProps = {
  onContinue?: () => void;
};

export function HeroSectionHexIsle({ onContinue }: HeroSectionHexIsleProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 20;
      const y = (event.clientY / window.innerHeight - 0.5) * 20;
      setPointerOffset({ x, y });
    };

    const onScroll = () => setScrollY(window.scrollY);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reducedMotion]);

  const layerTransform = useMemo(() => {
    if (reducedMotion) return "translate3d(0, 0, 0)";
    const x = pointerOffset.x * 0.7;
    const y = pointerOffset.y * 0.5 + scrollY * 0.03;
    return `translate3d(${x}px, ${y}px, 0)`;
  }, [pointerOffset.x, pointerOffset.y, reducedMotion, scrollY]);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ transform: layerTransform, transition: reducedMotion ? "none" : "transform 180ms linear" }}
      >
        <div className="absolute -left-20 top-6 h-64 w-64 rounded-full bg-cyan-500/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-8 left-1/3 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 800" fill="none">
          <g stroke="rgba(125,211,252,0.22)" strokeWidth="1.5">
            {Array.from({ length: 18 }).map((_, i) => {
              const x = 70 + i * 85;
              const y = 110 + (i % 2 ? 40 : 0);
              return (
                <path
                  key={`hex-${i}`}
                  d={`M ${x} ${y} l 24 -14 l 24 14 l 0 28 l -24 14 l -24 -14 z`}
                />
              );
            })}
          </g>
        </svg>
      </div>

      <div className="relative z-10">
        <Hero
          variant="focus"
          eyebrow="HexIsle"
          headline="Command the map. Build the terrain. Shift the balance."
          body="HexIsle is a strategic island world for solo campaigns, cooperative encampments, and competitive seasons."
          primaryCTA={{ label: "Enter the Island Gate", href: "/hexisle/world-map" }}
          secondaryCTA={{ label: "Continue to core loop", onClick: onContinue }}
          proofStrip={["Live map phases", "Physical + digital terrain", "Community events", "hexisle.com"]}
        />
        <div className="mx-auto mt-4 flex max-w-5xl flex-wrap justify-center gap-2 px-4 pb-8 sm:px-6">
          <Badge variant="secondary" className="bg-white/10 text-white">Solo</Badge>
          <Badge variant="secondary" className="bg-white/10 text-white">Co-op</Badge>
          <Badge variant="secondary" className="bg-white/10 text-white">Competitive</Badge>
        </div>
      </div>
    </section>
  );
}
