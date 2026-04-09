export type BuilderQuestionType =
  | "multiple_choice"
  | "multiple_select"
  | "true_false"
  | "short_answer"
  | "ordering";

export type RewardConfig = {
  marks: number;
  joules: number;
  badge: string;
};

export type DifficultyTier = "starter" | "guided" | "challenging";

export type CephasLibraryItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  updated_at: string | null;
};

export type SequenceNode = {
  id: string;
  contentId: string;
  title: string;
  slug: string;
  category: string;
  notes: string;
  questionType: BuilderQuestionType;
  prompt: string;
  options: string[];
  correctAnswers: string[];
  explanation: string;
};

export type TemplatePreset = {
  id: string;
  title: string;
  description: string;
  suggestedDifficulty: DifficultyTier;
};
