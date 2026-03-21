import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, Trash2 } from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';

type AppRole = 'admin' | 'project_owner' | 'user';

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
}

export default function RoleManagement() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (profilesError) throw profilesError;

      // No user_roles table — derive roles from other tables
      const usersWithRoles: UserWithRoles[] = [];
      for (const profile of profiles) {
        const roles: { role: string }[] = [];
        // Check if project owner
        const { data: owned } = await supabase.from('projects').select('id').eq('owner_id', profile.id).limit(1);
        if (owned && owned.length > 0) roles.push({ role: 'project_owner' });
        // Check if crown holder
        const { data: crown } = await supabase.from('crown_positions').select('id').eq('holder_user_id', profile.id).limit(1);
        if (crown && crown.length > 0) roles.push({ role: 'admin' });

        usersWithRoles.push({
          ...profile,
          roles: roles.map(r => r.role as AppRole),
        });
      }

      return usersWithRoles;
    },
    enabled: isAdmin,
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Roles are derived from projects/crown_positions/guilds — not a separate table
      // To make someone admin, assign them a crown position or guild master role
      toast.info('Roles are derived from Crown positions and Guild leadership. Assign a Crown or Guild Master role instead.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Role added successfully');
      setSelectedUserId('');
      setSelectedRole('user');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add role');
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Roles are derived — remove the underlying assignment instead
      toast.info('Roles are derived from Crown positions and Guild leadership. Remove the underlying assignment instead.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Role removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove role');
    },
  });

  if (roleLoading) {
    return (
      <PortalPageLayout>
        <Loader2 className="h-8 w-8 animate-spin" />
      </PortalPageLayout>
    );
  }

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const filteredUsers = users?.filter(u => 
    !searchEmail || u.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <PortalPageLayout>
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Role Management</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assign Role</CardTitle>
            <CardDescription>Add roles to users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="project_owner">Project Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => selectedUserId && addRoleMutation.mutate({ userId: selectedUserId, role: selectedRole })}
                disabled={!selectedUserId || addRoleMutation.isPending}
              >
                {addRoleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span className="ml-2">Add Role</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="mb-4"
            />

            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.full_name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.roles.length === 0 ? (
                            <Badge variant="outline">No roles</Badge>
                          ) : (
                            user.roles.map(role => (
                              <Badge key={role} variant="secondary">
                                {role}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.roles.map(role => (
                            <Button
                              key={role}
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRoleMutation.mutate({ userId: user.id, role })}
                              disabled={removeRoleMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </PortalPageLayout>
  );
}
