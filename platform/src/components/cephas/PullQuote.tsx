/**
 * Pudding-style pull quote (Session 19). Founder/highlight callout.
 */
interface PullQuoteProps {
  quote: string;
  attribution?: string;
  className?: string;
}

export function PullQuote({ quote, attribution, className = "" }: PullQuoteProps) {
  return (
    <blockquote className={`cephas-pull-quote border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground ${className}`}>
      <p>{quote}</p>
      {attribution && <cite className="block mt-2 not-italic text-sm">— {attribution}</cite>}
    </blockquote>
  );
}
