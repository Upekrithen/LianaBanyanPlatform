import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Pill, DollarSign, Utensils, ArrowRight, ShoppingCart, ShoppingBag } from "lucide-react";

export default function InitiativeProjectsPage() {
  const navigate = useNavigate();

  const { data: initiatives, isLoading } = useQuery({
    queryKey: ["initiative-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("initiative_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const initiativeIcons: Record<string, any> = {
    "lets_make_dinner": Utensils,
    "defense_claws": Shield,
    "lifeline_medications": Pill,
    "msa": DollarSign,
    "lets_go_shopping": ShoppingCart,
    "lets_get_groceries": ShoppingBag,
  };

  const initiativeColors: Record<string, string> = {
    "lets_make_dinner": "from-blue-500/10 to-cyan-500/20 border-blue-500/20",
    "defense_claws": "from-purple-500/10 to-pink-500/20 border-purple-500/20",
    "lifeline_medications": "from-green-500/10 to-emerald-500/20 border-green-500/20",
    "msa": "from-amber-500/10 to-yellow-500/20 border-amber-500/20",
    "lets_go_shopping": "from-indigo-500/10 to-violet-500/20 border-indigo-500/20",
    "lets_get_groceries": "from-lime-500/10 to-green-500/20 border-lime-500/20",
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading initiatives...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold">Initiative Projects</h1>
          <p className="text-muted-foreground">
            Organization-wide programs with charitable and community impact
          </p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-red-500/5 to-pink-500/10">
        <CardHeader>
          <CardTitle>What Are Initiative Projects?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Initiative Projects are organization-wide programs run primarily through the <strong>.org</strong> division.
            They serve the member community and external beneficiaries with a focus on charitable impact.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Key Differences</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Scope:</strong> Organization-wide, not project-specific</li>
                <li><strong>Location:</strong> Primarily .org portal</li>
                <li><strong>Funding:</strong> Member credits, donations, surplus allocation</li>
                <li><strong>Purpose:</strong> Community benefit and charitable impact</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Governance</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Banyan Council oversight</li>
                <li>Specialized committees per initiative</li>
                <li>Financial firewall from standard projects</li>
                <li>Transparent metrics and impact reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {initiatives?.map((initiative) => {
          const Icon = initiativeIcons[initiative.initiative_slug] || Heart;
          const colorClass = initiativeColors[initiative.initiative_slug] || "from-gray-500/10 to-gray-500/20 border-gray-500/20";
          const fundingProgress = initiative.total_funding_received && initiative.funding_goal
            ? (initiative.total_funding_received / initiative.funding_goal) * 100
            : 0;

          return (
            <Card
              key={initiative.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br ${colorClass}`}
              onClick={() => {
                if (initiative.initiative_slug === "lets_make_dinner") {
                  navigate("/initiatives/lets-make-dinner");
                } else if (initiative.initiative_slug === "defense_claws") {
                  navigate("/initiatives/defense-claws");
                } else if (initiative.initiative_slug === "msa") {
                  navigate("/initiatives/msa");
                } else if (initiative.initiative_slug === "lifeline_medications") {
                  navigate("/initiatives/lifeline-medications");
                } else if (initiative.initiative_slug === "lets_go_shopping") {
                  navigate("/initiatives/lets-go-shopping");
                } else if (initiative.initiative_slug === "lets_get_groceries") {
                  navigate("/initiatives/lets-get-groceries");
                }
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <div>
                      <CardTitle>{initiative.initiative_name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {initiative.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {initiative.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {initiative.funding_goal && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-medium">
                        ${initiative.total_funding_received?.toFixed(0) || 0} / ${initiative.funding_goal.toFixed(0)}
                      </span>
                    </div>
                    <Progress value={fundingProgress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    {initiative.participants_count || 0} participants
                  </span>
                  <Button variant="ghost" size="sm">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!initiatives || initiatives.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No initiatives available yet. Check back soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
