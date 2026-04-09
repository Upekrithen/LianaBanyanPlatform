import { Card } from "@/components/ui/card";

type SummaryItem = {
  label: string;
  value: string;
};

type CaptainSummaryStripProps = {
  items: SummaryItem[];
};

export function CaptainSummaryStrip({ items }: CaptainSummaryStripProps) {
  return (
    <Card className="p-3 md:hidden">
      <div className="grid grid-cols-2 gap-3">
        {items.slice(0, 4).map((item) => (
          <div key={item.label}>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
