import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useNominateBusiness } from "@/hooks/useBusinessCampaigns";
import { ArrowLeft, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "food_truck", label: "Food Truck" },
  { value: "bakery", label: "Bakery" },
  { value: "catering", label: "Catering" },
  { value: "barber", label: "Barber" },
  { value: "salon", label: "Salon" },
  { value: "spa", label: "Spa" },
  { value: "mechanic", label: "Mechanic" },
  { value: "auto_service", label: "Auto Service" },
  { value: "dry_cleaner", label: "Dry Cleaner" },
  { value: "laundry", label: "Laundry" },
  { value: "grocery", label: "Grocery" },
  { value: "convenience", label: "Convenience Store" },
  { value: "tutoring", label: "Tutoring" },
  { value: "education", label: "Education" },
  { value: "gym", label: "Gym" },
  { value: "fitness", label: "Fitness" },
  { value: "pet_service", label: "Pet Service" },
  { value: "veterinary", label: "Veterinary" },
  { value: "home_service", label: "Home Service" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "cleaning", label: "Cleaning" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

export default function NominateBusinessPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const nominateMutation = useNominateBusiness();

  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    businessCity: "",
    businessState: "",
    businessAddress: "",
    businessWebsite: "",
    businessPhone: "",
    nominationReason: "",
    proposedDiscountPct: "10",
    initialPledge: "15",
  });

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.businessName.trim() || !form.businessType || !form.businessCity.trim() || !form.nominationReason.trim()) {
      toast({ title: "Missing required fields", description: "Fill in business name, type, city, and why you love this place.", variant: "destructive" });
      return;
    }

    try {
      const campaign = await nominateMutation.mutateAsync({
        businessName: form.businessName.trim(),
        businessType: form.businessType,
        businessCity: form.businessCity.trim(),
        businessState: form.businessState.trim() || undefined,
        businessAddress: form.businessAddress.trim() || undefined,
        businessWebsite: form.businessWebsite.trim() || undefined,
        businessPhone: form.businessPhone.trim() || undefined,
        nominationReason: form.nominationReason.trim(),
        proposedDiscountPct: parseFloat(form.proposedDiscountPct) || 10,
        initialPledge: parseFloat(form.initialPledge) || 0,
      });

      toast({ title: "Campaign created!", description: `${campaign.business_name} is now accepting pledges.` });
      navigate(`/campaigns/${campaign.slug}`);
    } catch (e: any) {
      toast({ title: "Nomination failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <PortalPageLayout
      title="Nominate a Business"
      subtitle="Know a local business that should join Liana Banyan? Start a campaign."
      maxWidth="xl"
      xrayId="nominate-business"
    >
      <div className="space-y-6 pb-12">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Campaigns
          </Link>
        </Button>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input id="name" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="La Capital del Sabor" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Business Type *</Label>
                  <Select value={form.businessType} onValueChange={(v) => set("businessType", v)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={form.businessCity} onChange={(e) => set("businessCity", e.target.value)} placeholder="San Antonio" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={form.businessState} onChange={(e) => set("businessState", e.target.value)} placeholder="TX" maxLength={2} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Address (optional)</Label>
                <Input id="address" value={form.businessAddress} onChange={(e) => set("businessAddress", e.target.value)} placeholder="1234 Bandera Rd" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input id="website" value={form.businessWebsite} onChange={(e) => set("businessWebsite", e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" value={form.businessPhone} onChange={(e) => set("businessPhone", e.target.value)} placeholder="(210) 555-1234" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">Why do you love this place? *</Label>
                <Textarea
                  id="reason"
                  rows={3}
                  value={form.nominationReason}
                  onChange={(e) => set("nominationReason", e.target.value)}
                  placeholder="Featured on mysanantonio.com/food. Amazing lunch specials..."
                />
                <p className="text-xs text-muted-foreground">1-3 sentences. This appears on the campaign page.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="discount">Proposed Discount %</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="50"
                    value={form.proposedDiscountPct}
                    onChange={(e) => set("proposedDiscountPct", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Volume discount for LB Card members (default 10%)</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pledge">Your Initial Pledge ($)</Label>
                  <Input
                    id="pledge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.initialPledge}
                    onChange={(e) => set("initialPledge", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Seed the campaign with your first pledge</p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={nominateMutation.isPending}>
                {nominateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </PortalPageLayout>
  );
}
