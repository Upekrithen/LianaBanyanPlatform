import { Link } from "react-router-dom";
import { Lock, Rocket, Megaphone, ArrowRight } from "lucide-react";

type BatteryDispatchUpgradeCardProps = {
  title?: string;
  subtitle?: string;
};

export function BatteryDispatchUpgradeCard({
  title = "Battery Dispatch is included for active builders",
  subtitle = "Choose a commitment path to unlock access. This is included with participation, not sold separately.",
}: BatteryDispatchUpgradeCardProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold leading-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Megaphone className="w-4 h-4 text-amber-600" />
              Influencer Path
            </div>
            <p className="text-sm text-muted-foreground">
              Accept the Creator Agreement and publish your first piece within 30 days.
            </p>
            <Link
              to="/dashboard/dispatch/influencer-signup"
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Start Influencer signup
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Rocket className="w-4 h-4 text-amber-600" />
              Project Path
            </div>
            <p className="text-sm text-muted-foreground">
              Start a project and schedule your first Cue Card or list your first product within 30 days.
            </p>
            <Link
              to="/projects/create"
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Start a project
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Other qualifying paths are auto-granted when active: Harper Guild, Jukebox artist, Crown holder, or Captain role.
          Access is maintained on a 90-day activity window and auto-restores as soon as any path becomes active again.
        </div>
      </div>
    </div>
  );
}
