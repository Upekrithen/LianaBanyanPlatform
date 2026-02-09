import { Check, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Theme {
  id: string;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
}

const themes: Theme[] = [
  {
    id: 'default',
    name: 'Professional Blue',
    description: 'Clean, professional design with blue accents',
    preview: {
      primary: 'hsl(222.2, 47.4%, 11.2%)',
      secondary: 'hsl(210, 40%, 96.1%)',
      background: 'hsl(0, 0%, 100%)',
      accent: 'hsl(210, 40%, 96.1%)'
    }
  },
  {
    id: 'raw-materials',
    name: 'Raw Materials',
    description: 'Warm beige with vibrant multi-color accents',
    preview: {
      primary: 'hsl(12, 100%, 60%)',
      secondary: 'hsl(270, 65%, 45%)',
      background: 'hsl(35, 20%, 92%)',
      accent: 'hsl(230, 90%, 60%)'
    }
  },
  {
    id: 'christopher-ireland',
    name: 'Elegant Minimal',
    description: 'Sophisticated cream with elegant typography',
    preview: {
      primary: 'hsl(0, 0%, 10%)',
      secondary: 'hsl(30, 10%, 88%)',
      background: 'hsl(30, 15%, 96%)',
      accent: 'hsl(30, 10%, 85%)'
    }
  },
  {
    id: 'duna',
    name: 'Artistic Pastels',
    description: 'Soft painted colors with organic feel',
    preview: {
      primary: 'hsl(25, 90%, 65%)',
      secondary: 'hsl(280, 50%, 75%)',
      background: 'hsl(30, 40%, 92%)',
      accent: 'hsl(340, 60%, 75%)'
    }
  },
  {
    id: 'reducto',
    name: 'Clean Purple',
    description: 'Minimal design with striking purple',
    preview: {
      primary: 'hsl(290, 70%, 50%)',
      secondary: 'hsl(290, 20%, 95%)',
      background: 'hsl(0, 0%, 100%)',
      accent: 'hsl(290, 60%, 60%)'
    }
  },
  {
    id: 'brainfish',
    name: 'Playful Cyan',
    description: 'Fun, approachable with sky blue',
    preview: {
      primary: 'hsl(185, 70%, 55%)',
      secondary: 'hsl(75, 70%, 60%)',
      background: 'hsl(185, 75%, 85%)',
      accent: 'hsl(75, 70%, 60%)'
    }
  },
  {
    id: 'dynamix',
    name: 'Professional Dark',
    description: 'Corporate dark navy with orange CTAs',
    preview: {
      primary: 'hsl(18, 100%, 60%)',
      secondary: 'hsl(215, 25%, 25%)',
      background: 'hsl(215, 30%, 15%)',
      accent: 'hsl(18, 100%, 60%)'
    }
  },
  {
    id: 'zerorez',
    name: 'Bright Service',
    description: 'Energetic cyan for service businesses',
    preview: {
      primary: 'hsl(188, 100%, 42%)',
      secondary: 'hsl(122, 40%, 50%)',
      background: 'hsl(0, 0%, 100%)',
      accent: 'hsl(220, 90%, 40%)'
    }
  },
  {
    id: 'phamily',
    name: 'Forest Green',
    description: 'Rich green, mobile-optimized pharmacy theme',
    preview: {
      primary: 'hsl(165, 60%, 25%)',
      secondary: 'hsl(35, 20%, 85%)',
      background: 'hsl(0, 0%, 100%)',
      accent: 'hsl(165, 50%, 30%)'
    }
  },
  {
    id: 'langarica',
    name: 'Portfolio Purple',
    description: 'Dark creative portfolio with violet accents',
    preview: {
      primary: 'hsl(280, 70%, 65%)',
      secondary: 'hsl(265, 50%, 20%)',
      background: 'hsl(265, 75%, 8%)',
      accent: 'hsl(280, 70%, 65%)'
    }
  },
  {
    id: 'grabandgo',
    name: 'Marketplace Orange',
    description: 'Playful illustrated marketplace style',
    preview: {
      primary: 'hsl(18, 100%, 50%)',
      secondary: 'hsl(35, 35%, 70%)',
      background: 'hsl(35, 30%, 88%)',
      accent: 'hsl(45, 90%, 55%)'
    }
  }
];

interface AdvancedThemeSwitcherProps {
  className?: string;
  variant?: 'select' | 'grid';
}

export function AdvancedThemeSwitcher({ 
  className, 
  variant = 'select' 
}: AdvancedThemeSwitcherProps) {
  const { currentTheme, setTheme } = useTheme();

  const applyTheme = (themeId: string) => {
    setTheme(themeId);
  };

  if (variant === 'grid') {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              currentTheme === theme.id && "ring-2 ring-primary"
            )}
            onClick={() => applyTheme(theme.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{theme.name}</h3>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </div>
                {currentTheme === theme.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                )}
              </div>
              
              <div className="flex gap-2 mt-3">
                <div 
                  className="h-8 flex-1 rounded border"
                  style={{ backgroundColor: theme.preview.primary }}
                  title="Primary"
                />
                <div 
                  className="h-8 flex-1 rounded border"
                  style={{ backgroundColor: theme.preview.secondary }}
                  title="Secondary"
                />
                <div 
                  className="h-8 flex-1 rounded border"
                  style={{ backgroundColor: theme.preview.accent }}
                  title="Accent"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Palette className="h-4 w-4 text-muted-foreground" />
      <Select value={currentTheme} onValueChange={applyTheme}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent>
          {themes.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: theme.preview.primary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: theme.preview.secondary }}
                  />
                </div>
                <span>{theme.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
