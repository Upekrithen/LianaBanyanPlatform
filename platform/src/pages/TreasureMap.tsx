/**
 * TREASURE MAP — Progressive quiz: up to 3 questions with live play previews.
 * After answering the first question the top 3 recommended plays appear as a
 * compact preview below the current question. The user can stop at any point
 * and jump to full results, or answer up to 3 questions for refined results.
 * A "Skip" link on the intro goes straight to default results.
 *
 * Supports ?skip=intro to bypass the intro page (used when Portal Earn Money
 * card has already collected the payout method choice).
 *
 * Includes a "Personalized" / "Basic Options" toggle above the question area.
 */

import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { TreasureMapIntro } from "@/components/treasure-map/TreasureMapIntro";
import { TreasureMapQuestion } from "@/components/treasure-map/TreasureMapQuestion";
import { TreasureMapResults } from "@/components/treasure-map/TreasureMapResults";
import {
  TREASURE_MAP_QUESTIONS,
  type TreasureMapQuestionDef,
} from "@/components/treasure-map/treasureMapQuestions";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import {
  getRecommendedPlays,
  getTemperamentScoresFromTags,
  PLAYS,
  type OptionTag,
  type Play,
} from "@/components/treasure-map/treasureMapEngine";

const TREASURE_MAP_TEMPERAMENT_KEY = "treasure_map_temperament_hint";

/** Maximum number of questions shown in the progressive flow. */
const MAX_PROGRESSIVE_QUESTIONS = 3;

/** The subset of questions we show (first 3 from the full list). */
const PROGRESSIVE_QUESTIONS: TreasureMapQuestionDef[] = TREASURE_MAP_QUESTIONS.slice(
  0,
  MAX_PROGRESSIVE_QUESTIONS
);

type Step = "intro" | number | "results";
type ViewMode = "personalized" | "basic";

