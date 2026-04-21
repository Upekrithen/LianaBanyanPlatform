import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  Users,
  DollarSign,
  MapPin,
  CheckCircle,
  Clock,
  Share2,
  ExternalLink,
  Vote,
} from "lucide-react";
import { Link } from "react-router-dom";

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

interface SwoopProjectCardProps {
  project: SwoopProject;
  variant?: "compact" | "full";
  showVoteButton?: boolean;
}

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  nomination: { label: "Nomination", variant: "outline" },
  voting: { label: "Voting", variant: "secondary" },
  pending_verification: { label: "Verifying", variant: "outline" },
  active: { label: "Active", variant: "default" },
  funded: { label: "Funded!", variant: "default" },
  closed: { label: "Closed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const CATEGORY_ICONS: Record<string, string> = {
  medical: "🏥",
  housing: "🏠",
  utilities: "💡",
  food: "🍽️",
  transportation: "🚗",
  other: "💝",
};

export function SwoopProjectCard({ project, variant = "full", showVoteButton = true }: SwoopProjectCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);

  const percentFunded = project.percent_funded ||
    (project.goal_amount > 0 ? (project.current_amount / project.goal_amount) * 100 : 0);

  const voteProgress = (project.vote_count / project.vote_threshold) * 100;

  const castVote = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in to vote");

      const { error } = await supabase
        .from("swoop_project_votes")
        .insert({
          project_id: project.id,
          voter_id: user.id,
          credit_weight: 1,
          show_support: true,
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error("You've already voted for this project");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Vote cast! Thank you for your support.");
      queryClient.invalidateQueries({ queryKey: ["swoop-projects"] });
      setVoteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/swoop/${project.slug}`;
    const text = `Help support ${project.recipient_name}: ${project.title}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: project.title, text, url });
      } catch (e) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{CATEGORY_ICONS[project.category] || "💝"}</span>
              <div>
                <CardTitle className="text-base line-clamp-1">{project.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <MapPin className="w-3 h-3" />
                  {project.recipient_location}
                </CardDescription>
              </div>
            </div>
            <Badge variant={STATUS_BADGES[project.status]?.variant || "outline"}>
              {STATUS_BADGES[project.status]?.label || project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          {project.status === "voting" ? (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{project.vote_count} votes</span>
                <span>{project.vote_threshold} needed</span>
              </div>
              <Progress value={voteProgress} className="h-2" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>${project.current_amount.toLocaleString()}</span>
                <span>${project.goal_amount.toLocaleString()} goal</span>
              </div>
              <Progress value={percentFunded} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          <Link to={`/swoop/${project.slug}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-2xl">
              {CATEGORY_ICONS[project.category] || "💝"}
            </div>
            <div>
              <CardTitle className="text-lg">{project.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                {project.recipient_location}
                {project.verification_status === "verified" && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Badge variant={STATUS_BADGES[project.status]?.variant || "outline"}>
            {STATUS_BADGES[project.status]?.label || project.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.short_description || project.description}
        </p>

        {/* Voting Progress (for voting status) */}
        {project.status === "voting" && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                <Vote className="w-4 h-4" />
                Votes to Activate
              </span>
              <span className="text-sm font-bold">
                {project.vote_count} / {project.vote_threshold}
              </span>
            </div>
            <Progress value={voteProgress} className="h-3 bg-amber-100" />
            <p className="text-xs text-amber-700 mt-2">
              {project.vote_threshold - project.vote_count} more votes needed to activate this project
            </p>
          </div>
        )}

        {/* Funding Progress (for active/funded status) */}
        {(project.status === "active" || project.status === "funded") && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Funds Raised
              </span>
              <span className="text-sm font-bold">
                ${project.current_amount.toLocaleString()} / ${project.goal_amount.toLocaleString()}
              </span>
            </div>
            <Progress value={Math.min(percentFunded, 100)} className="h-3 bg-green-100" />
            <p className="text-xs text-green-700 mt-2">
              {percentFunded >= 100
                ? "Goal reached! Additional donations still welcome."
                : `${Math.round(percentFunded)}% of goal reached`}
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {project.supporter_count || project.vote_count} supporters
            </span>
            {project.donation_count && (
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {project.donation_count} donations
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Project Lead */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">
              {project.project_lead_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            Project Lead: <span className="font-medium">{project.project_lead_name}</span>
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t bg-muted/30">
        {project.status === "voting" && showVoteButton && (
          <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700">
                <Vote className="w-4 h-4 mr-2" />
                Vote to Activate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vote for {project.title}</DialogTitle>
                <DialogDescription>
                  Your vote helps activate this project. Once {project.vote_threshold} votes are reached,
                  the project will be verified and can begin receiving donations.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm mb-4">
                  <strong>Recipient:</strong> {project.recipient_name}<br />
                  <strong>Situation:</strong> {project.medical_situation}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your vote is public and shows your support for this cause.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setVoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => castVote.mutate()}
                  disabled={castVote.isPending || !user}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {castVote.isPending ? "Voting..." : "Cast Vote"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {(project.status === "active" || project.status === "funded") && (
          <Link to={`/swoop/${project.slug}/donate`} className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Heart className="w-4 h-4 mr-2" />
              Donate
            </Button>
          </Link>
        )}

        <Link to={`/swoop/${project.slug}`}>
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Details
          </Button>
        </Link>

        <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share project">
          <Share2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default SwoopProjectCard;
