import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // If true, user needs ALL permissions. If false, user needs ANY permission
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ 
  permission, 
  permissions, 
  requireAll = false,
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}