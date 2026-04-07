import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shells";
import { Hero } from "@/components/v2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Store, Palette, FileText, Rocket, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useContentShield } from "@/hooks/useContentShield";
import { ContentShieldBanner } from "@/components/neighborhoods/ContentShieldBanner";

const TEMPLATES = [
  { id: "main-street", name: "Main Street", desc: "Traditional storefront row — retail, professional services, general commerce" },
  { id: "art-district", name: "Art District", desc: "Gallery-style grid — visual arts, photography, design, handmade crafts" },
  { id: "food-court", name: "Food Court", desc: "Restaurant and food focused — bakers, chefs, meal prep, farm-to-table" },
  { id: "tech-hub", name: "Tech Hub", desc: "Digital services and tools — software, APIs, templates, coding education" },
  { id: "market-square", name: "Market Square", desc: "Open-air market feel — mixed vendors, seasonal goods, artisan booths" },
] as const;

const STEPS = ["Location", "Identity", "Template", "Content", "Launch"] as const;
type Step = (typeof STEPS)[number];

export default function NeighborhoodBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [region, setRegion] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("main-street");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const { validate, violations, validating, hasBlocks } = useContentShield();

  const autoSlug = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const canAdvance = () => {
    switch (step) {
      case 0: return city.trim().length >= 2;
      case 1: return name.trim().length >= 3 && slug.trim().length >= 3;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const runShieldCheck = async () => {
    await validate({ description, welcome_message: welcomeMessage });
  };

  const handleCreate = async () => {
    if (!user) { toast.error("Sign in to create a neighborhood"); return; }
    const v = await validate({ description, welcome_message: welcomeMessage });
    if (v.some((x) => x.severity === "block")) {
      toast.error("Content blocked by Content Shield — fix violations before saving");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("neighborhoods" as never)
        .insert({
          slug,
          name,
          city,
          state: stateName || null,
          region: region || null,
          owner_id: user.id,
          owner_type: "member",
          template,
          description: description || null,
          welcome_message: welcomeMessage || null,
          status: "draft",
        } as never)
        .select("slug")
        .single();
      if (error) throw error;
      toast.success("Neighborhood created! It's in draft mode until you publish it.");
      navigate(`/neighborhoods/${(data as any).slug}`);
    } catch (err: any) {
      if (err?.code === "23505") {
        toast.error("That slug is already taken. Try a different name.");
      } else {
        toast.error(err?.message ?? "Failed to create neighborhood");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      xrayBase="neighborhood-builder"
      pageTitle="Neighborhood Builder"
      breadcrumbs="Neighborhoods / Builder"
      hero={
        <Hero
          variant="app"
          eyebrow="Build"
          headline="Start a Neighborhood"
          body="Create a customized local section of the marketplace. Choose your city, pick a template, add storefronts, and make it yours. All platform rules — Cost+20%, Harper Guild, Star Chamber — apply automatically."
        />
      }
    >
      <div className="max-w-2xl mx-auto space-y-6 pb-16">
        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <button
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === step ? "bg-primary text-primary-foreground"
                  : i < step ? "bg-primary/10 text-primary cursor-pointer"
                  : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-4 text-center">{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 0: Location */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Choose Your City</CardTitle>
              <CardDescription>Which city is this neighborhood in?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="San Antonio" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={stateName} onChange={e => setStateName(e.target.value)} placeholder="TX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="northeast">Northeast</SelectItem>
                      <SelectItem value="southeast">Southeast</SelectItem>
                      <SelectItem value="midwest">Midwest</SelectItem>
                      <SelectItem value="southwest">Southwest</SelectItem>
                      <SelectItem value="west-coast">West Coast</SelectItem>
                      <SelectItem value="pacific-northwest">Pacific Northwest</SelectItem>
                      <SelectItem value="mountain-west">Mountain West</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5" /> Name Your Neighborhood</CardTitle>
              <CardDescription>Give it a name that tells visitors what to expect.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Neighborhood Name *</Label>
                <Input id="name" value={name} onChange={e => autoSlug(e.target.value)} placeholder="Rogers Park Creative District" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>lianabanyan.com/neighborhoods/</span>
                  <Input id="slug" value={slug} onChange={e => setSlug(e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)}
                  onBlur={runShieldCheck}
                  placeholder="What makes this neighborhood special? What will visitors find here?"
                  rows={3}
                />
              </div>
              <ContentShieldBanner violations={violations} validating={validating} />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Template */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Pick a Template</CardTitle>
              <CardDescription>Choose the layout style for your neighborhood. You can customize colors later.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-colors ${
                      template === t.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      template === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Content */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Welcome Content</CardTitle>
              <CardDescription>What should visitors see when they enter your neighborhood?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome">Welcome Message</Label>
                <Textarea id="welcome" value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)}
                  onBlur={runShieldCheck}
                  placeholder="Welcome to our neighborhood! Browse, order, and support your local makers..."
                  rows={4}
                />
              </div>
              <ContentShieldBanner violations={violations} validating={validating} />
              <p className="text-xs text-muted-foreground">
                You can add storefronts after creating the neighborhood. Visit the builder again to manage your storefront list.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Launch */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Rocket className="w-5 h-5" /> Review & Create</CardTitle>
              <CardDescription>Your neighborhood will start in draft mode. Publish it when you're ready.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">City:</span><span className="font-medium">{city}{stateName ? `, ${stateName}` : ""}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-medium">{name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">URL:</span><span className="font-mono text-xs">/neighborhoods/{slug}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Template:</span><Badge variant="outline">{TEMPLATES.find(t => t.id === template)?.name}</Badge></div>
                {region && <div className="flex justify-between"><span className="text-muted-foreground">Region:</span><span>{region}</span></div>}
              </div>
              <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
                <p>Platform rules are automatically enforced:</p>
                <p>- Cost+20% pricing minimum (cannot be lowered)</p>
                <p>- Creator keeps 83.3% of every sale</p>
                <p>- Harper Guild quality reviews</p>
                <p>- Star Chamber compliance</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={saving || !canAdvance() || hasBlocks} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {saving ? "Creating..." : "Create Neighborhood"}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
