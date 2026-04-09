import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type IntentFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function IntentField({ value, onChange }: IntentFieldProps) {
  return (
    <section className="space-y-2">
      <Label htmlFor="dispatch-intent" className="text-base font-semibold">
        What change are you trying to make?
      </Label>
      <Input
        id="dispatch-intent"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Moving members from X to Y"
      />
    </section>
  );
}
