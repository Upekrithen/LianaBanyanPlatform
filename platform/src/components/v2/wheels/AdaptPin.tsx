import { Badge } from "@/components/ui/badge";

type AdaptPinProps = {
  label: string;
  adaptLabel: string;
};

export function AdaptPin({ label, adaptLabel }: AdaptPinProps) {
  return (
    <div className="rounded-lg border bg-background/90 px-2 py-1 shadow-sm">
      <p className="text-[11px] font-semibold leading-tight">{label}</p>
      <Badge variant="secondary" className="mt-1 text-[10px]">
        ADAPT {adaptLabel}
      </Badge>
    </div>
  );
}
