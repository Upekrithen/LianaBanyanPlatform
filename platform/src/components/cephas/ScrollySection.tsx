/**
 * Pudding-style scrollytelling section (Session 19/20). Sticky graphics panel, scroll-driven narrative.
 */
import { ReactNode } from "react";

interface ScrollySectionProps {
  children: ReactNode;
  sticky?: ReactNode;
  className?: string;
}

export function ScrollySection({ children, sticky, className = "" }: ScrollySectionProps) {
  return (
    <section className={`cephas-scrolly-section grid gap-6 md:grid-cols-[1fr_280px] ${className}`}>
      <div className="cephas-scrolly-content min-w-0">{children}</div>
      {sticky && (
        <div className="cephas-scrolly-sticky hidden md:block md:sticky md:top-24 md:self-start md:rounded-lg md:border md:bg-muted/30 md:p-4">
          {sticky}
        </div>
      )}
    </section>
  );
}
