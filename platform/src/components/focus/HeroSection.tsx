import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── HeroStage ─── Full-viewport dark container, centers content ─── */

interface HeroStageProps {
  children: ReactNode;
  className?: string;
}

export function HeroStage({ children, className }: HeroStageProps) {
  return (
    <section
      className={cn(
        "relative py-16 sm:py-20 px-4 flex flex-col items-center justify-center",
        className
      )}
    >
      <div className="w-full max-w-[760px] mx-auto text-center">{children}</div>
    </section>
  );
}

/* ─── HeroEyebrow ─── Small badge above headline ─── */

interface HeroEyebrowProps {
  children: ReactNode;
  className?: string;
}

export function HeroEyebrow({ children, className }: HeroEyebrowProps) {
  return (
    <span
      className={cn(
        "inline-block text-xs sm:text-sm font-semibold uppercase tracking-widest text-green-400 mb-6 sm:mb-8",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ─── HeroTitle ─── Large headline, supports accent <span> children ─── */

interface HeroTitleProps {
  children: ReactNode;
  className?: string;
}

export function HeroTitle({ children, className }: HeroTitleProps) {
  return (
    <h1
      className={cn(
        "text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white",
        className
      )}
    >
      {children}
    </h1>
  );
}

/* ─── HeroBody ─── Supporting copy, max-width ~48ch ─── */

interface HeroBodyProps {
  children: ReactNode;
  className?: string;
}

export function HeroBody({ children, className }: HeroBodyProps) {
  return (
    <p
      className={cn(
        "mt-6 sm:mt-8 text-base sm:text-lg text-slate-300 leading-relaxed max-w-[48ch] mx-auto",
        className
      )}
      style={{ textWrap: "balance" }}
    >
      {children}
    </p>
  );
}

/* ─── HeroActions ─── Primary + Secondary CTA row (stacks on mobile) ─── */

interface HeroActionsProps {
  primaryLabel: string;
  primaryHref?: string;
  onPrimaryClick?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryClick?: () => void;
  primaryDisabled?: boolean;
  className?: string;
}

export function HeroActions({
  primaryLabel,
  primaryHref,
  onPrimaryClick,
  secondaryLabel,
  secondaryHref,
  onSecondaryClick,
  primaryDisabled,
  className,
}: HeroActionsProps) {
  return (
    <div
      className={cn(
        "mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4",
        className
      )}
    >
      {primaryHref ? (
        <a href={primaryHref} className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-semibold px-8"
            disabled={primaryDisabled}
          >
            {primaryLabel}
          </Button>
        </a>
      ) : (
        <Button
          size="lg"
          className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-semibold px-8"
          onClick={onPrimaryClick}
          disabled={primaryDisabled}
        >
          {primaryLabel}
        </Button>
      )}
      {secondaryLabel && (
        secondaryHref ? (
          <a href={secondaryHref} className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-slate-600 text-slate-300 hover:text-white hover:bg-white/5"
            >
              {secondaryLabel}
            </Button>
          </a>
        ) : (
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-slate-600 text-slate-300 hover:text-white hover:bg-white/5"
            onClick={onSecondaryClick}
          >
            {secondaryLabel}
          </Button>
        )
      )}
    </div>
  );
}

/* ─── HeroProof ─── Inline trust badges replacing floating widget ─── */

interface HeroProofProps {
  items: string[];
  className?: string;
}

export function HeroProof({ items, className }: HeroProofProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3",
        className
      )}
    >
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-400"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* ─── StickyMobileCTA ─── Sticky bottom CTA after first scroll ─── */

interface StickyMobileCTAProps {
  label: string;
  onClick?: () => void;
  href?: string;
}

export function StickyMobileCTA({ label, onClick, href }: StickyMobileCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-slate-950/95 backdrop-blur-sm border-t border-white/10 sm:hidden">
      {href ? (
        <a href={href} className="block">
          <Button className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold">
            {label}
          </Button>
        </a>
      ) : (
        <Button
          className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold"
          onClick={onClick}
        >
          {label}
        </Button>
      )}
    </div>
  );
}

/* ─── ContentSection ─── Below-the-fold section with consistent spacing ─── */

interface ContentSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ContentSection({ children, title, subtitle, className }: ContentSectionProps) {
  return (
    <section className={cn("py-12 sm:py-16 px-4", className)}>
      <div className="max-w-[760px] mx-auto">
        {title && (
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
