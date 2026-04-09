import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPICE_RACK, type SpiceType } from "@/lib/spiceRack";

type SpiceDropdownProps = {
  value: SpiceType | null;
  onChange: (value: SpiceType) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function SpiceDropdown({
  value,
  onChange,
  placeholder = "Select spice",
  disabled = false,
}: SpiceDropdownProps) {
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(next) => onChange(next as SpiceType)}
      disabled={disabled}
    >
      <SelectTrigger className="min-w-[150px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {SPICE_RACK.map((spice) => (
          <SelectItem key={spice.spice} value={spice.spice}>
            <span className="mr-2" aria-hidden="true">
              {spice.emoji}
            </span>
            {spice.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
