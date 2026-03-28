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
import { useCreateGuild } from "@/hooks/useGuilds";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Palette,
  Users,
  Coins,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

const GUILD_TYPES = [
  { value: "makers", label: "Makers", icon: "🛠️" },
  { value: "designers", label: "Designers", icon: "🎨" },
  { value: "farmers", label: "Farmers", icon: "🌾" },
  { value: "drivers", label: "Drivers", icon: "🚗" },
  { value: "tutors", label: "Tutors", icon: "📚" },
  { value: "captains", label: "Captains", icon: "⚓" },
  { value: "developers", label: "Developers", icon: "💻" },
  { value: "artists", label: "Artists", icon: "🎭" },
  { value: "other", label: "Other", icon: "✨" },
];

const STEPS = [
  { label: "Define", icon: Shield },
  { label: "Banner", icon: Palette },
  { label: "Recruit", icon: Users },
  { label: "Fund", icon: Coins },
  { label: "Contest", icon: Trophy },
];

const COLORS = [
  "#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626",
  "#db2777", "#7c2d12", "#1e3a5f", "#4a1d96", "#064e3b",
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function GuildFormationWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createGuild = useCreateGuild();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [guildType, setGuildType] = useState("");
  const [color, setColor] = useState("#7c3aed");
  const [inviteEmails, setInviteEmails] = useState("");
  const [seedAmount, setSeedAmount] = useState("0");
  const [contestTitle, setContestTitle] = useState("");

  const slug = slugify(name);
  const canProceed = step === 0
    ? name.length >= 3 && guildType !== ""
    : true;

  async function handleFinish() {
    try {
      const guild = await createGuild.mutateAsync({
        name,
        slug,
        description,
        guild_type: guildType,
        color_primary: color,
      });
      toast({ title: "Guild forged!", description: `${name} is live.` });
      navigate(`/guilds/${guild.slug || slug}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center px-4 py-12">
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
                      ? "bg-purple-600 text-white"
                      : active
                        ? "bg-purple-100 text-purple-700 ring-2 ring-purple-400"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs mt-1 ${active ? "font-semibold text-purple-700" : "text-gray-400"}`}>
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
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800">
                  {STEPS[step].label} Your Guild
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 0 && (
                  <>
                    <div>
                      <Label>Guild Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. River Valley Makers"
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
                        placeholder="What does your guild do?"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {GUILD_TYPES.map((t) => (
                          <Badge
                            key={t.value}
                            variant={guildType === t.value ? "default" : "outline"}
                            className="cursor-pointer text-sm py-1 px-3"
                            onClick={() => setGuildType(t.value)}
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
                      Choose your guild&apos;s primary color. You can run a Banner Contest later to crowdsource a design.
                    </p>
                    <div className="flex flex-wrap gap-3">
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
                      {name || "Your Guild"}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Invite your first members. Paste email addresses (one per line). You can skip and recruit later.
                    </p>
                    <Textarea
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder={"alice@example.com\nbob@example.com"}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      {inviteEmails.split("\n").filter(Boolean).length} invite(s) queued
                    </p>
                  </>
                )}

                {step === 3 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Seed your guild treasury with credits. These are one-way — credits fund guild activities, bounties, and contests. You can start at 0.
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
                      Kick off your first Design Contest! Members submit banner art and the guild votes.
                      You can skip this and create one later from your guild page.
                    </p>
                    <div>
                      <Label>Banner Contest Title (optional)</Label>
                      <Input
                        value={contestTitle}
                        onChange={(e) => setContestTitle(e.target.value)}
                        placeholder="e.g. Design Our Guild Banner!"
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
              className="bg-purple-600 hover:bg-purple-700"
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={createGuild.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createGuild.isPending ? "Forging..." : "Forge Guild"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
