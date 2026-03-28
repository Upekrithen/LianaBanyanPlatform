import { Coins } from "lucide-react";
import { useCreditWallet } from "@/hooks/useCreditWallet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function CreditBalanceHeader() {
  const { user } = useAuth();
  const { data: wallet } = useCreditWallet();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <button
      onClick={() => navigate("/buy-credits")}
      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
      title="Your Credit balance — click to buy more"
    >
      <Coins className="h-4 w-4 text-amber-500" />
      <span className="tabular-nums">{wallet?.balance ?? 0}</span>
    </button>
  );
}
