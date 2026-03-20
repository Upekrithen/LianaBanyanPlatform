/**
 * MY PLEDGES — User's pledge dashboard
 * =====================================
 * View all projects you've backed, manage active pledges,
 * cancel if needed ("I've Changed My Mind"), and track fulfillment.
 *
 * SEC-safe: All language uses "sponsorship", "backing", "service credits".
 * No investment, equity, ROI, or profit language.
 *
 * Innovation #1544 — My Pledges Dashboard (Session 8A)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, ArrowLeft, Clock, CheckCircle2, XCircle,
  Coins, CalendarDays, ExternalLink, Undo2, Loader2,
  ShieldCheck, Package, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserPledges,
  cancelPledge,
  type ProjectPledge,
} from "@/lib/pledgeService";
import { toast } from "sonner";
import { format } from "date-fns";
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface ProjectInfo {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: Heart,
    color: "text-green-600",
    bgColor: "bg-green-500/10 border-green-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50 border-muted",
  },
  fulfilled: {
    label: "Fulfilled",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  refunded: {
    label: "Refunded",
    icon: Undo2,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
};

export default function MyPledges() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pledges, setPledges] = useState<ProjectPledge[]>([]);
  const [projects, setProjects] = useState<Record<string, ProjectInfo>>({});
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<ProjectPledge | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) loadPledges();
  }, [user]);

  const loadPledges = async () => {
    setLoading(true);
    try {
      const userPledges = await getUserPledges();
      setPledges(userPledges);

      // Load project details
      const projectIds = [...new Set(userPledges.map((p) => p.project_id).filter(Boolean))];
      if (projectIds.length > 0) {
        const { data: projectData } = await supabase
          .from("projects")
          .select("id, name, description, status")
          .in("id", projectIds);

        if (projectData) {
          const projectMap: Record<string, ProjectInfo> = {};
          projectData.forEach((p) => { projectMap[p.id] = p; });
          setProjects(projectMap);
        }
      }
    } catch (err) {
      console.error("Failed to load pledges:", err);
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);

    const result = await cancelPledge(cancelTarget.id, "User requested cancellation");

    if (result.success) {
      toast.success("Pledge cancelled", {
        description: `${result.refunded_amount} Credits have been refunded to your balance.`,
      });
      loadPledges();
    } else {
      toast.error("Cancellation failed", {
        description: result.error || "Please try again.",
      });
    }

    setCancelling(false);
    setCancelTarget(null);
  };

  const activePledges = pledges.filter((p) => p.status === "active");
  const pastPledges = pledges.filter((p) => p.status !== "active");
  const totalActive = activePledges.reduce((sum, p) => sum + p.amount_credits, 0);

  const renderPledgeCard = (pledge: ProjectPledge) => {
    const project = projects[pledge.project_id];
    const config = STATUS_CONFIG[pledge.status] || STATUS_CONFIG.active;
    const StatusIcon = config.icon;

    return (
      <Card key={pledge.id} className={`border ${config.bgColor}`}>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-base">
                {project?.name || "Unknown Project"}
              </h3>
              {project?.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {project.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className={`gap-1 ${config.color}`}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="font-bold text-lg">
                {pledge.amount_credits.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">Credits</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="w-3 h-3" />
              {pledge.created_at
                ? format(new Date(pledge.created_at), "MMM d, yyyy")
                : "Unknown date"}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {project && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <ExternalLink className="w-3 h-3" />
                View Project
              </Button>
            )}
            {pledge.status === "active" && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={() => setCancelTarget(pledge)}
              >
                <Undo2 className="w-3 h-3" />
                Cancel Pledge
              </Button>
            )}
          </div>

          {pledge.cancelled_at && (
            <p className="text-[10px] text-muted-foreground">
              Cancelled {format(new Date(pledge.cancelled_at), "MMM d, yyyy")}
              {pledge.cancellation_reason && ` — ${pledge.cancellation_reason}`}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <PortalPageLayout maxWidth="md" xrayId="my-pledges">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            My Pledges
          </h1>
          <p className="text-sm text-muted-foreground">
            Projects you have sponsored
          </p>
        </div>
      </div>

      {/* Summary Card */}
      {activePledges.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{activePledges.length}</p>
                <p className="text-xs text-muted-foreground">Active Pledges</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalActive.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Credits Pledged</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(activePledges.map((p) => p.project_id)).size}
                </p>
                <p className="text-xs text-muted-foreground">Projects Backed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* No Pledges */}
      {!loading && pledges.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <h3 className="text-lg font-medium">No pledges yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Browse projects and back the ones you believe in. Your Credits
              directly support bringing these projects to life.
            </p>
            <Button onClick={() => navigate("/marketplace")} className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Browse Projects
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pledge List */}
      {!loading && pledges.length > 0 && (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="gap-1">
              Active ({activePledges.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1">
              Past ({pastPledges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {activePledges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active pledges
              </p>
            ) : (
              activePledges.map(renderPledgeCard)
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-3 mt-4">
            {pastPledges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No past pledges
              </p>
            ) : (
              pastPledges.map(renderPledgeCard)
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* SEC Compliance Footer */}
      <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
        <p className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 flex-shrink-0" />
          <span>
            Pledges are service sponsorships, not financial transactions.
            Credits are platform service tokens (1:1 USD), not securities.
            No expectation of profit. Full refund available for active pledges.
          </span>
        </p>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Pledge?</AlertDialogTitle>
            <AlertDialogDescription>
              Your {cancelTarget?.amount_credits.toLocaleString()} Credits will be
              refunded to your balance immediately. This project will lose your
              sponsorship support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Pledge</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel & Refund"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </PortalPageLayout>
  );
}
