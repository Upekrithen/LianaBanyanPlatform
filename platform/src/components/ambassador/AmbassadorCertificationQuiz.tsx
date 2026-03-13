/**
 * AMBASSADOR CERTIFICATION QUIZ — Level-up assessment (Session 5 V2).
 * Fetches questions from ambassador_assessment_questions; 80% pass → level update + Marks.
 * data-xray-id: ambassador-certification-quiz
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const PASS_PCT = 80;
const MARKS_ON_PASS = 25;

export interface AssessmentQuestionRow {
  id: string;
  from_level: number;
  to_level: number;
  question_order: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: string;
}

export interface AmbassadorCertificationQuizProps {
  ambassadorId: string;
  fromLevel: number;
  toLevel: number;
  onPass: () => void;
  onFail: (scorePct: number, message: string) => void;
  className?: string;
}

export function AmbassadorCertificationQuiz({
  ambassadorId,
  fromLevel,
  toLevel,
  onPass,
  onFail,
  className,
}: AmbassadorCertificationQuizProps) {
  const [questions, setQuestions] = useState<AssessmentQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("ambassador_assessment_questions")
        .select("*")
        .eq("from_level", fromLevel)
        .eq("to_level", toLevel)
        .order("question_order");
      if (!error) setQuestions(data ?? []);
      setLoading(false);
    })();
  }, [fromLevel, toLevel]);

  const current = questions[index];
  const options = [
    { key: "a", label: current?.option_a },
    { key: "b", label: current?.option_b },
    { key: "c", label: current?.option_c },
    { key: "d", label: current?.option_d },
  ].filter((o) => o.label);

  const handleNext = () => {
    if (index < questions.length - 1) setIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;
    setSubmitting(true);
    try {
      const correct = questions.filter((q) => answers[q.id] === q.correct_option).length;
      const scorePct = Math.round((correct / questions.length) * 100);
      const passed = scorePct >= PASS_PCT;

      await supabase.from("ambassador_certifications").insert({
        ambassador_id: ambassadorId,
        from_level: fromLevel,
        to_level: toLevel,
        assessment_score: scorePct,
        passed,
      });

      if (passed) {
        const { data: amb } = await supabase.from("ambassadors").select("level_title, certified_at_level, marks_earned").eq("id", ambassadorId).single();
        const levelTitles: Record<number, string> = {
          1: "Torch Bearer",
          2: "Lamplighter",
          3: "Beacon Keeper",
          4: "Lighthouse Warden",
          5: "Harbormaster",
        };
        const newTitle = levelTitles[toLevel] ?? "Torch Bearer";
        const existingArray = (amb?.certified_at_level as string[] | null) ?? [];
        const { error: updateErr } = await supabase
          .from("ambassadors")
          .update({
            level: toLevel,
            level_title: newTitle,
            certified_at_level: [...existingArray, new Date().toISOString()],
            marks_earned: (amb?.marks_earned ?? 0) + MARKS_ON_PASS,
          })
          .eq("id", ambassadorId);
        if (updateErr) {
          onFail(scorePct, "Level updated but Marks may not have been applied. Please check your dashboard.");
          return;
        }
        onPass();
      } else {
        onFail(scorePct, `You need ${PASS_PCT}% to pass. You can retake after 7 days. Review scenario and platform knowledge.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className={cn(className)} data-xray-id="ambassador-certification-quiz">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading assessment…</p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className={cn(className)} data-xray-id="ambassador-certification-quiz">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No assessment questions found for this level. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)} data-xray-id="ambassador-certification-quiz">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Question {index + 1} of {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium">{current?.question_text}</p>
        <RadioGroup
          value={answers[current?.id ?? ""] ?? ""}
          onValueChange={(v) => setAnswers((prev) => ({ ...prev, [current?.id ?? ""]: v }))}
          className="space-y-2"
        >
          {options.map((opt) => (
            <div key={opt.key} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.key} id={`q-${current?.id}-${opt.key}`} />
              <Label htmlFor={`q-${current?.id}-${opt.key}`} className="text-sm font-normal cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleBack} disabled={index === 0}>
            Back
          </Button>
          {index < questions.length - 1 ? (
            <Button size="sm" onClick={handleNext} disabled={!answers[current?.id ?? ""]}>
              Next
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={!answers[current?.id ?? ""] || submitting}>
              {submitting ? "Submitting…" : "Submit assessment"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
