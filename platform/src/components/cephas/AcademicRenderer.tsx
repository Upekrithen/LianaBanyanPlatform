import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

type AcademicRendererProps = {
  title: string;
  subtitle?: string | null;
  markdown: string;
  publishedAt?: string | null;
  onSwitchToMember: () => void;
};

type ExtractedBody = {
  abstract: string;
  body: string;
};

function extractAbstractSection(markdown: string): ExtractedBody {
  const lines = markdown.split("\n");
  const abstractStart = lines.findIndex((line) => /^#{1,3}\s*abstract\b/i.test(line.trim()));

  if (abstractStart === -1) {
    return { abstract: "", body: markdown };
  }

  let abstractEnd = lines.length;
  for (let i = abstractStart + 1; i < lines.length; i += 1) {
    if (/^#{1,3}\s+/.test(lines[i].trim())) {
      abstractEnd = i;
      break;
    }
  }

  const abstract = lines.slice(abstractStart + 1, abstractEnd).join("\n").trim();
  const body = [...lines.slice(0, abstractStart), ...lines.slice(abstractEnd)].join("\n").trim();
  return { abstract, body };
}

export function AcademicRenderer({
  title,
  subtitle,
  markdown,
  publishedAt,
  onSwitchToMember,
}: AcademicRendererProps) {
  const { abstract, body } = useMemo(() => extractAbstractSection(markdown || ""), [markdown]);
  const publicationDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : undefined;

  const counters = { h2: 0, h3: 0, h4: 0 };

  return (
    <article className="mx-auto max-w-[720px] font-serif leading-8 text-slate-900 dark:text-slate-100 print:max-w-full">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .academic-watermark { background: #f5f5f5 !important; color: #4b5563 !important; }
          .academic-prose { max-width: 100% !important; }
        }
        .academic-prose .footnotes {
          margin-top: 2rem;
          font-size: 0.85rem;
          color: #4b5563;
        }
      `}</style>

      <header className="academic-watermark mb-8 rounded-md border border-slate-200 bg-slate-100 px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Cephas - Liana Banyan
      </header>

      <div className="no-print mb-6 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onSwitchToMember}>
          Member View
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          Export PDF
        </Button>
      </div>

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
        {subtitle ? <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
        <p className="mt-4 text-sm italic text-slate-600 dark:text-slate-300">Jonathan Jones - Liana Banyan Corporation</p>
        {publicationDate ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{publicationDate}</p> : null}
      </header>

      {abstract ? (
        <section className="mb-10 border-l-4 border-slate-700 bg-slate-50 p-6 dark:border-slate-300 dark:bg-slate-900/40">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Abstract</h2>
          <div className="academic-prose prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{abstract}</ReactMarkdown>
          </div>
        </section>
      ) : null}

      <div className="academic-prose prose prose-slate max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => {
              counters.h2 += 1;
              counters.h3 = 0;
              counters.h4 = 0;
              return (
                <h2 className="mt-10 border-b border-slate-200 pb-2 text-2xl font-semibold dark:border-slate-700">
                  {counters.h2}. {children}
                </h2>
              );
            },
            h3: ({ children }) => {
              counters.h3 += 1;
              counters.h4 = 0;
              return (
                <h3 className="mt-8 text-xl font-semibold">
                  {counters.h2}.{counters.h3} {children}
                </h3>
              );
            },
            h4: ({ children }) => {
              counters.h4 += 1;
              return (
                <h4 className="mt-6 text-lg font-semibold">
                  {counters.h2}.{counters.h3}.{counters.h4} {children}
                </h4>
              );
            },
          }}
        >
          {body}
        </ReactMarkdown>
      </div>
    </article>
  );
}
