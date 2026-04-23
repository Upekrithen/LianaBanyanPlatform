/**
 * /my/cathedral/export — Cathedral export
 * =======================================
 * K438a: route + UI shell only. The actual ZIP packaging (#2268 Claim 1(d))
 * lands in K438b Phase E along with the standalone reader.py and the
 * symmetric import surface.
 *
 * What works in K438a:
 *   - The route renders without 500s (acceptance criterion ✓)
 *   - Health-card stats are shown so the member can see what would be exported
 *   - Disabled "Download ZIP" CTA with K438b ETA copy
 *
 * Why we ship the route now: K438 acceptance criteria require all 6 routes
 * to render without 500s on a test member's Cathedral. Shipping a clean
 * "coming next" surface is honest and meets the bar.
 */
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileArchive, ScrollText, BookOpen } from "lucide-react";
import { useEnsureCathedral, useCathedralHealth } from "./useCathedral";

export default function CathedralExport() {
  useEnsureCathedral();
  const { data: health, isLoading } = useCathedralHealth();

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

            <div className="border border-dashed border-border rounded-md p-4 bg-muted/30">
              <Badge variant="secondary" className="mb-2">K438b — coming next</Badge>
              <p className="text-sm text-muted-foreground">
                The ZIP packager and standalone reader (<code>liana-companion-standalone-reader.py</code>)
                ship in K438b Phase E. The route is live now so the membership benefits
                page can link to it without a 404, and so the Founder can review the
                export-on-close commitment before the packager is wired up.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" asChild>
                <Link to="/my/cathedral">Back to your Cathedral</Link>
              </Button>
              <Button disabled title="Ships in K438b">
                <Download className="h-4 w-4 mr-1" /> Download ZIP
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
              <li><code>scribe_&lt;name&gt;.jsonl</code> — one append-only tablet per Scribe</li>
              <li><code>tidbits.jsonl</code> — your SP-21 verify-action ledger</li>
              <li><code>fates_log.jsonl</code> — Three Fates routing decisions</li>
              <li><code>README.md</code> — schema documentation + consult-scribes algorithm</li>
              <li><code>liana-companion-standalone-reader.py</code> — minimal offline reader</li>
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
