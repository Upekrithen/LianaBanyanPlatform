import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ContributionPathsProps = {
  windowOpen: boolean;
  onExplore: () => void;
};

export function ContributionPaths({ windowOpen, onExplore }: ContributionPathsProps) {
  return (
    <Card data-xray-id="pioneers-contribution-paths">
      <CardHeader>
        <CardTitle>Contribution Paths</CardTitle>
        <CardDescription>
          {windowOpen
            ? "Pioneer window is open: clear steps are available for new members to join the next chapter."
            : "Pioneer window is closed: contribution paths continue and recognition evolves across new chapters."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {windowOpen ? (
          <>
            <p>1. Pick a contribution path (Marketplace, HexIsle, Governance).</p>
            <p>2. Complete your first validated action.</p>
            <p>3. Add your narrative to the member story stream.</p>
          </>
        ) : (
          <>
            <p>1. Join current contribution tracks across active initiatives.</p>
            <p>2. Build consistent chapter-based contributions.</p>
            <p>3. Grow influence through sustained reliability.</p>
          </>
        )}
        <Button variant="outline" onClick={onExplore}>
          See current contribution paths
        </Button>
      </CardContent>
    </Card>
  );
}
