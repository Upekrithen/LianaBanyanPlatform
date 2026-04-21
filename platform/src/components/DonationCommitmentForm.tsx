import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  DollarSign,
  Calendar,
  Repeat,
  PiggyBank,
  Percent,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  Trash2,
} from "lucide-react";

type CommitmentType = "lump_sum" | "recurring" | "pool" | "percentage";

interface DonationCommitment {
  id: string;
  type: CommitmentType;
  amount: number;
  frequency?: string;
  target_type: string;
  target_id?: string;
  target_name?: string;
  category?: string;
  status: "active" | "paused" | "exhausted" | "cancelled";
  total_donated: number;
  remaining_pool?: number;
  created_at: string;
  next_charge_date?: string;
}

const COMMITMENT_TYPES = [
  {
    id: "lump_sum",
    name: "One-Time Donation",
    icon: DollarSign,
    description: "Single donation to a specific project or general fund",
    color: "bg-green-100 text-green-700",
  },
  {
    id: "recurring",
    name: "Monthly Commitment",
    icon: Repeat,
    description: "Recurring donation with full control to pause or change anytime",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "pool",
    name: "Donation Pool",
    icon: PiggyBank,
    description: "Set aside a larger sum to be used for approved causes until exhausted",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "percentage",
    name: "Project Percentage",
    icon: Percent,
    description: "Commit a percentage of your project earnings to causes you choose",
    color: "bg-amber-100 text-amber-700",
  },
];

const TARGET_TYPES = [
  { value: "specific_project", label: "Specific Project" },
  { value: "general_fund", label: "General Swoop Fund" },
  { value: "category", label: "Category (e.g., Medical, Housing)" },
];

const CATEGORIES = [
  { value: "medical", label: "Medical Crisis" },
  { value: "housing", label: "Housing Emergency" },
  { value: "utilities", label: "Utility Assistance" },
  { value: "food", label: "Food Security" },
  { value: "education", label: "Education Support" },
  { value: "any", label: "Any Approved Cause" },
];

const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 Weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

