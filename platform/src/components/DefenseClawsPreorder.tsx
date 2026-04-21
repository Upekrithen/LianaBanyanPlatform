import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DefenseClawsPreorder() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");

  const { data: initiative } = useQuery({
    queryKey: ["defense-claws-initiative"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("initiatives")
        .select("*")
        .eq("initiative_slug", "defense_claws")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: legalFund } = useQuery({
    queryKey: ["legal-defense-fund"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_defense_fund")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handlePreorder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("defense_claws_preorders")
      .insert({
        purchaser_id: user.id,
        recipient_email: email,
        recipient_name: recipientName,
        amount_paid: 6.00,
        status: "active",
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Preorder Complete",
        description: "Defense Klaus coverage activated. No confirmation email sent to recipient."
      });
      setEmail("");
      setRecipientName("");
    }
  };

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          <CardTitle>Defense Klaus™ Preorder</CardTitle>
        </div>
        <CardDescription>
          $6 bracelet with legal defense coverage. 100% of proceeds fund Legal Defense for Members.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Privacy Notice:</strong> No confirmation email is sent to the recipient.
            They can verify coverage by filing a report through LB or calling our volunteer line.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>Recipient Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="anyone@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Recipient Name (Optional)</Label>
          <Input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Their name"
          />
        </div>

        <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Bracelet Price</span>
            <span className="font-medium">$6.00</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Goes to Legal Defense Fund</span>
            <span>100%</span>
          </div>
        </div>

        <Button onClick={handlePreorder} className="w-full" disabled={!email}>
          Preorder Defense Klaus™ - $6
        </Button>

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-2">
          <p className="font-semibold">Legal Defense Fund</p>
          <p>Total Raised: ${legalFund?.total_amount?.toFixed(2) || "0.00"}</p>
          <p>Available for Claims: ${legalFund?.available_amount?.toFixed(2) || "0.00"}</p>

          <p className="font-semibold mt-3">Product Features:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Bracelet pulls up to become palm claws</li>
            <li>Plastic blades around wrist prevent grasping</li>
            <li>Dull studded edges for DNA marking</li>
            <li>Future: Broadcast monitor until turned off by preset conditions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
