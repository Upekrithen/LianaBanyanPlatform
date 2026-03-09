import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularCategories } from '@/components/CircularCategories';
import { PositionApplicationDialog } from '@/components/PositionApplicationDialog';
import { ContractAssignmentSimulator } from '@/components/ContractAssignmentSimulator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Position {
  id: string;
  position_title: string;
  position_description: string;
  compensation_type: string;
  participation_percentage: number;
  cash_amount: number;
  credits_reserved: number;
  category: string;
  required_stage: string;
  scale_rate_type?: string;
}

export default function ContractPositions() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatorPosition, setSimulatorPosition] = useState<Position | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    try {
      // Load project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*, profiles!projects_owner_id_fkey(full_name)')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Load positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('contract_position_templates')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true);

      if (positionsError) throw positionsError;
      setPositions(positionsData || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleApplyClick = (position: Position) => {
    setSelectedPosition(position);
    setDialogOpen(true);
  };

  const handleSimulatorClick = (position: Position) => {
    setSimulatorPosition(position);
    setSimulatorOpen(true);
  };

  const categoryCounts = positions.reduce((acc, pos) => {
    acc[pos.category] = (acc[pos.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredPositions = selectedCategory
    ? positions.filter(p => p.category === selectedCategory)
    : positions;

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-2xl font-bold truncate">{project.name}</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Contract Positions</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/project/${projectId}`)}
              className="touch-manipulation flex-shrink-0"
              size="sm"
            >
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8 space-y-4 md:space-y-8">
        {/* Circular Categories */}
        <CircularCategories
          projectName={project.name}
          ownerName={project.profiles?.full_name}
          onCategoryClick={handleCategoryClick}
          activeCounts={categoryCounts}
        />

        {/* Positions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCategory 
                ? `${getCategoryLabel(selectedCategory)} Positions` 
                : 'All Open Positions'}
            </CardTitle>
            <CardDescription>
              {selectedCategory 
                ? 'Click a different category above to see other positions, or clear the filter'
                : 'Click a category above to filter positions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPositions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No positions available in this category
              </p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader className="hidden sm:table-header-group">
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Compensation</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {filteredPositions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{position.position_title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {position.position_description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {getCategoryLabel(position.category)}
                          </Badge>
                          {position.scale_rate_type === 'negotiated' && (
                            <Badge variant="default" className="bg-success">
                              Negotiated
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {position.participation_percentage > 0 && (
                            <div>{position.participation_percentage}% participation</div>
                          )}
                          {position.cash_amount > 0 && (
                            <div>${position.cash_amount}</div>
                          )}
                          {!position.participation_percentage && !position.cash_amount && (
                            <div className="text-muted-foreground">TBD</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{position.credits_reserved}</TableCell>
                      <TableCell>
                        {position.required_stage ? (
                          <Badge variant="secondary">
                            {position.required_stage}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Any</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleSimulatorClick(position)}
                          className="touch-manipulation w-full sm:w-auto"
                        >
                          Preview
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm"
                          onClick={() => handleApplyClick(position)}
                          className="touch-manipulation w-full sm:w-auto"
                        >
                          Apply
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <PositionApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        position={selectedPosition}
      />

      <Dialog open={simulatorOpen} onOpenChange={setSimulatorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Compensation Simulator</DialogTitle>
          </DialogHeader>
          {simulatorPosition && project && (
            <ContractAssignmentSimulator
              projectId={project.id}
              positionTitle={simulatorPosition.position_title}
              baseCompensation={
                simulatorPosition.compensation_type === 'equity'
                  ? (simulatorPosition.participation_percentage || 0) * 100
                  : simulatorPosition.cash_amount || 5000
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
