/**
 * Frontier Borrow -- BP072 Wave 3 / Scope 22
 * ===========================================
 * "Borrow a Frontier Node" -- in-app opt-in mechanic.
 *
 * A trusted community node (family/friend's beefy machine) lends compute
 * to light clients for heavy inference. This is strictly OPT-IN for both
 * parties: the lender opts in and can revoke at any time; the borrower
 * explicitly requests.
 *
 * COST HONESTY (mandatory per doctrine):
 *   - $0 transport cost (peer-to-peer, no relay fee)
 *   - ~$0.01 grading cost per session (actual compute)
 *   - Never flat "$0" -- always show the real (approximate) compute cost
 *
 * Route: /frontier/borrow
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Server,
  Wifi,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  Users,
  Info,
} from "lucide-react";

type BorrowMode = "none" | "borrowing" | "lending" | "both";

interface FrontierNode {
  id: string;
  node_label: string | null;
  peer_id: string;
  app_version: string | null;
  owner_display_name?: string;
}

export default function FrontierBorrowPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<BorrowMode>("none");
  const [optInLend, setOptInLend] = useState(false);
  const [optInBorrow, setOptInBorrow] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Persist the borrow/lend opt-in to the user profile
      const { error } = await (supabase
        .from("profiles" as never)
        .update({
          frontier_lend_opt_in: optInLend,
          frontier_borrow_opt_in: optInBorrow,
        } as never)
        .eq("id", user.id));

      if (error) throw error;

      const newMode: BorrowMode =
        optInLend && optInBorrow ? "both"
        : optInLend ? "lending"
        : optInBorrow ? "borrowing"
        : "none";
      setMode(newMode);

      toast({
        title: "Frontier preferences saved",
        description: optInLend
          ? "Your node is now available to trusted borrowers."
          : "Your preferences have been updated.",
      });
    } catch {
      toast({ title: "Error saving preferences", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8">
        <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
          Frontier Node -- Community Compute
        </Badge>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Borrow a Frontier Node
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Light on hardware? A trusted community node -- a family member's or
          friend's more powerful machine -- can handle your heavy inference
          while you work. Strictly opt-in. Both parties choose.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6 pb-20">

        {/* Cost honesty card */}
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-amber-900 mb-1">Honest cost disclosure</div>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>Transport cost: <strong>$0</strong> (peer-to-peer, no relay fee incurred)</li>
                  <li>Grading / compute cost: <strong>~$0.01 per inference session</strong> (actual compute on lender's hardware)</li>
                  <li>This is never flat "$0" -- the lender's electricity and CPU time have real value.</li>
                </ul>
                <p className="text-xs text-amber-700 mt-2">
                  Future Marks-based settlement between borrower and lender is on the roadmap --
                  not live yet. Current version is free by mutual consent.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold mt-0.5">1</span>
                <span>
                  <strong>Lender opts in</strong> below. Their Frontier node becomes
                  discoverable by the cooperative mesh under their chosen label.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold mt-0.5">2</span>
                <span>
                  <strong>Borrower opts in</strong> below and selects a trusted node
                  by peer ID or label. Only nodes belonging to members you have
                  explicitly trusted appear in your list.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold mt-0.5">3</span>
                <span>
                  <strong>Inference routes</strong> to the lender's machine.
                  Results return to the borrower. Neither party's data is stored
                  on the relay.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold mt-0.5">4</span>
                <span>
                  <strong>Either party can revoke</strong> at any time from this page
                  or from Mnemosyne Settings.
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Opt-in controls */}
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Your Frontier Preferences
              </CardTitle>
              <CardDescription>
                Both options are off by default. Change them at any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lend */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900">
                      Lend my node to trusted borrowers
                    </div>
                    <div className="text-sm text-slate-500">
                      Your registered Frontier node becomes available for borrowers you trust.
                      You can withdraw at any time.
                    </div>
                  </div>
                </div>
                <Switch
                  checked={optInLend}
                  onCheckedChange={setOptInLend}
                  aria-label="Opt in to lending my node"
                />
              </div>
              {/* Borrow */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Wifi className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900">
                      Allow me to borrow trusted nodes
                    </div>
                    <div className="text-sm text-slate-500">
                      When your device needs more compute, you can request it from
                      trusted community nodes. Only nodes belonging to members you have
                      explicitly added appear.
                    </div>
                  </div>
                </div>
                <Switch
                  checked={optInBorrow}
                  onCheckedChange={setOptInBorrow}
                  aria-label="Opt in to borrowing trusted nodes"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? "Saving..." : "Save preferences"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-amber-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  Sign in to configure Frontier borrowing preferences. Membership is $5/year.
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button asChild size="sm">
                  <a href="/auth">Sign in</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/join">Join ($5/yr)</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trust list placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              Trusted Node Members
            </CardTitle>
            <CardDescription>
              Members whose nodes you have agreed to borrow from or lend to.
              Add by cooperative member ID or username.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-slate-400 py-8 border border-dashed border-slate-200 rounded-lg">
              No trusted nodes configured yet.
              <br />
              <span className="text-xs">
                Trust list management -- coming in the next Mnemosyne release.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Register your own node link */}
        <div className="text-center text-sm text-slate-500">
          Want to register your own node as a Frontier participant?{" "}
          <a href="/node-registration" className="text-primary hover:underline">
            Node Registration
          </a>
        </div>
      </div>
    </div>
  );
}
