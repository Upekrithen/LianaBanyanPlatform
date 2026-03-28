/**
 * TreasureMapKnowledgeQuiz — Reusable quiz component for treasure map progression.
 * Draws random questions from treasure_map_quizzes table.
 * Awards Marks proportional to score. Max 3 attempts per map.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, HelpCircle, Award, RotateCcw } from "lucide-react";

interface QuizQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

interface TreasureMapKnowledgeQuizProps {
  mapId: string;
  questionCount?: number;
  currentAttempts?: number;
  bestScore?: number;
  onComplete: (score: number) => void;
}

const MARKS_TABLE: Record<number, number> = { 5: 10, 4: 8, 3: 6, 2: 4, 1: 2, 0: 0 };
const MAX_ATTEMPTS = 3;

export function TreasureMapKnowledgeQuiz({
  mapId,
  questionCount = 5,
  currentAttempts = 0,
  bestScore,
  onComplete,
}: TreasureMapKnowledgeQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, [mapId]);

  async function fetchQuestions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("treasure_map_quizzes" as any)
      .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer")
      .or(`map_id.eq.${mapId},map_id.eq.general`);

    if (error || !data?.length) {
      console.error("Failed to fetch quiz questions:", error);
      setLoading(false);
      return;
    }

    const shuffled = (data as QuizQuestion[])
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);
    setQuestions(shuffled);
    setLoading(false);
  }

  const attemptsLeft = MAX_ATTEMPTS - currentAttempts;
  const exhausted = attemptsLeft <= 0;

  function handleNext() {
    setAnswers((prev) => ({ ...prev, [currentIdx]: selectedAnswer }));
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer("");
    } else {
      const finalAnswers = { ...answers, [currentIdx]: selectedAnswer };
      let correct = 0;
      questions.forEach((q, i) => {
        if (finalAnswers[i] === q.correct_answer) correct++;
      });
      setScore(correct);
      setShowResults(true);
      onComplete(correct);
    }
  }

  function handleRetry() {
    setCurrentIdx(0);
    setSelectedAnswer("");
    setAnswers({});
    setShowResults(false);
    setScore(0);
    fetchQuestions();
  }

  if (loading) {
    return (
      <Card className="border-amber-800/30">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Loading quiz questions…
        </CardContent>
      </Card>
    );
  }

  if (!questions.length) {
    return (
      <Card className="border-amber-800/30">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No quiz questions available for this map.
        </CardContent>
      </Card>
    );
  }

  if (exhausted && !showResults) {
    return (
      <Card className="border-amber-800/30 bg-amber-950/10">
        <CardContent className="py-8 text-center">
          <Award className="w-8 h-8 mx-auto mb-3 text-amber-500" />
          <p className="font-semibold">Quiz Attempts Used</p>
          <p className="text-sm text-muted-foreground mt-1">
            You've used all {MAX_ATTEMPTS} attempts.
            {bestScore != null && (
              <> Your best score: <strong>{bestScore}/{questionCount}</strong> ({MARKS_TABLE[Math.min(bestScore, 5)] ?? 0} Marks)</>
            )}
          </p>
          {bestScore != null && bestScore >= 3 && (
            <Badge className="mt-3 bg-emerald-600/20 text-emerald-400 border-emerald-500/30">Passed</Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const passed = score >= 3;
    const marks = MARKS_TABLE[Math.min(score, 5)] ?? 0;
    return (
      <Card className="border-amber-800/30">
        <CardContent className="py-8 text-center space-y-4">
          {passed ? (
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
          ) : (
            <XCircle className="w-12 h-12 mx-auto text-red-400" />
          )}
          <div>
            <p className="text-2xl font-bold">{score}/{questionCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {passed ? "You passed!" : "Not quite — you need 3/5 to advance."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">{marks} Marks earned</span>
          </div>
          {!passed && attemptsLeft > 1 && (
            <Button variant="outline" onClick={handleRetry} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again ({attemptsLeft - 1} left)
            </Button>
          )}
          {passed && (
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30">
              Ready to advance!
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  const q = questions[currentIdx];
  const options = [
    { key: "a", text: q.option_a },
    { key: "b", text: q.option_b },
    { key: "c", text: q.option_c },
    { key: "d", text: q.option_d },
  ];

  return (
    <Card className="border-amber-800/30">
      <CardContent className="py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Knowledge Quiz
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {currentIdx + 1} / {questions.length}
          </Badge>
        </div>

        <p className="text-sm font-medium leading-relaxed">{q.question_text}</p>

        <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
          {options.map((opt) => (
            <div
              key={opt.key}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-card/60 transition-colors cursor-pointer"
              onClick={() => setSelectedAnswer(opt.key)}
            >
              <RadioGroupItem value={opt.key} id={`q-${currentIdx}-${opt.key}`} />
              <Label htmlFor={`q-${currentIdx}-${opt.key}`} className="text-sm cursor-pointer flex-1">
                {opt.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {currentIdx < questions.length - 1 ? "Next" : "Finish"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
