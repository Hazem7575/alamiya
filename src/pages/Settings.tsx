import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { DropdownManager } from '@/components/Settings/DropdownManager';
import { UserManager } from '@/components/Settings/UserManager';
import { RoleManager } from '@/components/Settings/RoleManager';
import { DistanceManager } from '@/components/Settings/DistanceManager';
import { CityManager } from '@/components/Settings/CityManager';
import { PermissionManager } from '@/components/Settings/PermissionManager';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DropdownConfig } from '@/types';
import { User } from '@/types/user';
import { Settings as SettingsIcon, Database, Users, MapPin, Building, Loader2, Lock, ShieldAlert, Shield } from 'lucide-react';
import { useEventTypes, useVenues, useObservers, useCities } from '@/hooks/useApi';
import { mockUsers, mockRoles } from '@/data/mockUsers';

type TabType = 'dropdowns' | 'cities' | 'distances' | 'users' | 'permissions';



const Settings = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const {
    hasPermission,
    hasAnyPermission,
    user,
    userPermissions,
    canViewSettings,
    canEditSettings
  } = usePermissions();

  // Define required permissions for each tab
  const tabPermissions = {
    dropdowns: ['settings.view', 'event_types.view', 'venues.view', 'observers.view'],
    cities: ['cities.view'],
    distances: ['cities.view'],
    users: ['users.view'],
    permissions: ['settings.view'] // Anyone with settings access can view their permissions
  };

  // Get available tabs based on user permissions
  const availableTabs = useMemo(() => {
    const tabs: TabType[] = [];
    
    if (hasAnyPermission(tabPermissions.dropdowns)) tabs.push('dropdowns');
    if (hasPermission('cities.view')) tabs.push('cities');
    if (hasPermission('cities.view')) tabs.push('distances');  
    if (hasPermission('users.view')) tabs.push('users');

    return tabs;
  }, [hasPermission, hasAnyPermission]);

  // Set default active tab to first available tab
  const [activeTab, setActiveTab] = useState<TabType>(availableTabs[0] || 'dropdowns');

  // Conditional data fetching based on active tab - load only when needed
  const { data: eventTypesResponse, isLoading: eventTypesLoading } = useEventTypes({
    enabled: activeTab === 'dropdowns'
  });
  
  const { data: citiesResponse, isLoading: citiesLoading } = useCities({
    enabled: activeTab === 'cities' || activeTab === 'distances'
  });
  
  const { data: venuesResponse, isLoading: venuesLoading } = useVenues({
    enabled: false // Load only when specifically requested
  });
  
  const { data: observersResponse, isLoading: observersLoading } = useObservers({
    enabled: false // Load only when specifically requested
  });

  // Convert backend data to frontend format
  const dropdownConfig: DropdownConfig = useMemo(() => {
    // Load colors from backend EventTypes if available
    if (eventTypesResponse?.success) {
      const backendColors: Record<string, string> = {};
      eventTypesResponse.data.forEach((type: any) => {
        if (type.color) {
          backendColors[type.name] = type.color;
        }
      });
      
      // Merge with existing localStorage colors
      const existingColors = localStorage.getItem('eventTypeColors');
      let mergedColors = backendColors;
      
      if (existingColors) {
        try {
          const localColors = JSON.parse(existingColors);
          mergedColors = { ...backendColors, ...localColors };
        } catch (e) {
          console.error('Failed to parse local colors:', e);
        }
      }
      
      // Save merged colors to localStorage
      localStorage.setItem('eventTypeColors', JSON.stringify(mergedColors));
      
      // Apply colors to CSS
      Object.entries(mergedColors).forEach(([eventType, color]) => {
        document.documentElement.style.setProperty(`--event-${eventType.toLowerCase().replace(/\s+/g, '-')}-color`, color);
      });
    }

    return {
      eventTypes: eventTypesResponse?.success ? eventTypesResponse.data.map(type => ({
        id: type.id.toString(),
        value: type.name,
        label: type.name,
        color: type.color // ✅ إضافة الـ color field من الباك اند
      })) : [],
      cities: citiesResponse ? citiesResponse.map(city => ({
        id: city.id.toString(),
        value: city.name,
        label: city.name
      })) : [],
      venues: venuesResponse?.success ? venuesResponse.data.map(venue => ({
        id: venue.id.toString(),
        value: venue.name,
        label: venue.name
      })) : [],
      obs: observersResponse?.success ? observersResponse.data.map(observer => ({
        id: observer.id.toString(),
        value: observer.name,
        label: observer.name
      })) : []
    };
  }, [eventTypesResponse, citiesResponse, venuesResponse, observersResponse]);

  // Loading states per tab
  const getTabLoadingState = (tab: TabType) => {
    switch (tab) {
      case 'dropdowns':
        return eventTypesLoading || venuesLoading || observersLoading || (citiesLoading && activeTab === 'dropdowns');
      case 'cities':
        return citiesLoading;
      case 'distances':
        return citiesLoading;
      case 'users':
        return false; // Mock data, no loading needed
      case 'permissions':
        return false; // No async data loading for permissions
      default:
        return false;
    }
  };

  const isCurrentTabLoading = getTabLoadingState(activeTab);

  const getLoadingMessage = (tab: TabType) => {
    switch (tab) {
      case 'dropdowns':
        return 'Loading Dropdown Configuration...';
      case 'cities':
        return 'Loading Cities Data...';
      case 'distances':
        return 'Loading Distance Information...';
      case 'users':
        return 'Loading User Management...';
      case 'permissions':
        return 'Loading Permission Management...';
      default:
        return 'Loading...';
    }
  };

  // If user has no access to any settings, show access denied
  if (availableTabs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-6 py-8">
          <Header 
            title="Alamiya"
            subtitle="Configure your project management system"
            showNavigation={true}
          />

          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <ShieldAlert className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have permission to access the settings page.
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Current Role: <span className="font-medium">{typeof user?.role === 'string' ? user?.role : user?.role?.name || 'Unknown'}</span></p>
                  <p>Your Permissions:</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {userPermissions.length > 0 ? (
                      userPermissions.map((permission) => (
                        <span key={permission} className="px-2 py-1 bg-muted rounded text-xs">
                          {permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <Header 
          title="Alamiya Calender"
          subtitle="Configure your project management system"
          showNavigation={true}
        />

        {/* Loading Overlay */}
        {isCurrentTabLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-8 shadow-lg">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{getLoadingMessage(activeTab)}</h3>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch the data</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* User Permissions Info */}


        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
          <TabsList className={`grid w-full mb-8 ${availableTabs.length === 1 ? 'grid-cols-1' : availableTabs.length === 2 ? 'grid-cols-2' : availableTabs.length === 3 ? 'grid-cols-3' : availableTabs.length === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
            {availableTabs.includes('dropdowns') && (
              <TabsTrigger value="dropdowns" className="flex items-center gap-2" disabled={isCurrentTabLoading}>
                <Database className="h-4 w-4" />
                Dropdown Configuration
              </TabsTrigger>
            )}
            {availableTabs.includes('cities') && (
              <TabsTrigger value="cities" className="flex items-center gap-2" disabled={isCurrentTabLoading}>
                <Building className="h-4 w-4" />
                Cities
              </TabsTrigger>
            )}
            {availableTabs.includes('distances') && (
              <TabsTrigger value="distances" className="flex items-center gap-2" disabled={isCurrentTabLoading}>
                <MapPin className="h-4 w-4" />
                Distance Cities
              </TabsTrigger>
            )}
            {availableTabs.includes('users') && (
              <TabsTrigger value="users" className="flex items-center gap-2" disabled={isCurrentTabLoading}>
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            )}

          </TabsList>
          
          <TabsContent value="dropdowns" className="mt-6">
            <PermissionGuard 
              permissions={tabPermissions.dropdowns}
              requireAll={false}
              fallback={
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Lock className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
                      <p className="text-muted-foreground">
                        You don't have permission to access dropdown configuration.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Required permissions: {tabPermissions.dropdowns.join(', ')}
                      </p>
                    </div>
                  </div>
                </Card>
              }
            >
              <DropdownManager 
                config={dropdownConfig}
              />
            </PermissionGuard>
          </TabsContent>
          
          <TabsContent value="cities" className="mt-6">
            <PermissionGuard 
              permission="cities.view"
              fallback={
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Lock className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
                      <p className="text-muted-foreground">
                        You don't have permission to manage cities.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Required permission: cities.view
                      </p>
                    </div>
                  </div>
                </Card>
              }
            >
              <CityManager />
            </PermissionGuard>
          </TabsContent>
          
          <TabsContent value="distances" className="mt-6">
            <PermissionGuard 
              permission="cities.view"
              fallback={
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Lock className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
                      <p className="text-muted-foreground">
                        You don't have permission to manage city distances.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Required permission: cities.view
                      </p>
                    </div>
                  </div>
                </Card>
              }
            >
              <DistanceManager 
                cities={dropdownConfig.cities}
              />
            </PermissionGuard>
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <PermissionGuard 
              permission="users.view"
              fallback={
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Lock className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
                      <p className="text-muted-foreground">
                        You don't have permission to manage users.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Required permission: users.view
                      </p>
                    </div>
                  </div>
                </Card>
              }
            >
              <UserManager />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <PermissionGuard 
              permissions={tabPermissions.permissions}
              requireAll={false}
              fallback={
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Lock className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
                      <p className="text-muted-foreground">
                        You don't have permission to view permission management.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Required permissions: {tabPermissions.permissions.join(', ')}
                      </p>
                    </div>
                  </div>
                </Card>
              }
            >
              <PermissionManager showTitle={false} />
            </PermissionGuard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;