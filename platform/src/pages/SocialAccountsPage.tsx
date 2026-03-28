import { useState } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link2, Unlink, TestTube, Loader2, Shield, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SocialAccount {
  id: string;
  user_id: string;
  platform: string;
  account_name: string | null;
  account_handle: string | null;
  access_token: string | null;
  refresh_token: string | null;
  app_password: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_used_at: string | null;
  created_at: string;
}

const SOCIAL_PLATFORMS = [
  {
    id: "twitter",
    label: "Twitter / X",
    icon: "🐦",
    color: "border-sky-400",
    devUrl: "https://developer.twitter.com/en/portal/dashboard",
    fields: ["account_handle", "access_token", "refresh_token"],
    instructions: "Create an app at the Twitter Developer Portal. Generate an OAuth 2.0 access token with tweet.write scope.",
  },
  {
    id: "bluesky",
    label: "Bluesky",
    icon: "🦋",
    color: "border-blue-500",
    devUrl: "https://bsky.app/settings/app-passwords",
    fields: ["account_handle", "app_password"],
    instructions: "Go to Bluesky Settings → App Passwords → Create. Enter your handle (e.g. user.bsky.social) and the generated app password.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "💼",
    color: "border-blue-700",
    devUrl: "https://www.linkedin.com/developers/apps",
    fields: ["account_handle", "access_token"],
    instructions: "Create a LinkedIn app and request the w_member_social scope. Copy the OAuth 2.0 access token.",
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: "🔴",
    color: "border-orange-500",
    devUrl: "https://www.reddit.com/prefs/apps",
    fields: ["account_handle", "access_token"],
    instructions: "Go to Reddit Preferences → Apps → Create a script app. Use OAuth to get an access token with submit scope.",
  },
  {
    id: "discord",
    label: "Discord",
    icon: "💜",
    color: "border-indigo-500",
    devUrl: null,
    fields: ["account_handle", "access_token"],
    instructions: "In Discord: Server Settings → Integrations → Webhooks → New Webhook. Copy the webhook URL and paste it as the access token.",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "📘",
    color: "border-blue-600",
    devUrl: "https://developers.facebook.com/apps/",
    fields: ["account_handle", "access_token"],
    instructions: "Create a Facebook app. Generate a Page Access Token with pages_manage_posts permission.",
  },
  {
    id: "threads",
    label: "Threads",
    icon: "🧵",
    color: "border-gray-600",
    devUrl: "https://developers.facebook.com/apps/",
    fields: ["account_handle", "access_token"],
    instructions: "Threads uses the Instagram/Facebook API. Create a Meta app and enable the Threads API scope.",
  },
];

const FIELD_LABELS: Record<string, string> = {
  account_handle: "Handle / Username",
  access_token: "Access Token (or Webhook URL for Discord)",
  refresh_token: "Refresh Token (optional)",
  app_password: "App Password",
};

