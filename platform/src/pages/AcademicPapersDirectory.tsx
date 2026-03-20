import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, FileText, ArrowRight, Filter, Key } from "lucide-react";
import cephasData from "../data/cephasIndex.json";
import PaperQuizDialog from "@/components/PaperQuizDialog";
import LearningPathway from "@/components/LearningPathway";
import { PortalPageLayout } from "@/components/PortalPageLayout";

// Papers that have Golden Key quizzes available
const PAPERS_WITH_QUIZZES = new Set([
  "academic-attention-as-funding",
  "academic-boaz-principle-tldr-md",
  "academic-three-gear-currency-tldr-md",
  "academic-ghost-credits-tldr-md",
]);

export default function AcademicPapersDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quizPaper, setQuizPaper] = useState<{ id: string; title: string; url: string } | null>(null);

  const categories = Array.from(new Set(cephasData.map(p => p.category))).sort();

  const filteredPapers = cephasData.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          paper.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (paper.tags && paper.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory ? paper.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <PortalPageLayout maxWidth="xl" xrayId="academic-papers-directory">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary rounded-full text-primary-foreground">
          <BookOpen className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground">Cephas Library Directory</h1>
          <p className="text-lg text-muted-foreground">
            Search across all 1,754 innovations, academic papers, letters, and architectural documents.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search papers, concepts, or tags (e.g., 'Theseus', 'Boaz', 'Economics')..." 
            className="pl-10 h-12 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="whitespace-nowrap"
          >
            All
          </Button>
          {categories.map(cat => (
            <Button 
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPapers.length > 0 ? (
          filteredPapers.map(paper => (
            <Card key={paper.id} className="flex flex-col hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                    {paper.category}
                  </span>
                </div>
                <CardTitle className="text-xl line-clamp-2">{paper.title}</CardTitle>
                {paper.description && (
                  <CardDescription className="text-sm mt-2 line-clamp-3">{paper.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end mt-4">
                {paper.tags && paper.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {paper.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded text-[10px]">
                        {tag}
                      </span>
                    ))}
                    {paper.tags.length > 3 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-[10px]">
                        +{paper.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm ${PAPERS_WITH_QUIZZES.has(paper.id) ? "flex-1" : "w-full"}`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Read on Cephas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                  {PAPERS_WITH_QUIZZES.has(paper.id) && (
                    <button
                      onClick={() => setQuizPaper({ id: paper.id, title: paper.title, url: paper.url })}
                      className="inline-flex items-center justify-center px-3 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors text-sm font-medium gap-1.5"
                      title="Take the Golden Key quiz"
                    >
                      <Key className="w-4 h-4" />
                      Quiz
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No documents found matching your search.</p>
            <Button variant="link" onClick={() => { setSearchTerm(""); setSelectedCategory(null); }}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Learning Pathway — compact version */}
      <LearningPathway compact />

      {/* Golden Key Quiz Dialog */}
      {quizPaper && (
        <PaperQuizDialog
          paperId={quizPaper.id}
          paperTitle={quizPaper.title}
          paperUrl={quizPaper.url}
          isOpen={!!quizPaper}
          onClose={() => setQuizPaper(null)}
        />
      )}
    </PortalPageLayout>
  );
}
