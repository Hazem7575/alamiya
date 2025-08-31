<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Events
            ['name' => 'events.view', 'display_name' => 'View Events', 'category' => 'events'],
            ['name' => 'events.create', 'display_name' => 'Create Events', 'category' => 'events'],
            ['name' => 'events.edit', 'display_name' => 'Edit Events', 'category' => 'events'],
            ['name' => 'events.delete', 'display_name' => 'Delete Events', 'category' => 'events'],
            ['name' => 'events.manage_status', 'display_name' => 'Manage Event Status', 'category' => 'events'],

            // Users
            ['name' => 'users.view', 'display_name' => 'View Users', 'category' => 'users'],
            ['name' => 'users.create', 'display_name' => 'Create Users', 'category' => 'users'],
            ['name' => 'users.edit', 'display_name' => 'Edit Users', 'category' => 'users'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'category' => 'users'],
            ['name' => 'users.manage_permissions', 'display_name' => 'Manage User Permissions', 'category' => 'users'],

            // Roles
            ['name' => 'roles.view', 'display_name' => 'View Roles', 'category' => 'roles'],
            ['name' => 'roles.create', 'display_name' => 'Create Roles', 'category' => 'roles'],
            ['name' => 'roles.edit', 'display_name' => 'Edit Roles', 'category' => 'roles'],
            ['name' => 'roles.delete', 'display_name' => 'Delete Roles', 'category' => 'roles'],

            // Cities
            ['name' => 'cities.view', 'display_name' => 'View Cities', 'category' => 'cities'],
            ['name' => 'cities.create', 'display_name' => 'Create Cities', 'category' => 'cities'],
            ['name' => 'cities.edit', 'display_name' => 'Edit Cities', 'category' => 'cities'],
            ['name' => 'cities.delete', 'display_name' => 'Delete Cities', 'category' => 'cities'],

            // Venues
            ['name' => 'venues.view', 'display_name' => 'View Venues', 'category' => 'venues'],
            ['name' => 'venues.create', 'display_name' => 'Create Venues', 'category' => 'venues'],
            ['name' => 'venues.edit', 'display_name' => 'Edit Venues', 'category' => 'venues'],
            ['name' => 'venues.delete', 'display_name' => 'Delete Venues', 'category' => 'venues'],

            // Event Types
            ['name' => 'event_types.view', 'display_name' => 'View Event Types', 'category' => 'event_types'],
            ['name' => 'event_types.create', 'display_name' => 'Create Event Types', 'category' => 'event_types'],
            ['name' => 'event_types.edit', 'display_name' => 'Edit Event Types', 'category' => 'event_types'],
            ['name' => 'event_types.delete', 'display_name' => 'Delete Event Types', 'category' => 'event_types'],

            // Observers
            ['name' => 'observers.view', 'display_name' => 'View Observers', 'category' => 'observers'],
            ['name' => 'observers.create', 'display_name' => 'Create Observers', 'category' => 'observers'],
            ['name' => 'observers.edit', 'display_name' => 'Edit Observers', 'category' => 'observers'],
            ['name' => 'observers.delete', 'display_name' => 'Delete Observers', 'category' => 'observers'],

            // SNGs
            ['name' => 'sngs.view', 'display_name' => 'View SNGs', 'category' => 'sngs'],
            ['name' => 'sngs.create', 'display_name' => 'Create SNGs', 'category' => 'sngs'],
            ['name' => 'sngs.edit', 'display_name' => 'Edit SNGs', 'category' => 'sngs'],
            ['name' => 'sngs.delete', 'display_name' => 'Delete SNGs', 'category' => 'sngs'],

            // Dashboard
            ['name' => 'dashboard.view', 'display_name' => 'View Dashboard', 'category' => 'dashboard'],
            ['name' => 'dashboard.analytics', 'display_name' => 'View Analytics', 'category' => 'dashboard'],

            // Settings
            ['name' => 'settings.view', 'display_name' => 'View Settings', 'category' => 'settings'],
            ['name' => 'settings.edit', 'display_name' => 'Edit Settings', 'category' => 'settings'],

            // Reports
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'category' => 'reports'],
            ['name' => 'reports.export', 'display_name' => 'Export Reports', 'category' => 'reports'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
    }
}