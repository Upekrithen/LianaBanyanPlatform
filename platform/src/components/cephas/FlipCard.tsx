/**
 * Pudding-style interactive reveal card (Session 19). Similar to Hugo flipblock.
 */
import { ReactNode, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface FlipCardProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function FlipCard({ title, children, defaultOpen = false }: FlipCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="cephas-flip-card">
      <CardHeader className="cursor-pointer flex flex-row items-center justify-between" onClick={() => setOpen(!open)}>
        <span className="font-medium">{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
