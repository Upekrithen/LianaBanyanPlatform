/**
 * PAPER QUIZ SYSTEM — Golden Key Comprehension Quizzes
 * =====================================================
 * Read the full paper → 10 Mark Golden Key.
 * Take a 5-question quiz → proportional Marks:
 *   5 correct = 10, 4 = 8, 3 = 6, 2 = 4, 1 = 2, 0 = 0
 *
 * The quiz tests genuine comprehension, not memorization.
 * Questions are randomized from a larger pool (8+ per paper).
 * Multiple attempts allowed (max 3), but only best score counts.
 *
 * Like the Golden Key Quest treasure hunts, but for
 * deeper engagement with academic content.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ───

export interface PaperQuiz {
  id: string;
  paperId: string;
  paperTitle: string;
  paperUrl: string | null;
  questionCount: number;
  marksPerCorrect: number;
  fullReadMarks: number;
  maxAttempts: number;
  isActive: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "a" | "b" | "c" | "d";
  difficulty: number;
  explanation: string | null;
  sortOrder: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  questionsPresented: string[];
  answersGiven: string[];
  correctAnswers: string[];
  score: number;
  totalQuestions: number;
  marksAwarded: number;
  isBestAttempt: boolean;
  completedAt: string;
}

export interface PaperReadCompletion {
  id: string;
  userId: string;
  paperId: string;
  marksAwarded: number;
  readStartedAt: string | null;
  readCompletedAt: string;
}

// ─── Scoring ───

/**
 * Calculate Marks earned from a quiz score.
 * Founder's spec: 5 correct = 10, 4 = 8, 3 = 6, 2 = 4, 1 = 2, 0 = 0
 *
 * General formula: score * marksPerCorrect (default 2)
 */
export function calculateQuizMarks(
  score: number,
  marksPerCorrect: number = 2,
): number {
  return Math.max(0, score * marksPerCorrect);
}

/**
 * Score label based on quiz performance.
 */
export function getScoreLabel(score: number, total: number): string {
  const pct = total > 0 ? score / total : 0;
  if (pct === 1) return "Perfect! You clearly read the paper.";
  if (pct >= 0.8) return "Excellent comprehension!";
  if (pct >= 0.6) return "Good understanding. Try again for more Marks?";
  if (pct >= 0.4) return "Partial understanding. The paper has more to teach you.";
  if (pct >= 0.2) return "You might want to revisit the paper.";
  return "Looks like the paper needs a closer read.";
}

/**
 * Golden Key visual tier based on quiz score.
 */
export function getKeyTier(
  score: number,
  total: number,
): "golden" | "silver" | "bronze" | "iron" {
  const pct = total > 0 ? score / total : 0;
  if (pct === 1) return "golden";
  if (pct >= 0.8) return "silver";
  if (pct >= 0.4) return "bronze";
  return "iron";
}

export const KEY_TIER_COLORS = {
  golden: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-600",
    icon: "text-amber-500",
  },
  silver: {
    bg: "bg-slate-300/10",
    border: "border-slate-400/30",
    text: "text-slate-600",
    icon: "text-slate-400",
  },
  bronze: {
    bg: "bg-orange-700/10",
    border: "border-orange-700/30",
    text: "text-orange-700",
    icon: "text-orange-600",
  },
  iron: {
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    text: "text-gray-600",
    icon: "text-gray-500",
  },
};

// ─── Fisher-Yates Shuffle ───

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── API Functions ───

/**
 * Get all active quizzes.
 */
export async function getActiveQuizzes(): Promise<PaperQuiz[]> {
  const { data, error } = await supabase
    .from("paper_quizzes" as any)
    .select("*")
    .eq("is_active", true)
    .order("paper_title");

  if (error) throw error;
  return ((data as any[]) || []).map(mapQuiz);
}

/**
 * Get a specific quiz by paper_id.
 */
export async function getQuizByPaperId(
  paperId: string,
): Promise<PaperQuiz | null> {
  const { data, error } = await supabase
    .from("paper_quizzes" as any)
    .select("*")
    .eq("paper_id", paperId)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? mapQuiz(data as any) : null;
}

