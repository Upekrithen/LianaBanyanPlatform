import { Lock, Snowflake, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useNorthernAccess } from "@/hooks/useNorthernAccess";

export function NorthernAccessGate({
  previewCount,
  previewLabel = "documents",
}: {
  previewCount?: number;
  previewLabel?: string;
}) {
  const access = useNorthernAccess();

  if (access.isLoading) {
    return (
      <Card className="border-sky-400/20 bg-slate-950/70">
        <CardContent className="py-8 text-sm text-slate-300">Checking Snow Gate status...</CardContent>
      </Card>
    );
  }

  if (access.hasAccess) return null;

  return (
    <Card className="border-sky-400/20 bg-slate-950/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sky-200">
          <Snowflake className="w-5 h-5" />
          Snow Gate Locked
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-slate-300">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-sky-400/30 text-sky-200">
            <Lock className="w-3 h-3 mr-1" />
            {access.locksCompleted}/{access.totalLocks} locks
          </Badge>
          <Badge variant="outline" className="border-sky-400/30 text-sky-200">
            Level {access.level}/60
          </Badge>
          {typeof previewCount === "number" ? (
            <Badge variant="outline" className="border-sky-400/30 text-sky-200">
              {previewCount} {previewLabel} waiting inside
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-slate-400">
          What lies beyond the Snow Gate is not hidden. It is waiting. The 12 locks are not barriers -
          they are proof you understand what you are entering.
        </p>
        <Link
          to="/northern/overlook"
          className="inline-flex items-center gap-1 text-sm text-sky-300 hover:text-sky-200"
        >
          <Compass className="w-4 h-4" />
          Follow the Crow&apos;s Nest path around the gate
        </Link>
      </CardContent>
    </Card>
  );
}

