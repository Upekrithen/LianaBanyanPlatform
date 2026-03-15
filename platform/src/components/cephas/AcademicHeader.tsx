/**
 * Clean academic header — title, author, date, innovation IDs (Session 19).
 */
import { Badge } from "@/components/ui/badge";

interface AcademicHeaderProps {
  title: string;
  author?: string;
  date?: string;
  innovationIds?: string[];
}

export function AcademicHeader({ title, author, date, innovationIds = [] }: AcademicHeaderProps) {
  return (
    <header className="cephas-academic-header mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {(author || date) && (
        <p className="text-sm text-muted-foreground mt-1">
          {author}
          {author && date && " · "}
          {date}
        </p>
      )}
      {innovationIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {innovationIds.map((id) => (
            <Badge key={id} variant="outline">{id}</Badge>
          ))}
        </div>
      )}
    </header>
  );
}
