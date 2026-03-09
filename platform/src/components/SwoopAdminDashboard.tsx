import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Eye,
  Phone,
  Mail,
  FileText,
  TrendingUp,
  Activity,
  RefreshCw,
} from "lucide-react";
import { SwoopVerificationWorkflow } from "./SwoopVerificationWorkflow";

interface SwoopProject {
  id: string;
  slug: string;
  title: string;
  recipient_name: string;
  recipient_location: string;
  medical_situation: string;
  category: string;
  goal_amount: number;
  current_amount: number;
  disbursed_amount: number;
  vote_count: number;
  vote_threshold: number;
  status: string;
  verification_status: string;
  verification_contact_name: string;
  verification_contact_relationship: string;
  project_lead_name: string;
  project_lead_email: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  nomination: "bg-gray-100 text-gray-800",
  voting: "bg-amber-100 text-amber-800",
  pending_verification: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  funded: "bg-emerald-100 text-emerald-800",
  closed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const VERIFICATION_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  in_review: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function SwoopAdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<SwoopProject | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [disbursementAmount, setDisbursementAmount] = useState("");
  const [disbursementNote, setDisbursementNote] = useState("");

  // Fetch all projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["swoop-admin-projects", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("swoop_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SwoopProject[];
    },
  });

  // Fetch master fund stats
  const { data: masterFund } = useQuery({
    queryKey: ["swoop-master-fund"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swoop_master_fund")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  // Update project status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ projectId, newStatus }: { projectId: string; newStatus: string }) => {
      const { error } = await supabase
        .from("swoop_projects")
        .update({ status: newStatus })
        .eq("id", projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project status updated");
      queryClient.invalidateQueries({ queryKey: ["swoop-admin-projects"] });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  // Process disbursement mutation
  const processDisbursement = useMutation({
    mutationFn: async ({ projectId, amount, note }: { projectId: string; amount: number; note: string }) => {
      if (!user) throw new Error("Must be logged in");

      // Record the disbursement transaction
      const { error: txError } = await supabase.from("swoop_transactions").insert({
        project_id: projectId,
        transaction_type: "disbursement",
        amount: amount,
        description: note,
        status: "completed",
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      });

      if (txError) throw txError;

      // Update project disbursed amount
      const project = projects?.find(p => p.id === projectId);
      if (project) {
        const { error: updateError } = await supabase
          .from("swoop_projects")
          .update({
            disbursed_amount: (project.disbursed_amount || 0) + amount,
            current_amount: project.current_amount - amount,
          })
          .eq("id", projectId);

        if (updateError) throw updateError;
      }

      // Log update
      await supabase.from("swoop_project_updates").insert({
        project_id: projectId,
        author_id: user.id,
        author_name: "Liana Banyan Admin",
        author_role: "lb_admin",
        update_type: "disbursement",
        title: `Disbursement: $${amount.toLocaleString()}`,
        content: note,
        is_public: true,
      });
    },
    onSuccess: () => {
      toast.success("Disbursement processed");
      setDisbursementAmount("");
      setDisbursementNote("");
      queryClient.invalidateQueries({ queryKey: ["swoop-admin-projects"] });
    },
    onError: (error) => {
      toast.error(`Disbursement failed: ${error.message}`);
    },
  });

  // Calculate stats
  const stats = {
    total: projects?.length || 0,
    voting: projects?.filter(p => p.status === "voting").length || 0,
    active: projects?.filter(p => p.status === "active").length || 0,
    pendingVerification: projects?.filter(p => p.verification_status === "pending" || p.verification_status === "in_review").length || 0,
    totalRaised: projects?.reduce((sum, p) => sum + (p.current_amount || 0), 0) || 0,
    totalDisbursed: projects?.reduce((sum, p) => sum + (p.disbursed_amount || 0), 0) || 0,
  };

  const isAdmin = user?.email?.includes("@lianabanyan.com");

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p>Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Swoop Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage crisis support projects</p>
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["swoop-admin-projects"] })}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs">Total Projects</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Voting</span>
            </div>
            <p className="text-2xl font-bold">{stats.voting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Active</span>
            </div>
            <p className="text-2xl font-bold">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Pending Verification</span>
            </div>
            <p className="text-2xl font-bold">{stats.pendingVerification}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Total Raised</span>
            </div>
            <p className="text-2xl font-bold">${stats.totalRaised.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Disbursed</span>
            </div>
            <p className="text-2xl font-bold">${stats.totalDisbursed.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Master Fund Card */}
      {masterFund && (
        <Card className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm">Master Fund Balance</p>
                <p className="text-3xl font-bold">${(masterFund.current_balance || 0).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-rose-100 text-sm">Total Received</p>
                <p className="text-xl font-semibold">${(masterFund.total_received || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="nomination">Nomination</SelectItem>
            <SelectItem value="voting">Voting</SelectItem>
            <SelectItem value="pending_verification">Pending Verification</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="funded">Funded</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : projects && projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-xs text-muted-foreground">{project.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{project.recipient_name}</p>
                        <p className="text-xs text-muted-foreground">{project.recipient_location}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[project.status]}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={VERIFICATION_COLORS[project.verification_status]}>
                        {project.verification_status === "verified" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {project.verification_status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                        {project.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {project.status === "voting" ? (
                        <div className="w-24">
                          <Progress value={(project.vote_count / project.vote_threshold) * 100} className="h-2" />
                          <p className="text-xs mt-1">{project.vote_count}/{project.vote_threshold} votes</p>
                        </div>
                      ) : (
                        <div className="w-24">
                          <Progress value={(project.current_amount / project.goal_amount) * 100} className="h-2" />
                          <p className="text-xs mt-1">${project.current_amount.toLocaleString()}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No projects found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                <DialogDescription>
                  Project ID: {selectedProject.id}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                  <TabsTrigger value="disbursement">Disbursement</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardContent className="pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Recipient</Label>
                        <p className="font-medium">{selectedProject.recipient_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Location</Label>
                        <p className="font-medium">{selectedProject.recipient_location}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Category</Label>
                        <p className="font-medium capitalize">{selectedProject.category}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Goal</Label>
                        <p className="font-medium">${selectedProject.goal_amount.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-muted-foreground">Situation</Label>
                        <p className="text-sm">{selectedProject.medical_situation}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Project Lead</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">{selectedProject.project_lead_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedProject.project_lead_email}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Verification Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">{selectedProject.verification_contact_name || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Relationship</Label>
                        <p className="font-medium capitalize">
                          {selectedProject.verification_contact_relationship?.replace("_", " ") || "Not provided"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="verification">
                  <SwoopVerificationWorkflow
                    project={selectedProject}
                    isAdmin={true}
                    onVerificationComplete={() => {
                      queryClient.invalidateQueries({ queryKey: ["swoop-admin-projects"] });
                    }}
                  />
                </TabsContent>

                <TabsContent value="disbursement" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Fund Status</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Available</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${selectedProject.current_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Disbursed</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${(selectedProject.disbursed_amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Goal</p>
                        <p className="text-2xl font-bold">
                          ${selectedProject.goal_amount.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedProject.verification_status === "verified" && selectedProject.current_amount > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Process Disbursement</CardTitle>
                        <CardDescription>
                          Send funds to the project lead for distribution
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={disbursementAmount}
                            onChange={(e) => setDisbursementAmount(e.target.value)}
                            max={selectedProject.current_amount}
                          />
                        </div>
                        <div>
                          <Label>Purpose/Note</Label>
                          <Textarea
                            placeholder="What is this disbursement for?"
                            value={disbursementNote}
                            onChange={(e) => setDisbursementNote(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            const amount = parseFloat(disbursementAmount);
                            if (isNaN(amount) || amount <= 0) {
                              toast.error("Enter a valid amount");
                              return;
                            }
                            if (amount > selectedProject.current_amount) {
                              toast.error("Amount exceeds available funds");
                              return;
                            }
                            processDisbursement.mutate({
                              projectId: selectedProject.id,
                              amount,
                              note: disbursementNote,
                            });
                          }}
                          disabled={processDisbursement.isPending}
                        >
                          {processDisbursement.isPending ? "Processing..." : "Process Disbursement"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {selectedProject.verification_status !== "verified" && (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-amber-800">
                          <AlertTriangle className="w-5 h-5" />
                          <p>Project must be verified before disbursements can be processed</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="status" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Update Project Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Current Status</Label>
                        <Badge className={`${STATUS_COLORS[selectedProject.status]} ml-2`}>
                          {selectedProject.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div>
                        <Label>Change Status To</Label>
                        <Select
                          onValueChange={(value) => {
                            updateStatus.mutate({
                              projectId: selectedProject.id,
                              newStatus: value,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nomination">Nomination</SelectItem>
                            <SelectItem value="voting">Voting</SelectItem>
                            <SelectItem value="pending_verification">Pending Verification</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="funded">Funded</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SwoopAdminDashboard;
