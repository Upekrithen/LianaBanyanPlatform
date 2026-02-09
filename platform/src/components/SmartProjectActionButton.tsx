import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, Users, Wrench, LogIn } from "lucide-react";
import { toast } from "sonner";

interface SmartProjectActionButtonProps {
  projectId: string;
  projectName: string;
  className?: string;
}

type UserProjectRelationship = 
  | "owner" 
  | "member" 
  | "applicant" 
  | "interested"
  | "none";

export function SmartProjectActionButton({ 
  projectId, 
  projectName,
  className 
}: SmartProjectActionButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState<UserProjectRelationship>("none");
  const [workstationId, setWorkstationId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkUserRelationship();
    } else {
      setRelationship("none");
      setLoading(false);
    }
  }, [user, projectId]);

  const checkUserRelationship = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Check if user is project owner
      const { data: projectData } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();

      if (projectData?.owner_id === user.id) {
        setRelationship("owner");
        
        // Get owner's workstation for this project
        const { data: workstation } = await supabase
          .from('workstations')
          .select('id')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (workstation) {
          setWorkstationId(workstation.id);
        }
        
        setLoading(false);
        return;
      }

      // Check if user is a member
      const { data: memberData } = await supabase
        .from('project_member_contracts')
        .select('id')
        .eq('project_id', projectId)
        .eq('member_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (memberData) {
        setRelationship("member");
        
        // Get member's workstation for this project
        const { data: workstation } = await supabase
          .from('workstations')
          .select('id')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (workstation) {
          setWorkstationId(workstation.id);
        }
        
        setLoading(false);
        return;
      }

      // Check if user has applied for positions
      const { data: applicationData } = await supabase
        .from('position_applications')
        .select('id')
        .eq('applicant_id', user.id)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle();

      if (applicationData) {
        setRelationship("applicant");
        setLoading(false);
        return;
      }

      // No relationship
      setRelationship("none");
    } catch (error) {
      console.error('Error checking user relationship:', error);
      setRelationship("none");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!user) {
      // Not logged in - go to auth
      navigate('/auth', { state: { returnTo: `/project/${projectName}` } });
      return;
    }

    switch (relationship) {
      case "owner":
        // Owner - go to workshop or campaign production
        if (workstationId) {
          navigate(`/campaign-production/${workstationId}`);
        } else {
          navigate('/workshop', { state: { selectedProjectId: projectId } });
        }
        toast.success(`Welcome back to ${projectName}!`);
        break;

      case "member":
        // Member - go to workshop or campaign production
        if (workstationId) {
          navigate(`/campaign-production/${workstationId}`);
        } else {
          navigate('/workshop', { state: { selectedProjectId: projectId } });
        }
        toast.success(`Resuming work on ${projectName}`);
        break;

      case "applicant":
        // Has pending application - go to positions to view status
        navigate(`/project/${projectId}/positions`);
        toast.info('View your application status');
        break;

      case "interested":
      case "none":
        // No relationship - show open positions
        navigate(`/project/${projectId}/positions`);
        break;

      default:
        navigate(`/project/${projectId}/positions`);
    }
  };

  const getButtonText = () => {
    if (!user) return "Get Started";
    
    switch (relationship) {
      case "owner":
        return "Manage Project";
      case "member":
        return "Continue Work";
      case "applicant":
        return "View Application Status";
      case "interested":
      case "none":
        return "Join This Project";
      default:
        return "View Project";
    }
  };

  const getButtonIcon = () => {
    if (!user) return LogIn;
    
    switch (relationship) {
      case "owner":
        return Wrench;
      case "member":
        return Briefcase;
      case "applicant":
      case "interested":
      case "none":
        return Users;
      default:
        return Users;
    }
  };

  if (loading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  const Icon = getButtonIcon();

  return (
    <Button 
      onClick={handleClick}
      className={className}
      size="lg"
    >
      <Icon className="mr-2 h-4 w-4" />
      {getButtonText()}
    </Button>
  );
}
