/**
 * Clean academic highlighted abstract (Session 19).
 */
interface AbstractBlockProps {
  children: string;
  className?: string;
}

export function AbstractBlock({ children, className = "" }: AbstractBlockProps) {
  return (
    <div className={`cephas-abstract-block bg-muted/50 rounded-lg p-4 text-sm ${className}`}>
      <strong className="text-foreground">Abstract.</strong> {children}
    </div>
  );
}
