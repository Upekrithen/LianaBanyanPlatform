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
  const greeting = interpolate(strings.greeting, vars);
  const description = interpolate(strings.description, vars);

  const googleTranslateUrl = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=https://museum.lianabanyan.com`;

  return (
    <DeckCardShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center text-center px-2"
      >
        <div className="text-4xl mb-2">💎</div>

        <h2
          style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
            fontWeight: 700,
            color: "#38a169",
            marginBottom: "0.5rem",
          }}
        >
          Mirror Mirror
        </h2>

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

        {/* Greeting */}
        {!isEnglish && (
          <p style={{ color: "#d69e2e", fontSize: "0.8rem", lineHeight: 1.6, maxWidth: "300px", marginBottom: "0.5rem", fontWeight: 500 }}>
            {greeting}
          </p>
        )}

        {/* Description */}
        <p style={{ color: "#faf5eb", fontSize: "0.8rem", lineHeight: 1.7, maxWidth: "300px" }}>
          {isEnglish
            ? "You found a keyhole. Hidden doors are scattered throughout — each one unlocks something different. This one opens Mirror Mirror, which translates the entire site into 110+ languages. Fairest means everyone can read it."
            : description}
        </p>

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

        {/* CTA tagline */}
        <p
          className="mt-3"
          style={{ color: "rgba(56, 161, 105, 0.7)", fontSize: "0.7rem", fontStyle: "italic", fontFamily: "'Crimson Pro', Georgia, serif" }}
        >
          {strings.cta}
        </p>

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
