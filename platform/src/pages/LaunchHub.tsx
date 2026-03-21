/**
 * LAUNCH HUB — Two-path gateway for builders and operators
 * =========================================================
 * Path A: Start Your Own Product → /simulator
 * Path B: Run an Initiative Node → /launch/run-a-node
 */

import { useNavigate } from "react-router-dom";
import { Rocket, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function LaunchHub() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        <button
          onClick={() => navigate("/portal")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </button>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Launch &amp; Build
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Build your own product with cooperative infrastructure, or run a
            node for an existing initiative.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Path A: Start Your Own Product */}
          <div
            className="group bg-card border-2 border-border hover:border-green-500 rounded-2xl p-8 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate("/simulator")}
          >
            <div className="bg-green-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
              <Rocket className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Start Your Own Product</h2>
            <p className="text-muted-foreground mb-4">
              Got an idea? Use the Business Simulator to model costs, the Deck
              Card Studio to pitch it, and pre-order funding to bring it to
              life. You keep 83.3% — the platform runs at cost + 20%.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">&#10003;</span>
                Business Simulator &amp; cost modeling
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">&#10003;</span>
                Pre-order funding (no upfront risk)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">&#10003;</span>
                Member-governed manufacturing network
              </li>
            </ul>
            <div className="flex items-center text-green-500 font-semibold">
              Open Simulator{" "}
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Path B: Run an Initiative Node */}
          <div
            className="group bg-card border-2 border-border hover:border-amber-500 rounded-2xl p-8 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate("/launch/run-a-node")}
          >
            <div className="bg-amber-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
              <Building2 className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Run an Initiative Node</h2>
            <p className="text-muted-foreground mb-4">
              Don't have a product idea but want to build income? Pick one of
              our 16 initiatives and start a local node. We provide the
              playbook, you provide the hustle.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">&#10003;</span>
                Proven initiative models (Let's Make Dinner, Let's Get
                Groceries, etc.)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">&#10003;</span>
                Pre-sold capacity = zero startup risk
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">&#10003;</span>
                It's YOUR node — platform provides tools at cost + 20%
              </li>
            </ul>
            <div className="flex items-center text-amber-500 font-semibold">
              Browse Initiatives{" "}
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </PortalPageLayout>
  );
}
