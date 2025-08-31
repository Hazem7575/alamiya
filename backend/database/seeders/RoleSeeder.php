<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = Permission::pluck('name')->toArray();

        // Super Admin - All permissions
        Role::create([
            'name' => 'super_admin',
            'display_name' => 'Super Administrator',
            'description' => 'Full system access with all permissions',
            'permissions' => $allPermissions,
        ]);

        // Admin - Most permissions except user management
        $adminPermissions = array_filter($allPermissions, function($permission) {
            return !str_starts_with($permission, 'users.delete') && !str_starts_with($permission, 'roles.delete');
        });

        Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'Administrative access to most system features',
            'permissions' => array_values($adminPermissions),
        ]);

        // Event Manager - Event related permissions
        Role::create([
            'name' => 'event_manager',
            'display_name' => 'Event Manager',
            'description' => 'Manage events, venues, and observers',
            'permissions' => [
                'events.view', 'events.create', 'events.edit', 'events.manage_status',
                'venues.view', 'venues.create', 'venues.edit',
                'observers.view', 'observers.create', 'observers.edit',
                'sngs.view', 'sngs.create', 'sngs.edit',
                'cities.view', 'event_types.view',
                'dashboard.view'
            ],
        ]);

        // Observer - Limited access
        Role::create([
            'name' => 'observer',
            'display_name' => 'Observer',
            'description' => 'View events and update own assignments',
            'permissions' => [
                'events.view',
                'dashboard.view'
            ],
        ]);

        // Viewer - Read only access
        Role::create([
            'name' => 'viewer',
            'display_name' => 'Viewer',
            'description' => 'Read-only access to events and basic information',
            'permissions' => [
                'events.view',
                'cities.view',
                'venues.view',
                'observers.view',
                'sngs.view',
                'event_types.view',
                'dashboard.view'
            ],
        ]);
    }
}