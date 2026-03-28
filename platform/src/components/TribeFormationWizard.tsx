import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCreateTribe } from "@/hooks/useTribes";
import { useToast } from "@/hooks/use-toast";
import {
  Flame,
  Users,
  UtensilsCrossed,
  Coins,
  Palette,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

const TRIBE_TYPES = [
  { value: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { value: "neighborhood", label: "Neighborhood", icon: "🏘️" },
  { value: "interest", label: "Interest Group", icon: "🎯" },
  { value: "cultural", label: "Cultural", icon: "🌍" },
  { value: "hybrid", label: "Hybrid", icon: "🔀" },
];

const STEPS = [
  { label: "Name", icon: Flame },
  { label: "Invite", icon: Users },
  { label: "Table", icon: UtensilsCrossed },
  { label: "Seed", icon: Coins },
  { label: "Banner", icon: Palette },
];

const COLORS = [
  "#d97706", "#ea580c", "#dc2626", "#059669", "#2563eb",
  "#7c3aed", "#db2777", "#854d0e", "#065f46", "#1e3a5f",
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function TribeFormationWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createTribe = useCreateTribe();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tribeType, setTribeType] = useState("");
  const [color, setColor] = useState("#d97706");
  const [inviteEmails, setInviteEmails] = useState("");
  const [linkFamilyTable, setLinkFamilyTable] = useState(false);
  const [seedAmount, setSeedAmount] = useState("0");
  const [contestTitle, setContestTitle] = useState("");

  const slug = slugify(name);
  const canProceed = step === 0
    ? name.length >= 3 && tribeType !== ""
    : true;

  async function handleFinish() {
    try {
      const tribe = await createTribe.mutateAsync({
        name,
        slug,
        description,
        tribe_type: tribeType,
        color_primary: color,
      });
      toast({ title: "Tribe gathered!", description: `${name} is live.` });
      navigate(`/tribes/${tribe.slug || slug}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.label} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    done
                      ? "bg-amber-600 text-white"
                      : active
                        ? "bg-amber-100 text-amber-700 ring-2 ring-amber-400"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs mt-1 ${active ? "font-semibold text-amber-700" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <Progress value={((step + 1) / STEPS.length) * 100} className="mb-6 h-2" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">
                  {STEPS[step].label} Your Tribe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 0 && (
                  <>
                    <div>
                      <Label>Tribe Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. The Garcia Family"
                        maxLength={60}
                      />
                      {slug && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Slug: <code>{slug}</code>
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What brings your tribe together?"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {TRIBE_TYPES.map((t) => (
                          <Badge
                            key={t.value}
                            variant={tribeType === t.value ? "default" : "outline"}
                            className="cursor-pointer text-sm py-1 px-3"
                            onClick={() => setTribeType(t.value)}
                          >
                            {t.icon} {t.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Invite your tribe members. Paste email addresses (one per line). You can skip and invite later.
                    </p>
                    <Textarea
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder={"mom@example.com\ndad@example.com\nsis@example.com"}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      {inviteEmails.split("\n").filter(Boolean).length} invite(s) queued
                    </p>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Family-type tribes can link to a Family Table for shared meals and meal planning.
                    </p>
                    {tribeType === "family" ? (
                      <div className="flex items-center gap-3">
                        <Button
                          variant={linkFamilyTable ? "default" : "outline"}
                          onClick={() => setLinkFamilyTable(!linkFamilyTable)}
                        >
                          <UtensilsCrossed className="h-4 w-4 mr-2" />
                          {linkFamilyTable ? "Family Table Linked" : "Link Family Table"}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {linkFamilyTable ? "Your tribe will have a shared Family Table." : "Optional — connect to the Family Table initiative."}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                        Family Table linking is available for family-type tribes.
                        Your &quot;{tribeType || "selected"}&quot; tribe can still gather for meals through group events.
                      </p>
                    )}
                  </>
                )}

                {step === 3 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Seed your tribe treasury with credits. These fund tribe activities, events, and contests.
                      One-way valve — credits stay in the tribe. Start at 0 if you like.
                    </p>
                    <div>
                      <Label>Initial Treasury (credits)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={seedAmount}
                        onChange={(e) => setSeedAmount(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Choose your tribe&apos;s color. Start a Banner Contest to crowdsource a design from your members!
                    </p>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          className={`w-10 h-10 rounded-full border-2 transition-transform ${
                            color === c ? "border-gray-900 scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                          onClick={() => setColor(c)}
                        />
                      ))}
                    </div>
                    <div
                      className="h-24 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: color }}
                    >
                      {name || "Your Tribe"}
                    </div>
                    <div className="mt-4">
                      <Label>Banner Contest Title (optional)</Label>
                      <Input
                        value={contestTitle}
                        onChange={(e) => setContestTitle(e.target.value)}
                        placeholder="e.g. Design Our Tribe Banner!"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={createTribe.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {createTribe.isPending ? "Gathering..." : "Gather Tribe"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
