import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SupportingCardStripProps = {
  children: ReactNode;
  className?: string;
};

export function SupportingCardStrip({ children, className }: SupportingCardStripProps) {
  return <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>{children}</div>;
}
