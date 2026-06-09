/**
 * UniformInitiativeShell.tsx -- BP078 Scope 4
 * ============================================
 * Outer chrome wrapper for all 16 Sweet Sixteen initiative pages.
 * Replaces the per-page LaunchConditionOverlay + PortalPageLayout boilerplate
 * with a consistent hero / walkthrough / cue-card crown.
 *
 * Sub-components defined here:
 *   InitiativeHero             -- emoji, name, tagline banner
 *   InitiativeAboutWalkthrough -- collapsible walkthrough from initiativeWalkthroughs.ts
 *   InitiativeStatistics       -- optional placeholder (future extension)
 *
 * InitiativeCueCard is REUSED from platform/src/components/initiatives/InitiativeCueCard.tsx.
 *
 * MVP scope (BP078): outer chrome unification only.
 * Action panel injection slots and Section 2 Minimum Viable Actions are deferred.
 */

import React, { useState } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import LaunchConditionOverlay, { type LaunchCondition } from "@/components/LaunchConditionOverlay";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { InitiativeWalkthrough } from "@/components/initiatives/InitiativeWalkthrough";
import { getWalkthrough, getCueCard } from "@/data/initiativeWalkthroughs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

// ─── InitiativeHero ───────────────────────────────────────────────────────────

interface InitiativeHeroProps {
  emoji: string;
  name: string;
  tagline: string;
  step?: string;
}

export function InitiativeHero({ emoji, name, tagline, step }: InitiativeHeroProps) {
  return (
    <div className="flex items-start gap-4 pb-6 border-b border-border/50 mb-6">
      <span className="text-5xl leading-none select-none" aria-hidden="true">
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold text-foreground truncate">{name}</h1>
          {step && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {step}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{tagline}</p>
      </div>
    </div>
  );
}

// ─── InitiativeAboutWalkthrough ───────────────────────────────────────────────

interface InitiativeAboutWalkthroughProps {
  slug: string;
}

export function InitiativeAboutWalkthrough({ slug }: InitiativeAboutWalkthroughProps) {
  const [open, setOpen] = useState(false);
  const wt = getWalkthrough(slug);
  if (!wt) return null;

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground px-0 h-auto py-1"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-medium">How this works</span>
        {open ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>
      {open && (
        <div className="mt-3">
          {wt.originAnecdote && (
            <blockquote className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3 mb-4 leading-relaxed">
              {wt.originAnecdote}
            </blockquote>
          )}
          <InitiativeWalkthrough
            steps={wt.steps}
            initiativeName={wt.cueCard.name}
          />
        </div>
      )}
    </div>
  );
}

// ─── InitiativeStatistics ─────────────────────────────────────────────────────

interface InitiativeStatisticsProps {
  stats?: Array<{ label: string; value: string | number; unit?: string }>;
}

export function InitiativeStatistics({ stats }: InitiativeStatisticsProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-center"
        >
          <div className="text-xl font-bold text-foreground">
            {s.value}
            {s.unit && <span className="text-sm font-normal ml-0.5">{s.unit}</span>}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── UniformInitiativeShell ──────────────────────────────────────────────────

export interface UniformInitiativeShellProps {
  /** Initiative slug -- used to resolve walkthrough and cue card data */
  slug: string;
  /** Override hero name (defaults to cue card name from data) */
  heroName?: string;
  /** Override hero tagline (defaults to cue card tagline from data) */
  heroTagline?: string;
  /** Override hero emoji (defaults to cue card emoji from data) */
  heroEmoji?: string;
  /** Six Steps label e.g. "Step 2: Feed Your Neighbors" */
  heroStep?: string;
  /** Show the cue card panel (default: true) */
  showCueCard?: boolean;
  /** Optional summary stats to show in the hero crown */
  stats?: InitiativeStatisticsProps["stats"];
  /** LaunchConditionOverlay: slug for the overlay gate */
  launchSlug?: string;
  /** LaunchConditionOverlay: conditions array (omit to skip overlay) */
  launchConditions?: LaunchCondition[];
  /** LaunchConditionOverlay: custom launch message */
  launchMessage?: string;
  /** PortalPageLayout maxWidth (default: xl) */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Intent tag from member profile -- shows matched-interest banner when present */
  intentTag?: 'need_help' | 'want_to_help' | 'make_money';
  /** The initiative-specific page content */
  children: React.ReactNode;
}

const INTENT_LABELS: Record<'need_help' | 'want_to_help' | 'make_money', string> = {
  need_help: 'I need help',
  want_to_help: 'I want to help',
  make_money: 'I want to make money',
};

export function UniformInitiativeShell({
  slug,
  heroName,
  heroTagline,
  heroEmoji,
  heroStep,
  showCueCard = true,
  stats,
  launchSlug,
  launchConditions,
  launchMessage,
  maxWidth = "xl",
  intentTag,
  children,
}: UniformInitiativeShellProps) {
  const cueCard = getCueCard(slug);

  const resolvedName = heroName ?? cueCard?.name ?? slug;
  const resolvedTagline = heroTagline ?? cueCard?.tagline ?? "";
  const resolvedEmoji = heroEmoji ?? cueCard?.emoji ?? "";

  const crown = (
    <>
      {intentTag && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
          <span className="text-primary font-medium">Opened for: {INTENT_LABELS[intentTag]}.</span>
          <span>You can change your path anytime.</span>
        </div>
      )}
      <InitiativeHero
        emoji={resolvedEmoji}
        name={resolvedName}
        tagline={resolvedTagline}
        step={heroStep}
      />
      {stats && <InitiativeStatistics stats={stats} />}
      <InitiativeAboutWalkthrough slug={slug} />
      {showCueCard && cueCard && (
        <div className="mb-6">
          <InitiativeCueCard card={cueCard} compact />
        </div>
      )}
    </>
  );

  const content = (
    <PortalPageLayout maxWidth={maxWidth}>
      {crown}
      {children}
    </PortalPageLayout>
  );

  if (launchSlug && launchConditions) {
    return (
      <LaunchConditionOverlay
        initiativeSlug={launchSlug}
        initiativeName={resolvedName}
        conditions={launchConditions}
        launchMessage={launchMessage}
      >
        {content}
      </LaunchConditionOverlay>
    );
  }

  return content;
}
