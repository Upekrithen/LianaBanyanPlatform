import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, FileText, FlaskConical, Box, Scale, 
  Link as LinkIcon, Crown, Megaphone, Calculator, 
  Users, Package, Wrench, Rocket, Monitor, Truck 
} from 'lucide-react';

interface CircularCategoriesProps {
  projectName: string;
  ownerName?: string;
  stewardName?: string;
  onCategoryClick: (category: string) => void;
  activeCounts?: Record<string, number>;
}

const categories = [
  { id: 'create_idea', label: 'Create Idea', icon: Lightbulb, color: 'text-yellow-500' },
  { id: 'define_describe_document', label: 'Define & Document', icon: FileText, color: 'text-blue-500' },
  { id: 'research_development', label: 'R&D', icon: FlaskConical, color: 'text-purple-500' },
  { id: 'prototype', label: 'Prototype', icon: Box, color: 'text-orange-500' },
  { id: 'legal_services', label: 'Legal', icon: Scale, color: 'text-gray-600' },
  { id: 'logistics_blockchain', label: 'Logistics & Blockchain', icon: LinkIcon, color: 'text-cyan-500' },
  { id: 'steward_owner', label: 'Steward/Owner', icon: Crown, color: 'text-amber-500' },
  { id: 'marketing_services', label: 'Marketing', icon: Megaphone, color: 'text-pink-500' },
  { id: 'accounting_services', label: 'Accounting', icon: Calculator, color: 'text-green-600' },
  { id: 'hr_staffing', label: 'HR/Staffing', icon: Users, color: 'text-indigo-500' },
  { id: 'materials_sourcing', label: 'Materials', icon: Package, color: 'text-brown-500' },
  { id: 'manufacture_assembly', label: 'Manufacturing', icon: Wrench, color: 'text-slate-600' },
  { id: 'kickstarter_campaign', label: 'Kickstarter', icon: Rocket, color: 'text-red-500' },
  { id: 'it_services', label: 'IT Services', icon: Monitor, color: 'text-blue-600' },
  { id: 'delivery', label: 'Delivery', icon: Truck, color: 'text-teal-500' },
];

export function CircularCategories({ 
  projectName, 
  ownerName, 
  stewardName,
  onCategoryClick,
  activeCounts = {}
}: CircularCategoriesProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const radius = 280;
  const centerX = 400;
  const centerY = 400;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Project Contract Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ width: '800px', height: '800px', margin: '0 auto' }}>
          {/* Center - Project Name, Owner, and Steward */}
          <div 
            className="absolute bg-card border-2 border-primary rounded-lg p-6 shadow-lg"
            style={{
              left: `${centerX - 100}px`,
              top: `${centerY - 80}px`,
              width: '200px',
              textAlign: 'center'
            }}
          >
            <div className="text-lg font-bold text-primary mb-3">{projectName}</div>
            {ownerName && (
              <div className="text-sm mb-1">
                <span className="text-muted-foreground">Owner:</span>
                <div className="font-medium">{ownerName}</div>
              </div>
            )}
            {stewardName && (
              <div className="text-sm">
                <span className="text-muted-foreground">Steward:</span>
                <div className="font-medium">{stewardName}</div>
              </div>
            )}
          </div>

          {/* Category Buttons in Circle */}
          {categories.map((category, index) => {
            const angle = (index / categories.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const Icon = category.icon;
            const count = activeCounts[category.id] || 0;

            return (
              <div
                key={category.id}
                className="absolute"
                style={{
                  left: `${x - 60}px`,
                  top: `${y - 30}px`,
                  width: '120px'
                }}
              >
                <Button
                  variant={hoveredCategory === category.id ? "default" : "outline"}
                  className={`w-full h-auto py-3 px-2 flex flex-col items-center gap-1 relative transition-all ${hoveredCategory === category.id ? 'shadow-lg scale-105' : ''}`}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => onCategoryClick(category.id)}
                >
                  <Icon className={`h-5 w-5 ${category.color}`} />
                  <span className="text-xs text-center leading-tight">{category.label}</span>
                  {count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
                
                {/* Connection line to center */}
                <svg 
                  className="absolute pointer-events-none opacity-20"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${Math.abs(centerX - x)}px`,
                    height: `${Math.abs(centerY - y)}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <line
                    x1={x < centerX ? Math.abs(centerX - x) : 0}
                    y1={y < centerY ? Math.abs(centerY - y) : 0}
                    x2={x < centerX ? 0 : Math.abs(centerX - x)}
                    y2={y < centerY ? 0 : Math.abs(centerY - y)}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