export function DonationCommitmentForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CommitmentType>("lump_sum");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [targetType, setTargetType] = useState("general_fund");
  const [category, setCategory] = useState("any");
  const [projectId, setProjectId] = useState("");
  const [percentageAmount, setPercentageAmount] = useState("5");
  const [alertBeforeCharge, setAlertBeforeCharge] = useState(true);

  const { data: activeCommitments } = useQuery({
    queryKey: ["donation-commitments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("donation_commitments")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DonationCommitment[];
    },
    enabled: !!user,
  });

  const { data: activeProjects } = useQuery({
    queryKey: ["swoop-projects-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swoop_projects")
        .select("id, title, slug")
        .in("status", ["active", "voting"])
        .order("vote_count", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const createCommitment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const commitment = {
        user_id: user.id,
        type: selectedType,
        amount: parseFloat(amount) || 0,
        frequency: selectedType === "recurring" ? frequency : null,
        target_type: targetType,
        target_id: targetType === "specific_project" ? projectId : null,
        category: targetType === "category" ? category : null,
        status: "active",
        total_donated: 0,
        remaining_pool: selectedType === "pool" ? parseFloat(amount) : null,
        alert_before_charge: alertBeforeCharge,
        percentage_amount: selectedType === "percentage" ? parseFloat(percentageAmount) : null,
      };

      const { data, error } = await supabase
        .from("donation_commitments")
        .insert(commitment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Donation commitment created!");
      queryClient.invalidateQueries({ queryKey: ["donation-commitments"] });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create commitment: ${error.message}`);
    },
  });

  const updateCommitmentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("donation_commitments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Commitment updated");
      queryClient.invalidateQueries({ queryKey: ["donation-commitments"] });
    },
  });

  const resetForm = () => {
    setSelectedType("lump_sum");
    setAmount("");
    setFrequency("monthly");
    setTargetType("general_fund");
    setCategory("any");
    setProjectId("");
    setPercentageAmount("5");
    setAlertBeforeCharge(true);
  };

  const getTypeInfo = (type: CommitmentType) => {
    return COMMITMENT_TYPES.find((t) => t.id === type);
  };

  return (
    <div className="space-y-6">
      {/* Active Commitments */}
      {activeCommitments && activeCommitments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Your Active Commitments
            </CardTitle>
            <CardDescription>
              Manage your ongoing donation commitments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCommitments.map((commitment) => {
              const typeInfo = getTypeInfo(commitment.type);
              const TypeIcon = typeInfo?.icon || Heart;

              return (
                <div
                  key={commitment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${typeInfo?.color}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{typeInfo?.name}</span>
                        <Badge variant={commitment.status === "active" ? "default" : "secondary"}>
                          {commitment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {commitment.type === "recurring" && (
                          <>${commitment.amount}/{commitment.frequency}</>
                        )}
                        {commitment.type === "lump_sum" && (
                          <>${commitment.amount} one-time</>
                        )}
                        {commitment.type === "pool" && (
                          <>${commitment.remaining_pool?.toFixed(2)} remaining of ${commitment.amount}</>
                        )}
                        {commitment.type === "percentage" && (
                          <>{commitment.amount}% of project earnings</>
                        )}
                        {" • "}
                        {commitment.target_type === "specific_project"
                          ? commitment.target_name
                          : commitment.target_type === "category"
                          ? `${commitment.category} causes`
                          : "General Fund"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total donated: ${commitment.total_donated.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {commitment.status === "active" && commitment.type === "recurring" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateCommitmentStatus.mutate({ id: commitment.id, status: "paused" })}
                        aria-label="Pause donation"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    {commitment.status === "paused" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateCommitmentStatus.mutate({ id: commitment.id, status: "active" })}
                        aria-label="Resume donation"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => updateCommitmentStatus.mutate({ id: commitment.id, status: "cancelled" })}
                      aria-label="Cancel donation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Create New Commitment */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-rose-600 hover:bg-rose-700">
            <Heart className="w-4 h-4 mr-2" />
            Create Donation Commitment
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Donation Commitment</DialogTitle>
            <DialogDescription>
              Choose how you'd like to support the community
            </DialogDescription>
          </DialogHeader>

          <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as CommitmentType)}>
            <TabsList className="grid grid-cols-4 w-full">
              {COMMITMENT_TYPES.map((type) => (
                <TabsTrigger key={type.id} value={type.id} className="text-xs">
                  <type.icon className="w-4 h-4 mr-1" />
                  {type.name.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Type 1: Lump Sum */}
            <TabsContent value="lump_sum" className="space-y-4 mt-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-green-800">
                    <strong>One-Time Donation:</strong> Make a single donation to a specific project or the general fund.
                  </p>
                </CardContent>
              </Card>

              <div>
                <Label>Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    className="pl-10"
                    placeholder="50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Donate To</Label>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {targetType === "specific_project" && (
                <div>
                  <Label>Select Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeProjects?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {targetType === "category" && (
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            {/* Type 2: Recurring */}
            <TabsContent value="recurring" className="space-y-4 mt-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Monthly Commitment:</strong> Set up recurring donations with full control.
                    Pause, change, or cancel anytime. We'll always ask before charging.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-10"
                      placeholder="25"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Donate To</Label>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {targetType === "category" && (
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label>Alert Before Charging</Label>
                  <p className="text-xs text-muted-foreground">
                    We'll notify you before each charge (recommended)
                  </p>
                </div>
                <Switch
                  checked={alertBeforeCharge}
                  onCheckedChange={setAlertBeforeCharge}
                />
              </div>
            </TabsContent>

            {/* Type 3: Pool */}
            <TabsContent value="pool" className="space-y-4 mt-4">
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-purple-800">
                    <strong>Donation Pool:</strong> Set aside a larger sum that will be used for approved causes
                    until exhausted. When it runs out, we'll ask if you want to replenish.
                  </p>
                </CardContent>
              </Card>

              <div>
                <Label>Pool Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    className="pl-10"
                    placeholder="500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This amount will be drawn from as causes are approved
                </p>
              </div>

              <div>
                <Label>Use For</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Type 4: Percentage */}
            <TabsContent value="percentage" className="space-y-4 mt-4">
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-amber-800">
                    <strong>Project Percentage:</strong> Commit a percentage of your project earnings
                    to causes you choose. Automatically calculated from your revenue.
                  </p>
                </CardContent>
              </Card>

              <div>
                <Label>Percentage of Earnings</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="5"
                    value={percentageAmount}
                    onChange={(e) => setPercentageAmount(e.target.value)}
                  />
                  <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This percentage will be calculated from your project revenue
                </p>
              </div>

              <div>
                <Label>Donate To</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createCommitment.mutate()}
              disabled={createCommitment.isPending || !amount}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {createCommitment.isPending ? "Creating..." : "Create Commitment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DonationCommitmentForm;
