/**
 * LET'S GET GROCERIES — Group Grocery Coordination Mini-App
 * ==========================================================
 * Wave 13: Full mini-app with grocery circle coordination.
 *
 * Features:
 *   - Grocery circle discovery and joining
 *   - Shared weekly order (add/remove items, Cost+20%)
 *   - Auto cost-splitting across circle members
 *   - Marks for organizing (participation credits, securities-clean)
 *   - Bounty for first organizer in a neighborhood
 *   - Cue Card + onboarding hook
 *
 * Routes:
 *   /initiatives/lets-get-groceries       <- this page
 *   /initiatives/lets-get-groceries/box   <- GroceryBoxPage (bulk box subscription)
 *   /initiatives/lets-get-groceries/start-node <- GroceryNodeRegistration
 *
 * Securities-clean throughout: Marks = participation credits, not equity.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { GroceryCirclePanel } from "@/components/lgg/GroceryCirclePanel";
import { GroceryOrderForm } from "@/components/GroceryOrderForm";
import { ExpandableBlock, DataVizBar } from "@/components/pudding";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { getCueCard } from "@/data/initiativeWalkthroughs";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useTranslation } from "react-i18next";
import { usePageSEO } from "@/hooks/usePageSEO";
import {
  ShoppingCart,
  ArrowLeft,
  HelpCircle,
  MapPin,
  TrendingDown,
  Users,
  Package,
  ArrowRight,
} from "lucide-react";

export default function LetsGetGroceriesPage() {
  usePageSEO({
    title: "Let's Get Groceries | Liana Banyan",
    description: "Cooperative grocery coordination for neighborhoods. Coordinate bulk buys, split orders, and support local farms.",
    canonical: "https://lianabanyan.com/initiatives/lets-get-groceries",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  const cueCard = getCueCard("lets-get-groceries");

  return (
    <LaunchConditionOverlay
      initiativeSlug="lets-get-groceries"
      initiativeName="Let's Get Groceries"
    >
      <PortalPageLayout variant="immersive" className="landing-page" xrayId="lets-get-groceries-page">
        {/* Brand title */}
        <div className="landing-title">
          <span className="liana">Liana</span>
          <span className="banyan">Banyan</span>
        </div>

        {/* Nav buttons */}
        <button
          onClick={() => navigate("/?view=initiatives")}
          className="ghost-toggle"
          style={{ left: 20 }}
        >
          <ArrowLeft className="inline h-4 w-4 mr-1" />
          Back to Initiatives
        </button>

        <button
          onClick={() => navigate("/initiatives/lets-get-groceries/start-node")}
          className="ghost-toggle"
          style={{ right: 20, left: "auto" }}
          title="Start a grocery node"
        >
          <MapPin className="inline h-4 w-4 mr-1" />
          Start a Node
        </button>

        <div
          className="container"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}
        >
          {/* Header */}
          <header className="landing-header" style={{ marginTop: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
              <ShoppingCart
                className="inline h-12 w-12"
                style={{ color: "#34d399", marginRight: "0.5rem" }}
              />
            </div>
            <h1
              style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}
            >
              Let's Get Groceries
            </h1>
            <p style={{ opacity: 0.8, maxWidth: 520, margin: "0 auto" }}>
              Volume discount grocery runs with your neighborhood. Cost+20% on every
              item. Node hosts earn 83.3%.
            </p>
          </header>

          {/* How It Works — expandable */}
          <div className="trunk-info" style={{ marginTop: "2rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
                maxWidth: 1000,
                margin: "0 auto",
              }}
            >
              <ExpandableBlock
                title="1. Join Your Circle"
                subtitle="20-100 households"
                preview="More neighbors = lower cost for everyone..."
                accentColor="#22c55e"
                defaultExpanded={false}
              >
                <div className="flex items-start gap-3">
                  <Users className="h-8 w-8 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm leading-relaxed opacity-80">
                      A grocery circle serves 20-100 households. The more neighbors
                      join, the lower the per-unit cost. Minimum order thresholds unlock
                      the best wholesale rates.
                    </p>
                  </div>
                </div>
              </ExpandableBlock>

              <ExpandableBlock
                title="2. Add Items"
                subtitle="Browse the weekly staples catalog"
                preview="Every item priced at Cost+20%..."
                accentColor="#34d399"
                defaultExpanded={false}
              >
                <div className="flex items-start gap-3">
                  <Package className="h-8 w-8 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm leading-relaxed opacity-80">
                      Every item is priced at Cost+20%. No brand premium, no shrinkflation
                      surprise. You see the exact source cost and markup before adding
                      anything to your order.
                    </p>
                  </div>
                </div>
              </ExpandableBlock>

              <ExpandableBlock
                title="3. Confirm & Pick Up"
                subtitle="Orders batch weekly or bi-weekly"
                preview="Pay only what you ordered, no surprises..."
                accentColor="#f59e0b"
                defaultExpanded={false}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-8 w-8 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm leading-relaxed opacity-80">
                      The node coordinator confirms the full order once per cycle. You
                      pay only for what you requested. Pickup is a 5-minute social event
                      at a neighbor's garage or community space.
                    </p>
                  </div>
                </div>
              </ExpandableBlock>

              <ExpandableBlock
                title="4. Host a Node"
                subtitle="Earn 83.3% of the coordination fee"
                preview="Your garage could fund a year of groceries..."
                accentColor="#a78bfa"
                defaultExpanded={false}
              >
                <div>
                  <p className="text-sm leading-relaxed opacity-80 mb-3">
                    Node hosts earn 83.3% of the coordination fee. You need a dry space,
                    a scale, and a few hours per cycle.
                  </p>
                  <DataVizBar
                    title="Coordination Fee Split"
                    subtitle="Node host keeps 83.3%"
                    data={[
                      { label: "Node host", value: 83.3, color: "#a78bfa", icon: "🏠" },
                      { label: "Platform (C+20%)", value: 16.7, color: "#f97316", icon: "🏛️" },
                    ]}
                    maxValue={100}
                    showPercentages={true}
                    height={20}
                  />
                </div>
              </ExpandableBlock>
            </div>
          </div>

          {/* Grocery Circle Panel — the mini-app */}
          <div className="trunk-info" style={{ marginTop: "2rem" }}>
            <h2
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "#86efac",
              }}
            >
              Your Neighborhood Grocery Circle
            </h2>
            <GroceryCirclePanel />
          </div>

          {/* Legacy GroceryOrderForm — kept for direct/single orders */}
          <div className="trunk-info" style={{ marginTop: "2rem" }}>
            <h2
              style={{
                textAlign: "center",
                marginBottom: "0.5rem",
                color: "#c4b5fd",
              }}
            >
              Direct Grocery Order
            </h2>
            <p
              style={{
                textAlign: "center",
                opacity: 0.6,
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              Place a single-household order for scheduled delivery.
            </p>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <GroceryOrderForm />
            </div>
          </div>

          {/* Volume savings explainer */}
          <div className="trunk-info" style={{ marginTop: "2rem" }}>
            <h2
              style={{
                textAlign: "center",
                marginBottom: "1rem",
                color: "#86efac",
              }}
            >
              Why Volume Buying Changes Everything
            </h2>
            <div
              style={{
                maxWidth: 700,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {[
                {
                  label: "Retail price per unit",
                  value: "$4.80",
                  color: "#f87171",
                  note: "Standard grocery markup",
                },
                {
                  label: "Circle price (Cost+20%)",
                  value: "$3.60",
                  color: "#34d399",
                  note: "Transparent wholesale + 20%",
                },
                {
                  label: "Estimated annual savings",
                  value: "~$800",
                  color: "#a78bfa",
                  note: "Per household in a 30-member circle",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 p-4 text-center"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.25rem" }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.45, marginTop: "0.15rem" }}>
                    {stat.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cue Card */}
          {cueCard && (
            <div className="trunk-info" style={{ marginTop: "2rem" }}>
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "1rem",
                  color: "#c4b5fd",
                }}
              >
                Quick Reference
              </h2>
              <div style={{ maxWidth: 520, margin: "0 auto" }}>
                <InitiativeCueCard card={cueCard} />
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="trunk-info" style={{ marginTop: "2rem" }}>
            <h2
              style={{
                textAlign: "center",
                marginBottom: "1.25rem",
                color: "#c4b5fd",
              }}
            >
              More in Let's Get Groceries
            </h2>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => navigate("/initiatives/lets-get-groceries/box")}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-green-500/30 text-green-300 text-sm hover:bg-green-500/10 transition-colors"
                style={{ background: "rgba(34,197,94,0.07)" }}
              >
                <Package className="h-4 w-4" />
                Grocery Box (Subscription)
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </button>
              <button
                onClick={() => navigate("/initiatives/lets-get-groceries/start-node")}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-500/10 transition-colors"
                style={{ background: "rgba(168,85,247,0.07)" }}
              >
                <MapPin className="h-4 w-4" />
                Register as a Node
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            </div>
          </div>

          {/* Ghost banner */}
          {!user && (
            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(0,0,0,0.9)",
                padding: "1rem",
                textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                zIndex: 100,
              }}
            >
              <span style={{ opacity: 0.7 }}>Exploring as Guest</span>
              <span style={{ margin: "0 1rem", opacity: 0.4 }}>|</span>
              <span style={{ opacity: 0.5 }}>
                Join to add items and earn Marks
              </span>
              <button
                onClick={() =>
                  openOnboard({
                    reason: "join your neighborhood grocery circle",
                    actionLabel: "Join",
                    membershipIncluded: true,
                  })
                }
                className="btn"
                style={{
                  marginLeft: "1rem",
                  padding: "0.4rem 1rem",
                  fontSize: "0.85rem",
                }}
              >
                Join for $5/year
              </button>
            </div>
          )}

          <footer
            className="landing-footer"
            style={{ paddingBottom: user ? "2rem" : "5rem" }}
          >
            <p>© 2026 Liana Banyan Corporation</p>
          </footer>
        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
