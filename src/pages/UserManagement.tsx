import { useState, useMemo } from 'react';
import { User, Role, Permission, PERMISSIONS } from '@/types/auth';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useUsers, useAllRoles, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUserApi';
import { usePermissionsByCategory } from '@/hooks/useUserApi';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Users, Shield, Eye, EyeOff, UserCheck } from 'lucide-react';

const UserManagement = () => {
  const [currentTab, setCurrentTab] = useState('users');
  const [userFilters, setUserFilters] = useState({
    search: '',
    role_id: '',
    status: ''
  });
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });
  
  const { toast } = useToast();
  
  // API hooks
  const { data: usersResponse, isLoading: usersLoading } = useUsers(
    pagination.page, 
    pagination.perPage, 
    userFilters
  );
  const { data: rolesResponse } = useAllRoles();
  const { data: permissionsResponse } = usePermissionsByCategory();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = (usersResponse as any)?.data?.data || [];
  const roles = (rolesResponse as any)?.data || [];
  const permissionsByCategory = (permissionsResponse as any)?.data || {};

  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    department: '',
    role_id: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      phone: '',
      department: '',
      role_id: '',
      status: 'active' as 'active' | 'inactive' | 'suspended'
    });
  };

  const handleCreateUser = async () => {
    try {
      const userData = {
        ...userForm,
        role_id: parseInt(userForm.role_id)
      };
      createUserMutation.mutate(userData);
      resetUserForm();
      setIsCreateUserOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        data: {
          ...userForm,
          role_id: userForm.role_id ? parseInt(userForm.role_id) : undefined
        }
      });
      resetUserForm();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        deleteUserMutation.mutate(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      phone: user.phone || '',
      department: user.department || '',
      role_id: user.role_id.toString(),
      status: user.status
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    } as const;

    const labels = {
      active: 'نشط',
      inactive: 'غير نشط',
      suspended: 'معلق'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <PermissionGuard permission={PERMISSIONS.USERS_VIEW}>
          <Header 
            title="إدارة المستخدمين"
            subtitle="إدارة المستخدمين والأدوار والصلاحيات في النظام"
          />
        </PermissionGuard>

        <div className="mt-8">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users size={16} />
                المستخدمين
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield size={16} />
                الأدوار
              </TabsTrigger>

            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="p-6">
                {/* Users Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">المستخدمين</h2>
                    <Badge variant="secondary">{users.length} مستخدم</Badge>
                  </div>
                  
                  <PermissionGuard permission={PERMISSIONS.USERS_CREATE}>
                    <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus size={16} />
                          إضافة مستخدم
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">الاسم</Label>
                            <Input
                              id="name"
                              value={userForm.name}
                              onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                              placeholder="اسم المستخدم"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                              id="email"
                              type="email"
                              value={userForm.email}
                              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                              placeholder="user@example.com"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input
                              id="password"
                              type="password"
                              value={userForm.password}
                              onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                              placeholder="كلمة المرور"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
                            <Input
                              id="password_confirmation"
                              type="password"
                              value={userForm.password_confirmation}
                              onChange={(e) => setUserForm({...userForm, password_confirmation: e.target.value})}
                              placeholder="تأكيد كلمة المرور"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="role">الدور</Label>
                            <Select
                              value={userForm.role_id}
                              onValueChange={(value) => setUserForm({...userForm, role_id: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الدور" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role: Role) => (
                                  <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.display_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="phone">رقم الهاتف</Label>
                            <Input
                              id="phone"
                              value={userForm.phone}
                              onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                              placeholder="رقم الهاتف (اختياري)"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="department">القسم</Label>
                            <Input
                              id="department"
                              value={userForm.department}
                              onChange={(e) => setUserForm({...userForm, department: e.target.value})}
                              placeholder="القسم (اختياري)"
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                              إلغاء
                            </Button>
                            <Button 
                              onClick={handleCreateUser}
                              disabled={createUserMutation.isPending}
                            >
                              إنشاء المستخدم
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </PermissionGuard>
                </div>

                {/* Users Filters */}
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="البحث في المستخدمين..."
                    value={userFilters.search}
                    onChange={(e) => setUserFilters({...userFilters, search: e.target.value})}
                    className="max-w-sm"
                  />
                  
                  <Select
                    value={userFilters.role_id}
                    onValueChange={(value) => setUserFilters({...userFilters, role_id: value})}
                  >
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="فلترة حسب الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">جميع الأدوار</SelectItem>
                      {roles.map((role: Role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={userFilters.status}
                    onValueChange={(value) => setUserFilters({...userFilters, status: value})}
                  >
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="فلترة حسب الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">جميع الحالات</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="suspended">معلق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right">الدور</TableHead>
                        <TableHead className="text-right">القسم</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">آخر تسجيل دخول</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role?.display_name}</Badge>
                          </TableCell>
                          <TableCell>{user.department || '-'}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>
                            {user.last_login_at ? 
                              new Date(user.last_login_at).toLocaleDateString('ar-EG') : 
                              'لم يسجل دخول'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PermissionGuard permission={PERMISSIONS.USERS_EDIT}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit size={16} />
                                </Button>
                              </PermissionGuard>
                              
                              <PermissionGuard permission={PERMISSIONS.USERS_DELETE}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </PermissionGuard>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* Roles Tab - Placeholder */}
            <TabsContent value="roles" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">إدارة الأدوار</h2>
                <p className="text-muted-foreground">سيتم إضافة هذا القسم قريباً...</p>
              </Card>
            </TabsContent>

            {/* Permissions Tab - Placeholder */}
            <TabsContent value="permissions" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">إدارة الصلاحيات</h2>
                <p className="text-muted-foreground">سيتم إضافة هذا القسم قريباً...</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل المستخدم</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">الاسم</Label>
                <Input
                  id="edit-name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  placeholder="اسم المستخدم"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-role">الدور</Label>
                <Select
                  value={userForm.role_id}
                  onValueChange={(value) => setUserForm({...userForm, role_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: Role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-status">الحالة</Label>
                <Select
                  value={userForm.status}
                  onValueChange={(value: 'active' | 'inactive') => setUserForm({...userForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="suspended">معلق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleUpdateUser}
                  disabled={updateUserMutation.isPending}
                >
                  تحديث المستخدم
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;
