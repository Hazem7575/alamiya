import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Role, PERMISSIONS } from '@/types/auth';
import { Shield, UserPlus, Edit2, Trash2, Users, Settings, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, usePermissions } from '@/hooks/useUserApi';

interface RoleManagerProps {}

export function RoleManager({}: RoleManagerProps) {
  // API hooks
  const { data: rolesResponse, isLoading: rolesLoading, error: rolesError } = useRoles(1, 50);
  const { data: permissionsResponse, isLoading: permissionsLoading } = usePermissions();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  // Extract data from API responses
  const roles = (rolesResponse as any)?.data?.data || [];
  const permissions = (permissionsResponse as any)?.data || [];

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const [newRole, setNewRole] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as string[],
    is_active: true
  });
  
  const [editRole, setEditRole] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as string[],
    is_active: true
  });

  const { toast } = useToast();

  const handleAddRole = () => {
    if (!newRole.name || !newRole.display_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createRoleMutation.mutate(newRole);
    setNewRole({
      name: '',
      display_name: '',
      description: '',
      permissions: [],
      is_active: true
    });
    setIsAddRoleOpen(false);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditRole({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      permissions: role.permissions || [],
      is_active: role.is_active !== false
    });
    setIsEditRoleOpen(true);
  };

  const handleUpdateRole = () => {
    if (!editingRole || !editRole.name || !editRole.display_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    updateRoleMutation.mutate({
      id: editingRole.id,
      data: editRole
    });
    
    setIsEditRoleOpen(false);
    setEditingRole(null);
  };

  const handleDeleteRole = (roleId: number) => {
    if (confirm('Are you sure you want to delete this role? Users with this role will lose their permissions.')) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handlePermissionToggle = (permission: string, isEdit = false) => {
    if (isEdit) {
      setEditRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    } else {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    }
  };

  const getPermissionsByCategory = () => {
    const grouped: { [key: string]: string[] } = {};
    Object.entries(PERMISSIONS).forEach(([key, value]) => {
      const category = key.split('.')[0];
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(key);
    });
    return grouped;
  };

  const getPermissionBadgeVariant = (permissionName: string) => {
    if (permissionName.includes('.create') || permissionName.includes('.edit') || permissionName.includes('.delete')) {
      return 'default';
    }
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Role Management</h2>
          <p className="text-muted-foreground">
            Manage roles and their permissions in the system.
          </p>
          {rolesLoading && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading roles...</span>
            </div>
          )}
          {rolesError && (
            <div className="flex items-center gap-2 mt-2 text-red-600">
              <span className="text-sm">Error: {rolesError.message}</span>
            </div>
          )}
        </div>
        
        <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Shield className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="e.g., admin, editor, viewer"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={newRole.display_name}
                    onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
                    placeholder="e.g., Administrator"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Role description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-4">
                  {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm capitalize">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={newRole.permissions.includes(permission)}
                              onCheckedChange={() => handlePermissionToggle(permission)}
                            />
                            <Label
                              htmlFor={permission}
                              className="text-sm cursor-pointer"
                            >
                              {PERMISSIONS[permission as keyof typeof PERMISSIONS] || permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={newRole.is_active}
                  onCheckedChange={(checked) => setNewRole({ ...newRole, is_active: !!checked })}
                />
                <Label htmlFor="is_active">Active Role</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddRole}
                  disabled={createRoleMutation.isPending}
                >
                  {createRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Role Name *</Label>
                  <Input
                    id="edit-name"
                    value={editRole.name}
                    onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                    placeholder="e.g., admin, editor, viewer"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-display_name">Display Name *</Label>
                  <Input
                    id="edit-display_name"
                    value={editRole.display_name}
                    onChange={(e) => setEditRole({ ...editRole, display_name: e.target.value })}
                    placeholder="e.g., Administrator"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editRole.description}
                  onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                  placeholder="Role description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-4">
                  {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm capitalize">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${permission}`}
                              checked={editRole.permissions.includes(permission)}
                              onCheckedChange={() => handlePermissionToggle(permission, true)}
                            />
                            <Label
                              htmlFor={`edit-${permission}`}
                              className="text-sm cursor-pointer"
                            >
                              {PERMISSIONS[permission as keyof typeof PERMISSIONS] || permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is_active"
                  checked={editRole.is_active}
                  onCheckedChange={(checked) => setEditRole({ ...editRole, is_active: !!checked })}
                />
                <Label htmlFor="edit-is_active">Active Role</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateRole}
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rolesLoading ? (
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
          {roles.map((role: Role) => (
            <Card key={role.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{role.display_name || role.name}</h3>
                      <Badge variant={role.is_active ? 'default' : 'secondary'}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {(role as any).users_count || 0} users
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        {role.permissions?.length || 0} permissions
                      </div>
                    </div>
                    
                    {selectedRole?.id === role.id && role.permissions && role.permissions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Permissions:</h4>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((permission: string) => (
                            <Badge
                              key={permission}
                              variant={getPermissionBadgeVariant(permission)}
                            >
                              {PERMISSIONS[permission as keyof typeof PERMISSIONS] || permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                    disabled={deleteRoleMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!rolesLoading && roles.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Shield size={48} className="text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold">No Roles Found</h3>
              <p className="text-muted-foreground">Start by adding your first role to the system.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}










