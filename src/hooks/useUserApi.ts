import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserById,
  getRoles,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
  getPermissions,
  getPermissionsByCategory,
  updateUserPermissions
} from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Users hooks
export const useUsers = (page = 1, perPage = 10, filters?: any) => {
  return useQuery({
    queryKey: ['users', page, perPage, filters],
    queryFn: () => getUsers(page, perPage, filters),
    staleTime: 30000,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (userData: any) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User Created',
        description: 'User has been created successfully',
      });
    },
    onError: (error: any) => {
      console.error('Create User Error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        
        toast({
          title: 'Validation Error',
          description: errorMessages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error Creating User',
          description: error.response?.data?.message || error.message || 'Failed to create user',
          variant: 'destructive',
        });
      }
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: 'User Updated',
        description: 'User has been updated successfully',
      });
    },
    onError: (error: any) => {
      console.error('Update User Error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        
        toast({
          title: 'Validation Error',
          description: errorMessages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error Updating User',
          description: error.response?.data?.message || error.message || 'Failed to update user',
          variant: 'destructive',
        });
      }
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'تم حذف المستخدم',
        description: 'تم حذف المستخدم بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حذف المستخدم',
        description: error.message || 'حدث خطأ أثناء حذف المستخدم',
        variant: 'destructive',
      });
    },
  });
};

// Roles hooks
export const useRoles = (page = 1, perPage = 10, filters?: any) => {
  return useQuery({
    queryKey: ['roles', page, perPage, filters],
    queryFn: () => getRoles(page, perPage, filters),
    staleTime: 30000,
  });
};

export const useAllRoles = () => {
  return useQuery({
    queryKey: ['roles', 'all'],
    queryFn: getAllRoles,
    staleTime: 60000,
  });
};

export const useRole = (id: number) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => getRoleById(id),
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Role Created',
        description: 'Role has been created successfully',
      });
    },
    onError: (error: any) => {
      console.error('Create Role Error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        
        toast({
          title: 'Validation Error',
          description: errorMessages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error Creating Role',
          description: error.response?.data?.message || error.message || 'Failed to create role',
          variant: 'destructive',
        });
      }
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role'] });
      toast({
        title: 'تم تحديث الدور',
        description: 'تم تحديث الدور بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تحديث الدور',
        description: error.message || 'حدث خطأ أثناء تحديث الدور',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'تم حذف الدور',
        description: 'تم حذف الدور بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حذف الدور',
        description: error.message || 'حدث خطأ أثناء حذف الدور',
        variant: 'destructive',
      });
    },
  });
};

// Permissions hooks
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePermissionsByCategory = () => {
  return useQuery({
    queryKey: ['permissions', 'by-category'],
    queryFn: getPermissionsByCategory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserPermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ userId, permissionIds }: { userId: number; permissionIds: number[] }) => 
      updateUserPermissions(userId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: 'تم تحديث الصلاحيات',
        description: 'تم تحديث صلاحيات المستخدم بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تحديث الصلاحيات',
        description: error.message || 'حدث خطأ أثناء تحديث الصلاحيات',
        variant: 'destructive',
      });
    },
  });
};


