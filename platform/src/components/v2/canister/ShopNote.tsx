import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type ShopNoteProps = {
  title: string;
  note: string;
  diagram?: ReactNode;
};

export function ShopNote({ title, note, diagram }: ShopNoteProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="space-y-2 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shop note</p>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{note}</p>
        <div className="rounded-md border bg-muted/20 p-3">
          {diagram ?? <p className="text-xs text-muted-foreground">Diagram slot</p>}
        </div>
      </CardContent>
    </Card>
  );
}
