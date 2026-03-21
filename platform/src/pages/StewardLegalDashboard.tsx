import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, FileText, DollarSign, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function StewardLegalDashboard() {
  const { user } = useAuth();

  const { data: formations, isLoading } = useQuery({
    queryKey: ["legal-formations-steward"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_formation_tracking")
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const statusBadgeVariant = (status: string) => {
    const variants: Record<string, any> = {
      "pending": "outline",
      "ein_issued": "secondary",
      "llc_filing": "default",
      "llc_approved": "default",
      "completed": "default",
    };
    return variants[status] || "outline";
  };

  const handleUpdateStatus = async (formationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("legal_formation_tracking")
      .update({ current_status: newStatus })
      .eq("id", formationId);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status Updated",
        description: "Formation status has been updated successfully.",
      });
    }
  };

  if (isLoading) {
    return (
      <PortalPageLayout>
        <p>Loading legal formations...</p>
      </PortalPageLayout>
    );
  }

  const pendingFormations = formations?.filter(f => f.current_status === "pending") || [];
  const activeFormations = formations?.filter(f => f.current_status !== "pending" && f.current_status !== "completed") || [];
  const completedFormations = formations?.filter(f => f.current_status === "completed") || [];

  return (
    <PortalPageLayout>
      <div className="flex items-center gap-3">
        <Scale className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Legal Formation Dashboard</h1>
          <p className="text-muted-foreground">
            Steward Management - Track and process member legal formations
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingFormations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeFormations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active formations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedFormations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingFormations.map((formation) => (
            <Card key={formation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {formation.profiles?.full_name || formation.profiles?.email}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formation.profiles?.email}
                    </CardDescription>
                  </div>
                  <Badge variant={statusBadgeVariant(formation.current_status)}>
                    {formation.current_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formation Type:</span>
                    <span className="font-medium">{formation.formation_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State:</span>
                    <span className="font-medium">{formation.state || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requested:</span>
                    <span className="font-medium">
                      {new Date(formation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(formation.id, "ein_issued")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Issue EIN
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(formation.id, "llc_filing")}
                  >
                    Begin LLC Filing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingFormations.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No pending formation requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeFormations.map((formation) => (
            <Card key={formation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {formation.profiles?.full_name || formation.profiles?.email}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formation.profiles?.email}
                    </CardDescription>
                  </div>
                  <Badge variant={statusBadgeVariant(formation.current_status)}>
                    {formation.current_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EIN:</span>
                    <span className="font-medium">{formation.ein_number || "Pending"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formation Cost:</span>
                    <span className="font-medium">${formation.formation_cost_usd || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-medium">${formation.amount_paid || 0}</span>
                  </div>
                </div>

                {formation.notes && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">{formation.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const nextStatus = formation.current_status === "ein_issued"
                        ? "llc_filing"
                        : formation.current_status === "llc_filing"
                        ? "llc_approved"
                        : "completed";
                      handleUpdateStatus(formation.id, nextStatus);
                    }}
                  >
                    Advance Status
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(formation.id, "completed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeFormations.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No formations in progress</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedFormations.map((formation) => (
            <Card key={formation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {formation.profiles?.full_name || formation.profiles?.email}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formation.profiles?.email}
                    </CardDescription>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EIN:</span>
                    <span className="font-medium">{formation.ein_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formation Type:</span>
                    <span className="font-medium">{formation.formation_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-medium">
                      {formation.llc_approval_date
                        ? new Date(formation.llc_approval_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {completedFormations.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No completed formations yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
