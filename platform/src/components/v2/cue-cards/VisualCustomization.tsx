import { CueCardDraft } from "@/components/v2/cue-cards/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type VisualCustomizationProps = {
  draft: CueCardDraft;
  onChange: (nextDraft: CueCardDraft) => void;
};

const ACCENTS = ["#2563eb", "#16a34a", "#9333ea", "#ea580c", "#0f766e", "#ca8a04"];

export function VisualCustomization({ draft, onChange }: VisualCustomizationProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold">Visual Customization</h3>

      <div className="space-y-1.5">
        <Label>Accent color</Label>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Set color ${color}`}
              onClick={() => onChange({ ...draft, accentColor: color })}
              className="h-8 w-8 rounded-full border-2"
              style={{ backgroundColor: color, borderColor: draft.accentColor === color ? "#ffffff" : "transparent" }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Typeface</Label>
        <Select
          value={draft.fontStyle}
          onValueChange={(value) => onChange({ ...draft, fontStyle: value as CueCardDraft["fontStyle"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="clean">Clean</SelectItem>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="strong">Strong</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Image URL</Label>
        <Input
          value={draft.imageUrl}
          onChange={(event) => onChange({ ...draft, imageUrl: event.target.value })}
          placeholder="https://..."
        />
      </div>
    </section>
  );
}
