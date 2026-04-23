/**
 * /my/cathedral/:scribeId/share — share-level settings for one Scribe
 * ===================================================================
 * Per #2268: members elect Scribe-level share policy. K438a supports
 * private + commons; guild + tribe land in K438b once group-membership
 * tables exist (cathedral.guild_membership / cathedral.tribe_membership).
 *
 * Existing entries keep their original shared_level snapshot (immutable
 * at INSERT time) — changing the Scribe's share_level here only affects
 * future entries.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Lock, Globe2, Users, Share2 } from "lucide-react";
import {
  useEnsureCathedral,
  useMemberScribe,
  useUpdateScribeShareLevel,
} from "./useCathedral";
import type { ShareLevel } from "@/lib/cathedral-client";

const OPTIONS: { value: ShareLevel; label: string; desc: string; icon: React.ReactNode; disabled?: boolean }[] = [
  {
    value: "private",
    label: "Private",
    desc: "Only you can see this Scribe's entries.",
    icon: <Lock className="h-4 w-4" />,
  },
  {
    value: "commons",
    label: "Commons",
    desc: "Visible to every enrolled member. Use only for safe, shareable knowledge.",
    icon: <Globe2 className="h-4 w-4" />,
  },
  {
    value: "guild",
    label: "Guild — coming K438b",
    desc: "Share with one declared Guild. Group-membership tables ship in the next session.",
    icon: <Users className="h-4 w-4" />,
    disabled: true,
  },
  {
    value: "tribe",
    label: "Tribe — coming K438b",
    desc: "Share with one declared Tribe. Group-membership tables ship in the next session.",
    icon: <Users className="h-4 w-4" />,
    disabled: true,
  },
];

export default function CathedralShare() {
  useEnsureCathedral();
  const { scribeId } = useParams<{ scribeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: scribe, isLoading } = useMemberScribe(scribeId);
  const update = useUpdateScribeShareLevel(scribeId ?? "");

  const [level, setLevel] = useState<ShareLevel>("private");
  const [targetId, setTargetId] = useState<string>("");

  useEffect(() => {
    if (scribe) {
      setLevel(scribe.share_level);
      setTargetId(scribe.share_target_id ?? "");
    }
  }, [scribe]);

  const submit = async () => {
    if ((level === "guild" || level === "tribe") && !targetId.trim()) {
      toast({
        title: "Target required",
        description: "Guild/Tribe share needs a group ID. (This option is disabled in K438a.)",
        variant: "destructive",
      });
      return;
    }
    try {
      await update.mutateAsync({
        share_level: level,
        share_target_id: level === "guild" || level === "tribe" ? targetId.trim() : null,
      });
      toast({ title: "Share level updated", description: "Future entries will use this setting." });
      navigate(`/my/cathedral/${scribeId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not update share level.";
      toast({ title: "Update failed", description: msg, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <PortalPageLayout title="Loading…" backButton maxWidth="md">
        <Skeleton className="h-64 w-full" />
      </PortalPageLayout>
    );
  }
  if (!scribe) {
    return (
      <PortalPageLayout title="Scribe not found" backButton maxWidth="md">
        <Card>
          <CardContent className="py-8 text-center">
            <Button asChild>
              <Link to="/my/cathedral">Back to your Cathedral</Link>
            </Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout title={`Share: ${scribe.name}`} backButton maxWidth="lg" xrayId="cathedral-share">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-5 w-5" />
            Who can see {scribe.name}?
          </CardTitle>
          <CardDescription>
            Setting only applies to <strong>future</strong> entries. Existing entries keep
            their original share-level snapshot — that immutability is a feature, not a bug.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <RadioGroup value={level} onValueChange={(v) => setLevel(v as ShareLevel)}>
            {OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className={`flex items-start gap-3 border border-border rounded-md p-3 ${
                  opt.disabled ? "opacity-60" : "hover:bg-accent/30"
                }`}
              >
                <RadioGroupItem value={opt.value} id={`share-${opt.value}`} disabled={opt.disabled} />
                <Label
                  htmlFor={`share-${opt.value}`}
                  className={`flex-1 cursor-pointer ${opt.disabled ? "cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    {opt.icon}
                    {opt.label}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {(level === "guild" || level === "tribe") && (
            <div>
              <Label htmlFor="share-target">{level === "guild" ? "Guild" : "Tribe"} ID</Label>
              <Input
                id="share-target"
                placeholder="UUID of the target group"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Disabled in K438a — group lookup tables land in K438b.
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-3 border-t border-border">
            <Button variant="outline" onClick={() => navigate(`/my/cathedral/${scribeId}`)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save share level"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
