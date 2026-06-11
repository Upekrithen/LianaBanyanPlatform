/**
 * CUE CARD DESTINATION CONFIGURATOR
 * ==================================
 * Innovation #1361: Hofund Destination Configurator
 *
 * TODO BP079 Wave A: This component needs rewrite for new schema
 * Wave A schema has simplified destination model:
 * - destination_type: 'onboard' | 'storefront' | 'walkthrough'
 * - destination_url: string (just a URL, no project binding)
 * - No project_ids, category_slug, is_own_project fields
 *
 * The createDestination function signature changed to:
 * createDestination(cueCardId, destinationType, destinationUrl, options)
 *
 * This UI will need to be redesigned to match the new model.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Target, Folder, Layers, Grid3X3, Sparkles, Copy, ExternalLink, X } from 'lucide-react';
import {
  createDestination,
  type DestinationType,
  type CreateDestinationResult,
} from '@/lib/cueCardDestinationService';

// ============================================================================
// TYPES
// ============================================================================

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface CueCardDestinationConfigProps {
  templateId: string | null;
  templateTitle?: string;
  onDestinationCreated?: (result: CreateDestinationResult) => void;
  onClose?: () => void;
}

// ============================================================================
// CATEGORY OPTIONS
// ============================================================================

const CATEGORY_OPTIONS = [
  { slug: 'food', label: 'Food & Home', icon: '🍽️' },
  { slug: 'health', label: 'Health & Safety', icon: '🏥' },
  { slug: 'finance', label: 'Finance & Work', icon: '💰' },
  { slug: 'creative', label: 'Creative & Learning', icon: '🎨' },
  { slug: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { slug: 'technology', label: 'Technology', icon: '💻' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function CueCardDestinationConfig({
  templateId,
  templateTitle,
  onDestinationCreated,
  onClose,
}: CueCardDestinationConfigProps) {
  const { user } = useAuth();

  // Form state
  const [destinationType, setDestinationType] = useState<DestinationType>('portfolio');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [includeOwnedOnly, setIncludeOwnedOnly] = useState(false);
  const [isOwnProject, setIsOwnProject] = useState(true);
  const [displayName, setDisplayName] = useState('');

  // Data state
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateDestinationResult | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      // Fetch user's own projects
      const { data: owned } = await supabase
        .from('projects')
        .select('id, name, description')
        .eq('owner_id', user.id)
        .order('name');

      setMyProjects(owned || []);

      // Fetch all projects (for promoting others)
      const { data: all } = await supabase
        .from('projects')
        .select('id, name, description')
        .order('name')
        .limit(100);

      setAllProjects(all || []);
    };

    fetchProjects();
  }, [user]);

  // Handle project selection
  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      }
      // Limit based on destination type
      const maxProjects = destinationType === 'single_project' ? 1 : 10;
      if (prev.length >= maxProjects) {
        toast.error(`Maximum ${maxProjects} project${maxProjects > 1 ? 's' : ''} allowed`);
        return prev;
      }
      return [...prev, projectId];
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (destinationType === 'single_project' && selectedProjects.length !== 1) {
      toast.error('Please select exactly one project');
      return;
    }
    if (destinationType === 'multi_project' && selectedProjects.length < 2) {
      toast.error('Please select at least two projects');
      return;
    }
    if (destinationType === 'category' && !categorySlug) {
      toast.error('Please select a category');
      return;
    }

    setIsLoading(true);

    const destinationResult = await createDestination(
      user.id,
      templateId,
      destinationType,
      {
        projectIds: selectedProjects,
        categorySlug: destinationType === 'category' ? categorySlug : undefined,
        includeOwnedOnly,
        isOwnProject,
        displayName: displayName || undefined,
      }
    );

    setIsLoading(false);

    if (destinationResult) {
      setResult(destinationResult);
      toast.success('Destination configured!');
      onDestinationCreated?.(destinationResult);
    } else {
      toast.error('Failed to create destination');
    }
  };

  // Copy URL to clipboard
  const copyUrl = () => {
    if (result?.context_url) {
      navigator.clipboard.writeText(result.context_url);
      toast.success('URL copied to clipboard!');
    }
  };

  // Get projects to display based on ownership toggle
  const projectsToShow = isOwnProject ? myProjects : allProjects;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Cue Card Destination</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          {templateTitle
            ? `Configure where "${templateTitle}" sends visitors`
            : 'Configure where this Cue Card sends visitors'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Result display */}
        {result && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Destination Created!</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Card Code:</span>{' '}
                <Badge variant="outline">{result.card_code}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">URL:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                  {result.context_url}
                </code>
                <Button variant="ghost" size="icon" onClick={copyUrl} aria-label="Copy URL">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" asChild aria-label="Open link in new tab">
                  <a href={result.context_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Destination Type Selection */}
        <div className="space-y-3">
          <Label>Where should this Cue Card send visitors?</Label>
          <RadioGroup
            value={destinationType}
            onValueChange={(v) => {
              setDestinationType(v as DestinationType);
              setSelectedProjects([]);
            }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="portfolio" id="portfolio" />
              <Label htmlFor="portfolio" className="flex items-center gap-2 cursor-pointer">
                <Folder className="w-4 h-4 text-muted-foreground" />
                My Full Portfolio (default)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single_project" id="single_project" />
              <Label htmlFor="single_project" className="flex items-center gap-2 cursor-pointer">
                <Target className="w-4 h-4 text-muted-foreground" />
                Single Project
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multi_project" id="multi_project" />
              <Label htmlFor="multi_project" className="flex items-center gap-2 cursor-pointer">
                <Layers className="w-4 h-4 text-muted-foreground" />
                Multiple Projects (visitor chooses)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="category" id="category" />
              <Label htmlFor="category" className="flex items-center gap-2 cursor-pointer">
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                Category
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Project Selection (for single/multi) */}
        {(destinationType === 'single_project' || destinationType === 'multi_project') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Select Project{destinationType === 'multi_project' ? 's' : ''}
              </Label>
              <Badge variant="secondary">
                {selectedProjects.length} selected
              </Badge>
            </div>

            {/* Ownership toggle */}
            <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
              <Checkbox
                id="not-own-project"
                checked={!isOwnProject}
                onCheckedChange={(checked) => {
                  setIsOwnProject(!checked);
                  setSelectedProjects([]);
                }}
              />
              <Label htmlFor="not-own-project" className="text-sm cursor-pointer">
                Promoting someone else's project (earn promotion credit)
              </Label>
            </div>

            {/* Project list */}
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
              {projectsToShow.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isOwnProject
                    ? "You don't have any projects yet"
                    : "No projects available"}
                </p>
              ) : (
                projectsToShow.map((project) => (
                  <div
                    key={project.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedProjects.includes(project.id)
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleProject(project.id)}
                  >
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => toggleProject(project.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Category Selection */}
        {destinationType === 'category' && (
          <div className="space-y-3">
            <Label>Select Category</Label>
            <Select value={categorySlug} onValueChange={setCategorySlug}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="owned-only"
                checked={includeOwnedOnly}
                onCheckedChange={(checked) => setIncludeOwnedOnly(!!checked)}
              />
              <Label htmlFor="owned-only" className="text-sm cursor-pointer">
                Only show projects I own
              </Label>
            </div>
          </div>
        )}

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name (optional)</Label>
          <Input
            id="display-name"
            placeholder="e.g., 'My Food Projects', 'HexIsle Launch'"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            A friendly name to help you identify this destination
          </p>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Destination'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default CueCardDestinationConfig;
