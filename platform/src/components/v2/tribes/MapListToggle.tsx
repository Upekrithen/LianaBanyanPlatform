import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TribeDirectoryView = "map" | "list";

type MapListToggleProps = {
  value: TribeDirectoryView;
  onChange: (next: TribeDirectoryView) => void;
};

export function MapListToggle({ value, onChange }: MapListToggleProps) {
  return (
    <div className="inline-flex rounded-lg border p-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={cn(value === "map" ? "bg-muted text-foreground" : "text-muted-foreground")}
        onClick={() => onChange("map")}
      >
        Map
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={cn(value === "list" ? "bg-muted text-foreground" : "text-muted-foreground")}
        onClick={() => onChange("list")}
      >
        List
      </Button>
    </div>
  );
}
