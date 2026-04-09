import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CoalitionDiscount } from "./types";

type SharedDiscountManagerProps = {
  discounts: CoalitionDiscount[];
  onAddDiscount: (discount: CoalitionDiscount) => void;
};

export function SharedDiscountManager({ discounts, onAddDiscount }: SharedDiscountManagerProps) {
  const [title, setTitle] = useState("");
  const [percent, setPercent] = useState("");
  const [appliesTo, setAppliesTo] = useState("");

  const submit = () => {
    const pct = Number(percent);
    if (!title.trim() || !appliesTo.trim() || !Number.isFinite(pct) || pct <= 0) return;
    onAddDiscount({
      id: `discount-${Date.now()}`,
      title: title.trim(),
      percent: pct,
      appliesTo: appliesTo.trim(),
    });
    setTitle("");
    setPercent("");
    setAppliesTo("");
  };

  return (
    <Card data-xray-id="coalition-shared-discount-manager">
      <CardHeader>
        <CardTitle>Shared discount manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Input placeholder="Discount title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Percent" value={percent} onChange={(e) => setPercent(e.target.value)} />
          <Input placeholder="Applies to" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} />
        </div>
        <Button type="button" onClick={submit}>
          Add discount action
        </Button>
        <div className="space-y-2">
          {discounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shared discounts yet.</p>
          ) : (
            discounts.map((discount) => (
              <div key={discount.id} className="rounded-lg border p-3 text-sm">
                <span className="font-medium">{discount.title}</span> · {discount.percent}% on {discount.appliesTo}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
