import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export type Vouch = {
  id: string;
  quote: string;
  name: string;
  role: string;
  relationship: string;
};

export type StepItem = {
  id: string;
  title: string;
  description: string;
};

export type PreviewProduct = {
  id: string;
  name: string;
  category: string;
  priceLabel: string;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type ActionLink = {
  label: string;
  href?: string;
  onClick?: () => void;
};

function daysRemaining(expiryDate: string): number | null {
  const ms = new Date(expiryDate).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function toMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function RedCarpetHero({
  creatorName,
  businessName,
  primaryCTA,
  secondaryCTA,
}: {
  creatorName: string;
  businessName: string;
  primaryCTA: ActionLink;
  secondaryCTA: ActionLink;
}) {
  return (
    <section className="w-full border-b bg-gradient-to-b from-muted/30 to-background px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto w-full max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Personal invitation</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {creatorName} invited you to launch {businessName}.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          This page is your starting point. Review the pledge context, inspect the draft storefront,
          and decide when to begin.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={primaryCTA.onClick} asChild={Boolean(primaryCTA.href)}>
            {primaryCTA.href ? <a href={primaryCTA.href}>{primaryCTA.label}</a> : <span>{primaryCTA.label}</span>}
          </Button>
          <Button size="lg" variant="outline" onClick={secondaryCTA.onClick} asChild={Boolean(secondaryCTA.href)}>
            {secondaryCTA.href ? <a href={secondaryCTA.href}>{secondaryCTA.label}</a> : <span>{secondaryCTA.label}</span>}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function PledgeSummaryCard({
  pledgeCount,
  pledgeTotal,
  expiryDate,
}: {
  pledgeCount: number;
  pledgeTotal: number;
  expiryDate: string;
}) {
  const daysLeft = daysRemaining(expiryDate);
  const percentUsed = daysLeft === null ? 0 : Math.min(100, Math.max(0, ((90 - daysLeft) / 90) * 100));
  const ringStyle = {
    background: `conic-gradient(hsl(var(--primary) / 0.35) ${percentUsed}%, hsl(var(--muted)) ${percentUsed}% 100%)`,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Pledge Summary</CardTitle>
        <CardDescription>Neutral 90-day window for review and confirmation.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pledges</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{pledgeCount}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total support</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{toMoney(pledgeTotal)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="relative h-14 w-14 rounded-full p-1"
            style={ringStyle}
            role="img"
            aria-label="90-day invitation window progress"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-xs font-semibold text-foreground tabular-nums">
              {daysLeft ?? "--"}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Days left</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {daysLeft === null ? "Invitation window active." : `${daysLeft} days remaining in your window.`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TestimonialCard({ quote, name, role, relationship }: Omit<Vouch, "id">) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Badge variant="secondary" className="w-fit">{relationship}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground">"{quote}"</p>
        <p className="mt-4 text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </CardContent>
    </Card>
  );
}

export function VouchesGrid({ vouches }: { vouches: Vouch[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Vouches from your circle</h2>
      {vouches.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Vouches appear here when references are attached to your invitation context.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {vouches.map((vouch) => (
            <TestimonialCard
              key={vouch.id}
              quote={vouch.quote}
              name={vouch.name}
              role={vouch.role}
              relationship={vouch.relationship}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function PrepopulatedStorefrontPreview({
  businessName,
  products,
  draftNote,
}: {
  businessName: string;
  products: PreviewProduct[];
  draftNote: string;
}) {
  return (
    <section id="red-carpet-preview" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">Pre-populated storefront preview</h2>
        <Badge variant="outline">Draft</Badge>
      </div>
      <p className="max-w-3xl text-sm text-muted-foreground">{draftNote}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{businessName}</CardTitle>
            <CardDescription>This is a starting point you can edit before going live.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Product placeholders appear here after draft context is attached.
              </p>
            ) : (
              products.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{item.priceLabel}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What carries forward</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Draft title and category context.</p>
            <p>Starting product tiles and descriptions.</p>
            <p>Pricing defaults you can review before publish.</p>
            <p>Member-ready publishing checklist.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function NextStepsStrip({ steps }: { steps: StepItem[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Next steps</h2>
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.id}>
            <CardHeader className="pb-2">
              <CardDescription>Step {index + 1}</CardDescription>
              <CardTitle className="text-base">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{step.description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function WindowFAQ({ items }: { items: FAQItem[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">90-day window FAQ</h2>
      <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function AlternativeActions({
  onRemindLater,
  onShareWithPartner,
  onAskQuestion,
}: {
  onRemindLater: () => void;
  onShareWithPartner: () => void;
  onAskQuestion: () => void;
}) {
  return (
    <section className="rounded-xl border bg-muted/30 p-6">
      <h2 className="text-xl font-semibold tracking-tight">Not ready yet?</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        You can pause without penalty. Keep the invitation open, share with a partner, or ask for
        clarification before deciding.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onRemindLater}>Remind me later</Button>
        <Button variant="outline" onClick={onShareWithPartner}>Share with partner</Button>
        <Button variant="outline" onClick={onAskQuestion}>Ask a question first</Button>
      </div>
    </section>
  );
}

export function SectionFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-10 pb-16", className)}>{children}</div>;
}
