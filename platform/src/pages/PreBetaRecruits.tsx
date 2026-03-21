import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, CheckCircle, Star } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const POSITION_CATEGORIES = [
  { value: "create_idea" as const, label: "Ideation & Creation" },
  { value: "define_describe_document" as const, label: "Documentation" },
  { value: "research_development" as const, label: "Research & Development" },
  { value: "prototype" as const, label: "Prototyping & Engineering" },
  { value: "legal_services" as const, label: "Legal Services" },
  { value: "logistics_blockchain" as const, label: "Logistics & Blockchain" },
  { value: "steward_owner" as const, label: "Stewardship & Leadership" },
  { value: "marketing_services" as const, label: "Marketing & Sales" },
  { value: "accounting_services" as const, label: "Accounting & Finance" },
  { value: "hr_staffing" as const, label: "HR & Staffing" },
  { value: "materials_sourcing" as const, label: "Materials & Sourcing" },
  { value: "manufacture_assembly" as const, label: "Manufacturing & Assembly" },
  { value: "kickstarter_campaign" as const, label: "Crowdfunding Campaign" },
  { value: "it_services" as const, label: "IT Services" },
  { value: "delivery" as const, label: "Delivery & Distribution" }
];

const STATUS_COLORS = {
  no_contact: "bg-gray-500",
  contacted: "bg-blue-500",
  responded: "bg-yellow-500",
  signed_up: "bg-green-500",
  endorsed: "bg-purple-500"
};

export default function PreBetaRecruits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddingRecruit, setIsAddingRecruit] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    field_category: "",
    contact_info: { email: "", social: "", youtube: "" },
    priority_rank: 1,
    notes: "",
    endorsement_value: ""
  });

  const { data: recruits, isLoading } = useQuery({
    queryKey: ["pre-beta-recruits", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("pre_beta_recruits")
        .select("*")
        .order("priority_rank", { ascending: true })
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("field_category", selectedCategory as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const addRecruitMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("pre_beta_recruits")
        .insert({
          ...data,
          created_by: user.user?.id
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-beta-recruits"] });
      toast({ title: "Recruit added successfully" });
      setIsAddingRecruit(false);
      setFormData({
        name: "",
        field_category: "",
        contact_info: { email: "", social: "", youtube: "" },
        priority_rank: 1,
        notes: "",
        endorsement_value: ""
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updateData: any = { status };
      if (status !== "no_contact") {
        updateData.last_contact_at = new Date().toISOString();
      }
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      const { error } = await supabase
        .from("pre_beta_recruits")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-beta-recruits"] });
      toast({ title: "Status updated" });
    }
  });

  const groupedByCategory = recruits?.reduce((acc: any, recruit: any) => {
    if (!acc[recruit.field_category]) {
      acc[recruit.field_category] = [];
    }
    acc[recruit.field_category].push(recruit);
    return acc;
  }, {});

  return (
    <PortalPageLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pre-Beta Recruits</h1>
          <p className="text-muted-foreground">Track notable scions to recruit for LB endorsement & asset contribution</p>
        </div>
        <Dialog open={isAddingRecruit} onOpenChange={setIsAddingRecruit}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Recruit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Pre-Beta Recruit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Nguyen Duc Thang"
                />
              </div>
              <div>
                <Label>Field Category</Label>
                <Select
                  value={formData.field_category}
                  onValueChange={(value) => setFormData({ ...formData, field_category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority Rank (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={formData.priority_rank}
                  onChange={(e) => setFormData({ ...formData, priority_rank: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.contact_info.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact_info: { ...formData.contact_info, email: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Social/Website</Label>
                  <Input
                    value={formData.contact_info.social}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact_info: { ...formData.contact_info, social: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>YouTube</Label>
                  <Input
                    value={formData.contact_info.youtube}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact_info: { ...formData.contact_info, youtube: e.target.value }
                    })}
                    placeholder="@channel"
                  />
                </div>
              </div>
              <div>
                <Label>Endorsement Value</Label>
                <Textarea
                  value={formData.endorsement_value}
                  onChange={(e) => setFormData({ ...formData, endorsement_value: e.target.value })}
                  placeholder="What they bring: designs, market access, credibility, etc."
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Outreach notes, response details, etc."
                />
              </div>
              <Button
                onClick={() => addRecruitMutation.mutate(formData)}
                disabled={!formData.name || !formData.field_category}
              >
                Add Recruit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {POSITION_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
              {groupedByCategory?.[cat.value] && (
                <Badge variant="secondary" className="ml-2">
                  {groupedByCategory[cat.value].length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid gap-4">
              {recruits?.map((recruit: any) => (
                <Card key={recruit.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {recruit.name}
                          <Badge variant="outline">Rank {recruit.priority_rank}</Badge>
                          {recruit.status === "endorsed" && <Star className="w-4 h-4 text-yellow-500" />}
                        </CardTitle>
                        <CardDescription>
                          {recruit.field_category.charAt(0).toUpperCase() + recruit.field_category.slice(1)}
                        </CardDescription>
                      </div>
                      <Badge className={(STATUS_COLORS as any)[recruit.status]}>
                        {recruit.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recruit.endorsement_value && (
                      <div>
                        <p className="text-sm font-medium">Endorsement Value:</p>
                        <p className="text-sm text-muted-foreground">{recruit.endorsement_value}</p>
                      </div>
                    )}
                    {recruit.contact_info && (
                      <div className="flex gap-4 text-sm">
                        {recruit.contact_info.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {recruit.contact_info.email}
                          </span>
                        )}
                        {recruit.contact_info.youtube && (
                          <span className="text-blue-500">{recruit.contact_info.youtube}</span>
                        )}
                      </div>
                    )}
                    {recruit.notes && (
                      <div>
                        <p className="text-sm font-medium">Notes:</p>
                        <p className="text-sm text-muted-foreground">{recruit.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {recruit.status === "no_contact" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: recruit.id, status: "contacted" })}
                        >
                          Mark Contacted
                        </Button>
                      )}
                      {recruit.status === "contacted" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: recruit.id, status: "responded" })}
                        >
                          Mark Responded
                        </Button>
                      )}
                      {recruit.status === "responded" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: recruit.id, status: "signed_up" })}
                          >
                            Mark Signed Up
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateStatusMutation.mutate({ id: recruit.id, status: "endorsed" })}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Endorsed
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
