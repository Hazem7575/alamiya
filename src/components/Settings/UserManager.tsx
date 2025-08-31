import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User as AuthUser, Role } from '@/types/auth';
import { UserPlus, Edit2, Trash2, Shield, Eye, EyeOff, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useAllRoles, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUserApi';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';

interface UserManagerProps {}

export function UserManager({}: UserManagerProps) {
  // API hooks
  const { data: usersResponse, isLoading: usersLoading, error: usersError } = useUsers(1, 50);
  const { data: rolesResponse, isLoading: rolesLoading, error: rolesError } = useAllRoles();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();  
  const deleteUserMutation = useDeleteUser();

  // Permissions
  const { canViewUsers, canCreateUsers, canEditUsers, canDeleteUsers } = usePermissions();

  // Extract data from API responses
  const users = (usersResponse as any)?.data?.data || [];
  const roles = (rolesResponse as any)?.data || [];
  
  console.log('👥 Users with roles and permissions:', users.map((u: any) => ({
    name: u.name,
    role: u.role,
    hasRole: !!u.role,
    hasPermissions: !!u.role?.permissions,
    permissionsCount: u.role?.permissions?.length || 0,
    permissions: u.role?.permissions
  })));


  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role_id: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });
  
  const { toast } = useToast();

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      ...newUser,
      role_id: parseInt(newUser.role_id)
    };
    
    createUserMutation.mutate(userData);
    setNewUser({ 
      name: '', 
      email: '', 
      password: '',
      role_id: '', 
      status: 'active' as 'active' | 'inactive' | 'suspended'
    });
    setIsAddUserOpen(false);
  };

  const handleToggleStatus = (user: AuthUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUserMutation.mutate({
      id: user.id,
      data: { status: newStatus }
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleEditUser = (user: AuthUser) => {
    setEditingUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role_id: user.role_id.toString(),
      status: user.status
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !editUser.name || !editUser.email || !editUser.role_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      ...editUser,
      role_id: parseInt(editUser.role_id)
    };
    
    updateUserMutation.mutate({
      id: editingUser.id,
      data: userData
    });
    
    setIsEditUserOpen(false);
    setEditingUser(null);
  };

  const getPermissionBadgeVariant = (permissionName: string) => {
    if (!permissionName || typeof permissionName !== 'string') {
      return 'secondary';
    }
    if (permissionName.includes('.create') || permissionName.includes('.edit') || permissionName.includes('.delete')) {
      return 'default';
    }
    return 'secondary';
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find((r: Role) => r.id === roleId);
    return role ? role.display_name || role.name : 'Not Assigned';
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">User Management</h2>
          <p className="text-muted-foreground">
            Manage users and their permissions in the system.
          </p>
          {usersLoading && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading users...</span>
            </div>
          )}
          {usersError && (
            <div className="flex items-center gap-2 mt-2 text-red-600">
              <span className="text-sm">Error: {usersError.message}</span>
            </div>
          )}
          {rolesError && (
            <div className="flex items-center gap-2 mt-2 text-red-600">
              <span className="text-sm">Roles Error: {rolesError.message}</span>
            </div>
          )}
        </div>
        
        <PermissionGuard permission="users.create">
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="!bg-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter user name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <PasswordInput
                  id="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={newUser.role_id} 
                  onValueChange={(value) => setNewUser({ ...newUser, role_id: value })}
                  disabled={rolesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={rolesLoading ? "Loading..." : "Select a role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: Role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.display_name || role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddUser}
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </PermissionGuard>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  placeholder="Enter user name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select 
                  value={editUser.role_id} 
                  onValueChange={(value) => setEditUser({ ...editUser, role_id: value })}
                  disabled={rolesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={rolesLoading ? "Loading..." : "Select a role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: Role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.display_name || role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select 
                  value={editUser.status} 
                  onValueChange={(value) => setEditUser({ ...editUser, status: value as 'active' | 'inactive' | 'suspended' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateUser}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {usersLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user: AuthUser) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : 'Suspended'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        {getRoleName(user.role_id)}
                        {user.role && user.role.permissions && user.role.permissions.length > 0 && (
                          <span className="ml-1 text-xs">
                            ({user.role.permissions.length} permissions)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {user.last_login_at 
                          ? `Last login: ${new Date(user.last_login_at).toLocaleDateString()}`
                          : 'Never logged in'
                        }
                      </div>
                    </div>
                    {user.department && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Department: {user.department}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <PermissionGuard permission="users.edit">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`status-${user.id}`} className="text-sm">
                        Active
                      </Label>
                      <Switch
                        id={`status-${user.id}`}
                        checked={user.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(user)}
                        disabled={updateUserMutation.isPending}
                      />
                    </div>
                  </PermissionGuard>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <PermissionGuard permission="users.edit">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission="users.delete">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </PermissionGuard>
                </div>
              </div>

              {selectedUser?.id === user.id && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Permissions:</h4>
                  {console.log('🔍 Displaying permissions for user:', user.name, {
                    hasRole: !!user.role,
                    rolePermissions: user.role?.permissions,
                    permissionsType: typeof user.role?.permissions,
                    permissionsLength: user.role?.permissions?.length,
                    isArray: Array.isArray(user.role?.permissions)
                  })}
                  <div className="flex flex-wrap gap-2">
                    {user.role && user.role.permissions && Array.isArray(user.role.permissions) && user.role.permissions.length > 0 ? (
                      user.role.permissions.map((permission: string, index: number) => (
                        <Badge
                          key={`${permission}-${index}`}
                          variant={getPermissionBadgeVariant(permission)}
                        >
                          {permission}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {!user.role ? 'No role assigned' : 
                         !user.role.permissions ? 'Role has no permissions' : 
                         !Array.isArray(user.role.permissions) ? 'Permissions format error' :
                         'No permissions assigned'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {!usersLoading && users.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Shield size={48} className="text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold">No Users Found</h3>
              <p className="text-muted-foreground">Start by adding your first user to the system.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}