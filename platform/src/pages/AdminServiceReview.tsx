import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  TrendingDown,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface FlaggedLink {
  id: string;
  user_id: string;
  service_platform: string;
  platform_profile_url: string;
  platform_username: string | null;
  advertised_rate_min: number | null;
  advertised_rate_max: number | null;
  lb_rate_category: string | null;
  verification_status: string;
  rate_differential_flagged: boolean;
  violations_count: number;
  user_email?: string | null;
  user_display_name?: string | null;
}

export default function AdminServiceReview() {
  const { t } = useTranslation();
  const { isAdmin } = useUserRole();
  const [flaggedLinks, setFlaggedLinks] = useState<FlaggedLink[]>([]);
  const [pendingLinks, setPendingLinks] = useState<FlaggedLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadLinks();
    }
  }, [isAdmin]);

  const loadLinks = async () => {
    try {
      // Load flagged links
      const { data: flagged, error: flaggedError } = await supabase
        .from("member_service_links")
        .select("*")
        .eq("rate_differential_flagged", true)
        .order("violations_count", { ascending: false });

      if (flaggedError) throw flaggedError;

      // Load pending verification
      const { data: pending, error: pendingError } = await supabase
        .from("member_service_links")
        .select("*")
        .eq("verification_status", "pending")
        .order("created_at", { ascending: false });

      if (pendingError) throw pendingError;

      setFlaggedLinks(flagged || []);
      setPendingLinks(pending || []);
    } catch (error: any) {
      toast.error("Failed to load service links", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("member_service_links")
        .update({ verification_status: "verified" })
        .eq("id", linkId);

      if (error) throw error;

      toast.success("Service link verified");
      loadLinks();
    } catch (error: any) {
      toast.error("Failed to verify link", {
        description: error.message,
      });
    }
  };

  const handleFlag = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("member_service_links")
        .update({
          verification_status: "flagged",
          rate_differential_flagged: true,
        })
        .eq("id", linkId);

      if (error) throw error;

      toast.success("Service link flagged for review");
      loadLinks();
    } catch (error: any) {
      toast.error("Failed to flag link", {
        description: error.message,
      });
    }
  };

  const handleUnflag = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("member_service_links")
        .update({
          rate_differential_flagged: false,
          verification_status: "verified",
        })
        .eq("id", linkId);

      if (error) throw error;

      toast.success("Flag removed");
      loadLinks();
    } catch (error: any) {
      toast.error("Failed to update link", {
        description: error.message,
      });
    }
  };

  if (!isAdmin) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="admin-service-review">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </PortalPageLayout>
    );
  }

  if (loading) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="admin-service-review">
        <p className="text-center">Loading...</p>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="xl" xrayId="admin-service-review">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">External Service Review</h1>
          <p className="text-muted-foreground">
            Review and moderate member service links for rate compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-3xl font-bold">{flaggedLinks.length}</p>
                <p className="text-sm text-muted-foreground">Flagged Links</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-warning" />
                <p className="text-3xl font-bold">{pendingLinks.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingDown className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-3xl font-bold">
                  {flaggedLinks.reduce((sum, l) => sum + l.violations_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Violations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="flagged">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="flagged">
              Flagged Links ({flaggedLinks.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Verification ({pendingLinks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flagged" className="space-y-4">
            {flaggedLinks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No flagged links
                  </p>
                </CardContent>
              </Card>
            ) : (
              flaggedLinks.map((link) => (
                <Card key={link.id} className="border-destructive">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold capitalize">
                              {link.service_platform}
                            </h3>
                            <Badge variant="destructive">Rate Flagged</Badge>
                            {link.violations_count > 0 && (
                              <Badge variant="outline">
                                {link.violations_count} violations
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Member ID: {link.user_id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Advertised Rate
                          </p>
                          <p className="font-medium">
                            ${link.advertised_rate_min || 0} - $
                            {link.advertised_rate_max || 0}/hr
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Category
                          </p>
                          <p className="font-medium">
                            {link.lb_rate_category || "Uncategorized"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4" />
                        <a
                          href={link.platform_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-primary"
                        >
                          View Profile
                        </a>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUnflag(link.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve & Unflag
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(link.id)}
                        >
                          Mark Verified
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingLinks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No pending links
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingLinks.map((link) => (
                <Card key={link.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold capitalize">
                              {link.service_platform}
                            </h3>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Member ID: {link.user_id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Advertised Rate
                          </p>
                          <p className="font-medium">
                            ${link.advertised_rate_min || 0} - $
                            {link.advertised_rate_max || 0}/hr
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Category
                          </p>
                          <p className="font-medium">
                            {link.lb_rate_category || "Uncategorized"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4" />
                        <a
                          href={link.platform_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-primary"
                        >
                          View Profile
                        </a>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleVerify(link.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify Link
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleFlag(link.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Flag for Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
  );
}
