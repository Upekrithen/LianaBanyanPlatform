/**
 * FounderStory -- /founder/story
 * ===============================
 * Innovation #2234 (CJ candidate: Founder-First Anecdote Mapping). K404 / B096.
 * ADD-21 migration: content migrated from Escape Velocity Site founder/index.html. BP073.
 *
 * The Founder goes first. Every innovation traces to a real lived experience
 * with a photograph. This page is a reference work -- clean, library-quality
 * typography. Not a scrapbook, not a social feed.
 *
 * Route: /founder/story
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { SummonMascot } from "@/components/museum/SummonMascot";
import { AnecdoteCard } from "@/components/museum/AnecdoteCard";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

const FOUNDER_EMAIL = "upekrithen@gmail.com";

interface AnecdoteRow {
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

export default function FounderStory() {
  const [anecdotes, setAnecdotes] = useState<AnecdoteRow[]>([]);
  const [innovationCount, setInnovationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [founderId, setFounderId] = useState<string | null>(null);

  useEffect(() => {
    loadFounderData();
  }, []);

  async function loadFounderData() {
    setLoading(true);

    // Find founder user
    const { data: founderAnecdotes } = await supabase
      .from("anecdotes")
      .select("*")
      .eq("privacy_level", "public")
      .order("created_at", { ascending: false });

    if (founderAnecdotes && founderAnecdotes.length > 0) {
      setFounderId(founderAnecdotes[0].author_id);
      setAnecdotes(founderAnecdotes as AnecdoteRow[]);
    }

    // Count linked innovations
    const { count } = await supabase
      .from("anecdote_innovation_links")
      .select("innovation_id", { count: "exact", head: true });
    setInnovationCount(count ?? 0);

    setLoading(false);
  }

  return (
    <MuseumShell>
      <div className="min-h-screen px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* ── Hero Section ── */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              I yam what I yam.
            </h1>
            <p className="text-sm text-slate-400 italic leading-relaxed max-w-md mx-auto mb-1">
              Living life on Purpose, WITH Purpose.
            </p>
            <p className="text-xs text-slate-500 italic max-w-md mx-auto">
              Popeye the Sailor Man (E.C. Segar 1929) &middot; Founder direct BP073 2026-06-04 canonical signature.
            </p>

            {/* Counter */}
            <div
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl"
              style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.2)" }}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-300">
                Founder anecdotes mapped:{" "}
                <span className="font-bold text-emerald-400">{innovationCount}</span>
                {" "}of 2,236 innovations
              </span>
            </div>
          </div>

          {/* ── Credentials Strip ── */}
          <div
            className="rounded-xl p-4 mb-6 text-center"
            style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.2)" }}
          >
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              PK &middot; BA Bible &middot; 2yr Seminary (non-Catholic) &middot; Ordained Minister &middot;{" "}
              ARNG 11B DRT OCS BOLC 15A IFR &middot; Veteran &middot; Father of 8 &middot; the Anjin &middot;{" "}
              Crewman #6 &middot; One Army Ant &middot; Founder &amp; General Manager, Liana Banyan Corporation
            </p>
            <div className="flex flex-col items-center gap-1">
              <img
                src="/img/founder/mark-9-24-forearm-01.jpg"
                alt="Mark 9:24 -- Lord, I believe; help thou mine unbelief."
                style={{ width: 120, borderRadius: 6, border: "1px solid rgba(56,161,105,0.3)" }}
              />
              <p className="text-xs text-slate-500 italic">
                Mark 9:24 -- Lord, I believe; help thou mine unbelief.
              </p>
              <Link
                to="/founder/faith-statement"
                className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                Read the full Faith Statement
              </Link>
            </div>
          </div>

          {/* ── Goat Summon (top) ── */}
          <SummonMascot
            mascotId="goat"
            topic="Why the Founder goes first"
            startClosed
            message={
              <>
                Every feature on Liana Banyan was born from something that actually happened
                to someone. The Founder is documenting his version first -- 2,236 innovations,
                all traceable to lived moments, with photographs. When you contribute your own
                innovation, you&rsquo;ll follow the same template. Going first is not a
                performance -- it&rsquo;s how the platform stays honest across decades.
              </>
            }
            className="mb-6"
          />

          {/* ── Anecdote Feed ── */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl p-5 animate-pulse" style={{ background: "#0a1628" }}>
                  <div className="h-3 w-24 bg-slate-700 rounded mb-3" />
                  <div className="h-5 w-64 bg-slate-700 rounded mb-3" />
                  <div className="h-3 w-full bg-slate-800 rounded mb-2" />
                  <div className="h-3 w-4/5 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : anecdotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">
                The Founder&rsquo;s anecdotes will appear here once they&rsquo;re seeded into the database.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {anecdotes.map((a) => (
                <AnecdoteCard
                  key={a.id}
                  anecdote={a}
                  variant="full"
                  showLinkedInnovations
                  isFounder
                />
              ))}
            </div>
          )}

          {/* ── Turtle Summon (bottom) ── */}
          <div className="mt-8">
            <SummonMascot
              mascotId="turtle"
              topic="What you're reading here"
              startClosed
              message={
                <>
                  The Founder is telling the stories behind the features. Each one has a
                  photograph (or will, as he gets them into the system). Each one traces to a
                  specific moment. Nothing here is invented in theory -- it&rsquo;s all
                  memorialized after the fact, once we knew it worked. That&rsquo;s the whole
                  epistemology in one page.
                </>
              }
            />
          </div>
        </div>
      </div>
    </MuseumShell>
  );
}
