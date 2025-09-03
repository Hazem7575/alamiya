import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Shield, 
  User, 
  Search, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar, 
  Building, 
  MapPin, 
  Settings as SettingsIcon,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserCheck
} from 'lucide-react';

// Define permission categories with their icons and descriptions
const PERMISSION_CATEGORIES = {
  events: {
    label: 'Events Management',
    icon: Calendar,
    description: 'Permissions for managing events, event types, and event statuses',
    permissions: ['events.view', 'events.create', 'events.edit', 'events.delete', 'events.manage_status']
  },
  users: {
    label: 'User Management', 
    icon: Users,
    description: 'Permissions for managing users, roles, and user permissions',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_permissions']
  },
  roles: {
    label: 'Role Management',
    icon: UserCheck,
    description: 'Permissions for managing roles and role assignments',
    permissions: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete']
  },
  cities: {
    label: 'Cities Management',
    icon: Building,
    description: 'Permissions for managing cities and their data',
    permissions: ['cities.view', 'cities.create', 'cities.edit', 'cities.delete']
  },
  venues: {
    label: 'Venues Management',
    icon: MapPin,
    description: 'Permissions for managing venues and locations',
    permissions: ['venues.view', 'venues.create', 'venues.edit', 'venues.delete']
  },
  event_types: {
    label: 'Event Types',
    icon: Calendar,
    description: 'Permissions for managing event types and categories',
    permissions: ['event_types.view', 'event_types.create', 'event_types.edit', 'event_types.delete']
  },
  observers: {
    label: 'Ob Management',
    icon: Eye,
    description: 'Permissions for managing Ob and monitoring',
    permissions: ['observers.view', 'observers.create', 'observers.edit', 'observers.delete']
  },
  dashboard: {
    label: 'Dashboard & Analytics',
    icon: BarChart3,
    description: 'Permissions for viewing dashboard and analytics data',
    permissions: ['dashboard.view', 'dashboard.analytics']
  },
  settings: {
    label: 'System Settings',
    icon: SettingsIcon,
    description: 'Permissions for accessing and modifying system settings',
    permissions: ['settings.view', 'settings.edit']
  },
  reports: {
    label: 'Reports & Export',
    icon: BarChart3,
    description: 'Permissions for viewing and exporting reports',
    permissions: ['reports.view', 'reports.export']
  }
};

