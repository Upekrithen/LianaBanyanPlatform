/**
 * /my/cathedral/settings — Cathedral settings
 * ===========================================
 * Member-facing controls:
 *   - Tier display + upgrade CTA (paid unlocks the Companion bridge in K445)
 *   - Professional domain (seeds the 'Work' Scribe's primary field)
 *   - Cathedral metadata (created, last sync)
 *   - Danger zone — full delete (deferred to K438b Phase E once we have the
 *     hard-delete RPC + audit trail; route shows the surface)
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Settings as SettingsIcon, Sparkles, AlertTriangle, ExternalLink } from "lucide-react";
import { useEnsureCathedral, useCathedralHealth } from "./useCathedral";
import { cathedral } from "@/lib/cathedral-client";

function formatTs(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function CathedralSettings() {
  useEnsureCathedral();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: health, isLoading, refetch } = useCathedralHealth();

  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (health?.professional_domain) setDomain(health.professional_domain);
  }, [health?.professional_domain]);

  const saveDomain = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await cathedral()
        .from("member_cathedrals" as never)
        .update({ professional_domain: domain.trim() || null } as never)
        .eq("member_id", user.id);
      if (error) throw error;
      toast({ title: "Saved", description: "Professional domain updated." });
      void refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save.";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PortalPageLayout title="Cathedral settings" backButton maxWidth="lg">
        <Skeleton className="h-64 w-full" />
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout title="Cathedral settings" backButton maxWidth="lg" xrayId="cathedral-settings">
      <div className="space-y-6">
        {/* Tier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5" />
              Membership tier
            </CardTitle>
            <CardDescription>
              The Cathedral is part of your $5/year membership. Free tier preserves
              the storage substrate; paid unlocks cross-device sync and the Companion
              bridge (K445).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current tier:</span>
                  <Badge variant={health?.tier === "paid" ? "default" : "secondary"}>
                    {health?.tier === "paid" ? "Paid" : "Free"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Cathedral created {formatTs(health?.cathedral_created_at ?? null)}
                </div>
              </div>
              {health?.tier !== "paid" && (
                <Button asChild>
                  <Link to="/membership">
                    Upgrade for $5/yr <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional domain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SettingsIcon className="h-5 w-5" />
              Professional domain
            </CardTitle>
            <CardDescription>
              Seeds the 'Work' starter Scribe and helps the Three Fates router
              prioritize relevant Scribes for your session content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="settings-domain">What's your professional domain?</Label>
              <Input
                id="settings-domain"
                placeholder="e.g., 'Independent gardener and seed-saver'"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={saveDomain} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sync metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sync &amp; export history</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground uppercase">Last sync</dt>
                <dd className="text-foreground">{formatTs(health?.last_sync_at ?? null)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground uppercase">Last export</dt>
                <dd className="text-foreground">{formatTs(health?.export_last_at ?? null)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground uppercase">Total exports</dt>
                <dd className="text-foreground">{health?.export_count ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground uppercase">Active Scribes</dt>
                <dd className="text-foreground">
                  {health?.active_scribe_count ?? 0} / {health?.scribe_count ?? 0}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger zone
            </CardTitle>
            <CardDescription>
              Deleting your Cathedral removes every Scribe, every entry, every Fates
              log line, and every tidbit. This is irreversible. Per #2268 Claim 1(d),
              before deletion you should export your Cathedral so you keep your
              accumulated expertise record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" asChild>
                <Link to="/my/cathedral/export">Export first</Link>
              </Button>
              <Button variant="destructive" disabled title="Hard-delete RPC ships in K438b">
                Delete entire Cathedral
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-right">
              Hard-delete RPC ships in K438b alongside the export packager.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
