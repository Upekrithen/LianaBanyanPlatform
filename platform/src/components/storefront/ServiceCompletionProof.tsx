import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Image,
  Shield,
} from "lucide-react";

type ServiceOrder = {
  id: string;
  storefront_id: string;
  product_id: string;
  buyer_user_id: string;
  status: string;
  escrow_status: string;
  escrow_amount: number | null;
  before_photo_url: string | null;
  after_photo_url: string | null;
  customer_confirmed_at: string | null;
  provider_notes: string | null;
};

type ServiceCompletionProofProps = {
  order: ServiceOrder;
  isProvider: boolean;
  onUpdate?: () => void;
};

const STATUS_DISPLAY: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Awaiting Service", icon: Clock, color: "text-amber-600" },
  in_progress: { label: "In Progress", icon: Camera, color: "text-blue-600" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-600" },
  disputed: { label: "Disputed", icon: AlertTriangle, color: "text-red-600" },
  auto_released: { label: "Auto-Released (72h)", icon: CheckCircle2, color: "text-emerald-500" },
};

export function ServiceCompletionProof({
  order,
  isProvider,
  onUpdate,
}: ServiceCompletionProofProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const statusInfo = STATUS_DISPLAY[order.escrow_status] ?? STATUS_DISPLAY.pending;
  const StatusIcon = statusInfo.icon;

  const uploadPhoto = async (type: "before" | "after") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const ext = file.name.split(".").pop();
        const path = `service-proof/${order.id}/${type}_${Date.now()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("service-photos")
          .upload(path, file, { contentType: file.type });

        if (uploadErr) throw uploadErr;

        const {
          data: { publicUrl },
        } = supabase.storage.from("service-photos").getPublicUrl(path);

        const column = type === "before" ? "before_photo_url" : "after_photo_url";
        await supabase
          .from("storefront_orders" as never)
          .update({ [column]: publicUrl } as never)
          .eq("id", order.id);

        toast.success(`${type === "before" ? "Before" : "After"} photo uploaded`);
        onUpdate?.();
      } catch (err) {
        toast.error("Photo upload failed");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleConfirmCompletion = async () => {
    try {
      await supabase
        .from("storefront_orders" as never)
        .update({
          status: "delivered",
          escrow_status: "released",
          customer_confirmed_at: new Date().toISOString(),
        } as never)
        .eq("id", order.id);

      toast.success("Service confirmed! Escrow released to provider.");
      onUpdate?.();
    } catch {
      toast.error("Failed to confirm completion");
    }
  };

  const handleDispute = async () => {
    try {
      await supabase
        .from("storefront_orders" as never)
        .update({ escrow_status: "disputed" } as never)
        .eq("id", order.id);

      toast.info("Dispute filed. Star Chamber will review.");
      onUpdate?.();
    } catch {
      toast.error("Failed to file dispute");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Service Verification
          </span>
          <Badge
            variant="outline"
            className={`gap-1 ${statusInfo.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo proof grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Before</p>
            {order.before_photo_url ? (
              <div className="aspect-[4/3] rounded-md overflow-hidden border bg-muted">
                <img
                  src={order.before_photo_url}
                  alt="Before service"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : isProvider ? (
              <button
                onClick={() => uploadPhoto("before")}
                disabled={uploading}
                className="aspect-[4/3] rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload</span>
              </button>
            ) : (
              <div className="aspect-[4/3] rounded-md border bg-muted flex items-center justify-center">
                <Image className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">After</p>
            {order.after_photo_url ? (
              <div className="aspect-[4/3] rounded-md overflow-hidden border bg-muted">
                <img
                  src={order.after_photo_url}
                  alt="After service"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : isProvider ? (
              <button
                onClick={() => uploadPhoto("after")}
                disabled={uploading || !order.before_photo_url}
                className="aspect-[4/3] rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors disabled:opacity-40"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload</span>
              </button>
            ) : (
              <div className="aspect-[4/3] rounded-md border bg-muted flex items-center justify-center">
                <Image className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Escrow info */}
        {order.escrow_amount && order.escrow_status === "held" && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-md p-3 text-xs space-y-1">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {order.escrow_amount.toFixed(2)} Credits held in escrow
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Released when you confirm the work is complete, or automatically
              after 72 hours.
            </p>
          </div>
        )}

        {/* Customer actions */}
        {!isProvider &&
          order.escrow_status === "held" &&
          order.after_photo_url && (
            <div className="flex gap-2">
              <Button
                onClick={handleConfirmCompletion}
                className="flex-1 gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm &amp; Release Payment
              </Button>
              <Button
                variant="outline"
                onClick={handleDispute}
                className="text-red-600 hover:text-red-700"
              >
                <AlertTriangle className="w-4 h-4" />
              </Button>
            </div>
          )}

        {order.customer_confirmed_at && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed{" "}
            {new Date(order.customer_confirmed_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
