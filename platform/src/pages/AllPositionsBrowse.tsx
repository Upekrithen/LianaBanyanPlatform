import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, DollarSign, TrendingUp, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";

const POSITION_CATEGORIES = [
  {
    value: "create_idea" as const,
    label: "Ideation & Creation",
    icon: TrendingUp,
  },
  {
    value: "define_describe_document" as const,
    label: "Documentation",
    icon: Briefcase,
  },
  {
    value: "research_development" as const,
    label: "Research & Development",
    icon: Building,
  },
  {
    value: "prototype" as const,
    label: "Prototyping & Engineering",
    icon: Building,
  },
  {
    value: "legal_services" as const,
    label: "Legal Services",
    icon: Briefcase,
  },
  {
    value: "logistics_blockchain" as const,
    label: "Logistics & Blockchain",
    icon: Building,
  },
  {
    value: "steward_owner" as const,
    label: "Stewardship & Leadership",
    icon: Building,
  },
  {
    value: "marketing_services" as const,
    label: "Marketing & Sales",
    icon: TrendingUp,
  },
  {
    value: "accounting_services" as const,
    label: "Accounting & Finance",
    icon: DollarSign,
  },
  { value: "hr_staffing" as const, label: "HR & Staffing", icon: Briefcase },
  {
    value: "materials_sourcing" as const,
    label: "Materials & Sourcing",
    icon: Building,
  },
  {
    value: "manufacture_assembly" as const,
    label: "Manufacturing & Assembly",
    icon: Building,
  },
  {
    value: "kickstarter_campaign" as const,
    label: "Crowdfunding Campaign",
    icon: TrendingUp,
  },
  { value: "it_services" as const, label: "IT Services", icon: Building },
  {
    value: "delivery" as const,
    label: "Delivery & Distribution",
    icon: Building,
  },
];

export default function AllPositionsBrowse() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: positions, isLoading } = useQuery({
    queryKey: ["all-positions", selectedCategory, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("contract_position_templates")
        .select(
          `
          *,
          project:projects(id, name, project_sku)
        `,
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory as any);
      }

      if (searchTerm) {
        query = query.or(
          `position_title.ilike.%${searchTerm}%,position_description.ilike.%${searchTerm}%`,
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const groupedByCategory = positions?.reduce((acc: any, position: any) => {
    if (!acc[position.category]) {
      acc[position.category] = [];
    }
    acc[position.category].push(position);
    return acc;
  }, {});

  return (
    <PortalPageLayout maxWidth="xl" xrayId="all-positions-browse">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse All Positions</h1>
          <p className="text-muted-foreground">
            Explore contract positions across all LB projects
          </p>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Search positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
            <TabsTrigger value="all">
              All Positions ({positions?.length || 0})
            </TabsTrigger>
            {POSITION_CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
                {groupedByCategory?.[cat.value] && (
                  <Badge variant="secondary" className="ml-2">
                    {groupedByCategory[cat.value].length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4">
            {isLoading ? (
              <div>Loading positions...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {positions?.map((position: any) => (
                  <Card
                    key={position.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {position.position_title}
                          </CardTitle>
                          <CardDescription>
                            {(position.project as any)?.name}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{position.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm line-clamp-3">
                        {position.position_description ||
                          "No description provided"}
                      </p>

                      <div className="space-y-2">
                        {position.compensation_type === "participation" &&
                          position.participation_percentage && (
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4" />
                              <span>
                                {position.participation_percentage}%
                                participation
                              </span>
                            </div>
                          )}
                        {position.compensation_type === "cash" &&
                          position.cash_amount && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4" />
                              <span>${position.cash_amount}</span>
                            </div>
                          )}
                        {position.compensation_type === "hybrid" && (
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>
                              {position.participation_percentage}% participation
                              + ${position.cash_amount}
                            </span>
                          </div>
                        )}
                        {position.credits_reserved > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary">
                              {position.credits_reserved} credits reserved
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() =>
                            navigate(
                              `/projects/${(position.project as any)?.id}/positions`,
                            )
                          }
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(`/positions/${position.id}/apply`)
                          }
                        >
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
  );
}
