/**
 * B2BContracts — /b2b-contracts on .net
 * Inter-business contract management with creation and status tracking.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FileText, Plus, Loader2, CheckCircle2,
  Clock, XCircle, Send, DollarSign
} from "lucide-react";

interface ContractRow {
  id: string;
  title: string;
  description: string | null;
  contract_type: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  total_value_cents: number | null;
  created_at: string;
  provider_id: string;
  client_id: string;
}

const CONTRACT_TYPES = [
  { value: "production", label: "Production" },
  { value: "supply", label: "Supply" },
  { value: "service", label: "Service" },
  { value: "coalition", label: "Coalition" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500",
  proposed: "bg-blue-500",
  active: "bg-green-600",
  completed: "bg-violet-500",
  cancelled: "bg-red-500",
};

export default function B2BContracts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "production", value: "" });

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["b2b-contracts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("b2b_contracts" as never)
        .select("*")
        .order("created_at", { ascending: false }) as { data: ContractRow[] | null; error: unknown };
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createContract = useMutation({
    mutationFn: async () => {
      if (!user?.id || !form.title) throw new Error("Title required");
      const { error } = await supabase.from("b2b_contracts" as never).insert({
        provider_id: user.id,
        client_id: user.id,
        title: form.title,
        description: form.description || null,
        contract_type: form.type,
        total_value_cents: form.value ? Math.round(parseFloat(form.value) * 100) : null,
        status: "draft",
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contract draft created");
      setForm({ title: "", description: "", type: "production", value: "" });
      setShowCreate(false);
      qc.invalidateQueries({ queryKey: ["b2b-contracts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = contracts.filter((c) => c.status === "active");
  const totalValue = contracts
    .filter((c) => c.status === "active")
    .reduce((s, c) => s + (c.total_value_cents || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" /> B2B Contracts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Inter-business agreements across the Liana Banyan network.
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Contract
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{contracts.length}</p><p className="text-xs text-muted-foreground">Total Contracts</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-500">{active.length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">${(totalValue / 100).toLocaleString()}</p><p className="text-xs text-muted-foreground">Active Value</p></CardContent></Card>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-violet-500/30">
          <CardHeader>
            <CardTitle className="text-base">Create Contract Draft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="contract-title">Title</Label>
              <Input id="contract-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Production agreement for SlottedTop hinges" />
            </div>
            <div>
              <Label htmlFor="contract-desc">Description</Label>
              <Textarea id="contract-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Terms, scope, and delivery expectations..." rows={3} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label>Type</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CONTRACT_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      onClick={() => setForm((f) => ({ ...f, type: ct.value }))}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${form.type === ct.value ? "bg-violet-500/20 border-violet-500 text-violet-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-40">
                <Label htmlFor="contract-value">Value ($)</Label>
                <Input id="contract-value" type="number" min="0" step="0.01" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="5000" />
              </div>
            </div>
            <Button onClick={() => createContract.mutate()} disabled={!form.title || createContract.isPending} className="w-full">
              {createContract.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Create Draft</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contract List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground">No contracts yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first B2B contract to start coordinating with network partners.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {contracts.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{c.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    <span className="capitalize">{c.contract_type || "general"}</span>
                    {c.total_value_cents && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${(c.total_value_cents / 100).toLocaleString()}</span>
                    )}
                    {c.start_date && <span><Clock className="w-3 h-3 inline mr-0.5" />{new Date(c.start_date).toLocaleDateString()} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : "ongoing"}</span>}
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge className={`${STATUS_COLORS[c.status] || "bg-gray-500"} text-white text-[10px] shrink-0`}>
                  {c.status === "active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {c.status === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
                  {c.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
