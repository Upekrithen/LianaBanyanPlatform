import { Textarea } from "@/components/ui/textarea";

type CanonicalComposerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

export function CanonicalComposer({ value, onChange, disabled }: CanonicalComposerProps) {
  return (
    <section className="space-y-2 rounded-xl border bg-card/60 p-4">
      <h2 className="text-base font-semibold">Canonical Composer</h2>
      <p className="text-sm text-muted-foreground">
        Write one canonical message here. Channel-level variations stay at the edge.
      </p>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={disabled ? "Fill intent to unlock canonical composition." : "Compose your canonical message."}
        rows={10}
      />
    </section>
  );
}
