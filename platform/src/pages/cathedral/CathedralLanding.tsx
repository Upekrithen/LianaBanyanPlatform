/**
 * /my/cathedral — Member Cathedral landing
 * ========================================
 * The member's home for their personal Scribes Cathedral. Shows:
 *   - Health card (Scribe count, entry count, last sync, tier)
 *   - Scribes ordered by most-recent activity
 *   - Recent entries across all Scribes
 *
 * Per #2268: "The Cathedral UI should feel like a member is investing in
 * their own personal expertise record that grows over time, not filling out
 * a SaaS form." Mythology-consistent naming throughout — Scribes, Cathedral,
 * Tablet, never "Memory" or "Notes".
 */
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ScrollText,
  BookOpen,
  Activity,
  Settings as SettingsIcon,
  Download,
  Sparkles,
} from "lucide-react";
import {
  useEnsureCathedral,
  useCathedralHealth,
  useMemberScribes,
  useRecentEntriesAcrossCathedral,
} from "./useCathedral";
import type { ShareLevel } from "@/lib/cathedral-client";

const SHARE_BADGE: Record<ShareLevel, { label: string; variant: "secondary" | "outline" | "default" }> = {
  private: { label: "Private", variant: "secondary" },
  guild: { label: "Guild", variant: "outline" },
  tribe: { label: "Tribe", variant: "outline" },
  commons: { label: "Commons", variant: "default" },
};

function relativeTime(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export default function CathedralLanding() {
  useEnsureCathedral();
  const { data: health, isLoading: healthLoading } = useCathedralHealth();
  const { data: scribes, isLoading: scribesLoading } = useMemberScribes();
  const { data: recent, isLoading: recentLoading } = useRecentEntriesAcrossCathedral(10);

  return (
    <PortalPageLayout
      title="Your Cathedral"
      subtitle="Domain-indexed working memory with triply-redundant witness"
      maxWidth="xl"
      xrayId="cathedral-landing"
    >
      <div className="space-y-6">
        {/* Health card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Cathedral Health
                </CardTitle>
                <CardDescription>
                  {health?.tier === "paid"
                    ? "Paid membership — full sync enabled."
                    : "Free tier — upgrade to unlock cross-device sync and the Companion bridge."}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/my/cathedral/settings">
                    <SettingsIcon className="h-4 w-4 mr-1" /> Settings
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/my/cathedral/export">
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/my/cathedral/new">
                    <Plus className="h-4 w-4 mr-1" /> New Scribe
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Scribes" value={health?.scribe_count ?? 0} hint={`${health?.active_scribe_count ?? 0} active`} />
                <Stat label="Entries" value={health?.entry_count ?? 0} hint="across all Scribes" />
                <Stat label="Last Entry" value={relativeTime(health?.last_entry_at ?? null)} />
                <Stat label="Last Sync" value={relativeTime(health?.last_sync_at ?? null)} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scribes list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your Scribes
            </CardTitle>
            <CardDescription>
              Each Scribe is a domain specialist. Primary field is what they know best;
              up to 12 adjacent fields cover related territory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scribesLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : !scribes || scribes.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-8 w-8" />}
                title="No Scribes yet"
                body="Provisioning starter Scribes… refresh in a moment, or create your first one now."
                cta={
                  <Button asChild>
                    <Link to="/my/cathedral/new"><Plus className="h-4 w-4 mr-1" /> New Scribe</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {scribes.map((s) => {
                  const badge = SHARE_BADGE[s.share_level];
                  return (
                    <li key={s.scribe_id} className="py-3">
                      <Link
                        to={`/my/cathedral/${s.scribe_id}`}
                        className="flex items-start justify-between gap-3 hover:bg-accent/50 -mx-2 px-2 py-2 rounded transition"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">{s.name}</span>
                            <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
                            {!s.active && <Badge variant="outline" className="text-xs">queued</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {s.primary_field}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {s.adjacents.length} adjacent {s.adjacents.length === 1 ? "field" : "fields"}
                            {" • "}updated {relativeTime(s.updated_at)}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent across all Scribes
            </CardTitle>
            <CardDescription>The last 10 tablet entries you wrote.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : !recent || recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No entries yet. Open a Scribe and append your first observation.
              </p>
            ) : (
              <ul className="space-y-3">
                {recent.map((e) => (
                  <li key={e.entry_id} className="border-l-2 border-border pl-3">
                    <Link
                      to={`/my/cathedral/${e.scribe_id}`}
                      className="text-sm text-foreground hover:underline"
                    >
                      <ScrollText className="h-3 w-3 inline mr-1 -mt-0.5" />
                      {e.observation.length > 160 ? e.observation.slice(0, 160) + "…" : e.observation}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1">
                      {relativeTime(e.ts)}{e.session_id ? ` • session ${e.session_id}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="border border-border rounded-md p-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-foreground mt-1">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function EmptyState({ icon, title, body, cta }: {
  icon: React.ReactNode; title: string; body: string; cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-muted-foreground mb-2">{icon}</div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{body}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
