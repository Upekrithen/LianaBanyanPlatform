import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Clock, DollarSign, Loader2, MapPin } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function IslandAssignmentBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("all");

  // Fetch available assignments
  const { data: availableAssignments, isLoading } = useQuery({
    queryKey: ["island-assignments", "available", selectedType],
    queryFn: async () => {
      let query = supabase
        .from("island_assignments" as any)
        .select(`
          *,
          island:islands(
            id,
            name,
            description,
            island_size:island_sizes(size_name, hex_count)
          ),
          contract:contract_opportunities(
            id,
            title,
            description,
            total_credits,
            compensation_model,
            status
          )
        `)
        .is("designer_id", null)
        .eq("status", "open");

      if (selectedType !== "all") {
        query = query.eq("assignment_type", selectedType);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Apply for assignment
  const applyMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("island_assignments" as any)
        .update({
          designer_id: user?.id,
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .eq("id", assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Assignment Accepted!",
        description: "You can now start working on this island design.",
      });
      queryClient.invalidateQueries({ queryKey: ["island-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["designer-assignments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to apply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApply = (assignmentId: string, islandId: string) => {
    applyMutation.mutate(assignmentId);
  };

  const assignmentTypes = [
    { value: "all", label: "All Types" },
    { value: "full_island", label: "Full Island Design" },
    { value: "section", label: "Specific Section" },
    { value: "asset_creation", label: "Asset Creation" },
    { value: "consultation", label: "Design Consultation" },
  ];

  return (
    <PortalPageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Island Design Assignment Board</h1>
        <p className="text-muted-foreground">
          Browse and apply for island building commissions
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assignmentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => navigate("/island-portfolio")}>
          My Portfolio
        </Button>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Assignments</TabsTrigger>
          <TabsTrigger value="tips">Designer Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : availableAssignments && availableAssignments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {availableAssignments.map((assignment: any) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{assignment.contract?.title}</CardTitle>
                        <CardDescription>{assignment.island?.name}</CardDescription>
                      </div>
                      <Badge variant="secondary">{assignment.assignment_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {assignment.contract?.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{assignment.contract?.total_credits} credits</p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.contract?.compensation_model}
                          </p>
                        </div>
                      </div>

                      {assignment.estimated_hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{assignment.estimated_hours} hours</p>
                            <p className="text-xs text-muted-foreground">Estimated</p>
                          </div>
                        </div>
                      )}

                      {assignment.delivery_timeline_days && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{assignment.delivery_timeline_days} days</p>
                            <p className="text-xs text-muted-foreground">Timeline</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{assignment.island?.island_size?.size_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.island?.island_size?.hex_count} hexes
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApply(assignment.id, assignment.island?.id)}
                        disabled={applyMutation.isPending}
                        className="flex-1"
                      >
                        {applyMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Apply for Assignment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/island/${assignment.island?.id}`)}
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
              <CardContent className="py-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No Available Assignments</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedType !== "all"
                    ? "Try changing the assignment type filter."
                    : "Check back soon for new island design opportunities."}
                </p>
                <Button variant="outline" onClick={() => navigate("/world-map")}>
                  Explore Island World
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tips">
          <Card>
            <CardHeader>
              <CardTitle>Tips for Island Designers</CardTitle>
              <CardDescription>
                Build a successful portfolio and earn credits through commissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Start with Smaller Islands</h3>
                <p className="text-sm text-muted-foreground">
                  Build experience with 1-hex and 3-hex islands before tackling larger 7-hex projects.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Develop Your Style</h3>
                <p className="text-sm text-muted-foreground">
                  Establish a signature design aesthetic (minimalist, fantasy, modern, etc.) to attract clients.
                </p>
              </div>

              <div>
                <h3 className="font-semibly mb-2">3. Document Your Process</h3>
                <p className="text-sm text-muted-foreground">
                  Screenshot your design iterations and share the story behind your creative decisions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Build Guild Progression</h3>
                <p className="text-sm text-muted-foreground">
                  Each completed assignment earns Guild stake and unlocks higher-tier opportunities.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5. Create Custom Assets</h3>
                <p className="text-sm text-muted-foreground">
                  Original assets earn IP residuals every time they're used by other designers.
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={() => navigate("/asset-library")} variant="outline" className="w-full">
                  Browse Asset Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
