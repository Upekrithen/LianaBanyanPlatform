/**
 * PAPER QUIZ DIALOG — Golden Key Comprehension Quiz
 * ===================================================
 * A dialog that presents a 5-question multiple-choice quiz
 * about an academic paper from Cephas.
 *
 * Two paths to earn Marks:
 *   Path 1: "I Read the Full Paper" → 10 Marks (self-attestation, one-time)
 *   Path 2: "Take the Quiz" → 5 questions, proportional Marks (2 per correct)
 *
 * Quiz features:
 *   - Questions randomly pulled from a pool of 7-8 per paper
 *   - Shuffled answer options would require DB changes, so we keep options fixed
 *   - Score + explanation shown after completion
 *   - Best score tracked across attempts (max 3)
 *   - Golden Key visual: golden/silver/bronze/iron based on score
 *
 * Like Duolingo for academic papers.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Key,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Award,
  Loader2,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  type PaperQuiz,
  type QuizQuestion,
  type QuizAttempt,
  getQuizByPaperId,
  getQuizQuestions,
  getUserAttempts,
  submitQuizAttempt,
  recordPaperReadCompletion,
  hasCompletedPaperRead,
  calculateQuizMarks,
  getScoreLabel,
  getKeyTier,
  KEY_TIER_COLORS,
} from "@/lib/paperQuiz";
import { toast } from "sonner";

// ─── Props ───

interface PaperQuizDialogProps {
  paperId: string;
  paperTitle: string;
  paperUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

// ─── States ───

type QuizPhase =
  | "loading"
  | "choose_path"     // Choose: read full paper OR take quiz
  | "quiz_active"     // Answering questions
  | "quiz_review"     // Reviewing answers with explanations
  | "quiz_result"     // Final score + reward display
  | "read_confirmed"  // Confirmed full read
  | "no_quiz"         // No quiz available for this paper
  | "max_attempts";   // Already used all attempts

// ─── Component ───

export default function PaperQuizDialog({
  paperId,
  paperTitle,
  paperUrl,
  isOpen,
  onClose,
}: PaperQuizDialogProps) {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  // State
  const [phase, setPhase] = useState<QuizPhase>("loading");
  const [quiz, setQuiz] = useState<PaperQuiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [previousAttempts, setPreviousAttempts] = useState<QuizAttempt[]>([]);
  const [hasReadPaper, setHasReadPaper] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    marksEarned: number;
    isNewBest: boolean;
    previousBest: number;
  } | null>(null);

  // ─── Load quiz data when dialog opens ───
  const loadQuizData = useCallback(async () => {
    if (!isOpen) return;
    setPhase("loading");

    try {
      const quizData = await getQuizByPaperId(paperId);

      if (!quizData) {
        setPhase("no_quiz");
        return;
      }

      setQuiz(quizData);

      if (user) {
        const [attempts, readDone] = await Promise.all([
          getUserAttempts(quizData.id),
          hasCompletedPaperRead(paperId),
        ]);
        setPreviousAttempts(attempts);
        setHasReadPaper(readDone);

        if (attempts.length >= quizData.maxAttempts) {
          // Check if they also already read it
          if (readDone) {
            setPhase("max_attempts");
          } else {
            setPhase("choose_path");
          }
        } else {
          setPhase("choose_path");
        }
      } else {
        setPhase("choose_path");
      }
    } catch (err) {
      console.error("Failed to load quiz:", err);
      setPhase("no_quiz");
    }
  }, [isOpen, paperId, user]);

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]);

  // ─── Start the quiz ───
  const startQuiz = async () => {
    if (!user) {
      openOnboard({
        reason: "take the quiz and earn Golden Keys",
        actionLabel: "Join to Take Quiz",
      });
      return;
    }
    if (!quiz) return;

    try {
      const qs = await getQuizQuestions(quiz.id, quiz.questionCount);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(""));
      setCurrentQuestion(0);
      setResult(null);
      setPhase("quiz_active");
    } catch (err) {
      console.error("Failed to load questions:", err);
      toast.error("Failed to load quiz questions. Try again.");
    }
  };

  // ─── Select an answer ───
  const selectAnswer = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
  };

  // ─── Navigate questions ───
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
    }
  };
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((c) => c - 1);
    }
  };

  // ─── Submit the quiz ───
  const handleSubmitQuiz = async () => {
    if (!quiz || !user) return;
    setIsSubmitting(true);

    try {
      const res = await submitQuizAttempt(quiz.id, questions, answers);
      setResult({
        score: res.attempt.score,
        total: res.attempt.totalQuestions,
        marksEarned: res.marksEarned,
        isNewBest: res.isNewBest,
        previousBest: res.previousBest,
      });
      setPhase("quiz_review");
    } catch (err: any) {
      console.error("Failed to submit quiz:", err);
      toast.error(err.message || "Failed to submit quiz. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Confirm full paper read ───
  const handleReadConfirm = async () => {
    if (!user) {
      openOnboard({
        reason: "earn Golden Keys for reading papers",
        actionLabel: "Join to Earn Marks",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const completion = await recordPaperReadCompletion(paperId);
      if (completion) {
        setHasReadPaper(true);
        setPhase("read_confirmed");
        toast.success(`+${completion.marksAwarded} Marks! Golden Key earned.`);
      } else {
        toast.info("You've already earned the Golden Key for reading this paper.");
        setHasReadPaper(true);
        setPhase("choose_path");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to record completion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Rendering helpers ───

  const allAnswered = answers.every((a) => a !== "");
  const bestPreviousScore =
    previousAttempts.length > 0
      ? Math.max(...previousAttempts.map((a) => a.score))
      : 0;
  const attemptsUsed = previousAttempts.length;
  const attemptsRemaining = quiz ? quiz.maxAttempts - attemptsUsed : 0;

  // ═══════════════════════════════
  // RENDER
  // ═══════════════════════════════

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* ─── LOADING ─── */}
        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
            <p className="text-sm text-muted-foreground">Loading quiz...</p>
          </div>
        )}

        {/* ─── NO QUIZ AVAILABLE ─── */}
        {phase === "no_quiz" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                {paperTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground mb-4">
                No quiz available for this paper yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Quizzes are being added to more papers. Check back soon, or
                contribute quiz questions to earn Marks.
              </p>
              {paperUrl && (
                <Button
                  variant="outline"
                  className="mt-4 gap-1.5"
                  onClick={() => window.open(paperUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Read the Paper
                </Button>
              )}
            </div>
          </>
        )}

        {/* ─── CHOOSE PATH ─── */}
        {phase === "choose_path" && quiz && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                Golden Key — {paperTitle}
              </DialogTitle>
              <DialogDescription>
                Two paths to earn your Golden Key
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Previous best badge */}
              {bestPreviousScore > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Best score: {bestPreviousScore}/{quiz.questionCount} (
                  {calculateQuizMarks(bestPreviousScore, quiz.marksPerCorrect)}{" "}
                  Marks earned)
                </div>
              )}

              {/* Path 1: Read Full Paper */}
              <Card
                className={`cursor-pointer transition-all hover:border-emerald-400 ${
                  hasReadPaper
                    ? "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10"
                    : "hover:shadow-md"
                }`}
                onClick={() => !hasReadPaper && handleReadConfirm()}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <BookOpen className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">
                        {hasReadPaper
                          ? "Paper Read — Golden Key Earned!"
                          : "I Read the Full Paper"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {hasReadPaper
                          ? `You earned ${quiz.fullReadMarks} Marks for reading this paper.`
                          : `Self-attest that you read the complete paper. Earn ${quiz.fullReadMarks} Marks immediately.`}
                      </p>
                      {!hasReadPaper && (
                        <div className="flex items-center gap-3 mt-3">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            <Award className="h-3 w-3 mr-1" />
                            {quiz.fullReadMarks} Marks
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            One-time per paper
                          </span>
                        </div>
                      )}
                      {hasReadPaper && (
                        <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Path 2: Take the Quiz */}
              <Card
                className={`cursor-pointer transition-all hover:border-amber-400 hover:shadow-md ${
                  attemptsRemaining <= 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => attemptsRemaining > 0 && startQuiz()}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Key className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">
                        Take the Comprehension Quiz
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {quiz.questionCount} questions about the paper.{" "}
                        {quiz.marksPerCorrect} Marks per correct answer (up to{" "}
                        {quiz.questionCount * quiz.marksPerCorrect}).
                      </p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                          <Key className="h-3 w-3 mr-1" />
                          Up to{" "}
                          {quiz.questionCount * quiz.marksPerCorrect} Marks
                        </Badge>
                        {attemptsRemaining > 0 ? (
                          <span className="text-xs text-muted-foreground">
                            {attemptsRemaining} attempt
                            {attemptsRemaining !== 1 ? "s" : ""} remaining
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            No attempts remaining
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Link to paper */}
              {paperUrl && (
                <div className="text-center pt-2">
                  <Button
                    variant="link"
                    className="gap-1.5 text-sm"
                    onClick={() => window.open(paperUrl, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Read the paper on Cephas first
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── QUIZ ACTIVE ─── */}
        {phase === "quiz_active" && questions.length > 0 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" />
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <Badge variant="outline" className="text-xs">
                  {answers.filter((a) => a !== "").length}/{questions.length}{" "}
                  answered
                </Badge>
              </DialogTitle>
            </DialogHeader>

            {/* Progress bar */}
            <Progress
              value={((currentQuestion + 1) / questions.length) * 100}
              className="h-1.5"
            />

            {/* Question */}
            <div className="mt-4 space-y-4">
              <p className="text-base font-medium leading-relaxed">
                {questions[currentQuestion].questionText}
              </p>

              {/* Answer options */}
              <div className="space-y-2">
                {(["a", "b", "c", "d"] as const).map((option) => {
                  const optionText =
                    option === "a"
                      ? questions[currentQuestion].optionA
                      : option === "b"
                        ? questions[currentQuestion].optionB
                        : option === "c"
                          ? questions[currentQuestion].optionC
                          : questions[currentQuestion].optionD;
                  const isSelected = answers[currentQuestion] === option;

                  return (
                    <button
                      key={option}
                      onClick={() => selectAnswer(option)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                          : "border-transparent bg-muted/50 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <span className="flex items-start gap-2.5">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${
                            isSelected
                              ? "bg-amber-500 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {option.toUpperCase()}
                        </span>
                        <span className="text-sm leading-relaxed">
                          {optionText}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Question dots */}
              <div className="flex gap-1.5">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentQuestion
                        ? "bg-amber-500 scale-125"
                        : answers[i]
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                ))}
              </div>

              {currentQuestion < questions.length - 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextQuestion}
                  className="gap-1"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered || isSubmitting}
                  className="gap-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Grading..." : "Submit Quiz"}
                </Button>
              )}
            </div>
          </>
        )}

        {/* ─── QUIZ REVIEW (answers + explanations) ─── */}
        {phase === "quiz_review" && result && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                Quiz Review — {paperTitle}
              </DialogTitle>
              <DialogDescription>
                {result.score}/{result.total} correct —{" "}
                {getScoreLabel(result.score, result.total)}
              </DialogDescription>
            </DialogHeader>

            {/* Score summary */}
            <div
              className={`rounded-lg p-4 border-2 ${
                KEY_TIER_COLORS[getKeyTier(result.score, result.total)].bg
              } ${
                KEY_TIER_COLORS[getKeyTier(result.score, result.total)].border
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key
                    className={`h-8 w-8 ${
                      KEY_TIER_COLORS[getKeyTier(result.score, result.total)]
                        .icon
                    }`}
                  />
                  <div>
                    <p className="font-bold text-lg">
                      {result.score}/{result.total}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getKeyTier(result.score, result.total).charAt(0).toUpperCase() +
                        getKeyTier(result.score, result.total).slice(1)}{" "}
                      Key
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {result.marksEarned > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <span className="text-lg font-bold text-amber-600">
                        +{result.marksEarned} Marks
                      </span>
                    </div>
                  ) : result.isNewBest ? (
                    <Badge className="bg-amber-500/10 text-amber-600">
                      New Best!
                    </Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Best: {result.previousBest}/{result.total}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Question-by-question review */}
            <div className="space-y-3 max-h-[40vh] overflow-y-auto mt-2">
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect =
                  userAnswer?.toLowerCase() === q.correctOption;
                const correctText =
                  q.correctOption === "a"
                    ? q.optionA
                    : q.correctOption === "b"
                      ? q.optionB
                      : q.correctOption === "c"
                        ? q.optionC
                        : q.optionD;

                return (
                  <div
                    key={q.id}
                    className={`rounded-lg p-3 border ${
                      isCorrect
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">
                          {q.questionText}
                        </p>
                        {!isCorrect && (
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                            Correct: {q.correctOption.toUpperCase()}.{" "}
                            {correctText}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Done
              </Button>
              <div className="flex gap-2">
                {attemptsRemaining > 0 && result.score < result.total && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startQuiz}
                    className="gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Try Again ({attemptsRemaining} left)
                  </Button>
                )}
                {paperUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(paperUrl, "_blank")}
                    className="gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Re-read Paper
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ─── READ CONFIRMED ─── */}
        {phase === "read_confirmed" && quiz && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                Golden Key Earned!
              </DialogTitle>
            </DialogHeader>

            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4">
                <Key className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                +{quiz.fullReadMarks} Marks
              </h3>
              <p className="text-muted-foreground mb-1">{paperTitle}</p>
              <p className="text-sm text-muted-foreground">
                Thank you for engaging deeply with the material.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Done
              </Button>
              {attemptsRemaining > 0 && (
                <Button
                  onClick={startQuiz}
                  className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Key className="h-4 w-4" />
                  Also Take the Quiz
                </Button>
              )}
            </div>
          </>
        )}

        {/* ─── MAX ATTEMPTS ─── */}
        {phase === "max_attempts" && quiz && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                {paperTitle}
              </DialogTitle>
            </DialogHeader>

            <div className="text-center py-6">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-lg font-bold mb-2">All Attempts Used</h3>
              <p className="text-muted-foreground mb-4">
                You've used all {quiz.maxAttempts} quiz attempts for this paper.
              </p>
              {bestPreviousScore > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full">
                  <Key className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">
                    Best: {bestPreviousScore}/{quiz.questionCount} (
                    {calculateQuizMarks(bestPreviousScore, quiz.marksPerCorrect)}{" "}
                    Marks)
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
