import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectTaskList } from "@/components/ProjectTaskList";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ThemeCarousel } from "@/components/ThemeCarousel";
import { ThemeUploader } from "@/components/ThemeUploader";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { BlockchainGasDashboard } from "@/components/BlockchainGasDashboard";
import { MedallionMintingManager } from "@/components/MedallionMintingManager";
import { ResourceAllocation } from "@/components/ResourceAllocation";
import { VotingConfigManager } from "@/components/VotingConfigManager";
import { ContractCompensationConfigManager } from "@/components/ContractCompensationConfigManager";
import { ApplicationReviewManager } from "@/components/ApplicationReviewManager";
import { ProjectVisualThemeManager } from "@/components/ProjectVisualThemeManager";
import { ProjectServiceSelector } from "@/components/ProjectServiceSelector";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import LBInternalPositions from "./LBInternalPositions";
import { EditModeProvider, useEditMode } from "@/contexts/EditModeContext";
import { QRLandingPage } from "@/components/QRLandingPage";
import { BusinessPlanTreeChart } from "@/components/BusinessPlanTreeChart";
import { InfluencerChallengeManager } from "@/components/InfluencerChallengeManager";
import { ProjectIslandMapper } from "@/components/ProjectIslandMapper";
import { IslandChallengeBoard } from "@/components/IslandChallengeBoard";
import { Switch } from "@/components/ui/switch";
import { Edit3 } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

function AdminProjectContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isEditMode, toggleEditMode } = useEditMode();
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [funding, setFunding] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);

  // Form states
  const [potAmount, setPotAmount] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCredits, setInviteCredits] = useState("100");

  useEffect(() => {
    checkOwnerStatus();
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData();
    }
  }, [selectedProject]);

  const checkOwnerStatus = async () => {
    if (!user) return;

    const { data: roles } = await supabase
      .from("projects")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "project_owner"]);

    if (!roles || roles.length === 0) {
      toast.error("Access denied. Project owner privileges required.");
      navigate("/dashboard");
      return;
    }

    setIsOwner(true);
    loadProjects();
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", user?.id);

    if (error) {
      toast.error("Failed to load projects");
      console.error(error);
    } else {
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    }
    setLoading(false);
  };

  const loadProjectData = async () => {
    if (!selectedProject) return;

    // Load funding
    const { data: fundingData, error: fundingError } = await supabase
      .from("project_funding")
      .select("*")
      .eq("project_id", selectedProject)
      .maybeSingle();

    if (fundingError) {
      console.error("Error loading funding:", fundingError);
    } else {
      setFunding(fundingData);
    }

    // Load invitations
    const { data: invitationsData, error: invitationsError } = await supabase
      .from("project_invitations")
      .select("*")
      .eq("project_id", selectedProject)
      .order("created_at", { ascending: false });

    if (invitationsError) {
      console.error("Error loading invitations:", invitationsError);
    } else {
      setInvitations(invitationsData || []);
    }
  };

  const handleAllocateFunds = async () => {
    if (!selectedProject || !potAmount) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amount = parseFloat(potAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    if (funding) {
      // Update existing funding
      const { error } = await supabase
        .from("project_funding")
        .update({ total_pot: amount })
        .eq("project_id", selectedProject);

      if (error) {
        toast.error("Failed to update funding");
        console.error(error);
      } else {
        toast.success("Funding pot updated successfully");
        loadProjectData();
        setPotAmount("");
      }
    } else {
      // Create new funding
      const { error } = await supabase
        .from("project_funding")
        .insert({ project_id: selectedProject, total_pot: amount });

      if (error) {
        toast.error("Failed to create funding");
        console.error(error);
      } else {
        toast.success("Funding pot created successfully");
        loadProjectData();
        setPotAmount("");
      }
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedProject || !inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    const credits = parseFloat(inviteCredits);
    if (isNaN(credits) || credits <= 0) {
      toast.error("Please enter a valid credit amount");
      return;
    }

    if (funding && funding.available_pot < credits) {
      toast.error("Insufficient funds in pot");
      return;
    }

    const { error } = await supabase.from("project_invitations").insert({
      project_id: selectedProject,
      email: inviteEmail,
      invited_by: user?.id,
      credits_allocated: credits,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("This email has already been invited");
      } else {
        toast.error("Failed to send invitation");
        console.error(error);
      }
    } else {
      toast.success("Invitation sent successfully");
      loadProjectData();
      setInviteEmail("");
    }
  };

  if (loading) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="admin-project">
        <div className="flex items-center justify-center py-20">Loading...</div>
      </PortalPageLayout>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <PortalPageLayout maxWidth="xl" xrayId="admin-project">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Project Development</h1>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-background">
              <Edit3 className="h-4 w-4" />
              <span className="text-sm font-medium">Edit Mode</span>
              <Switch checked={isEditMode} onCheckedChange={toggleEditMode} />
            </div>
            <Button onClick={() => navigate("/create-project")}>
              Create New Project
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <Label>Select Project</Label>
          <select
            className="w-full mt-2 p-2 border rounded-md bg-background"
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <Tabs defaultValue="funding">
          <div className="space-y-2">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 w-full gap-1">
              <TabsTrigger value="plan-tree" className="text-xs sm:text-sm">
                Plan Tree
              </TabsTrigger>
              <TabsTrigger value="islands" className="text-xs sm:text-sm">
                Islands
              </TabsTrigger>
              <TabsTrigger value="challenge" className="text-xs sm:text-sm">
                Challenges
              </TabsTrigger>
              <TabsTrigger value="qr-landing" className="text-xs sm:text-sm">
                QR Landing
              </TabsTrigger>
              <TabsTrigger value="funding" className="text-xs sm:text-sm">
                Funding
              </TabsTrigger>
              <TabsTrigger value="invitations" className="text-xs sm:text-sm">
                Invitations
              </TabsTrigger>
              <TabsTrigger value="positions" className="text-xs sm:text-sm">
                Positions
              </TabsTrigger>
              <TabsTrigger value="lb-positions" className="text-xs sm:text-sm">
                LB Positions
              </TabsTrigger>
              <TabsTrigger value="applications" className="text-xs sm:text-sm">
                Applications
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs sm:text-sm">
                Resources
              </TabsTrigger>
              <TabsTrigger value="voting" className="text-xs sm:text-sm">
                Voting
              </TabsTrigger>
              <TabsTrigger value="compensation" className="text-xs sm:text-sm">
                Compensation
              </TabsTrigger>
              <TabsTrigger value="themes" className="text-xs sm:text-sm">
                Themes
              </TabsTrigger>
              <TabsTrigger value="visual" className="text-xs sm:text-sm">
                Visual
              </TabsTrigger>
              <TabsTrigger value="services" className="text-xs sm:text-sm">
                Services
              </TabsTrigger>
              <TabsTrigger value="blockchain" className="text-xs sm:text-sm">
                Blockchain
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="plan-tree">
            {selectedProject && (
              <BusinessPlanTreeChart projectId={selectedProject} />
            )}
          </TabsContent>

          <TabsContent value="islands">
            {selectedProject && (
              <div className="space-y-6">
                <ProjectIslandMapper projectId={selectedProject} />
                <Card>
                  <CardHeader>
                    <CardTitle>Island Challenge Board</CardTitle>
                    <CardDescription>
                      View all challenges organized by island
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IslandChallengeBoard projectId={selectedProject} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenge">
            {selectedProject && (
              <InfluencerChallengeManager projectId={selectedProject} />
            )}
          </TabsContent>

          <TabsContent value="qr-landing">
            <Card>
              <CardHeader>
                <CardTitle>QR Landing Pages</CardTitle>
                <CardDescription>
                  Create and manage QR code landing pages for market
                  segmentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProject && (
                  <QRLandingPage projectId={selectedProject} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funding">
            <Card>
              <CardHeader>
                <CardTitle>Manage Funding Pot</CardTitle>
                <CardDescription>
                  Allocate funds for the $100 credit giveaway
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {funding && (
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Pot</p>
                      <p className="text-2xl font-bold">
                        ${Number(funding.total_pot).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Allocated</p>
                      <p className="text-2xl font-bold">
                        ${Number(funding.allocated_credits).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="text-2xl font-bold text-primary">
                        ${Number(funding.available_pot).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="pot-amount">Fund Amount ($)</Label>
                  <Input
                    id="pot-amount"
                    type="number"
                    step="0.01"
                    placeholder="5000.00"
                    value={potAmount}
                    onChange={(e) => setPotAmount(e.target.value)}
                  />
                </div>

                <Button onClick={handleAllocateFunds} className="w-full">
                  {funding ? "Update Funding Pot" : "Create Funding Pot"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Send Invitation</CardTitle>
                  <CardDescription>
                    Invite users and allocate credits from the pot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-credits">
                      Credits to Allocate ($)
                    </Label>
                    <Input
                      id="invite-credits"
                      type="number"
                      step="0.01"
                      value={inviteCredits}
                      onChange={(e) => setInviteCredits(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSendInvitation} className="w-full">
                    Send Invitation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invitation List</CardTitle>
                  <CardDescription>
                    Track all invitations and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell>{invitation.email}</TableCell>
                          <TableCell>
                            ${Number(invitation.credits_allocated).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invitation.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : invitation.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {invitation.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              invitation.created_at,
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {invitations.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground"
                          >
                            No invitations sent yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Contract Positions</CardTitle>
                <CardDescription>
                  Manage position openings and applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() =>
                    selectedProject &&
                    navigate(`/manage-positions?project=${selectedProject}`)
                  }
                  className="w-full"
                >
                  Manage Contract Positions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lb-positions">
            <LBInternalPositions />
          </TabsContent>

          <TabsContent value="tasks">
            {selectedProject && <ProjectTaskList projectId={selectedProject} />}
          </TabsContent>

          <TabsContent value="resources">
            {selectedProject && (
              <ResourceAllocation projectId={selectedProject} />
            )}
          </TabsContent>

          <TabsContent value="voting">
            {selectedProject && (
              <VotingConfigManager projectId={selectedProject} />
            )}
          </TabsContent>

          <TabsContent value="applications">
            {selectedProject && (
              <ApplicationReviewManager projectId={selectedProject} />
            )}
          </TabsContent>

          <TabsContent value="compensation">
            {selectedProject && (
              <ContractCompensationConfigManager projectId={selectedProject} />
            )}
          </TabsContent>

          <TabsContent value="themes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Theme Styles</CardTitle>
                    <CardDescription>
                      Upload and manage CSS stylesheets for your project pages
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedProject && (
                      <>
                        <ThemeSwitcher projectId={selectedProject} />
                        <ThemeUploader
                          projectId={selectedProject}
                          onThemeUploaded={() => window.location.reload()}
                        />
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedProject && (
                  <ThemeCarousel projectId={selectedProject} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual">
            {selectedProject && (
              <ProjectVisualThemeManager projectId={selectedProject} />
            )}
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Service Providers</CardTitle>
                <CardDescription>
                  Select the service providers your project will use across all
                  business categories. Assign Stewards to manage each service
                  through contract positions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProject && (
                  <ProjectServiceSelector projectId={selectedProject} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-6">
            {selectedProject && (
              <>
                <MedallionMintingManager projectId={selectedProject} />
                <BlockchainGasDashboard projectId={selectedProject} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
  );
}

export default function AdminProject() {
  return (
    <EditModeProvider>
      <AdminProjectContent />
    </EditModeProvider>
  );
}
