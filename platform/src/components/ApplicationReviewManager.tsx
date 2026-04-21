import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, UserCheck, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApplicantDetailDialog } from "./ApplicantDetailDialog";
import { PositionAssignmentDialog } from "./PositionAssignmentDialog";

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  position_id: string;
  status: string;
  applied_at: string;
  cover_letter: string;
  resume_url: string;
  application_data: any;
  contract_position_templates: {
    position_title: string;
    category: string;
  };
}

interface ApplicationReviewManagerProps {
  projectId: string;
}

export const ApplicationReviewManager = ({ projectId }: ApplicationReviewManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  useEffect(() => {
    loadApplications();
  }, [projectId, statusFilter]);

  const loadApplications = async () => {
    try {
      let query = supabase
        .from('position_applications')
        .select(`
          *,
          contract_position_templates!inner(
            position_title,
            category,
            project_id
          )
        `)
        .eq('contract_position_templates.project_id', projectId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleAssign = (application: Application) => {
    setSelectedApplication(application);
    setAssignmentDialogOpen(true);
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('position_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application status updated"
      });

      loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      reviewed: "outline",
      accepted: "default",
      rejected: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Application Review Manager
          </CardTitle>
          <CardDescription>
            Review applicant submissions and assign positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6">
              {applications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No {statusFilter !== 'all' && statusFilter} applications found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.applicant_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {application.applicant_email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {application.contract_position_templates.position_title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {application.contract_position_templates.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(application.applied_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(application)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            {application.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleAssign(application)}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Assign
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedApplication && (
        <>
          <ApplicantDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            application={selectedApplication}
            onStatusUpdate={handleUpdateStatus}
          />
          <PositionAssignmentDialog
            open={assignmentDialogOpen}
            onOpenChange={setAssignmentDialogOpen}
            application={selectedApplication}
            projectId={projectId}
            onAssignmentComplete={loadApplications}
          />
        </>
      )}
    </div>
  );
};
