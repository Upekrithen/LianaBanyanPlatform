/**
 * SpeakFriendPage -- Wave D / D4
 * Route: /speak-friend/
 *
 * 150-language hub. Two sections:
 *   - 16 Ratified Languages (community-verified translations, including EN baseline)
 *   - 134 Languages Seeking Translators (open bounties, searchable/filterable)
 *
 * Each open-bounty tile links to the BountyPosterGenerator with a pre-filled
 * translation class and language code.
 *
 * Marks are participation tokens -- not equity.
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Lock, Star, ArrowRight, Quote, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LANGUAGES,
  RATIFIED_LANGUAGES,
  SEEKING_TRANSLATION,
  ALL_REGIONS,
  ALL_SCRIPTS,
  formatSpeakerCount,
  type LanguageEntry,
} from "@/data/languages";

// =========================================================================
// SPEAK FOUNDER -- 26 terms, Founder origin-voice ("why I called it")
// =========================================================================

interface FounderTerm {
  id: string;
  term: string;
  why: string;
  goldenKeys: number;
}

const FOUNDER_TERMS: FounderTerm[] = [
  { id: "liana-banyan",       term: "Liana Banyan",           goldenKeys: 5, why: "A liana is a woody vine that climbs by leaning on other plants -- it grows through community, not around it. The banyan tree grows new trunks from its own branches and can eventually shelter an entire village under one canopy. The cooperative does the same: every new member becomes a root." },
  { id: "pudding",            term: "Pudding",                goldenKeys: 3, why: "The proof is in the pudding. Not my opinion. Not an algorithm's opinion. The members'. We needed a word for the collective taste-test that makes quality visible. Pudding stuck immediately because everyone already knew what it meant." },
  { id: "soccerball",        term: "Soccerball / SID",        goldenKeys: 3, why: "A soccerball comes to you. You don't go get it. The intake service catches whatever is kicked into it and assigns a permanent ID the moment it lands. That's the whole job. Round, catches everything, never loses track." },
  { id: "pearl",             term: "Pearl",                   goldenKeys: 5, why: "One grain of sand, then layer after layer wraps around it until it's precious. A Pearl is the same -- one authentic contribution, wrapped in proof and context. The metaphor holds all the way down: real pearls form slowly, are rare, and cannot be faked." },
  { id: "eblet",             term: "Eblet",                   goldenKeys: 3, why: "An eblet is the minimum displayable unit -- a Pearl wrapped in presentation. The name comes from 'ebb' (the minimum flow of the tide) and '-let' (a small unit). The ebb never stops; it always delivers something. An Eblet is the smallest something you can show." },
  { id: "ssps",              term: "SSPS",                    goldenKeys: 2, why: "Soccerball Single-Point-of-Socceri. The certificate that ties a Pearl to exactly one creator, one timestamp, one moment. I kept the name internal-only because the acronym is unmistakably ours. Anyone who knows what SSPS means has learned something no outsider can fake." },
  { id: "substrate",         term: "Substrate",               goldenKeys: 5, why: "The ground everything stands on. Biologists use substrate for the surface a living thing grows on -- the rebar in concrete. You never see it but if it weren't there, nothing stands. I wanted a word that meant 'permanent foundation' without sounding like database." },
  { id: "wildfire",          term: "Wildfire",                goldenKeys: 3, why: "Good ideas spread like wildfire -- but only if you give them a path. The Wildfire Beacon Runs are the paths: structured tours that carry you through the platform the way a wildfire carries through a forest. Fast, directional, and illuminating." },
  { id: "novaculi",          term: "Novaculi",                goldenKeys: 2, why: "Latin: the blades. Razor blades specifically -- precise cutting tools, not broadswords. Novaculi doctrine is about cutting cleanly: parallel batches for independent work, zero drag on sequenced work. Every scope gets the blade it needs." },
  { id: "yoke",              term: "Yoke",                    goldenKeys: 2, why: "A yoke connects two animals so they can pull together without pulling apart. The Yoke bridge connects parallel workstreams the same way -- two operators can run simultaneously without one overwriting the other. The yoke holds the tension." },
  { id: "furnace",           term: "Furnace",                 goldenKeys: 3, why: "Raw ore goes in. Refined metal comes out. What happened inside is not your business -- only the output is. The Furnace is the platform's reputation engine: anonymized signals go in, XP comes out. Privacy by design, not by policy." },
  { id: "battery-dispatch",  term: "Battery Dispatch",        goldenKeys: 3, why: "A battery doesn't dump all its energy at once. It releases it steadily, at the right amount, at the right time. The Battery holds approved content and dispatches it on a schedule. Every creator gets their moment -- not a fight to survive a 6am avalanche." },
  { id: "switzerland-policy",term: "Switzerland Policy",      goldenKeys: 5, why: "Switzerland stayed out of two world wars. Not out of cowardice -- they have one of the world's strongest military traditions. They stayed out because their value was in being the place where all sides could still talk. That's us. Two hard exclusions that protect the table for everyone." },
  { id: "defense-klaus",     term: "Defense Klaus",           goldenKeys: 3, why: "Named for the principle, not a person. Klaus comes from the Greek root for 'key' -- the one who holds the key to the gate. Defense Klaus is the cooperative's institutional key to legal and social protection for members. The cooperative has standing that an individual doesn't." },
  { id: "dragonriders",      term: "Dragonriders",            goldenKeys: 2, why: "In every mythology, dragons are the most powerful and most dangerous things in the world. The people authorized to ride them are exceptional -- and they train constantly. The five Dragonriders are authorized to trigger Contingency Operators. They practice. They don't improvise." },
  { id: "mimic-trunk",       term: "Mimic Trunk",             goldenKeys: 2, why: "A trunk that mimics. The mimicry is exact -- a full isolated copy of the live Substrate and Pearl chain. Dragonriders train on Mimic Trunks so they are never flying blind on the real system. The trunk mimics; the training is real." },
  { id: "shirley-temple",    term: "Shirley Temple (badges)", goldenKeys: 3, why: "Shirley Temple collected diplomatic pins because she had actually been to those places and done that work. The badge collection I wanted for members was the same -- not fan badges, not follower badges. Presence badges. You were there. You did the thing. The pin proves it." },
  { id: "heoho",             term: "HEOHO",                   goldenKeys: 5, why: "Help Each Other Help Out. Not Help Each Other Out -- the extra 'Help' is intentional. Help each other HELP OUT. The cooperative model asks you to assist others in the act of contributing, not just receive assistance yourself. The word order carries the doctrine." },
  { id: "ghost-world",       term: "Ghost World",             goldenKeys: 3, why: "Ghosts can see everything but touch nothing. An unmembered visitor to the platform is a ghost -- they can browse, observe, understand. But they cannot contribute, earn, or participate. Ghost World is not a punishment; it is an invitation with the door clearly visible." },
  { id: "golden-keys",       term: "Golden Keys",             goldenKeys: 5, why: "A golden key opens a room that has another golden key in it. The more you learn, the more of the platform opens. I wanted the most curious members to move the fastest -- and Golden Keys give explorers the actual access that their curiosity earns them." },
  { id: "magic-carpet-ride", term: "Magic Carpet Ride",       goldenKeys: 3, why: "A carpet that carries you. Auto-navigate mode through a Wildfire run doesn't make you do the walking -- it carries you through each stop. You still see everything; you just don't have to find the path yourself. Named for exactly the feeling I wanted it to give." },
  { id: "medallion",         term: "Medallion",               goldenKeys: 5, why: "A real medallion. Something you can hold. I wanted something you could put in someone's hand in a coffee shop and have it tell the whole story without requiring them to log in first. A medallion is old -- knights, guilds, Olympic games. That weight is intentional." },
  { id: "cue-card",          term: "Cue Card",                goldenKeys: 3, why: "Not a flashcard. A cue. A cue card prompts you to deliver something -- a performance, a line, a next step. The Cue Cards are not memory tools; they are action prompts. Learn the economic laws cue card and the cue is: go use this." },
  { id: "crown-jewels",      term: "Crown Jewels",            goldenKeys: 5, why: "228 innovations with zero prior art in the USPTO database. They are not merely valuable; they are irreplaceable. The crown jewels of any monarchy are never sold -- their value is in what they represent about the whole. Same here." },
  { id: "star-chamber",      term: "Star Chamber",            goldenKeys: 3, why: "Historically, the Star Chamber was a powerful court that met in private -- named for the stars painted on the ceiling of the room in Westminster Palace. I kept the name because the Star Chamber is our governance body that operates with authority and with accountability. It meets in private; its decisions are recorded." },
  { id: "substrace-theorem", term: "Substrace Theorem",       goldenKeys: 5, why: "Substrate + trace. If you can trace every contribution back through the Substrate to its origin, the entire cooperative structure proves itself. V(cooperative) > sum(individual) for N > 1 with authenticated cross-links. The cathedral is worth more than the stones." },
];

function FounderTermCard({ term }: { term: FounderTerm }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all border",
        open ? "border-primary/40 bg-primary/3" : "hover:border-primary/20"
      )}
      onClick={() => setOpen((v) => !v)}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <Quote className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-sm">{term.term}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-500 tracking-wide" title={`${term.goldenKeys} Golden Keys earned by mastering this term`}>
                  {"🔑".repeat(term.goldenKeys)}
                </span>
                <span className="text-muted-foreground text-xs">{open ? t("speakFriend.hide") : t("speakFriend.why")}</span>
              </div>
            </div>
            {open && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {term.why}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =========================================================================
// RATIFIED LANGUAGE TILES (15 non-EN + EN baseline)
// =========================================================================

interface RatifiedTileProps {
  lang: LanguageEntry;
  selected: boolean;
  onSelect: () => void;
}

function RatifiedTile({ lang, selected, onSelect }: RatifiedTileProps) {
  const { t } = useTranslation();
  const isBaseline = lang.code === "en";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center",
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <span className="text-2xl mb-2 font-bold">{lang.code.toUpperCase()}</span>
      <span className="text-sm font-semibold mb-0.5">{lang.nativeName}</span>
      <span className="text-xs text-muted-foreground mb-2">{lang.name}</span>
      {isBaseline ? (
        <Badge className="text-[10px] border-blue-200 bg-blue-50 text-blue-700">
          {t("speakFriend.complete")}
        </Badge>
      ) : (
        <Badge className="text-[10px] border-green-200 bg-green-50 text-green-700">
          {t("speakFriend.bountyOpen")}
        </Badge>
      )}
    </button>
  );
}

// =========================================================================
// SEEKING TRANSLATION TILES (134 languages with open bounties)
// =========================================================================

// Machine-seeded stubs have speakFriend + languageSwitcher (36 keys out of
// the full 1013-key EN reference). All 134 non-ratified locales share the
// same coverage after Wave 13-14 seeding; this constant reflects the CI gate.
const STUB_COVERAGE_PCT = 4; // 36 / 1013 ≈ 3.6 %, rounded to 4 %

const MARKS_BY_REGION: Record<string, number> = {
  "Global": 500,
  "Europe": 400,
  "East Asia": 600,
  "South Asia": 600,
  "Southeast Asia": 600,
  "Middle East": 600,
  "Middle East/Africa": 600,
  "Africa": 700,
  "Central Asia": 700,
  "Caucasus": 700,
  "Americas": 700,
  "Pacific": 800,
  "Europe/Asia": 500,
  "Europe/Middle East": 500,
  "South Asia/Middle East": 700,
};

function bountyMarks(lang: LanguageEntry): number {
  return MARKS_BY_REGION[lang.region] ?? 500;
}

interface SeekingTileProps {
  lang: LanguageEntry;
}

function SeekingTile({ lang }: SeekingTileProps) {
  const marks = bountyMarks(lang);
  const bountyUrl = `/bounty-poster-generator?class=translation&language=${lang.code}&title=${encodeURIComponent(`Translate Liana Banyan to ${lang.name}`)}`;
  const pct = STUB_COVERAGE_PCT;

  return (
    <div className="flex flex-col p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{lang.nativeName}</div>
          <div className="text-xs text-muted-foreground">{lang.name}</div>
        </div>
        <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
          {lang.code}
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {lang.script}
        </span>
        {lang.rtl && (
          <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
            RTL
          </span>
        )}
        <span className="text-[10px] text-muted-foreground">
          {formatSpeakerCount(lang.speakerCount)} speakers
        </span>
      </div>

      {/* Translation completeness bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Translation coverage</span>
          <span className="text-[10px] font-semibold text-amber-600">{pct}% machine-seeded</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-amber-400"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Native-script preview phrase */}
      <div className="text-[10px] text-muted-foreground italic truncate" dir={lang.rtl ? "rtl" : "ltr"}>
        "{lang.speakFriendPhrase}"
      </div>

      <a
        href={bountyUrl}
        className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-primary border border-primary/30 rounded-lg py-1.5 hover:bg-primary/5 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <Globe className="h-3 w-3" />
        Claim bounty ({marks} Marks)
        <ArrowRight className="h-3 w-3" />
      </a>
    </div>
  );
}

