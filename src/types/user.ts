export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: 'events' | 'settings' | 'users';
  action: 'read' | 'write';
}