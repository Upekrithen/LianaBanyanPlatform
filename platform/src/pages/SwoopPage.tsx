import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Search,
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { SwoopProjectCard } from "@/components/SwoopProjectCard";
import { SwoopNominationForm } from "@/components/SwoopNominationForm";
import { DonationCommitmentForm } from "@/components/DonationCommitmentForm";
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface SwoopProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  recipient_name: string;
  recipient_location: string;
  medical_situation: string;
  goal_amount: number;
  current_amount: number;
  vote_count: number;
  vote_threshold: number;
  status: "nomination" | "voting" | "pending_verification" | "active" | "funded" | "closed" | "cancelled";
  verification_status: "pending" | "in_review" | "verified" | "rejected";
  project_lead_name: string;
  category: string;
  created_at: string;
  supporter_count?: number;
  donation_count?: number;
  percent_funded?: number;
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "medical", label: "Medical Crisis" },
  { value: "housing", label: "Housing Emergency" },
  { value: "utilities", label: "Utility Shutoff" },
  { value: "food", label: "Food Insecurity" },
  { value: "transportation", label: "Transportation Need" },
  { value: "other", label: "Other Crisis" },
];

export default function SwoopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("voting");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["swoop-projects", activeTab, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("swoop_projects")
        .select("*");

      // Filter by status based on tab
      if (activeTab === "voting") {
        query = query.eq("status", "voting");
      } else if (activeTab === "active") {
        query = query.in("status", ["active", "funded"]);
      } else if (activeTab === "completed") {
        query = query.in("status", ["closed", "funded"]);
      }

      // Filter by category
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query.order("vote_count", { ascending: false });

      if (error) throw error;
      return data as SwoopProject[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["swoop-stats"],
    queryFn: async () => {
      const { data: votingCount } = await supabase
        .from("swoop_projects")
        .select("id", { count: "exact" })
        .eq("status", "voting");

      const { data: activeCount } = await supabase
        .from("swoop_projects")
        .select("id", { count: "exact" })
        .in("status", ["active", "funded"]);

      const { data: totalRaised } = await supabase
        .from("swoop_projects")
        .select("current_amount")
        .in("status", ["active", "funded", "closed"]);

      const raised = totalRaised?.reduce((sum, p) => sum + (p.current_amount || 0), 0) || 0;

      return {
        votingCount: votingCount?.length || 0,
        activeCount: activeCount?.length || 0,
        totalRaised: raised,
      };
    },
  });

  const filteredProjects = projects?.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.recipient_location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500" />
            Do The Swoop
          </h1>
          <p className="text-muted-foreground">
            Community crisis support — help neighbors in need
          </p>
        </div>
        <SwoopNominationForm />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.votingCount || 0}</p>
                <p className="text-sm text-muted-foreground">Projects Voting</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activeCount || 0}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-full">
                <DollarSign className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${(stats?.totalRaised || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Raised</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Legal Notice</p>
              <p>
                Liana Banyan Corporation acts solely as a payment processor for Do The Swoop projects. 
                All funds are held in project-specific accounts controlled by designated Project Leads. 
                LB does not own, manage, or make decisions about fund allocation. 
                Project Leads are responsible for fund disbursement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="voting">
            Voting ({stats?.votingCount || 0})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({stats?.activeCount || 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voting" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <SwoopProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Projects Voting</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to nominate someone in need of support.
                </p>
                <SwoopNominationForm />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <SwoopProjectCard key={project.id} project={project} showVoteButton={false} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Projects</h3>
                <p className="text-muted-foreground">
                  Projects become active after reaching 500 votes and being verified.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <SwoopProjectCard key={project.id} project={project} showVoteButton={false} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Completed Projects Yet</h3>
                <p className="text-muted-foreground">
                  Completed projects will appear here as a record of community support.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* How It Works */}
      {/* Donation Commitments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Your Giving
          </CardTitle>
          <CardDescription>
            Set up ongoing support with full control over your donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DonationCommitmentForm />
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Do The Swoop Works</CardTitle>
          <CardDescription>
            Community-powered crisis support with full transparency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-rose-600">1</span>
              </div>
              <h4 className="font-medium mb-1">Nominate</h4>
              <p className="text-sm text-muted-foreground">
                Know someone in crisis? Nominate them for community support.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-amber-600">2</span>
              </div>
              <h4 className="font-medium mb-1">Vote</h4>
              <p className="text-sm text-muted-foreground">
                500 votes activate a project. Your vote shows community support.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-medium mb-1">Verify</h4>
              <p className="text-sm text-muted-foreground">
                We contact family to verify the situation before funds flow.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-green-600">4</span>
              </div>
              <h4 className="font-medium mb-1">Support</h4>
              <p className="text-sm text-muted-foreground">
                Donate directly. Project Lead pays bills. Full transparency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
