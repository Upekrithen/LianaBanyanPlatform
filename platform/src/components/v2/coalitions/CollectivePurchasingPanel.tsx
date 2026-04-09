import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PurchasingNeed } from "./types";

type CollectivePurchasingPanelProps = {
  needs: PurchasingNeed[];
  onAddNeed: (need: PurchasingNeed) => void;
};

export function CollectivePurchasingPanel({ needs, onAddNeed }: CollectivePurchasingPanelProps) {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    if (!item.trim() || !quantity.trim()) return;
    onAddNeed({
      id: `need-${Date.now()}`,
      item: item.trim(),
      quantity: quantity.trim(),
      note: note.trim() || undefined,
    });
    setItem("");
    setQuantity("");
    setNote("");
  };

  return (
    <Card data-xray-id="coalition-collective-purchasing-panel">
      <CardHeader>
        <CardTitle>Collective purchasing panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Input placeholder="Item" value={item} onChange={(e) => setItem(e.target.value)} />
          <Input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button type="button" onClick={submit}>
          Add purchasing action
        </Button>
        <div className="space-y-2">
          {needs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collective purchasing actions yet.</p>
          ) : (
            needs.map((need) => (
              <div key={need.id} className="rounded-lg border p-3 text-sm">
                <span className="font-medium">{need.item}</span> · {need.quantity}
                {need.note ? ` · ${need.note}` : ""}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
