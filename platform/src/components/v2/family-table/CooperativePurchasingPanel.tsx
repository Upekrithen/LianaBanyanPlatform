import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export type CooperativePurchaseItem = {
  id: string;
  title: string;
  quantityLabel: string;
  pledgedBy: string[];
};

type CooperativePurchasingPanelProps = {
  items: CooperativePurchaseItem[];
};

export function CooperativePurchasingPanel({ items }: CooperativePurchasingPanelProps) {
  return (
    <Card id="cooperative-purchasing">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cooperative purchasing</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="grid gap-3 md:flex md:overflow-x-auto md:pb-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="min-w-[240px] rounded-xl border bg-background p-3 shadow-sm md:min-w-[280px]"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{item.quantityLabel}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.pledgedBy.map((name) => (
                    <Badge key={`${item.id}-${name}`} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            No shared buys yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