/**
 * Get quiz questions, shuffled and limited to questionCount.
 * Returns questions WITHOUT correct answers for display.
 */
export async function getQuizQuestions(
  quizId: string,
  count: number = 5,
): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from("paper_quiz_questions" as any)
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order");

  if (error) throw error;

  const allQuestions = ((data as any[]) || []).map(mapQuestion);

  // Shuffle and take `count` questions
  // Try to include a mix of difficulties: 2 easy, 2 medium, 1 hard
  const easy = shuffleArray(allQuestions.filter((q) => q.difficulty === 1));
  const medium = shuffleArray(allQuestions.filter((q) => q.difficulty === 2));
  const hard = shuffleArray(allQuestions.filter((q) => q.difficulty === 3));

  const selected: QuizQuestion[] = [];
  // Take up to 2 easy
  selected.push(...easy.slice(0, 2));
  // Take up to 2 medium
  selected.push(...medium.slice(0, 2));
  // Take up to 1 hard
  selected.push(...hard.slice(0, 1));

  // If we don't have enough, fill from remaining pool
  if (selected.length < count) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const remaining = shuffleArray(
      allQuestions.filter((q) => !selectedIds.has(q.id)),
    );
    selected.push(...remaining.slice(0, count - selected.length));
  }

  // Shuffle final selection so difficulty order isn't predictable
  return shuffleArray(selected).slice(0, count);
}

/**
 * Get user's previous attempts for a specific quiz.
 */
export async function getUserAttempts(
  quizId: string,
): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from("paper_quiz_attempts" as any)
    .select("*")
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return ((data as any[]) || []).map(mapAttempt);
}

/**
 * Get user's best attempt for a specific quiz.
 */
export async function getUserBestAttempt(
  quizId: string,
): Promise<QuizAttempt | null> {
  const { data, error } = await supabase
    .from("paper_quiz_attempts" as any)
    .select("*")
    .eq("quiz_id", quizId)
    .eq("is_best_attempt", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? mapAttempt(data as any) : null;
}

/**
 * Submit a quiz attempt.
 * Calculates score, awards Marks if best attempt, returns result.
 */
export async function submitQuizAttempt(
  quizId: string,
  questions: QuizQuestion[],
  userAnswers: string[],
): Promise<{
  attempt: QuizAttempt;
  isNewBest: boolean;
  previousBest: number;
  marksEarned: number;
}> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Must be logged in");
  const userId = userData.user.id;

  // Score the attempt
  let score = 0;
  const correctAnswers = questions.map((q) => q.correctOption);
  for (let i = 0; i < questions.length; i++) {
    if (
      userAnswers[i]?.toLowerCase() === correctAnswers[i]?.toLowerCase()
    ) {
      score++;
    }
  }

  // Get quiz info for marks calculation
  const quiz = await getQuizByQuizId(quizId);
  if (!quiz) throw new Error("Quiz not found");

  const marksForThisScore = calculateQuizMarks(score, quiz.marksPerCorrect);

  // Check previous best
  const prevAttempts = await getUserAttempts(quizId);
  const previousBest = prevAttempts.length > 0
    ? Math.max(...prevAttempts.map((a) => a.score))
    : 0;
  const previousBestMarks = calculateQuizMarks(previousBest, quiz.marksPerCorrect);

  const isNewBest = score > previousBest;

  // Only award ADDITIONAL marks (difference between new best and previous best)
  const marksEarned = isNewBest
    ? marksForThisScore - previousBestMarks
    : 0;

  // If this is a new best, un-mark the old best
  if (isNewBest && prevAttempts.length > 0) {
    const oldBest = prevAttempts.find((a) => a.isBestAttempt);
    if (oldBest) {
      await supabase
        .from("paper_quiz_attempts" as any)
        .update({ is_best_attempt: false })
        .eq("id", oldBest.id);
    }
  }

  // Insert the attempt
  const { data, error } = await supabase
    .from("paper_quiz_attempts" as any)
    .insert({
      user_id: userId,
      quiz_id: quizId,
      questions_presented: questions.map((q) => q.id),
      answers_given: userAnswers.map((a) => a.toLowerCase()),
      correct_answers: correctAnswers,
      score,
      total_questions: questions.length,
      marks_awarded: marksEarned,
      is_best_attempt: isNewBest || prevAttempts.length === 0,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    attempt: mapAttempt(data as any),
    isNewBest: isNewBest || prevAttempts.length === 0,
    previousBest,
    marksEarned,
  };
}

/**
 * Record a full-paper read completion ("I read the whole thing").
 * Returns null if already completed for this paper.
 */
export async function recordPaperReadCompletion(
  paperId: string,
  readStartedAt?: Date,
): Promise<PaperReadCompletion | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Must be logged in");

  // Get quiz info for marks value
  const quiz = await getQuizByPaperId(paperId);
  const fullReadMarks = quiz?.fullReadMarks || 10;

  const { data, error } = await supabase
    .from("paper_read_completions" as any)
    .insert({
      user_id: userData.user.id,
      paper_id: paperId,
      marks_awarded: fullReadMarks,
      read_started_at: readStartedAt?.toISOString() || null,
    })
    .select()
    .single();

  // Unique constraint violation = already completed
  if (error && error.code === "23505") return null;
  if (error) throw error;

  return mapReadCompletion(data as any);
}

