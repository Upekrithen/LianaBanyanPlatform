/**
 * MirrorMirror — Language-aware Deck Card (submarine door #5).
 * Route: /mirror?lang=es&word=amigo
 *
 * Reads detected language from URL params.
 * Top-20 languages get pre-translated strings.
 * Others get English + Google Translate link.
 */
import { useNavigate, useSearchParams } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { motion } from "framer-motion";
import { Globe, ExternalLink } from "lucide-react";
import { FRIEND_WORDS } from "@/data/friendWords";
import {
  getMirrorStrings,
  interpolate,
  hasTranslation,
} from "@/data/mirrorTranslations";
import { SummonMascot } from "@/components/museum/SummonMascot";

function findByLangCode(langCode: string) {
  return FRIEND_WORDS.find((fw) => fw.langCode === langCode);
}

const MirrorMirror = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const langCode = params.get("lang") || "en";
  const typedWord = params.get("word") || "";

  const langInfo = findByLangCode(langCode);
  const language = langInfo?.language || "your language";
  const nativeName = langInfo?.nativeName || language;
  const displayWord = typedWord || langInfo?.word || "friend";

  const strings = getMirrorStrings(langCode);
  const isTranslated = hasTranslation(langCode);
  const isEnglish = langCode === "en";

  const vars = { word: displayWord, nativeName, language };
  const description = interpolate(strings.description, vars);

  const googleTranslateUrl = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=https://museum.lianabanyan.com`;

  return (
    <DeckCardShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-start text-center px-2 pt-2"
      >
        <div className="text-4xl mb-1">💎</div>

        <h2
          style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
            fontWeight: 700,
            color: "#38a169",
            marginBottom: "0.15rem",
            lineHeight: 1.1,
          }}
        >
          Mirror Mirror
        </h2>

        {/* Reflection: "Mirror" in the user's language, directly under the English title.
            Gated on isTranslated so untranslated languages don't render "Mirror Mirror / Mirror". */}
        {!isEnglish && isTranslated && (
          <div
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "clamp(1.05rem, 4vw, 1.45rem)",
              fontWeight: 700,
              color: "#38a169",
              opacity: 0.75,
              marginBottom: "0.5rem",
              lineHeight: 1.1,
              transform: "scaleY(0.92)",
              letterSpacing: "0.01em",
            }}
            aria-label={`${strings.mirrorWord} ${strings.mirrorWord}`}
          >
            {strings.mirrorWord} {strings.mirrorWord}
          </div>
        )}

        {/* Language indicator */}
        {!isEnglish && (
          <div
            className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full"
            style={{ background: "rgba(56, 161, 105, 0.12)", border: "1px solid rgba(56, 161, 105, 0.3)" }}
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span style={{ color: "#38a169", fontSize: "0.7rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              {nativeName}
            </span>
          </div>
        )}

        {/* Description */}
        <p style={{ color: "#faf5eb", fontSize: "0.8rem", lineHeight: 1.7, maxWidth: "300px" }}>
          {isEnglish
            ? "You found a keyhole. Hidden doors are scattered throughout — each one unlocks something different. This one opens Mirror Mirror, which translates the entire site into 110+ languages. Fairest means everyone can read it."
            : description}
        </p>

        {/* Welcome + translate ask — English muted on top, native bold below (Option B).
            Only shown for top-20 translated languages (we have the native string). */}
        {!isEnglish && isTranslated && (
          <div className="mt-3" style={{ maxWidth: "300px" }}>
            <p
              style={{
                color: "rgba(250,245,235,0.45)",
                fontSize: "0.7rem",
                lineHeight: 1.4,
                fontStyle: "italic",
                marginBottom: "0.25rem",
              }}
            >
              Welcome! We need you! Can you help us translate?
            </p>
            <p
              style={{
                color: "#faf5eb",
                fontSize: "0.9rem",
                lineHeight: 1.45,
                fontWeight: 700,
              }}
            >
              {strings.welcomeHelp}
            </p>
          </div>
        )}

        {/* Long-tail English-only ask — for the 90+ untranslated languages.
            These speakers are EXACTLY the people we need to help us translate. */}
        {!isEnglish && !isTranslated && (
          <div className="mt-3" style={{ maxWidth: "300px" }}>
            <p
              style={{
                color: "#faf5eb",
                fontSize: "0.9rem",
                lineHeight: 1.45,
                fontWeight: 700,
              }}
            >
              Welcome! We need you! Can you help us translate Liana Banyan into {language}?
            </p>
            <p
              style={{
                color: "rgba(250,245,235,0.55)",
                fontSize: "0.72rem",
                lineHeight: 1.4,
                marginTop: "0.3rem",
              }}
            >
              You're one of the first {nativeName} speakers here. Every phrase you translate earns Marks — and opens the door for everyone who comes after you.
            </p>
          </div>
        )}

        {/* Google Translate link for untranslated languages */}
        {!isEnglish && !isTranslated && (
          <a
            href={googleTranslateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{ background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#60a5fa" }}
          >
            <ExternalLink className="w-3 h-3" />
            Translate with Google Translate
          </a>
        )}
        {!isEnglish && !isTranslated && (
          <button
            onClick={() => navigate("/bounty")}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{ background: "rgba(56, 161, 105, 0.12)", border: "1px solid rgba(56, 161, 105, 0.3)", color: "#38a169" }}
          >
            Earn Marks translating {language} → Bounty Posters
          </button>
        )}

        {/* Three specialist summons — only shown on translated-language view.
            All three start closed (LRH pill) so the card stays tidy and the
            user opens only what they care about. Owl for WHY fairness,
            Banker Pig for MATH, Maker Fox for CRAFT of translation. */}
        {!isEnglish && (
          <div className="mt-4 flex flex-col gap-2" style={{ maxWidth: "320px" }}>
            {/* WHY — Owl on the "fairest" philosophical core */}
            <SummonMascot
              mascotId="owl"
              topic="Why 'fairest' isn't about beauty"
              startClosed
              message={
                <>
                  The Mirror Mirror name is from the old fairy-tale question
                  — "mirror, mirror, on the wall, who's the fairest of them
                  all?" — but here <em>fairest</em> doesn't mean <em>prettiest</em>.
                  It means <strong>most fair</strong>. If the site only exists
                  in English, then only English speakers get to participate
                  as equals. That's not fair. So Mirror Mirror translates the
                  entire site into every language a member speaks — and
                  every member who helps translate becomes part of making it
                  fair. Fairness isn't the goal the platform marches toward.
                  It's the <em>mechanism</em> the platform runs on.
                </>
              }
              helperMessage={
                <>
                  This is also why Cost+20% is locked forever, and why
                  creators keep 83.3%. Same principle: make the fair thing
                  the only thing that's possible.
                </>
              }
            />

            {/* MATH — Banker Pig on concrete Mark-earning */}
            <SummonMascot
              mascotId="pig"
              topic="What you actually earn for translating"
              startClosed
              message={
                <>
                  Every phrase you translate into {language} earns you{" "}
                  <strong>Marks</strong>. Marks are effort-differential
                  currency — they track <em>who did the work</em>, not who
                  paid for the work. When a {nativeName} speaker reads
                  your translation, you earned that Mark. When a
                  second-wave translator <em>confirms</em> your translation
                  is accurate, you both earn a smaller Mark on the same
                  phrase. First translators earn the most. Confirmers earn
                  steady-drip returns. Wrong translations lose Marks when
                  corrected — which is the system keeping itself honest.
                </>
              }
              helperMessage={
                <>
                  Translator Marks are redeemable like any other Mark:
                  toward membership, toward Joule conversions, toward
                  platform services. You are paid in the same currency
                  the Founder is paid in.
                </>
              }
            />

            {/* CRAFT — Maker Fox on the actual workflow */}
            <SummonMascot
              mascotId="fox"
              topic="How you actually translate"
              startClosed
              message={
                <>
                  You don't need to translate the whole site. You translate{" "}
                  <em>one phrase at a time</em>, on any page, whenever the
                  mood strikes. Hover any piece of text, click the small
                  translate icon that appears, type the {nativeName}{" "}
                  version, submit. The phrase is live for other {language}{" "}
                  speakers as soon as you save it. Other members can confirm
                  it (small Mark reward for you), refine it (small Mark
                  reward for them, you keep the original credit), or flag it
                  if it's wrong (no penalty unless a majority confirms the
                  flag).
                </>
              }
              helperMessage={
                <>
                  There is no gatekeeper. There is no "official translator."
                  The first member to translate a phrase owns it — until
                  someone translates it better and the community agrees.
                </>
              }
            />
          </div>
        )}

        {/* Golden Key box */}
        <div
          className="mt-3 mx-auto p-3 rounded-lg"
          style={{ background: "rgba(214, 158, 46, 0.08)", border: "1px solid rgba(214, 158, 46, 0.25)", maxWidth: "280px" }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🔑</span>
            <span
              style={{
                color: "#d69e2e",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.05em",
              }}
            >
              GOLDEN KEY — 1 of ?
            </span>
          </div>
          <p style={{ color: "rgba(250,245,235,0.6)", fontSize: "0.75rem", lineHeight: 1.5 }}>
            {strings.goldenKey}
            {" — "}
            <span style={{ color: "rgba(250,245,235,0.4)" }}>
              hidden features, secret tools, and deeper layers.
            </span>
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate(-1)}
            className="py-2 px-4 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate(`/library?lang=${langCode}`)}
            className="py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ background: "#38a169" }}
          >
            Go to Library →
          </button>
        </div>
      </motion.div>
    </DeckCardShell>
  );
};

export default MirrorMirror;
