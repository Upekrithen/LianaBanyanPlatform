import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionTypeSelector } from "./QuestionTypeSelector";
import { SequenceNode } from "./types";

type NodeQuizEditorProps = {
  nodes: SequenceNode[];
  onUpdateNode: (id: string, patch: Partial<SequenceNode>) => void;
};

export function NodeQuizEditor({ nodes, onUpdateNode }: NodeQuizEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Node quiz editor</h2>
        <p className="text-sm text-muted-foreground">
          Add one question per node with multiple question types.
        </p>
      </div>

      <div className="space-y-4">
        {nodes.map((node) => (
          <Card key={node.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{node.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuestionTypeSelector value={node.questionType} onChange={(next) => onUpdateNode(node.id, { questionType: next })} />
              <div className="space-y-2">
                <label className="text-sm font-medium">Question prompt</label>
                <Textarea
                  value={node.prompt}
                  onChange={(event) => onUpdateNode(node.id, { prompt: event.target.value })}
                  placeholder="Write the learner-facing question"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Answer options (comma separated)</label>
                <Input
                  value={node.options.join(", ")}
                  onChange={(event) =>
                    onUpdateNode(node.id, {
                      options: event.target.value
                        .split(",")
                        .map((entry) => entry.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Option A, Option B, Option C"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Correct answer(s)</label>
                <Input
                  value={node.correctAnswers.join(", ")}
                  onChange={(event) =>
                    onUpdateNode(node.id, {
                      correctAnswers: event.target.value
                        .split(",")
                        .map((entry) => entry.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Correct option labels or text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Learning explanation</label>
                <Textarea
                  value={node.explanation}
                  onChange={(event) => onUpdateNode(node.id, { explanation: event.target.value })}
                  placeholder="Explain why the answer is correct"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {nodes.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Add nodes first, then quiz editors will appear here.
          </p>
        ) : null}
      </div>
    </div>
  );
}
