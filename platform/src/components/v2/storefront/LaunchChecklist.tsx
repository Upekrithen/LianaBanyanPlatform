import { ChecklistItem } from "@/components/v2/storefront/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type LaunchChecklistProps = {
  items: ChecklistItem[];
  onToggleItem: (itemId: string, checked: boolean) => void;
};

export function LaunchChecklist({ items, onToggleItem }: LaunchChecklistProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Launch Checklist</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox
              id={`launch-check-${item.id}`}
              checked={item.checked}
              onCheckedChange={(next) => onToggleItem(item.id, next === true)}
              className="mt-0.5"
            />
            <Label htmlFor={`launch-check-${item.id}`} className="cursor-pointer leading-5">
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