// =========================================================================
// DETAIL PANEL for selected ratified language
// =========================================================================

function RatifiedDetailPanel({ lang }: { lang: LanguageEntry }) {
  const { t } = useTranslation();
  const marks = bountyMarks(lang);
  const isBaseline = lang.code === "en";

  return (
    <div className="mt-8 border rounded-xl bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-xl font-bold mb-1">{lang.name}</h2>
          <p className="text-muted-foreground text-sm italic">
            "{lang.speakFriendPhrase}"
          </p>
        </div>
        {!isBaseline && (
          <Badge className="text-sm px-3 py-1 bg-green-100 text-green-700 border-green-200">
            {t("speakFriend.marksProvisional", { marks })}
          </Badge>
        )}
      </div>

      {isBaseline ? (
        <div className="flex items-center gap-2 text-blue-700">
          <Star className="h-5 w-5" />
          <span className="text-sm font-medium">{t("speakFriend.baseLanguage")}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">{t("speakFriend.translationBountyTitle")}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t("speakFriend.bountyDescription", { language: lang.name, marks })}
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>{t("speakFriend.scopeWelcome")}</li>
              <li>{t("speakFriend.scopeCueCards")}</li>
              <li>{t("speakFriend.scopeNavigation")}</li>
              <li>{t("speakFriend.scopeWildfire")}</li>
            </ul>
          </div>
          <Button className="self-start" asChild>
            <a
              href={`/bounty-poster-generator?class=translation&language=${lang.code}&title=Translate+Liana+Banyan+to+${encodeURIComponent(lang.name)}`}
            >
              <Globe className="h-4 w-4 mr-2" />
              {t("speakFriend.claimBounty")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// MAIN PAGE
// =========================================================================

const ALL_REGION_OPTIONS = ["All Regions", ...ALL_REGIONS];
const ALL_SCRIPT_OPTIONS = ["All Scripts", ...ALL_SCRIPTS];

export default function SpeakFriendPage() {
  const { t } = useTranslation();

  // Ratified section state
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const selectedLang = RATIFIED_LANGUAGES.find((l) => l.code === selectedCode);

  // Seeking translators filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [scriptFilter, setScriptFilter] = useState("All Scripts");
  const [sortBy, setSortBy] = useState<"speakers" | "name">("speakers");

  const filteredSeeking = useMemo(() => {
    let list = SEEKING_TRANSLATION;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.nativeName.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q)
      );
    }
    if (regionFilter !== "All Regions") {
      list = list.filter((l) => l.region === regionFilter);
    }
    if (scriptFilter !== "All Scripts") {
      list = list.filter((l) => l.script === scriptFilter);
    }

    if (sortBy === "speakers") {
      list = [...list].sort((a, b) => b.speakerCount - a.speakerCount);
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [searchQuery, regionFilter, scriptFilter, sortBy]);

  const totalSeeking = SEEKING_TRANSLATION.length;
  const ratifiedNonEn = RATIFIED_LANGUAGES.filter((l) => l.code !== "en");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className="border-b relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
      >
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.sin(i * 137.5) * 50 + 50}%`,
                top: `${Math.cos(i * 97.3) * 50 + 50}%`,
                opacity: 0.2 + (i % 5) * 0.15,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <Globe className="h-12 w-12 text-blue-300 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("speakFriend.title")}
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-2">
            {t("speakFriend.subtitle")}
          </p>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
            {t("speakFriend.description")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
            <span>
              <span className="text-white font-bold">150</span> {t("speakFriend.languages")}
            </span>
            <span>-</span>
            <span>
              <span className="text-white font-bold">{totalSeeking}</span> {t("speakFriend.openBounties")}
            </span>
            <span>-</span>
            <span>
              <span className="text-white font-bold">Marks</span> {t("speakFriend.marksAwarded")}
            </span>
          </div>
        </div>
      </div>

      {/* Provisional notice */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <p className="max-w-5xl mx-auto text-xs text-amber-700">
          <strong>{t("speakFriend.provisional")}</strong>{" "}
          {t("speakFriend.provisionalNotice")}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* ── Section 1: Ratified Languages ── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">
              {ratifiedNonEn.length} Ratified Languages
            </h2>
            <p className="text-muted-foreground text-sm">
              Community-verified translations. English is the base language. All others have open translation bounties.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {RATIFIED_LANGUAGES.map((lang) => (
              <RatifiedTile
                key={lang.code}
                lang={lang}
                selected={selectedCode === lang.code}
                onSelect={() => setSelectedCode(selectedCode === lang.code ? null : lang.code)}
              />
            ))}
          </div>

          {selectedLang && (
            <RatifiedDetailPanel lang={selectedLang} />
          )}
        </section>

        {/* ── Section 2: 134 Seeking Translators ── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">
              {totalSeeking} Languages Seeking Translators
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Each open bounty pays Marks (participation tokens) upon acceptance by the Stewards Guild.
              Machine-draft strings are seeded in each locale (~4% coverage). Human translators earn Marks
              by completing the remaining 96%.
            </p>

            {/* Search and filter controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, native name, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="text-sm border rounded-md px-2 py-2 bg-background"
                  >
                    {ALL_REGION_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={scriptFilter}
                  onChange={(e) => setScriptFilter(e.target.value)}
                  className="text-sm border rounded-md px-2 py-2 bg-background"
                >
                  {ALL_SCRIPT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "speakers" | "name")}
                  className="text-sm border rounded-md px-2 py-2 bg-background"
                >
                  <option value="speakers">By speakers</option>
                  <option value="name">By name</option>
                </select>
              </div>
            </div>

            {(searchQuery || regionFilter !== "All Regions" || scriptFilter !== "All Scripts") && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredSeeking.length} of {totalSeeking}</span>
                <button
                  onClick={() => { setSearchQuery(""); setRegionFilter("All Regions"); setScriptFilter("All Scripts"); }}
                  className="text-primary text-xs underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {filteredSeeking.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No languages match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredSeeking.map((lang) => (
                <SeekingTile key={lang.code} lang={lang} />
              ))}
            </div>
          )}
        </section>

        {/* ── Speak Founder ── */}
        <section className="border-t pt-10">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">{t("speakFriend.speakFounderTitle")}</h2>
            <p className="text-muted-foreground text-sm max-w-2xl">
              {t("speakFriend.speakFounderDesc")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {FOUNDER_TERMS.map((term) => (
              <FounderTermCard key={term.id} term={term} />
            ))}
          </div>
        </section>

        {/* ── How Bounties Work ── */}
        <section className="border-t pt-10">
          <h2 className="text-xl font-bold mb-6">{t("speakFriend.howBountiesWork")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", titleKey: "speakFriend.step1Title", bodyKey: "speakFriend.step1Body" },
              { step: "2", titleKey: "speakFriend.step2Title", bodyKey: "speakFriend.step2Body" },
              { step: "3", titleKey: "speakFriend.step3Title", bodyKey: "speakFriend.step3Body" },
            ].map((s) => (
              <Card key={s.step}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {s.step}
                    </div>
                    <h3 className="font-semibold">{t(s.titleKey)}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{t(s.bodyKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
