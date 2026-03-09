/**
 * Documentation Marketplace Page
 * ===============================
 * Marketplace for community-contributed hints, walkthroughs, and guides.
 * 
 * Contributors earn:
 * - Reputation from helpful votes
 * - Icing (70%) from purchases
 * - Featured placement for quality content
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Lightbulb, 
  ListOrdered, 
  FileText, 
  HelpCircle,
  Search,
  Star,
  ThumbsUp,
  DollarSign,
  Plus,
  Filter,
  Sparkles,
  Home,
  ChefHat,
  Shield,
  Briefcase,
  Monitor,
  Wrench,
  Eye
} from 'lucide-react';
import {
  DOC_CATEGORIES,
  DOC_TYPES,
  SKILL_LEVELS,
  getDocTypeIcon,
  getCategoryIcon,
  formatDocPrice,
  type DocumentationItem,
  type DocType,
  type DocCategory,
} from '@/lib/documentationMarketplace';

const CATEGORY_ICONS: Record<DocCategory, React.ReactNode> = {
  cottage_law: <Home className="h-4 w-4" />,
  technique: <ChefHat className="h-4 w-4" />,
  safety: <Shield className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
  platform: <Monitor className="h-4 w-4" />,
  equipment: <Wrench className="h-4 w-4" />,
};

export default function DocumentationMarketplacePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DocType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | 'all'>('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  // Fetch documentation items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['documentation', selectedType, selectedCategory, searchQuery],
    queryFn: async () => {
      // In production, query documentation_items
      return [] as DocumentationItem[];
    },
  });

  // Fetch featured items
  const { data: featured = [] } = useQuery({
    queryKey: ['documentation-featured'],
    queryFn: async () => {
      return [] as DocumentationItem[];
    },
  });

  const filteredItems = items.filter(item => {
    if (showFreeOnly && item.price_credits > 0) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="landing-page min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Documentation Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Hints, walkthroughs, and guides from the community. Learn or earn!
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Contribute
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{items.length}</div>
                <div className="text-sm text-muted-foreground">Total Docs</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{featured.length}</div>
                <div className="text-sm text-muted-foreground">Featured</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{items.filter(i => i.price_credits === 0).length}</div>
                <div className="text-sm text-muted-foreground">Free Docs</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ThumbsUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">-</div>
                <div className="text-sm text-muted-foreground">Helpful Votes</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Section */}
        {featured.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Featured Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {featured.slice(0, 3).map(item => (
                  <DocCard key={item.id} item={item} featured />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Browse by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {(Object.entries(DOC_CATEGORIES) as [DocCategory, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    selectedCategory === key
                      ? 'bg-primary/10 border-primary'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="mx-auto mb-2">{CATEGORY_ICONS[key]}</div>
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={selectedType} 
            onValueChange={(v) => setSelectedType(v as DocType | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(Object.entries(DOC_TYPES) as [DocType, { label: string }][]).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant={showFreeOnly ? 'default' : 'outline'}
            onClick={() => setShowFreeOnly(!showFreeOnly)}
          >
            Free Only
          </Button>
        </div>

        {/* Document Listing */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hints">
              <Lightbulb className="h-4 w-4 mr-1" />
              Hints
            </TabsTrigger>
            <TabsTrigger value="walkthroughs">
              <ListOrdered className="h-4 w-4 mr-1" />
              Walkthroughs
            </TabsTrigger>
            <TabsTrigger value="guides">
              <BookOpen className="h-4 w-4 mr-1" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-1" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {isLoading ? (
              <div className="text-center py-12">Loading documentation...</div>
            ) : filteredItems.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No documentation yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to contribute helpful guides!
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Write Documentation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <DocCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Other tabs would filter by doc_type */}
          {['hints', 'walkthroughs', 'guides', 'faq'].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No {tab} yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Contribute the first {tab.slice(0, -1)}!
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Write a {tab.slice(0, -1)}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Contributor CTA */}
        <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Earn by Contributing</h3>
                <p className="text-muted-foreground">
                  Share your knowledge. Earn 70% of every purchase + reputation!
                </p>
              </div>
              <Button>
                Start Contributing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DocCard({ item, featured = false }: { item: DocumentationItem; featured?: boolean }) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${featured ? 'ring-2 ring-amber-500' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getDocTypeIcon(item.doc_type)}</span>
            <Badge variant="outline">{DOC_TYPES[item.doc_type].label}</Badge>
          </div>
          {item.price_credits === 0 ? (
            <Badge className="bg-emerald-500">Free</Badge>
          ) : (
            <Badge variant="secondary">{item.price_credits} Credits</Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
        {item.summary && (
          <CardDescription className="line-clamp-2">{item.summary}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {item.average_rating?.toFixed(1) || 'N/A'}
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            {item.helpful_count}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {item.times_viewed}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button className="w-full mt-4" variant={item.price_credits === 0 ? 'default' : 'outline'}>
          {item.price_credits === 0 ? 'Read Now' : `Purchase (${item.price_credits} Credits)`}
        </Button>
      </CardContent>
    </Card>
  );
}
