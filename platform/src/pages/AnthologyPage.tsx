/**
 * Anthology of Persistent Effort -- BP072 Wave 3 / Scope 9
 * =========================================================
 * "There's No Time to Let the Blood Dry"
 * (helicopter-never-flies-straight quote)
 *
 * Serves as the Progress-Report banner and a standalone page.
 * Route: /anthology
 *
 * This page collects the evidence of persistent effort:
 * - The quote and its context
 * - Canon numbers as proof of scale
 * - Links to Progress Reports as they publish
 */
import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FileText } from "lucide-react";

export default function AnthologyPage() {
  const { t } = useTranslation();
  const stats = useCanonicalStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-10">
        <Badge variant="outline" className="mb-4 text-sm px-4 py-1 border-amber-300 text-amber-800">
          Anthology of Persistent Effort
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
          There's No Time to Let the Blood Dry
        </h1>
        <blockquote className="border-l-4 border-amber-400 pl-6 mb-8">
          <p className="text-xl text-slate-700 italic leading-relaxed">
            "A helicopter never flies straight. It is constantly correcting --
            a thousand micro-adjustments per minute, each one invisible to the
            passenger, each one absolutely necessary. The pilot does not wait
            for the correction to settle before making the next one. There is
            no time to let the blood dry."
          </p>
          <footer className="mt-3 text-sm text-slate-500">
            -- Founder, Liana Banyan Cooperative Platform
          </footer>
        </blockquote>
        <p className="text-lg text-slate-600 leading-relaxed">
          This page is a record of the corrections. Not a victory lap --
          a flight log.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-8 pb-20">

        {/* Numbers as evidence */}
        <Card className="bg-slate-900 text-white border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-amber-400">
              The Evidence
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { value: stats.innovationCount.toLocaleString(), label: "Innovations" },
                { value: stats.crownJewels.toString(), label: "Crown Jewels" },
                { value: stats.patentApplications.toString(), label: "Provisional apps" },
                { value: `${stats.creatorKeepsPct}%`, label: "Creator retention" },
                { value: `$${stats.membershipCost}/yr`, label: "Membership cost" },
                { value: `${stats.investmentYears} yrs`, label: "Personal investment" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-6 text-center">
              37 years of development (1989-2026). One founder. No venture capital.
              No extraction mechanics.
            </p>
          </CardContent>
        </Card>

        {/* The Philosophy */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">
              What "Persistent Effort" Actually Means
            </h2>
            <div className="prose prose-slate max-w-none space-y-4">
              <p className="text-slate-700 leading-relaxed">
                A cooperative platform built on persistent effort is not the same
                as a startup built on sprints. Sprints end. A cooperative grows
                in the direction of the people it serves, which means there are
                always new corrections to make, new voices to incorporate, new
                territories where the platform has not yet reached.
              </p>
              <p className="text-slate-700 leading-relaxed">
                The 83.3% creator retention is not a promise -- it is an
                architectural constraint. Cost+20% cannot be changed by future
                leadership any more than a pilot can change the laws of lift.
                The corrections happen within those constraints, not around them.
              </p>
              <p className="text-slate-700 leading-relaxed">
                The {stats.innovationCount.toLocaleString()} innovations are not
                a chest to sit on. They are the record of every time the platform
                made a micro-adjustment toward something more useful, more honest,
                more durable.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Reports index */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5 text-amber-600" />
              Progress Reports
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Each Progress Report is a public flight log entry -- what was corrected,
              what was learned, what was proven.
            </p>
            <div className="space-y-3">
              <Link
                to="/progress/1"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors group"
              >
                <div>
                  <div className="font-medium text-slate-900 group-hover:text-amber-800">
                    Progress Report No. 1 -- First Things First
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    Mikey hire + "Learning to Fly" video -- June 2026
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
              </Link>
              {/* Future progress reports added below as they publish */}
              <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-sm text-slate-400">
                Future progress reports will appear here as the cooperative advances.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Further Reading */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900">
              <BookOpen className="w-5 h-5 text-slate-600" />
              Further Reading
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "How It All Works", to: "/how-it-all-works" },
                { label: "Business Plan", to: "/business-plan" },
                { label: "Proofs", to: "/proofs" },
                { label: "Press Room", to: "/press" },
              ].map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-sm text-slate-700"
                >
                  {label}
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Join CTA */}
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4">
            The flight continues. $5/year gets you a seat.
          </p>
          <Button asChild size="lg">
            <Link to="/join">Join the Cooperative</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
