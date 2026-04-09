import { useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColdStartPathway, ColdStartPathwayId } from "./types";

type RecommendationDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathways: ColdStartPathway[];
};

type Answers = {
  firstMove?: "sell" | "build" | "serve" | "organize";
  pace?: "today" | "this-week" | "this-month";
  collaboration?: "solo" | "small-team" | "community";
  output?: "products" | "services" | "community-programs";
};

const QUESTIONS = [
  {
    key: "firstMove" as const,
    prompt: "What do you want to do first?",
    options: [
      { id: "sell", label: "Sell ready things" },
      { id: "build", label: "Make things" },
      { id: "serve", label: "Offer skills" },
      { id: "organize", label: "Organize people" },
    ],
  },
  {
    key: "pace" as const,
    prompt: "What pace feels right for launch?",
    options: [
      { id: "today", label: "Today" },
      { id: "this-week", label: "This week" },
      { id: "this-month", label: "This month" },
    ],
  },
  {
    key: "collaboration" as const,
    prompt: "Who will you move with first?",
    options: [
      { id: "solo", label: "Mostly solo" },
      { id: "small-team", label: "Small team" },
      { id: "community", label: "Community group" },
    ],
  },
  {
    key: "output" as const,
    prompt: "What output matters first?",
    options: [
      { id: "products", label: "Physical products" },
      { id: "services", label: "Service outcomes" },
      { id: "community-programs", label: "Shared programs" },
    ],
  },
] as const;

function scorePathways(answers: Answers) {
  const score: Record<ColdStartPathwayId, number> = {
    food: 0,
    manufacturing: 0,
    service: 0,
    "local-business": 0,
    guild: 0,
    tribe: 0,
  };

  switch (answers.firstMove) {
    case "sell":
      score.food += 2;
      score["local-business"] += 2;
      break;
    case "build":
      score.manufacturing += 3;
      break;
    case "serve":
      score.service += 3;
      break;
    case "organize":
      score.guild += 2;
      score.tribe += 2;
      break;
    default:
      break;
  }

  switch (answers.pace) {
    case "today":
      score.service += 1;
      score["local-business"] += 1;
      break;
    case "this-week":
      score.food += 1;
      score.guild += 1;
      break;
    case "this-month":
      score.manufacturing += 1;
      score.tribe += 1;
      break;
    default:
      break;
  }

  switch (answers.collaboration) {
    case "solo":
      score.service += 1;
      score.manufacturing += 1;
      break;
    case "small-team":
      score.food += 1;
      score["local-business"] += 1;
      break;
    case "community":
      score.guild += 2;
      score.tribe += 2;
      break;
    default:
      break;
  }

  switch (answers.output) {
    case "products":
      score.manufacturing += 2;
      score.food += 1;
      break;
    case "services":
      score.service += 2;
      score["local-business"] += 1;
      break;
    case "community-programs":
      score.guild += 2;
      score.tribe += 2;
      break;
    default:
      break;
  }

  return score;
}

export function RecommendationDrawer({ open, onOpenChange, pathways }: RecommendationDrawerProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = QUESTIONS[step];
  const isLastQuestion = step === QUESTIONS.length - 1;

  const suggestion = useMemo(() => {
    const score = scorePathways(answers);
    const [bestId] = Object.entries(score).sort((a, b) => b[1] - a[1])[0] ?? [];
    return pathways.find((path) => path.id === bestId) ?? null;
  }, [answers, pathways]);

  const setAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
  };

  const resetFlow = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <Drawer open={open} onOpenChange={(next) => {
      onOpenChange(next);
      if (!next) resetFlow();
    }}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>I'm not sure yet.</DrawerTitle>
          <DrawerDescription>
            Answer a few intent questions and we will suggest a starting path.
          </DrawerDescription>
        </DrawerHeader>

        {!showResult ? (
          <div className="space-y-4 px-4 pb-2">
            <p className="text-sm font-medium">
              {step + 1} of {QUESTIONS.length}: {currentQuestion.prompt}
            </p>
            <div className="flex flex-wrap gap-2">
              {currentQuestion.options.map((option) => {
                const isActive = answers[currentQuestion.key] === option.id;
                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setAnswer(option.id)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3 px-4 pb-2">
            <Badge variant="secondary" className="w-fit">
              Suggested pathway
            </Badge>
            <p className="text-lg font-semibold">{suggestion?.name ?? "Service"}</p>
            <p className="text-sm text-muted-foreground">
              {suggestion?.purpose ?? "Start with the path that matches your first transaction intent."}
            </p>
            <p className="text-xs text-muted-foreground">You can expand later.</p>
          </div>
        )}

        <DrawerFooter>
          {!showResult ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (isLastQuestion) {
                    setShowResult(true);
                    return;
                  }
                  setStep((value) => Math.min(QUESTIONS.length - 1, value + 1));
                }}
                disabled={!answers[currentQuestion.key]}
              >
                {isLastQuestion ? "Show suggestion" : "Next"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={suggestion?.setupHref ?? "/cold-start/service"}>Start with {suggestion?.name ?? "Service"}</a>
              </Button>
              <Button type="button" variant="outline" onClick={resetFlow}>
                Retake questions
              </Button>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

