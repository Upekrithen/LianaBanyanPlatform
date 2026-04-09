import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillItem } from "./types";

type BillCardProps = {
  bill: BillItem;
  active: boolean;
  onSelect: (billId: string) => void;
};

export function BillCard({ bill, active, onSelect }: BillCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-shadow ${active ? "border-primary shadow-sm" : "hover:shadow-md"}`}
      onClick={() => onSelect(bill.id)}
      data-xray-id="political-expedition-bill-card"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{bill.billNumber}</Badge>
          <Badge variant="outline">{bill.districtTag}</Badge>
        </div>
        <CardTitle className="text-base">{bill.title}</CardTitle>
        {bill.status ? <CardDescription>{bill.status}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{bill.summary || "No summary provided."}</p>
      </CardContent>
    </Card>
  );
}
