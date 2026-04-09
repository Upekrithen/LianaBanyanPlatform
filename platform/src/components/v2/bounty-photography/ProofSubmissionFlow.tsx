import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProofSubmissionFlowProps = {
  onSubmitProof: (payload: { socialLink: string; merchantConfirmation: string }) => void;
};

export function ProofSubmissionFlow({ onSubmitProof }: ProofSubmissionFlowProps) {
  const [socialLink, setSocialLink] = useState("");
  const [merchantConfirmation, setMerchantConfirmation] = useState("");

  const submit = () => {
    const link = socialLink.trim();
    if (!link.startsWith("http://") && !link.startsWith("https://")) return;
    onSubmitProof({
      socialLink: link,
      merchantConfirmation: merchantConfirmation.trim(),
    });
    setSocialLink("");
    setMerchantConfirmation("");
  };

  return (
    <Card data-xray-id="bounty-photography-proof-submission">
      <CardHeader>
        <CardTitle>Proof submission flow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Submit your social-post link as proof. Zero-storage model: no image uploads.
        </p>
        <div className="space-y-2">
          <Label htmlFor="proof-link">Social post link</Label>
          <Input
            id="proof-link"
            placeholder="https://..."
            value={socialLink}
            onChange={(event) => setSocialLink(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="merchant-confirm">Merchant confirmation (optional)</Label>
          <Input
            id="merchant-confirm"
            placeholder="Optional manager name or confirmation note"
            value={merchantConfirmation}
            onChange={(event) => setMerchantConfirmation(event.target.value)}
          />
        </div>
        <Button type="button" onClick={submit}>
          Deliver proof
        </Button>
      </CardContent>
    </Card>
  );
}
