/**
 * LEARNING PATHWAY DIAGRAM
 * ========================
 * Visual pathway showing how newcomers can learn, earn Marks, and unlock Golden Keys.
 * Three reading levels: Simple (ESL-friendly), Conversational, Academic.
 * Uses Expanding Retrieval Practice: quiz at end → next lesson → 5th lesson.
 *
 * Innovation #1558: Expanding Retrieval Practice Engine
 * Methodology: Ebbinghaus (1885), Leitner (1972), Roediger & Karpicke (2006)
 *
 * SEC-safe: Marks are effort-debt currency, not securities.
 */

import { BookOpen, GraduationCap, Key, Award, ArrowRight, Brain, Languages, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LearningPathwayProps {
  /** Compact mode — smaller for embedding at page bottoms */
  compact?: boolean;
}

const READING_LEVELS = [
  {
    id: "simple",
    icon: Languages,
    title: "Simple",
    subtitle: "Plain language. ESL-friendly.",
    description: "Core concepts without jargon. Designed for anyone — including readers whose first language is not English.",
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/30",
    marks: 10,
  },
  {
    id: "conversational",
    icon: FileText,
    title: "Conversational",
    subtitle: "Story-driven. Engaging.",
    description: "The same ideas told through narrative, anecdotes, and real-world examples. Designed to be read once and remembered.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    marks: 10,
  },
  {
    id: "academic",
    icon: GraduationCap,
    title: "Academic",
    subtitle: "Full research. Citations.",
    description: "Peer-review ready. Complete with methodology, data, and references. Designed for researchers, attorneys, and deep thinkers.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/30",
    marks: 10,
  },
];

const PATHWAY_STEPS = [
  {
    icon: BookOpen,
    title: "Read",
    subtitle: "Pick your level",
    detail: "Choose Simple, Conversational, or Academic. Same knowledge — different paths to get there.",
  },
  {
    icon: Brain,
    title: "Quiz",
    subtitle: "Prove understanding",
    detail: "5 questions per paper. Immediate feedback. Self-attest option if you prefer.",
  },
  {
    icon: Award,
    title: "Earn Marks",
    subtitle: "Up to 10 per paper",
    detail: "2 Marks per correct answer. Marks are effort-debt currency — spend on essentials or save as Joules.",
  },
  {
    icon: Key,
    title: "Golden Key",
    subtitle: "Unlock deeper access",
    detail: "Demonstrated comprehension unlocks content that requires understanding to appreciate.",
  },
];

export default function LearningPathway({ compact = false }: LearningPathwayProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
            Learn & Earn Pathway
          </h3>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {PATHWAY_STEPS.map((step, i) => (
              <div key={step.title} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <step.icon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-white/80 font-medium">{step.title}</span>
                </div>
                {i < PATHWAY_STEPS.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-white/30" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">
            Three reading levels. Same knowledge. Earn Marks and Golden Keys by demonstrating understanding.
          </p>
          <button
            onClick={() => navigate("/papers")}
            className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Start reading →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Learn & Earn</h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          Read our papers at whatever level feels right. Take a quiz. Earn Marks you can spend on the platform.
          Our goal is for you to learn it — not play gotcha.
        </p>
      </div>

      {/* Pathway Steps — horizontal flow */}
      <div className="flex items-start justify-center gap-4 mb-10 flex-wrap">
        {PATHWAY_STEPS.map((step, i) => (
          <div key={step.title} className="flex items-start gap-4">
            <div className="flex flex-col items-center text-center w-32">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2">
                <step.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">{step.title}</h3>
              <p className="text-xs text-white/50 mt-0.5">{step.subtitle}</p>
              <p className="text-xs text-white/30 mt-1">{step.detail}</p>
            </div>
            {i < PATHWAY_STEPS.length - 1 && (
              <ArrowRight className="w-5 h-5 text-white/20 mt-4 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Three Reading Levels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {READING_LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => navigate("/papers")}
            className={`rounded-xl border p-4 text-left transition-all hover:scale-[1.02] ${level.bgColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <level.icon className={`w-5 h-5 ${level.color}`} />
              <h3 className={`font-semibold ${level.color}`}>{level.title}</h3>
            </div>
            <p className="text-xs text-white/50 mb-2">{level.subtitle}</p>
            <p className="text-xs text-white/40">{level.description}</p>
            <div className="mt-3 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-amber-400/80">Up to {level.marks} Marks per paper</span>
            </div>
          </button>
        ))}
      </div>

      {/* Methodology note */}
      <div className="text-center">
        <p className="text-xs text-white/30 max-w-lg mx-auto">
          Our quizzes use expanding retrieval practice — the same method used in Pimsleur language learning
          and medical education. We teach first, then ask. Our goal is comprehension, not gatekeeping.
        </p>
        <p className="text-xs text-white/20 mt-1 italic">
          "Helena is the Capitol of Montana. What is the Capitol of Montana?"
        </p>
      </div>
    </div>
  );
}
