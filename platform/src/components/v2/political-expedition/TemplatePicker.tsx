import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LetterTemplateItem } from "./types";

type TemplatePickerProps = {
  templates: LetterTemplateItem[];
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
};

export function TemplatePicker({ templates, selectedTemplateId, onSelectTemplate }: TemplatePickerProps) {
  return (
    <section className="rounded-xl border p-3" data-xray-id="political-expedition-template-picker">
      <p className="text-sm font-medium">Template picker</p>
      <p className="text-xs text-muted-foreground">Templates are starting points, not mandates.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {templates.map((template) => (
          <Button
            key={template.id}
            size="sm"
            variant={selectedTemplateId === template.id ? "default" : "outline"}
            onClick={() => onSelectTemplate(template.id)}
          >
            {template.title}
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {template.topic.replace(/_/g, " ")}
            </Badge>
          </Button>
        ))}
      </div>
    </section>
  );
}
