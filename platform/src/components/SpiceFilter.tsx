import { Button } from "@/components/ui/button";
import { SPICE_RACK, SpiceType } from "@/lib/spiceRack";

type SpiceFilterProps = {
  selected: SpiceType[];
  onChange: (next: SpiceType[]) => void;
  className?: string;
};

export function SpiceFilter({ selected, onChange, className }: SpiceFilterProps) {
  const selectedSet = new Set(selected);

  const toggle = (spice: SpiceType) => {
    if (selectedSet.has(spice)) {
      onChange(selected.filter((value) => value !== spice));
      return;
    }
    onChange([...selected, spice]);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={selected.length === 0 ? "default" : "outline"}
          onClick={() => onChange([])}
        >
          All
        </Button>
        {SPICE_RACK.map((spice) => (
          <Button
            key={spice.spice}
            size="sm"
            variant={selectedSet.has(spice.spice) ? "default" : "outline"}
            onClick={() => toggle(spice.spice)}
          >
            <span className="mr-1" aria-hidden="true">{spice.emoji}</span>
            {spice.displayName}
          </Button>
        ))}
      </div>
    </div>
  );
}
