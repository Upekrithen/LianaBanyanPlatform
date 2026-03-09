import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'project_owner' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return ['user' as AppRole];
      
      const derivedRoles: AppRole[] = ['user']; // Everyone is at least a user

      // Check if project owner
      const { data: ownedProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);
      
      if (ownedProjects && ownedProjects.length > 0) {
        derivedRoles.push('project_owner');
      }

      // Check if crown holder (admin-level)
      const { data: crownPositions } = await supabase
        .from('crown_positions')
        .select('id')
        .eq('holder_user_id', user.id)
        .limit(1);
      
      if (crownPositions && crownPositions.length > 0) {
        derivedRoles.push('admin');
      }

      // Check if guild master (admin-level)
      const { data: guildMaster } = await supabase
        .from('guilds')
        .select('id')
        .eq('guild_master_id', user.id)
        .limit(1);
      
      if (guildMaster && guildMaster.length > 0) {
        if (!derivedRoles.includes('admin')) derivedRoles.push('admin');
      }

      return derivedRoles;
    },
    enabled: !!user,
  });

  const hasRole = (role: AppRole) => {
    return roles?.includes(role) ?? false;
  };

  const isAdmin = hasRole('admin');
  const isProjectOwner = hasRole('project_owner');
  const isBasicUser = hasRole('user');

  return {
    roles: roles || [],
    hasRole,
    isAdmin,
    isProjectOwner,
    isBasicUser,
    isLoading,
  };
};
