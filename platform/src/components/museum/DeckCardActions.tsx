/**
 * DeckCardActions — Compact action bar for Deck Card pages.
 * Sits at the bottom of DeckCardShell with Stamp & Share + CatapultGauge + Mint Status Badge.
 * ONE LEVEL attribution only — no second-degree tracking.
 * K394 + K395 / B093.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useDeckCard } from "@/hooks/useDeckCards";
import { generateShareUrl, recordShare } from "@/lib/socialPlugSystem";
import { addToIPLedger } from "@/lib/nervous-system/ipLedger";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CatapultGauge } from "@/components/catapult/CatapultGauge";

interface DeckCardActionsProps {
  cardKey: string;
  cardTitle?: string;
}

const STATUS_DISPLAY: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  generated: { label: "Digital", variant: "secondary" },
  printed: { label: "Printable", variant: "outline" },
  distributed: { label: "Physical", variant: "default" },
  retired: { label: "Archived", variant: "destructive" },
};

const STATUS_COLORS: Record<string, string> = {
  generated: "#94a3b8",
  printed: "#f59e0b",
  distributed: "#10b981",
  retired: "#ef4444",
};

export function DeckCardActions({ cardKey, cardTitle }: DeckCardActionsProps) {
  const { user } = useAuth();
  const { data: card } = useDeckCard(cardKey);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sharing, setSharing] = useState(false);

  const cardId = card?.id;
  const status = (card as any)?.status ?? "generated";
  const display = STATUS_DISPLAY[status] ?? STATUS_DISPLAY.generated;
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.generated;

  const { data: cpMetric } = useQuery({
    queryKey: ["catapult-cp", cardId],
    queryFn: async () => {
      const { data } = await supabase
        .from("catapult_metrics")
        .select("cp_score, current_value, target_value")
        .eq("entity_type", "deck_card_print")
        .eq("entity_id", cardId!)
        .maybeSingle();
      return data;
    },
    enabled: !!cardId,
    staleTime: 60_000,
  });

  const handleRequestPrint = async () => {
    if (!user?.id || !cardId) return;
    try {
      const { error } = await (supabase as any)
        .from("print_orders")
        .insert({
          order_type: "medallion_card",
          status: "waitlist",
          deck_card_id: cardId,
          quantity: 1,
        });
      if (error) {
        toast({ title: "Print request failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Print requested!", description: "Your medallion card is on the waitlist." });
      }
    } catch {
      toast({ title: "Print request failed", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!user?.id || !card) return;
    setSharing(true);
    try {
      const shareUrl = generateShareUrl("deck_card", card.id, user.id);
      await recordShare(user.id, "general", "deck_card", card.id);
      await addToIPLedger("content.created", {
        card_key: cardKey,
        action: "stamp_share",
        message: message.trim() || undefined,
        sharer_id: user.id,
      });
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Share URL is in your clipboard." });
      setOpen(false);
      setMessage("");
    } catch {
      toast({ title: "Share failed", description: "Something went wrong. Try again.", variant: "destructive" });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.6)",
        borderTop: "1px solid rgba(250,245,235,0.08)",
        padding: "0.5rem 0.75rem",
        borderRadius: "0 0 16px 16px",
      }}
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-slate-400 hover:text-emerald-400 transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem" }}
          onClick={() => setOpen(!open)}
        >
          <Share2 className="w-3 h-3 mr-1" />
          Stamp & Share
        </Button>

        <Badge
          variant="outline"
          className="text-[9px] px-1.5 py-0"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: statusColor, borderColor: statusColor }}
        >
          {display.label}
        </Badge>
      </div>

      {/* Catapult Power Gauge — Physical Print Progress */}
      <div className="flex flex-col items-center w-full mt-1">
        <div style={{ transform: "scale(0.55)", transformOrigin: "center top", marginBottom: "-40px" }}>
          <CatapultGauge
            currentCP={(cpMetric as any)?.cp_score ?? 0}
            label={`${cardTitle || cardKey}`}
          />
        </div>
        {(cpMetric as any)?.cp_score >= 100 ? (
          <div className="flex flex-col items-center gap-1">
            <span style={{ fontSize: "0.55rem", color: "#10b981", fontFamily: "'JetBrains Mono', monospace" }}>
              Qualified for physical printing!
            </span>
            <button
              className="px-3 py-1 rounded text-white transition-colors"
              style={{ fontSize: "0.55rem", fontFamily: "'JetBrains Mono', monospace", background: "rgba(16,185,129,0.6)" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.8)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.6)")}
              onClick={handleRequestPrint}
            >
              Request Print
            </button>
          </div>
        ) : (
          <span style={{ fontSize: "0.5rem", color: "rgba(250,245,235,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
            {(cpMetric as any)?.current_value ?? 0} scans of {(cpMetric as any)?.target_value ?? 100} needed
          </span>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="pt-2">
              {!user?.id ? (
                <div className="flex items-center gap-2 py-2" style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.65rem" }}>
                  <Lock className="w-3 h-3" />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Sign in to stamp</span>
                </div>
              ) : (
                <>
                  {/* QR / link display */}
                  {card?.qr_code_data ? (
                    <div className="mb-2 flex justify-center">
                      <img
                        src={card.qr_code_data}
                        alt="QR Code"
                        style={{ width: "80px", height: "80px", borderRadius: "4px", opacity: 0.85 }}
                      />
                    </div>
                  ) : card?.deep_link_url ? (
                    <div
                      className="mb-2 px-2 py-1.5 rounded text-center break-all"
                      style={{
                        background: "rgba(250,245,235,0.04)",
                        border: "1px solid rgba(250,245,235,0.08)",
                        fontSize: "0.55rem",
                        color: "rgba(250,245,235,0.5)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {card.deep_link_url}
                    </div>
                  ) : null}

                  {/* Personal message */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 140))}
                    placeholder="Add a stamp message (optional)"
                    maxLength={140}
                    rows={2}
                    className="w-full rounded px-2 py-1.5 text-xs resize-none outline-none"
                    style={{
                      background: "rgba(250,245,235,0.04)",
                      border: "1px solid rgba(250,245,235,0.1)",
                      color: "rgba(250,245,235,0.8)",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.6rem",
                    }}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <span style={{ fontSize: "0.5rem", color: "rgba(250,245,235,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {message.length}/140
                    </span>
                    <Button
                      size="sm"
                      className="h-6 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem" }}
                      disabled={sharing}
                      onClick={handleShare}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      {sharing ? "Sharing..." : "Share"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
