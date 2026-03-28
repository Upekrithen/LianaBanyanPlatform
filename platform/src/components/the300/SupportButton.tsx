import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useSupportPedestal } from "@/hooks/usePedestals";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  pedestalId: string;
  className?: string;
}

export function SupportButton({ pedestalId, className }: Props) {
  const { user } = useAuth();
  const mutation = useSupportPedestal();

  const handleClick = () => {
    if (!user) {
      toast.error("Sign in to support this appointment.");
      return;
    }
    mutation.mutate({ pedestalId });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={mutation.isPending}
      variant="outline"
      className={`border-amber-500/30 text-amber-300 hover:bg-amber-500/10 ${className ?? ""}`}
    >
      {mutation.isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Heart className="w-4 h-4 mr-2" />
      )}
      Support This Appointment
    </Button>
  );
}
