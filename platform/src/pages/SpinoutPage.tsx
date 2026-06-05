/**
 * SpinoutPage — Wave 6 Phase T
 * ==============================
 * Generic page for a single spinout entity.
 * Route: /spinouts/:slug
 *
 * Shows the business plan stub + features + legal status.
 * Securities-clean: Marks = participation, never equity.
 */
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { getSpinout } from "@/data/spinoutsData";

export default function SpinoutPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const spinout = getSpinout(slug ?? "");

  if (!spinout) {
    return <Navigate to="/spinouts" replace />;
  }

  const statusColors = {
    forming: "border-amber-500/40 text-amber-400 bg-amber-500/10",
    formed: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    active: "border-green-500/40 text-green-400 bg-green-500/10",
  };

  const statusIcons = {
    forming: <Clock className="h-4 w-4" />,
    formed: <AlertCircle className="h-4 w-4" />,
    active: <CheckCircle className="h-4 w-4" />,
  };

  return (
    <PortalPageLayout variant="stage" xrayId="spinout-page">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/spinouts")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          All 7 Spinouts
        </Button>

        {/* Hero */}
        <div className={`rounded-2xl border-2 bg-gradient-to-br ${spinout.color} p-6`}>
          <div className="flex items-start gap-4">
            <span className="text-5xl">{spinout.emoji}</span>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{spinout.name}</h1>
                <Badge variant="outline">{spinout.category}</Badge>
                <Badge className={`flex items-center gap-1 text-xs ${statusColors[spinout.legalStatus]}`}>
                  {statusIcons[spinout.legalStatus]}
                  {spinout.legalStatus.charAt(0).toUpperCase() + spinout.legalStatus.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground">{spinout.tagline}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>About This Spinout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {spinout.description}
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-2">
          {spinout.features.map((feature, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{feature.heading}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Business Plan Stub */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Business Plan Stub</CardTitle>
            <p className="text-xs text-muted-foreground">
              Using the Cost+20% template. Marks = participation, not equity or guaranteed return.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">The Problem</p>
              <p className="text-muted-foreground">{spinout.businessPlan.problem}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Who We Serve</p>
              <p className="text-muted-foreground">{spinout.businessPlan.customers}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">The Offering</p>
              <p className="text-muted-foreground italic">"{spinout.businessPlan.offering}"</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Economics (Cost+20%)</p>
              <p className="text-muted-foreground">{spinout.businessPlan.economics}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">First 90 Days</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                {spinout.businessPlan.ninetyDays.map((milestone, i) => (
                  <li key={i}>{milestone}</li>
                ))}
              </ol>
            </div>
            {spinout.businessPlan.legalGate && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300">
                  <strong>Legal Gate:</strong> {spinout.businessPlan.legalGate}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Held notice */}
        {spinout.heldForFounder && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="py-4 flex items-start gap-2 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              This spinout is held for Founder review before further public disclosure.
            </CardContent>
          </Card>
        )}

        {/* Canon reference */}
        {spinout.canonRef && (
          <p className="text-xs text-muted-foreground text-center">
            Canon reference: {spinout.canonRef}
          </p>
        )}

        {/* Marks disclaimer */}
        <p className="text-xs text-muted-foreground/60 text-center border-t border-border pt-4">
          Marks represent participation in the Liana Banyan cooperative - not equity, shares,
          or guaranteed financial return in any spinout entity.
        </p>
      </div>
    </PortalPageLayout>
  );
}