export default function SocialAccountsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connectPlatform, setConnectPlatform] = useState<string | null>(null);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["social-accounts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_social_accounts" as never)
        .select("*")
        .order("created_at", { ascending: true }) as { data: SocialAccount[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as SocialAccount[];
    },
    enabled: !!user,
  });

  const connectMutation = useMutation({
    mutationFn: async ({ platform, values }: { platform: string; values: Record<string, string> }) => {
      const payload: Record<string, unknown> = {
        user_id: user!.id,
        platform,
        account_handle: values.account_handle || null,
        access_token: values.access_token || null,
        refresh_token: values.refresh_token || null,
        app_password: values.app_password || null,
        account_name: values.account_handle || platform,
        is_active: true,
      };

      const { error } = await supabase
        .from("member_social_accounts" as never)
        .insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
      setConnectPlatform(null);
      setFormValues({});
      toast.success("Account connected");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to connect account");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("member_social_accounts" as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
      setDisconnectId(null);
      toast.success("Account disconnected");
    },
  });

  const testMutation = useMutation({
    mutationFn: async (account: SocialAccount) => {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://bzmicoleqgfiblniojkz.supabase.co"}/functions/v1/social-post`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: account.id,
            text: "🧪 Connection test from Liana Banyan — this verifies your account is connected properly. You can delete this post.",
          }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Test post failed");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.postUrl ? `Test posted! ${data.postUrl}` : "Test post sent successfully");
    },
    onError: (err: Error) => {
      toast.error(`Test failed: ${err.message}`);
    },
  });

  const selectedPlatformInfo = SOCIAL_PLATFORMS.find((p) => p.id === connectPlatform);

  const getAccountForPlatform = (platformId: string) =>
    accounts.find((a) => a.platform === platformId && a.is_active);

  return (
    <PortalPageLayout maxWidth="lg" xrayId="social-accounts-settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Connected Social Accounts
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your social media accounts so Out of Bounds can post on your behalf.
            Phase 1: manual token entry. Phase 2: full OAuth flow.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4">
            {SOCIAL_PLATFORMS.map((platform) => {
              const account = getAccountForPlatform(platform.id);
              return (
                <Card key={platform.id} className={`border-l-4 ${platform.color}`} data-xray-id={`social-${platform.id}`}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <p className="font-semibold">{platform.label}</p>
                        {account ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>@{account.account_handle || "connected"}</span>
                            <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">
                              Connected
                            </Badge>
                            {account.last_used_at && (
                              <span className="text-xs">
                                Last used: {new Date(account.last_used_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not connected</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {account ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testMutation.mutate(account)}
                            disabled={testMutation.isPending}
                          >
                            {testMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <TestTube className="w-4 h-4 mr-1" />
                            )}
                            Test
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDisconnectId(account.id)}
                          >
                            <Unlink className="w-4 h-4 mr-1" /> Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setConnectPlatform(platform.id);
                            setFormValues({});
                          }}
                        >
                          <Link2 className="w-4 h-4 mr-1" /> Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Connect Dialog */}
        <Dialog open={!!connectPlatform} onOpenChange={(open) => { if (!open) setConnectPlatform(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-xl">{selectedPlatformInfo?.icon}</span>
                Connect {selectedPlatformInfo?.label}
              </DialogTitle>
              <DialogDescription>
                {selectedPlatformInfo?.instructions}
              </DialogDescription>
            </DialogHeader>

            {selectedPlatformInfo?.devUrl && (
              <a
                href={selectedPlatformInfo.devUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Open developer portal
              </a>
            )}

            <div className="space-y-4">
              {selectedPlatformInfo?.fields.map((field) => (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={field}>{FIELD_LABELS[field] || field}</Label>
                  <Input
                    id={field}
                    type={field.includes("token") || field.includes("password") ? "password" : "text"}
                    placeholder={
                      field === "account_handle"
                        ? selectedPlatformInfo.id === "bluesky"
                          ? "yourname.bsky.social"
                          : "@yourhandle"
                        : field === "access_token" && selectedPlatformInfo.id === "discord"
                          ? "https://discord.com/api/webhooks/..."
                          : `Paste your ${FIELD_LABELS[field]?.toLowerCase() || field}`
                    }
                    value={formValues[field] || ""}
                    onChange={(e) => setFormValues({ ...formValues, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  if (!connectPlatform) return;
                  const requiredField = selectedPlatformInfo?.id === "bluesky" ? "app_password" : "access_token";
                  if (!formValues[requiredField] && !formValues.account_handle) {
                    toast.error("Please fill in the required fields");
                    return;
                  }
                  connectMutation.mutate({ platform: connectPlatform, values: formValues });
                }}
                disabled={connectMutation.isPending}
              >
                {connectMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4 mr-1" />
                )}
                Connect Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disconnect Confirmation */}
        <AlertDialog open={!!disconnectId} onOpenChange={(open) => { if (!open) setDisconnectId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect Account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the stored credentials. You'll need to reconnect to post to this platform again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => disconnectId && disconnectMutation.mutate(disconnectId)}
              >
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PortalPageLayout>
  );
}
