import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type InviteStorefrontFlowProps = {
  invites: string[];
  onInvite: (email: string) => void;
};

export function InviteStorefrontFlow({ invites, onInvite }: InviteStorefrontFlowProps) {
  const [email, setEmail] = useState("");

  const submit = () => {
    const normalized = email.trim();
    if (!normalized || !normalized.includes("@")) return;
    onInvite(normalized);
    setEmail("");
  };

  return (
    <Card data-xray-id="coalition-invite-storefront-flow">
      <CardHeader>
        <CardTitle>Invite storefront flow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Storefront contact email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="button" onClick={submit}>
            Invite a storefront
          </Button>
        </div>
        <div className="space-y-2">
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          ) : (
            invites.map((invite) => (
              <div key={invite} className="rounded-lg border p-3 text-sm">
                Invite queued: {invite}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
