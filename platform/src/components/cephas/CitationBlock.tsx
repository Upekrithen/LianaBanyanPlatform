/**
 * Clean academic citation formatting (Session 19).
 */
import { ReactNode } from "react";

interface CitationBlockProps {
  children: ReactNode;
  className?: string;
}

export function CitationBlock({ children, className = "" }: CitationBlockProps) {
  return (
    <div className={`cephas-citation-block text-sm text-muted-foreground font-serif ${className}`}>
      {children}
    </div>
  );
}
