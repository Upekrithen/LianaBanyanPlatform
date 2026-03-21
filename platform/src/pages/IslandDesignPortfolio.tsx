import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Award, Eye, MapPin, Star } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function IslandDesignPortfolio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch designer's completed islands
  const { data: portfolioIslands, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["designer-portfolio", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("island_design_portfolio" as any)
        .select(`
          *,
          island:islands(
            id,
            name,
            description,
            island_size:island_sizes(size_name, hex_count)
          )
        `)
        .eq("designer_id", user?.id)
        .order("completion_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch active assignments
  const { data: activeAssignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["designer-assignments", user?.id],
    queryFn: async () => {
      const { data: assignments, error } = await supabase
        .from("island_assignments" as any)
        .select(`
          *,
          island:islands(id, name),
          contract:contract_opportunities(id, title, status, total_credits)
        `)
        .eq("designer_id", user?.id)
        .eq("status", "in_progress");

      if (error) throw error;
      return assignments;
    },
    enabled: !!user,
  });

  // Calculate portfolio stats
  const stats = {
    totalCompleted: portfolioIslands?.length || 0,
    totalViews: portfolioIslands?.reduce((sum: number, item: any) => sum + (item.view_count || 0), 0) || 0,
    avgRating: portfolioIslands && portfolioIslands.length > 0
      ? (portfolioIslands.reduce((sum: number, item: any) => sum + (item.rating || 0), 0) / portfolioIslands.length).toFixed(1)
      : 0,
    activeProjects: activeAssignments?.length || 0,
  };

  return (
    <PortalPageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Island Designer Portfolio</h1>
        <p className="text-muted-foreground">
          Showcase your completed island designs and manage active commissions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Islands</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}/5.0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="active">Active Commissions</TabsTrigger>
          <TabsTrigger value="opportunities">Find Work</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          {isLoadingPortfolio ? (
            <p className="text-muted-foreground">Loading portfolio...</p>
          ) : portfolioIslands && portfolioIslands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioIslands.map((item: any) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {item.showcase_image_url && (
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                      <img 
                        src={item.showcase_image_url} 
                        alt={item.island?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {item.island?.name}
                      {item.featured && <Badge variant="secondary">Featured</Badge>}
                    </CardTitle>
                    <CardDescription>
                      {item.island?.island_size?.size_name} Island • {item.island?.island_size?.hex_count} hexes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Style</span>
                        <Badge variant="outline">{item.design_style || "Custom"}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Views</span>
                        <span>{item.view_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating || 0}/5</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => navigate(`/island/${item.island?.id}`)}
                      >
                        View Island
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't completed any island designs yet.
                </p>
                <Button onClick={() => navigate("/island-assignments")}>
                  Browse Available Projects
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {isLoadingAssignments ? (
            <p className="text-muted-foreground">Loading assignments...</p>
          ) : activeAssignments && activeAssignments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {activeAssignments.map((assignment: any) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {assignment.island?.name}
                      <Badge>{assignment.assignment_type}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {assignment.contract?.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Compensation</span>
                        <p className="text-lg font-semibold">{assignment.contract?.total_credits} credits</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Est. Hours</span>
                        <p className="text-lg font-semibold">{assignment.estimated_hours || "TBD"}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(`/island/${assignment.island?.id}/builder`)}
                      className="w-full"
                    >
                      Continue Building
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  You don't have any active commissions.
                </p>
                <Button onClick={() => navigate("/island-assignments")}>
                  Find Island Design Work
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Browse available island design opportunities on the Assignment Board.
              </p>
              <Button onClick={() => navigate("/island-assignments")}>
                View Assignment Board
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
