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
  // Q8–Q10: Keirsey-informed (temperament hint); tags used for play weighting & Ambassador focus
  {
    id: "q8",
    question: "When you're learning something new, you prefer to:",
    type: "single",
    options: [
      { id: "q8_sj", label: "Follow step-by-step instructions", tags: ["temperament_sj"] },
      { id: "q8_sp", label: "Jump in and figure it out as you go", tags: ["temperament_sp"] },
      { id: "q8_nf", label: "Understand the big picture and purpose first", tags: ["temperament_nf"] },
      { id: "q8_nt", label: "Analyze the system and find the logic behind it", tags: ["temperament_nt"] },
    ],
    microcopy: "No wrong answers — this helps us match you to the right path.",
  },
  {
    id: "q9",
    question: "In a group project, you naturally tend to:",
    type: "single",
    options: [
      { id: "q9_sj", label: "Make sure everyone follows the plan", tags: ["temperament_sj"] },
      { id: "q9_sp", label: "Handle the hands-on work", tags: ["temperament_sp"] },
      { id: "q9_nf", label: "Keep the team motivated and connected", tags: ["temperament_nf"] },
      { id: "q9_nt", label: "Optimize the process and spot inefficiencies", tags: ["temperament_nt"] },
    ],
  },
  {
    id: "q10",
    question: "What sounds most rewarding?",
    type: "single",
    options: [
      { id: "q10_sj", label: "Building something reliable that people depend on", tags: ["temperament_sj"] },
      { id: "q10_sp", label: "Creating something with your hands that you can see and touch", tags: ["temperament_sp"] },
      { id: "q10_nf", label: "Helping someone discover what they're good at", tags: ["temperament_nf"] },
      { id: "q10_nt", label: "Solving a problem nobody else has figured out yet", tags: ["temperament_nt"] },
    ],
  },
];

export const TOTAL_QUESTIONS = TREASURE_MAP_QUESTIONS.length;
