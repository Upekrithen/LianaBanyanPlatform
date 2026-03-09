import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectCategoryManagerProps {
  projectId: string;
}

interface AggregateData {
  project_category: string;
  avg_position_cost: number;
  avg_position_profit: number;
  avg_completion_time_days: number;
  total_projects_analyzed: number;
  min_cost: number;
  max_cost: number;
  min_profit: number;
  max_profit: number;
}

export const ProjectCategoryManager = ({ projectId }: ProjectCategoryManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);

  useEffect(() => {
    loadCategoryData();
  }, [projectId]);

  const loadCategoryData = async () => {
    try {
      // Load project category
      const { data: categoryData, error: categoryError } = await supabase
        .from('project_categories')
        .select('category, tags')
        .eq('project_id', projectId)
        .single();

      if (categoryError && categoryError.code !== 'PGRST116') throw categoryError;

      if (categoryData) {
        setCategory(categoryData.category);
        setTags(categoryData.tags || []);

        // Load aggregate data for this category
        const { data: aggregateData, error: aggregateError } = await supabase
          .from('project_aggregate_data')
          .select('*')
          .eq('project_category', categoryData.category)
          .single();

        if (aggregateError && aggregateError.code !== 'PGRST116') throw aggregateError;
        
        if (aggregateData) {
          setAggregateData(aggregateData);
        }
      }
    } catch (error) {
      console.error('Error loading category data:', error);
      toast({
        title: "Error",
        description: "Failed to load category data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!category.trim()) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('project_categories')
        .upsert({
          project_id: projectId,
          category: category.trim(),
          tags
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project category saved successfully"
      });

      loadCategoryData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Project Category & Liana Banyan Integration
          </CardTitle>
          <CardDescription>
            Categorize your project to share aggregate data with similar projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="category">Project Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Software Development, Manufacturing, Marketing"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Similar projects in this category will share aggregate cost/margin data
            </p>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
              />
              <Button onClick={addTag} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Category
          </Button>
        </CardContent>
      </Card>

      {aggregateData && (
        <Card>
          <CardHeader>
            <CardTitle>Aggregate Data from Similar Projects</CardTitle>
            <CardDescription>
              Insights from {aggregateData.total_projects_analyzed} projects in "{aggregateData.project_category}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Position Cost</p>
                <p className="text-2xl font-bold">
                  ${aggregateData.avg_position_cost?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Position Margin</p>
                <p className="text-2xl font-bold">
                  ${aggregateData.avg_position_profit?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                <p className="text-2xl font-bold">
                  {aggregateData.avg_completion_time_days || 0} days
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Projects Analyzed</p>
                <p className="text-2xl font-bold">
                  {aggregateData.total_projects_analyzed}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Cost/Margin Ranges</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cost Range:</span>
                  <p className="font-medium">
                    ${aggregateData.min_cost?.toFixed(2)} - ${aggregateData.max_cost?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Margin Range:</span>
                  <p className="font-medium">
                    ${aggregateData.min_profit?.toFixed(2)} - ${aggregateData.max_profit?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};