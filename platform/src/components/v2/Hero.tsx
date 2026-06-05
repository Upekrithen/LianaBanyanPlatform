import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProofStrip, ProofStripItem } from "./ProofStrip";

type CTA = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type HeroProps = {
  eyebrow: string;
  headline: string;
  body: string;
  primaryCTA?: CTA;
  secondaryCTA?: CTA;
  joinCTA?: CTA;
  proofStrip?: ProofStripItem[];
  variant: "focus" | "app";
};

function renderCTA(cta: CTA, variant: "default" | "outline" | "secondary" = "default") {
  if (cta.href) {
    return (
      <Button asChild size="lg" variant={variant}>
        <a href={cta.href}>{cta.label}</a>
      </Button>
    );
  }

  return (
    <Button size="lg" variant={variant} onClick={cta.onClick}>
      {cta.label}
    </Button>
  );
}

export function Hero({
  eyebrow,
  headline,
  body,
  primaryCTA,
  secondaryCTA,
  joinCTA,
  proofStrip,
  variant,
}: HeroProps) {
  const isFocus = variant === "focus";

  return (
    <section
      className={cn(
        "w-full border-b bg-gradient-to-b from-muted/40 to-background",
        isFocus ? "px-4 py-14 sm:px-6 sm:py-20" : "px-4 py-8 sm:px-6",
      )}
    >
      <div className={cn("mx-auto w-full", isFocus ? "max-w-5xl text-center" : "max-w-6xl")}>
        <p className={cn("font-semibold uppercase tracking-wide text-primary", isFocus ? "text-sm" : "text-xs")}>
          {eyebrow}
        </p>
        <h1 className={cn("mt-4 font-semibold tracking-tight", isFocus ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl")}>
          {headline}
        </h1>
        <p className={cn("mt-4 text-muted-foreground", isFocus ? "mx-auto max-w-2xl text-lg" : "max-w-3xl text-base")}>
          {body}
        </p>

        <div
          className={cn(
            "mt-6 flex items-center gap-3",
            isFocus ? "justify-center" : "justify-start",
            primaryCTA && secondaryCTA ? "flex-col sm:flex-row" : "flex-row",
          )}
        >
          {primaryCTA ? renderCTA(primaryCTA) : null}
          {secondaryCTA ? renderCTA(secondaryCTA, primaryCTA ? "outline" : "default") : null}
        </div>

        {joinCTA ? (
          <div className={cn("mt-5 flex items-center", isFocus ? "justify-center" : "justify-start")}>
            {renderCTA(joinCTA, "secondary")}
          </div>
        ) : null}

        {proofStrip && proofStrip.length > 0 ? (
          <ProofStrip
            className={cn("mt-6", isFocus ? "mx-auto max-w-2xl" : "max-w-3xl")}
            items={proofStrip}
          />
        ) : null}
      </div>
    </section>
  );
}
