import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Role, Permission, PERMISSIONS, PERMISSION_CATEGORIES } from '@/types/auth';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PermissionGuard } from '@/components/PermissionGuard';
import { UserNavigation } from '@/components/UserNavigation';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, usePermissionsByCategory } from '@/hooks/useUserApi';
import { Trash2, Edit, Plus, Shield, ArrowLeft, Users } from 'lucide-react';

const RoleManagement = () => {
  const [filters, setFilters] = useState({
    search: '',
    is_active: ''
  });
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [pagination] = useState({ page: 1, perPage: 50 });
  
  // API hooks
  const { data: rolesResponse, isLoading: rolesLoading } = useRoles(
    pagination.page, 
    pagination.perPage, 
    filters
  );
  const { data: permissionsResponse } = usePermissionsByCategory();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  const roles = (rolesResponse as any)?.data?.data || [];
  const permissionsByCategory = (permissionsResponse as any)?.data || {};

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: '',
    display_name: '',
    description: '',
    is_active: true,
    permission_ids: [] as number[]
  });

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      display_name: '',
      description: '',
      is_active: true,
      permission_ids: []
    });
  };

  const handleCreateRole = async () => {
    try {
      createRoleMutation.mutate(roleForm);
      resetRoleForm();
      setIsCreateRoleOpen(false);
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    
    try {
      updateRoleMutation.mutate({
        id: editingRole.id,
        data: roleForm
      });
      resetRoleForm();
      setEditingRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الدور؟')) {
      try {
        deleteRoleMutation.mutate(roleId);
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      is_active: role.is_active,
      permission_ids: role.permissions?.map(p => p.id) || []
    });
  };

  const handlePermissionToggle = (permissionId: number) => {
    setRoleForm(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId]
    }));
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'نشط' : 'غير نشط'}
      </Badge>
    );
  };

  const renderPermissionsByCategory = () => {
    return Object.entries(permissionsByCategory).map(([category, permissions]) => (
      <div key={category} className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Shield size={16} />
          {getCategoryDisplayName(category)}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(permissions as Permission[]).map((permission) => (
            <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`permission-${permission.id}`}
                checked={roleForm.permission_ids.includes(permission.id)}
                onCheckedChange={() => handlePermissionToggle(permission.id)}
              />
              <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                {permission.display_name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: Record<string, string> = {
      events: 'إدارة الأحداث',
      users: 'إدارة المستخدمين',
      roles: 'إدارة الأدوار',
      cities: 'إدارة المدن',
      venues: 'إدارة الأماكن',
      event_types: 'إدارة أنواع الأحداث',
      observers: 'إدارة المراقبين',
      dashboard: 'لوحة التحكم',
      settings: 'الإعدادات',
      reports: 'التقارير'
    };
    return categoryNames[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              العودة للمستخدمين
            </Button>
          </Link>
          <div className="flex-1">
            <Header 
              title="إدارة الأدوار"
              subtitle="إدارة أدوار المستخدمين والصلاحيات المرتبطة بها"
            />
          </div>
        </div>

        <UserNavigation />
        
        <Card className="p-6">
          {/* Roles Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">الأدوار</h2>
              <Badge variant="secondary">{roles.length} دور</Badge>
            </div>
            
            <PermissionGuard permission={PERMISSIONS.ROLES_CREATE}>
              <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    إضافة دور جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة دور جديد</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">اسم الدور (بالإنجليزية)</Label>
                        <Input
                          id="name"
                          value={roleForm.name}
                          onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                          placeholder="admin, manager, viewer"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="display_name">الاسم المعروض</Label>
                        <Input
                          id="display_name"
                          value={roleForm.display_name}
                          onChange={(e) => setRoleForm({...roleForm, display_name: e.target.value})}
                          placeholder="مدير النظام، مدير، مشاهد"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">الوصف</Label>
                      <Textarea
                        id="description"
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                        placeholder="وصف مختصر عن الدور وصلاحياته"
                      />
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="is_active"
                        checked={roleForm.is_active}
                        onCheckedChange={(checked) => setRoleForm({...roleForm, is_active: checked})}
                      />
                      <Label htmlFor="is_active">الدور نشط</Label>
                    </div>
                    
                    <div>
                      <Label className="text-base font-semibold">الصلاحيات</Label>
                      <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                        {renderPermissionsByCategory()}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                        إلغاء
                      </Button>
                      <Button 
                        onClick={handleCreateRole}
                        disabled={createRoleMutation.isPending}
                      >
                        إنشاء الدور
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </PermissionGuard>
          </div>

          {/* Roles Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="البحث في الأدوار..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="max-w-sm"
            />
          </div>

          {/* Roles Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الدور</TableHead>
                  <TableHead className="text-right">الاسم المعروض</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">عدد الصلاحيات</TableHead>
                  <TableHead className="text-right">عدد المستخدمين</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      جاري تحميل الأدوار...
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      لا يوجد أدوار
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role: Role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.display_name}</TableCell>
                      <TableCell>{role.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.permissions?.length || 0} صلاحية
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Users size={14} className="mr-1" />
                          {(role as any).users_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(role.is_active)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PermissionGuard permission={PERMISSIONS.ROLES_EDIT}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit size={16} />
                            </Button>
                          </PermissionGuard>
                          
                          <PermissionGuard permission={PERMISSIONS.ROLES_DELETE}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Edit Role Dialog */}
        <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل الدور</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">اسم الدور (بالإنجليزية)</Label>
                  <Input
                    id="edit-name"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                    placeholder="admin, manager, viewer"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-display_name">الاسم المعروض</Label>
                  <Input
                    id="edit-display_name"
                    value={roleForm.display_name}
                    onChange={(e) => setRoleForm({...roleForm, display_name: e.target.value})}
                    placeholder="مدير النظام، مدير، مشاهد"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                  placeholder="وصف مختصر عن الدور وصلاحياته"
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="edit-is_active"
                  checked={roleForm.is_active}
                  onCheckedChange={(checked) => setRoleForm({...roleForm, is_active: checked})}
                />
                <Label htmlFor="edit-is_active">الدور نشط</Label>
              </div>
              
              <div>
                <Label className="text-base font-semibold">الصلاحيات</Label>
                <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {renderPermissionsByCategory()}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingRole(null)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleUpdateRole}
                  disabled={updateRoleMutation.isPending}
                >
                  تحديث الدور
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RoleManagement;
