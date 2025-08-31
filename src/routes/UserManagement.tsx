import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Role, PERMISSIONS } from '@/types/auth';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/PermissionGuard';
import { UserNavigation } from '@/components/UserNavigation';
import { UserTable } from '@/components/UserTable';
import { ApiDebugger } from '@/components/ApiDebugger';
import { DataStatus } from '@/components/DataStatus';
import { useUsers, useAllRoles, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUserApi';
import { Trash2, Edit, Plus, Users, Shield, UserCheck, ArrowLeft } from 'lucide-react';

const UserManagementRoute = () => {
  const [currentTab, setCurrentTab] = useState('users');
  const [userFilters, setUserFilters] = useState({
    search: '',
    role_id: '',
    status: ''
  });
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pagination] = useState({ page: 1, perPage: 10 });
  
  // API hooks
  const { data: usersResponse, isLoading: usersLoading } = useUsers(
    pagination.page, 
    pagination.perPage, 
    userFilters
  );
  const { data: rolesResponse } = useAllRoles();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = (usersResponse as any)?.data?.data || [];
  const roles = (rolesResponse as any)?.data || [];

  console.log('Users API Response:', usersResponse);
  console.log('Users:', users);
  console.log('Loading:', usersLoading);

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
      updateUserMutation.mutate({
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



  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              العودة للإعدادات
            </Button>
          </Link>
          <div className="flex-1">
            <Header 
              title="إدارة المستخدمين"
              subtitle="إدارة المستخدمين والأدوار والصلاحيات في النظام"
            />
          </div>
        </div>

        <div className="mt-8">
          {/* Data Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DataStatus
              title="المستخدمين"
              isLoading={usersLoading}
              data={usersResponse}
              count={users.length}
              error={usersResponse?.error}
            />
            <DataStatus
              title="الأدوار"
              isLoading={false}
              data={rolesResponse}
              count={roles.length}
              error={rolesResponse?.error}
            />
          </div>
          
          <ApiDebugger />
          <UserNavigation />
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users size={16} />
                المستخدمين
              </TabsTrigger>
              <Link to="/roles">
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Shield size={16} />
                  الأدوار
                </TabsTrigger>
              </Link>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <UserCheck size={16} />
                الصلاحيات
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
                <UserTable
                  users={users}
                  roles={roles}
                  isLoading={usersLoading}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                />
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">إدارة الأدوار</h2>
                  <Link to="/roles">
                    <Button className="flex items-center gap-2">
                      <Shield size={16} />
                      إدارة الأدوار
                    </Button>
                  </Link>
                </div>
                <p className="text-muted-foreground">انتقل إلى صفحة إدارة الأدوار للتحكم الكامل في الأدوار والصلاحيات.</p>
              </Card>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">إدارة الصلاحيات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">الأحداث</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>events.view - عرض الأحداث</li>
                      <li>events.create - إنشاء أحداث</li>
                      <li>events.edit - تعديل الأحداث</li>
                      <li>events.delete - حذف الأحداث</li>
                      <li>events.manage_status - إدارة حالة الأحداث</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">المستخدمين</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>users.view - عرض المستخدمين</li>
                      <li>users.create - إنشاء مستخدمين</li>
                      <li>users.edit - تعديل المستخدمين</li>
                      <li>users.delete - حذف المستخدمين</li>
                      <li>users.manage_permissions - إدارة الصلاحيات</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">الأدوار</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>roles.view - عرض الأدوار</li>
                      <li>roles.create - إنشاء أدوار</li>
                      <li>roles.edit - تعديل الأدوار</li>
                      <li>roles.delete - حذف الأدوار</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">المدن</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>cities.view - عرض المدن</li>
                      <li>cities.create - إنشاء مدن</li>
                      <li>cities.edit - تعديل المدن</li>
                      <li>cities.delete - حذف المدن</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">الأماكن</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>venues.view - عرض الأماكن</li>
                      <li>venues.create - إنشاء أماكن</li>
                      <li>venues.edit - تعديل الأماكن</li>
                      <li>venues.delete - حذف الأماكن</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">لوحة التحكم</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>dashboard.view - عرض لوحة التحكم</li>
                      <li>dashboard.analytics - عرض التحليلات</li>
                      <li>settings.view - عرض الإعدادات</li>
                      <li>settings.edit - تعديل الإعدادات</li>
                      <li>reports.view - عرض التقارير</li>
                      <li>reports.export - تصدير التقارير</li>
                    </ul>
                  </div>
                </div>
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
                  onValueChange={(value: 'active' | 'inactive' | 'suspended') => setUserForm({...userForm, status: value})}
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

export default UserManagementRoute;
