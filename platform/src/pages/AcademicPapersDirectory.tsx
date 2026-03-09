import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, FileText, ArrowRight, Filter } from "lucide-react";
import cephasData from "../data/cephasIndex.json";

export default function AcademicPapersDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(cephasData.map(p => p.category))).sort();

  const filteredPapers = cephasData.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          paper.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (paper.tags && paper.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory ? paper.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-12 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 rounded-full text-white">
          <BookOpen className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Cephas Library Directory</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Search across all 1,370 innovations, academic papers, letters, and architectural documents.
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
                      <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px]">
                        {tag}
                      </span>
                    ))}
                    {paper.tags.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px]">
                        +{paper.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <a 
                  href={paper.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Read on Cephas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
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
    </div>
  );
}
