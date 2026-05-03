/**
 * ScalesRubricPage — Bushel 19 / BP021
 * ======================================
 * Helm route: /helm/scales-rubric
 *
 * "The Scales Are Visible" — surface route for the canonical rubric viewer.
 * Displays bouncer_safe_patterns_v1.yaml + scales_criteria_v1.yaml + judge_precedents
 * as legible canonical-rubric pages with expand/collapse per category.
 *
 * Per Bushel 19 / Mordecai-Esther Pedestal Forum canon:
 *   Visibility of the rubric enables member-trust AND Pedestal Forum
 *   decree-composition class additions to the rubric.
 *
 * G2: Scales rubric viewer renders bouncer_safe_patterns + judge_precedents
 *     YAMLs as legible canonical-rubric UI ✓
 */

import { PortalPageLayout } from "@/components/PortalPageLayout";
import { ScalesRubricViewer } from "@/components/helm/ScalesRubricViewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scale, ShieldCheck, Gavel, MessageSquarePlus, Info,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ScalesRubricPage() {
  return (
    <PortalPageLayout
      title={
        <span className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-slate-500" />
          The Scales Are Visible
        </span>
      }
      subtitle="Canonical rubric applied by the Bouncer-Scales-Judge trio — ratified BP011 / KN095"
      backButton
    >
      {/* Top action bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50 gap-1">
          <ShieldCheck className="h-3 w-3" />
          Bouncer v1
        </Badge>
        <Badge variant="outline" className="text-xs text-blue-700 border-blue-300 bg-blue-50 gap-1">
          <Scale className="h-3 w-3" />
          Scales v1
        </Badge>
        <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50 gap-1">
          <Gavel className="h-3 w-3" />
          Judge v1
        </Badge>
        <div className="flex-1" />
        <Button variant="outline" size="sm" asChild>
          <Link to="/helm/verdicts">
            <Scale className="h-3.5 w-3.5 mr-1.5" />
            My verdicts
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/helm/verdicts">
            <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
            File an appeal
          </Link>
        </Button>
      </div>

      {/* Context for the page */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-amber-200 bg-amber-50/20 mb-5">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-medium">Pedestal Forum — decree-composition class</p>
          <p>
            Visibility of the rubric is not just a transparency feature — it enables governance.
            When you disagree with a verdict, you file an appeal that becomes a
            <strong> Pedestal Forum decree-composition</strong>: a canonical addition to the
            rubric with co-equal authority. The scales grow through member participation.
          </p>
          <p>
            New patterns enter the Bouncer registry after Founder ratification of successful
            Judge PASS verdicts. New criteria can be proposed via the appeal mechanism.
          </p>
        </div>
      </div>

      {/* The rubric viewer */}
      <ScalesRubricViewer
        showThresholds={true}
        showScales={true}
        showBouncer={true}
        showJudge={true}
      />
    </PortalPageLayout>
  );
}
