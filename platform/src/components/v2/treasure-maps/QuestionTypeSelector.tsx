import { BuilderQuestionType } from "./types";

type QuestionTypeSelectorProps = {
  value: BuilderQuestionType;
  onChange: (next: BuilderQuestionType) => void;
};

const QUESTION_TYPES: { value: BuilderQuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "multiple_select", label: "Multiple select" },
  { value: "true_false", label: "True / false" },
  { value: "short_answer", label: "Short answer" },
  { value: "ordering", label: "Ordering / sequence" },
];

export function QuestionTypeSelector({ value, onChange }: QuestionTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Question type</label>
      <select
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value as BuilderQuestionType)}
      >
        {QUESTION_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}
