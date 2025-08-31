<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@alamiya.sa',
            'password' => Hash::make('password123'),
            'phone' => '+966501234567',
            'department' => 'Administration',
            'status' => 'active',
            'role_id' => 1, // Assuming role ID 1 exists
        ]);

        // Create test user
        $testUser = User::create([
            'name' => 'Test User',
            'email' => 'test@alamiya.sa',
            'password' => Hash::make('password123'),
            'phone' => '+966501234568',
            'department' => 'IT',
            'status' => 'active',
            'role_id' => 1,
        ]);

        $this->command->info('Test users created successfully!');
        $this->command->info('Admin User: admin@alamiya.sa / password123');
        $this->command->info('Test User: test@alamiya.sa / password123');
    }
}

