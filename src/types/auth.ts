export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  status: 'active' | 'inactive' | 'suspended';
  role_id: number;
  role: Role;
  avatar?: string;
  last_login_at?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  department?: string;
  role_id: number;
  status: 'active' | 'inactive';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role_id?: number;
  status?: 'active' | 'inactive' | 'suspended';
  password?: string;
  password_confirmation?: string;
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  description: string;
  permission_ids: number[];
  is_active: boolean;
}

export interface UpdateRoleData {
  name?: string;
  display_name?: string;
  description?: string;
  permission_ids?: number[];
  is_active?: boolean;
}

// Permission categories and constants
export const PERMISSION_CATEGORIES = {
  EVENTS: 'events',
  USERS: 'users', 
  ROLES: 'roles',
  CITIES: 'cities',
  VENUES: 'venues',
  EVENT_TYPES: 'event_types',
  OBSERVERS: 'observers',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  REPORTS: 'reports'
} as const;

export const PERMISSIONS = {
  // Events
  EVENTS_VIEW: 'events.view',
  EVENTS_CREATE: 'events.create',
  EVENTS_EDIT: 'events.edit',
  EVENTS_DELETE: 'events.delete',
  EVENTS_MANAGE_STATUS: 'events.manage_status',
  
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_PERMISSIONS: 'users.manage_permissions',
  
  // Roles
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_EDIT: 'roles.edit',
  ROLES_DELETE: 'roles.delete',
  
  // Cities
  CITIES_VIEW: 'cities.view',
  CITIES_CREATE: 'cities.create',
  CITIES_EDIT: 'cities.edit',
  CITIES_DELETE: 'cities.delete',
  
  // Venues
  VENUES_VIEW: 'venues.view',
  VENUES_CREATE: 'venues.create',
  VENUES_EDIT: 'venues.edit',
  VENUES_DELETE: 'venues.delete',
  
  // Event Types
  EVENT_TYPES_VIEW: 'event_types.view',
  EVENT_TYPES_CREATE: 'event_types.create',
  EVENT_TYPES_EDIT: 'event_types.edit',
  EVENT_TYPES_DELETE: 'event_types.delete',
  
  // Observers
  OBSERVERS_VIEW: 'observers.view',
  OBSERVERS_CREATE: 'observers.create',
  OBSERVERS_EDIT: 'observers.edit',
  OBSERVERS_DELETE: 'observers.delete',
  
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_ANALYTICS: 'dashboard.analytics',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export'
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type PermissionCategory = typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES];