// Permission action descriptions
const PERMISSION_ACTIONS = {
  view: { icon: Eye, label: 'View', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  create: { icon: Plus, label: 'Create', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  edit: { icon: Edit, label: 'Edit', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  delete: { icon: Trash2, label: 'Delete', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  manage_status: { icon: UserCheck, label: 'Manage Status', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  manage_permissions: { icon: Shield, label: 'Manage Permissions', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400' },
  analytics: { icon: BarChart3, label: 'Analytics', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400' },
  export: { icon: BarChart3, label: 'Export', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' }
};

interface PermissionManagerProps {
  showTitle?: boolean;
  compact?: boolean;
}

export function PermissionManager({ showTitle = true, compact = false }: PermissionManagerProps) {
  const { user, userPermissions, hasPermission } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter permissions based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return PERMISSION_CATEGORIES;

    const filtered: typeof PERMISSION_CATEGORIES = {};
    
    Object.entries(PERMISSION_CATEGORIES).forEach(([key, category]) => {
      const matchingPermissions = category.permissions.filter(permission =>
        permission.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingPermissions.length > 0) {
        filtered[key as keyof typeof PERMISSION_CATEGORIES] = {
          ...category,
          permissions: matchingPermissions
        };
      }
    });

    return filtered;
  }, [searchQuery]);

  // Get permission statistics
  const permissionStats = useMemo(() => {
    const allPermissions = Object.values(PERMISSION_CATEGORIES)
      .flatMap(category => category.permissions);
    const grantedPermissions = userPermissions;
    const totalPermissions = allPermissions.length;
    const grantedCount = grantedPermissions.length;
    const percentage = totalPermissions > 0 ? Math.round((grantedCount / totalPermissions) * 100) : 0;

    return {
      total: totalPermissions,
      granted: grantedCount,
      denied: totalPermissions - grantedCount,
      percentage
    };
  }, [userPermissions]);

  // Get permission action info
  const getPermissionAction = (permission: string) => {
    const action = permission.split('.').pop();
    return PERMISSION_ACTIONS[action as keyof typeof PERMISSION_ACTIONS] || {
      icon: Shield,
      label: action,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Permissions Overview</CardTitle>
                <CardDescription className="text-sm">
                  {permissionStats.granted} of {permissionStats.total} permissions granted
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-medium">
              {permissionStats.percentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="flex flex-wrap gap-1">
              {userPermissions.map((permission) => {
                const action = getPermissionAction(permission);
                return (
                  <Badge 
                    key={permission} 
                    variant="secondary" 
                    className={`text-xs ${action.color}`}
                  >
                    <action.icon className="h-3 w-3 mr-1" />
                    {permission}
                  </Badge>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Permission Management</h2>
          <p className="text-muted-foreground">
            Manage and view user permissions across the system
          </p>
        </div>
      )}

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{user?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user?.email || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <Badge variant="outline" className="text-sm font-medium">
                {user?.role || 'No Role'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissionStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Granted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{permissionStats.granted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{permissionStats.denied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissionStats.percentage}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Permission Categories */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="granted">Granted</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Object.entries(filteredCategories).map(([categoryKey, category]) => {
            const CategoryIcon = category.icon;
            const categoryPermissions = category.permissions.filter(permission => {
              if (activeCategory === 'granted') return hasPermission(permission);
              if (activeCategory === 'denied') return !hasPermission(permission);
              return true;
            });

            if (categoryPermissions.length === 0) return null;

            return (
              <Card key={categoryKey}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5" />
                    {category.label}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryPermissions.map((permission) => {
                      const hasAccess = hasPermission(permission);
                      const action = getPermissionAction(permission);
                      const ActionIcon = action.icon;

                      return (
                        <div
                          key={permission}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            hasAccess
                              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ActionIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{permission}</span>
                          </div>
                          {hasAccess ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="granted" className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Granted Permissions</AlertTitle>
            <AlertDescription>
              These are the permissions currently assigned to your account.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {userPermissions.map((permission) => {
                  const action = getPermissionAction(permission);
                  const ActionIcon = action.icon;
                  return (
                    <Badge 
                      key={permission} 
                      variant="secondary" 
                      className={`${action.color} flex items-center gap-1`}
                    >
                      <ActionIcon className="h-3 w-3" />
                      {permission}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denied" className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Denied Permissions</AlertTitle>
            <AlertDescription>
              These are the permissions that are not assigned to your account.
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {Object.values(PERMISSION_CATEGORIES)
                  .flatMap(category => category.permissions)
                  .filter(permission => !hasPermission(permission))
                  .map((permission) => {
                    const action = getPermissionAction(permission);
                    const ActionIcon = action.icon;
                    return (
                      <Badge 
                        key={permission} 
                        variant="outline" 
                        className="flex items-center gap-1 opacity-60"
                      >
                        <ActionIcon className="h-3 w-3" />
                        {permission}
                      </Badge>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          {/* Management permissions only */}
          {Object.entries(filteredCategories)
            .filter(([key]) => ['users', 'roles', 'settings'].includes(key))
            .map(([categoryKey, category]) => {
              const CategoryIcon = category.icon;
              return (
                <Card key={categoryKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CategoryIcon className="h-5 w-5" />
                      {category.label}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.permissions.map((permission) => {
                        const hasAccess = hasPermission(permission);
                        const action = getPermissionAction(permission);
                        const ActionIcon = action.icon;

                        return (
                          <div
                            key={permission}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              hasAccess
                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ActionIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{permission}</span>
                            </div>
                            {hasAccess ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {/* System permissions only */}
          {Object.entries(filteredCategories)
            .filter(([key]) => ['dashboard', 'settings', 'reports'].includes(key))
            .map(([categoryKey, category]) => {
              const CategoryIcon = category.icon;
              return (
                <Card key={categoryKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CategoryIcon className="h-5 w-5" />
                      {category.label}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.permissions.map((permission) => {
                        const hasAccess = hasPermission(permission);
                        const action = getPermissionAction(permission);
                        const ActionIcon = action.icon;

                        return (
                          <div
                            key={permission}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              hasAccess
                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ActionIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{permission}</span>
                            </div>
                            {hasAccess ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

