import { Coins } from "lucide-react";
import { useCreditWallet } from "@/hooks/useCreditWallet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function CreditBalanceHeader() {
  const { user } = useAuth();
  const { data: wallet } = useCreditWallet();
  const navigate = useNavigate();

  if (!user) return null;

  const balance = wallet?.balance ?? 0;

  return (
    <button
      onClick={() => navigate("/buy-credits")}
      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
      aria-label={`Credit balance: ${balance}. Click to buy more credits.`}
    >
      <Coins className="h-4 w-4 text-amber-500" aria-hidden="true" />
      {/* aria-live: balance updates announced to screen readers automatically */}
      <span
        className="tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {balance}
      </span>
    </button>
  );
}
