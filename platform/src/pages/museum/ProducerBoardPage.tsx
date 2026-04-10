/**
 * ProducerBoardPage — Browse and claim print orders as a local producer.
 * Two tabs: Available Orders + My Claimed Orders.
 * Route: /producer-board
 * K397 / B093.
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Truck, Factory, Clipboard, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PrintOrder {
  id: string;
  user_id: string;
  order_type: string;
  status: string;
  quantity: number;
  member_price?: number;
  platform_margin?: number;
  default_vendor?: string;
  design_data: Record<string, unknown>;
  shipping_address?: Record<string, unknown>;
  tracking_number?: string;
  producer_id?: string;
  producer_claimed_at?: string;
  created_at: string;
  [key: string]: unknown;
}

interface ProducerProfile {
  id: string;
  user_id: string;
  status: string;
  capabilities: string[];
  business_name: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#6b7280",
  waitlist: "#eab308",
  batch_ready: "#3b82f6",
  approved: "#22c55e",
  in_production: "#f97316",
  shipped: "#10b981",
  pending_approval: "#eab308",
};

const TYPE_LABELS: Record<string, string> = {
  business_card: "Business Card",
  postcard: "Postcard",
  medallion: "Medallion",
  tshirt: "T-Shirt",
  mug: "Mug",
  sticker: "Sticker",
  poster: "Poster",
};

const TYPE_EMOJIS: Record<string, string> = {
  business_card: "🃏",
  postcard: "📬",
  medallion: "🪙",
  tshirt: "👕",
  mug: "☕",
  sticker: "🏷️",
  poster: "🖼️",
};

const TYPE_TO_CAPABILITY: Record<string, string> = {
  business_card: "business_cards",
  postcard: "postcards",
  tshirt: "tshirts",
  mug: "mugs",
  medallion: "medallions",
  sticker: "stickers",
  poster: "posters",
};

export default function ProducerBoardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<"available" | "claimed">("available");
  const [producerProfile, setProducerProfile] = useState<ProducerProfile | null>(null);
  const [availableOrders, setAvailableOrders] = useState<PrintOrder[]>([]);
  const [claimedOrders, setClaimedOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }

    const [profileRes, availableRes, claimedRes] = await Promise.all([
      (supabase as any)
        .from("producer_profiles")
        .select("id, user_id, status, capabilities, business_name")
        .eq("user_id", user.id)
        .maybeSingle(),
      (supabase as any)
        .from("print_orders")
        .select("*")
        .in("status", ["waitlist", "batch_ready"])
        .is("producer_id", null)
        .order("created_at", { ascending: true }),
      (supabase as any)
        .from("print_orders")
        .select("*")
        .eq("producer_id", user.id)
        .order("producer_claimed_at", { ascending: false }),
    ]);

    if (profileRes.data) setProducerProfile(profileRes.data as ProducerProfile);
    setAvailableOrders((availableRes.data || []) as PrintOrder[]);
    setClaimedOrders((claimedRes.data || []) as PrintOrder[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isActiveProducer = producerProfile?.status === "active";

  const filteredAvailable = producerProfile?.capabilities?.length
    ? availableOrders.filter((o) => {
        const cap = TYPE_TO_CAPABILITY[o.order_type];
        return !cap || producerProfile.capabilities.includes(cap);
      })
    : availableOrders;

  const handleClaim = useCallback(async (orderId: string) => {
    if (!user?.id) return;
    setProcessing(orderId);
    try {
      const { error } = await (supabase as any)
        .from("print_orders")
        .update({
          producer_id: user.id,
          producer_claimed_at: new Date().toISOString(),
          default_vendor: "other",
        })
        .eq("id", orderId)
        .is("producer_id", null);

      if (error) {
        toast({ title: "Claim failed", description: "Order may have been claimed by another producer.", variant: "destructive" });
        return;
      }
      toast({ title: "Order claimed!", description: 'Check your "My Claimed Orders" tab.' });
      await fetchData();
      setTab("claimed");
    } finally {
      setProcessing(null);
    }
  }, [user?.id, toast, fetchData]);

  const handleMarkInProduction = useCallback(async (orderId: string) => {
    if (!user?.id) return;
    setProcessing(orderId);
    try {
      await (supabase as any)
        .from("print_orders")
        .update({ status: "in_production" })
        .eq("id", orderId)
        .eq("producer_id", user.id);
      toast({ title: "In production", description: "Order marked as in production." });
      await fetchData();
    } finally {
      setProcessing(null);
    }
  }, [user?.id, toast, fetchData]);

  const handleMarkShipped = useCallback(async (orderId: string) => {
    if (!user?.id) return;
    const tracking = trackingInputs[orderId]?.trim();
    if (!tracking) {
      toast({ title: "Enter tracking number", variant: "destructive" });
      return;
    }
    setProcessing(orderId);
    try {
      await (supabase as any)
        .from("print_orders")
        .update({ status: "shipped", tracking_number: tracking })
        .eq("id", orderId)
        .eq("producer_id", user.id);
      toast({ title: "Shipped!", description: "Order marked as shipped." });
      setTrackingInputs((prev) => { const next = { ...prev }; delete next[orderId]; return next; });
      await fetchData();
    } finally {
      setProcessing(null);
    }
  }, [user?.id, trackingInputs, toast, fetchData]);

  const getLocationLabel = (order: PrintOrder) => {
    const addr = order.shipping_address;
    if (!addr) return null;
    const parts = [addr.city as string, addr.state as string].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  const getEstimatedPayout = (order: PrintOrder) => {
    const price = Number(order.member_price ?? 0);
    const margin = Number(order.platform_margin ?? 0);
    return Math.max(price - margin, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1" style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}>
            <Factory className="w-6 h-6 inline-block mr-2 mb-1" />
            Producer Board
          </h1>
          <p className="text-sm text-slate-400">Browse and claim print orders from the community.</p>
        </div>

        {/* Not a producer banner */}
        {!producerProfile && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6 flex items-center justify-between">
            <p className="text-sm text-amber-400">
              Want to claim orders? Become a Producer first.
            </p>
            <Link to="/become-a-producer">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white text-xs">
                Apply Now
              </Button>
            </Link>
          </div>
        )}

        {producerProfile && !isActiveProducer && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 mb-6">
            <p className="text-sm text-slate-400">
              Your producer application is <span className="text-amber-400 font-medium">{producerProfile.status}</span>.
              You can browse orders but cannot claim until approved.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "available" as const, icon: <Clipboard className="w-3.5 h-3.5" />, label: "Available Orders", count: filteredAvailable.length },
            { key: "claimed" as const, icon: <Truck className="w-3.5 h-3.5" />, label: "My Claimed Orders", count: claimedOrders.length },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                tab === t.key ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              {t.icon}{t.label}
              {t.count > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "available" ? (
            <motion.div key="available" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {filteredAvailable.length === 0 ? (
                <div className="rounded-xl border border-slate-800 p-12 text-center">
                  <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No orders available right now. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAvailable.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{TYPE_EMOJIS[order.order_type] ?? "📦"}</span>
                            <span className="text-sm font-medium text-slate-200">
                              {TYPE_LABELS[order.order_type] ?? order.order_type.replace(/_/g, " ")}
                            </span>
                            <Badge variant="outline" className="text-[10px]" style={{ color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }}>
                              {order.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                            <span>Qty: <span className="text-slate-300">{order.quantity}</span></span>
                            {getLocationLabel(order) && (
                              <span>Ships to: <span className="text-slate-300">{getLocationLabel(order)}</span></span>
                            )}
                            <span>Payout: <span className="text-emerald-400 font-medium">${getEstimatedPayout(order).toFixed(2)}</span></span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          disabled={!isActiveProducer || processing === order.id}
                          onClick={() => handleClaim(order.id)}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs shrink-0"
                          title={!isActiveProducer ? "Active producer profile required" : "Claim this order"}
                        >
                          {processing === order.id ? "..." : "Claim This Order"}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="claimed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {claimedOrders.length === 0 ? (
                <div className="rounded-xl border border-slate-800 p-12 text-center">
                  <Truck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">You have not claimed any orders yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Browse available orders to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claimedOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{TYPE_EMOJIS[order.order_type] ?? "📦"}</span>
                            <span className="text-sm font-medium text-slate-200">
                              {TYPE_LABELS[order.order_type] ?? order.order_type.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">#{order.id.slice(0, 8)}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                            style={{ color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }}
                          >
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Qty: <span className="text-slate-300">{order.quantity}</span></span>
                          <span>Payout: <span className="text-emerald-400 font-medium">${getEstimatedPayout(order).toFixed(2)}</span></span>
                          {order.producer_claimed_at && (
                            <span>Claimed: {new Date(order.producer_claimed_at).toLocaleDateString()}</span>
                          )}
                          {getLocationLabel(order) && (
                            <span>Ships to: {getLocationLabel(order)}</span>
                          )}
                        </div>

                        {/* Action buttons based on status */}
                        <div className="flex items-center gap-2 mt-1">
                          {order.status === "approved" && (
                            <Button
                              size="sm"
                              disabled={processing === order.id}
                              onClick={() => handleMarkInProduction(order.id)}
                              className="bg-orange-600 hover:bg-orange-500 text-white text-xs"
                            >
                              {processing === order.id ? "..." : "Mark In Production"}
                            </Button>
                          )}

                          {order.status === "in_production" && (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                value={trackingInputs[order.id] ?? ""}
                                onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                                placeholder="Tracking number"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/60 transition-colors"
                              />
                              <Button
                                size="sm"
                                disabled={processing === order.id}
                                onClick={() => handleMarkShipped(order.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs shrink-0"
                              >
                                <Send className="w-3 h-3 mr-1" />
                                {processing === order.id ? "..." : "Mark Shipped"}
                              </Button>
                            </div>
                          )}

                          {order.status === "shipped" && order.tracking_number && (
                            <p className="text-xs text-emerald-400">
                              Tracking: {order.tracking_number.startsWith("http") ? (
                                <a href={order.tracking_number} target="_blank" rel="noopener noreferrer" className="underline">{order.tracking_number}</a>
                              ) : (
                                <span className="font-mono">{order.tracking_number}</span>
                              )}
                            </p>
                          )}

                          {(order.status === "waitlist" || order.status === "batch_ready") && (
                            <p className="text-xs text-slate-500">Awaiting founder approval before production.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center text-slate-600 text-xs">
          Liana Banyan Producer Network — Cost+20% · Creator keeps 83.3%
        </div>
      </div>
    </div>
  );
}
