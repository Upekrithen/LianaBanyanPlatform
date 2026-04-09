import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SPICE_RACK, type SpiceType } from "@/lib/spiceRack";

type SpiceCheckboxGroupProps = {
  primarySpice: SpiceType | null;
  selected: SpiceType[];
  onChange: (next: SpiceType[]) => void;
  maxSecondary?: number;
};

export function SpiceCheckboxGroup({
  primarySpice,
  selected,
  onChange,
  maxSecondary = 3,
}: SpiceCheckboxGroupProps) {
  const selectedSet = new Set(selected);

  const toggle = (spice: SpiceType, checked: boolean) => {
    if (checked) {
      if (selectedSet.has(spice)) return;
      if (selected.length >= maxSecondary) return;
      onChange([...selected, spice]);
      return;
    }
    onChange(selected.filter((value) => value !== spice));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {SPICE_RACK.filter((spice) => spice.spice !== primarySpice).map((spice) => {
        const isChecked = selectedSet.has(spice.spice);
        const disabled = !isChecked && selected.length >= maxSecondary;
        return (
          <Label
            key={spice.spice}
            className="flex items-center gap-2 rounded border px-2 py-1.5 text-xs cursor-pointer"
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => toggle(spice.spice, checked === true)}
              disabled={disabled}
            />
            <span aria-hidden="true">{spice.emoji}</span>
            <span>{spice.displayName}</span>
          </Label>
        );
      })}
    </div>
  );
}
