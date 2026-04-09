import { Lightbulb } from "lucide-react";

type MicroNoteProps = {
  text: string;
};

export function MicroNote({ text }: MicroNoteProps) {
  return (
    <div className="flex items-start gap-2 rounded-md border bg-muted/20 px-2.5 py-2" data-xray-id="political-expedition-micro-note">
      <Lightbulb className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}
