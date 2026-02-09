import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'project_owner' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []).map(r => r.role as AppRole);
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
