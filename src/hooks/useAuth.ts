import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { PermissionName } from '@/types/auth';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permissionName: PermissionName): boolean => {
    if (!user || !user.role || !user.role.permissions) {
      return false;
    }
    
    return user.role.permissions.some(permission => permission.name === permissionName);
  };
  
  const hasAnyPermission = (permissionNames: PermissionName[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission));
  };
  
  const hasAllPermissions = (permissionNames: PermissionName[]): boolean => {
    return permissionNames.every(permission => hasPermission(permission));
  };
  
  const getUserPermissions = (): string[] => {
    if (!user || !user.role || !user.role.permissions) {
      return [];
    }
    
    return user.role.permissions.map(permission => permission.name);
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    permissions: getUserPermissions()
  };
};










