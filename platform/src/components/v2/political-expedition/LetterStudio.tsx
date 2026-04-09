import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MicroNote } from "./MicroNote";

type LetterStudioProps = {
  letter: string;
  onLetterChange: (letter: string) => void;
};

export function LetterStudio({ letter, onLetterChange }: LetterStudioProps) {
  return (
    <Card data-xray-id="political-expedition-letter-studio">
      <CardHeader>
        <CardTitle>Letter Studio</CardTitle>
        <CardDescription>Issue, district, and bill-aware draft area with argument coaching notes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <MicroNote text="Opening: state your local concern clearly before you mention a bill number." />
        <MicroNote text="Middle: connect the bill to one practical outcome in your district." />
        <MicroNote text="Closing: ask for one specific action (support, oppose, amend, or clarify)." />
        <div>
          <Label htmlFor="political-letter-editor">Draft letter</Label>
          <Textarea
            id="political-letter-editor"
            className="mt-1 min-h-[240px] md:min-h-[320px]"
            value={letter}
            onChange={(event) => onLetterChange(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
