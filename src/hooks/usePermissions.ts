import { useAuth } from '@/hooks/useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) {
      console.log('🔒 No user found');
      return false;
    }

    // Get permissions directly from user (API now combines user + role permissions)
    const userPermissions = user.permissions || [];
    const hasAccess = userPermissions.includes(permission);
    


    return hasAccess;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Specific permission checkers for common use cases
  const canViewEvents = () => hasPermission('events.view');
  const canCreateEvents = () => hasPermission('events.create');
  const canEditEvents = () => hasPermission('events.edit');
  const canDeleteEvents = () => hasPermission('events.delete');
  const canManageEventStatus = () => hasPermission('events.manage_status');

  const canViewUsers = () => hasPermission('users.view');
  const canCreateUsers = () => hasPermission('users.create');
  const canEditUsers = () => hasPermission('users.edit');
  const canDeleteUsers = () => hasPermission('users.delete');
  const canManagePermissions = () => hasPermission('users.manage_permissions');

  const canViewRoles = () => hasPermission('roles.view');
  const canCreateRoles = () => hasPermission('roles.create');
  const canEditRoles = () => hasPermission('roles.edit');
  const canDeleteRoles = () => hasPermission('roles.delete');

  const canViewSettings = () => hasPermission('settings.view');
  const canEditSettings = () => hasPermission('settings.edit');

  const canViewDashboard = () => hasPermission('dashboard.view');
  const canViewAnalytics = () => hasPermission('dashboard.analytics');

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    // Events
    canViewEvents,
    canCreateEvents,
    canEditEvents,
    canDeleteEvents,
    canManageEventStatus,
    // Users
    canViewUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canManagePermissions,
    // Roles
    canViewRoles,
    canCreateRoles,
    canEditRoles,
    canDeleteRoles,
    // Settings
    canViewSettings,
    canEditSettings,
    // Dashboard
    canViewDashboard,
    canViewAnalytics,
    // User info
    user,
    userRole: user?.role,
    userPermissions: user?.permissions || []
  };
};
