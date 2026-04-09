import { useRef, useCallback, useState } from "react";
import { Copy, Check, FileText, Share2, Linkedin, Twitter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthorBio } from "./AuthorBio";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PUBLICATION_TYPES: Record<string, { color: string; label: string; series: string }> = {
  paper:           { color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300", label: "Working Paper", series: "Working Paper Series" },
  article:         { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",   label: "Article",       series: "Article Series" },
  pudding:         { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", label: "Pudding",       series: "Pudding Series" },
  formal:          { color: "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300",     label: "A&A Formal",    series: "Formal Document Series" },
  "business-plan": { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", label: "Business Plan", series: "Business Plan Series" },
  economics:       { color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",         label: "Economics",     series: "Economics Series" },
};

export interface AcademicPaperLayoutProps {
  title: string;
  subtitle?: string;
  author?: string;
  authorTitle?: string;
  date?: string;
  paperNumber?: string;
  abstract?: string;
  category?: string;
  publicationType?: string;
  innovationNumbers?: number[];
  relatedSlugs?: string[];
  slug?: string;
  citationOverride?: string;
  onSwitchView?: () => void;
  children: React.ReactNode;
}

export function AcademicPaperLayout({
  title,
  subtitle,
  author = "Jonathan Jones",
  authorTitle: authorTitleProp = "Founder & General Manager, Liana Banyan Corporation",
  date,
  paperNumber,
  abstract,
  category,
  publicationType = "article",
  relatedSlugs = [],
  slug,
  citationOverride,
  onSwitchView,
  children,
}: AcademicPaperLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [citationCopied, setCitationCopied] = useState(false);
  const navigate = useNavigate();

  const typeInfo = PUBLICATION_TYPES[publicationType] ?? PUBLICATION_TYPES.article;

  const authorLast = author.includes(" ") ? author.split(" ").pop() : author;
  const authorInitial = author.charAt(0);
  const year = date?.match(/\d{4}/)?.[0] ?? "2026";

  const citationText = citationOverride
    ?? `${authorLast}, ${authorInitial}. (${year}). ${title}. Liana Banyan ${typeInfo.series}${paperNumber ? `, ${paperNumber}` : ""}.`;

  const copyCitation = useCallback(() => {
    navigator.clipboard.writeText(citationText);
    setCitationCopied(true);
    toast({ title: "Citation copied", description: "APA citation is on your clipboard." });
    setTimeout(() => setCitationCopied(false), 2000);
  }, [citationText, toast]);

  const downloadPdf = useCallback(async () => {
    if (!contentRef.current) return;
    toast({ title: "Generating PDF…", description: "This may take a moment." });
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - 20;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    let position = 10;
    pdf.addImage(imgData, "PNG", 10, position, imgW, imgH);
    heightLeft -= pageH - 20;
    while (heightLeft > 0) {
      position = heightLeft - imgH + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgW, imgH);
      heightLeft -= pageH - 20;
    }
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40);
    pdf.save(`${safeTitle}_LianaBanyan.pdf`);
  }, [title, toast]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const { data: relatedDocs } = useQuery({
    queryKey: ["academic-related", relatedSlugs, category, slug],
    queryFn: async () => {
      let query = supabase.from("cephas_content_registry").select("title, slug, category, publication_type");
      if (relatedSlugs.length > 0) {
        query = query.in("slug", relatedSlugs);
      } else if (category) {
        query = query.eq("category", category).neq("slug", slug ?? "").limit(6);
      } else {
        return [];
      }
      const { data } = await query;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-8 py-8">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to={category ? `/cephas/${category}` : "/cephas"}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to {category || "Cephas"}
        </Link>
        {onSwitchView && (
          <Button variant="outline" size="sm" onClick={onSwitchView} className="gap-1.5 text-xs">
            👤 Member View
          </Button>
        )}
      </div>

      <div ref={contentRef}>
        {/* Institutional header */}
        <header className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-['Source_Sans_3',sans-serif] mb-1">
            Liana Banyan Corporation
          </p>
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/70 font-['Source_Sans_3',sans-serif]">
            {typeInfo.series}
          </p>

          <hr className="my-6 border-foreground/20" />

          <h1 className="text-[2rem] sm:text-[2.25rem] leading-tight font-bold font-['Crimson_Pro',Georgia,serif] text-foreground">
            {title}
          </h1>
          {subtitle && (
            <h2 className="text-lg text-muted-foreground font-['Crimson_Pro',Georgia,serif] mt-2 italic">
              {subtitle}
            </h2>
          )}

          <div className="mt-4 space-y-0.5">
            <p className="text-[0.95rem] text-muted-foreground font-['Source_Sans_3',sans-serif]">
              {author}
            </p>
            <p className="text-xs text-muted-foreground/70 font-['Source_Sans_3',sans-serif]">
              {authorTitleProp}
            </p>
            {date && (
              <p className="text-xs text-muted-foreground/60 font-['Source_Sans_3',sans-serif]">
                {date}
              </p>
            )}
          </div>

          <hr className="my-6 border-foreground/20" />
        </header>

        {/* Abstract */}
        {abstract && (
          <section className="mb-8 px-4 sm:px-8 py-5 bg-muted/30 rounded-lg border border-muted">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-['Source_Sans_3',sans-serif] mb-3">
              Abstract
            </h3>
            <p className="text-[0.95rem] leading-relaxed italic text-foreground/80 font-['Crimson_Pro',Georgia,serif]">
              {abstract}
            </p>
          </section>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Button variant="outline" size="sm" onClick={downloadPdf} className="gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5" /> Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={copyCitation} className="gap-1.5 text-xs">
            {citationCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {citationCopied ? "Copied!" : "Cite This Paper"}
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
              <Twitter className="w-3.5 h-3.5" /> X / Twitter
            </a>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { navigator.clipboard.writeText(shareUrl); toast({ title: "Link copied" }); }}>
            <Share2 className="w-3.5 h-3.5" /> Copy Link
          </Button>
        </div>

        {/* Body content */}
        <article className="academic-body font-['Crimson_Pro',Georgia,serif] text-[1.05rem] leading-[1.8] max-w-[680px] mx-auto [&_h1]:font-['Source_Sans_3',sans-serif] [&_h1]:font-semibold [&_h2]:font-['Source_Sans_3',sans-serif] [&_h2]:font-semibold [&_h3]:font-['Source_Sans_3',sans-serif] [&_h3]:font-semibold [&_h4]:font-['Source_Sans_3',sans-serif] [&_h4]:font-semibold [&_sup]:text-[0.75em] [&_sup]:text-primary prose prose-slate dark:prose-invert max-w-none">
          {children}
        </article>
      </div>

      {/* Citation */}
      <section className="mt-10 pt-6 border-t space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-['Source_Sans_3',sans-serif]">
          Citation
        </h3>
        <p className="text-sm text-muted-foreground font-['Crimson_Pro',Georgia,serif] italic">
          {citationText}
        </p>
      </section>

      {/* Related publications */}
      {relatedDocs && relatedDocs.length > 0 && (
        <section className="mt-8 pt-6 border-t space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-['Source_Sans_3',sans-serif]">
            Related Publications
          </h3>
          <ul className="space-y-1">
            {relatedDocs.map((doc: any) => {
              const dt = PUBLICATION_TYPES[doc.publication_type] ?? PUBLICATION_TYPES.article;
              return (
                <li key={doc.slug}>
                  <button
                    onClick={() => navigate(`/cephas/${doc.category}/${doc.slug}`)}
                    className="text-sm text-primary hover:underline text-left"
                  >
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[0.65rem] mr-1.5 ${dt.color}`}>
                      {dt.label}
                    </span>
                    {doc.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Author bio */}
      <AuthorBio />
    </div>
  );
}
