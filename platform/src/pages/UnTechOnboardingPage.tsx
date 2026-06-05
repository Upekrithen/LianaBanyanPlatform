/**
 * unTech Onboarding -- BP072 Wave 3 / Scope 15
 * =============================================
 * v0.1.25 family-install walkthrough.
 * Lead with what's-in-it-for-me. Ollama bundled. One spine.
 *
 * Route: /untech-onboarding  (alias: /get-started/untech)
 *
 * "unTech" = the platform that runs on your family's hardware,
 * not in a cloud you don't control. Mnemosyne (v0.1.25) + Ollama
 * bundled as one installer for families and households.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Circle,
  Download,
  Users,
  Brain,
  Wifi,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface Step {
  id: number;
  label: string;
  description: string;
  icon: React.ElementType;
  whatsInItForMe: string;
  action?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    id: 1,
    label: "Download Mnemosyne",
    description:
      "Download the Mnemosyne v0.1.25 installer. It bundles Ollama so you don't need to install anything else separately. One download, one installer.",
    icon: Download,
    whatsInItForMe:
      "Your family gets a private AI assistant that runs on your own hardware -- no subscription, no cloud upload of your documents, no surveillance.",
    action: { label: "Download Mnemosyne v0.1.25", href: "/mnemosyne" },
  },
  {
    id: 2,
    label: "Install on the family device",
    description:
      "Run the installer. Mnemosyne installs itself and Ollama in one step. Works on Windows, macOS, and Linux. No command line needed. Pick a folder to connect to the cooperative mesh (optional at this step).",
    icon: ShieldCheck,
    whatsInItForMe:
      "Once it's running, every member of your household can ask questions, get help with tasks, and access the cooperative platform from the same device. No separate accounts needed at the device level.",
  },
  {
    id: 3,
    label: "Create your cooperative account",
    description:
      "Open Mnemosyne, click 'Sign in with Liana Banyan,' and create your account. Membership is $5/year. Marks -- your participation credits -- start accumulating the moment you join.",
    icon: Users,
    whatsInItForMe:
      "Marks are how the cooperative tracks your contribution. They are participation credits -- not equity, not guaranteed payout. They reflect what you've put in and let you earn more from what you help build.",
    action: { label: "Join ($5/year)", href: "/join" },
  },
  {
    id: 4,
    label: "Pick a folder for the mesh (optional)",
    description:
      "In Mnemosyne Settings, add a folder you want to share with the cooperative mesh. Files in that folder become discoverable by other mesh participants (you choose which folder -- never your whole drive). You can skip this and add it later.",
    icon: Wifi,
    whatsInItForMe:
      "Every folder you share earns mesh-participation Marks. The more you share, the more the mesh can fetch from you, and the stronger the network becomes for your whole community.",
  },
  {
    id: 5,
    label: "Ask your first question",
    description:
      "Open the Librarian tab in Mnemosyne and ask anything. The AI runs locally on your hardware via Ollama. Nothing leaves your network unless you explicitly share it.",
    icon: Brain,
    whatsInItForMe:
      "You get a private AI assistant that knows your documents, your notes, and your files -- because it runs on your machine. The cooperative network is there when you need it, invisible when you don't.",
  },
];

export default function UnTechOnboardingPage() {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number>(1);
  const { t } = useTranslation();

  const toggleStep = (id: number) =>
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const progress = Math.round((completedSteps.size / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8">
        <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
          unTech Onboarding -- Mnemosyne v0.1.25
        </Badge>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Your Family's Private AI -- On Your Hardware
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Five steps. One installer. No cloud subscription required. Your documents
          stay on your machine. Your Marks accumulate in the cooperative.
        </p>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
            <span>{t("untech.progress", { current: completedSteps.size, total: STEPS.length })}</span>
            <span>{completedSteps.size} of {STEPS.length} steps marked done</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4 pb-20">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const done = completedSteps.has(step.id);
          const expanded = expandedStep === step.id;
          return (
            <Card
              key={step.id}
              className={`transition-all ${done ? "border-emerald-200 bg-emerald-50/30" : ""}`}
            >
              <CardContent className="p-0">
                {/* Step header */}
                <button
                  className="w-full flex items-center gap-4 p-5 text-left"
                  onClick={() => setExpandedStep(expanded ? 0 : step.id)}
                  aria-expanded={expanded}
                >
                  <div
                    className={`p-2 rounded-full shrink-0 ${
                      done ? "bg-emerald-100" : "bg-slate-100"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${done ? "text-emerald-700" : "text-slate-600"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        Step {step.id}
                      </span>
                      {done && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          Done
                        </Badge>
                      )}
                    </div>
                    <div className="font-semibold text-slate-900">{step.label}</div>
                  </div>
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Step body */}
                {expanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                    <p className="text-slate-700 leading-relaxed">{step.description}</p>

                    {/* What's in it for me */}
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                      <div className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">
                        What's in it for you
                      </div>
                      <p className="text-sm text-amber-900 leading-relaxed">
                        {step.whatsInItForMe}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center gap-3">
                      {step.action && (
                        <Button asChild size="sm">
                          <Link to={step.action.href}>{step.action.label}</Link>
                        </Button>
                      )}
                      <Button
                        variant={done ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleStep(step.id)}
                        className={done ? "border-emerald-300 text-emerald-700" : ""}
                      >
                        {done ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" /> Marked done
                          </>
                        ) : (
                          <>
                            <Circle className="w-4 h-4 mr-1" /> Mark as done
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Completed state */}
        {completedSteps.size === STEPS.length && (
          <Card className="border-emerald-300 bg-emerald-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-emerald-900 mb-2">
                Setup complete
              </h2>
              <p className="text-emerald-700 mb-4">
                Your family's private AI is running. Your cooperative account is active.
                Your Marks are accumulating.
              </p>
              <Button asChild>
                <Link to="/dashboard">Go to your dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Marks disclosure */}
        <div className="text-xs text-slate-400 text-center leading-relaxed">
          Marks represent your participation in the cooperative -- not equity,
          shares, or guaranteed financial return. Cost+20% architecture;
          83.3% of platform revenue flows to creators.
        </div>
      </div>
    </div>
  );
}
