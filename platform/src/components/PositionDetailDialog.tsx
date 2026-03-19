import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Award, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PositionDetailDialogProps {
  position: any;
  open: boolean;
  onClose: () => void;
}

export function PositionDetailDialog({ position, open, onClose }: PositionDetailDialogProps) {
  const navigate = useNavigate();

  const handleApply = () => {
    // Navigate to contract positions page with this position pre-selected
    navigate('/contract-positions', { state: { positionTitle: position.position_title } });
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'core_operations': return 'Core Operations';
      case 'member_support': return 'Member Support';
      case 'technical': return 'Technical';
      default: return category;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{position.position_title}</DialogTitle>
          <div className="flex gap-2 pt-2">
            <Badge variant={getPriorityColor(position.priority_level) as any}>
              {position.priority_level} priority
            </Badge>
            <Badge variant="outline">{position.compensation_type}</Badge>
            <Badge variant="secondary">{getCategoryLabel(position.position_category)}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <div className="space-y-2">
            <h3 className="font-semibold">Overview</h3>
            <p className="text-muted-foreground">{position.description}</p>
          </div>

          {/* Time Commitment */}
          {position.estimated_time_commitment && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">Time Commitment</p>
                <p className="text-sm text-muted-foreground">{position.estimated_time_commitment}</p>
              </div>
            </div>
          )}

          {/* Key Responsibilities */}
          {position.key_responsibilities && position.key_responsibilities.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Key Responsibilities
              </h3>
              <ul className="space-y-2">
                {position.key_responsibilities.map((responsibility: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Skills */}
          {position.required_skills && position.required_skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {position.required_skills.map((skill: string, idx: number) => (
                  <Badge key={idx} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Compensation Information */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Compensation & Benefits
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Type:</strong> {position.compensation_type === 'participation' ? 'Participation-based' :
                  position.compensation_type === 'cash' ? 'Cash compensation' :
                  position.compensation_type === 'hybrid' ? 'Participation + Cash hybrid' :
                  position.compensation_type === 'credits' ? 'Credit-based' : position.compensation_type}
              </p>
              <p>
                As a service provider or agent of Liana Banyan, you'll receive:
              </p>
              <ul className="space-y-1 ml-4">
                <li>• {position.compensation_type === 'participation' || position.compensation_type === 'hybrid' ? 'Project participation allocation based on contribution' : ''}</li>
                <li>• {position.compensation_type === 'credits' || position.compensation_type === 'hybrid' ? 'LB credits for platform services and resources' : ''}</li>
                <li>• Access to Liana Banyan's manufacturing network and resources</li>
                <li>• Professional development and mentorship opportunities</li>
                <li>• Flexible work arrangements</li>
              </ul>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleApply}>
              Apply for This Position
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
