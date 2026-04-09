import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Snowflake } from "lucide-react";
import { useSnowGateProgress } from "@/hooks/useSnowGateProgress";

const CLUE_ONE =
  'The Lighthouse shows the way, but the Ladder reaches higher. Drink from Paper Three to quench your thirst for what Self-Funding truly means.';
const CLUE_TWO =
  "Six threads of light, seven sections of wax. The Candle remembers every island it has touched. Collect the fragments where the Judges deliberate.";

export function SnowGateDeckCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [isXray, setIsXray] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const progress = useSnowGateProgress();

  const lockNodes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const complete = progress.locks[i];
        return (
          <span
            key={i}
            className={`inline-flex w-6 h-6 items-center justify-center rounded-full border ${
              complete ? "border-amber-300 bg-amber-500/20 text-amber-200" : "border-sky-400/30 text-sky-200/60"
            }`}
            title={`Lock ${i + 1}`}
          >
            <Lock className="w-3 h-3" />
          </span>
        );
      }),
    [progress.locks],
  );

  const mascotImage = isXray
    ? "/images/reserve-denken/denken-correct-xray-on.png"
    : "/images/reserve-denken/denken-correct-xray-off.png";

  return (
    <Card
      className={`border-sky-400/30 bg-slate-950/80 overflow-hidden ${
        progress.hasAccess ? "ring-2 ring-amber-300/60 shadow-[0_0_40px_rgba(251,191,36,0.25)]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-200 font-semibold">
            <Snowflake className="w-4 h-4" />
            The Snow Gate
          </div>
          <Badge variant="outline" className="border-sky-400/30 text-sky-200">
            {progress.totalCompleted}/12 locks
          </Badge>
        </div>
        <div className="text-[11px] text-slate-400">
          Locks: 2x Marks · 2x Credits · 2x Joules · 2x Golden Key · 2x Deck Card · 2x Level
        </div>

        {!isFlipped ? (
          <>
            <div
              className="rounded-lg border border-sky-400/20 bg-slate-900/70 p-3 cursor-pointer"
              onClick={() => setIsXray((v) => !v)}
            >
              <img
                src={isHovered || isXray ? mascotImage : "/images/defense-klaus-button.png"}
                alt="Snow Gate Card"
                className="w-full h-40 object-contain"
              />
              <p className="mt-2 text-xs text-slate-300 leading-relaxed italic">
                {isXray ? CLUE_TWO : isHovered ? CLUE_ONE : "Hover to reveal the first clue. Click for X-Ray mode."}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">{lockNodes}</div>
            {progress.hasAccess ? (
              <div className="rounded-md border border-amber-300/40 bg-amber-500/10 p-2 text-xs text-amber-100">
                The Snow Gate glows. The Babylon Candle is active.
                <div className="mt-1">
                  <Link to="/northern" className="text-amber-200 hover:text-amber-100 underline">
                    Enter the Northern Province
                  </Link>
                </div>
              </div>
            ) : null}
            <button
              className="text-xs text-sky-300 hover:text-sky-200"
              onClick={() => setIsFlipped(true)}
            >
              Flip card for treasure-map fragment
            </button>
          </>
        ) : (
          <div className="rounded-lg border border-sky-400/20 bg-slate-900/70 p-3 space-y-3">
            <p className="text-xs text-slate-300 italic">
              The Crow who nests highest sees farthest. Follow the beacon that was set before you arrived.
            </p>
            <p className="text-xs text-sky-200">Lock progress: {progress.totalCompleted} of 12 opened</p>
            <p className="text-xs text-sky-200">Babylon Candle fragments: {progress.candleFragments}/7</p>
            <button
              className="text-xs text-sky-300 hover:text-sky-200"
              onClick={() => setIsFlipped(false)}
            >
              Return to front
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

