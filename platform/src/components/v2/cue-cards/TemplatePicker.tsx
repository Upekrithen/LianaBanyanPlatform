import { CueCardTemplate } from "@/components/v2/cue-cards/types";
import { cn } from "@/lib/utils";

type TemplatePickerProps = {
  templates: CueCardTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
};

export function TemplatePicker({ templates, selectedTemplateId, onSelectTemplate }: TemplatePickerProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Choose a starter layout</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const selected = selectedTemplateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template.id)}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                selected ? "border-primary bg-primary/10" : "border-border hover:bg-card/70",
              )}
            >
              <p className="font-semibold">{template.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{template.headline}</p>
              <p className="mt-3 text-xs">
                <span className="text-muted-foreground">Recommended for:</span>{" "}
                <span className="font-medium">{template.recommendedFor}</span>
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
