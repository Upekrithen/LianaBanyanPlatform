import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PromotionItem } from "./types";

type CrossPromotionBoardProps = {
  items: PromotionItem[];
  onAddItem: (item: PromotionItem) => void;
};

export function CrossPromotionBoard({ items, onAddItem }: CrossPromotionBoardProps) {
  const [channel, setChannel] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    if (!channel.trim() || !message.trim()) return;
    onAddItem({
      id: `promo-${Date.now()}`,
      channel: channel.trim(),
      message: message.trim(),
    });
    setChannel("");
    setMessage("");
  };

  return (
    <Card data-xray-id="coalition-cross-promotion-board">
      <CardHeader>
        <CardTitle>Cross-promotion board</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Input placeholder="Channel (email, social, flyer)" value={channel} onChange={(e) => setChannel(e.target.value)} />
          <Input placeholder="Promo message" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <Button type="button" onClick={submit}>
          Queue promotion action
        </Button>
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No promotion actions queued yet.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-lg border p-3 text-sm">
                <span className="font-medium">{item.channel}</span> · {item.message}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
