import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Eye, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type AccessLevel = 'full' | 'browse' | 'locked';

interface PortalAccessCardProps {
  title: string;
  description: string;
  domain: string;
  icon: React.ReactNode;
  accessLevel: AccessLevel;
  categories: string[];
  onRequestAccess?: () => void;
}

export const PortalAccessCard = ({
  title,
  description,
  domain,
  icon,
  accessLevel,
  categories,
  onRequestAccess
}: PortalAccessCardProps) => {
  const navigate = useNavigate();

  const accessConfig = {
    full: {
      badge: <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Full Access</Badge>,
      buttonText: "Open Portal",
      buttonVariant: "default" as const,
      showCategories: false
    },
    browse: {
      badge: <Badge variant="secondary"><Eye className="h-3 w-3 mr-1" />Browse Only</Badge>,
      buttonText: "Explore Catalog",
      buttonVariant: "outline" as const,
      showCategories: true
    },
    locked: {
      badge: <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Request Access</Badge>,
      buttonText: "View Categories",
      buttonVariant: "outline" as const,
      showCategories: true
    }
  };

  const config = accessConfig[accessLevel];

  const handleClick = () => {
    if (accessLevel === 'full') {
      window.location.href = `https://${domain}`;
    } else if (accessLevel === 'browse') {
      window.location.href = `https://${domain}/browse`;
    } else {
      window.location.href = `https://${domain}/browse`;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {icon}
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="text-sm">{domain}</CardDescription>
            </div>
          </div>
          {config.badge}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {config.showCategories && (
          <div>
            <p className="text-sm font-medium mb-2">Browse Categories:</p>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
              {categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{categories.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleClick}
            variant={config.buttonVariant}
            className="flex-1"
          >
            {config.buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          {accessLevel === 'locked' && onRequestAccess && (
            <Button 
              onClick={onRequestAccess}
              variant="default"
              size="sm"
            >
              Request Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};