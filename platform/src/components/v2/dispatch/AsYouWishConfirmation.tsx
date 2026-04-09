import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AsYouWishConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  mobileFullscreen?: boolean;
};

export function AsYouWishConfirmation({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  mobileFullscreen = false,
}: AsYouWishConfirmationProps) {
  const [stamping, setStamping] = useState(false);

  const handleConfirm = async () => {
    setStamping(true);
    try {
      await onConfirm();
    } finally {
      setStamping(false);
    }
  };

  const busy = loading || stamping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={mobileFullscreen ? "h-screen w-screen max-w-none rounded-none" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>As You Wish</DialogTitle>
          <DialogDescription>
            This is a deliberate confirmation stamp before dispatch. The canonical story is ready to project.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-card/50 p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Solemn Confirmation</p>
          <p className="mt-2 text-2xl font-bold">As You Wish</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={busy}>
            {busy ? "Stamping..." : "Stamp As You Wish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
