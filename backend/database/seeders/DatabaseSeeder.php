<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            CitySeeder::class,
            EventTypeSeeder::class,
            ObserverSeeder::class,
            SngSeeder::class,
            // VenueSeeder::class, // سيتم إضافته لاحقاً
            // UserSeeder::class, // سيتم إضافته لاحقاً
        ]);
    }
}