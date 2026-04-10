/**
 * PrintApprovalPage — Founder-only approval dashboard for print orders.
 * Lists pending/waitlist orders, approve or reject with reason.
 * Batch aggregation view grouped by product type.
 * Route: /print-approval
 * K396 / B093.
 */
import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { approvePrintOrder } from "@/lib/services/printOrderService";

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
  vendor_data?: Record<string, unknown>;
  created_at: string;
  [key: string]: unknown;
}

interface BatchInfo {
  id: string;
  product_type: string;
  status: string;
  threshold: number;
  current_count: number;
  base_unit_cost: number;
  final_unit_cost: number;
}

const STATUS_COLORS: Record<string, string> = {
  waitlist: "#eab308",
  batch_ready: "#3b82f6",
  pending_approval: "#eab308",
  approved: "#22c55e",
  in_production: "#f97316",
};

export default function PrintApprovalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) { setIsAdmin(false); setLoading(false); return; }
    (async () => {
      const { data: roles } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = roles?.some((r: { role: string }) => r.role === "admin" || r.role === "founder") ?? false;
      setIsAdmin(admin);
      if (!admin) { setLoading(false); return; }

      const [ordersRes, batchesRes] = await Promise.all([
        (supabase as any)
          .from("print_orders")
          .select("*")
          .in("status", ["waitlist", "batch_ready", "pending_approval"])
          .order("created_at", { ascending: true }),
        (supabase as any)
          .from("print_batches")
          .select("*")
          .in("status", ["aggregating", "threshold_met", "approved"]),
      ]);
      setOrders((ordersRes.data || []) as PrintOrder[]);
      setBatches((batchesRes.data || []) as BatchInfo[]);
      setLoading(false);
    })();
  }, [user?.id]);

  const handleApprove = useCallback(async (orderId: string) => {
    if (!user?.id) return;
    setProcessing(orderId);
    try {
      await approvePrintOrder(orderId, user.id);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast({ title: "Order approved", description: `Order #${orderId.slice(0, 8)} submitted to vendor.` });
    } catch (err: any) {
      toast({ title: "Approval failed", description: err?.message ?? "Something went wrong.", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  }, [user?.id, toast]);

  const handleReject = useCallback(async (orderId: string) => {
    setProcessing(orderId);
    try {
      await (supabase as any)
        .from("print_orders")
        .update({ status: "draft", vendor_data: { rejection_reason: rejectReason.trim() || "No reason given" } })
        .eq("id", orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setRejectingId(null);
      setRejectReason("");
      toast({ title: "Order rejected", description: `Order #${orderId.slice(0, 8)} returned to draft.` });
    } catch (err: any) {
      toast({ title: "Rejection failed", description: err?.message ?? "Something went wrong.", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  }, [rejectReason, toast]);

  if (isAdmin === false) return <Navigate to="/" replace />;
  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-400" />
      </div>
    );
  }

  const ordersByType: Record<string, PrintOrder[]> = {};
  orders.forEach((o) => {
    const key = o.order_type || "other";
    (ordersByType[key] ??= []).push(o);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-amber-400" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-400" style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}>
              Print Approval Dashboard
            </h1>
            <p className="text-sm text-slate-400">Founder review — approve or reject pending print orders.</p>
          </div>
        </div>

        {/* Batch Aggregation */}
        {batches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-200 mb-3">Active Batches</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((b) => (
                <div key={b.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{b.product_type.replace(/_/g, " ")}</span>
                    <Badge variant="outline" className="text-[10px]" style={{ color: STATUS_COLORS[b.status] ?? "#6b7280", borderColor: STATUS_COLORS[b.status] ?? "#6b7280" }}>
                      {b.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((b.current_count / b.threshold) * 100, 100)}%`, background: "linear-gradient(90deg, #d97706, #f59e0b)" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{b.current_count} / {b.threshold} units</span>
                    <span>${b.base_unit_cost?.toFixed(2) ?? "?"} → ${b.final_unit_cost?.toFixed(2) ?? "?"}/unit</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pending Orders */}
        <section>
          <h2 className="text-lg font-semibold text-slate-200 mb-3">Pending Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <div className="rounded-xl border border-slate-800 p-12 text-center">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No orders awaiting approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {orders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500 font-mono">#{order.id.slice(0, 8)}</span>
                          <Badge variant="outline" className="text-[10px]" style={{ color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }}>
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-[10px] text-slate-600">{order.default_vendor ?? "auto"}</span>
                        </div>
                        <p className="text-sm text-slate-200">{(order.order_type ?? "").replace(/_/g, " ")} × {order.quantity}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs text-slate-500">Cost: ${Number(order.member_price ?? 0).toFixed(2)}</span>
                          <span className="text-xs text-emerald-500">Margin: ${Number(order.platform_margin ?? 0).toFixed(2)}</span>
                          <span className="text-xs text-slate-600">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1">User: {order.user_id?.slice(0, 12)}...</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rejectingId === order.id ? (
                          <div className="flex flex-col gap-1.5">
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Rejection reason..."
                              rows={2}
                              className="w-48 rounded px-2 py-1 text-xs bg-slate-800 border border-slate-700 text-slate-200 resize-none outline-none"
                            />
                            <div className="flex gap-1">
                              <Button size="sm" variant="destructive" className="h-6 text-xs" disabled={processing === order.id} onClick={() => handleReject(order.id)}>
                                Confirm
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 text-xs text-slate-400" onClick={() => { setRejectingId(null); setRejectReason(""); }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                              disabled={processing === order.id}
                              onClick={() => handleApprove(order.id)}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              {processing === order.id ? "..." : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs"
                              onClick={() => setRejectingId(order.id)}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        <div className="mt-12 text-center text-slate-600 text-xs">
          Liana Banyan Print Pipeline — Founder Approval Required · Cost+20%
        </div>
      </div>
    </div>
  );
}
