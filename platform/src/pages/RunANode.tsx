/**
 * RUN A NODE — Initiative Node Picker
 * ====================================
 * Shows available initiatives with node openings.
 * Each card: initiative name, what a node does, what you need, expected income.
 */

import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { ProductionRunDraft } from "@/components/ProductionRunDraft";
import { SuccessStories } from "@/components/SuccessStories";

const INITIATIVE_NODES = [
  {
    id: "lets-make-dinner",
    name: "Let's Make Dinner",
    tagline: "Feed your neighborhood, build a business",
    description:
      "Run a kitchen node — cook meals for your community using pre-sold capacity. Church kitchens, food trucks, home kitchens, or restaurants during off-hours.",
    whatYouNeed: [
      "Access to a commercial or licensed kitchen",
      "A Captain (food-service licensed individual)",
      "Willingness to serve 25+ meals/week minimum",
    ],
    income: "May earn $500–$2,000/week depending on capacity and demand",
    icon: ChefHat,
    color: "red",
    route: "/initiatives/lets-make-dinner/start-node",
    status: "open" as const,
  },
  {
    id: "lets-get-groceries",
    name: "Let's Get Groceries",
    tagline: "Aggregate buying power, deliver savings",
    description:
      "Run a grocery distribution hub — coordinate bulk purchasing, aggregate neighborhood orders, and deliver groceries at volume-discount prices.",
    whatYouNeed: [
      "A vehicle (car, van, or truck)",
      "Storage space (garage, warehouse, or pickup point)",
      "Ability to cover a delivery zone (5–15 mile radius)",
    ],
    income: "May earn $300–$1,500/week depending on delivery volume",
    icon: ShoppingCart,
    color: "green",
    route: "/initiatives/lets-get-groceries/start-node",
    status: "open" as const,
  },
  {
    id: "lets-go-shopping",
    name: "Let's Go Shopping",
    tagline: "Curate local retail, connect makers to buyers",
    description:
      "Run a local retail node — curate products from platform creators, host pop-ups, or manage a storefront that connects makers with your community.",
    whatYouNeed: [
      "Retail space (physical or pop-up)",
      "Community connections",
      "Passion for local products",
    ],
    income: "May earn based on sales volume — model in development",
    icon: ShoppingBag,
    color: "purple",
    route: "",
    status: "coming_soon" as const,
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> =
  {
    red: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      border: "hover:border-red-500",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-500",
      border: "hover:border-green-500",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-500",
      border: "hover:border-purple-500",
    },
  };

export default function RunANode() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <button
          onClick={() => navigate("/launch")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Launch Hub
        </button>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Run an Initiative Node
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick an initiative, start a local node, and build income serving
            your community. Pre-sold capacity means zero startup risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIATIVE_NODES.map((node) => {
            const colors = COLOR_MAP[node.color] ?? COLOR_MAP.green;
            const isOpen = node.status === "open";

            return (
              <div
                key={node.id}
                className={`group bg-card border-2 border-border ${isOpen ? colors.border : ""} rounded-2xl p-6 transition-all ${isOpen ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : "opacity-70"}`}
                onClick={() => isOpen && node.route && navigate(node.route)}
              >
                <div
                  className={`${colors.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-5`}
                >
                  <node.icon className={`w-7 h-7 ${colors.text}`} />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{node.name}</h3>
                  {!isOpen && (
                    <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Coming Soon
                    </span>
                  )}
                </div>

                <p className={`text-sm ${colors.text} font-medium mb-3`}>
                  {node.tagline}
                </p>

                <p className="text-sm text-muted-foreground mb-4">
                  {node.description}
                </p>

                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    What you need
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {node.whatYouNeed.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`${colors.text} mt-0.5`}>
                          &#8226;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground italic mb-4">
                  {node.income}
                </p>

                {isOpen && (
                  <div
                    className={`flex items-center ${colors.text} font-semibold text-sm`}
                  >
                    Start Registration{" "}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            More initiatives opening for node operators soon. All 16 Sweet
            Sixteen initiatives will eventually have node opportunities.
          </p>
        </div>

        {/* Production Run Draft — Fantasy Football for Makers */}
        <div className="mt-16 pt-12 border-t border-border">
          <ProductionRunDraft maxItems={4} />
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/production-runs")}
              className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
            >
              Browse all production runs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mt-12">
          <SuccessStories maxItems={3} />
        </div>
      </div>
    </div>
  );
}
