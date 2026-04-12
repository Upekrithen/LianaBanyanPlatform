/**
 * AnecdoteCard — Renders a single anecdote from the anecdotes table.
 * ====================================================================
 * Innovation #2234 (CJ candidate: Founder-First Anecdote Mapping). K404 / B096.
 *
 * Three variants:
 *   full    — everything: title, when/where, markdown body, photos, linked innovations
 *   compact — title + when/where + 2-line excerpt + link to full
 *   teaser  — title + 1-line hook (for feed views)
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Link2, BookOpen, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface Anecdote {
  id: number;
  author_id: string;
  title: string;
  body_markdown: string;
  photo_urls: string[];
  privacy_level: string;
  when_it_happened: string | null;
  where_it_happened: string | null;
  created_at: string;
}

interface LinkedInnovation {
  innovation_id: string;
  relationship: string;
  title: string;
  canonical_number: number | null;
}

export interface AnecdoteCardProps {
  anecdoteId?: number;
  anecdote?: Anecdote;
  variant?: "full" | "compact" | "teaser";
  showLinkedInnovations?: boolean;
  isFounder?: boolean;
  onInnovationClick?: (innovationId: string) => void;
}

const FOUNDER_EMAIL = "upekrithen@gmail.com";

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function AnecdoteCard({
  anecdoteId,
  anecdote: anecdoteProp,
  variant = "full",
  showLinkedInnovations = false,
  isFounder = false,
  onInnovationClick,
}: AnecdoteCardProps) {
  const [anecdote, setAnecdote] = useState<Anecdote | null>(anecdoteProp ?? null);
  const [innovations, setInnovations] = useState<LinkedInnovation[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!anecdoteProp);

  useEffect(() => {
    if (anecdoteProp) {
      setAnecdote(anecdoteProp);
      return;
    }
    if (!anecdoteId) return;

    setLoading(true);
    supabase
      .from("anecdotes")
      .select("*")
      .eq("id", anecdoteId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAnecdote(data as Anecdote);
        setLoading(false);
      });
  }, [anecdoteId, anecdoteProp]);

  useEffect(() => {
    if (!anecdote || !showLinkedInnovations) return;

    supabase
      .from("anecdote_innovation_links")
      .select("innovation_id, relationship")
      .eq("anecdote_id", anecdote.id)
      .then(async ({ data: links }) => {
        if (!links || links.length === 0) return;
        const ids = links.map((l) => l.innovation_id);
        const { data: inns } = await supabase
          .from("innovation_log")
          .select("id, title, canonical_number")
          .in("id", ids);
        if (inns) {
          setInnovations(
            inns.map((inn) => ({
              innovation_id: inn.id,
              title: inn.title,
              canonical_number: inn.canonical_number,
              relationship: links.find((l) => l.innovation_id === inn.id)?.relationship ?? "origin",
            })),
          );
        }
      });
  }, [anecdote, showLinkedInnovations]);

  if (loading) {
    return (
      <div className="rounded-xl p-4 animate-pulse" style={{ background: "#0a1628" }}>
        <div className="h-4 w-48 bg-slate-700 rounded mb-2" />
        <div className="h-3 w-32 bg-slate-800 rounded" />
      </div>
    );
  }

  if (!anecdote) return null;

  const when = anecdote.when_it_happened
    ? new Date(anecdote.when_it_happened).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const excerpt = anecdote.body_markdown.split("\n").filter(Boolean).slice(0, 2).join(" ").slice(0, 200);
  const hook = anecdote.body_markdown.split("\n").find(Boolean)?.slice(0, 100) ?? "";

  /* ── TEASER ── */
  if (variant === "teaser") {
    return (
      <div
        className="rounded-lg p-3 hover:bg-slate-800/40 transition-colors cursor-pointer"
        style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.1)" }}
      >
        <h4
          className="text-sm font-bold mb-0.5"
          style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
        >
          {anecdote.title}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-1">{hook}...</p>
      </div>
    );
  }

  /* ── COMPACT ── */
  if (variant === "compact") {
    return (
      <div
        className="rounded-xl p-4"
        style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.15)" }}
      >
        {/* When / Where */}
        {(when || anecdote.where_it_happened) && (
          <div className="flex items-center gap-3 mb-1.5">
            {when && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar className="w-3 h-3" /> {when}
              </span>
            )}
            {anecdote.where_it_happened && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <MapPin className="w-3 h-3" /> {anecdote.where_it_happened}
              </span>
            )}
          </div>
        )}
        <h4
          className="text-sm font-bold mb-1"
          style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
        >
          {anecdote.title}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{excerpt}...</p>
        {isFounder && <FounderBadge />}
      </div>
    );
  }

  /* ── FULL ── */
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5"
      style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.15)" }}
    >
      {/* When / Where */}
      {(when || anecdote.where_it_happened) && (
        <div className="flex items-center gap-3 mb-2">
          {when && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar className="w-3 h-3" /> {when}
            </span>
          )}
          {anecdote.where_it_happened && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3" /> {anecdote.where_it_happened}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h3
        className="text-lg font-bold mb-3"
        style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
      >
        {anecdote.title}
      </h3>

      {isFounder && <FounderBadge />}

      {/* Body (markdown) */}
      <div className="prose prose-sm prose-invert max-w-none mb-4 text-slate-300 leading-relaxed [&_table]:text-xs [&_th]:text-slate-400 [&_td]:text-slate-300 [&_hr]:border-slate-700 [&_strong]:text-emerald-300 [&_em]:text-slate-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {anecdote.body_markdown}
        </ReactMarkdown>
      </div>

      {/* Photo gallery */}
      {anecdote.photo_urls && anecdote.photo_urls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {anecdote.photo_urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setLightboxUrl(url)}
              className="flex-shrink-0 rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500/40 transition-colors"
            >
              <img
                src={url}
                alt={`${anecdote.title} — photo ${i + 1}`}
                className="w-24 h-24 object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Linked innovations */}
      {showLinkedInnovations && innovations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 mb-2">
            <Link2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-semibold text-slate-400">Linked Innovations</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {innovations.map((inn) => (
              <button
                key={inn.innovation_id}
                onClick={() => onInnovationClick?.(inn.innovation_id)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors hover:bg-emerald-500/20"
                style={{
                  background: "rgba(56,161,105,0.1)",
                  border: "1px solid rgba(56,161,105,0.25)",
                  color: "#6ee7b7",
                }}
              >
                {inn.canonical_number ? `#${inn.canonical_number} ` : ""}
                {inn.title}
                <span className="ml-1 opacity-50">({inn.relationship})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt={anecdote.title}
            className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </motion.article>
  );
}

function FounderBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full mb-3 text-[10px] font-semibold"
      style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", color: "#fbbf24" }}
    >
      <User className="w-3 h-3" />
      Founder&rsquo;s Story
    </div>
  );
}

export default AnecdoteCard;