/**
 * Check if user has already read a paper.
 */
export async function hasCompletedPaperRead(
  paperId: string,
): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data, error } = await supabase
    .from("paper_read_completions" as any)
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("paper_id", paperId)
    .single();

  if (error && error.code !== "PGRST116") return false;
  return !!data;
}

/**
 * Get all user's paper completions (read + quiz).
 */
export async function getUserPaperProgress(): Promise<{
  reads: PaperReadCompletion[];
  quizBests: QuizAttempt[];
}> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { reads: [], quizBests: [] };

  const [readsResult, quizResult] = await Promise.all([
    supabase
      .from("paper_read_completions" as any)
      .select("*")
      .eq("user_id", userData.user.id)
      .order("read_completed_at", { ascending: false }),
    supabase
      .from("paper_quiz_attempts" as any)
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("is_best_attempt", true)
      .order("completed_at", { ascending: false }),
  ]);

  return {
    reads: ((readsResult.data as any[]) || []).map(mapReadCompletion),
    quizBests: ((quizResult.data as any[]) || []).map(mapAttempt),
  };
}

// ─── Internal Helpers ───

async function getQuizByQuizId(quizId: string): Promise<PaperQuiz | null> {
  const { data, error } = await supabase
    .from("paper_quizzes" as any)
    .select("*")
    .eq("id", quizId)
    .single();

  if (error) return null;
  return data ? mapQuiz(data as any) : null;
}

function mapQuiz(row: any): PaperQuiz {
  return {
    id: row.id,
    paperId: row.paper_id,
    paperTitle: row.paper_title,
    paperUrl: row.paper_url,
    questionCount: row.question_count,
    marksPerCorrect: row.marks_per_correct,
    fullReadMarks: row.full_read_marks,
    maxAttempts: row.max_attempts,
    isActive: row.is_active,
  };
}

function mapQuestion(row: any): QuizQuestion {
  return {
    id: row.id,
    quizId: row.quiz_id,
    questionText: row.question_text,
    optionA: row.option_a,
    optionB: row.option_b,
    optionC: row.option_c,
    optionD: row.option_d,
    correctOption: row.correct_option,
    difficulty: row.difficulty,
    explanation: row.explanation,
    sortOrder: row.sort_order,
  };
}

function mapAttempt(row: any): QuizAttempt {
  return {
    id: row.id,
    userId: row.user_id,
    quizId: row.quiz_id,
    questionsPresented: row.questions_presented || [],
    answersGiven: row.answers_given || [],
    correctAnswers: row.correct_answers || [],
    score: row.score,
    totalQuestions: row.total_questions,
    marksAwarded: row.marks_awarded,
    isBestAttempt: row.is_best_attempt,
    completedAt: row.completed_at,
  };
}

function mapReadCompletion(row: any): PaperReadCompletion {
  return {
    id: row.id,
    userId: row.user_id,
    paperId: row.paper_id,
    marksAwarded: row.marks_awarded,
    readStartedAt: row.read_started_at,
    readCompletedAt: row.read_completed_at,
  };
}
