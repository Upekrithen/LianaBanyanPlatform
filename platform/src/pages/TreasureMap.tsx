/**
 * TREASURE MAP — 7-question quiz to find your first offer
 * Intro → Q1–Q7 → Results (3 recommended plays). No signup required to take the quiz.
 */

import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { TreasureMapIntro } from "@/components/treasure-map/TreasureMapIntro";
import { TreasureMapQuestion } from "@/components/treasure-map/TreasureMapQuestion";
import { TreasureMapResults } from "@/components/treasure-map/TreasureMapResults";
import {
  TREASURE_MAP_QUESTIONS,
  TOTAL_QUESTIONS,
  type TreasureMapQuestionDef,
} from "@/components/treasure-map/treasureMapQuestions";
import {
  getRecommendedPlays,
  getTemperamentScoresFromTags,
  type OptionTag,
  type TemperamentScores,
} from "@/components/treasure-map/treasureMapEngine";

const TREASURE_MAP_TEMPERAMENT_KEY = "treasure_map_temperament_hint";
// TODO: migration — store temperament_hint on user profile (e.g. profiles.temperament_hint JSONB)

type Step = "intro" | number | "results";

export default function TreasureMap() {
  const [searchParams] = useSearchParams();
  const sourceParam = searchParams.get("source") as "earn" | "build" | null;
  const sourceWeight = sourceParam === "earn" || sourceParam === "build" ? sourceParam : undefined;

  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const currentQuestion = typeof step === "number" ? TREASURE_MAP_QUESTIONS[step] : null;
  const selectedIds = currentQuestion ? answers[currentQuestion.id] ?? [] : [];

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

  const handleNext = useCallback(() => {
    if (step === "intro") {
      setStep(0);
      return;
    }
    if (typeof step === "number") {
      if (step >= TOTAL_QUESTIONS - 1) {
        setStep("results");
      } else {
        setStep(step + 1);
      }
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (typeof step === "number") {
      if (step <= 0) setStep("intro");
      else setStep(step - 1);
    } else if (step === "results") {
      setStep(TOTAL_QUESTIONS - 1);
    }
  }, [step]);

  const canAdvance = (() => {
    if (step === "intro") return true;
    if (typeof step !== "number" || !currentQuestion) return false;
    const sel = answers[currentQuestion.id] ?? [];
    if (currentQuestion.type === "single") return sel.length === 1;
    return sel.length >= 1;
  })();

  const allTags: OptionTag[] = [];
  const temperamentTags: OptionTag[] = [];
  TREASURE_MAP_QUESTIONS.forEach((q, idx) => {
    const chosen = answers[q.id] ?? [];
    chosen.forEach((optionId) => {
      const opt = q.options.find((o) => o.id === optionId);
      if (opt) {
        allTags.push(...opt.tags);
        if (idx >= 7 && idx <= 9) temperamentTags.push(...opt.tags);
      }
    });
  });
  const temperamentScores = getTemperamentScoresFromTags(temperamentTags);
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(TREASURE_MAP_TEMPERAMENT_KEY, JSON.stringify(temperamentScores));
    } catch {
      // ignore
    }
  }
  const plays = getRecommendedPlays(allTags, sourceWeight, temperamentScores);

  if (step === "intro") {
    return <TreasureMapIntro onStart={handleNext} />;
  }

  if (step === "results") {
    return (
      <TreasureMapResults
        plays={plays}
        onBack={handleBack}
        temperamentWeighted={temperamentTags.length > 0}
      />
    );
  }

  if (typeof step === "number" && currentQuestion) {
    return (
      <TreasureMapQuestion
        definition={currentQuestion}
        stepIndex={step}
        totalSteps={TOTAL_QUESTIONS}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onBack={handleBack}
        onNext={handleNext}
        canAdvance={canAdvance}
      />
    );
  }

  return null;
}
