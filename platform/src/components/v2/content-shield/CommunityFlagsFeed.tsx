import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityFlag } from "./types";

type CommunityFlagsFeedProps = {
  flags: CommunityFlag[];
};

export function CommunityFlagsFeed({ flags }: CommunityFlagsFeedProps) {
  return (
    <Card data-xray-id="content-shield-community-flags">
      <CardHeader>
        <CardTitle>Community flags feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active flags.</p>
        ) : (
          flags.map((flag) => (
            <div key={flag.id} className="rounded-lg border p-3">
              <p className="font-medium">{flag.target}</p>
              <p className="text-sm text-muted-foreground">{flag.reason}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {flag.flagCount} flags · {new Date(flag.flaggedAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
