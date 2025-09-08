import { User, Role, PERMISSIONS } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Trash2, Edit, Users as UsersIcon } from 'lucide-react';

interface UserTableProps {
  users: User[];
  roles: Role[];
  isLoading: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
}

export function UserTable({ users, roles, isLoading, onEditUser, onDeleteUser }: UserTableProps) {
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

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.display_name || role.name : 'غير محدد';
  };

  if (isLoading) {
    return (
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
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>جاري تحميل المستخدمين...</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
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
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <UsersIcon size={48} className="text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold">لا يوجد مستخدمين</h3>
                    <p className="text-muted-foreground">لم يتم العثور على أي مستخدمين. ابدأ بإضافة مستخدم جديد.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
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
                <Badge variant="outline">{getRoleName(user.role_id)}</Badge>
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
                      onClick={() => onEditUser(user)}
                    >
                      <Edit size={16} />
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard permission={PERMISSIONS.USERS_DELETE}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser(user.id)}
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
  );
}








