/**
 * Overlay Gallery -- BP072 Wave 3 / Scope 26
 * ===========================================
 * Member Chronos overlays listed for community browsing.
 * Overlays must pass the sandbox gate before appearing here.
 * Frontier-share: approved overlays can be shared over the Frontier mesh.
 *
 * Coordination note: the overlay CORE is shared with Wave 2 scope 23.
 * This page EXTENDS the core; it does not fork it.
 *
 * Route: /overlay-gallery
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  GALLERY_REPUTATION_THRESHOLD,
  FRONTIER_REPUTATION_THRESHOLD,
} from "@/lib/sandbox/ContingencyOperatorsSandbox";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Layers,
  Search,
  ShieldCheck,
  Wifi,
  Star,
  AlertCircle,
  PlusCircle,
} from "lucide-react";

/** Stub gallery entry -- populated from Supabase once the overlays table exists. */
interface GalleryEntry {
  id: string;
  name: string;
  description: string;
  authorDisplayName: string;
  reputationScore: number;
  chronosIteration: number;
  version: string;
  gallerySafe: boolean;
  frontierSafe: boolean;
  installCount: number;
}

/** Example seed entry for the empty-state rendering. */
const EXAMPLE_ENTRY: GalleryEntry = {
  id: "example-overlay@0.1.0",
  name: "Example: Chronos Iteration Counter",
  description: "Shows the current experiment iteration number on any member dashboard.",
  authorDisplayName: "Cooperative Demo",
  reputationScore: 60,
  chronosIteration: 3,
  version: "0.1.0",
  gallerySafe: true,
  frontierSafe: false,
  installCount: 0,
};

function ReputationBadge({ score }: { score: number }) {
  if (score >= FRONTIER_REPUTATION_THRESHOLD) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 gap-1 text-xs">
        <Wifi className="w-3 h-3" /> Frontier-ready
      </Badge>
    );
  }
  if (score >= GALLERY_REPUTATION_THRESHOLD) {
    return (
      <Badge className="bg-blue-100 text-blue-700 gap-1 text-xs">
        <ShieldCheck className="w-3 h-3" /> Gallery-approved
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
      Pending review
    </Badge>
  );
}

export default function OverlayGalleryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  // In production, this data comes from Supabase `chronos_overlays` table.
  // For the launch, we show one example entry and an invitation to submit.
  const entries: GalleryEntry[] = [EXAMPLE_ENTRY];
  const filtered = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-8">
        <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
          Chronos Overlay Gallery
        </Badge>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Member Overlays
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
          Community-built Chronos overlays for experimenting on the Mimic-Trunk staging
          environment. Every overlay runs inside a sandboxed boundary -- it cannot access
          your data or the wider platform without explicit grants.
        </p>

        {/* Search */}
        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search overlays..."
            className="pl-9"
            aria-label="Search overlays"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-6">

        {/* Gate explanation */}
        <Card className="border-blue-100 bg-blue-50/50">
          <CardContent className="p-5">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-blue-900">Gallery gate</strong>
                  <p className="text-blue-700 mt-0.5">
                    Author reputation score {">="} {GALLERY_REPUTATION_THRESHOLD}.
                    All capabilities reviewed and granted/denied before listing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wifi className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-emerald-900">Frontier-share gate</strong>
                  <p className="text-emerald-700 mt-0.5">
                    Author reputation {">="} {FRONTIER_REPUTATION_THRESHOLD}.
                    Overlay is shared over the peer mesh. Higher trust required.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery entries */}
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <Card key={entry.id} className="hover:border-slate-400 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{entry.name}</CardTitle>
                  <ReputationBadge score={entry.reputationScore} />
                </div>
                <CardDescription>{entry.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span>by {entry.authorDisplayName}</span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Iteration #{entry.chronosIteration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled>
                    Preview (sandbox)
                  </Button>
                  {entry.frontierSafe && (
                    <Badge className="bg-emerald-50 text-emerald-700 text-xs gap-1">
                      <Wifi className="w-3 h-3" /> Frontier
                    </Badge>
                  )}
                  <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                    <Star className="w-3 h-3" />
                    {entry.installCount}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No overlays match your search.</p>
          </div>
        )}

        {/* Submit your overlay */}
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="p-6 text-center">
            <PlusCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-2">Submit Your Overlay</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
              Build a Chronos overlay using the ContingencyOperatorsSandbox API,
              publish it to your Mimic-Trunk staging environment, then submit
              for gallery review.
            </p>
            {user ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/my/overlays/submit">Submit an overlay</Link>
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-amber-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                Sign in to submit overlays.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Docs link */}
        <div className="text-center text-sm text-slate-400">
          Building an overlay?{" "}
          <Link to="/how-it-all-works" className="text-primary hover:underline">
            Read the overlay documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
