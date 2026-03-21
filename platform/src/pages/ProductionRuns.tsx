/**
 * PRODUCTION RUNS — Full Draft Board
 * ====================================
 * Fantasy Football-style browsing of all maker production run proposals.
 * Back runs, track progress, earn multiplier bonuses.
 * Live ticker shows anonymized success stories alongside your picks.
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ProductionRunDraft } from "@/components/ProductionRunDraft";
import { SuccessStories } from "@/components/SuccessStories";
import { SuccessTicker } from "@/components/SuccessTicker";
import { ColdStartRecipeCards } from "@/components/ColdStartRecipeCards";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function ProductionRuns() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Production Run Draft
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick your players. Back the makers you believe in. 500 pre-orders
            triggers production — zero risk, real products, success stories
            that write themselves.
          </p>
        </div>

        {/* Live Success Ticker */}
        <SuccessTicker mode="ticker" />

        {/* Full Draft Board */}
        <ProductionRunDraft />

        {/* Live Activity Feed — vertical list alongside your picks */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2">
            <SuccessStories filter="production_run" />
          </div>
          <div className="md:col-span-1">
            <div className="sticky top-6 p-4 rounded-xl border border-border bg-card">
              <SuccessTicker mode="list" maxItems={6} />
            </div>
          </div>
        </div>

        {/* Cold Start Strategy for Shopping */}
        <div className="mt-16 pt-12 border-t border-border">
          <ColdStartRecipeCards initiative="lets-go-shopping" />
        </div>
      </div>
    </PortalPageLayout>
  );
}