export default function TreasureMap() {
  const [searchParams] = useSearchParams();
  const sourceParam = searchParams.get("source") as "earn" | "build" | null;
  const skipIntro = searchParams.get("skip") === "intro";
  const sourceWeight = sourceParam === "earn" || sourceParam === "build" ? sourceParam : undefined;

  // If skip=intro, start at question 0 instead of intro
  const [step, setStep] = useState<Step>(skipIntro ? 0 : "intro");
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [viewMode, setViewMode] = useState<ViewMode>(skipIntro ? "personalized" : "personalized");

  const currentQuestion = typeof step === "number" ? PROGRESSIVE_QUESTIONS[step] : null;
  const selectedIds = currentQuestion ? answers[currentQuestion.id] ?? [] : [];

  // ---- Selection handler (unchanged logic) ----
  const handleSelect = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      const { id, type, maxSelections = 999 } = currentQuestion;
      const current = answers[id] ?? [];

      if (type === "single") {
        setAnswers((prev) => ({ ...prev, [id]: [optionId] }));
        return;
      }
      const has = current.includes(optionId);
      if (has) {
        setAnswers((prev) => ({ ...prev, [id]: current.filter((x) => x !== optionId) }));
      } else if (current.length < maxSelections) {
        setAnswers((prev) => ({ ...prev, [id]: [...current, optionId] }));
      }
    },
    [currentQuestion, answers]
  );

  // ---- Navigation ----
  const handleNext = useCallback(() => {
    if (step === "intro") {
      setStep(0);
      return;
    }
    if (typeof step === "number") {
      if (step >= MAX_PROGRESSIVE_QUESTIONS - 1) {
        setStep("results");
      } else {
        setStep(step + 1);
      }
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (typeof step === "number") {
      // If we skipped intro, don't go back to it
      if (step <= 0) {
        if (!skipIntro) setStep("intro");
      } else {
        setStep(step - 1);
      }
    } else if (step === "results") {
      // Go back to the last answered question, or the last progressive question
      const lastAnswered = PROGRESSIVE_QUESTIONS.reduce<number>((acc, q, idx) => {
        return (answers[q.id]?.length ?? 0) > 0 ? idx : acc;
      }, MAX_PROGRESSIVE_QUESTIONS - 1);
      setStep(lastAnswered);
    }
  }, [step, answers, skipIntro]);

  const handleSkip = useCallback(() => {
    setStep("results");
  }, []);

  const handleShowResults = useCallback(() => {
    setStep("results");
  }, []);

  const canAdvance = (() => {
    if (step === "intro") return true;
    if (typeof step !== "number" || !currentQuestion) return false;
    const sel = answers[currentQuestion.id] ?? [];
    if (currentQuestion.type === "single") return sel.length === 1;
    return sel.length >= 1;
  })();

  // ---- Tag collection & play computation ----
  const { allTags, temperamentTags } = useMemo(() => {
    const all: OptionTag[] = [];
    const temp: OptionTag[] = [];
    TREASURE_MAP_QUESTIONS.forEach((q, idx) => {
      const chosen = answers[q.id] ?? [];
      chosen.forEach((optionId) => {
        const opt = q.options.find((o) => o.id === optionId);
        if (opt) {
          all.push(...opt.tags);
          if (idx >= 7 && idx <= 9) temp.push(...opt.tags);
        }
      });
    });
    return { allTags: all, temperamentTags: temp };
  }, [answers]);

  const temperamentScores = useMemo(
    () => getTemperamentScoresFromTags(temperamentTags),
    [temperamentTags]
  );

  // Persist temperament hint
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(TREASURE_MAP_TEMPERAMENT_KEY, JSON.stringify(temperamentScores));
    } catch {
      // ignore
    }
  }

  const plays = useMemo(
    () => getRecommendedPlays(allTags, sourceWeight, temperamentScores),
    [allTags, sourceWeight, temperamentScores]
  );

  // All plays for "Basic Options" view
  const allPlays = useMemo(() => Object.values(PLAYS), []);

  // Has the user answered at least one question? If so, show the preview.
  const hasAnyAnswer = Object.values(answers).some((a) => a.length > 0);

  // ---- Toggle between Personalized and Basic ----
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "basic") {
      setStep("results");
    } else if (mode === "personalized") {
      // If they haven't started questions yet, go to step 0
      const hasAnswers = Object.values(answers).some((a) => a.length > 0);
      if (!hasAnswers) {
        setStep(skipIntro ? 0 : "intro");
      }
      // If they have answers, stay on results (they can use back)
    }
  };

  // ---- Render ----
  let content: React.ReactNode = null;

  if (step === "intro") {
    content = <TreasureMapIntro onStart={handleNext} onSkip={handleSkip} />;
  } else if (step === "results") {
    content = (
      <TreasureMapResults
        plays={viewMode === "basic" ? allPlays : plays}
        onBack={handleBack}
        temperamentWeighted={viewMode === "basic" ? false : temperamentTags.length > 0}
      />
    );
  } else if (typeof step === "number" && currentQuestion) {
    const isFinal = step >= MAX_PROGRESSIVE_QUESTIONS - 1;
    content = (
      <TreasureMapQuestion
        definition={currentQuestion}
        stepIndex={step}
        totalSteps={MAX_PROGRESSIVE_QUESTIONS}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onBack={handleBack}
        onNext={handleNext}
        canAdvance={canAdvance}
        previewPlays={hasAnyAnswer ? plays : undefined}
        onShowResults={handleShowResults}
        isFinalQuestion={isFinal}
      />
    );
  }

  // Show the toggle when NOT on the intro page
  const showToggle = step !== "intro";

  return (
    <PortalPageLayout>
      {showToggle && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-border bg-card/50 p-1">
            <button
              type="button"
              onClick={() => handleViewModeChange("personalized")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === "personalized"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Personalized
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("basic")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === "basic"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Basic Options
            </button>
          </div>
        </div>
      )}
      {content}
    </PortalPageLayout>
  );
}
