import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Anchor, ArrowRight, Users, Shield } from "lucide-react";
import { useCaptain } from "@/hooks/useCaptain";
import { CaptainLevelCards } from "@/components/captain/CaptainLevelCards";
import { CaptainStakeForm } from "@/components/captain/CaptainStakeForm";

export default function CaptainOnboardingPage() {
  const navigate = useNavigate();
  const { captain, requirements, isCaptain, isLoading } = useCaptain();

  if (isCaptain) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="captain-onboarding">
        <div className="text-center py-16 space-y-4">
          <Anchor className="w-16 h-16 mx-auto text-blue-400" />
          <h1 className="text-3xl font-bold">You're Already a Captain!</h1>
          <p className="text-muted-foreground">
            Head to your dashboard to manage your orders and track your progress.
          </p>
          <Button onClick={() => navigate("/captain/dashboard")} size="lg" className="bg-blue-600 hover:bg-blue-500">
            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="lg" xrayId="captain-onboarding">
      <div className="space-y-10 py-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-blue-500/40 text-blue-300">
            <Anchor className="w-3 h-3 mr-1" />
            The Moses Model
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-blue-100">
            Become a Captain
          </h1>
          <p className="text-lg text-blue-400/60 italic max-w-xl mx-auto">
            "A ship in harbor is safe, but that is not what ships are BUILT for."
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Captains are local operational leaders who manage production, fulfillment,
            and community in their area. No one is asking you to speculate — we're asking
            you to lead.
          </p>
        </div>

        {/* Requirements checklist */}
        <div className="max-w-md mx-auto space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Requirements</h2>
          <div className="space-y-2">
            <RequirementRow icon={<Users className="w-4 h-4 text-emerald-400" />} label="Active Member ($5/year)" met />
            <RequirementRow icon={<Shield className="w-4 h-4 text-slate-500" />} label="Stake 100+ Marks (Joule-backed)" />
            <RequirementRow icon={<Anchor className="w-4 h-4 text-slate-500" />} label="Choose your region" />
          </div>
        </div>

        {/* Quote */}
        <div className="text-center">
          <blockquote className="text-2xl font-bold text-amber-300/80 italic">
            "What you do in little, you do in much."
          </blockquote>
          <p className="text-sm text-slate-500 mt-2">
            Start with 10 orders. Prove yourself. Graduate.
          </p>
        </div>

        {/* Level cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Captain Progression</h2>
          {!isLoading && (
            <CaptainLevelCards
              requirements={requirements}
              currentLevel={captain?.level}
            />
          )}
        </div>

        {/* Stake form */}
        <div className="max-w-lg mx-auto">
          <CaptainStakeForm onSuccess={() => navigate("/captain/dashboard")} />
        </div>

        {/* The 300 link */}
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/the300")}
            className="text-slate-400 hover:text-blue-300"
          >
            View The 300 Strategic Allies <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}

function RequirementRow({ icon, label, met }: { icon: React.ReactNode; label: string; met?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
      {icon}
      <span className={met ? "text-slate-200" : "text-slate-400"}>{label}</span>
      {met && <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 text-[10px]">Done</Badge>}
    </div>
  );
}
