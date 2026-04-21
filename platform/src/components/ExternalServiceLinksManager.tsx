import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, AlertTriangle, Shield, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ServiceLinkCard } from "@/components/ServiceLinkCard";
import { ServiceViolationDashboard } from "@/components/ServiceViolationDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceLink {
  id: string;
  service_platform: string;
  platform_profile_url: string;
  platform_username: string | null;
  verification_status: string;
  advertised_rate_min: number | null;
  advertised_rate_max: number | null;
  lb_rate_category: string | null;
  rate_differential_flagged: boolean;
  lb_contracts_completed: number;
  external_contracts_completed: number;
  violations_count: number;
  is_active: boolean;
}

const PLATFORMS = [
  { value: "fiverr", label: "Fiverr" },
  { value: "etsy", label: "Etsy" },
  { value: "guru", label: "Guru" },
  { value: "upwork", label: "Upwork" },
  { value: "freelancer", label: "Freelancer" },
  { value: "toptal", label: "Toptal" },
  { value: "other", label: "Other" },
];

export function ExternalServiceLinksManager() {
  const { t } = useTranslation();
  const [links, setLinks] = useState<ServiceLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    service_platform: "",
    platform_profile_url: "",
    platform_username: "",
    advertised_rate_min: "",
    advertised_rate_max: "",
    lb_rate_category: "",
  });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("member_service_links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error: any) {
      toast.error(t('messages.error'), {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("member_service_links").insert({
        user_id: user.id,
        service_platform: formData.service_platform,
        platform_profile_url: formData.platform_profile_url,
        platform_username: formData.platform_username || null,
        advertised_rate_min: formData.advertised_rate_min ? parseFloat(formData.advertised_rate_min) : null,
        advertised_rate_max: formData.advertised_rate_max ? parseFloat(formData.advertised_rate_max) : null,
        lb_rate_category: formData.lb_rate_category || null,
      });

      if (error) throw error;

      toast.success(t('messages.success'));
      setShowAddForm(false);
      setFormData({
        service_platform: "",
        platform_profile_url: "",
        platform_username: "",
        advertised_rate_min: "",
        advertised_rate_max: "",
        lb_rate_category: "",
      });
      loadLinks();
    } catch (error: any) {
      toast.error(t('messages.error'), {
        description: error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('messages.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from("member_service_links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(t('messages.success'));
      loadLinks();
    } catch (error: any) {
      toast.error(t('messages.error'), {
        description: error.message,
      });
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t('messages.loadingData')}</div>;
  }

  return (
    <div className="space-y-6">
      <Alert className="border-primary">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Rate Compliance Notice:</strong> When working with other LB members through external
          platforms, you must honor LB scale rates. Violations may result in reputation penalties.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">My Service Links</TabsTrigger>
          <TabsTrigger value="compliance">Compliance History</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('externalServices.title')}</CardTitle>
              <CardDescription>
                Link your freelance platform profiles to track compliance and build reputation
              </CardDescription>
            </CardHeader>
            <CardContent>

          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('externalServices.addService')}
          </Button>

          {showAddForm && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="platform">{t('externalServices.platform')} *</Label>
                    <Select
                      value={formData.service_platform}
                      onValueChange={(value) => setFormData({ ...formData, service_platform: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="profile_url">{t('externalServices.profileUrl')} *</Label>
                    <Input
                      id="profile_url"
                      type="url"
                      value={formData.platform_profile_url}
                      onChange={(e) => setFormData({ ...formData, platform_profile_url: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="username">{t('externalServices.username')}</Label>
                    <Input
                      id="username"
                      value={formData.platform_username}
                      onChange={(e) => setFormData({ ...formData, platform_username: e.target.value })}
                      placeholder="Your username on the platform"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rate_min">Advertised Rate Min ($)</Label>
                      <Input
                        id="rate_min"
                        type="number"
                        step="0.01"
                        value={formData.advertised_rate_min}
                        onChange={(e) => setFormData({ ...formData, advertised_rate_min: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate_max">Advertised Rate Max ($)</Label>
                      <Input
                        id="rate_max"
                        type="number"
                        step="0.01"
                        value={formData.advertised_rate_max}
                        onChange={(e) => setFormData({ ...formData, advertised_rate_max: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">LB {t('externalServices.rateRange')}</Label>
                    <Input
                      id="category"
                      value={formData.lb_rate_category}
                      onChange={(e) => setFormData({ ...formData, lb_rate_category: e.target.value })}
                      placeholder="e.g., Design, Development, Marketing"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">{t('common.create')}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {links.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No service links added yet. Add your first freelance platform profile above.
            </p>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <ServiceLinkCard
                  key={link.id}
                  link={link}
                  onDelete={handleDelete}
                  lbScaleRate={link.advertised_rate_min ? link.advertised_rate_min * 1.2 : null}
                />
              ))}
            </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <ServiceViolationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
