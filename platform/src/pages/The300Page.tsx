import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Anchor, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePedestals, useSupportPedestal } from "@/hooks/usePedestals";
import { PedestalGrid } from "@/components/the300/PedestalGrid";
import { The300Progress } from "@/components/the300/The300Progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function The300Page() {
  const { user } = useAuth();
  const { data: pedestals = [], isLoading } = usePedestals();
  const supportMutation = useSupportPedestal();

  const handleSupport = (pedestalId: string) => {
    if (!user) {
      toast.error("Sign in to support this appointment.");
      return;
    }
    supportMutation.mutate({ pedestalId });
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="the-300">
      <div className="space-y-10 py-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-blue-500/40 text-blue-300">
            <Shield className="w-3 h-3 mr-1" />
            Governance
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-black text-blue-100">
            The 300
          </h1>
          <p className="text-xl text-blue-400/60 italic max-w-xl mx-auto">
            "We are 300. And behind us, millions more."
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Strategic allies, Crown seat holders, board members, and regional Captains —
            the distributed leadership that powers the cooperative. Every seat is visible.
            Every appointment can be supported by the community.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-xl mx-auto">
          <The300Progress pedestals={pedestals} />
        </div>

        {/* Pedestal Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Shield className="w-8 h-8 mx-auto animate-pulse text-blue-400" />
            <p className="text-slate-500 mt-2">Loading seats...</p>
          </div>
        ) : (
          <PedestalGrid pedestals={pedestals} onSupport={handleSupport} />
        )}

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/captain/become">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500">
              <Anchor className="w-4 h-4 mr-2" />
              Apply to Become a Captain
            </Button>
          </Link>
          <Link to="/governance/proposals">
            <Button size="lg" variant="outline" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
              View Governance Proposals <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Innovation stats */}
        <div className="text-center text-xs text-slate-600 pt-4">
          {{innovationCount}} innovations | 2,473 claims | {{provisionalApps}} provisional patents | 23 production systems
        </div>
      </div>
    </PortalPageLayout>
  );
}
