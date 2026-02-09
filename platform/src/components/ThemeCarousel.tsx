import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Theme {
  id: string;
  theme_name: string;
  css_content: string;
  is_default: boolean;
  preview_image_url: string | null;
}

interface ThemeCarouselProps {
  projectId: string;
  onThemeChange?: () => void;
}

export function ThemeCarousel({ projectId, onThemeChange }: ThemeCarouselProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemes();
  }, [projectId]);

  const loadThemes = async () => {
    const { data, error } = await supabase
      .from('project_themes')
      .select('*')
      .eq('project_id', projectId)
      .order('is_default', { ascending: false });

    if (!error && data) {
      setThemes(data);
      const defaultTheme = data.find(t => t.is_default);
      if (defaultTheme) {
        setSelectedTheme(defaultTheme.id);
        applyTheme(defaultTheme.css_content);
      }
    }
    setLoading(false);
  };

  const applyTheme = (cssContent: string) => {
    let styleElement = document.getElementById('project-theme-style') as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'project-theme-style';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = cssContent;
  };

  const handleThemeClick = async (theme: Theme) => {
    setSelectedTheme(theme.id);
    applyTheme(theme.css_content);
    localStorage.setItem(`project-theme-${projectId}`, theme.id);
    
    // Update is_default in database
    await supabase
      .from('project_themes')
      .update({ is_default: false })
      .eq('project_id', projectId);
    
    await supabase
      .from('project_themes')
      .update({ is_default: true })
      .eq('id', theme.id);
    
    toast.success(`Theme "${theme.theme_name}" applied`);
    onThemeChange?.();
    loadThemes();
  };

  const handleDeleteClick = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThemeToDelete(themeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!themeToDelete) return;

    const { error } = await supabase
      .from('project_themes')
      .delete()
      .eq('id', themeToDelete);

    if (error) {
      toast.error('Failed to delete theme');
      console.error(error);
    } else {
      toast.success('Theme deleted');
      loadThemes();
    }

    setDeleteDialogOpen(false);
    setThemeToDelete(null);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading themes...</div>;
  }

  if (themes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No themes uploaded yet. Upload your first theme to get started.
      </div>
    );
  }

  return (
    <>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {themes.map((theme) => (
            <CarouselItem key={theme.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  selectedTheme === theme.id ? 'ring-2 ring-primary' : ''
                } ${hoveredTheme === theme.id ? 'scale-105 shadow-lg z-10' : ''}`}
                onClick={() => handleThemeClick(theme)}
                onMouseEnter={() => setHoveredTheme(theme.id)}
                onMouseLeave={() => setHoveredTheme(null)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-muted overflow-hidden rounded-t-lg">
                    {theme.preview_image_url ? (
                      <img
                        src={theme.preview_image_url}
                        alt={theme.theme_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Preview
                      </div>
                    )}
                    {selectedTheme === theme.id && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute bottom-2 right-2 h-8 w-8"
                      onClick={(e) => handleDeleteClick(theme.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{theme.theme_name}</h3>
                    {theme.is_default && (
                      <span className="text-xs text-muted-foreground">Default</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this theme? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
