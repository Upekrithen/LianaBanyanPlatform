import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlcoveHallway } from "@/components/AlcoveHallway";
import { useAlcoveProgress } from "@/hooks/useAlcoveProgress";
import { ALCOVES } from "@/lib/alcoveSystem";

export default function AlcoveHallwayPage() {
  const navigate = useNavigate();
  const progress = useAlcoveProgress();

  const hallwayProgress = useMemo(() => {
    const alcoveMap: Record<
      string,
      {
        alcoveId: string;
        status: "locked" | "available" | "visited" | "comprehended";
        visitedAt?: string;
        questionsAnswered: string[];
        comprehendedAt?: string;
        marksEarned: number;
      }
    > = {};

    progress.stops.forEach((stop) => {
      alcoveMap[stop.alcove.id] = {
        alcoveId: stop.alcove.id,
        status: stop.comprehended ? "comprehended" : stop.visited ? "visited" : "available",
        visitedAt: stop.visitedAt ?? undefined,
        comprehendedAt: stop.comprehendedAt ?? undefined,
        questionsAnswered: stop.comprehended ? stop.alcove.questions.map((q) => q.id) : [],
        marksEarned: stop.marksAwarded,
      };
    });

    return {
      userId: "member",
      alcoves: alcoveMap,
      tier1Complete: progress.patternKeys.includes("fledgling"),
      tier2Complete: progress.patternKeys.includes("flight"),
      tier3Complete: progress.patternKeys.includes("murder"),
      patternKeys: progress.patternKeys,
      totalMarksEarned: progress.totalMarks,
      foundersForgeBadge: progress.foundersForgeUnlocked,
    };
  }, [progress]);

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="alcove-hallway-page">
      <div className="space-y-6" data-tour-target="alcove">
        <Card className="border-indigo-400/20 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-300" />
              Alcove Hallway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              This is the 18-stop learning journey through platform foundations, mechanics, and depth.
              Take it as a structured path: flyover with Guided Tour, then master concepts here.
            </p>
            <div className="grid sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                <p className="text-xs text-slate-400">Comprehended</p>
                <p className="text-xl font-semibold text-slate-100">{progress.completedCount}/18</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                <p className="text-xs text-slate-400">Current Tier</p>
                <p className="text-xl font-semibold text-slate-100">{progress.currentTier}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                <p className="text-xs text-slate-400">Marks Earned</p>
                <p className="text-xl font-semibold text-slate-100">{progress.totalMarks}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                <p className="text-xs text-slate-400">Pattern Keys</p>
                <p className="text-xl font-semibold text-slate-100">{progress.patternKeys.length}/3</p>
              </div>
            </div>
            <Progress value={(progress.completedCount / ALCOVES.length) * 100} className="h-2" />
            <div className="flex flex-wrap gap-2">
              {progress.patternKeys.map((key) => (
                <Badge key={key} variant="outline" className="border-indigo-400/40 text-indigo-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {key}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <AlcoveHallway
          progress={hallwayProgress}
          onAlcoveClick={(alcove) => navigate(`/learn/${alcove.id}`)}
          variant="full"
        />
      </div>
    </PortalPageLayout>
  );
}

