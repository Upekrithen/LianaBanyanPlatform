import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type LinkedFamilyMember = {
  id: string;
  label: string;
  role: string;
  avatarText: string;
  xp: number | null;
};

type LinkedMembersRailProps = {
  members: LinkedFamilyMember[];
};

function isChildRole(role: string) {
  const value = role.toLowerCase();
  return value.includes("child") || value.includes("kid");
}

function isGuardianRole(role: string) {
  const value = role.toLowerCase();
  return value.includes("guardian") || value.includes("parent") || value.includes("founder");
}

export function LinkedMembersRail({ members }: LinkedMembersRailProps) {
  return (
    <Card id="linked-members">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Linked members</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {members.map((member) => {
              const child = isChildRole(member.role);
              const guardian = isGuardianRole(member.role);
              return (
                <article key={member.id} className="min-w-[180px] rounded-xl border bg-background p-3">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {member.avatarText}
                    </div>
                    <p className="text-sm font-medium">{member.label}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {guardian ? <Badge className="bg-indigo-600 text-white">Guardian</Badge> : null}
                    {child ? (
                      <Badge variant="secondary">XP {Math.max(0, Math.round(member.xp ?? 0)).toLocaleString()}</Badge>
                    ) : (
                      <Badge variant="outline">{member.role}</Badge>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No linked members yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
