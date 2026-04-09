import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type WorkProfileQuestionnaireProps = {
  primaryWork: string;
  currentTools: string;
  onPrimaryWorkChange: (value: string) => void;
  onCurrentToolsChange: (value: string) => void;
};

export function WorkProfileQuestionnaire({
  primaryWork,
  currentTools,
  onPrimaryWorkChange,
  onCurrentToolsChange,
}: WorkProfileQuestionnaireProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">What work are you doing most often?</label>
        <Input
          value={primaryWork}
          onChange={(event) => onPrimaryWorkChange(event.target.value)}
          placeholder="Example: Short-run molded parts for fixtures and repair jobs."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">What tools are you already using?</label>
        <Textarea
          value={currentTools}
          onChange={(event) => onCurrentToolsChange(event.target.value)}
          placeholder="Example: Bench press, compact heater, hand tools, and one vented corner."
          rows={4}
        />
      </div>
    </div>
  );
}
