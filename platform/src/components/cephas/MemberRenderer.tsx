import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MemberRendererProps = {
  title: string;
  markdown: string;
  category?: string | null;
  slug: string;
  templateVars?: Record<string, string>;
};

type MarkdownSection = {
  heading: string;
  body: string;
};

function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split("\n");
  const sections: MarkdownSection[] = [];
  let currentHeading = "Overview";
  let buffer: string[] = [];

  for (const line of lines) {
    if (/^##\s+/.test(line.trim())) {
      if (buffer.length > 0) {
        sections.push({ heading: currentHeading, body: buffer.join("\n").trim() });
      }
      currentHeading = line.replace(/^##\s+/, "").trim();
      buffer = [];
      continue;
    }
    buffer.push(line);
  }

  if (buffer.length > 0) {
    sections.push({ heading: currentHeading, body: buffer.join("\n").trim() });
  }

  return sections.filter((section) => section.body.length > 0);
}

function formatContentType(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MemberRenderer({ title, markdown, category, slug, templateVars = {} }: MemberRendererProps) {
  const sections = useMemo(() => splitMarkdownSections(markdown || ""), [markdown]);

  const statKeys = ["innovationCount", "formalClaims", "patentApplications", "creatorKeeps", "membershipCost"];
  const stats = statKeys
    .map((key) => ({ label: key, value: templateVars[key] }))
    .filter((entry) => entry.value)
    .slice(0, 4);

  const { data: related } = useQuery({
    queryKey: ["cephas-related", category, slug],
    queryFn: async () => {
      if (!category) return [];
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, style, updated_at")
        .eq("category", category)
        .neq("slug", slug)
        .order("updated_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data || [];
    },
    enabled: !!category,
  });

  return (
    <section className="space-y-6 font-sans">
      {stats.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((entry) => (
            <Card key={entry.label} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{formatContentType(entry.label)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{entry.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {sections.length > 1 ? (
        <Accordion type="single" collapsible className="w-full rounded-lg border bg-card px-4">
          {sections.map((section, index) => (
            <AccordionItem key={`${section.heading}-${index}`} value={`section-${index}`}>
              <AccordionTrigger className="text-left text-base">{section.heading}</AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.body}</ReactMarkdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Related Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(related || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">More related Cephas entries are being indexed.</p>
          ) : (
            (related || []).map((item: any) => {
              const contentType = String(item.content_type || item.style || item.category || "article");
              return (
                <Link
                  key={item.id}
                  to={`/cephas/${category}/${item.slug}`}
                  className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">{item.title}</span>
                  <Badge variant="outline">{formatContentType(contentType)}</Badge>
                </Link>
              );
            })
          )}
          <p className="text-xs text-muted-foreground">Viewing: {title}</p>
        </CardContent>
      </Card>
    </section>
  );
}
