import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type PublishChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

type PublishChecklistProps = {
  items: PublishChecklistItem[];
  publishDisabled: boolean;
  publishing: boolean;
  onToggle: (id: string, next: boolean) => void;
  onPublish: () => void;
  onSaveDraft: () => void;
};

export function PublishChecklist({
  items,
  publishDisabled,
  publishing,
  onToggle,
  onPublish,
  onSaveDraft,
}: PublishChecklistProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Publish checklist</h2>
        <p className="text-sm text-muted-foreground">
          Complete each check before publishing your map.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox
              id={`publish-check-${item.id}`}
              checked={item.checked}
              onCheckedChange={(value) => onToggle(item.id, value === true)}
              className="mt-0.5"
            />
            <Label htmlFor={`publish-check-${item.id}`} className="cursor-pointer leading-5">
              {item.label}
            </Label>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onSaveDraft}>
          Save Draft
        </Button>
        <Button disabled={publishDisabled || publishing} onClick={onPublish}>
          {publishing ? "Publishing..." : "Publish Map"}
        </Button>
      </div>
    </div>
  );
}
