/**
 * SpinoutsIndexPage — Wave 6 Phase T
 * =====================================
 * Landing page for the 7 LianaBanyan spinout entities.
 * Route: /spinouts
 *
 * Canon: spinout_entities_NOT_initiatives (canonical_values.yaml)
 * Securities-clean: Marks = participation, not equity or guaranteed return.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { SPINOUTS } from "@/data/spinoutsData";
import { usePageSEO } from "@/hooks/usePageSEO";

export default function SpinoutsIndexPage() {
  usePageSEO({
    title: "Spinouts | Liana Banyan",
    description: "Cooperative spinout companies seeded from Liana Banyan initiatives. Community-owned businesses growing from the platform.",
    canonical: "https://lianabanyan.com/spinouts",
  });
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" xrayId="spinouts-index">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main
          </button>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">The 7 Spinouts</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Spinout entities grow from cooperative roots but operate under their own governance
            and legal structure. Each spinout solves a distinct problem that requires a
            purpose-built organization.
          </p>
        </div>

        {/* What Is a Spinout */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Spinouts vs. Initiatives</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              The 16 Sweet Sixteen Initiatives are funded by the cooperative's Cost+20% margin and
              serve cooperative members directly. They are constitutional features of LianaBanyan.
            </p>
            <p>
              Spinouts are distinct legal entities that either (a) serve markets beyond the
              cooperative membership, (b) require legal separation for compliance reasons, or (c)
              deploy technology developed inside the cooperative to the world at large.
            </p>
            <p>
              <strong className="text-foreground">Marks disclosure:</strong> Marks represent
              participation in the cooperative, not equity in any spinout entity. Spinout
              participation is governed by each spinout's own structure.
            </p>
          </CardContent>
        </Card>

        {/* Spinout Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SPINOUTS.map((spinout) => (
            <Card
              key={spinout.id}
              className={`border-2 bg-gradient-to-br ${spinout.color} hover:shadow-md transition-all cursor-pointer`}
              onClick={() => navigate(`/spinouts/${spinout.slug}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{spinout.emoji}</span>
                    <div>
                      <CardTitle className="text-base leading-tight">{spinout.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">{spinout.category}</Badge>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">#{spinout.number}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {spinout.tagline}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      spinout.legalStatus === "active"
                        ? "border-green-500/40 text-green-400"
                        : spinout.legalStatus === "formed"
                        ? "border-blue-500/40 text-blue-400"
                        : "border-amber-500/40 text-amber-400"
                    }`}
                  >
                    {spinout.legalStatus === "forming"
                      ? "Forming"
                      : spinout.legalStatus === "formed"
                      ? "Formed"
                      : "Active"}
                  </Badge>
                  {spinout.heldForFounder && (
                    <Badge variant="outline" className="text-xs border-red-500/40 text-red-400">
                      Held for Founder
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/spinouts/${spinout.slug}`);
                  }}
                >
                  View Business Plan
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground text-center">
          7 spinout entities in formation. All structures pending founder ratification.
          Marks = cooperative participation, not equity or investment in any spinout.
        </p>
      </div>
    </PortalPageLayout>
  );
}
