/**
 * Pudding-style scrollytelling section (Session 19). Sticky graphics, scroll-driven narrative.
 */
import { ReactNode } from "react";

interface ScrollySectionProps {
  children: ReactNode;
  sticky?: ReactNode;
  className?: string;
}

export function ScrollySection({ children, sticky, className = "" }: ScrollySectionProps) {
  return (
    <section className={`cephas-scrolly-section ${className}`}>
      {sticky && <div className="cephas-scrolly-sticky">{sticky}</div>}
      <div className="cephas-scrolly-content">{children}</div>
    </section>
  );
}
