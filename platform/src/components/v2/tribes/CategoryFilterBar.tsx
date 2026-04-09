import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const TRIBE_CATEGORIES = [
  "Neighborhood",
  "Interest",
  "Hobby",
  "Family",
  "All",
] as const;

export type TribeCategory = (typeof TRIBE_CATEGORIES)[number];

type CategoryFilterBarProps = {
  value: TribeCategory;
  onChange: (next: TribeCategory) => void;
};

export function CategoryFilterBar({ value, onChange }: CategoryFilterBarProps) {
  return (
    <div className="sticky top-[4.1rem] z-20 border-b bg-background/95 py-2 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TRIBE_CATEGORIES.map((category) => (
          <Button
            key={category}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "shrink-0 rounded-full",
              value === category
                ? "border-orange-500 bg-orange-500 text-white hover:bg-orange-500"
                : "bg-background text-muted-foreground",
            )}
            onClick={() => onChange(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
