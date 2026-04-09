import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { StorefrontType } from "@/components/v2/storefront/types";

const TYPE_OPTIONS: Array<{ value: StorefrontType; label: string; description: string }> = [
  { value: "food", label: "Food", description: "Menus, meal drops, and local pickup." },
  { value: "crafts", label: "Crafts", description: "Handmade products and custom builds." },
  { value: "services", label: "Services", description: "Bookings, packages, and local work." },
  { value: "digital", label: "Digital", description: "Downloads, files, and digital access." },
];

type StorefrontTypeSelectorProps = {
  value: StorefrontType;
  onChange: (value: StorefrontType) => void;
};

export function StorefrontTypeSelector({ value, onChange }: StorefrontTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Choose Storefront Type</h2>
      <RadioGroup
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as StorefrontType)}
        className="grid gap-3 sm:grid-cols-2"
      >
        {TYPE_OPTIONS.map((option) => (
          <Label
            key={option.value}
            htmlFor={`storefront-type-${option.value}`}
            className={cn(
              "block cursor-pointer rounded-lg border p-4 transition-colors",
              value === option.value ? "border-primary bg-primary/10" : "border-border hover:bg-card/70",
            )}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem
                value={option.value}
                id={`storefront-type-${option.value}`}
                className="mt-1"
              />
              <div className="space-y-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
