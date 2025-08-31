import { User, UserRole, Permission } from '@/types/user';

export const mockPermissions: Permission[] = [
  { id: '1', name: 'Read Events', resource: 'events', action: 'read' },
  { id: '2', name: 'Write Events', resource: 'events', action: 'write' },
  { id: '3', name: 'Read Settings', resource: 'settings', action: 'read' },
  { id: '4', name: 'Write Settings', resource: 'settings', action: 'write' },
  { id: '5', name: 'Read Users', resource: 'users', action: 'read' },
  { id: '6', name: 'Write Users', resource: 'users', action: 'write' },
];

export const mockRoles: UserRole[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: mockPermissions,
  },
  {
    id: '2',
    name: 'Event Manager',
    permissions: mockPermissions.filter(p => p.resource === 'events'),
  },
  {
    id: '3',
    name: 'Viewer',
    permissions: mockPermissions.filter(p => p.action === 'read'),
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@company.com',
    role: mockRoles[0],
    permissions: mockRoles[0].permissions,
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: '2024-01-20T14:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'sarah@company.com',
    role: mockRoles[1],
    permissions: mockRoles[1].permissions,
    createdAt: '2024-01-16T00:00:00Z',
    lastLogin: '2024-01-20T10:15:00Z',
    status: 'active',
  },
  {
    id: '3',
    name: 'Mike Viewer',
    email: 'mike@company.com',
    role: mockRoles[2],
    permissions: mockRoles[2].permissions,
    createdAt: '2024-01-17T00:00:00Z',
    lastLogin: '2024-01-19T16:45:00Z',
    status: 'active',
  },
];