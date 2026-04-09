import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ReadAlongButtonProps = {
  sourceMemberId: string;
  paperKey: string;
  paperTitle: string;
  onSuccess?: (payload: { cohort_size?: number }) => void;
};

export function ReadAlongButton({ sourceMemberId, paperKey, paperTitle, onSuccess }: ReadAlongButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleReadAlong = async () => {
    if (!user) {
      navigate("/join");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("read-along", {
        body: {
          source_member_id: sourceMemberId,
          paper_key: paperKey,
        },
      });
      if (error) throw error;

      onSuccess?.(data ?? {});
      toast.success(`You're now reading ${paperTitle} - check your Beacon Wallet.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to join read-along right now";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleReadAlong} disabled={isLoading} className="gap-1.5">
      <PlayCircle className="h-3.5 w-3.5" />
      {isLoading ? "Joining..." : "Read Along"}
    </Button>
  );
}
