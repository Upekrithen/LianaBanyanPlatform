/**
 * PrintStudioPage — Design selection, print specs, PDF generation,
 * order submission, volume pool display, and order tracking.
 * Route: /print-studio
 * K396 / B093.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, Download, Package, FileText, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CatapultGauge } from "@/components/catapult/CatapultGauge";
import { jsPDF } from "jspdf";

type CardType = "business_card" | "postcard" | "medallion";
type PaperStock = "standard" | "premium";

interface StampedCard {
  id: string;
  custom_text?: string;
  card_key?: string;
  [key: string]: unknown;
}

interface DeckCardEntry {
  id: string;
  card_id: string;
  deck_cards?: { id: string; title: string; card_key: string; card_type: string } | null;
  [key: string]: unknown;
}

interface PrintOrder {
  id: string;
  order_type: string;
  status: string;
  quantity: number;
  design_data: Record<string, unknown>;
  tracking_number?: string;
  created_at: string;
  member_price?: number;
  credits_charged?: number;
  [key: string]: unknown;
}

const CARD_DIMENSIONS: Record<CardType, { w: number; h: number; label: string }> = {
  business_card: { w: 3.5, h: 2, label: "Business Card (3.5″ × 2″)" },
  postcard: { w: 6, h: 4, label: "Postcard (6″ × 4″)" },
  medallion: { w: 4, h: 4, label: "Coaster / Medallion (4″ round)" },
};

const QUANTITIES = [50, 100, 250, 500, 1000];
const BLEED = 0.125;
const DPI = 300;

const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: "#6b7280",
  pending_approval: "#eab308",
  waitlist: "#eab308",
  batch_ready: "#3b82f6",
  approved: "#22c55e",
  printful_draft: "#22c55e",
  in_production: "#f97316",
  shipped: "#10b981",
  printful_error: "#ef4444",
};

export default function PrintStudioPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<"studio" | "orders">("studio");
  const [stampedCards, setStampedCards] = useState<StampedCard[]>([]);
  const [deckEntries, setDeckEntries] = useState<DeckCardEntry[]>([]);
  const [selectedCard, setSelectedCard] = useState<{ id: string; title: string; type: string } | null>(null);
  const [cardType, setCardType] = useState<CardType>("business_card");
  const [quantity, setQuantity] = useState(100);
  const [paperStock, setPaperStock] = useState<PaperStock>("standard");
  const [baseUnitCost, setBaseUnitCost] = useState(0);
  const [batch, setBatch] = useState<{ current_count: number; threshold: number } | null>(null);
  const [myOrders, setMyOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const pdfDocRef = useRef<jsPDF | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const [stamped, deck, orders] = await Promise.all([
        (supabase as any).from("stamped_cue_cards").select("*").eq("user_id", user.id),
        (supabase as any).from("member_deck").select("*, deck_cards(id, title, card_key, card_type)").eq("member_id", user.id),
        (supabase as any).from("print_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setStampedCards(stamped.data || []);
      setDeckEntries(deck.data || []);
      setMyOrders((orders.data || []) as PrintOrder[]);
      setLoading(false);
    })();
  }, [user?.id]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("print_production_levels")
        .select("*")
        .eq("product_type", cardType)
        .lte("min_quantity", quantity)
        .order("min_quantity", { ascending: false })
        .limit(1);
      setBaseUnitCost(data?.[0]?.unit_cost ?? 0.40);
    })();
  }, [cardType, quantity]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("print_batches")
        .select("*")
        .eq("product_type", cardType)
        .eq("status", "aggregating")
        .maybeSingle();
      setBatch(data);
    })();
  }, [cardType]);

  const memberPrice = baseUnitCost * 1.2;
  const total = memberPrice * quantity;
  const dim = CARD_DIMENSIONS[cardType];
  const trimW = dim.w;
  const trimH = dim.h;
  const bleedW = trimW + 2 * BLEED;
  const bleedH = trimH + 2 * BLEED;

  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: bleedW > bleedH ? "landscape" : "portrait",
      unit: "in",
      format: [bleedW, bleedH],
    });

    doc.setProperties({
      title: `LianaBanyan_PrintReady_${selectedCard?.title ?? "Card"}`,
      subject: "Print-ready card with bleed and crop marks",
      creator: "Liana Banyan Print Studio",
    });

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, bleedW, bleedH, "F");

    doc.setFillColor(30, 41, 59);
    doc.rect(BLEED, BLEED, trimW, trimH, "F");

    doc.setFontSize(14);
    doc.setTextColor(250, 245, 235);
    doc.text(selectedCard?.title ?? "Deck Card", bleedW / 2, bleedH / 2 - 0.2, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Liana Banyan Corporation", bleedW / 2, bleedH / 2 + 0.1, { align: "center" });
    doc.text("lianabanyan.com", bleedW / 2, bleedH / 2 + 0.3, { align: "center" });

    const markLen = 0.125;
    const markOff = 0.0625;
    doc.setLineWidth(0.005);
    doc.setDrawColor(0, 0, 0);
    const corners = [
      { x: BLEED, y: BLEED },
      { x: BLEED + trimW, y: BLEED },
      { x: BLEED, y: BLEED + trimH },
      { x: BLEED + trimW, y: BLEED + trimH },
    ];
    corners.forEach(({ x, y }, i) => {
      const hDir = i % 2 === 0 ? -1 : 1;
      const vDir = i < 2 ? -1 : 1;
      doc.line(x + hDir * markOff, y, x + hDir * (markOff + markLen), y);
      doc.line(x, y + vDir * markOff, x, y + vDir * (markOff + markLen));
    });

    pdfDocRef.current = doc;
    setPdfGenerated(true);
    toast({ title: "PDF generated", description: "Print-ready file with bleed and crop marks is ready." });
  }, [selectedCard, bleedW, bleedH, trimW, trimH, toast]);

  const downloadPDF = useCallback(() => {
    if (!pdfDocRef.current) return;
    pdfDocRef.current.save(`LB_PrintReady_${selectedCard?.title ?? "Card"}_${quantity}x.pdf`);
  }, [selectedCard, quantity]);

  const submitOrder = useCallback(async () => {
    if (!user?.id || !selectedCard) return;
    setSubmitting(true);
    try {
      const { data: order, error } = await (supabase as any)
        .from("print_orders")
        .insert({
          user_id: user.id,
          order_type: cardType,
          quantity,
          default_vendor: cardType === "business_card" ? "moo" : "printful",
          member_price: total,
          platform_margin: total - baseUnitCost * quantity,
          design_data: {
            card_id: selectedCard.id,
            card_type: selectedCard.type,
            bleed: BLEED,
            dpi: DPI,
            dimensions: { trim: { w: trimW, h: trimH }, bleed: { w: bleedW, h: bleedH } },
            paper_stock: paperStock,
          },
          status: "waitlist",
        })
        .select()
        .single();
      if (error) throw error;
      toast({ title: "Order created!", description: `Order #${(order?.id ?? "").slice(0, 8)} is on the waitlist.` });
      setMyOrders((prev) => [order as PrintOrder, ...prev]);
      setTab("orders");
    } catch (err: any) {
      toast({ title: "Order failed", description: err?.message ?? "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }, [user?.id, selectedCard, cardType, quantity, total, baseUnitCost, trimW, trimH, bleedW, bleedH, paperStock, toast]);

  const allCards: Array<{ id: string; title: string; type: string }> = [
    ...stampedCards.map((c) => ({ id: c.id, title: c.custom_text || c.card_key || "Stamped Card", type: "stamped" })),
    ...deckEntries.map((d) => ({
      id: d.deck_cards?.id ?? d.card_id,
      title: d.deck_cards?.title ?? d.deck_cards?.card_key ?? "Deck Card",
      type: d.deck_cards?.card_type ?? "deck",
    })),
  ];

  const batchProgress = batch ? Math.min((batch.current_count / batch.threshold) * 100, 100) : 0;
  const batchRemaining = batch ? Math.max(batch.threshold - batch.current_count, 0) : 50;

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
            🖨️ Print Studio
          </h1>
          <p className="text-sm text-slate-400">Design, proof, and order physical cards with professional print specs.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["studio", "orders"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              {t === "studio" ? (
                <span className="flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" />Studio</span>
              ) : (
                <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />My Orders</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "studio" ? (
            <motion.div key="studio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Section A: Design Selection */}
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />Select a Card Design
                </h2>
                {allCards.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 p-8 text-center">
                    <p className="text-slate-500">Stamp or unlock cards first to print them!</p>
                    <p className="text-xs text-slate-600 mt-1">Visit the Archipelago or use Stamp & Share on any Deck Card.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allCards.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCard(c); setPdfGenerated(false); pdfDocRef.current = null; }}
                        className={`rounded-xl p-3 text-left transition-all ${
                          selectedCard?.id === c.id
                            ? "border-2 border-amber-400 bg-amber-500/10"
                            : "border border-slate-800 bg-slate-900/50 hover:border-slate-600"
                        }`}
                      >
                        <div
                          className="w-full aspect-[5/7] rounded-lg mb-2 flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, rgba(30,41,59,1), rgba(15,23,42,1))", border: "1px solid rgba(250,245,235,0.06)" }}
                        >
                          <span className="text-2xl opacity-60">🃏</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium truncate">{c.title}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{c.type}</p>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Section B: Print Specifications */}
              {selectedCard && (
                <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-200 mb-3">Print Specifications</h2>
                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    {/* Card Type */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Card Type</label>
                      <select
                        value={cardType}
                        onChange={(e) => setCardType(e.target.value as CardType)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                      >
                        {Object.entries(CARD_DIMENSIONS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Quantity</label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                      >
                        {QUANTITIES.map((q) => (
                          <option key={q} value={q}>{q} cards</option>
                        ))}
                      </select>
                    </div>

                    {/* Paper Stock */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Paper Stock</label>
                      <div className="flex gap-2">
                        {(["standard", "premium"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setPaperStock(s)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                              paperStock === s
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "bg-slate-900 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 mb-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Base Cost</p>
                        <p className="text-lg font-bold text-slate-300">${baseUnitCost.toFixed(2)}<span className="text-xs text-slate-500">/unit</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Your Price</p>
                        <p className="text-lg font-bold text-amber-400">${memberPrice.toFixed(2)}<span className="text-xs text-slate-500">/unit</span></p>
                        <p className="text-[9px] text-slate-500">Cost+20%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Total</p>
                        <p className="text-lg font-bold text-emerald-400">${total.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-500">{quantity} cards</p>
                      </div>
                    </div>
                  </div>

                  {/* Print Preview */}
                  <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 mb-4">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Print Preview</h3>
                    <div className="flex justify-center">
                      <div className="relative" style={{ width: `${bleedW * 60}px`, height: `${bleedH * 60}px` }}>
                        {/* Bleed area */}
                        <div
                          className="absolute inset-0 rounded"
                          style={{ border: "2px dashed #ef4444", background: "rgba(15,23,42,0.9)" }}
                        />
                        {/* Trim line */}
                        <div
                          className="absolute rounded"
                          style={{
                            top: `${BLEED * 60}px`, left: `${BLEED * 60}px`,
                            width: `${trimW * 60}px`, height: `${trimH * 60}px`,
                            border: "2px solid rgba(250,245,235,0.4)",
                            background: "rgba(30,41,59,1)",
                          }}
                        />
                        {/* Safe zone */}
                        <div
                          className="absolute rounded"
                          style={{
                            top: `${BLEED * 2 * 60}px`, left: `${BLEED * 2 * 60}px`,
                            width: `${(trimW - 2 * BLEED) * 60}px`, height: `${(trimH - 2 * BLEED) * 60}px`,
                            border: "1px dashed #3b82f6",
                          }}
                        />
                        {/* Card content placeholder */}
                        <div
                          className="absolute flex flex-col items-center justify-center text-center"
                          style={{
                            top: `${BLEED * 60}px`, left: `${BLEED * 60}px`,
                            width: `${trimW * 60}px`, height: `${trimH * 60}px`,
                          }}
                        >
                          <span className="text-lg">🃏</span>
                          <p className="text-[9px] text-slate-300 mt-1 truncate max-w-[90%]">{selectedCard.title}</p>
                        </div>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-[9px]"><span className="w-3 h-0.5 bg-red-500 inline-block" />Bleed</span>
                      <span className="flex items-center gap-1 text-[9px]"><span className="w-3 h-0.5 inline-block" style={{ background: "rgba(250,245,235,0.4)" }} />Trim</span>
                      <span className="flex items-center gap-1 text-[9px]"><span className="w-3 h-0.5 bg-blue-500 inline-block" />Safe Zone</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={generatePDF} className="bg-amber-600 hover:bg-amber-500 text-white">
                      <FileText className="w-4 h-4 mr-2" />Generate Print PDF
                    </Button>
                    {pdfGenerated && (
                      <Button onClick={downloadPDF} variant="outline" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                        <Download className="w-4 h-4 mr-2" />Download PDF
                      </Button>
                    )}
                    <Button onClick={submitOrder} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                      <ShoppingCart className="w-4 h-4 mr-2" />{submitting ? "Submitting..." : "Submit Order"}
                    </Button>
                  </div>
                </motion.section>
              )}

              {/* Section E: Volume Pool Display */}
              <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <h2 className="text-lg font-semibold text-slate-200 mb-3">Volume Pool</h2>
                <div style={{ transform: "scale(0.7)", transformOrigin: "center top", marginBottom: "-30px" }}>
                  <CatapultGauge currentCP={batchProgress} label={`${CARD_DIMENSIONS[cardType].label} Batch`} />
                </div>
                {batch && batchProgress >= 100 ? (
                  <p className="text-sm text-emerald-400 text-center font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Volume threshold reached! Batch pricing unlocked.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {batch ? `${batch.current_count} of ${batch.threshold} cards in this batch — ${batchRemaining} more to hit volume pricing!` : "No active batch yet. Your order starts one."}
                  </p>
                )}
              </section>
            </motion.div>
          ) : (
            /* ── My Orders Tab ── */
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {myOrders.length === 0 ? (
                <div className="rounded-xl border border-slate-800 p-12 text-center">
                  <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No orders yet. Create one in the Studio tab!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 font-mono">#{order.id.slice(0, 8)}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2"
                          style={{ color: ORDER_STATUS_COLORS[order.status] ?? "#6b7280", borderColor: ORDER_STATUS_COLORS[order.status] ?? "#6b7280" }}
                        >
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-200">{(order.order_type ?? "").replace(/_/g, " ")} × {order.quantity}</p>
                          <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          {order.member_price != null && (
                            <p className="text-sm text-amber-400 font-medium">${Number(order.member_price).toFixed(2)}</p>
                          )}
                          {order.tracking_number && (
                            <p className="text-xs text-emerald-400 mt-0.5">
                              {order.tracking_number.startsWith("http") ? (
                                <a href={order.tracking_number} target="_blank" rel="noopener noreferrer" className="underline">Track</a>
                              ) : order.tracking_number}
                            </p>
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
          Liana Banyan Print Studio — Cost+20% · Creator keeps 83.3%
        </div>
      </div>
    </div>
  );
}
