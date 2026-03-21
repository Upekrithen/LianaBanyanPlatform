import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Users,
  DollarSign,
  MapPin,
  CheckCircle,
  Clock,
  Share2,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Vote,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { SwoopNominationForm } from "@/components/SwoopNominationForm";
import { SwoopVerificationWorkflow } from "@/components/SwoopVerificationWorkflow";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface Transaction {
  id: string;
  type: "donation" | "disbursement" | "refund" | "transfer_in" | "transfer_out";
  from_name: string;
  from_anonymous: boolean;
  to_name: string;
  to_type: string;
  amount: number;
  purpose: string;
  status: string;
  created_at: string;
  processed_at: string;
}

interface ProjectUpdate {
  id: string;
  author_name: string;
  author_role: string;
  update_type: string;
  title: string;
  content: string;
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

export default function SwoopProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["swoop-project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swoop_projects")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["swoop-transactions", project?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swoop_transactions")
        .select("*")
        .eq("project_id", project?.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!project?.id,
  });

  const { data: updates } = useQuery({
    queryKey: ["swoop-updates", project?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swoop_project_updates")
        .select("*")
        .eq("project_id", project?.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjectUpdate[];
    },
    enabled: !!project?.id,
  });

  const { data: supporters } = useQuery({
    queryKey: ["swoop-supporters", project?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swoop_project_votes")
        .select("display_name, created_at")
        .eq("project_id", project?.id)
        .eq("show_support", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!project?.id,
  });

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Help support ${project?.recipient_name}: ${project?.title}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: project?.title, text, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (projectLoading) {
    return (
      <PortalPageLayout>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </PortalPageLayout>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <p className="text-muted-foreground mb-4">
          This project may have been removed or doesn't exist.
        </p>
        <Link to="/swoop">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Swoop
          </Button>
        </Link>
      </div>
    );
  }

  const percentFunded = project.goal_amount > 0 
    ? (project.current_amount / project.goal_amount) * 100 
    : 0;
  const voteProgress = (project.vote_count / project.vote_threshold) * 100;

  return (
    <PortalPageLayout>
      {/* Back Button */}
      <Link to="/swoop" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to All Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge className={STATUS_COLORS[project.status]}>
              {project.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {project.recipient_location}
            </span>
            {project.verification_status === "verified" && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Verified
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Created {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          {project.status === "voting" && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Vote className="w-5 h-5" />
                  Voting in Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span>{project.vote_count} votes</span>
                  <span>{project.vote_threshold} needed</span>
                </div>
                <Progress value={voteProgress} className="h-4 mb-2" />
                <p className="text-sm text-amber-700">
                  {project.vote_threshold - project.vote_count} more votes needed to activate this project
                </p>
              </CardContent>
            </Card>
          )}

          {(project.status === "active" || project.status === "funded") && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Fundraising Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold">${project.current_amount.toLocaleString()}</span>
                  <span className="text-muted-foreground">${project.goal_amount.toLocaleString()} goal</span>
                </div>
                <Progress value={Math.min(percentFunded, 100)} className="h-4 mb-2" />
                <p className="text-sm text-green-700">
                  {Math.round(percentFunded)}% funded
                  {project.disbursed_amount > 0 && ` • $${project.disbursed_amount.toLocaleString()} disbursed`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Recipient</h4>
                <p>{project.recipient_name}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Situation</h4>
                <p className="text-muted-foreground">{project.medical_situation}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
              </div>
              {project.monthly_needs && Object.keys(project.monthly_needs).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Monthly Needs</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(project.monthly_needs).map(([key, value]) => (
                      value > 0 && (
                        <div key={key} className="flex justify-between p-2 bg-muted rounded">
                          <span className="capitalize">{key}</span>
                          <span className="font-medium">${(value as number).toLocaleString()}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Transparency, Updates, Supporters */}
          <Tabs defaultValue="transparency">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transparency">Transparency</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="supporters">Supporters</TabsTrigger>
            </TabsList>

            <TabsContent value="transparency" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Transaction History
                  </CardTitle>
                  <CardDescription>
                    Full transparency: FROM, TO, WHEN, HOW MUCH, WHAT FOR
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            tx.type === "donation" ? "bg-green-50" : "bg-amber-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {tx.type === "donation" ? (
                              <ArrowDownLeft className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-amber-600" />
                            )}
                            <div>
                              <p className="font-medium">
                                {tx.type === "donation" ? "IN" : "OUT"}: ${tx.amount.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {tx.type === "donation" 
                                  ? `From: ${tx.from_anonymous ? "Anonymous" : tx.from_name}`
                                  : `To: ${tx.to_name}`}
                              </p>
                              <p className="text-xs text-muted-foreground">{tx.purpose}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {new Date(tx.processed_at || tx.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No transactions yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="updates" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  {updates && updates.length > 0 ? (
                    <div className="space-y-4">
                      {updates.map((update) => (
                        <div key={update.id} className="border-l-4 border-rose-300 pl-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{update.author_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {update.author_role.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(update.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {update.title && <h4 className="font-medium">{update.title}</h4>}
                          <p className="text-sm text-muted-foreground">{update.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No updates yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supporters" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {project.vote_count} Supporters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {supporters && supporters.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {supporters.map((supporter, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full"
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {(supporter.display_name || "A").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{supporter.display_name || "Anonymous"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Be the first to support this project!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-4">
          {/* Action Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {project.status === "voting" && (
                <Button className="w-full bg-rose-600 hover:bg-rose-700" size="lg">
                  <Vote className="w-5 h-5 mr-2" />
                  Vote to Activate
                </Button>
              )}
              
              {(project.status === "active" || project.status === "funded") && (
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  <Heart className="w-5 h-5 mr-2" />
                  Donate Now
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share This Project
              </Button>
            </CardContent>
          </Card>

          {/* Project Lead Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Project Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{project.project_lead_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.project_lead_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Manages fund disbursement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <SwoopVerificationWorkflow
            project={project}
            isAdmin={user?.email?.includes("@lianabanyan.com") || false}
          />

          {/* Legal Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Legal Notice</p>
                  <p>
                    Liana Banyan Corporation acts solely as a payment processor. 
                    All funds are held in project-specific accounts controlled by {project.project_lead_name} (Project Lead). 
                    LB does not own, manage, or make decisions about fund allocation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Status */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3" />
            Last synced: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </PortalPageLayout>
  );
}
