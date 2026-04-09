import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const CREW_CATEGORIES = [
  "All",
  "Handyman",
  "Tutoring",
  "Delivery",
  "Pet Care",
  "Tech Support",
  "Creative",
] as const;

export type CrewCategory = (typeof CREW_CATEGORIES)[number];

type CategoryFilterBarProps = {
  value: CrewCategory;
  onChange: (next: CrewCategory) => void;
};

export function CategoryFilterBar({ value, onChange }: CategoryFilterBarProps) {
  return (
    <div className="sticky top-[4.1rem] z-20 border-b bg-background/95 py-2 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CREW_CATEGORIES.map((category) => (
          <Button
            key={category}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "shrink-0 rounded-full",
              value === category
                ? "border-primary bg-primary text-primary-foreground hover:bg-primary"
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
