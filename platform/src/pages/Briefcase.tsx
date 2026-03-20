import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, XCircle, Clock, Award, Upload } from "lucide-react";
import { format } from "date-fns";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function Briefcase() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Fetch user's asset submissions
  const { data: assets, isLoading } = useQuery({
    queryKey: ['briefcase-assets', user?.id, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('asset_submissions')
        .select(`
          *,
          projects(name),
          workstations(workstation_name)
        `)
        .eq('member_id', user?.id)
        .order('created_at', { ascending: false });

      if (selectedStatus !== "all") {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch IP contributions
  const { data: contributions } = useQuery({
    queryKey: ['ip-contributions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ip_contributions')
        .select(`
          *,
          projects(name),
          asset_submissions(asset_title, asset_type)
        `)
        .eq('member_id', user?.id)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'adopted':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'under_review':
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'adopted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'under_review':
      case 'submitted':
        return 'bg-yellow-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="briefcase">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Briefcase</h1>
          <p className="text-muted-foreground">Your submitted work, IP contributions, and tracked assets</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Submit New Asset
        </Button>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList>
          <TabsTrigger value="assets">My Assets</TabsTrigger>
          <TabsTrigger value="contributions">IP Contributions</TabsTrigger>
          <TabsTrigger value="royalties">Royalty Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("all")}
            >
              All
            </Button>
            <Button
              variant={selectedStatus === "draft" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("draft")}
            >
              Drafts
            </Button>
            <Button
              variant={selectedStatus === "submitted" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("submitted")}
            >
              Submitted
            </Button>
            <Button
              variant={selectedStatus === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("approved")}
            >
              Approved
            </Button>
            <Button
              variant={selectedStatus === "adopted" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("adopted")}
            >
              Adopted
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading your assets...</div>
          ) : assets && assets.length > 0 ? (
            <div className="space-y-4">
              {assets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(asset.status)}
                        <div>
                          <CardTitle className="text-lg">{asset.asset_title}</CardTitle>
                          <CardDescription>
                            {asset.projects?.name}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium">{asset.asset_type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">{format(new Date(asset.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contribution:</span>
                        <p className="font-medium">{asset.contribution_percentage}%</p>
                      </div>
                      {asset.reviewed_at && (
                        <div>
                          <span className="text-muted-foreground">Reviewed:</span>
                          <p className="font-medium">{format(new Date(asset.reviewed_at), 'MMM d, yyyy')}</p>
                        </div>
                      )}
                    </div>
                    {asset.review_notes && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Review Notes:</p>
                        <p className="text-sm">{asset.review_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No assets found. Start by submitting your work!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contributions" className="space-y-4">
          {contributions && contributions.length > 0 ? (
            <div className="space-y-4">
              {contributions.map((contribution) => (
                <Card key={contribution.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">
                          {contribution.asset_submissions?.asset_title}
                        </CardTitle>
                        <CardDescription>{contribution.projects?.name}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium">{contribution.contribution_type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contribution:</span>
                        <p className="font-medium">{contribution.contribution_percentage}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Royalty Eligible:</span>
                        <p className="font-medium">{contribution.royalty_eligible ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    {contribution.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm">{contribution.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No IP contributions tracked yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="royalties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Royalty Summary</CardTitle>
              <CardDescription>Your accumulated royalty-eligible contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-3xl font-bold text-primary">
                  {contributions?.reduce((sum, c) => sum + (c.royalty_eligible ? c.contribution_percentage : 0), 0).toFixed(2)}%
                </p>
                <p className="text-muted-foreground mt-2">Total Royalty Share Across All Projects</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PortalPageLayout>
  );
}
