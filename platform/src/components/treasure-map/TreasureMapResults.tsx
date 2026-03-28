/**
 * TREASURE MAP RESULTS — 3 recommended plays with CTAs + "Start This Journey" linking to guides
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Play } from "./treasureMapEngine";

const PLAY_TO_MAP: Record<string, string> = {
  dinner_crew: "breakfast-runner",
  grocery_runner: "grocery",
  skill_session: "service",
  digital_product: "designer",
  baked_goods: "catering",
  care_tutoring: "service",
  designer: "designer",
};

interface TreasureMapResultsProps {
  plays: Play[];
  onBack: () => void;
  temperamentWeighted?: boolean;
}

export function TreasureMapResults({ plays, onBack, temperamentWeighted }: TreasureMapResultsProps) {
  const navigate = useNavigate();
  const [startingMap, setStartingMap] = useState<string | null>(null);

  const handleCta = (play: Play) => {
    if (play.nodeId) {
      navigate(`${play.route}?highlight=${play.nodeId}`);
    } else {
      navigate(play.route);
    }
  };

  const handleStartJourney = async (play: Play) => {
    const mapId = PLAY_TO_MAP[play.id] || "breakfast-runner";
    setStartingMap(play.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("treasure_map_progress" as any).upsert(
          {
            user_id: user.id,
            map_id: mapId,
            current_phase: "scout",
            current_level: 1,
            phase_data: {},
          } as any,
          { onConflict: "user_id,map_id" } as any,
        );
        toast.success("Journey started! Your progress is being tracked.");
      }
    } catch {
      // Guest — navigate anyway, progress will be saved after login
    }

    navigate(`/treasure-maps/${mapId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12" data-xray-id="temperament-results">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to quiz
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Here Are 3 Ways You Could Start Earning in the Next 7–14 Days
        </h1>
        <p className="text-muted-foreground mb-10">
          Based on your answers, we picked options that fit your time, tools, and
          comfort level.
        </p>

        <div className="space-y-6" data-xray-id={temperamentWeighted ? "temperament-weighted-plays" : undefined}>
          {plays.map((play) => {
            const mapId = PLAY_TO_MAP[play.id];
            return (
              <div
                key={play.id}
                className="bg-card border-2 border-border rounded-2xl p-6 md:p-8 hover:border-green-500/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl" aria-hidden>
                    {play.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold mb-1">{play.title}</h2>
                    <p className="text-muted-foreground mb-4">{play.subtitle}</p>
                    <ul className="space-y-2 mb-6">
                      {play.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-green-500 shrink-0">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleCta(play)}
                      >
                        {play.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      {mapId && (
                        <Button
                          variant="outline"
                          className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                          disabled={startingMap === play.id}
                          onClick={() => handleStartJourney(play)}
                        >
                          <Map className="w-4 h-4 mr-2" />
                          {startingMap === play.id ? "Starting…" : "Start This Journey"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-muted-foreground mt-6">
          Or start by forming a Crew — 12 people who back each other&apos;s first offers.{" "}
          <button
            type="button"
            className="text-green-500 hover:underline font-medium"
            onClick={() => navigate("/crew/new")}
          >
            Form a Crew →
          </button>
        </p>
        <p className="text-center text-muted-foreground mt-2">
          Not feeling these?{" "}
          <button
            type="button"
            className="text-green-500 hover:underline font-medium"
            onClick={() => navigate("/launch")}
          >
            View all paths →
          </button>
        </p>
      </div>
    </div>
  );
}
