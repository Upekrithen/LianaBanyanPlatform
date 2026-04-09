import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TemplatePreset } from "./types";

type TemplateOrBlankChooserProps = {
  templates: TemplatePreset[];
  selectedTemplateId: string | null;
  onChooseTemplate: (templateId: string) => void;
  onChooseBlank: () => void;
};

export function TemplateOrBlankChooser({
  templates,
  selectedTemplateId,
  onChooseTemplate,
  onChooseBlank,
}: TemplateOrBlankChooserProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Template or blank start</h2>
        <p className="text-sm text-muted-foreground">
          Choose a head start template or begin with a blank map and build your own path.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {templates.map((template) => {
          const isActive = selectedTemplateId === template.id;
          return (
            <Card
              key={template.id}
              className={cn("border transition-colors", isActive ? "border-primary" : "border-border")}
            >
              <CardHeader className="space-y-2 pb-3">
                <CardTitle className="text-base">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-muted-foreground">
                  Suggested difficulty: <span className="font-medium capitalize">{template.suggestedDifficulty}</span>
                </p>
                <Button className="w-full" variant={isActive ? "default" : "outline"} onClick={() => onChooseTemplate(template.id)}>
                  {isActive ? "Template selected" : "Use this template"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">Start from blank</p>
            <p className="text-sm text-muted-foreground">
              Build your own sequence from the ground up.
            </p>
          </div>
          <Button variant="outline" onClick={onChooseBlank}>
            Start blank
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
