/**
 * /my/cathedral/export — Cathedral export (K438b)
 * ===============================================
 * #2268 Claim 1(d) export-on-demand operationalised. Hits the
 * `cathedral-export` edge function, downloads the resulting ZIP via a
 * synthetic anchor click. The bundle includes the standalone Python
 * reader so the export is useful offline forever.
 *
 * K438a shipped a disabled CTA + "coming next" copy. K438b enables the
 * button, wires the download, and surfaces the export count + last-export
 * timestamp so the member can verify their last download succeeded.
 */
import { Link } from "react-router-dom";
import { useState } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Download, FileArchive, ScrollText, BookOpen, Loader2 } from "lucide-react";
import { useEnsureCathedral, useCathedralHealth } from "./useCathedral";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function CathedralExport() {
  useEnsureCathedral();
  const { data: health, isLoading, refetch } = useCathedralHealth();
  const { user } = useAuth();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!user?.id) {
      toast({ title: "Sign in required", description: "Authenticate before exporting your Cathedral." });
      return;
    }
    setDownloading(true);
    try {
      // We bypass supabase.functions.invoke() because it parses the response
      // body into JSON automatically — we need the raw ZIP bytes here.
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error("No active session");
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cathedral-export`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
        },
        body: JSON.stringify({ member_id: user.id }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Export failed (${res.status}): ${errText.slice(0, 200)}`);
      }
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const cd = res.headers.get("Content-Disposition") || "";
      const fnameMatch = cd.match(/filename="?([^"]+)"?/);
      const filename = fnameMatch?.[1] ?? `cathedral-export-${Date.now()}.zip`;
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
      toast({
        title: "Cathedral exported",
        description: `${res.headers.get("X-Cathedral-Scribes") ?? "?"} Scribes / ${res.headers.get("X-Cathedral-Entries") ?? "?"} entries packaged.`,
      });
      void refetch();
    } catch (err) {
      toast({
        title: "Export failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PortalPageLayout title="Export your Cathedral" backButton maxWidth="lg" xrayId="cathedral-export">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileArchive className="h-5 w-5" />
              One-click ZIP download
            </CardTitle>
            <CardDescription>
              Per #2268 Claim 1(d): every Cathedral is portable. The export bundle
              includes <code>registry.yaml</code>, one JSONL tablet per Scribe, your
              SP-21 tidbits, your Fates routing log, a README explaining the schema,
              and a standalone Python reader so you can query your Cathedral offline
              outside the LB platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-24" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Stat icon={<BookOpen className="h-4 w-4" />} label="Scribes" value={health?.scribe_count ?? 0} />
                <Stat icon={<ScrollText className="h-4 w-4" />} label="Entries" value={health?.entry_count ?? 0} />
                <Stat icon={<Download className="h-4 w-4" />} label="Past exports" value={health?.export_count ?? 0} />
              </div>
            )}

            {health?.export_last_at && (
              <p className="text-xs text-muted-foreground">
                Last export: {new Date(health.export_last_at).toLocaleString()}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" asChild>
                <Link to="/my/cathedral">Back to your Cathedral</Link>
              </Button>
              <Button onClick={handleDownload} disabled={downloading || !user?.id}>
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Packaging…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" /> Download ZIP
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What's in the bundle</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li><code>registry.yaml</code> — your Scribes, primary fields, adjacents, keywords</li>
              <li><code>registry.json</code> — same data in JSON form (used by the standalone reader)</li>
              <li><code>scribe_&lt;name&gt;.jsonl</code> — one append-only tablet per Scribe</li>
              <li><code>tidbits.jsonl</code> — your SP-21 verify-action ledger</li>
              <li><code>fates_log.jsonl</code> — Three Fates routing decisions</li>
              <li><code>member_cathedral.json</code> — top-level Cathedral metadata (tier, dates)</li>
              <li><code>README.md</code> — schema documentation + reader usage</li>
              <li><code>liana-companion-standalone-reader.py</code> — minimal offline reader (zero deps)</li>
              <li><code>LICENSE</code> — AGPL-3.0 + Pledged Commons grant per #2260</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="border border-border rounded-md p-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
        {icon}{label}
      </div>
      <div className="text-2xl font-semibold text-foreground mt-1">{value}</div>
    </div>
  );
}
