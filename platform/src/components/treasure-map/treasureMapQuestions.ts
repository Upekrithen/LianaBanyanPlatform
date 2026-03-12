/**
 * TREASURE MAP — Question definitions and option tags
 * Used by the 7-question quiz to collect tags for the scoring engine.
 */

export type QuestionType = "single" | "multi";
export type OptionTag = string;

export interface QuestionOption {
  id: string;
  label: string;
  tags: OptionTag[];
}

export interface TreasureMapQuestionDef {
  id: string;
  question: string;
  type: QuestionType;
  options: QuestionOption[];
  microcopy?: string;
  maxSelections?: number; // for multi-select, e.g. 2 for "pick up to 2"
}

export const TREASURE_MAP_QUESTIONS: TreasureMapQuestionDef[] = [
  {
    id: "q1",
    question: "What do you want to use to earn first?",
    type: "single",
    options: [
      { id: "labor", label: "My time and effort", tags: ["labor"] },
      { id: "skills", label: "My skills or knowledge", tags: ["skills"] },
      { id: "assets", label: "My car, kitchen, or tools", tags: ["assets"] },
      { id: "explore", label: "I'm not sure — show me options", tags: ["explore"] },
    ],
    microcopy: "You can change this later. This just helps us steer you.",
  },
  {
    id: "q2",
    question: "In a normal week, what's easier for you to spare?",
    type: "single",
    options: [
      { id: "batch", label: "3–5 hours in a row", tags: ["batch"] },
      { id: "moderate", label: "1–2 hours at a time", tags: ["moderate"] },
      { id: "micro", label: "20–30 minutes here and there", tags: ["micro"] },
    ],
  },
  {
    id: "q3",
    question: "Which kinds of work sound least awful? Pick up to 2.",
    type: "multi",
    maxSelections: 2,
    options: [
      { id: "food", label: "Cooking, food prep, or errands", tags: ["food"] },
      { id: "delivery", label: "Lifting, driving, delivering", tags: ["delivery"] },
      { id: "people", label: "Talking with people, caregiving, teaching", tags: ["people"] },
      { id: "ops", label: "Fixing, organizing, behind-the-scenes", tags: ["ops"] },
      { id: "digital", label: "Creative or computer work", tags: ["digital"] },
    ],
  },
  {
    id: "q4",
    question: "What do you already have access to?",
    type: "multi",
    options: [
      { id: "car", label: "A car I can use", tags: ["car"] },
      { id: "kitchen", label: "A kitchen where I can batch cook", tags: ["kitchen"] },
      { id: "phone", label: "Smartphone with data", tags: ["phone"] },
      { id: "computer", label: "Laptop or desktop", tags: ["computer"] },
      { id: "minimal", label: "None of these — I'll start simple", tags: ["minimal"] },
    ],
  },
  {
    id: "q5",
    question: "How do you feel about working with strangers at first?",
    type: "single",
    options: [
      { id: "open", label: "Totally fine, if it's structured", tags: ["open"] },
      { id: "referral", label: "Prefer friends of friends", tags: ["referral"] },
      { id: "remote", label: "Prefer to start fully online", tags: ["remote"] },
    ],
    microcopy: "We always show you who's involved before anything happens.",
  },
  {
    id: "q6",
    question: "In the next 30 days, what matters most?",
    type: "single",
    options: [
      { id: "fast", label: "Get cash as quickly as possible", tags: ["fast"] },
      { id: "build", label: "Start something that could grow", tags: ["build"] },
      { id: "explore", label: "Try a few safe experiments", tags: ["explore"] },
    ],
  },
  {
    id: "q7",
    question: "After working with you, how do you want people to describe you?",
    type: "single",
    options: [
      { id: "reliable", label: "Reliable — they always show up", tags: ["reliable"] },
      { id: "caring", label: "Caring — they really looked out for me", tags: ["caring"] },
      { id: "creative", label: "Creative — they brought cool ideas", tags: ["creative"] },
      { id: "efficient", label: "Efficient — they got things done fast", tags: ["efficient"] },
    ],
  },
];

export const TOTAL_QUESTIONS = TREASURE_MAP_QUESTIONS.length;
